import { untracked, type ComponentBase, type IBaseProp } from '@motifx/core';
import { isWithin } from './component-tree';
import { Control, type ControlProps } from './control';
import { controlFor, deepActiveElement, markOf, nextTabbable, tabbableIn, windowElementOf } from './focus';
import type { FocusMark } from './focus-mark';
import { controlsWithTabIndex } from './live-controls';
import { isElement, isHtmlElement } from './node-kind';

// Part of the focus layer: Tab order and the active control of a container work on elements here, found and ranked
// through the component tree.

/**
 * A control that remembers which control inside it is active and acts as a scope
 * for Tab, such as a form, a split pane, a tab page or a document window.
 *
 * - `activeControl` follows focus inside it (a nested container counts as one
 *   control and keeps its own `activeControl`). Assigning it moves focus to that control.
 * - `restoreFocus()` returns focus to where it was the last time the container
 *   was active, such as when a form switches windows or a tab page returns.
 * - The outermost container of a page or window manages Tab order: controls with
 *   a `tabIndex` are visited in ascending order, and ties follow document order. Until a
 *   control inside sets a `tabIndex`, Tab is left to the browser. A container
 *   that is a modal window (`cyclesTab`) keeps Tab inside itself.
 *
 * Cost: two listeners per container (focusin, keydown) and none per control
 * inside. Tab order is calculated only when a Tab press needs it.
 */
export class FocusContainer<TElement extends HTMLElement = HTMLElement, TProps extends ControlProps = ControlProps> extends Control<
  TElement,
  TProps
> {
  /** Where focus was last inside this container, and the control that held it then. */
  private lastFocus: { mark: FocusMark; control: Control | null } | null = null;

  constructor(element: TElement | string, props?: IBaseProp<TProps>);
  // Last, so JSX takes the props type from it.
  constructor(props?: IBaseProp<TProps>);
  constructor(...args: unknown[]) {
    // Forwarded as they came (see Control); typed as the props-only overload.
    super(...(args as [IBaseProp<TProps>?]));
    this.motif.on('focusin', (_, e) => this.trackFocus(e));
    this.motif.on('keydown', (_, e) => this.onTabKey(e));
  }

  /**
   * The control inside that has focus, or last had it. It works like
   * `document.activeElement` does for the page. Reactive. Setting it moves focus
   * to that control.
   */
  get activeControl(): Control | null {
    return this.getProperty<Control | null>('activeControl') ?? null;
  }

  set activeControl(control: Control | null) {
    if (control && isWithin(control, this)) control.focus();
  }

  /**
   * Whether Tab wraps around inside this container instead of leaving it.
   * `false` here; a modal window returns `true`.
   */
  protected get cyclesTab(): boolean {
    return false;
  }

  /**
   * Returns focus to where it was last inside the container. If that is not possible, it moves
   * to the active control, and then to the first control in Tab order. Returns `false` if
   * nothing inside can receive focus.
   */
  restoreFocus(): boolean {
    const last = this.lastFocus;
    // The control that held it may be disabled since: focus does not go back into it.
    if (last && last.mark.isIn(this) && untracked(() => (last.control ?? this).isEnabled) && last.mark.restore()) return true;
    const active = this.activeControl;
    if (active && active !== this) {
      if (active instanceof FocusContainer ? active.restoreFocus() : active.focus()) return true;
    }
    const first = tabOrder(this)[0];
    first?.focus();
    return !!first;
  }

  /** Follows focus down the component tree: the outermost nested container inside, else the innermost control, is active. */
  private trackFocus(e: FocusEvent): void {
    const target = e.target;
    if (!isHtmlElement(target)) return;
    let leaf: Control | null = null;
    let nested: Control | null = null;
    for (let at: ComponentBase | undefined = this; at; ) {
      const child: ComponentBase | undefined = at.controls.items.find((c) => c.motif.isEventFrom(e));
      const control = child ? controlFor(child) : null;
      if (control) {
        // Focus inside a window opened within this container belongs to that window.
        if (control.isWindow) return;
        leaf = control;
        if (!nested && control instanceof FocusContainer) nested = control;
      }
      at = child;
    }
    this.lastFocus = { mark: markOf(target), control: leaf };
    const active = nested ?? leaf;
    if (active !== this.activeControl) this.setProperty('activeControl', active);
  }

  /** The outermost container of its page or window runs Tab. */
  private get runsTab(): boolean {
    for (let p = this.parentControl; p; p = p.parentControl) if (p instanceof FocusContainer) return false;
    return true;
  }

  /** Whether a control inside (not inside a window of its own) has a `tabIndex` other than 0: only then Tab needs help. */
  private get hasTabIndexes(): boolean {
    for (const control of controlsWithTabIndex()) {
      if (control === this) continue;
      for (let p = control.parentControl; p; p = p.parentControl) if (p === this) return true;
    }
    return false;
  }

  private onTabKey(e: KeyboardEvent): void {
    if (e.key !== 'Tab' || e.defaultPrevented || e.ctrlKey || e.altKey || e.metaKey || !this.runsTab) return;
    const custom = this.hasTabIndexes;
    const cycle = this.cyclesTab;
    if (!custom && !cycle) return;
    const root = this.element as Element;
    const current = deepActiveElement();
    const order = custom ? tabOrder(this) : tabbableIn(root);
    if (!order.length) return;
    const back = e.shiftKey;
    let index = current ? order.findIndex((el) => el === current || el.contains(current)) : -1;
    if (index < 0 && current) {
      // Focus is on something Tab does not visit (tabindex="-1"): continue from its place.
      const after = order.findIndex((el) => !!(current.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING));
      index = after < 0 ? order.length : after;
      if (!back) index--;
    }
    const nextIndex = back ? index - 1 : index + 1;
    let target: HTMLElement | undefined = order[nextIndex];
    if (!target && cycle) {
      target = back ? order[order.length - 1] : order[0];
    } else if (!target) {
      // Leaving the container: from the container as a whole, not from the
      // focused element (which may sit anywhere inside in DOM terms).
      const outside = nextTabbable(root, windowElementOf(this, true) ?? root.ownerDocument.body, !back);
      if (!outside) return;
      target = outside;
    } else if (!custom) {
      return; // DOM order and not at an edge: the browser does the same
    }
    e.preventDefault();
    target.focus();
  }
}

