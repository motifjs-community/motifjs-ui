import type { View } from './view';

/** A window that draws no frames (in the background) still runs it this much later. */
const LONGEST_WAIT = 200;
const FRAME_TIME = 16;

/**
 * Runs `then` in a task after the next frame of `view`: the frame's own work (style, layout, paint) is done by then, so
 * reading or moving focus there lays nothing out. A window that draws no frames runs it on a timer. Returns what takes
 * it back.
 */
export function afterFrame(view: View, then: () => void): () => void {
  let done = false;
  let frame = 0;
  let after: ReturnType<typeof setTimeout> | undefined;
  const run = (): void => {
    if (done) return;
    stop();
    then();
  };
  try {
    if (!view.closed && typeof view.requestAnimationFrame === 'function') frame = view.requestAnimationFrame(() => (after = setTimeout(run, 0)));
  } catch {
    frame = 0;
  }
  const timer = setTimeout(run, frame ? LONGEST_WAIT : FRAME_TIME);
  function stop(): void {
    done = true;
    clearTimeout(timer);
    clearTimeout(after);
    if (!frame) return;
    try {
      view.cancelAnimationFrame(frame);
    } catch {
      // The window closed in between: its frame is gone with it.
    }
  }
  return stop;
}
