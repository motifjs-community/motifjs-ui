import type { Bind, ComponentBase } from '@motifx/core';
import type { Control, ControlProps } from '../../core/control';
import type { IconSource } from '../../core/icon-source';
import type { FormClosedEventArgs } from './form-closed-event-args';
import type { FormClosingEventArgs } from './form-closing-event-args';
import type { FormEventArgs } from './form-event-args';
import type { FormStartPosition } from './form-start-position';
import type { FormWindowState } from './form-window-state';

/** Props of `MxForm`: the shared `ControlProps` plus its own. Each prop is also a settable, reactive property. */
export interface FormProps extends ControlProps {
  /** The title in the title bar, which also names the form. This is the same property as `text`. */
  title?: Bind<string>;
  /** Indicates whether the form is open. `x-model` provides two-way binding, so `false` is written when the user closes it. */
  value?: Bind<boolean>;
  /** Makes the form modal when opened through `value`, so nothing else on the page can be used. The default is `false`. */
  modal?: Bind<boolean>;
  /** Content for the content area, in addition to JSX children and a subclass's `view()`. */
  content?: Bind<ComponentBase | null>;
  /** A non-scrolling row below the content, for the form's buttons. */
  footer?: Bind<ComponentBase | null>;
  /** An icon at the start of the title bar. */
  icon?: Bind<IconSource | null>;
  /** Shows the close button in the title bar. The default is `true`. */
  showClose?: Bind<boolean>;
  /** Shows the minimize button, on modeless forms only. The default is `false`. */
  showMinimize?: Bind<boolean>;
  /** Shows the maximize button. Double-clicking the title bar does the same. The default is `false`. */
  showMaximize?: Bind<boolean>;
  /** Allows resizing from the edges and corners. The default is `true`. */
  resizable?: Bind<boolean>;
  /** Allows moving by dragging the title bar. The default is `true`. */
  movable?: Bind<boolean>;
  /**
   * Closes the form with `'cancel'` on Escape when there is no `cancelButton`. The default is on for a modal form
   * and off for a modeless one.
   */
  closeOnEscape?: Bind<boolean>;
  /** The button Enter clicks from a single-line field. */
  acceptButton?: Bind<Control | null>;
  /** The button Escape clicks. */
  cancelButton?: Bind<Control | null>;
  /** Where a minimized form leaves a chip that restores it. Without it, the form collapses to its title bar. */
  minimizeTarget?: Bind<ComponentBase | null>;
  /** The state of the window. The default is `'normal'`. */
  windowState?: Bind<FormWindowState>;
  /** Where the form opens. The default is `'center'`. */
  startPosition?: Bind<FormStartPosition>;
  /**
   * With `startPosition="manual"`, the distance from the start edge of the viewport (the right edge in RTL).
   * A number is in pixels.
   */
  left?: Bind<number | string>;
  /** With `startPosition="manual"`, the distance from the top of the viewport. A number is in pixels. */
  top?: Bind<number | string>;
  /** A CSS length, such as `'32rem'`. A number is in pixels. By default, it is as wide as the content needs. */
  width?: Bind<number | string>;
  /** A CSS length. A number is in pixels. By default, it is as tall as the content needs. */
  height?: Bind<number | string>;
  /** Sets `role="alertdialog"`, for urgent content. The default is `false`. */
  alert?: Bind<boolean>;
  /**
   * Disposes the form when it closes. By default, a form added to its host by `show` or `showDialog` is disposed,
   * and a form declared in JSX is hidden.
   */
  disposeOnClose?: Bind<boolean>;
  /** Occurs before the form is first shown. */
  onLoaded?: (e: FormEventArgs) => void;
  /** Occurs after it is shown. */
  onShown?: (e: FormEventArgs) => void;
  /** Occurs when it becomes the active window. */
  onActivate?: (e: FormEventArgs) => void;
  /** Occurs when another window becomes active. */
  onDeactivate?: (e: FormEventArgs) => void;
  /** Occurs before it closes. Set `cancel = true` to keep it open. */
  onClosing?: (e: FormClosingEventArgs) => void;
  onClosed?: (e: FormClosedEventArgs) => void;
}
