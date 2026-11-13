import { Application, type ComponentBase, type IDisposable } from '@motifx/core';
import { isElement } from '../../core/node-kind';
import { pageWindow, windowOf } from '../../core/page-documents';

/**
 * Makes the components around `part` inert, up to and inside `scope`: those beside `part` and beside each component
 * above it, below `scope`. With no scope it is the page, where the app's own content and what stands above the page
 * are around it too. Elements that are not components stay as they are. Held, not written: each gets its own value
 * back with the undo returned.
 */
export function inertAround(part: ComponentBase, scope: ComponentBase | null): () => void {
  const holds: IDisposable[] = [];
  let node = part;
  while (node !== scope && node.parent) {
    for (const sibling of node.parent.controls.items) if (sibling !== node) holdInert(sibling, holds);
    node = node.parent;
  }
  // What each root holds is made inert, never the root: the app's may stand for the page's body, which holds the layer too.
  if (!scope) for (const root of pageRoots(part, node)) for (const child of root.controls.items) holdInert(child, holds);
  return () => {
    for (const hold of holds.splice(0).reverse()) hold.dispose();
  };
}

/** Holds `inert` on a component; a list or a branch has no element of its own, so what it holds stands in its place. */
function holdInert(part: ComponentBase, holds: IDisposable[]): void {
  if (isElement(part.element)) holds.push(part.attr.hold({ inert: '' }));
  else if (part.element?.nodeType !== Node.TEXT_NODE) for (const child of part.controls.items) holdInert(child, holds);
}

/**
 * The page's roots other than `root`, the one `part` is under: the app's own once it runs, and its layer above the
 * page from the moment it is built, when placeOnPage starts using it. A window the page opened has only its own root.
 */
function pageRoots(part: ComponentBase, root: ComponentBase): ComponentBase[] {
  if (windowOf(part) !== pageWindow()) return [];
  const app = Application.main as Application | null;
  const roots: ComponentBase[] = [];
  if (app?.state === 'running') roots.push(app.getAppShell(), app.layer);
  else if (app?.state === 'initializing') roots.push(app.layer);
  return roots.filter((each) => each !== root);
}
