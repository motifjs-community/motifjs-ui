import type { Bind } from '@motifx/core';
import type { InputMode } from '../../core/input-mode';
import type { EnterKeyEventArgs } from '../../parts/field/enter-key-event-args';
import type { FieldProps } from '../../parts/field/field-props';
import type { MaskChar } from '../../parts/mask/mask-char';
import type { TextBoxType } from './text-box-type';

/** Props of `TextBox`: the field props plus its own. Each one is also a settable, reactive property. */
export interface TextBoxProps extends FieldProps<string> {
  /** Default `'text'`. */
  type?: Bind<TextBoxType>;
  placeholder?: Bind<string>;
  maxLength?: Bind<number>;
  minLength?: Bind<number>;
  /** Shows `12/50` (or `12` without `maxLength`) under the box. */
  showCounter?: Bind<boolean>;
  /** A button that empties the field; Escape does the same. */
  clearButton?: Bind<boolean>;
  /** A button that shows a password. Default `true`. */
  passwordReveal?: Bind<boolean>;
  /** `input` (default) changes the value on every key, `change` when the field is left or Enter is pressed. */
  updateOn?: Bind<'input' | 'change'>;
  /** Selects the whole text when the field gets focus. */
  selectOnFocus?: Bind<boolean>;
  /** Default `'start'`. */
  align?: Bind<'start' | 'center' | 'end'>;
  inputMode?: Bind<InputMode>;
  autocomplete?: Bind<string>;
  spellcheck?: Bind<boolean>;
  /** The name it is sent with in a form. */
  name?: Bind<string>;
  /** `(000) 000 00 00`: `0` a digit, `9` an optional digit, `a` a letter, `*` a letter or a digit, `\` a fixed character. */
  mask?: Bind<string>;
  maskChars?: Bind<Readonly<Record<string, MaskChar>>>;
  /** Default `_`. */
  maskPlaceholder?: Bind<string>;
  /** `raw` (default): only the typed characters; `formatted`: with the fixed ones. */
  maskValue?: Bind<'raw' | 'formatted'>;
  /** `focus` (default): an empty mask shows only while the field has focus. */
  showMask?: Bind<'always' | 'focus'>;
  onEnter?: (e: EnterKeyEventArgs<string>) => void;
}
