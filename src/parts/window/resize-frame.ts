import type { WindowEdge } from './window-edge';

const EDGES: readonly WindowEdge[] = ['top', 'bottom', 'start', 'end', 'top-start', 'top-end', 'bottom-start', 'bottom-end'];

/** The frame of a window's resize handles: one handle per side and corner, each with its `data-edge`. */
export function resizeFrame(doc: Document, frameClass: string, handleClass: string): HTMLDivElement {
  const frame = doc.createElement('div');
  frame.className = frameClass;
  frame.setAttribute('aria-hidden', 'true');
  for (const edge of EDGES) {
    const handle = doc.createElement('div');
    handle.className = handleClass;
    handle.dataset.edge = edge;
    frame.append(handle);
  }
  return frame;
}
