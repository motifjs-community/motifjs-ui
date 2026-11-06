import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { ViewSelectingEventArgs } from './view-selecting-event-args';
import type { ViewSelectionChangedEventArgs } from './view-selection-changed-event-args';

/** Props of `MultiView`. Each prop is also a settable property, and a function is tracked. */
export interface MultiViewProps extends ControlProps {
    /** The visible view, identified by its `key` or index. `x-model` provides two-way binding. The default is `0`. */
    value?: Bind<string | number | null>;
    /** The first view follows the last. The default is `false`. */
    loop?: Bind<boolean>;
    /** Lets a finger or pointer drag the views. The default is `true`. */
    swipeEnabled?: Bind<boolean>;
    /** Animates the transition between views. `false` shows the next view immediately. The default is `true`. */
    animated?: Bind<boolean>;
    /**
     * Creates a view when it first becomes visible and then keeps it. A view's own `lazy` takes precedence.
     * The default is `true`.
     */
    lazy?: Bind<boolean>;
    /**
     * With `false`, disposes what a view's `content` created while the view is hidden. A view's own `keepAlive` takes
     * precedence. The default is `true`.
     */
    keepAlive?: Bind<boolean>;
    /** The accessible name. The default is the kit's "Pages" string. */
    label?: Bind<string>;
    /** Occurs before the visible view changes. This event is cancelable. */
    onSelecting?: (e: ViewSelectingEventArgs) => void;
    onSelectionChanged?: (e: ViewSelectionChangedEventArgs) => void;
}
