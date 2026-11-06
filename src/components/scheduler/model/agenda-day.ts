import type { AgendaPiece } from './agenda-piece';
import type { SchedulerDay } from './scheduler-day';
import type { SchedulerGroup } from './scheduler-group';

/** A day of the agenda (in a group, with groups) and its appointments in time order; a day with none is omitted. */
export interface AgendaDay<T> {
  key: string;
  day: SchedulerDay;
  group: SchedulerGroup | null;
  /** The first day of its group: its group's head stands over it. */
  first: boolean;
  /** Its group's names; empty without groups. */
  label: string;
  items: AgendaPiece<T>[];
}
