import type { LinePiece } from './line-piece';
import type { SchedulerGroup } from './scheduler-group';

/** A row of a timeline: a group of resources (one row without groups). The same object stays at its place while its group does. */
export interface TimelineRow<T> {
  index: number;
  key: string;
  group: SchedulerGroup | null;
  /** The column of its first day: its cells are the columns from here, a day each. */
  first: number;
  /** Per level of the groups: this row is the first of its item there (its head cell shows the name). */
  starts: boolean[];
  /** The outer item changes here (the line over it is the group's divider). */
  edge: 'outer' | 'inner' | '';
  /** Its group's names, read out with its cells; empty without groups. */
  label: string;
  /** Its appointments, each on a lane, and how many lanes they take (with the line of "+N more"). */
  pieces: LinePiece<T>[];
  lanes: number;
  /** Its height in pixels: the lanes it takes, or the least a row has. */
  height: number;
  /** The days with appointments omitted (by the day's index) and how many, and the lane "+N more" stands on. */
  more: { day: number; count: number }[];
  moreLane: number;
}
