/** The fields of an appointment object the scheduler reads. */
export interface SchedulerFields {
  /** Default `'id'`: what tells two appointments apart. */
  key: string;
  /** Default `'startDate'`: a `Date`, an ISO text or a number of milliseconds. */
  start: string;
  /** Default `'endDate'`. */
  end: string;
  /** Default `'text'`. */
  text: string;
  /** Default `'allDay'`. */
  allDay: string;
  /** Default `'description'`. */
  description: string;
  /** Default `'color'`: a CSS color of its own. */
  color: string;
  /** Default `'disabled'`. */
  disabled: string;
  /** Default `'visible'`: `false` leaves it out. */
  visible: string;
  /** Default `'allowDrag'`: `false` keeps it in place, whatever `editing` says. */
  allowDrag: string;
  /** Default `'allowResize'`. */
  allowResize: string;
  /** Default `'allowEdit'`: `false` opens no form for it. */
  allowEdit: string;
  /** Default `'allowDelete'`. */
  allowDelete: string;
  /** Default `'recurrenceRule'`: how it repeats, an RFC 5545 rule (`FREQ=WEEKLY;BYDAY=MO,WE`); empty for once. */
  recurrenceRule: string;
  /** Default `'recurrenceException'`: the times of a series omitted (`EXDATE`), a text apart by commas or a list of dates. */
  recurrenceException: string;
  /** Default `'recurrenceId'`: on an occurrence changed apart from its series, the key of that series. */
  recurrenceId: string;
  /** Default `'startDateTimeZone'`: the IANA time zone the start is set in (and a series repeats in); empty for the scheduler's. */
  startTimeZone: string;
  /** Default `'endDateTimeZone'`: the time zone the end is set in; empty for the start's. */
  endTimeZone: string;
}
