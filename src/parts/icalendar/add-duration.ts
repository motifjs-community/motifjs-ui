import { TimeZone } from '../dates/time-zone';
import type { ICalendarDate } from './icalendar-date';

const DAY = 86_400_000;

/**
 * A date with a duration added, in its form: days on the wall clock; hours, minutes and seconds as
 * exact time in an IANA zone, on the wall clock otherwise. A date only takes whole days.
 */
export function addDuration(date: ICalendarDate, duration: { days: number; time: number }): ICalendarDate {
  if (date.dateOnly) return { ...date, time: date.time + duration.days * DAY };
  const wall = date.time + duration.days * DAY;
  if (date.utc || !date.zone || !TimeZone.isValid(date.zone)) return { ...date, time: wall + duration.time };
  const zone = TimeZone.of(date.zone);
  return { ...date, time: zone.wall(zone.moment(wall) + duration.time) };
}
