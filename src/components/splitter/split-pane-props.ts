import type { Bind, ComponentBase } from '@motifx/core';
import type { PanelProps } from '../layout/panel-props';

/** Props of `SplitPane`, one pane of a `Splitter`: a `Panel` (padding, scrolling, a frame) with its place in the split. */
export interface SplitPaneProps extends PanelProps {
    /** Names the pane; the JSX `key` is read too. */
    key?: Bind<string>;
    /** Pixels, a share (`'30%'`) of the room the shares divide, or `null` for an equal share of what is left. Default `null`. */
    size?: Bind<number | string | null>;
    /** The least it gets, in pixels. Default `0`. */
    minSize?: Bind<number>;
    /** The most it gets, in pixels; `null` for no limit. Default `null`. */
    maxSize?: Bind<number | null>;
    /** The handles next to it can hide it (a button on the handle, Enter on it). `undefined` follows the splitter. */
    collapsible?: Bind<boolean | undefined>;
    /** Hidden, the neighbours taking its room. Default `false`. */
    collapsed?: Bind<boolean>;
    /** The handles next to it can change its size. Default `true`. */
    resizable?: Bind<boolean>;
    /** Content made with the pane, besides the JSX children. */
    content?: () => ComponentBase | readonly ComponentBase[];
}
