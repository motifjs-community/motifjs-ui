import { deepActiveElement, nextTabbable } from './focus';

// `enabled = false` on a container disables everything inside it, controls
// and plain elements alike (as a disabled <fieldset> does for form fields),
// and re-enabling restores each element to what it was. A DOM concern: every disabled root marks the
// disableable elements under it, and an element stays disabled while at least
// one root covers it. One MutationObserver serves all disabled roots and only
// exists while something is disabled, so enabled UI pays nothing.

/** Elements with a native `disabled`: the browser blocks them and exposes the state. */
const NATIVE = 'button, input, select, textarea, fieldset, optgroup, option';
/** Other focusable elements: taken out of the tab order and marked `aria-disabled`. */
const FOCUSABLE = 'a[href], area[href], [tabindex], [contenteditable]:not([contenteditable="false"]), summary, iframe';
const DISABLEABLE = `${NATIVE}, ${FOCUSABLE}`;
/** Elements that keep focus while disabled (a control asked for it): only `aria-disabled`, so they stay in the tab order. */
const KEEPS_FOCUS = '[data-mx-focusable-disabled]';
/** Pointer input swallowed inside a disabled root, before any handler sees it. */
const BLOCKED_EVENTS = ['pointerdown', 'mousedown', 'click', 'dblclick', 'auxclick', 'contextmenu'];

interface Mark {
  /** The disabled roots covering this element. */
  roots: Set<Element>;
  native: boolean;
  keepsFocus: boolean;
  /** What to restore: the element's own `disabled`, or its `tabindex` / `aria-disabled`. */
  disabled: boolean;
  tabindex: string | null;
  ariaDisabled: string | null;
}

const marks = new WeakMap<Element, Mark>();
const roots = new Set<HTMLElement>();
let observer: MutationObserver | null = null;

/** A <dialog> inside a disabled area is a window of its own (owned forms stay usable). */
function inWindowBelow(el: Element, root: Element): boolean {
  const dialog = el.closest('dialog');
  return !!dialog && dialog !== root && root.contains(dialog);
}

function cover(el: Element, root: Element): void {
  let m = marks.get(el);
  if (m?.roots.has(root)) return;
  if (!m) {
    const keepsFocus = el.matches(KEEPS_FOCUS);
    const native = el.matches(NATIVE) && !keepsFocus;
    m = {
      roots: new Set(),
      native,
      keepsFocus,
      disabled: el.hasAttribute('disabled'),
      tabindex: el.getAttribute('tabindex'),
      ariaDisabled: el.getAttribute('aria-disabled'),
    };
    marks.set(el, m);
    if (native) el.setAttribute('disabled', '');
    else {
      if (!keepsFocus) el.setAttribute('tabindex', '-1');
      el.setAttribute('aria-disabled', 'true');
    }
  }
  m.roots.add(root);
}

function uncover(el: Element, root: Element): void {
  const m = marks.get(el);
  if (!m?.roots.delete(root) || m.roots.size) return;
  marks.delete(el);
  if (m.native) el.toggleAttribute('disabled', m.disabled);
  else {
    restore(el, 'tabindex', m.tabindex);
    restore(el, 'aria-disabled', m.ariaDisabled);
  }
}

function restore(el: Element, name: string, value: string | null): void {
  if (value === null) el.removeAttribute(name);
  else el.setAttribute(name, value);
}

/** The disableable elements of `node`'s subtree, `node` included. */
function disableables(node: Node): Element[] {
  if (!(node instanceof Element)) return [];
  const found = Array.from(node.querySelectorAll(DISABLEABLE));
  if (node.matches(DISABLEABLE)) found.unshift(node);
  return found;
}

/** Brings the marks of `el` in line with the roots that now contain it. */
function reconcile(el: Element): void {
  const m = marks.get(el);
  if (m) for (const root of m.roots) if (!root.contains(el) || inWindowBelow(el, root)) uncover(el, root);
  for (const root of roots) if (root.contains(el) && !inWindowBelow(el, root)) cover(el, root);
}

function onMutations(records: MutationRecord[]): void {
  for (const r of records) {
    if (r.type === 'childList') {
      for (const n of r.removedNodes) for (const el of disableables(n)) reconcile(el);
      for (const n of r.addedNodes) for (const el of disableables(n)) reconcile(el);
      continue;
    }
    // The app changed `disabled` / `tabindex` on a covered element: that is
    // the value to restore later; the element itself stays disabled.
    const el = r.target as Element;
    const m = marks.get(el);
    if (!m) continue;
    if (r.attributeName === 'disabled' && m.native) {
      m.disabled = el.hasAttribute('disabled');
      el.setAttribute('disabled', '');
    } else if (r.attributeName === 'tabindex' && !m.native && !m.keepsFocus) {
      m.tabindex = el.getAttribute('tabindex');
      el.setAttribute('tabindex', '-1');
    }
  }
  // Our own writes above would come back as records; they are not app changes.
  observer?.takeRecords();
}

function observeAll(): void {
  observer?.disconnect();
  observer = roots.size ? (observer ?? new MutationObserver(onMutations)) : null;
  for (const root of roots) {
    observer!.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['disabled', 'tabindex'] });
  }
}

function block(e: Event): void {
  const root = e.currentTarget as Element;
  if (inWindowBelow(e.target as Element, root)) return;
  e.preventDefault();
  e.stopImmediatePropagation();
}

/**
 * Disables `root` and everything inside it except windows (<dialog>) opened
 * within it: native controls get `disabled`, other focusable elements leave
 * the tab order with `aria-disabled`, and pointer input is swallowed. Content
 * added later is disabled too. If focus was inside, it moves to the next
 * usable element instead of falling to <body>. Returns the function that
 * undoes exactly this call; other disabled roots still covering an element
 * keep it disabled.
 */
export function disableSubtree(root: HTMLElement): () => void {
  if (roots.has(root)) return () => {};
  if (observer) onMutations(observer.takeRecords());
  // Focus on a part that keeps it stays there.
  const rescue = deepActiveElement()?.matches(KEEPS_FOCUS) ? null : rescueTarget(root);
  roots.add(root);
  for (const el of disableables(root)) if (!inWindowBelow(el, root)) cover(el, root);
  for (const type of BLOCKED_EVENTS) root.addEventListener(type, block, true);
  observeAll();
  rescue?.focus();

  let released = false;
  return () => {
    if (released) return;
    released = true;
    if (observer) onMutations(observer.takeRecords());
    roots.delete(root);
    for (const type of BLOCKED_EVENTS) root.removeEventListener(type, block, true);
    for (const el of disableables(root)) uncover(el, root);
    observeAll();
  };
}

/**
 * Where focus goes when `area` stops being usable while it holds focus: the
 * next tabbable element after it in the same window (or page), else the one
 * before it. `null` when focus is not inside `area` or nothing else is usable.
 */
export function rescueTarget(area: Element): HTMLElement | null {
  const active = deepActiveElement();
  if (!active || !area.contains(active)) return null;
  const scope = area.parentElement?.closest<HTMLElement>('dialog') ?? document.body;
  return nextTabbable(area, scope) ?? nextTabbable(area, scope, false);
}
