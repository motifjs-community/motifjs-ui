import type { Bind } from '@motifx/core';
import type { EnterKeyEventArgs } from '../../parts/field/enter-key-event-args';
import type { FieldProps } from '../../parts/field/field-props';
import type { TextAreaResize } from './text-area-resize';

/** Props of `TextArea`: the field props plus its own. Each one is also a settable, reactive property. */
export interface TextAreaProps extends FieldProps<string> {
  placeholder?: Bind<string>;
  /** Visible lines. Default `3`. */
  rows?: Bind<number>;
  /** The box grows and shrinks with the text, from `minRows` to `maxRows` lines, then scrolls. */
  autoGrow?: Bind<boolean>;
  /** With `autoGrow`. Default `rows`. */
  minRows?: Bind<number>;
  /** With `autoGrow`; without it the box grows without a limit. */
  maxRows?: Bind<number | null>;
  /** Default `'vertical'`; `'none'` while `autoGrow` is on. */
  resize?: Bind<TextAreaResize>;
  maxLength?: Bind<number>;
  minLength?: Bind<number>;
  /** Shows `12/500` (or `12` without `maxLength`) under the box. */
  showCounter?: Bind<boolean>;
  /** A button that empties the field; Escape does the same. */
  clearButton?: Bind<boolean>;
  /** `input` (default) changes the value on every key, `change` when the field is left or Ctrl+Enter is pressed. */
  updateOn?: Bind<'input' | 'change'>;
  /** Selects the whole text when the field gets focus. */
  selectOnFocus?: Bind<boolean>;
  spellcheck?: Bind<boolean>;
  /** `soft` (default) wraps long lines on screen only, `hard` also in the sent value, `off` scrolls sideways. */
  wrap?: Bind<'soft' | 'hard' | 'off'>;
  /** The name it is sent with in a form. */
  name?: Bind<string>;
  autocomplete?: Bind<string>;
  /** Ctrl+Enter (Cmd+Enter on Apple platforms) was pressed; Enter alone starts a new line. */
  onEnter?: (e: EnterKeyEventArgs<string>) => void;
}
