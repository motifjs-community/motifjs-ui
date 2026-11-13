import type { ComponentBase } from '@motifx/core';
import { isRtl, pageOf, rectOf } from '../../core/measure';
import { css, put } from '../../core/part-writes';
import type { PopupPlacement } from './popup-placement';

function within(at: number, size: number, room: number): number {
  return Math.max(0, Math.min(at, room - size));
}

/** Where a popup of `size` starts along an edge from `from` to `to`, lined up as `align` asks. */
function line(align: string, from: number, to: number, size: number, reversed: boolean): number {
  if (align === 'center') return from + (to - from - size) / 2;
  return (align === 'start') !== reversed ? from : to - size;
}

/**
 * Places a fixed `popup` next to `anchor`: on the side the placement requests, or on the other side
 * when that has more room. It stays inside the viewport and scrolls inside when it is taller. The gap
 * is the popup's CSS margin on the side it opens on (`data-side`).
 */
export function placePopup(popup: ComponentBase, anchor: ComponentBase, placement: PopupPlacement, matchWidth: boolean): void {
  placeBeside(popup, anchor, placement, matchWidth);
}

/** Places the fixed popup `part` next to `anchorPart` (what `placePopup` does). */
export function placeBeside(part: ComponentBase, anchorPart: ComponentBase, placement: PopupPlacement, matchWidth: boolean): void {
  const box = rectOf(anchorPart);
  const [side, align = 'center'] = placement.split('-');
  const across = side === 'start' || side === 'end';
  css(part, 'min-inline-size', matchWidth && !across ? `${box.width}px` : '');
  css(part, 'max-block-size', '');
  for (const edge of ['top', 'bottom', 'left', 'right']) css(part, edge, '');

  const size = rectOf(part);
  // The viewport of the popup's own window (a window the app opened has its own).
  const { width: viewWidth, height: viewHeight } = pageOf(part);
  const rtl = isRtl(anchorPart);

  if (!across) {
    const below = viewHeight - box.bottom;
    const above = box.top;
    const wantsBelow = side === 'bottom';
    const down = size.height <= (wantsBelow ? below : above) ? wantsBelow : below >= above;
    put(part, 'data-side', down ? 'bottom' : 'top');
    if (down) css(part, 'top', `${box.bottom}px`);
    else css(part, 'bottom', `${viewHeight - box.top}px`);
    css(part, 'max-block-size', `calc(${down ? below : above}px - 2 * var(--mx-popup-offset))`);
    css(part, 'left', `${within(line(align, box.left, box.right, size.width, rtl), size.width, viewWidth)}px`);
    return;
  }

  // Across: `end` is to the right in a left-to-right page.
  const right = viewWidth - box.right;
  const left = box.left;
  const wantsRight = (side === 'end') !== rtl;
  const toRight = size.width <= (wantsRight ? right : left) ? wantsRight : right >= left;
  put(part, 'data-side', toRight !== rtl ? 'end' : 'start');
  if (toRight) css(part, 'left', `${box.right}px`);
  else css(part, 'right', `${viewWidth - box.left}px`);
  css(part, 'max-block-size', `calc(${viewHeight}px - 2 * var(--mx-popup-offset))`);
  css(part, 'top', `${within(line(align, box.top, box.bottom, size.height, false), Math.min(size.height, viewHeight), viewHeight)}px`);
}
