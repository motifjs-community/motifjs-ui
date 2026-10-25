/**
 * Puts the children of `parent` in the `desired` order, moving as few as possible and never the one
 * that holds keyboard focus: moving a focused element in the DOM blurs it. Children not listed keep
 * their place after the listed ones.
 */
export function placeInOrder(parent: Element, desired: readonly Element[]) {
  const focused = typeof document === 'undefined' ? null : document.activeElement;
  const kids = parent.children;
  for (let k = 0; k < desired.length; k++) {
    const want = desired[k];
    if (kids[k] === want) continue;
    if (focused && want.contains(focused)) {
      // Move what stands before it to just after it instead.
      while (kids[k] !== want) parent.insertBefore(kids[k], want.nextSibling);
      continue;
    }
    parent.insertBefore(want, kids[k] ?? null);
  }
}
