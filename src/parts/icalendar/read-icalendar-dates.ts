import { parseRuleDate } from '../recurrence/parse-rule-date';
import type { ICalendarDate } from './icalendar-date';
import type { ICalendarProperty } from './icalendar-property';

/** The dates of a date property (`DTSTART`, a comma list of `EXDATE`), with its `VALUE=DATE` and `TZID`; ones it cannot read are left out. */
export function readICalendarDates(property: ICalendarProperty): ICalendarDate[] {
  const zone = (property.params.TZID ?? '').trim().replace(/^\//, '');
  const out: ICalendarDate[] = [];
  for (const part of property.value.split(',')) {
    // A period (`start/end`) counts by its start.
    const date = parseRuleDate(part.split('/')[0]);
    if (!date) continue;
    out.push({ ...date, zone: date.utc || date.dateOnly ? '' : zone });
  }
  return out;
}
