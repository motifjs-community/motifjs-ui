import type { Bind, ComponentBase } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { OverlayClosedEventArgs } from './overlay-closed-event-args';
import type { OverlayClosingEventArgs } from './overlay-closing-event-args';
import type { OverlayContainer } from './overlay-container';
import type { OverlayEventArgs } from './overlay-event-args';
import type { OverlayOpeningEventArgs } from './overlay-opening-event-args';

/** Props every overlay panel (a bottom sheet, a drawer, an action sheet) understands. Each prop is also a settable, reactive property. */
export interface OverlayPanelProps extends ControlProps {
  /** A title at the top, which also names the panel. This is the same property as `text`. */
  title?: Bind<string>;
  /** The accessible name when the panel has no title. */
  label?: Bind<string>;
  /** Indicates whether it is open. `x-model` provides two-way binding, so `false` is written when the user closes it. */
  value?: Bind<boolean>;
  /** Blocks everything around it while open, within its container or on the whole page. The default is `true`. */
  modal?: Bind<boolean>;
  /** Shows a dimmed layer behind it. By default, this applies when modal. */
  scrim?: Bind<boolean>;
  /**
   * Opens over this component, whose element must be positioned (a static one is made relative while open). `null`
   * opens over the page. The default is `null`.
   */
  container?: Bind<OverlayContainer>;
  /** Its content, in addition to JSX children. */
  content?: Bind<ComponentBase | null>;
  /** A non-scrolling row below the content. */
  footer?: Bind<ComponentBase | null>;
  /** Shows a close button next to the title. The default is `false`. */
  showClose?: Bind<boolean>;
  /** Closes it on Escape. The default is `true`. */
  closeOnEscape?: Bind<boolean>;
  /** Closes it on a click on the scrim. The default is `true`. */
  closeOnScrim?: Bind<boolean>;
  /**
   * Closes it with the browser's back action (the Android back button or back gesture), through the session
   * history, leaving no entry behind. The default is `true`.
   */
  closeOnBack?: Bind<boolean>;
  /** Moves focus in on open: to the first field, the first control, or the panel. By default, this applies when modal. */
  focusOnOpen?: Bind<boolean>;
  /** Returns focus to where it was on close, if focus was inside. The default is `true`. */
  returnFocus?: Bind<boolean>;
  /** Disposes it on close. By default, this applies when `show` added it to its host. */
  disposeOnClose?: Bind<boolean>;
  /** Occurs before it opens. Set `cancel = true` to keep it closed. */
  onOpening?: (e: OverlayOpeningEventArgs) => void;
  /** Occurs after it opens and the slide-in animation ends. */
  onOpened?: (e: OverlayEventArgs) => void;
  /** Occurs before it closes. Set `cancel = true` to keep it open, unless its owner is being disposed. */
  onClosing?: (e: OverlayClosingEventArgs) => void;
  /** Occurs after it closes and the slide-out animation ends. */
  onClosed?: (e: OverlayClosedEventArgs) => void;
}
