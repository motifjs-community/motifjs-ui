import { ComponentBase } from '@motifx/core';

/** Where core puts a child's element: its parent's element, or for a fragment parent, the element the fragment stands in. */
function hostOf(parent: ComponentBase): Node | null {
  for (let p: ComponentBase | undefined = parent; p; p = p.parent ?? undefined) {
    const node = p.element as Node | null;
    if (!node) return null;
    if (node.nodeType !== Node.COMMENT_NODE) return node;
    if (node.parentNode) return node.parentNode;
  }
  return null;
}

function nameOf(node: Node | null | undefined): string {
  if (!node) return 'nothing';
  if (node.nodeType === Node.COMMENT_NODE) return `<!--${(node as Comment).data}-->`;
  const el = node as Element;
  const cls = typeof el.className === 'string' && el.className ? `.${el.className.trim().split(/\s+/).join('.')}` : '';
  return `${el.tagName?.toLowerCase() ?? node.nodeName}${cls}`;
}

function componentName(c: ComponentBase): string {
  return `${c.constructor.name}(${nameOf(c.element as Node)})`;
}

/** Records every component built while it is on, to find the ones placed in the page outside the tree. */
export function recordBuilt(): { built: Set<ComponentBase>; stop(): void } {
  const built = new Set<ComponentBase>();
  const proto = ComponentBase.prototype as unknown as { build: (...args: unknown[]) => unknown };
  const original = proto.build;
  proto.build = function (this: ComponentBase, ...args: unknown[]) {
    built.add(this);
    return original.apply(this, args);
  };
  return { built, stop: () => (proto.build = original) };
}

/**
 * What is out of place under `root`: a component whose element (or, while hidden, its placeholder) is not in the element
 * its parent puts it in, and a built component that stands in the page but is in no parent's `controls`.
 */
export function treeProblems(root: ComponentBase, built: Iterable<ComponentBase> = []): string[] {
  const problems: string[] = [];
  const inTree = new Set<ComponentBase>();
  const all = [...built];
  const walk = (parent: ComponentBase) => {
    inTree.add(parent);
    for (const child of parent.controls.items) {
      if (child.isDisposed) continue;
      const host = hostOf(parent);
      const node = child.element as Node | null;
      const trace = (child.motif?.options as { placeholder?: Node } | undefined)?.placeholder;
      const placed = node?.parentNode ? node : trace?.parentNode ? trace : null;
      if (placed && placed.parentNode !== host) {
        problems.push(`${componentName(child)} is in ${nameOf(placed.parentNode)}; its parent ${componentName(parent)} puts it in ${nameOf(host)}`);
      }
      walk(child);
    }
  };
  // The roots: the one given and the top of its tree.
  let top = root;
  while (top.parent) top = top.parent;
  for (const r of new Set([root, top])) if (!inTree.has(r)) walk(r);
  const area = root.element as Node;
  for (const c of all) {
    if (inTree.has(c) || c.isDisposed) continue;
    const node = c.element as Node | null;
    if (node?.isConnected && (area === node || area.contains(node) || node.ownerDocument?.body.contains(node))) {
      problems.push(`${componentName(c)} is in ${nameOf(node.parentNode)} but in no parent's controls`);
    }
  }
  return problems;
}
