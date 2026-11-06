/**
 * The result of `importICalendar`: the appointments added, those updated (an event whose UID matches
 * an appointment's key), and those the data layer rejected.
 */
export interface ICalendarImportResult<T = unknown> {
  added: T[];
  updated: T[];
  failed: Partial<T>[];
}
