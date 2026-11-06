import type { RuleDate } from './rule-date';

const SHAPE = /^(\d{4})-?(\d{2})-?(\d{2})(?:T(\d{2}):?(\d{2})(?::?(\d{2})(?:\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/i;

/** A date as a rule writes it (`20261031`, `20261031T090000`, `20261031T090000Z`) or in ISO form, or `null` if it is neither. */
export function parseRuleDate(text: string): RuleDate | null {
  const m = SHAPE.exec(text.trim());
  if (!m) return null;
  const [, year, month, day, hour, minute, second, zone] = m;
  const time = Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour ?? 0), Number(minute ?? 0), Number(second ?? 0));
  const back = new Date(time);
  if (back.getUTCMonth() !== Number(month) - 1 || back.getUTCDate() !== Number(day) || Number(hour ?? 0) > 23 || Number(minute ?? 0) > 59) return null;
  if (!zone || zone.toUpperCase() === 'Z') return { time, utc: !!zone, dateOnly: hour === undefined };
  // An offset: the moment it names.
  const sign = zone.startsWith('-') ? -1 : 1;
  const digits = zone.slice(1).replace(':', '');
  const offset = sign * (Number(digits.slice(0, 2)) * 60 + Number(digits.slice(2, 4))) * 60_000;
  return { time: time - offset, utc: true, dateOnly: false };
}
