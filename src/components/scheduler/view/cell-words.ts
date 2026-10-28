import type { SchedulerColumn } from '../model/scheduler-column';
import type { SchedulerHost } from './scheduler-host';

/** What a cell says besides its time: its group's names before, and the blocked time it is in after. */
export function cellWords<T>(host: SchedulerHost<T>, column: SchedulerColumn, slot: number): { group: string; block: string } {
  const block = host.model.blockAt(column.index, slot);
  const words = block ? (block.text ? host.text('schedulerBlocked', { text: block.text }) : host.text('schedulerUnavailable')) : '';
  return { group: column.label ? `${column.label}, ` : '', block: words ? `, ${words}` : '' };
}
