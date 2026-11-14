import { errorHandler, untracked, type ComponentBase } from '@motifx/core';
import { afterFrame } from './after-frame';
import { viewOf } from './element-of';
import { measure, measureNow } from './rounds';
import type { View } from './view';

/**
 * Runs `then` once the window of `owner` has drawn its next frame: what was written by then is laid out and on the
 * screen, so moving focus or reading costs no layout there. A window that draws no frames runs it on a timer. Nothing
 * runs for an owner disposed by then. Returns what takes it back.
 */
export function afterDrawn(owner: ComponentBase, then: () => void): () => void {
  const view = viewOf(owner);
  if (!view) return () => {};
  return afterFrame(view, () => {
    if (!owner.isDisposed) runSafely(then);
  });
}

function runSafely(then: () => void): void {
  try {
    untracked(then);
  } catch (error) {
    errorHandler.report(error instanceof Error ? error : new Error(String(error)));
  }
}

/** A measure waiting for the next frame of its window. */
interface Waiting {
  readonly owner: ComponentBase;
  readonly ask: () => () => void;
  asked: (() => void) | null;
}

/** What waits for the next frame of each window: every measure asked until then runs in one run there. */
const waitingIn = new WeakMap<View, { readonly all: Set<Waiting>; readonly stop: () => void }>();

/**
 * Reads once the window of `owner` has drawn its next frame, in one run with every other measure asked for that frame:
 * the page is laid out by then and the reads come before the writes, so nothing is laid out to read. What `write`
 * writes shows a frame later. For a first measure that can wait a frame (a part that clips what does not fit until
 * then). Returns what takes it back.
 */
export function measureAfterDrawn<T>(owner: ComponentBase, read: () => T, write: (value: T) => void): () => void {
  const view = viewOf(owner);
  if (!view) return () => {};
  const waiting: Waiting = { owner, ask: () => measure(owner, read, write), asked: null };
  let batch = waitingIn.get(view);
  if (!batch) {
    const all = new Set<Waiting>();
    batch = {
      all,
      stop: afterFrame(view, () => {
        waitingIn.delete(view);
        const live = [...all].filter((one) => !one.owner.isDisposed);
        if (!live.length) return;
        for (const one of live) runSafely(() => (one.asked = one.ask()));
        runSafely(() => measureNow(live[0].owner));
      }),
    };
    waitingIn.set(view, batch);
  }
  const { all, stop } = batch;
  all.add(waiting);
  return () => {
    waiting.asked?.();
    if (!all.delete(waiting) || all.size || waitingIn.get(view)?.all !== all) return;
    stop();
    waitingIn.delete(view);
  };
}
