import type { ColumnEdge } from './column-edge';
import type { DayBlock } from './day-block';
import type { SchedulerDay } from './scheduler-day';
import type { SchedulerGroup } from './scheduler-group';

/** A column of the view: a day, in a group. The same object stays at its place while the dates change. */
export interface SchedulerColumn {
  /** Its place in the view (in the month: over all the weeks). */
  index: number;
  day: SchedulerDay;
  group: SchedulerGroup | null;
  edge: ColumnEdge;
  /** Its day is a work day for its group, and the work hours there. */
  work: boolean;
  workStart: number;
  workEnd: number;
  /** The blocked times of its day there; `blocked`: one takes the whole day. */
  blocks: DayBlock[];
  blocked: boolean;
  /** Its group's names, read out with its cells; empty without groups. */
  label: string;
}
