import { formatRuleDate } from '../recurrence/format-rule-date';
import type { ICalendarDate } from './icalendar-date';
import type { ICalendarProperty } from './icalendar-property';

/** A date property in the date's form: `VALUE=DATE`, its `TZID`, `Z` for UTC, or a floating time. Several dates take the first one's form. */
export function dateProperty(name: string, dates: readonly ICalendarDate[]): ICalendarProperty {
  const first = dates[0];
  const params: Record<string, string> = {};
  if (first.dateOnly) params.VALUE = 'DATE';
  else if (first.zone && !first.utc) params.TZID = first.zone;
  return { name, params, value: dates.map(formatRuleDate).join(',') };
}
