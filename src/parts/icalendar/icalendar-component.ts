import type { ICalendarProperty } from './icalendar-property';

/** A `BEGIN:…`/`END:…` block of a file, with the blocks inside it. */
export interface ICalendarComponent {
  /** Upper case. */
  name: string;
  properties: ICalendarProperty[];
  children: ICalendarComponent[];
}
