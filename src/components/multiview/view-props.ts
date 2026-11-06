import type { Bind, ComponentBase } from '@motifx/core';
import type { ControlProps } from '../../core/control';

/** Props of `View`, one page of a `MultiView`. Each prop is also a settable property, and a function is tracked. */
export interface ViewProps extends ControlProps {
    /** Identifies the view in the multi-view's `value`. If omitted, its index is used. The JSX `key` is also read. */
    key?: Bind<string>;
    /** The accessible name of the page. The default is "Page 2 of 3" in the kit language. */
    title?: Bind<string>;
    /** Content created when the view first becomes visible, instead of or in addition to the JSX children. */
    content?: () => ComponentBase | readonly ComponentBase[];
    /** This view's own setting. `undefined` inherits from the multi-view. */
    lazy?: Bind<boolean | undefined>;
    /** This view's own setting. `undefined` inherits from the multi-view. */
    keepAlive?: Bind<boolean | undefined>;
}
