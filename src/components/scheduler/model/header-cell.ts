import type { ColumnEdge } from './column-edge';
import type { GroupResource } from './group-resource';
import type { SchedulerDay } from './scheduler-day';

/** A head over columns: a date (a weekday in the month), or a resource of the groups. */
export interface HeaderCell {
  key: string;
  /** The first column it is over (in the month: of a week), and how many. */
  first: number;
  span: number;
  level: number;
  edge: ColumnEdge;
  day: SchedulerDay | null;
  resource: GroupResource | null;
  /** The group's values up to its level. */
  values: Record<string, unknown>;
}
