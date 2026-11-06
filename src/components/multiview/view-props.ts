import type { Bind, ComponentBase } from '@motifx/core';
import type { ControlProps } from '../../core/control';

/** Props of `View`, one page of a `MultiView`. Each prop is also a settable property, and a function is tracked. */
export interface ViewProps extends ControlProps {
    /** Names the view in the multi-view's `value`; without one its index does. The JSX `key` is read too. */
    key?: Bind<string>;
    /** What screen readers call the page. Default: "Page 2 of 3" in the kit language. */
    title?: Bind<string>;
    /** Content made when the view is first shown, instead of (or besides) the JSX children. */
    content?: () => ComponentBase | readonly ComponentBase[];
    /** This view's own setting; `undefined` follows the multi-view. */
    lazy?: Bind<boolean | undefined>;
    /** This view's own setting; `undefined` follows the multi-view. */
    keepAlive?: Bind<boolean | undefined>;
}
