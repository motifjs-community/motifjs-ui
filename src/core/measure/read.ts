import type { ComponentBase } from '@motifx/core';
import type { Box } from './box';
import { elementOf, isFragment, isText, viewOf } from './element-of';
import type { Page } from './page';
import { pendingScroll } from './pending-scrolls';
import type { Rect } from './rect';
import { roundReads } from './round-reads';
import { isReading, noteRead, runNumber } from './rounds';
import type { Size } from './size';
import type { SizeBox } from './size-box';

const NO_RECT: Rect = Object.freeze({ left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 });
const NO_BOX: Box = Object.freeze({ ...NO_RECT, offsetWidth: 0, offsetHeight: 0, clientLeft: 0, clientTop: 0, clientWidth: 0, clientHeight: 0, scrollWidth: 0, scrollHeight: 0, scrollStart: 0, scrollTop: 0, rtl: false });
const NO_PAGE: Page = Object.freeze({ width: 0, height: 0, scrollWidth: 0, scrollHeight: 0, scrollStart: 0, scrollTop: 0, rtl: false });
const NO_SIZE: Size = Object.freeze({ width: 0, height: 0 });

/** The direction each component was read with, and in which run: a write later in that run reads none again. */
const directions = new WeakMap<ComponentBase, { rtl: boolean; run: number }>();

/**
 * `component`'s box now: for a fragment (a list, a branch, a function component), the box around what it lays out, which
 * scrolls nothing; empty for what is not laid out. In a read phase each component is read once, whoever asks; outside
 * one it is read fresh, so read first and write after.
 */
export function boxOf(component: ComponentBase): Box {
  const reading = isReading();
  const known = reading ? roundReads.boxes.get(component) : undefined;
  if (known) return known;
  const el = elementOf(component);
  const box = el ? readBox(component, el) : isFragment(component) ? fragmentBox(component) : NO_BOX;
  if (reading) {
    roundReads.boxes.set(component, box);
    roundReads.rects.set(component, box);
  }
  return box;
}

/** Only where `component` is on the screen (a fragment: around what it lays out): one read, for hit tests and pointer math. */
export function rectOf(component: ComponentBase): Rect {
  const reading = isReading();
  const known = reading ? roundReads.rects.get(component) : undefined;
  if (known) return known;
  const el = elementOf(component);
  let rect = NO_RECT;
  if (el) {
    noteRead();
    rect = copy(el.getBoundingClientRect());
  } else if (isFragment(component)) {
    rect = around(contentOf(component).map(rectOf));
  }
  if (reading) roundReads.rects.set(component, rect);
  return rect;
}

/** The page of the window `component` is in: its viewport without scroll bars, its scroll and its direction. */
export function pageOf(component: ComponentBase): Page {
  const reading = isReading();
  const known = reading ? roundReads.pages.get(component) : undefined;
  if (known) return known;
  const view = viewOf(component);
  if (!view) return NO_PAGE;
  noteRead();
  const doc = view.document;
  const root = doc.documentElement;
  const scroller = doc.scrollingElement ?? root;
  const page: Page = {
    width: root.clientWidth || view.innerWidth,
    height: root.clientHeight || view.innerHeight,
    scrollWidth: scroller.scrollWidth,
    scrollHeight: scroller.scrollHeight,
    scrollStart: Math.abs(view.scrollX),
    scrollTop: view.scrollY,
    rtl: view.getComputedStyle(root).direction === 'rtl',
  };
  if (reading) roundReads.pages.set(component, page);
  return page;
}

/** The background the page of `component`'s window shows behind everything: its body's, else its root's, else the canvas color. */
export function pageBackgroundOf(component: ComponentBase): string {
  const view = viewOf(component);
  if (!view) return 'Canvas';
  const doc = view.document;
  for (const el of [doc.body, doc.documentElement]) {
    const color = el ? view.getComputedStyle(el).backgroundColor : '';
    if (color && !isClear(color)) return color;
  }
  return 'Canvas';
}

/** Computed values of `component`'s element by their CSS names (custom properties too), trimmed; '' where there is none, and for a fragment. */
export function styleOf<K extends string>(component: ComponentBase, names: readonly K[]): Record<K, string> {
  const style = computed(component);
  const values = {} as Record<K, string>;
  for (const name of names) values[name] = style ? style.getPropertyValue(name).trim() : '';
  return values;
}

