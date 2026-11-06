import type { EventArgs } from '@motifx/core';
import type { Draggable } from './Draggable';
import type { DropTarget } from './DropTarget';

/** The arguments of a drop target's events. In `onDragEntering`, set `cancel = true` to reject the draggable. */
export interface DropEventArgs extends EventArgs {
    draggable: Draggable;
    /** The draggable's `data`, exactly as provided. */
    data: unknown;
    source: DropTarget;
    event?: Event;
}
