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
 * Puts a fixed `popup` next to `anchor`: on the side the placement asks for, or on the other one
 * when that has more room; inside the viewport, scrolling inside when it is taller. The gap is the
 * popup's CSS margin on the side it opens on (`data-side`).
 */
export function placePopup(popup: HTMLElement, anchor: Element, placement: PopupPlacement, matchWidth: boolean): void {
  const style = popup.style;
  const box = anchor.getBoundingClientRect();
  const [side, align = 'center'] = placement.split('-');
  const across = side === 'start' || side === 'end';
  style.minInlineSize = matchWidth && !across ? `${box.width}px` : '';
  style.maxBlockSize = '';
  style.top = style.bottom = style.left = style.right = '';

  const size = popup.getBoundingClientRect();
  const viewWidth = document.documentElement.clientWidth;
  const viewHeight = document.documentElement.clientHeight;
  const rtl = getComputedStyle(anchor).direction === 'rtl';

  if (!across) {
    const below = viewHeight - box.bottom;
    const above = box.top;
    const wantsBelow = side === 'bottom';
    const down = size.height <= (wantsBelow ? below : above) ? wantsBelow : below >= above;
    popup.dataset.side = down ? 'bottom' : 'top';
    if (down) style.top = `${box.bottom}px`;
    else style.bottom = `${viewHeight - box.top}px`;
    style.maxBlockSize = `calc(${down ? below : above}px - 2 * var(--mx-popup-offset))`;
    style.left = `${within(line(align, box.left, box.right, size.width, rtl), size.width, viewWidth)}px`;
    return;
  }

  // Across: `end` is to the right in a left-to-right page.
  const right = viewWidth - box.right;
  const left = box.left;
  const wantsRight = (side === 'end') !== rtl;
  const toRight = size.width <= (wantsRight ? right : left) ? wantsRight : right >= left;
  popup.dataset.side = toRight !== rtl ? 'end' : 'start';
  if (toRight) style.left = `${box.right}px`;
  else style.right = `${viewWidth - box.left}px`;
  style.maxBlockSize = `calc(${viewHeight}px - 2 * var(--mx-popup-offset))`;
  style.top = `${within(line(align, box.top, box.bottom, size.height, false), Math.min(size.height, viewHeight), viewHeight)}px`;
}
