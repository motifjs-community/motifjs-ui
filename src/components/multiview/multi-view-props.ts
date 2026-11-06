import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { ViewSelectingEventArgs } from './view-selecting-event-args';
import type { ViewSelectionChangedEventArgs } from './view-selection-changed-event-args';

/** Props of `MultiView`. Each prop is also a settable property, and a function is tracked. */
export interface MultiViewProps extends ControlProps {
    /** The view in sight: its `key`, else its index. `x-model` binds it two-way. Default `0`. */
    value?: Bind<string | number | null>;
    /** After the last view comes the first. Default `false`. */
    loop?: Bind<boolean>;
    /** A finger or a pointer drags the views. Default `true`. */
    swipeEnabled?: Bind<boolean>;
    /** The views slide into sight. `false` shows the next one at once. Default `true`. */
    animated?: Bind<boolean>;
    /** A view is built when first shown, then kept (a view's own `lazy` wins). Default `true`. */
    lazy?: Bind<boolean>;
    /** `false`: content made by a view's `content` is disposed while out of sight (a view's own `keepAlive` wins). Default `true`. */
    keepAlive?: Bind<boolean>;
    /** What screen readers call it. Default: the kit's "Pages". */
    label?: Bind<string>;
    /** The view in sight is about to change; cancelable. */
    onSelecting?: (e: ViewSelectingEventArgs) => void;
    onSelectionChanged?: (e: ViewSelectionChangedEventArgs) => void;
}
