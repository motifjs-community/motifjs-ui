/**
 * Follows the pointer pressed in `e` on `on` until it is let go: `move` gets how far it went from
 * the press, `end` runs once at the end.
 */
export function followPointer(on: HTMLElement, e: PointerEvent, move: (dx: number, dy: number) => void, end: () => void): void {
  const sx = e.clientX;
  const sy = e.clientY;
  on.setPointerCapture?.(e.pointerId);
  const onMove = (m: PointerEvent) => move(m.clientX - sx, m.clientY - sy);
  const onUp = () => {
    on.removeEventListener('pointermove', onMove);
    on.removeEventListener('pointerup', onUp);
    on.removeEventListener('pointercancel', onUp);
    end();
  };
  on.addEventListener('pointermove', onMove);
  on.addEventListener('pointerup', onUp);
  on.addEventListener('pointercancel', onUp);
}
