import { TimeZone } from '../dates/time-zone';
import { formatRuleDate } from '../recurrence/format-rule-date';
import { WEEKDAY_CODES } from '../recurrence/weekday-codes';
import { formatOffset } from './format-offset';
import { shortZoneName } from './short-zone-name';

const MINUTE = 60_000;
const DAY = 86_400_000;

/** A change of the offset: `wall` is the clock time just before it, in the old offset. */
interface Change {
  wall: number;
  from: number;
  to: number;
  name: string;
}

const kindOf = (change: Change) => (change.to > change.from ? 'DAYLIGHT' : 'STANDARD');
const yearOf = (wall: number) => new Date(wall).getUTCFullYear();
const wallText = (wall: number) => formatRuleDate({ time: wall, utc: false, dateOnly: false });

function changesOf(zone: TimeZone, fromYear: number, toYear: number): Change[] {
  const out: Change[] = [];
  const end = Date.UTC(toYear + 1, 0, 1);
  let offset = zone.offset(Date.UTC(fromYear, 0, 1));
  for (let day = Date.UTC(fromYear, 0, 1); day < end; day += DAY) {
    const next = zone.offset(day + DAY);
    if (next === offset) continue;
    let low = day;
    let high = day + DAY;
    while (high - low > MINUTE) {
      const middle = low + Math.floor((high - low) / 2 / MINUTE) * MINUTE;
      if (zone.offset(middle) === offset) low = middle;
      else high = middle;
    }
    const wall = high + offset * MINUTE;
    const year = yearOf(wall);
    if (year >= fromYear && year <= toYear) out.push({ wall, from: offset, to: zone.offset(high), name: shortZoneName(zone.name, high) });
    offset = next;
  }
  return out;
}

/** The yearly rule all the changes follow (`FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU`), when there is one in every year of the span; else empty. */
function yearlyRule(changes: Change[], fromYear: number, toYear: number): string {
  if (changes.length !== toYear - fromYear + 1) return '';
  const first = changes[0];
  const days = changes.map((change) => new Date(change.wall));
  const same = changes.every(
    (change, i) =>
      yearOf(change.wall) === fromYear + i &&
      change.from === first.from &&
      change.to === first.to &&
      change.name === first.name &&
      change.wall % DAY === first.wall % DAY &&
      days[i].getUTCMonth() === days[0].getUTCMonth() &&
      days[i].getUTCDay() === days[0].getUTCDay(),
  );
  if (!same) return '';
  const monthLength = (d: Date) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  const nth = (d: Date) => Math.floor((d.getUTCDate() - 1) / 7) + 1;
  let place = 0;
  if (days.every((d) => d.getUTCDate() > monthLength(d) - 7)) place = -1;
  else if (days.every((d) => nth(d) === nth(days[0]))) place = nth(days[0]);
  if (!place) return '';
  return `FREQ=YEARLY;BYMONTH=${days[0].getUTCMonth() + 1};BYDAY=${place}${WEEKDAY_CODES[days[0].getUTCDay()]}`;
}

function observanceLines(kind: string, start: number, from: number, to: number, name: string, more: string[]): string[] {
  return [
    `BEGIN:${kind}`,
    `DTSTART:${wallText(start)}`,
    ...more,
    `TZOFFSETFROM:${formatOffset(from)}`,
    `TZOFFSETTO:${formatOffset(to)}`,
    ...(name ? [`TZNAME:${name}`] : []),
    `END:${kind}`,
  ];
}

/**
 * The `VTIMEZONE` of an IANA zone as content lines, from `Intl` only: every change of its offset
 * from the start of `fromYear` to the end of `toYear`. Changes of one kind that fall on the same
 * yearly rule in every year are written as one observance with an `RRULE`, and others as observances
 * with `RDATE`s. A zone that does not change writes one `STANDARD`.
 *
 * @example
 * timeZoneLines('Europe/Berlin', 2026, 2027)
 */
export function timeZoneLines(name: string, fromYear: number, toYear: number): string[] {
  const zone = TimeZone.of(name);
  const lines = ['BEGIN:VTIMEZONE', `TZID:${name}`];
  const changes = changesOf(zone, fromYear, toYear);
  if (!changes.length) {
    const moment = Date.UTC(fromYear, 0, 1);
    const offset = zone.offset(moment);
    lines.push(...observanceLines('STANDARD', Date.UTC(1970, 0, 1), offset, offset, shortZoneName(name, moment), []));
    return [...lines, 'END:VTIMEZONE'];
  }
  const parts: { start: number; lines: string[] }[] = [];
  for (const kind of ['STANDARD', 'DAYLIGHT']) {
    const ofKind = changes.filter((change) => kindOf(change) === kind);
    if (!ofKind.length) continue;
    const rule = yearlyRule(ofKind, fromYear, toYear);
    if (rule) {
      const first = ofKind[0];
      parts.push({ start: first.wall, lines: observanceLines(kind, first.wall, first.from, first.to, first.name, [`RRULE:${rule}`]) });
      continue;
    }
    const groups = new Map<string, Change[]>();
    for (const change of ofKind) {
      const key = `${change.from} ${change.to} ${change.name}`;
      groups.set(key, [...(groups.get(key) ?? []), change]);
    }
    for (const [first, ...rest] of groups.values()) {
      const more = rest.length ? [`RDATE:${rest.map((change) => wallText(change.wall)).join(',')}`] : [];
      parts.push({ start: first.wall, lines: observanceLines(kind, first.wall, first.from, first.to, first.name, more) });
    }
  }
  parts.sort((a, b) => a.start - b.start);
  return [...lines, ...parts.flatMap((part) => part.lines), 'END:VTIMEZONE'];
}
