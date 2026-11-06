import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { DraggableEventArgs } from './draggable-event-args';

/** The directions a draggable can move in. */
export type DragAxis = 'both' | 'x' | 'y';

/** The position of a draggable, in pixels from its layout position. */
export interface DragPosition {
    x: number;
    y: number;
}

/** Props of `Draggable`. Each prop is also a settable property, and a function is tracked. */
export interface DraggableProps extends ControlProps {
    /** The directions it can move in. The default is `'both'`. */
    axis?: Bind<DragAxis>;
    /** The area it stays inside: its parent, or an element that contains it. The default is `null`, no limit. */
    boundary?: Bind<'parent' | HTMLElement | null>;
    /**
   * A selector inside the draggable. Only this part starts a drag, and it receives keyboard input.
   * The default is `null`, the whole draggable.
   */
    handle?: Bind<string | null>;
    /** A copy follows the pointer and the draggable stays in place, ready for a drop target. The default is `false`. */
    clone?: Bind<boolean>;
    /** Drop targets in the same group accept it. The default is `null`. */
    group?: Bind<string | null>;
    /** Custom data passed to the drop target. */
    data?: unknown;
    /** The number of pixels an arrow key moves it. The default is `10`. */
    step?: Bind<number>;
    /** The position. When set, it is applied, and after every drag or key press the new position is written to `x-model`. */
    position?: Bind<DragPosition | null>;
    /** Occurs before a drag starts. Set `cancel = true` to prevent it. */
    onDragStarting?: (e: DraggableEventArgs) => void;
    /** Occurs during a drag (`x`, `y`, and the `target` under the pointer). */
    onDragging?: (e: DraggableEventArgs) => void;
    /** Occurs when the pointer is released. Set `cancel = true` to return it to where it started. */
    onDragEnding?: (e: DraggableEventArgs) => void;
    /** Occurs when the drag ends, with its position and whether a target accepted it (`dropped`). */
    onDragEnded?: (e: DraggableEventArgs) => void;
}
