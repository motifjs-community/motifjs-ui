import type { SchedulerViewType } from '../scheduler-view-type';

/** The layout a view type uses: day columns with hours (`time`), the month, a timeline, or the agenda. */
export type ViewKind = 'time' | 'month' | 'timeline' | 'agenda';

export function viewKind(type: SchedulerViewType): ViewKind {
  if (type === 'month') return 'month';
  if (type === 'agenda') return 'agenda';
  return type.startsWith('timeline') ? 'timeline' : 'time';
}

/** A view whose cells are whole days (the month, the timeline month): no hours. */
export function dayCells(type: SchedulerViewType): boolean {
  return type === 'month' || type === 'timelineMonth';
}
