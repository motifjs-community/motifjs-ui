import type { EventArgs } from '@motifx/core';
import type { Draggable } from './Draggable';
import type { DropTarget } from './DropTarget';

/** The drag event arguments. `cancel = true` prevents a drag from starting, or returns the draggable when it ends. */
export interface DraggableEventArgs extends EventArgs {
    /** The position of the draggable, in pixels from its layout position. */
    x: number;
    y: number;
    /** The drop target under the pointer that accepts it, or `null` if there is none. */
    target: DropTarget | null;
    /** `true` when the pointer or a key moved it, `false` when the props did. */
    byUser: boolean;
    /** At the end of a drag, indicates whether a target accepted it. */
    dropped?: boolean;
    source: Draggable;
    event?: Event;
}
