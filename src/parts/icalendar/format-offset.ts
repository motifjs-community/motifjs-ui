const two = (n: number) => String(n).padStart(2, '0');

/** Minutes east of UTC as an offset is written: `+0300`, `-0500`, with seconds only when there are some. */
export function formatOffset(minutes: number): string {
  const seconds = Math.round(Math.abs(minutes) * 60);
  const text = `${two(Math.floor(seconds / 3600))}${two(Math.floor(seconds / 60) % 60)}${seconds % 60 ? two(seconds % 60) : ''}`;
  return `${minutes < 0 ? '-' : '+'}${text}`;
}
