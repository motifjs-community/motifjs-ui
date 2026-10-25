import type { Bind, ComponentBase } from '@motifx/core';
import type { Control, ControlProps } from '../../core/control';
import type { IconSource } from '../../core/icon-source';
import type { FormClosedEventArgs } from './form-closed-event-args';
import type { FormClosingEventArgs } from './form-closing-event-args';
import type { FormEventArgs } from './form-event-args';
import type { FormStartPosition } from './form-start-position';
import type { FormWindowState } from './form-window-state';

/** Props of `MxForm`: the shared `ControlProps` plus its own. Each one is also a settable, reactive property. */
export interface FormProps extends ControlProps {
  /** The title in the title bar; it names the form. The same property as `text`. */
  title?: Bind<string>;
  /** Whether the form is open. `x-model` binds it two-way: the user closing it writes `false`. */
  value?: Bind<boolean>;
  /** Opened through `value`, it is modal: nothing else on the page can be used until it closes. Default `false`. */
  modal?: Bind<boolean>;
  /** What fills the content area (besides JSX children and a subclass's `view()`). */
  content?: Bind<ComponentBase | null>;
  /** A row under the content that does not scroll with it, for the form's buttons. */
  footer?: Bind<ComponentBase | null>;
  /** An icon at the start of the title bar. */
  icon?: Bind<IconSource | null>;
  /** The close button in the title bar. Default `true`. */
  showClose?: Bind<boolean>;
  /** The minimize button (modeless forms only). Default `false`. */
  showMinimize?: Bind<boolean>;
  /** The maximize button; a double click on the title bar does the same. Default `false`. */
  showMaximize?: Bind<boolean>;
  /** Resized from its edges and corners. Default `true`. */
  resizable?: Bind<boolean>;
  /** Moved by dragging the title bar. Default `true`. */
  movable?: Bind<boolean>;
  /** Escape closes it with `'cancel'` (when there is no `cancelButton`). Default: on for a modal form, off for a modeless one. */
  closeOnEscape?: Bind<boolean>;
  /** The button Enter clicks from a one-line field. */
  acceptButton?: Bind<Control | null>;
  /** The button Escape clicks. */
  cancelButton?: Bind<Control | null>;
  /** Where a minimized form goes, as a chip that brings it back. Without it the form folds to its title bar. */
  minimizeTarget?: Bind<HTMLElement | ComponentBase | null>;
  /** Default `'normal'`. */
  windowState?: Bind<FormWindowState>;
  /** Default `'center'`. */
  startPosition?: Bind<FormStartPosition>;
  /** With `startPosition="manual"`: the distance from the start edge of the viewport (the right edge in RTL); a number is pixels. */
  left?: Bind<number | string>;
  /** With `startPosition="manual"`: the distance from the top of the viewport; a number is pixels. */
  top?: Bind<number | string>;
  /** A CSS length (`'32rem'`); a number is pixels. Default: as wide as the content needs. */
  width?: Bind<number | string>;
  /** A CSS length; a number is pixels. Default: as tall as the content needs. */
  height?: Bind<number | string>;
  /** `role="alertdialog"`: the form tells something urgent. Default `false`. */
  alert?: Bind<boolean>;
  /** Disposed when it closes. Default: when `show` or `showDialog` added it to its host; a form written in JSX is hidden. */
  disposeOnClose?: Bind<boolean>;
  /** Before it is shown the first time. */
  onLoaded?: (e: FormEventArgs) => void;
  /** It was shown. */
  onShown?: (e: FormEventArgs) => void;
  /** It became the active window. */
  onActivate?: (e: FormEventArgs) => void;
  /** Another window became active. */
  onDeactivate?: (e: FormEventArgs) => void;
  /** It is about to close; cancelable. */
  onClosing?: (e: FormClosingEventArgs) => void;
  onClosed?: (e: FormClosedEventArgs) => void;
}
