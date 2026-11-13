import type { ComponentBase } from '@motifx/core';

/**
 * Follows the pointer pressed in `e` on `on` until it is let go: `move` gets how far it went from
 * the press, `end` runs once at the end.
 */
export function followPointer(on: ComponentBase, e: PointerEvent, move: (dx: number, dy: number) => void, end: () => void): void {
  const sx = e.clientX;
  const sy = e.clientY;
  on.attr.add({ setPointerCapture: e.pointerId });
  const onMove = (_: ComponentBase, m: PointerEvent) => move(m.clientX - sx, m.clientY - sy);
  const onUp = () => {
    void on.motif.off('pointermove', onMove);
    void on.motif.off('pointerup', onUp);
    void on.motif.off('pointercancel', onUp);
    end();
  };
  void on.motif.on('pointermove', onMove);
  void on.motif.on('pointerup', onUp);
  void on.motif.on('pointercancel', onUp);
}
