import type { DatePattern } from './date-pattern';

/** The date typed as `digits` in `pattern`, or `null` if it is not a real date. A part the pattern lacks comes from `base`. */
export function digitsToDate(digits: string, pattern: DatePattern, base: Date = new Date()): Date | null {
  const value = { year: base.getFullYear(), month: base.getMonth() + 1, day: base.getDate(), hour: 0, minute: 0, second: 0 };
  let at = 0;
  for (const part of pattern.parts) {
    const size = part === 'year' ? 4 : 2;
    const text = digits.slice(at, at + size);
    if (text.length < size) return null;
    value[part] = Number(text);
    at += size;
  }
  const { year, month, day, hour, minute, second } = value;
  if (month < 1 || month > 12 || hour > 23 || minute > 59 || second > 59) return null;
  const date = new Date(2000, month - 1, day, hour, minute, second);
  date.setFullYear(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null;
}
