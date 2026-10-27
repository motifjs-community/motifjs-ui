/**
 * Makes everything around `el` inert, up to and inside `scope`: the siblings of `el` and of each of
 * its ancestors below `scope`. What was inert already stays as it was. Returns the undo.
 */
export function inertAround(el: Element, scope: Element): () => void {
  const changed: Element[] = [];
  for (let node: Element | null = el; node && node !== scope && node.parentElement; node = node.parentElement) {
    for (const sibling of Array.from(node.parentElement.children)) {
      if (sibling === node || sibling.hasAttribute('inert') || sibling.localName === 'script' || sibling.localName === 'style') continue;
      sibling.setAttribute('inert', '');
      changed.push(sibling);
    }
    if (node.parentElement === scope) break;
  }
  return () => {
    for (const sibling of changed) sibling.removeAttribute('inert');
  };
}
