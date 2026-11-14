import { errorHandler, untracked, type ComponentBase } from '@motifx/core';
import { viewOf } from './element-of';

/** A window that draws no frames (in the background) still runs it this much later. */
const LONGEST_WAIT = 200;
const FRAME_TIME = 16;

/**
 * Runs `then` once the window of `owner` has drawn its next frame: what was written by then is laid out and on the
 * screen, so moving focus or reading costs no layout there. A window that draws no frames runs it on a timer. Nothing
 * runs for an owner disposed by then. Returns what takes it back.
 */
export function afterDrawn(owner: ComponentBase, then: () => void): () => void {
  const view = viewOf(owner);
  if (!view) return () => {};
  let done = false;
  let frame = 0;
  let after: ReturnType<typeof setTimeout> | undefined;
  const run = (): void => {
    if (done) return;
    stop();
    if (owner.isDisposed) return;
    try {
      untracked(then);
    } catch (error) {
      errorHandler.report(error instanceof Error ? error : new Error(String(error)));
    }
  };
  try {
    // A task after the frame: the frame's own work (style, layout, paint) is done by then.
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
      view!.cancelAnimationFrame(frame);
    } catch {
      // The window closed in between: its frame is gone with it.
    }
  }
  return stop;
}
