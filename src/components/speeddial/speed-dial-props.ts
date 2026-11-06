import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { SpeedDialAction } from './speed-dial-action';
import type { SpeedDialActionClickEventArgs } from './speed-dial-action-click-event-args';
import type { SpeedDialEventArgs } from './speed-dial-event-args';
import type { SpeedDialTooltip } from './speed-dial-tooltip';

/** How the actions lie: in a line from the main button, or on a circle, a half or a quarter of one around it. */
export type SpeedDialLayout = 'linear' | 'circle' | 'semi-circle' | 'quarter-circle';

/** Where the actions go from the main button. A line takes the first word of a diagonal. */
export type SpeedDialDirection = 'up' | 'down' | 'start' | 'end' | 'up-start' | 'up-end' | 'down-start' | 'down-end';

/** A corner, an edge's middle or the centre of what it is placed in, or `inline` in the flow of the page. */
export type SpeedDialPosition = 'bottom-end' | 'bottom-start' | 'top-end' | 'top-start' | 'bottom' | 'top' | 'start' | 'end' | 'center' | 'inline';

/** What `position` is measured in: the viewport, or the nearest positioned parent. */
export type SpeedDialRelativeTo = 'viewport' | 'parent';

/** Props of `SpeedDial`. Each one is also a settable property; a function is followed. */
export interface SpeedDialProps extends ControlProps {
    /** The actions, in the order they fan out. With one shown, the main button does it itself. */
    actions?: Bind<readonly SpeedDialAction[]>;
    /** The main button's glyph. Default `'plus'`. */
    glyph?: Bind<string>;
    /** The main button's glyph while the actions are open. Default `'dismiss'`. */
    openGlyph?: Bind<string>;
    /** What screen readers call the main button, and its text when `extended`. Default: the kit's "Actions". */
    text?: Bind<string>;
    /** The main button shows its `text` beside the glyph. Default `false`. */
    extended?: Bind<boolean>;
    /** Default `'linear'`. */
    layout?: Bind<SpeedDialLayout>;
    /** Pixels from the main button's centre to the actions' centres, around it. Default: just enough to keep them apart. */
    radius?: Bind<number | null>;
    /** Default: away from the edges `position` names; `'up'` in the centre and inline. */
    direction?: Bind<SpeedDialDirection>;
    /** Default `'bottom-end'`. */
    position?: Bind<SpeedDialPosition>;
    /** Default `'viewport'`. */
    relativeTo?: Bind<SpeedDialRelativeTo>;
    /** The actions are open. `x-model` binds it two-way. Default `false`. */
    open?: Bind<boolean>;
    /** A press on an action closes the fan. Default `true`. */
    closeOnAction?: Bind<boolean>;
    /** The actions' labels are shown beside them while open. Default: in a line yes, around the button no. */
    showLabels?: Bind<boolean>;
    /** Tooltips on the actions, with their text unless an action says otherwise; options go to each `Tooltip`. Default: while the labels are off. */
    tooltip?: Bind<boolean | SpeedDialTooltip>;
    onOpened?: (e: SpeedDialEventArgs) => void;
    onClosed?: (e: SpeedDialEventArgs) => void;
    /** An action was pressed. */
    onActionClick?: (e: SpeedDialActionClickEventArgs) => void;
}
