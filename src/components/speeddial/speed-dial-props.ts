import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { SpeedDialAction } from './speed-dial-action';
import type { SpeedDialActionClickEventArgs } from './speed-dial-action-click-event-args';
import type { SpeedDialEventArgs } from './speed-dial-event-args';
import type { SpeedDialTooltip } from './speed-dial-tooltip';

/** How the actions are arranged: in a line from the main button, or on a full, half or quarter circle around it. */
export type SpeedDialLayout = 'linear' | 'circle' | 'semi-circle' | 'quarter-circle';

/** The direction the actions open in from the main button. A line uses the first part of a diagonal. */
export type SpeedDialDirection = 'up' | 'down' | 'start' | 'end' | 'up-start' | 'up-end' | 'down-start' | 'down-end';

/** A corner, the middle of an edge or the center of the container, or `inline` to stay in the page flow. */
export type SpeedDialPosition = 'bottom-end' | 'bottom-start' | 'top-end' | 'top-start' | 'bottom' | 'top' | 'start' | 'end' | 'center' | 'inline';

/** The reference for `position`: the viewport, or the nearest positioned ancestor. */
export type SpeedDialRelativeTo = 'viewport' | 'parent';

/** Props of `SpeedDial`. Each prop is also a settable property, and a function is tracked. */
export interface SpeedDialProps extends ControlProps {
    /** The actions, in order. If one is visible, the main button performs it directly. */
    actions?: Bind<readonly SpeedDialAction[]>;
    /** The glyph of the main button. The default is `'plus'`. */
    glyph?: Bind<string>;
    /** The glyph of the main button while the actions are open. The default is `'dismiss'`. */
    openGlyph?: Bind<string>;
    /**
     * The accessible name of the main button, and its text when `extended` is set. The default is the kit's "Actions"
     * string.
     */
    text?: Bind<string>;
    /** Shows `text` next to the glyph on the main button. The default is `false`. */
    extended?: Bind<boolean>;
    /** The default is `'linear'`. */
    layout?: Bind<SpeedDialLayout>;
    /**
     * In circular layouts, the distance in pixels from the center of the main button to the center of each action.
     * By default, it is just large enough to keep the actions apart.
     */
    radius?: Bind<number | null>;
    /** By default, the actions open away from the edges named by `position`, or `'up'` when centered or inline. */
    direction?: Bind<SpeedDialDirection>;
    /** The default is `'bottom-end'`. */
    position?: Bind<SpeedDialPosition>;
    /** The default is `'viewport'`. */
    relativeTo?: Bind<SpeedDialRelativeTo>;
    /** Indicates whether the actions are open. `x-model` provides two-way binding. The default is `false`. */
    open?: Bind<boolean>;
    /** Closes the actions when one is selected. The default is `true`. */
    closeOnAction?: Bind<boolean>;
    /**
     * Shows labels next to the actions while they are open. By default, they appear in a line but not around the
     * button.
     */
    showLabels?: Bind<boolean>;
    /**
     * Shows tooltips on the actions, using their text unless an action overrides it. Options are passed to each
     * `Tooltip`. By default, they appear while the labels are off.
     */
    tooltip?: Bind<boolean | SpeedDialTooltip>;
    onOpened?: (e: SpeedDialEventArgs) => void;
    onClosed?: (e: SpeedDialEventArgs) => void;
    /** Occurs when an action is clicked. */
    onActionClick?: (e: SpeedDialActionClickEventArgs) => void;
}
