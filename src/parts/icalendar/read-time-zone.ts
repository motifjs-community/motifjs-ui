import { parseRuleDate } from '../recurrence/parse-rule-date';
import type { ICalendarComponent } from './icalendar-component';
import type { ICalendarObservance } from './icalendar-observance';
import type { ICalendarTimeZone } from './icalendar-time-zone';
import { readICalendarDates } from './read-icalendar-dates';
import { readOffset } from './read-offset';
import { unescapeText } from './unescape-text';

const MINUTE = 60_000;

function observance(component: ICalendarComponent): ICalendarObservance | null {
  const value = (name: string) => component.properties.find((property) => property.name === name)?.value ?? '';
  const start = parseRuleDate(value('DTSTART'));
  const offsetTo = readOffset(value('TZOFFSETTO'));
  if (!start || offsetTo === null) return null;
  const offsetFrom = readOffset(value('TZOFFSETFROM')) ?? offsetTo;
  const dates = component.properties
    .filter((property) => property.name === 'RDATE')
    .flatMap(readICalendarDates)
    // Onsets are local times; one written in UTC is turned into the offset before it.
    .map((date) => (date.utc ? date.time + offsetFrom * MINUTE : date.time));
  return {
    kind: component.name === 'DAYLIGHT' ? 'daylight' : 'standard',
    start: start.utc ? start.time + offsetFrom * MINUTE : start.time,
    offsetFrom,
    offsetTo,
    name: unescapeText(value('TZNAME')),
    rule: value('RRULE').trim(),
    dates,
  };
}

/** A time zone from its `VTIMEZONE` block; `null` when it has no `TZID`. */
export function readTimeZone(component: ICalendarComponent): ICalendarTimeZone | null {
  const id = (component.properties.find((property) => property.name === 'TZID')?.value ?? '').trim().replace(/^\//, '');
  if (!id) return null;
  const observances = component.children
    .filter((child) => child.name === 'STANDARD' || child.name === 'DAYLIGHT')
    .map(observance)
    .filter((item): item is ICalendarObservance => item !== null);
  return { id, observances };
}
