import type { ComponentBase } from '@motifx/core';
import { boxOf, everyFrame, rectOf, scrollTo, type Point, type ScrollPlace } from '../../core/measure';
import type { AutoScrollOptions } from './auto-scroll-options';
import { scrollStep } from './scroll-step';

/**
 * Scrolls a scroller while a drag's pointer stays near its edges, at every frame of `owner`'s window: read with the
 * frame's reads, the step written after them. `scroller`: the one to scroll, or a function giving it each frame (the
 * grid under the pointer). Whether it moved comes from the clamp and the write, never from a read-back; `moved` runs
 * after a step. `pointer`: the last point, null for none. The loop is `owner`'s, the component dragging: it waits while
 * `owner` is out of the page and ends with the returned function or with `owner`.
 */
export function autoScroll(
  owner: ComponentBase,
  scroller: ComponentBase | (() => ComponentBase | null),
  pointer: () => Point | null,
  moved: () => void,
  options: AutoScrollOptions = {},
): () => void {
  const speed = options.speed ?? 12;
  const axis = options.axis ?? 'both';
  const step = options.step ?? scrollStep;
  const zoneOf = (room: number): number => (typeof options.zone === 'function' ? options.zone(room) : (options.zone ?? 40));
  return everyFrame(
    owner,
    () => {
      const at = pointer();
      const target = typeof scroller === 'function' ? scroller() : scroller;
      if (!at || !target || target.isDisposed) return null;
      return { at, target, box: boxOf(target), start: sideOf(options.start, 'x'), end: sideOf(options.end, 'x'), top: sideOf(options.top, 'y'), bottom: sideOf(options.bottom, 'y') };
    },
    (read) => {
      if (!read) return;
      const { at, target, box } = read;
      // The room it scrolls: inside the borders, without the scroll bars (one sits on the left, right to left).
      const left = box.left + box.clientLeft;
      const top = box.top + box.clientTop;
      const right = left + box.clientWidth;
      const bottom = top + box.clientHeight;
      const withinWidth = at.x >= left && at.x < right;
      const withinHeight = at.y >= top && at.y < bottom;
      // The inline start is on the right, right to left.
      const fromLeft = box.rtl ? read.end : read.start;
      const fromRight = box.rtl ? read.start : read.end;
      const down = axis === 'x' || (options.whileOver && !withinWidth) ? 0 : step(at.y, top + read.top, bottom - read.bottom, zoneOf(box.clientHeight), speed);
      const across = axis === 'y' || (options.whileOver && !withinHeight) ? 0 : step(at.x, left + fromLeft, right - fromRight, zoneOf(box.clientWidth), speed);
      const place: ScrollPlace = {};
      const nextTop = clamp(box.scrollTop + down, box.scrollHeight - box.clientHeight);
      const nextStart = clamp(box.scrollStart + (box.rtl ? -across : across), box.scrollWidth - box.clientWidth);
      if (nextTop !== box.scrollTop) place.top = nextTop;
      if (nextStart !== box.scrollStart) place.start = nextStart;
      if ((place.top !== undefined || place.start !== undefined) && scrollTo(target, place)) moved();
    },
  );
}

function sideOf(side: number | ComponentBase | undefined, axis: 'x' | 'y'): number {
  if (side === undefined) return 0;
  if (typeof side === 'number') return side;
  const rect = rectOf(side);
  return axis === 'x' ? rect.width : rect.height;
}

function clamp(value: number, most: number): number {
  return Math.max(0, Math.min(Math.max(0, most), value));
}
