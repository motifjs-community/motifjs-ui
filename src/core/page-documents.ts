import { Application } from '@motifx/core';
// The documents the kit works in: the page's own, and each one connected (a window the app opened
// on the same origin, with some of the page's controls moved into it). What listens on a whole
// document (the keys, the tooltips, the focus guard) sets itself up in each of them through
// `eachDocument`, and leaves a connected one when it is disconnected or its window goes.

type Setup = (doc: Document) => () => void;

const connected = new Set<Document>();
const setups = new Map<Setup, Map<Document, () => void>>();
const unload = new Map<Document, () => void>();
/** While documents are connected: the one focus went to last. */
let lastFocused: Document | null = null;

function noteFocus(e: Event): void {
  lastFocused = e.currentTarget as Document;
}

/** The page's own document first, then the connected ones. */
export function pageDocuments(): Document[] {
  const own = typeof document === 'undefined' ? [] : [document];
  return [...own, ...connected];
}

/** The document of the page focus went to last, while others are connected; `null` when none are. */
export function lastFocusedDocument(): Document | null {
  return connected.size ? lastFocused : null;
}

/** Whether a document is the page's own or a connected one. */
export function isPageDocument(doc: Document): boolean {
  return (typeof document !== 'undefined' && doc === document) || connected.has(doc);
}

/**
 * Runs `setup` for every document of the page, now and as more are connected; the function it
 * returns undoes it when a document is disconnected. Returns the function that undoes it in all.
 */
export function eachDocument(setup: Setup): () => void {
  const done = new Map<Document, () => void>();
  setups.set(setup, done);
  for (const doc of pageDocuments()) done.set(doc, setup(doc));
  return () => {
    setups.delete(setup);
    for (const stop of done.values()) stop();
    done.clear();
  };
}

/**
 * Connects another document, from a window opened on the same origin, so the kit's keys, tooltips,
 * focus guard and similar features work there as they do in the page. It is disconnected when its
 * window closes or loads another page. Returns a function that disconnects it.
 */
export function connectDocument(doc: Document): () => void {
  if (isPageDocument(doc)) return () => {};
  if (!connected.size && typeof document !== 'undefined') document.addEventListener('focusin', noteFocus, true);
  connected.add(doc);
  doc.addEventListener('focusin', noteFocus, true);
  for (const [setup, done] of setups) done.set(doc, setup(doc));
  // Core's own: router links, swipes and mounting in that document.
  const core = Application.main?.connectDocument(doc) ?? (() => {});
  const view = doc.defaultView;
  const gone = () => disconnectDocument(doc);
  view?.addEventListener('pagehide', gone);
  unload.set(doc, () => {
    view?.removeEventListener('pagehide', gone);
    core();
  });
  return () => disconnectDocument(doc);
}

/** Undoes `connectDocument`. */
export function disconnectDocument(doc: Document): void {
  if (!connected.delete(doc)) return;
  doc.removeEventListener('focusin', noteFocus, true);
  if (lastFocused === doc) lastFocused = null;
  if (!connected.size && typeof document !== 'undefined') document.removeEventListener('focusin', noteFocus, true);
  unload.get(doc)?.();
  unload.delete(doc);
  for (const done of setups.values()) {
    done.get(doc)?.();
    done.delete(doc);
  }
}
