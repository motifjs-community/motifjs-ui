import type { EventArgs } from '@motifx/core';
import type { Popover } from './Popover';
import type { PopoverCloseReason } from './popover-close-reason';

/** Provides data for the event that occurs before the popover closes. Set `cancel = true` to keep it open. */
export interface PopoverClosingEventArgs extends EventArgs {
    reason: PopoverCloseReason;
    source: Popover;
}
