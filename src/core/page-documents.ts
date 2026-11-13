import { Application, untracked, type ComponentBase } from '@motifx/core';
import { onDocument, onWindow } from './window-events';
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
/** Stops noting focus in the page's own document, listened to while others are connected. */
let stopPageFocus: (() => void) | null = null;
/** The components that hold what the kit placed in a window the page opened, with that window. */
const windowRoots = new Map<ComponentBase, Window>();

function noteFocus(e: Event): void {
  lastFocused = e.currentTarget as Document;
}

/** The page's own document first, then the connected ones. */
export function pageDocuments(): Document[] {
  const own = typeof document === 'undefined' ? [] : [document];
  return [...own, ...connected];
}

/** The page's own browser window; `null` outside a browser. */
export function pageWindow(): Window | null {
  return typeof window === 'undefined' ? null : window;
}

/**
 * The browser window `part` is in, found from the component tree: the window whose root it stands under, one of the
 * app's (`app.windows`) or one the kit noted (`noteWindowRoot`), else the page's own.
 */
export function windowOf(part: ComponentBase): Window | null {
  let root = part;
  for (let c: ComponentBase | null = part; c; c = c.parent) {
    const noted = windowRoots.get(c);
    if (noted) return noted;
    root = c;
  }
  const app = Application.main as Application | undefined;
  if (app) for (const w of untracked(() => app.windows.list)) if (w.host === root) return w.window;
  return pageWindow();
}

/**
 * @internal Notes that `root` holds what the kit placed in `view`, a window the page opened, so `windowOf` finds that
 * window for everything under it. Returns what forgets it.
 */
export function noteWindowRoot(root: ComponentBase, view: Window): () => void {
  windowRoots.set(root, view);
  return () => {
    if (windowRoots.get(root) === view) windowRoots.delete(root);
  };
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
  if (!connected.size && typeof document !== 'undefined') stopPageFocus = onDocument(document, 'focusin', noteFocus, true);
  connected.add(doc);
  const stopFocus = onDocument(doc, 'focusin', noteFocus, true);
  for (const [setup, done] of setups) done.set(doc, setup(doc));
  // Core's own: router links, swipes and mounting in that document.
  const core = Application.main?.connectDocument(doc) ?? (() => {});
  const stopGone = doc.defaultView ? onWindow(doc, 'pagehide', () => disconnectDocument(doc)) : () => {};
  unload.set(doc, () => {
    stopFocus();
    stopGone();
    core();
  });
  return () => disconnectDocument(doc);
}

/** Undoes `connectDocument`. */
export function disconnectDocument(doc: Document): void {
  if (!connected.delete(doc)) return;
  if (lastFocused === doc) lastFocused = null;
  if (!connected.size) {
    stopPageFocus?.();
    stopPageFocus = null;
  }
  unload.get(doc)?.();
  unload.delete(doc);
  for (const done of setups.values()) {
    done.get(doc)?.();
    done.delete(doc);
  }
}
