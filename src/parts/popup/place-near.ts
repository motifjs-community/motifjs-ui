import { ComponentBase } from '@motifx/core';
import { isRtl, measure, pageOf, rectOf, type Page, type Rect } from '../../core/measure';
import { css, put } from '../../core/part-writes';
import type { PlaceOptions } from './place-options';
import type { Placed } from './placed';
import type { PopupAnchor } from './popup-anchor';

const EDGES = ['top', 'bottom', 'left', 'right'];

interface Ask {
  anchor: PopupAnchor;
  options: PlaceOptions;
}

interface Steps {
  clear: [read: () => Rect | null, write: (at: Rect | null) => void];
  place: [read: () => ReturnType<typeof readPlace>, write: (seen: ReturnType<typeof readPlace>) => void];
}

/** What each popup was asked last: asked again before it is placed, the last ask wins. */
const asked = new WeakMap<ComponentBase, Ask>();
/** The same read and write each time for a popup, so asking again before its round runs it once. */
const steps = new WeakMap<ComponentBase, Steps>();

/**
 * Places a fixed `popup` next to `anchor`: on the side asked for, or the other side when that has more room; inside the
 * viewport of its window, scrolling inside when taller. The gap is its CSS margin on the side it opens on (`data-side`).
 * Its last place is taken away in one round, it is measured in the next with every popup of the frame and placed after
 * those reads; nothing is drawn in between. Returns what takes it back.
 */
export function placeNear(popup: ComponentBase, anchor: PopupAnchor, options: PlaceOptions): () => void {
  const ask: Ask = { anchor, options };
  asked.set(popup, ask);
  const [read, write] = stepsOf(popup).clear;
  measure(popup, read, write);
  return () => {
    if (asked.get(popup) === ask) asked.delete(popup);
  };
}

function stepsOf(popup: ComponentBase): Steps {
  const known = steps.get(popup);
  if (known) return known;
  const made: Steps = {
    clear: [
      () => anchorRect(asked.get(popup)?.anchor),
      (at) => {
        const ask = asked.get(popup);
        if (!ask || !at) return;
        css(popup, 'min-inline-size', ask.options.matchWidth && !across(ask.options.placement) ? `${at.width}px` : '');
        css(popup, 'max-block-size', '');
        for (const edge of EDGES) css(popup, edge, '');
        measure(popup, made.place[0], made.place[1]);
      },
    ],
    place: [
      () => readPlace(popup),
      (seen) => {
        if (!seen) return;
        // Placed also when no one listens: an optional call would skip its argument.
        const placed = writePlace(popup, seen.options.placement, seen.at, seen.self, seen.page, seen.rtl);
        seen.options.placed?.(placed);
      },
    ],
  };
  steps.set(popup, made);
  return made;
}

function readPlace(popup: ComponentBase) {
  const ask = asked.get(popup);
  const at = ask ? anchorRect(ask.anchor) : null;
  if (!ask || !at) return null;
  const owner = ask.anchor instanceof ComponentBase ? ask.anchor : popup;
  return { options: ask.options, at, self: rectOf(popup), page: pageOf(popup), rtl: isRtl(owner) };
}

function anchorRect(anchor: PopupAnchor | undefined): Rect | null {
  if (!anchor) return null;
  if (anchor instanceof ComponentBase) return anchor.isDisposed ? null : rectOf(anchor);
  const point = typeof anchor === 'function' ? anchor() : anchor;
  return point ? { left: point.x, top: point.y, right: point.x, bottom: point.y, width: 0, height: 0 } : null;
}

function writePlace(popup: ComponentBase, placement: string, at: Rect, self: Rect, page: Page, rtl: boolean): Placed {
  const [side, align = 'center'] = placement.split('-');
  if (!across(placement)) {
    const below = page.height - at.bottom;
    const down = self.height <= (side === 'bottom' ? below : at.top) ? side === 'bottom' : below >= at.top;
    const height = Math.min(self.height, down ? below : at.top);
    const left = within(line(align, at.left, at.right, self.width, rtl), self.width, page.width);
    put(popup, 'data-side', down ? 'bottom' : 'top');
    css(popup, 'top', down ? `${at.bottom}px` : '');
    css(popup, 'bottom', down ? '' : `${page.height - at.top}px`);
    css(popup, 'max-block-size', `calc(${down ? below : at.top}px - 2 * var(--mx-popup-offset))`);
    css(popup, 'left', `${left}px`);
    return { side: down ? 'bottom' : 'top', anchor: at, rect: rectAt(left, down ? at.bottom : at.top - height, self.width, height) };
  }
  // Across: `end` is to the right in a left-to-right page.
  const right = page.width - at.right;
  const wantsRight = (side === 'end') !== rtl;
  const toRight = self.width <= (wantsRight ? right : at.left) ? wantsRight : right >= at.left;
  const opened = toRight !== rtl ? 'end' : 'start';
  const height = Math.min(self.height, page.height);
  const top = within(line(align, at.top, at.bottom, self.height, false), height, page.height);
  put(popup, 'data-side', opened);
  css(popup, 'left', toRight ? `${at.right}px` : '');
  css(popup, 'right', toRight ? '' : `${page.width - at.left}px`);
  css(popup, 'max-block-size', `calc(${page.height}px - 2 * var(--mx-popup-offset))`);
  css(popup, 'top', `${top}px`);
  return { side: opened, anchor: at, rect: rectAt(toRight ? at.right : at.left - self.width, top, self.width, height) };
}

function across(placement: string): boolean {
  return placement.startsWith('start') || placement.startsWith('end');
}

function within(at: number, size: number, room: number): number {
  return Math.max(0, Math.min(at, room - size));
}

/** Where a popup of `size` starts along an edge from `from` to `to`, lined up as `align` asks. */
function line(align: string, from: number, to: number, size: number, reversed: boolean): number {
  if (align === 'center') return from + (to - from - size) / 2;
  return (align === 'start') !== reversed ? from : to - size;
}

function rectAt(left: number, top: number, width: number, height: number): Rect {
  return { left, top, right: left + width, bottom: top + height, width, height };
}
