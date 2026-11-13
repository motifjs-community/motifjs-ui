import type { ComponentBase } from '@motifx/core';
import { elementOf, viewOf, whenWindowGoes } from './element-of';
import type { Size } from './size';
import type { SizeBox } from './size-box';
import type { View } from './view';

// One size observer per window and box, and one sight observer per window, each made from that window: a browser's
// observer reports only elements of its own window. The maps from elements to reports are their own bookkeeping, never
// a lookup. Their callbacks only hand on what they saw: the reports queue notices for the next frame.

const BOXES: Record<SizeBox, ResizeObserverBoxOptions> = { border: 'border-box', content: 'content-box', device: 'device-pixel-content-box' };
const sized = new WeakMap<View, Map<SizeBox, { observer: ResizeObserver; targets: Map<Element, { reports: Set<(size: Size) => void>; last: Size | null }> }>>();
const sighted = new WeakMap<View, { observer: IntersectionObserver; targets: Map<Element, { reports: Set<(seen: boolean) => void>; last: boolean | null }> }>();
let watching = false;

/**
 * Reports the size of `target` on every change the browser lays out, in the window it is in now; a target observed there
 * already gives its last size at once. Nothing where the window has no size observer (a test document). Returns what stops it.
 */
export function observe(target: ComponentBase, box: SizeBox, report: (size: Size) => void): () => void {
  const el = elementOf(target);
  const view = viewOf(target);
  if (!el || !view || typeof view.ResizeObserver !== 'function') return () => {};
  stopWithWindows();
  let byBox = sized.get(view);
  if (!byBox) sized.set(view, (byBox = new Map()));
  let entry = byBox.get(box);
  if (!entry) {
    const targets = new Map<Element, { reports: Set<(size: Size) => void>; last: Size | null }>();
    const observer = new view.ResizeObserver((entries) => {
      for (const each of entries) {
        const seen = targets.get(each.target);
        if (!seen) continue;
        const size = sizeFrom(each, box, view);
        seen.last = size;
        for (const told of [...seen.reports]) told(size);
      }
    });
    byBox.set(box, (entry = { observer, targets }));
  }
  const { observer, targets } = entry;
  let seen = targets.get(el);
  if (!seen) {
    targets.set(el, (seen = { reports: new Set(), last: null }));
    try {
      observer.observe(el, { box: BOXES[box] });
    } catch {
      // A browser that knows no such box.
      observer.observe(el);
    }
  } else if (seen.last) {
    // Observed already: its observer reports it no more until it changes.
    report(seen.last);
  }
  seen.reports.add(report);
  const known = seen;
  return () => {
    if (!known.reports.delete(report) || known.reports.size) return;
    targets.delete(el);
    observer.unobserve(el);
  };
}

/**
 * Reports whether `target` is in sight in the viewport of the window it is in now, at once and on every change. Where the
 * window has no sight observer (a test document), it is in sight. Returns what stops it.
 */
export function observeSight(target: ComponentBase, report: (seen: boolean) => void): () => void {
  const el = elementOf(target);
  const view = viewOf(target);
  if (!el || !view) return () => {};
  if (typeof view.IntersectionObserver !== 'function') {
    report(true);
    return () => {};
  }
  stopWithWindows();
  let entry = sighted.get(view);
  if (!entry) {
    const targets = new Map<Element, { reports: Set<(seen: boolean) => void>; last: boolean | null }>();
    const observer = new view.IntersectionObserver((entries) => {
      for (const each of entries) {
        const seen = targets.get(each.target);
        if (!seen) continue;
        seen.last = each.isIntersecting;
        for (const told of [...seen.reports]) told(each.isIntersecting);
      }
    });
    sighted.set(view, (entry = { observer, targets }));
  }
  const { observer, targets } = entry;
  let seen = targets.get(el);
  if (!seen) {
    targets.set(el, (seen = { reports: new Set(), last: null }));
    observer.observe(el);
  } else if (seen.last !== null) {
    report(seen.last);
  }
  seen.reports.add(report);
  const known = seen;
  return () => {
    if (!known.reports.delete(report) || known.reports.size) return;
    targets.delete(el);
    observer.unobserve(el);
  };
}

function sizeFrom(entry: ResizeObserverEntry, box: SizeBox, view: View): Size {
  const sizes = box === 'device' ? entry.devicePixelContentBoxSize : box === 'content' ? entry.contentBoxSize : entry.borderBoxSize;
  const first = sizes?.[0];
  // Inline and block as width and height: the kit lays out in horizontal writing modes.
  if (first) return { width: first.inlineSize, height: first.blockSize };
  const ratio = box === 'device' ? view.devicePixelRatio || 1 : 1;
  return { width: entry.contentRect.width * ratio, height: entry.contentRect.height * ratio };
}

function stopWithWindows(): void {
  if (watching) return;
  watching = true;
  whenWindowGoes((view) => {
    for (const { observer } of sized.get(view)?.values() ?? []) observer.disconnect();
    sized.delete(view);
    sighted.get(view)?.observer.disconnect();
    sighted.delete(view);
  });
}
