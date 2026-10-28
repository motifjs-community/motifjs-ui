/** What `importICalendar` did: the appointments added, the ones changed (an event whose UID was there already), the ones the data layer refused. */
export interface ICalendarImportResult<T = unknown> {
  added: T[];
  updated: T[];
  failed: Partial<T>[];
}
