import type { Bind, ComponentBase } from '@motifx/core';
import type { PanelProps } from '../layout/panel-props';

/** Props of `SplitPane`, one pane of a `Splitter`: a `Panel` (padding, scrolling, a frame) with its place in the split. */
export interface SplitPaneProps extends PanelProps {
    /** Identifies the pane. The JSX `key` is also read. */
    key?: Bind<string>;
    /**
     * Pixels, a percentage (`'30%'`) of the space divided by percentages, or `null` for an equal share of what
     * remains. The default is `null`.
     */
    size?: Bind<number | string | null>;
    /** The minimum size, in pixels. The default is `0`. */
    minSize?: Bind<number>;
    /** The maximum size, in pixels. `null` means no limit. The default is `null`. */
    maxSize?: Bind<number | null>;
    /** Lets the adjacent handles collapse the pane, with a button or Enter. `undefined` inherits from the splitter. */
    collapsible?: Bind<boolean | undefined>;
    /** Indicates that the pane is collapsed, and adjacent panes take its space. The default is `false`. */
    collapsed?: Bind<boolean>;
    /** Lets the adjacent handles change its size. The default is `true`. */
    resizable?: Bind<boolean>;
    /** Content created with the pane, in addition to the JSX children. */
    content?: () => ComponentBase | readonly ComponentBase[];
}
