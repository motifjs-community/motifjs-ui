// Where each window's viewport sits on the screen, so that a point of one window can be found in
// another: a drag goes on outside the window it started in (the pointer stays with it), and the
// window under the pointer there takes the drop. A pointer event says it exactly (screen minus
// viewport position); a window moved since then has moved its viewport the same way.

interface Offset {
  x: number;
  y: number;
  /** The window's own place when it was noted. */
  left: number;
  top: number;
}

const offsets = new WeakMap<Window, Offset>();

/** Notes where `view`'s viewport is, from one of its pointer events. */
export function noteOffset(view: Window, e: MouseEvent): void {
  if (!e.screenX && !e.screenY && !e.clientX && !e.clientY) return;
  offsets.set(view, { x: e.screenX - e.clientX, y: e.screenY - e.clientY, left: view.screenX, top: view.screenY });
}

/** Where `view`'s viewport starts on the screen: as last noted, else guessed from the window's frame. */
export function offsetOf(view: Window): { x: number; y: number } {
  const known = offsets.get(view);
  if (known) return { x: known.x + view.screenX - known.left, y: known.y + view.screenY - known.top };
  const side = Math.max(0, (view.outerWidth - view.innerWidth) / 2);
  return { x: view.screenX + side, y: view.screenY + Math.max(0, view.outerHeight - view.innerHeight - side) };
}

/** Whether a point of `view`'s viewport is inside it. */
export function inViewport(view: Window, x: number, y: number): boolean {
  return x >= 0 && y >= 0 && x < view.innerWidth && y < view.innerHeight;
}
