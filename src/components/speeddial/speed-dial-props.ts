import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { SpeedDialAction } from './speed-dial-action';
import type { SpeedDialActionClickEventArgs } from './speed-dial-action-click-event-args';
import type { SpeedDialEventArgs } from './speed-dial-event-args';

/** Where the actions fan out from the main button. */
export type SpeedDialDirection = 'up' | 'down' | 'start' | 'end';

/** A corner of the viewport it is fixed to, or `inline` in the flow of the page. */
export type SpeedDialPosition = 'bottom-end' | 'bottom-start' | 'top-end' | 'top-start' | 'inline';

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
    /** Default `'up'`. */
    direction?: Bind<SpeedDialDirection>;
    /** Default `'bottom-end'`. */
    position?: Bind<SpeedDialPosition>;
    /** The actions are open. `x-model` binds it two-way. Default `false`. */
    open?: Bind<boolean>;
    /** A press on an action closes the fan. Default `true`. */
    closeOnAction?: Bind<boolean>;
    /** The actions' labels are shown beside them while open. Default `true`. */
    showLabels?: Bind<boolean>;
    onOpened?: (e: SpeedDialEventArgs) => void;
    onClosed?: (e: SpeedDialEventArgs) => void;
    /** An action was pressed. */
    onActionClick?: (e: SpeedDialActionClickEventArgs) => void;
}
