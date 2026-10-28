/**
 * How a view lays out its days: a column per day with the hours down (`day`, `week`, `workWeek`), a
 * month of weeks, a row per resource with the time running along it (`timeline…`), or a list of the
 * coming days (`agenda`).
 */
export type SchedulerViewType =
  | 'day'
  | 'week'
  | 'workWeek'
  | 'month'
  | 'timelineDay'
  | 'timelineWeek'
  | 'timelineWorkWeek'
  | 'timelineMonth'
  | 'agenda';