interface Ranked {
  el: HTMLElement;
  index: number;
  /** The Controls from the container down to the element, with their tabIndex. */
  path: { control: Control; key: number }[];
}

/**
 * The elements Tab visits in `root`: at each level of the control tree,
 * siblings by ascending `tabIndex`, ties (and plain elements, index 0) in
 * document order. One radio button per group, as browsers do. Focus layer only.
 */
export function tabOrder(root: ComponentBase): HTMLElement[] {
  const el: unknown = root.element;
  if (!isElement(el)) return [];
  const ranked: Ranked[] = radioStops(tabbableIn(el)).map((stop, index) => ({ el: stop, index, path: [] }));
  rank(root, ranked, null);
  ranked.sort(compareRanked);
  return ranked.map((r) => r.el);
}

/**
 * Walks the component tree down from `component` and adds each Control met (a part standing for one counts as that
 * control) to the path of the elements inside it. `inside` holds the elements under `component`, in document order.
 */
function rank(component: ComponentBase, inside: Ranked[], current: Control | null): void {
  for (const child of component.controls.items) {
    const el: unknown = child.element;
    // A component without an element of its own (a fragment) hands its elements on to its children.
    const held = isElement(el) ? heldBy(el, inside) : inside;
    if (!held.length) continue;
    const control = controlFor(child);
    if (control && control !== current) {
      const key = untracked(() => control.tabIndex);
      for (const r of held) r.path.push({ control, key });
    }
    rank(child, held, control ?? current);
  }
}

/** The run of `sorted` (in document order) that lies in `el`, found by halving. */
function heldBy(el: Element, sorted: Ranked[]): Ranked[] {
  let low = 0;
  let high = sorted.length;
  while (low < high) {
    const middle = (low + high) >> 1;
    if (el.compareDocumentPosition(sorted[middle].el) & Node.DOCUMENT_POSITION_PRECEDING) low = middle + 1;
    else high = middle;
  }
  let end = low;
  while (end < sorted.length && el.contains(sorted[end].el)) end++;
  return sorted.slice(low, end);
}

function compareRanked(a: Ranked, b: Ranked): number {
  for (let d = 0; ; d++) {
    const ca = a.path[d];
    const cb = b.path[d];
    if (ca && cb && ca.control === cb.control) continue;
    return (ca?.key ?? 0) - (cb?.key ?? 0) || a.index - b.index;
  }
}

/** Keeps the checked radio of each group, or the first one when none is checked. */
function radioStops(elements: HTMLElement[]): HTMLElement[] {
  // A group is a name within one form (or outside any form).
  const groups = new Map<HTMLFormElement | null, Map<string, HTMLInputElement[]>>();
  for (const el of elements) {
    if (isRadio(el)) {
      const byName = groups.get(el.form) ?? new Map<string, HTMLInputElement[]>();
      groups.set(el.form, byName);
      byName.set(el.name, [...(byName.get(el.name) ?? []), el]);
    }
  }
  if (!groups.size) return elements;
  const keep = new Set<HTMLElement>();
  for (const byName of groups.values()) for (const radios of byName.values()) keep.add(radios.find((r) => r.checked) ?? radios[0]);
  return elements.filter((el) => !isRadio(el) || keep.has(el));
}

/** A named radio button (of any window: an element moved into another one is not its `HTMLInputElement`). */
function isRadio(el: HTMLElement): el is HTMLInputElement {
  return el.localName === 'input' && (el as HTMLInputElement).type === 'radio' && !!(el as HTMLInputElement).name;
}
