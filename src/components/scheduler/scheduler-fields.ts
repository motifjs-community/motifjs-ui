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
  /** Default `'color'`: a CSS colour of its own. */
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
}
