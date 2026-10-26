/** Runs `fn` at the next frame (a short timeout where there are no frames); returns what stops it. */
export function nextFrame(fn: () => void): number {
  return typeof requestAnimationFrame === 'function' ? requestAnimationFrame(fn) : (setTimeout(fn, 16) as unknown as number);
}

/** Stops what `nextFrame` started; 0 is nothing. */
export function stopFrame(id: number) {
  if (!id) return;
  if (typeof requestAnimationFrame === 'function') cancelAnimationFrame(id);
  else clearTimeout(id);
}
