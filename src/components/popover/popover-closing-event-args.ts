import type { EventArgs } from '@motifx/core';
import type { Popover } from './Popover';
import type { PopoverCloseReason } from './popover-close-reason';

/** The popover is about to close. `cancel = true` keeps it open. */
export interface PopoverClosingEventArgs extends EventArgs {
    reason: PopoverCloseReason;
    source: Popover;
}
