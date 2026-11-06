import type { Bind } from '@motifx/core';
import type { EnterKeyEventArgs } from '../../parts/field/enter-key-event-args';
import type { FieldProps } from '../../parts/field/field-props';
import type { TextAreaResize } from './text-area-resize';

/** Props of `TextArea`, in addition to the field props. Each prop is also a settable, reactive property. */
export interface TextAreaProps extends FieldProps<string> {
  placeholder?: Bind<string>;
  /** The number of visible lines. The default is `3`. */
  rows?: Bind<number>;
  /** The box adjusts to its content, from `minRows` to `maxRows` lines, and then scrolls. */
  autoGrow?: Bind<boolean>;
  /** The minimum height with `autoGrow`. The default is `rows`. */
  minRows?: Bind<number>;
  /** The maximum height with `autoGrow`. Without it, the box grows without limit. */
  maxRows?: Bind<number | null>;
  /** The default is `'vertical'`, and `'none'` while `autoGrow` is on. */
  resize?: Bind<TextAreaResize>;
  maxLength?: Bind<number>;
  minLength?: Bind<number>;
  /** Shows `12/500` below the box (`12` without `maxLength`). */
  showCounter?: Bind<boolean>;
  /** Shows a button that clears the field. Pressing Escape also clears it. */
  clearButton?: Bind<boolean>;
  /**
   * With `input` (the default), the value updates on every keystroke. With `change`, it updates when the field loses
   * focus or the user presses Ctrl+Enter.
   */
  updateOn?: Bind<'input' | 'change'>;
  /** Selects all text when the field receives focus. */
  selectOnFocus?: Bind<boolean>;
  spellcheck?: Bind<boolean>;
  /**
   * `soft` (the default) wraps long lines on screen only, `hard` also wraps the submitted value, and `off` scrolls
   * horizontally.
   */
  wrap?: Bind<'soft' | 'hard' | 'off'>;
  /** The name submitted with the form. */
  name?: Bind<string>;
  autocomplete?: Bind<string>;
  /** Occurs when the user presses Ctrl+Enter (Cmd+Enter on Apple platforms). Enter alone starts a new line. */
  onEnter?: (e: EnterKeyEventArgs<string>) => void;
}
