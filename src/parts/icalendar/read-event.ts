import { addDuration } from './add-duration';
import type { ICalendarComponent } from './icalendar-component';
import type { ICalendarDate } from './icalendar-date';
import type { ICalendarEvent } from './icalendar-event';
import { readDuration } from './read-duration';
import { readICalendarDates } from './read-icalendar-dates';
import { unescapeText } from './unescape-text';

/** Read once each; a second line of one goes to `other`. */
const SINGLE = ['UID', 'DTSTART', 'DTEND', 'DURATION', 'RECURRENCE-ID', 'SUMMARY', 'DESCRIPTION', 'LOCATION', 'RRULE', 'STATUS', 'DTSTAMP', 'SEQUENCE'];

/** An event from its `VEVENT` block; `null` when it has no start it can read. */
export function readEvent(component: ICalendarComponent): ICalendarEvent | null {
  const found = new Map<string, string>();
  const dates = new Map<string, ICalendarDate | null>();
  const exceptions: ICalendarDate[] = [];
  const other: ICalendarEvent['other'] = [];
  for (const property of component.properties) {
    if (property.name === 'EXDATE') {
      exceptions.push(...readICalendarDates(property));
    } else if (SINGLE.includes(property.name) && !found.has(property.name)) {
      found.set(property.name, property.value);
      if (property.name.startsWith('DT') || property.name === 'RECURRENCE-ID') dates.set(property.name, readICalendarDates(property)[0] ?? null);
    } else {
      other.push(property);
    }
  }
  const start = dates.get('DTSTART');
  if (!start) return null;
  let end = dates.get('DTEND') ?? null;
  if (!end) {
    const duration = readDuration(found.get('DURATION') ?? '');
    end = duration ? addDuration(start, duration) : addDuration(start, { days: start.dateOnly ? 1 : 0, time: 0 });
  }
  const text = (name: string) => unescapeText(found.get(name) ?? '');
  const sequence = (found.get('SEQUENCE') ?? '').trim();
  return {
    uid: (found.get('UID') ?? '').trim(),
    start,
    end,
    summary: text('SUMMARY'),
    description: text('DESCRIPTION'),
    location: text('LOCATION'),
    rule: (found.get('RRULE') ?? '').trim(),
    exceptions,
    recurrenceId: dates.get('RECURRENCE-ID') ?? null,
    status: (found.get('STATUS') ?? '').trim().toUpperCase(),
    stamp: dates.get('DTSTAMP')?.time ?? null,
    sequence: /^\d+$/.test(sequence) ? Number(sequence) : null,
    other,
  };
}
