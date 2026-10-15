import type { Control } from './control';

// Element → Control, so DOM-level infrastructure (focus guard, Tab order,
// access keys) can find the control behind an element without a registry the
// controls would have to leave on dispose. A WeakMap entry is all it costs.
const map = new WeakMap<Element, Control>();

/** @internal Called by every Control for its root element. */
export function registerControl(element: Element, control: Control): void {
  map.set(element, control);
}

/** The Control whose root element is `el`, if any. */
export function controlOf(el: Element): Control | undefined {
  return map.get(el);
}

/** The nearest Control at or above `el`, not looking at `boundary` or above it. */
export function closestControl(el: Element | null, boundary?: Element | null): Control | undefined {
  for (let n = el; n && n !== boundary; n = n.parentElement) {
    const c = map.get(n);
    if (c) return c;
  }
  return undefined;
}
