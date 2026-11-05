import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { DropEventArgs } from './drop-event-args';

/** Props of `DropTarget`. Each one is also a settable property; a function is followed. */
export interface DropTargetProps extends ControlProps {
    /** Takes the draggables of this group; `null` takes those without one. Default `null`. */
    group?: Bind<string | null>;
    /** A draggable came over it; `cancel = true` refuses it. */
    onDragEntering?: (e: DropEventArgs) => void;
    onDragLeaving?: (e: DropEventArgs) => void;
    /** A draggable was dropped on it: your data is yours to move. */
    onDropped?: (e: DropEventArgs) => void;
}
