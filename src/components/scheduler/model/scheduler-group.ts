import type { GroupResource } from './group-resource';

/** A group of columns: one item of each resource kind grouped by, outer first. */
export interface SchedulerGroup {
  index: number;
  /** Its values joined, the same while the items stay. */
  key: string;
  /** Its values by field (`{ roomId: 1, ownerId: 3 }`). */
  values: Record<string, unknown>;
  path: GroupResource[];
  /** Its work hours and days: the innermost item's own, else the scheduler's. */
  workStart: number;
  workEnd: number;
  workDays: readonly number[];
}
