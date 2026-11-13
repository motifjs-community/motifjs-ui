import type { Bind, ComponentBase } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { WindowEdge } from '../../parts/window/window-edge';
import type { ResizeEventArgs } from './resize-event-args';

/** An edge or corner the box is resized from. `start` and `end` follow the reading direction. */
export type ResizeEdge = WindowEdge;

/** The handles of the box: all edges and corners, the edges, the corners, or a list of them. */
export type ResizeHandles = 'all' | 'edges' | 'corners' | readonly ResizeEdge[];

/** The size of the box, in pixels. */
export interface ResizeSize {
    width: number;
    height: number;
}

/** Props of `Resizable`. Each prop is also a settable property, and a function is tracked. */
export interface ResizableProps extends ControlProps {
    /** The handles of the box. The default is `'all'`. */
    handles?: Bind<ResizeHandles>;
    /** The minimum width and height, in pixels. The default is `30`. */
    minWidth?: Bind<number>;
    minHeight?: Bind<number>;
    /** The maximum width and height, in pixels. `null` means no limit. The default is `null`. */
    maxWidth?: Bind<number | null>;
    maxHeight?: Bind<number | null>;
    /** The area the box stays inside: its parent, or a component that contains it. The default is `null`, no limit. */
    area?: Bind<'parent' | ComponentBase | null>;
    /** Preserves the ratio of width to height. The default is `false`. */
    keepAspectRatio?: Bind<boolean>;
    /** The number of pixels an arrow key changes an edge. The default is `10`. */
    step?: Bind<number>;
    /** The initial width, as a CSS length or in pixels. Without it, the content determines the size. */
    width?: Bind<number | string | null>;
    height?: Bind<number | string | null>;
    /** The size in pixels. When set, it is applied, and after every resize the new size is written to `x-model`. */
    size?: Bind<ResizeSize | null>;
    /** Occurs before a resize starts from a handle. Set `cancel = true` to prevent it. */
    onResizeStarting?: (e: ResizeEventArgs) => void;
    /** Occurs while the box is being resized. */
    onResizing?: (e: ResizeEventArgs) => void;
    /** Occurs when a resize ends, either when the pointer is released or when a key moves an edge. */
    onResized?: (e: ResizeEventArgs) => void;
}
