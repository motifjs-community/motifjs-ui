/**
 * Runs `fn` once after `ms`, in a promise: the timer itself only hands the work on. Returns what stops it.
 */
export function later(fn: () => void, ms = 0): () => void {
  let live = true;
  const id = setTimeout(() => {
    if (live) void Promise.resolve().then(() => live && fn());
  }, ms);
  return () => {
    live = false;
    clearTimeout(id);
  };
}
