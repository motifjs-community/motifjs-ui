import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { DropEventArgs } from './drop-event-args';

/** Props of `DropTarget`. Each prop is also a settable property, and a function is tracked. */
export interface DropTargetProps extends ControlProps {
    /** Accepts draggables in this group. `null` accepts those without a group. The default is `null`. */
    group?: Bind<string | null>;
    /** Occurs when a draggable enters. Set `cancel = true` to reject it. */
    onDragEntering?: (e: DropEventArgs) => void;
    onDragLeaving?: (e: DropEventArgs) => void;
    /** Occurs when a draggable is dropped on it. Your code moves the data. */
    onDropped?: (e: DropEventArgs) => void;
}
