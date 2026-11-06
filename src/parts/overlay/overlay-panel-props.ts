import type { Bind, ComponentBase } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { OverlayClosedEventArgs } from './overlay-closed-event-args';
import type { OverlayClosingEventArgs } from './overlay-closing-event-args';
import type { OverlayContainer } from './overlay-container';
import type { OverlayEventArgs } from './overlay-event-args';
import type { OverlayOpeningEventArgs } from './overlay-opening-event-args';

/** Props every overlay panel (a bottom sheet, a drawer, an action sheet) understands. Each prop is also a settable, reactive property. */
export interface OverlayPanelProps extends ControlProps {
  /** A title at the top; it names the panel. The same property as `text`. */
  title?: Bind<string>;
  /** Names the panel for screen readers when it has no title. */
  label?: Bind<string>;
  /** Whether it is open. `x-model` binds it two-way: the user closing it writes `false`. */
  value?: Bind<boolean>;
  /** Nothing outside it can be used while it is open (inside its container, or on the whole page). Default `true`. */
  modal?: Bind<boolean>;
  /** A dimmed layer under it. Default: when modal. */
  scrim?: Bind<boolean>;
  /** Opens over this element (it must be a positioned box; a static one is created relative while open); `null` over the page. Default `null`. */
  container?: Bind<OverlayContainer>;
  /** What fills it (besides JSX children). */
  content?: Bind<ComponentBase | null>;
  /** A row under the content that does not scroll with it. */
  footer?: Bind<ComponentBase | null>;
  /** A close button beside the title. Default `false`. */
  showClose?: Bind<boolean>;
  /** Escape closes it. Default `true`. */
  closeOnEscape?: Bind<boolean>;
  /** A click on the scrim closes it. Default `true`. */
  closeOnScrim?: Bind<boolean>;
  /** The browser's back (Android's back button, the back gesture) closes it, through the session history, leaving no entry behind. Default `true`. */
  closeOnBack?: Bind<boolean>;
  /** Focus moves into it when it opens: the first field, else the first control, else the panel. Default: when modal. */
  focusOnOpen?: Bind<boolean>;
  /** Focus goes back where it was when it closes (if it was inside). Default `true`. */
  returnFocus?: Bind<boolean>;
  /** Disposed when it closes. Default: when `show` added it to its host. */
  disposeOnClose?: Bind<boolean>;
  /** It is about to open; cancelable. */
  onOpening?: (e: OverlayOpeningEventArgs) => void;
  /** It has opened (after it slid in). */
  onOpened?: (e: OverlayEventArgs) => void;
  /** It is about to close; cancelable but when its owner goes away. */
  onClosing?: (e: OverlayClosingEventArgs) => void;
  /** It has closed (after it slid out). */
  onClosed?: (e: OverlayClosedEventArgs) => void;
}
