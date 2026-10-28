import type { EventArgs } from '@motifx/core';
import type { Scheduler } from './Scheduler';

/**
 * An appointment is being moved or resized. `start`, `end` and `allDay` are where it would go.
 * `cancel = true`: on `…Start` it does not begin, on `moving` and `resizing` it may not go there
 * (it shows so), on `moveEnd` and `resizeEnd` it goes back.
 */
export interface DragEventArgs<T = unknown> extends EventArgs {
  appointment: T;
  start: Date;
  end: Date;
  allDay: boolean;
  /** A copy is dropped (Ctrl), the appointment itself stays. */
  copy: boolean;
  /** By the keys, not the pointer. */
  byKeys: boolean;
  source: Scheduler<T>;
}
