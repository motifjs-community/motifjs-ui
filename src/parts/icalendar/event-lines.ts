import { formatRuleDate } from '../recurrence/format-rule-date';
import { dateProperty } from './date-property';
import { escapeText } from './escape-text';
import { formatContentLine } from './format-content-line';
import type { ICalendarEvent } from './icalendar-event';
import { sameForm } from './same-form';

/** The `VEVENT` of an event as content lines, not folded yet; `stamp` is its `DTSTAMP` when it has none, `index` makes a `UID` for one without. */
export function eventLines(event: ICalendarEvent, stamp: number, index: number): string[] {
  const lines = ['BEGIN:VEVENT'];
  const uid = event.uid || `${formatRuleDate(event.start)}-${index + 1}@motifjs`;
  lines.push(`UID:${uid}`);
  lines.push(`DTSTAMP:${formatRuleDate({ time: event.stamp ?? stamp, utc: true, dateOnly: false })}`);
  lines.push(formatContentLine(dateProperty('DTSTART', [event.start])));
  if (event.end) lines.push(formatContentLine(dateProperty('DTEND', [event.end])));
  if (event.recurrenceId) lines.push(formatContentLine(dateProperty('RECURRENCE-ID', [event.recurrenceId])));
  for (const [name, text] of [['SUMMARY', event.summary], ['DESCRIPTION', event.description], ['LOCATION', event.location]]) {
    if (text) lines.push(`${name}:${escapeText(text)}`);
  }
  if (event.rule) lines.push(`RRULE:${event.rule.replace(/^RRULE:/i, '')}`);
  if (event.exceptions.length) {
    lines.push(formatContentLine(dateProperty('EXDATE', event.exceptions.map((date) => sameForm(date, event.start)))));
  }
  if (event.status) lines.push(`STATUS:${event.status.toUpperCase()}`);
  if (event.sequence !== null) lines.push(`SEQUENCE:${event.sequence}`);
  lines.push(...event.other.map(formatContentLine));
  lines.push('END:VEVENT');
  return lines;
}
