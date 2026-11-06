import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { LayoutOrientation } from '../layout/layout-orientation';
import type { SplitterCollapseEventArgs } from './splitter-collapse-event-args';
import type { SplitterResizeEventArgs } from './splitter-resize-event-args';

/** Props of `Splitter`. Each prop is also a settable property, and a function is tracked. */
export interface SplitterProps extends ControlProps {
    /** `horizontal` places the panes side by side, and `vertical` stacks them. The default is `'horizontal'`. */
    orientation?: Bind<LayoutOrientation>;
    /** Lets users move the handles. A pane's own `resizable` takes precedence. The default is `true`. */
    resizable?: Bind<boolean>;
    /**
     * Lets every pane be collapsed from its adjacent handle. A pane's own `collapsible` takes precedence.
     * The default is `false`.
     */
    collapsible?: Bind<boolean>;
    /** The distance an arrow key moves a handle, in pixels. The default is `10`. */
    step?: Bind<number>;
    /**
     * The pane sizes in order (pixels, a percentage or `null`). When set, they replace each pane's own `size`.
     * After a drag or key press, the sizes in pixels are written to `x-model`.
     */
    sizes?: Bind<readonly (number | string | null)[] | null>;
    /** Occurs while a handle is dragged. `sizes` holds the current sizes in pixels. */
    onResizing?: (e: SplitterResizeEventArgs) => void;
    /** Occurs after a drag ends or a key moves a handle. */
    onResized?: (e: SplitterResizeEventArgs) => void;
    /** Occurs before a pane is collapsed or expanded. Set `cancel = true` to keep the current state. */
    onCollapsing?: (e: SplitterCollapseEventArgs) => void;
    onCollapsed?: (e: SplitterCollapseEventArgs) => void;
}