/** Whether `component` is written right to left (a fragment as what holds it): read once in a run, fresh outside one. */
export function isRtl(component: ComponentBase): boolean {
  // A part out of the page (hidden, or not placed yet) reads the way of the place it shows in: the nearest one in the page.
  for (let at = holderOf(component); at; at = at.parent) if (elementOf(at)?.isConnected) return rtlOf(at);
  const holder = holderOf(component);
  return holder ? rtlOf(holder) : false;
}

/**
 * Whether `component` is drawn: it and every component above it shown, and laid out with a box and visible (no
 * `display: none` here or above, no `visibility: hidden`, no `content-visibility: hidden` above it). Where the window lays
 * nothing out (a test document), the component tree decides alone.
 */
export function isRendered(component: ComponentBase): boolean {
  for (let at: ComponentBase | null = component; at; at = at.parent) if (at.isDisposed || !at.isVisible) return false;
  if (!canMeasure(component)) return true;
  if (!elementOf(component)) return isFragment(component) && contentOf(component).some(isRendered);
  const style = computed(component);
  if (!style) return false;
  if (style.display === 'contents') return contentOf(component).some(isRendered);
  if (!isLaidOut(component) || style.visibility !== 'visible') return false;
  for (let at = component.parent; at; at = at.parent) if (styleOf(at, ['content-visibility'])['content-visibility'] === 'hidden') return false;
  return true;
}

/**
 * Whether `component` stands in a document now: its element, or for a fragment the element of the component holding it,
 * is in a page. A component built and kept aside, or taken out, is not.
 */
export function isInPage(component: ComponentBase): boolean {
  if (component.isDisposed) return false;
  const holder = holderOf(component);
  return !!holder && !!elementOf(holder)?.isConnected;
}

/** Whether the window `component` is in lays pages out: a browser does; a test document does not, and every box is empty there. */
export function canMeasure(component: ComponentBase): boolean {
  return typeof viewOf(component)?.ResizeObserver === 'function';
}

/** Whether two components are in the same window. */
export function sameWindow(a: ComponentBase, b: ComponentBase): boolean {
  const view = viewOf(a);
  return view !== null && view === viewOf(b);
}

/**
 * The component that holds `component` in the page's layout: itself when it has an element of its own, else the nearest
 * one above it that has one (past a list, a branch, a function component); null when none does.
 */
export function holderOf(component: ComponentBase): ComponentBase | null {
  for (let at: ComponentBase | null = component; at; at = at.parent) if (elementOf(at)) return at;
  return null;
}

/**
 * The size a size watch reports, read now: the border box, the content box, or the content box in the screen's own
 * pixels. As laid out, as the size observer reports it: a transform (a part scaling in) does not count.
 */
export function sizeOf(component: ComponentBase, box: SizeBox): Size {
  if (!elementOf(component)) return NO_SIZE;
  const inner = boxOf(component);
  if (box === 'border') return { width: inner.offsetWidth, height: inner.offsetHeight };
  const pad = styleOf(component, ['padding-left', 'padding-right', 'padding-top', 'padding-bottom']);
  const width = Math.max(0, inner.clientWidth - px(pad['padding-left']) - px(pad['padding-right']));
  const height = Math.max(0, inner.clientHeight - px(pad['padding-top']) - px(pad['padding-bottom']));
  if (box === 'content') return { width, height };
  const ratio = viewOf(component)?.devicePixelRatio || 1;
  return { width: Math.round(width * ratio), height: Math.round(height * ratio) };
}

/** Whether `component` has a box in a page: `display: none` here or above, or being out of the page, leaves none. */
export function isLaidOut(component: ComponentBase): boolean {
  const el = elementOf(component);
  if (!el) return false;
  const reading = isReading();
  const known = reading ? roundReads.laidOut.get(component) : undefined;
  if (known !== undefined) return known;
  noteRead();
  const laid = el.getClientRects().length > 0;
  if (reading) roundReads.laidOut.set(component, laid);
  return laid;
}

/** How far `component` is scrolled, from its inline start and from its top, counting a scroll written and not made yet. */
export function scrollOf(component: ComponentBase): { start: number; top: number } {
  const el = elementOf(component);
  if (!el) return { start: 0, top: 0 };
  noteRead();
  const start = Math.abs(el.scrollLeft);
  const top = el.scrollTop;
  const pending = pendingScroll(component);
  if (!pending) return { start, top };
  return { start: Math.max(0, (pending.start ?? start) + pending.byStart), top: Math.max(0, (pending.top ?? top) + pending.byTop) };
}

