/**
 * Runs `move`, which takes `root` out of the page and puts it in again, and gives every scrolled
 * element under it its scroll back: a browser forgets the scroll of a node moved that way. Core's
 * `Transporter` moves with `appendChild` (CORE-REPORTS R29); browsers without `moveBefore` too.
 */
export function keepScroll<T>(root: Element, move: () => T): T {
  const scrolled: [Element, number, number][] = [];
  const walk = (el: Element) => {
    if (el.scrollTop || el.scrollLeft) scrolled.push([el, el.scrollTop, el.scrollLeft]);
    for (const child of el.children) walk(child);
  };
  if (root.isConnected) walk(root);
  const result = move();
  for (const [el, top, left] of scrolled) {
    if (el.scrollTop !== top) el.scrollTop = top;
    if (el.scrollLeft !== left) el.scrollLeft = left;
  }
  return result;
}
