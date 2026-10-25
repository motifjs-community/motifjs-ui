import type { DatePattern } from './date-pattern';

/** The digits a date is typed with in `pattern`, for the mask: `22112006`. */
export function dateToDigits(date: Date, pattern: DatePattern): string {
  const value = { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate(), hour: date.getHours(), minute: date.getMinutes(), second: date.getSeconds() };
  return pattern.parts.map((part) => String(value[part]).padStart(part === 'year' ? 4 : 2, '0')).join('');
}
