import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { LoadPanelTarget } from './load-panel-target';

/** Props of `LoadPanel`. Each one is also a settable property; a function is followed. */
export interface LoadPanelProps extends ControlProps {
    /** What it covers: a component or an element; `null` (the default) covers the whole page. */
    target?: Bind<LoadPanelTarget | undefined>;
    /** The message under the indicator. The same property as `text`. Default: the kit's "Loading…". */
    message?: Bind<string>;
    /** Shown or not; `x-model` binds it two-way. Default `false`. */
    value?: Bind<boolean>;
    /** Milliseconds before it shows, so quick work does not flash it. Default `0`. */
    delay?: Bind<number>;
    /** Dims what it covers. Default `true`. */
    shade?: Bind<boolean>;
    /** The pane behind the indicator and the message. Default `true`. */
    showPane?: Bind<boolean>;
    /** The turning indicator. Default `true`. */
    showIndicator?: Bind<boolean>;
    /** A Cancel button in the pane; `onCancel` tells, and the panel hides. Default `false`. */
    cancelable?: Bind<boolean>;
    /** The Cancel button's text. Default: the kit's "Cancel". */
    cancelText?: Bind<string>;
    /** A press on the shade hides it. Default `false`. */
    closeOnOutside?: Bind<boolean>;
    onShown?: () => void;
    onHidden?: () => void;
    onCancel?: () => void;
}
