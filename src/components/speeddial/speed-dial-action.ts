import type { Bind } from '@motifx/core';
import type { IconSource } from '../../core/icon-source';
import type { SpeedDialActionClickEventArgs } from './speed-dial-action-click-event-args';
import type { SpeedDialTooltip } from './speed-dial-tooltip';

/** One action of the `SpeedDial`: a round button with a glyph or an icon, and its text as a label next to it. */
export interface SpeedDialAction {
    /** Identifies the action in the events. If omitted, its index is used. */
    key?: string;
    /** The label next to the button, which also provides its accessible name. */
    text: Bind<string>;
    /** A glyph from the kit's set (`pencil`, `trash`, `plus`…). */
    glyph?: Bind<string>;
    /** A custom icon that replaces the glyph: an address or a component. */
    icon?: IconSource;
    /**
     * The tooltip: custom text, its options, or `false` for none. This takes precedence over the speed dial's
     * `tooltip`.
     */
    tooltip?: Bind<string | boolean | SpeedDialTooltip>;
    /** The default is `true`. */
    enabled?: Bind<boolean>;
    /** The default is `true`. */
    visible?: Bind<boolean>;
    /** The action to run. `onActionClick` is also raised. */
    click?: (e: SpeedDialActionClickEventArgs) => void;
    /** A custom value. */
    data?: unknown;
}
