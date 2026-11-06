import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { LoadPanelTarget } from './load-panel-target';

/** Props of `LoadPanel`. Each prop is also a settable property, and a function is tracked. */
export interface LoadPanelProps extends ControlProps {
    /** The area to cover, a component or element. The default, `null`, covers the whole page. */
    target?: Bind<LoadPanelTarget | undefined>;
    /**
     * The message below the indicator. This is the same property as `text`. The default is the kit's "Loading…"
     * string.
     */
    message?: Bind<string>;
    /** Indicates whether the panel is shown. `x-model` provides two-way binding. The default is `false`. */
    value?: Bind<boolean>;
    /** The delay in milliseconds before it appears, so quick operations show nothing. The default is `0`. */
    delay?: Bind<number>;
    /** Dims the covered area. The default is `true`. */
    shade?: Bind<boolean>;
    /** Shows the box behind the indicator and the message. The default is `true`. */
    showPane?: Bind<boolean>;
    /** Shows the rotating indicator. The default is `true`. */
    showIndicator?: Bind<boolean>;
    /** Shows a Cancel button in the panel, which raises `onCancel` and hides the panel. The default is `false`. */
    cancelable?: Bind<boolean>;
    /** The Cancel button text. The default is the kit's "Cancel" string. */
    cancelText?: Bind<string>;
    /** Clicking the shade hides the panel. The default is `false`. */
    closeOnOutside?: Bind<boolean>;
    onShown?: () => void;
    onHidden?: () => void;
    onCancel?: () => void;
}
