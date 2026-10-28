import { TimeZone } from '../dates/time-zone';
import type { ICalendarDate } from './icalendar-date';

const DAY = 86_400_000;

const zoneOf = (name: string) => (name && TimeZone.isValid(name) ? TimeZone.of(name) : null);

/** A date in the form of another (a date only, its zone, UTC or floating), turned through IANA zones where it can be; else its fields are kept. */
export function sameForm(date: ICalendarDate, like: ICalendarDate): ICalendarDate {
  const utc = like.utc && !like.dateOnly;
  const zone = like.dateOnly || like.utc ? '' : like.zone;
  if (date.utc === utc && date.dateOnly === like.dateOnly && date.zone === zone) return date;
  const from = date.dateOnly ? null : zoneOf(date.zone);
  const moment = date.utc ? date.time : from ? from.moment(date.time) : null;
  const to = zoneOf(like.zone);
  let time = date.time;
  if (moment !== null) time = utc ? moment : to ? to.wall(moment) : date.time;
  if (like.dateOnly) time = Math.floor(time / DAY) * DAY;
  return { time, utc, dateOnly: like.dateOnly, zone };
}
