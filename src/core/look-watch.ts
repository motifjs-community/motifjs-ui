import { eachDocument } from './page-documents';

// The look changes with the design language, the theme and the density, on the root or on any part
// of a page, and when fonts finish loading: sizes a control measured once (a row's height, the room
// in a bar, a text's width) are stale then. One observer per document tells everyone who asked.

const listeners = new Set<() => void>();
let stop: (() => void) | null = null;
let queued = false;

const ATTRIBUTES = ['data-design-language', 'data-theme', 'data-density'];

/**
 * Calls `changed` (once per microtask) after a design language, theme or density changes anywhere, or fonts of a
 * document of the page finish loading. Returns the function that stops it.
 */
export function onLookChanged(changed: () => void): () => void {
  listeners.add(changed);
  if (!stop) {
    stop = eachDocument((doc) => {
      const Observer = doc.defaultView?.MutationObserver;
      const observer = typeof Observer === 'function' ? new Observer(tell) : null;
      observer?.observe(doc, { attributes: true, attributeFilter: ATTRIBUTES, subtree: true });
      const stopFonts = onFontsLoaded(doc);
      return () => {
        observer?.disconnect();
        stopFonts();
      };
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

/** Tells when fonts of `doc` finish loading: text measured before then may come out another size. Where the browser has no font loading API, nothing. */
function onFontsLoaded(doc: Document): () => void {
  const fonts = (doc as { fonts?: FontFaceSet }).fonts;
  if (!fonts || typeof fonts.addEventListener !== 'function') return () => {};
  fonts.addEventListener('loadingdone', tell);
  return () => fonts.removeEventListener('loadingdone', tell);
}

function tell(): void {
  if (queued) return;
  queued = true;
  queueMicrotask(() => {
    queued = false;
    for (const listener of [...listeners]) listener();
  });
}
