/** The fields of an appointment object the scheduler reads. */
export interface SchedulerFields {
  /** The value that identifies an appointment. The default is `'id'`. */
  key: string;
  /** A `Date`, an ISO string or a number of milliseconds. The default is `'startDate'`. */
  start: string;
  /** The default is `'endDate'`. */
  end: string;
  /** The default is `'text'`. */
  text: string;
  /** The default is `'allDay'`. */
  allDay: string;
  /** The default is `'description'`. */
  description: string;
  /** A custom CSS color. The default is `'color'`. */
  color: string;
  /** The default is `'disabled'`. */
  disabled: string;
  /** `false` omits the appointment. The default is `'visible'`. */
  visible: string;
  /** `false` keeps it in place, regardless of `editing`. The default is `'allowDrag'`. */
  allowDrag: string;
  /** The default is `'allowResize'`. */
  allowResize: string;
  /** `false` opens no form for it. The default is `'allowEdit'`. */
  allowEdit: string;
  /** The default is `'allowDelete'`. */
  allowDelete: string;
  /**
   * The recurrence, as an RFC 5545 rule (`FREQ=WEEKLY;BYDAY=MO,WE`). Empty for a single appointment.
   * The default is `'recurrenceRule'`.
   */
  recurrenceRule: string;
  /**
   * The excluded times of a series (`EXDATE`), as comma-separated text or a list of dates. The default
   * is `'recurrenceException'`.
   */
  recurrenceException: string;
  /** On an individually edited occurrence, the key of its series. The default is `'recurrenceId'`. */
  recurrenceId: string;
  /**
   * The IANA time zone of the start, in which a series also recurs. Empty for the scheduler's zone.
   * The default is `'startDateTimeZone'`.
   */
  startTimeZone: string;
  /** The time zone of the end. Empty for the start's zone. The default is `'endDateTimeZone'`. */
  endTimeZone: string;
}
