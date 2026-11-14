const pad = (n: number) => String(n).padStart(2, '0');

/**
 * A date back in the kind of value a cell had: a `Date`, a timestamp, or a text: `yyyy-mm-dd`, and with `time` the
 * moment too (`yyyy-mm-ddThh:mm:ss`, or an ISO moment in UTC when the cell's text had a zone).
 */
export function dateLike(date: Date | null, like: unknown, time = false): unknown {
  if (!date) return null;
  if (like instanceof Date) return date;
  if (typeof like === 'number') return date.getTime();
  const day = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  if (!time) return day;
  if (typeof like === 'string' && /(Z|[+-]\d{2}:?\d{2})$/.test(like.trim())) return date.toISOString();
  return `${day}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}
