const pad = (n: number) => String(n).padStart(2, '0');

/** A date back in the kind of value a cell had: a `Date`, a timestamp, or a `yyyy-mm-dd` text. */
export function dateLike(date: Date | null, like: unknown): unknown {
  if (!date) return null;
  if (like instanceof Date) return date;
  if (typeof like === 'number') return date.getTime();
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
