import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { WindowEdge } from '../../parts/window/window-edge';
import type { ResizeEventArgs } from './resize-event-args';

/** A side or a corner the box is resized from; `start` and `end` follow the reading direction. */
export type ResizeEdge = WindowEdge;

/** Which handles the box has: every side and corner, the sides, the corners, or a list of them. */
export type ResizeHandles = 'all' | 'edges' | 'corners' | readonly ResizeEdge[];

/** The box's size in pixels. */
export interface ResizeSize {
    width: number;
    height: number;
}

/** Props of `Resizable`. Each prop is also a settable property, and a function is tracked. */
export interface ResizableProps extends ControlProps {
    /** Default `'all'`. */
    handles?: Bind<ResizeHandles>;
    /** The least width and height, in pixels. Default `30`. */
    minWidth?: Bind<number>;
    minHeight?: Bind<number>;
    /** The most width and height, in pixels; `null` for no limit. Default `null`. */
    maxWidth?: Bind<number | null>;
    maxHeight?: Bind<number | null>;
    /** The box stays inside this: its parent, or an element it lies in. Default `null`, no limit. */
    area?: Bind<'parent' | HTMLElement | null>;
    /** The width and the height keep their ratio. Default `false`. */
    keepAspectRatio?: Bind<boolean>;
    /** Pixels an arrow key changes a side by. Default `10`. */
    step?: Bind<number>;
    /** The width to start with, a CSS length or pixels. Without one the content decides. */
    width?: Bind<number | string | null>;
    height?: Bind<number | string | null>;
    /** The size in pixels: given, it is applied; after every resize the new one is written to `x-model`. */
    size?: Bind<ResizeSize | null>;
    /** A resize is about to begin from a handle; cancelable. */
    onResizeStarting?: (e: ResizeEventArgs) => void;
    /** The box is being resized. */
    onResizing?: (e: ResizeEventArgs) => void;
    /** A resize ended (the pointer let go, or a key moved a side). */
    onResized?: (e: ResizeEventArgs) => void;
}
