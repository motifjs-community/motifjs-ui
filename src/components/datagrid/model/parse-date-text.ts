import { datePatternOf } from '../../../parts/dates/date-pattern-of';

/**
 * A date written as text: ISO (`2026-10-25`, with a time too) or in the locale's order of day, month
 * and year with any separators (`25.10.2026`, `10/25/26`); a two-digit year is in this century.
 * `null` when it is not a real date.
 */
export function parseDateText(text: string, locale: string): Date | null {
  const trimmed = text.trim();
  if (/^\d{4}-\d{2}-\d{2}T/.test(trimmed)) {
    const d = new Date(trimmed);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const groups = trimmed.match(/\d+/g);
  if (!groups || groups.length < 3) return null;
  const order = groups[0].length === 4 ? (['year', 'month', 'day'] as const) : datePatternOf(locale, 'date').parts.filter((p): p is 'year' | 'month' | 'day' => p === 'year' || p === 'month' || p === 'day');
  const value = { year: 0, month: 0, day: 0 };
  order.forEach((part, i) => (value[part] = Number(groups[i])));
  if (groups[order.indexOf('year')].length <= 2) value.year += 2000;
  let [hour = 0, minute = 0, second = 0] = groups.slice(3, 6).map(Number);
  // A 12-hour time: 2:30 PM is 14:30, 12:15 AM is 00:15.
  const meridiem = /\b([ap])\.?\s?m\.?\b/i.exec(trimmed)?.[1].toLowerCase();
  if (meridiem && hour >= 1 && hour <= 12) hour = (hour % 12) + (meridiem === 'p' ? 12 : 0);
  const { year, month, day } = value;
  if (month < 1 || month > 12 || hour > 23 || minute > 59 || second > 59) return null;
  const date = new Date(2000, month - 1, day, hour, minute, second);
  date.setFullYear(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null;
}
