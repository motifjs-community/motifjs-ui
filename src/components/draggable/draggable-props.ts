import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { DraggableEventArgs } from './draggable-event-args';

/** The way a draggable may move. */
export type DragAxis = 'both' | 'x' | 'y';

/** Where a draggable stands, in pixels from where it was laid out. */
export interface DragPosition {
    x: number;
    y: number;
}

/** Props of `Draggable`. Each one is also a settable property; a function is followed. */
export interface DraggableProps extends ControlProps {
    /** Default `'both'`. */
    axis?: Bind<DragAxis>;
    /** The draggable stays inside this: its parent, or an element it lies in. Default `null`, no limit. */
    boundary?: Bind<'parent' | HTMLElement | null>;
    /** A selector inside the draggable: only a press there drags it, and it takes the keys. Default `null`, the whole draggable. */
    handle?: Bind<string | null>;
    /** A copy follows the pointer and the draggable stays where it is; for a drop target to take. Default `false`. */
    clone?: Bind<boolean>;
    /** Drop targets of the same group take it. Default `null`. */
    group?: Bind<string | null>;
    /** Anything of your own, given to the drop target. */
    data?: unknown;
    /** Pixels an arrow key moves it by. Default `10`. */
    step?: Bind<number>;
    /** Where it stands: given, it is applied; after every drag or key the new place is written to `x-model`. */
    position?: Bind<DragPosition | null>;
    /** A drag is about to begin; cancelable. */
    onDragStarting?: (e: DraggableEventArgs) => void;
    /** It is being dragged (`x`, `y`, the `target` under the pointer). */
    onDragging?: (e: DraggableEventArgs) => void;
    /** The pointer let go; `cancel = true` brings it back where it started. */
    onDragEnding?: (e: DraggableEventArgs) => void;
    /** The drag ended: where it stands, and whether a target took it (`dropped`). */
    onDragEnded?: (e: DraggableEventArgs) => void;
}
