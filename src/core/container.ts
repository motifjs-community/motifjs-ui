import type { IBaseProp } from '@motifx/core';
import { controlOf } from './control-map';
import { Control, type ControlProps } from './control';
import { deepActiveElement, isFocusable, nextTabbable, tabbableIn } from './focus';

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
  /** The element that had focus last inside this container. */
  private lastFocused: HTMLElement | null = null;

  constructor(element: TElement | string, props?: IBaseProp<TProps>);
  // Last, so JSX takes the props type from it.
  constructor(props?: IBaseProp<TProps>);
  constructor(...args: unknown[]) {
    // Forwarded as they came (see Control); typed as the props-only overload.
    super(...(args as [IBaseProp<TProps>?]));
    this.element.addEventListener('focusin', (e) => this.trackFocus(e.target as HTMLElement));
    this.element.addEventListener('keydown', (e) => this.onTabKey(e));
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
    if (control && this.element.contains(control.element)) control.focus();
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
    const last = this.lastFocused;
    if (last && this.element.contains(last) && isFocusable(last) && !last.closest('[aria-disabled="true"]')) {
      last.focus();
      if (deepActiveElement() === last) return true;
    }
    const active = this.activeControl;
    if (active && active !== this) {
      if (active instanceof FocusContainer ? active.restoreFocus() : active.focus()) return true;
    }
    const first = tabOrder(this.element)[0];
    first?.focus();
    return !!first;
  }

  private trackFocus(target: HTMLElement): void {
    // Focus inside a window opened within this container belongs to that window.
    const win = target.closest('dialog');
    if (win !== this.element.closest('dialog') && win !== (this.element as Element)) return;
    let leaf: Control | null = null;
    let nested: Control | null = null;
    for (let n: HTMLElement | null = target; n && n !== this.element; n = n.parentElement) {
      const c = controlOf(n);
      if (!c) continue;
      leaf ??= c;
      if (c instanceof FocusContainer) nested = c; // the outermost nested container wins
    }
    this.lastFocused = target;
    const active = nested ?? leaf;
    if (active !== this.activeControl) this.setProperty('activeControl', active);
  }

  /** The outermost container of its page or window runs Tab. */
  private get runsTab(): boolean {
    for (let p = this.parentControl; p; p = p.parentControl) if (p instanceof FocusContainer) return false;
    return true;
  }

  private onTabKey(e: KeyboardEvent): void {
    if (e.key !== 'Tab' || e.defaultPrevented || e.ctrlKey || e.altKey || e.metaKey || !this.runsTab) return;
    const custom = !!this.element.querySelector('[data-mx-tabindex]');
    const cycle = this.cyclesTab;
    if (!custom && !cycle) return;
    const current = deepActiveElement();
    const order = custom ? tabOrder(this.element) : tabbableIn(this.element);
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
      const outside = nextTabbable(this.element, this.element.closest('dialog') ?? this.element.ownerDocument.body, !back);
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
 * document order. One radio button per group, as browsers do.
 */
export function tabOrder(root: Element): HTMLElement[] {
  const ranked: Ranked[] = radioStops(tabbableIn(root)).map((el, index) => ({ el, index, path: pathOf(el, root) }));
  ranked.sort(compareRanked);
  return ranked.map((r) => r.el);
}

function pathOf(el: Element, root: Element): Ranked['path'] {
  const path: Ranked['path'] = [];
  for (let n: Element | null = el; n && n !== root; n = n.parentElement) {
    const control = controlOf(n);
    if (control) path.unshift({ control, key: control.tabIndex });
  }
  return path;
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
