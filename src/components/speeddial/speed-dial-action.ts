import type { Bind } from '@motifx/core';
import type { IconSource } from '../../core/icon-source';
import type { SpeedDialActionClickEventArgs } from './speed-dial-action-click-event-args';

/** One action of the `SpeedDial`: a round button with a glyph or an icon, its text as a label beside it. */
export interface SpeedDialAction {
    /** Names the action in the events; without one its index does. */
    key?: string;
    /** The label beside the button, and what screen readers call it. */
    text: Bind<string>;
    /** A glyph of the kit's set (`pencil`, `trash`, `plus`…). */
    glyph?: Bind<string>;
    /** An icon of your own: an address, an element or a component, in place of the glyph. */
    icon?: IconSource;
    /** Default `true`. */
    enabled?: Bind<boolean>;
    /** Default `true`. */
    visible?: Bind<boolean>;
    /** What the action does; `onActionClick` is told too. */
    click?: (e: SpeedDialActionClickEventArgs) => void;
    /** Anything of your own. */
    data?: unknown;
}
