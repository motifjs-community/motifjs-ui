import { TimeZone } from '../dates/time-zone';
import { escapeText } from './escape-text';
import { eventLines } from './event-lines';
import { foldLine } from './fold-line';
import type { ICalendarDate } from './icalendar-date';
import type { ICalendarEvent } from './icalendar-event';
import type { ICalendarWriteOptions } from './icalendar-write-options';
import { timeZoneLines } from './time-zone-lines';

const datesOf = (event: ICalendarEvent): ICalendarDate[] =>
  [event.start, event.end, event.recurrenceId, ...event.exceptions].filter((date): date is ICalendarDate => date !== null);

/** The years a zone's `VTIMEZONE` covers: those of the events' dates in it, and one more; the stamp's year when there are none. */
function yearsOf(zone: string, events: readonly ICalendarEvent[], stamp: number): [number, number] {
  const years = events
    .flatMap(datesOf)
    .filter((date) => date.zone === zone)
    .map((date) => new Date(date.time).getUTCFullYear());
  const first = years.length ? Math.min(...years) : new Date(stamp).getUTCFullYear();
  const last = years.length ? Math.max(...years) : first;
  return [first, last + 1];
}

/**
 * Writes events as an iCalendar file (RFC 5545): a `VTIMEZONE` for each zone, then one `VEVENT`
 * per event. Text is escaped, lines are folded at 75 octets and end with CRLF.
 *
 * @example
 * const text = writeICalendar({ events, name: 'Team', timeZones: ['Europe/Istanbul'] });
 */
export function writeICalendar(options: ICalendarWriteOptions): string {
  const stamp = options.stamp ?? Date.now();
  const events = options.events;
  const zones = (options.timeZones ?? [...new Set(events.flatMap(datesOf).map((date) => date.zone))]).filter((zone) => zone && TimeZone.isValid(zone));
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:${options.prodId ?? '-//MotifJS//Scheduler//EN'}`,
    'CALSCALE:GREGORIAN',
    `METHOD:${options.method ?? 'PUBLISH'}`,
  ];
  if (options.name) lines.push(`X-WR-CALNAME:${escapeText(options.name)}`);
  for (const zone of zones) lines.push(...timeZoneLines(zone, ...yearsOf(zone, events, stamp)));
  events.forEach((event, index) => lines.push(...eventLines(event, stamp, index)));
  lines.push('END:VCALENDAR');
  return `${lines.map(foldLine).join('\r\n')}\r\n`;
}
