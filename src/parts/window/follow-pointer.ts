import type { ComponentBase } from '@motifx/core';
import { canMeasure, measure, onLayout, type Point } from '../../core/measure';

/**
 * Follows the pointer pressed in `e` on `on` until it is let go: `move` gets how far it went from the press, `end` runs
 * once at the end with the event that ended it. Without `frame` the distance is the pointer's own on the screen, moved at
 * once: a window fixed to the viewport. With `frame`, where what is dragged lies on the screen (what a scroll or the
 * layout moves under the pointer and the drag does not), the distance is counted in that frame and moved in the next
 * measuring round: when the page or a scroller around it scrolls, what is dragged stays under the pointer, the pointer at
 * rest too. There `move` is told only when the distance changes, and the last move still waiting for its round lands
 * before `end`.
 */
export function followPointer(on: ComponentBase, e: PointerEvent, move: (dx: number, dy: number, e: PointerEvent) => void, end: (e: PointerEvent) => void, frame?: () => Point): void {
  const sx = e.clientX;
  const sy = e.clientY;
  let last = e;
  // Where nothing is laid out (a test document) no frame moves.
  const read = frame && canMeasure(on) ? frame : null;
  const from = read ? read() : null;
  let waiting: (() => void) | null = null;
  let told: Point = { x: 0, y: 0 };
  const follow = (at: Point | null) => {
    waiting = null;
    const shift = at && from ? { x: at.x - from.x, y: at.y - from.y } : { x: 0, y: 0 };
    const way = { x: last.clientX - sx - shift.x, y: last.clientY - sy - shift.y };
    // The scroll watch tells once when it starts, and a scroll may move nothing that is followed.
    if (way.x === told.x && way.y === told.y) return;
    told = way;
    move(way.x, way.y, last);
  };
  const ask = () => {
    if (read) waiting = measure(on, read, follow);
  };
  const stopScroll = read ? onLayout(on, 'scroll', ask) : null;
  on.attr.add({ setPointerCapture: e.pointerId });
  const onMove = (_: ComponentBase, m: PointerEvent) => {
    last = m;
    if (read) ask();
    else move(m.clientX - sx, m.clientY - sy, m);
  };
  const onUp = (_: ComponentBase, u: PointerEvent) => {
    void on.motif.off('pointermove', onMove);
    void on.motif.off('pointerup', onUp);
    void on.motif.off('pointercancel', onUp);
    stopScroll?.();
    if (waiting && read) {
      waiting();
      follow(read());
    }
    end(u);
  };
  void on.motif.on('pointermove', onMove);
  void on.motif.on('pointerup', onUp);
  void on.motif.on('pointercancel', onUp);
}
