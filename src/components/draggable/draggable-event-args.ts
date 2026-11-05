import type { EventArgs } from '@motifx/core';
import type { Draggable } from './Draggable';
import type { DropTarget } from './DropTarget';

/** A drag begins (`cancel = true` keeps it in place), goes on, is about to end (`cancel` brings it back), or ended. */
export interface DraggableEventArgs extends EventArgs {
    /** Where the draggable stands, in pixels from where it was laid out. */
    x: number;
    y: number;
    /** The drop target under the pointer that takes it, `null` for none. */
    target: DropTarget | null;
    /** By the pointer or a key, else from the props. */
    byUser: boolean;
    /** At the end: a target took it. */
    dropped?: boolean;
    source: Draggable;
    event?: Event;
}
