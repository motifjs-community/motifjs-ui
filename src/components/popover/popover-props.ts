import type { Bind, ComponentBase } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { PopupPlacement } from '../../parts/popup/popup-placement';
import type { TooltipTarget } from '../tooltip/tooltip-target';
import type { PopoverClosingEventArgs } from './popover-closing-event-args';
import type { PopoverShowOn } from './popover-show-on';

/** Props of `Popover`. Each one is also a settable property; a function is followed. */
export interface PopoverProps extends ControlProps {
    /** The element or component it opens next to. */
    target?: Bind<TooltipTarget | null | undefined>;
    /** A title in the header. The same property as `text`. */
    title?: Bind<string>;
    /** What screen readers call it when it has no title. */
    label?: Bind<string>;
    /** Content from code, after the JSX children. */
    content?: Bind<ComponentBase | null | undefined>;
    /** Default `'click'`. */
    showOn?: Bind<PopoverShowOn>;
    /** Default `'bottom'`. It opens on the other side when there is no room. */
    placement?: Bind<PopupPlacement>;
    /** An arrow towards the target, where the design language draws one. Default `true`. */
    arrow?: Bind<boolean>;
    /** A close button in the header. Default `false`. */
    showClose?: Bind<boolean>;
    /** A width of its own (a CSS length, or pixels); without one it takes its content's. */
    width?: Bind<string | number | null>;
    /** Closes on a press outside it and its target. Default `true`. */
    closeOnOutside?: Bind<boolean>;
    /** Milliseconds the pointer rests on the target before it opens (`showOn: 'hover'`). Default 300. */
    delay?: Bind<number>;
    /** Milliseconds it stays after the pointer leaves both, so the pointer can move onto it. Default 200. */
    hideDelay?: Bind<number>;
    /** Open or not; `x-model` binds it two-way. */
    value?: Bind<boolean>;
    onOpened?: () => void;
    /** About to close; cancelable. */
    onClosing?: (e: PopoverClosingEventArgs) => void;
    onClosed?: (reason: unknown) => void;
}
