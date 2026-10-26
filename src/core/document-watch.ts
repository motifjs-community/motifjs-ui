import { eachDocument } from './page-documents';

// Nodes moved between the page and a window the app opened: every move adds or takes nodes in a
// connected document, so one observer per connected document notices them all.

const listeners = new Set<() => void>();
let stop: (() => void) | null = null;

/**
 * Calls `moved` (after a microtask) whenever nodes are added to or taken from a connected
 * document: some may have moved between windows. Returns the function that stops it.
 */
export function onNodesMoved(moved: () => void): () => void {
  listeners.add(moved);
  if (!stop) {
    const own = typeof document === 'undefined' ? null : document;
    stop = eachDocument((doc) => {
      const Observer = doc.defaultView?.MutationObserver;
      if (doc === own || typeof Observer !== 'function') return () => {};
      const observer = new Observer(tell);
      observer.observe(doc, { childList: true, subtree: true });
      return () => {
        observer.disconnect();
        // Its window is closing: what is taken out of it now goes unseen by the observer.
        queueMicrotask(tell);
      };
    });
  }
  return () => {
    listeners.delete(moved);
    if (!listeners.size && stop) {
      stop();
      stop = null;
    }
  };
}

/**
 * Calls `changed` with the new document once `element` is in another one than before (moved into
 * a window the app opened, or back). Returns the function that stops watching.
 */
export function watchDocument(element: Element, changed: (doc: Document) => void): () => void {
  let doc = element.ownerDocument;
  return onNodesMoved(() => {
    if (element.ownerDocument === doc) return;
    doc = element.ownerDocument;
    changed(doc);
  });
}

function tell(): void {
  for (const moved of [...listeners]) moved();
}
