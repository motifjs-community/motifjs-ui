/**
 * How a view arranges its days: one column per day with the hours running down (`day`, `week`,
 * `workWeek`), a month of weeks, one row per resource with time running along it (`timeline…`), or a
 * list of upcoming days (`agenda`).
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
