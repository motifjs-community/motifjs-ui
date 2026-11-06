/** A property of an iCalendar file as written: `NAME;PARAM=VALUE:value`. */
export interface ICalendarProperty {
  /** The name in upper case. */
  name: string;
  /** Parameters by upper case name, without the quotes around a value. */
  params: Record<string, string>;
  /** The value as written, still escaped. */
  value: string;
}
