import type { EventArgs } from '@motifx/core';
import type { Scheduler } from './Scheduler';

/**
 * Provides data while an appointment is moved or resized. `start`, `end` and `allDay` are its new
 * position. Set `cancel = true` on `…Start` to prevent the drag, on `moving` and `resizing` to mark
 * the position as invalid, or on `moveEnd` and `resizeEnd` to revert. On `moving` and `resizing`,
 * `cancel` starts as `true` where the time is not free, and `false` allows the move.
 */
export interface DragEventArgs<T = unknown> extends EventArgs {
  appointment: T;
  start: Date;
  end: Date;
  allDay: boolean;
  /** Indicates that a copy is dropped (Ctrl) and the appointment itself stays in place. */
  copy: boolean;
  /** Indicates that the keyboard is used, not the pointer. */
  byKeys: boolean;
  /** In another group, the values its resource fields would get, by field. `null` if they do not change. */
  resources: Record<string, unknown> | null;
  source: Scheduler<T>;
}
