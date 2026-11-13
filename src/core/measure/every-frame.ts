import type { ComponentBase } from '@motifx/core';
import { viewOf } from './element-of';
import type { Loop } from './loop';
import { addLoop, removeLoop } from './rounds';
import { Watcher } from './watcher';
import type { WindowBound } from './window-bound';

/**
 * `read`, then `write` with what it read, at every frame of the window `owner` is in, in the first round of the frame
 * with every other read: a drag, a scroll near an edge, a drawing that follows the page. It waits while `owner` is out of
 * the page and goes on in the window it comes back to. It ends when `write` returns false, when the returned function
 * is called, or with `owner`; nothing is registered per call.
 */
export function everyFrame<T>(owner: ComponentBase, read: () => T, write: (value: T) => void | false): () => void {
  if (owner.isDisposed) return () => {};
  const watcher = Watcher.of(owner);
  const loop: Loop = {
    owner,
    view: null,
    job: {
      owner,
      read,
      write: (value) => {
        if (write(value as T) === false) stop();
      },
      cancelled: false,
    },
  };
  const bound: WindowBound = {
    attach: () => {
      loop.view = viewOf(owner);
      addLoop(loop);
    },
    detach: () => {
      loop.view = null;
    },
    arrived: () => {},
    stop: () => stop(),
  };
  const stop = (): void => {
    if (loop.job.cancelled) return;
    loop.job.cancelled = true;
    loop.view = null;
    removeLoop(loop);
    watcher.release(bound);
  };
  watcher.hold(bound);
  return stop;
}
