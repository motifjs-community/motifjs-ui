import type { WindowBox } from './window-box';
import type { WindowEdge } from './window-edge';

/**
 * The box a window resized from `edge` gets: the pointer moved `dx` along the reading direction and
 * `dy` down since `start`. It stays at least `min` and inside `room` (from 0 to its width and height).
 */
export function resizeBox(edge: WindowEdge, start: WindowBox, dx: number, dy: number, min: { w: number; h: number }, room: { w: number; h: number }): WindowBox {
  let { x, y, w, h } = start;
  if (edge.includes('end')) w = Math.min(Math.max(min.w, start.w + dx), room.w - start.x);
  if (edge.includes('start')) {
    w = Math.min(Math.max(min.w, start.w - dx), start.x + start.w);
    x = start.x + start.w - w;
  }
  if (edge.includes('bottom')) h = Math.min(Math.max(min.h, start.h + dy), room.h - start.y);
  if (edge.includes('top')) {
    h = Math.min(Math.max(min.h, start.h - dy), start.y + start.h);
    y = start.y + start.h - h;
  }
  return { x, y, w, h };
}