function readBox(component: ComponentBase, el: Element): Box {
  noteRead();
  const rect = el.getBoundingClientRect();
  const html = el as HTMLElement;
  const scrollWidth = el.scrollWidth;
  const scrollHeight = el.scrollHeight;
  const clientWidth = el.clientWidth;
  const clientHeight = el.clientHeight;
  const start = Math.abs(el.scrollLeft);
  const top = el.scrollTop;
  const pending = pendingScroll(component);
  // A window that lays nothing out (a test document) keeps a scroll as written: one not made yet counts the same there.
  const room = (most: number): number => (canMeasure(component) ? most : Infinity);
  return {
    ...copy(rect),
    // An SVG element has no layout size of its own: its box stands in.
    offsetWidth: typeof html.offsetWidth === 'number' ? html.offsetWidth : Math.round(rect.width),
    offsetHeight: typeof html.offsetHeight === 'number' ? html.offsetHeight : Math.round(rect.height),
    clientLeft: el.clientLeft,
    clientTop: el.clientTop,
    clientWidth,
    clientHeight,
    scrollWidth,
    scrollHeight,
    scrollStart: pending ? within((pending.start ?? start) + pending.byStart, room(scrollWidth - clientWidth)) : start,
    scrollTop: pending ? within((pending.top ?? top) + pending.byTop, room(scrollHeight - clientHeight)) : top,
    rtl: rtlOf(component),
  };
}

/** A fragment's box: around what it lays out, scrolling nothing. */
function fragmentBox(component: ComponentBase): Box {
  const rect = rectOf(component);
  const holder = holderOf(component);
  const width = Math.round(rect.width);
  const height = Math.round(rect.height);
  return { ...rect, offsetWidth: width, offsetHeight: height, clientLeft: 0, clientTop: 0, clientWidth: width, clientHeight: height, scrollWidth: width, scrollHeight: height, scrollStart: 0, scrollTop: 0, rtl: holder ? rtlOf(holder) : false };
}

/** The parts with an element of their own that `component` lays out, through the fragments in it; texts hold none. */
function contentOf(component: ComponentBase): ComponentBase[] {
  const parts: ComponentBase[] = [];
  for (const child of component.controls.items) {
    if (child.isDisposed || isText(child)) continue;
    if (elementOf(child)) parts.push(child);
    else if (isFragment(child)) parts.push(...contentOf(child));
  }
  return parts;
}

/** The rect around those of `rects` that are laid out. */
function around(rects: readonly Rect[]): Rect {
  const laid = rects.filter((r) => r.width > 0 || r.height > 0);
  if (!laid.length) return NO_RECT;
  const left = Math.min(...laid.map((r) => r.left));
  const top = Math.min(...laid.map((r) => r.top));
  const right = Math.max(...laid.map((r) => r.right));
  const bottom = Math.max(...laid.map((r) => r.bottom));
  return { left, top, right, bottom, width: right - left, height: bottom - top };
}

function computed(component: ComponentBase): CSSStyleDeclaration | null {
  const reading = isReading();
  const known = reading ? roundReads.styles.get(component) : undefined;
  if (known) return known;
  const el = elementOf(component);
  const view = el ? viewOf(component) : null;
  if (!el || !view || typeof view.getComputedStyle !== 'function') return null;
  const style = view.getComputedStyle(el);
  if (reading) roundReads.styles.set(component, style);
  return style;
}

function rtlOf(component: ComponentBase): boolean {
  const run = runNumber();
  const known = directions.get(component);
  if (known && run >= 0 && known.run === run) return known.rtl;
  const rtl = computed(component)?.direction === 'rtl';
  if (run >= 0) directions.set(component, { rtl, run });
  return rtl;
}

function copy(rect: DOMRectReadOnly): Rect {
  return { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom, width: rect.width, height: rect.height };
}

function within(value: number, most: number): number {
  return Math.max(0, Math.min(Math.max(0, most), value));
}

/** A color that shows nothing: transparent, or an alpha of 0. */
function isClear(color: string): boolean {
  return color === 'transparent' || /[,/]\s*0(?:\.0*)?\s*\)$/.test(color);
}

function px(value: string): number {
  return parseFloat(value) || 0;
}
