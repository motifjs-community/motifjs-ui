import { TimeZone } from '../dates/time-zone';
import type { ICalendarDate } from './icalendar-date';
import type { ICalendarTimeZone } from './icalendar-time-zone';
import { observanceMoment } from './observance-moment';

/**
 * The moment a date of a file names. A UTC date is already a moment, and a date only returns the wall
 * clock time of its midnight (all-day events are up to the caller). A zone is an IANA name, or otherwise a
 * `VTIMEZONE` of the file by that id. A floating time, or a zone neither recognizes, uses `fallback`
 * (an IANA name, or `null` for the browser's own).
 *
 * @example
 * icalendarMoment(event.start, calendar.timeZones, 'Europe/Istanbul')
 */
export function icalendarMoment(date: ICalendarDate, zones: readonly ICalendarTimeZone[], fallback: string | null): number {
  if (date.utc || date.dateOnly) return date.time;
  if (date.zone && TimeZone.isValid(date.zone)) return TimeZone.of(date.zone).moment(date.time);
  const written = date.zone ? zones.find((zone) => zone.id === date.zone) : undefined;
  const moment = written ? observanceMoment(written.observances, date.time) : null;
  return moment ?? TimeZone.of(fallback).moment(date.time);
}
