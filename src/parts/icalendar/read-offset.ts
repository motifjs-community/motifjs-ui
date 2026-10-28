/** An offset (`+0300`, `-0500`, `+053000`) in minutes east of UTC; `null` when it is none. */
export function readOffset(text: string): number | null {
  const m = /^([+-])(\d{2})(\d{2})(\d{2})?$/.exec(text.trim());
  if (!m) return null;
  const minutes = Number(m[2]) * 60 + Number(m[3]) + Number(m[4] ?? 0) / 60;
  return m[1] === '-' ? -minutes : minutes;
}
