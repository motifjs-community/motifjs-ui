/**
 * Runs `fn` every `ms`, in a promise. The next run is set only when one has ended, so slow work never piles
 * up runs behind it (a timer that repeats on its own would). Returns what stops it.
 */
export function every(fn: () => void, ms: number): () => void {
  let live = true;
  let id: ReturnType<typeof setTimeout>;
  const next = () => {
    id = setTimeout(() => {
      if (!live) return;
      void Promise.resolve()
        .then(() => live && fn())
        .finally(() => live && next());
    }, ms);
  };
  next();
  return () => {
    live = false;
    clearTimeout(id);
  };
}
