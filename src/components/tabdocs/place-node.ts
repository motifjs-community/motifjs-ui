/**
 * Puts `node` into `parent` before `before`. A node already on the page is moved with
 * `moveBefore` where the browser has it, so what is inside keeps its state (scroll, focus, frames).
 */
export function placeNode(parent: Element, node: Element, before: Node | null): void {
  if (before === node || (node.parentNode === parent && node.nextSibling === before)) return;
  const move = (parent as Element & { moveBefore?: (node: Node, child: Node | null) => void }).moveBefore;
  if (move && node.isConnected && parent.isConnected && node.ownerDocument === parent.ownerDocument) {
    try {
      move.call(parent, node, before);
      return;
    } catch {
      // Not movable here (another root, say): insert it as usual.
    }
  }
  parent.insertBefore(node, before);
}
