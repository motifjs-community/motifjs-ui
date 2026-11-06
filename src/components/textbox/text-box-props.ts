import type { Bind } from '@motifx/core';
import type { InputMode } from '../../core/input-mode';
import type { EnterKeyEventArgs } from '../../parts/field/enter-key-event-args';
import type { FieldProps } from '../../parts/field/field-props';
import type { MaskChar } from '../../parts/mask/mask-char';
import type { TextBoxType } from './text-box-type';

/** Props of `TextBox`, in addition to the field props. Each prop is also a settable, reactive property. */
export interface TextBoxProps extends FieldProps<string> {
  /** The default is `'text'`. */
  type?: Bind<TextBoxType>;
  placeholder?: Bind<string>;
  maxLength?: Bind<number>;
  minLength?: Bind<number>;
  /** Shows `12/50` below the box (`12` without `maxLength`). */
  showCounter?: Bind<boolean>;
  /** Shows a button that clears the field. Pressing Escape also clears it. */
  clearButton?: Bind<boolean>;
  /** With `type="password"`, shows a button that reveals the password. The default is `true`. */
  passwordReveal?: Bind<boolean>;
  /**
   * With `input` (the default), the value updates on every keystroke. With `change`, it updates when the field loses
   * focus or the user presses Enter.
   */
  updateOn?: Bind<'input' | 'change'>;
  /** Selects all text when the field receives focus. */
  selectOnFocus?: Bind<boolean>;
  /** The text alignment. The default is `'start'`. */
  align?: Bind<'start' | 'center' | 'end'>;
  inputMode?: Bind<InputMode>;
  autocomplete?: Bind<string>;
  spellcheck?: Bind<boolean>;
  /** The name submitted with the form. */
  name?: Bind<string>;
  /**
   * `(000) 000 00 00`: `0` is a digit, `9` an optional digit, `a` a letter, `*` a letter or a digit, and `\` a fixed
   * character.
   */
  mask?: Bind<string>;
  maskChars?: Bind<Readonly<Record<string, MaskChar>>>;
  /** Shown in positions that are not filled yet. The default is `_`. */
  maskPlaceholder?: Bind<string>;
  /** `raw` (the default) returns only the typed characters, and `formatted` includes the fixed ones. */
  maskValue?: Bind<'raw' | 'formatted'>;
  /** With `focus` (the default), an empty mask appears only while the field has focus. */
  showMask?: Bind<'always' | 'focus'>;
  onEnter?: (e: EnterKeyEventArgs<string>) => void;
}
