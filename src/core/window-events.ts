import { ComponentBase } from '@motifx/core';
import { windowOf } from './page-documents';

/**
 * The window to listen on: a component's from the component tree (`windowOf`), a node's from its document; `null`
 * when there is none.
 */
function windowFrom(from: ComponentBase | Node | null): Window | null {
  if (!from) return null;
  if (from instanceof ComponentBase) return windowOf(from);
  const doc = from.nodeType === 9 ? (from as Document) : from.ownerDocument;
  return doc?.defaultView ?? null;
}

/**
 * Listens on the window a component or a node is in (a window the app opened has its own events). The window is no
 * component, so a drag followed past its part, a click outside or a key anywhere is listened to here, the one place the
 * kit does so.
 * Returns what stops listening; call it when the part is done with it.
 */
export function onWindow<K extends keyof WindowEventMap>(from: ComponentBase | Node | null, type: K, handler: (e: WindowEventMap[K]) => void, capture = false): () => void {
  const win = windowFrom(from) ?? window;
  const listener = handler as EventListener;
  win.addEventListener(type, listener, capture);
  return () => win.removeEventListener(type, listener, capture);
}

/**
 * Listens on the document a component or a node is in, as `onWindow` does on its window. `options`: `true` to listen
 * before the page (capture), or the options themselves (`{ passive: false }` for a touchmove that may keep the page
 * still). Returns what stops listening.
 */
export function onDocument<K extends keyof DocumentEventMap>(
  from: ComponentBase | Node | null,
  type: K,
  handler: (e: DocumentEventMap[K]) => void,
  options: boolean | AddEventListenerOptions = false,
): () => void {
  const doc = windowFrom(from)?.document ?? document;
  const listener = handler as EventListener;
  const capture = typeof options === 'boolean' ? options : !!options.capture;
  doc.addEventListener(type, listener, options);
  return () => doc.removeEventListener(type, listener, capture);
}
