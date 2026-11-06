import type { Bind, ComponentBase } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { PopupPlacement } from '../../parts/popup/popup-placement';
import type { TooltipTarget } from '../tooltip/tooltip-target';
import type { PopoverClosingEventArgs } from './popover-closing-event-args';
import type { PopoverShowOn } from './popover-show-on';

/** Props of `Popover`. Each prop is also a settable property, and a function is tracked. */
export interface PopoverProps extends ControlProps {
    /** The element or component it opens next to. */
    target?: Bind<TooltipTarget | null | undefined>;
    /** A title in the header. This is the same property as `text`. */
    title?: Bind<string>;
    /** The accessible name when there is no title. */
    label?: Bind<string>;
    /** Content set programmatically, shown after the JSX children. */
    content?: Bind<ComponentBase | null | undefined>;
    /** The default is `'click'`. */
    showOn?: Bind<PopoverShowOn>;
    /** The default is `'bottom'`. It opens on the opposite side if there is no room. */
    placement?: Bind<PopupPlacement>;
    /** Shows an arrow toward the target, where the design language includes one. The default is `true`. */
    arrow?: Bind<boolean>;
    /** Shows a close button in the header. The default is `false`. */
    showClose?: Bind<boolean>;
    /** A custom width, as a CSS length or in pixels. Without it, the popover fits its content. */
    width?: Bind<string | number | null>;
    /** Closes the popover on a click outside it and its target. The default is `true`. */
    closeOnOutside?: Bind<boolean>;
    /**
     * The time in milliseconds the pointer must rest on the target before it opens (`showOn: 'hover'`). The default
     * is 300.
     */
    delay?: Bind<number>;
    /**
     * The time in milliseconds it stays after the pointer leaves both, so the pointer can move onto it. The default
     * is 200.
     */
    hideDelay?: Bind<number>;
    /** Indicates whether it is open. `x-model` provides two-way binding. */
    value?: Bind<boolean>;
    onOpened?: () => void;
    /** Occurs before it closes. This event is cancelable. */
    onClosing?: (e: PopoverClosingEventArgs) => void;
    onClosed?: (reason: unknown) => void;
}
