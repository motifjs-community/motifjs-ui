import { eachDocument } from './page-documents';

// The look changes with the design language, the theme and the density, on the root or on any part
// of a page: sizes a control measured once (a row's height, the room in a bar) are stale then. One
// observer per document tells everyone who asked.

const listeners = new Set<() => void>();
let stop: (() => void) | null = null;
let queued = false;

const ATTRIBUTES = ['data-identity', 'data-theme', 'data-density'];

/** Calls `changed` (once per microtask) after a design language, theme or density changes anywhere. Returns the function that stops it. */
export function onLookChanged(changed: () => void): () => void {
  listeners.add(changed);
  if (!stop) {
    stop = eachDocument((doc) => {
      const Observer = doc.defaultView?.MutationObserver;
      if (typeof Observer !== 'function') return () => {};
      const observer = new Observer(tell);
      observer.observe(doc, { attributes: true, attributeFilter: ATTRIBUTES, subtree: true });
      return () => observer.disconnect();
    });
  }
  return () => {
    listeners.delete(changed);
    if (!listeners.size && stop) {
      stop();
      stop = null;
    }
  };
}

function tell(): void {
  if (queued) return;
  queued = true;
  queueMicrotask(() => {
    queued = false;
    for (const listener of [...listeners]) listener();
  });
}
