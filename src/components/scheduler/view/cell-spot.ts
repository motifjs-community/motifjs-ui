import type { SchedulerColumn } from '../model/scheduler-column';
import type { TimeSlot } from '../model/time-slot';

/** Where a cell of the day views stands: its place in its row, the column shown there now (none past the last), its time row (`null`: all day). */
export interface CellSpot {
  place: number;
  column: SchedulerColumn | undefined;
  slot: TimeSlot | null;
}
