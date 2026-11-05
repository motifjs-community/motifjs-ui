import type { EventArgs } from '@motifx/core';
import type { Draggable } from './Draggable';
import type { DropTarget } from './DropTarget';

/** A draggable came over a target (`cancel = true` refuses it), left it, or was dropped on it. */
export interface DropEventArgs extends EventArgs {
    draggable: Draggable;
    /** The draggable's `data`, as given. */
    data: unknown;
    source: DropTarget;
    event?: Event;
}
