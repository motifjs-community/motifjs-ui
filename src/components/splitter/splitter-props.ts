import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { LayoutOrientation } from '../layout/layout-orientation';
import type { SplitterCollapseEventArgs } from './splitter-collapse-event-args';
import type { SplitterResizeEventArgs } from './splitter-resize-event-args';

/** Props of `Splitter`. Each one is also a settable property; a function is followed. */
export interface SplitterProps extends ControlProps {
    /** `horizontal`: the panes side by side; `vertical`: one under the other. Default `'horizontal'`. */
    orientation?: Bind<LayoutOrientation>;
    /** The handles can be dragged and moved with the keys (a pane's own `resizable` wins). Default `true`. */
    resizable?: Bind<boolean>;
    /** Every pane can be hidden from the handle next to it (a pane's own `collapsible` wins). Default `false`. */
    collapsible?: Bind<boolean>;
    /** Pixels an arrow key moves a handle. Default `10`. */
    step?: Bind<number>;
    /** The panes' sizes in pane order (pixels, a share or `null`): given, they take the place of the panes' own `size`. After a drag or a key the pixels are written to `x-model`. */
    sizes?: Bind<readonly (number | string | null)[] | null>;
    /** A handle is being dragged; `sizes` are the pixels now. */
    onResizing?: (e: SplitterResizeEventArgs) => void;
    /** A drag ended or a key moved a handle. */
    onResized?: (e: SplitterResizeEventArgs) => void;
    /** A pane is about to be hidden or shown again; cancelable. */
    onCollapsing?: (e: SplitterCollapseEventArgs) => void;
    onCollapsed?: (e: SplitterCollapseEventArgs) => void;
}
