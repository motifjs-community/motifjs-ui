import type { ComponentBase } from '@motifx/core';
import { isElement } from '../node-kind';
import { onDocument } from '../window-events';
import { afterFrame } from './after-frame';
import { elementOf } from './element-of';
import { pendingScroll } from './pending-scrolls';
import type { View } from './view';

// How far elements are scrolled, as the page last told it: their scroll events (one listener per window), and what the
// layer itself read or wrote. Noting a place before a move then reads nothing, so it lays nothing out: a move made where
// the page has changed (a drop) costs no layout for it. An element never scrolled is at its start. A scroll event comes
// at the start of a frame, maybe on a page written since the last one: the element is read once the frame is drawn, and
// at once only when its place is asked before that.

const known = new WeakMap<Element, { start: number; top: number }>();
const heard = new WeakSet<View>();
/** Elements scrolled and not read yet, and the ones of each window that wait for its next frame. */
const unread = new WeakSet<Element>();
const waiting = new WeakMap<View, Set<Element>>();
const AT_START = { start: 0, top: 0 };

/** Notes from now on how far the elements of `view` are scrolled. */
export function rememberScrolls(view: View): void {
  if (heard.has(view)) return;
  heard.add(view);
  onDocument(
    view.document,
    'scroll',
    (e) => {
      const el = e.target;
      // The page's own scroll comes from the document: no component is the document.
      if (!isElement(el)) return;
      unread.add(el);
      let scrolled = waiting.get(view);
      if (scrolled) {
        scrolled.add(el);
        return;
      }
      scrolled = new Set([el]);
      waiting.set(view, scrolled);
      afterFrame(view, () => {
        waiting.delete(view);
        for (const one of scrolled) if (unread.has(one)) readScroll(one);
      });
    },
    { capture: true, passive: true },
  );
}

/** Notes how far `el` is scrolled, as the layer read it or wrote it. */
export function noteScroll(el: Element, place: { start?: number; top?: number }, by = false): void {
  // A whole place written or read needs nothing read before it.
  const whole = !by && place.start !== undefined && place.top !== undefined;
  if (whole) unread.delete(el);
  const was = whole ? AT_START : scrollOf(el);
  const start = place.start === undefined ? was.start : Math.max(0, (by ? was.start : 0) + place.start);
  const top = place.top === undefined ? was.top : Math.max(0, (by ? was.top : 0) + place.top);
  known.set(el, { start, top });
}

/** How far `component` is scrolled as last told, counting a scroll written and not made yet; nothing is read. */
export function knownScrollOf(component: ComponentBase): { start: number; top: number } {
  const el = elementOf(component);
  if (!el) return AT_START;
  const seen = scrollOf(el);
  const pending = pendingScroll(component);
  if (!pending) return seen;
  return { start: Math.max(0, (pending.start ?? seen.start) + pending.byStart), top: Math.max(0, (pending.top ?? seen.top) + pending.byTop) };
}

/** How far `el` is scrolled as told; one scrolled and not read yet is read now. */
function scrollOf(el: Element): { start: number; top: number } {
  if (unread.has(el)) readScroll(el);
  return known.get(el) ?? AT_START;
}

function readScroll(el: Element): void {
  unread.delete(el);
  // One taken out of the page in between keeps its last place: it reads nothing true now.
  if (el.isConnected) known.set(el, { start: Math.abs(el.scrollLeft), top: el.scrollTop });
}
