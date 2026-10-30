/**
 * Runs `fn` at the next frame of `view` (the window the work is drawn in; the page's by default), in a promise:
 * the frame itself stays short, the work runs right after it, before the screen is drawn. Where the window has
 * no frames (a test, a window being closed), it runs after a frame's time. Returns what stops it.
 */
export function nextFrame(fn: () => void, view: Window | null = typeof window === 'undefined' ? null : window): () => void {
  let live = true;
  const run = () => {
    if (live) void Promise.resolve().then(() => live && fn());
  };
  if (view && typeof view.requestAnimationFrame === 'function' && typeof view.cancelAnimationFrame === 'function') {
    const id = view.requestAnimationFrame(run);
    return () => {
      live = false;
      view.cancelAnimationFrame(id);
    };
  }
  const id = setTimeout(run, 16);
  return () => {
    live = false;
    clearTimeout(id);
  };
}
