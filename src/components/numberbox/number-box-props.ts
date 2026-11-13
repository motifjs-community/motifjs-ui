import type { Bind } from '@motifx/core';
import type { EnterKeyEventArgs } from '../../parts/field/enter-key-event-args';
import type { FieldProps } from '../../parts/field/field-props';
import type { SpinLayout } from './spin-layout';

/** Props of `NumberBox`, in addition to the field props. Each prop is also a settable, reactive property. */
export interface NumberBoxProps extends FieldProps<number | null> {
  min?: Bind<number | null>;
  max?: Bind<number | null>;
  /** The amount added by the arrow keys, the spin buttons and the wheel. The default is `1`. */
  step?: Bind<number>;
  /** The amount added by PageUp and PageDown. The default is 10 × `step`. */
  largeStep?: Bind<number>;
  /** Shows up and down buttons in the box. The default is `true`. */
  showSpinButtons?: Bind<boolean>;
  /** `stacked` (the default) shows arrows on top of each other, and `inline` shows − and + side by side. */
  spinLayout?: Bind<SpinLayout>;
  /** The mouse wheel changes the value while the field has focus. The default is `false`. */
  wheel?: Bind<boolean>;
  /** The display format without focus: currency, percent, digits… */
  format?: Bind<Intl.NumberFormatOptions>;
  /** The locale of the format and of the input. The default is the kit's language (`uiLocale.locale`). */
  locale?: Bind<string>;
  /**
   * The number of digits after the decimal point. Every value is rounded to this precision (entered, provided or set
   * programmatically, and written back to `x-model`), and displayed with exactly that many digits while the field is
   * not being edited. By default, values are used as provided.
   */
  decimals?: Bind<number | null>;
  /**
   * Brings a value outside `min` / `max` into range when entered. The default is `true`. `false` leaves it to the
   * range validation.
   */
  clamp?: Bind<boolean>;
  /** An empty field is `null`. The default is `true`. `false` replaces it with `min` (or 0). */
  allowEmpty?: Bind<boolean>;
  /**
   * With `input` (the default), the value updates as soon as the text is a complete number. With `change`, it updates
   * when the field loses focus or the user presses Enter.
   */
  updateOn?: Bind<'input' | 'change'>;
  placeholder?: Bind<string>;
  /** Selects all text when the field receives focus. */
  selectOnFocus?: Bind<boolean>;
  /** The text alignment. The default is `'start'`. */
  align?: Bind<'start' | 'center' | 'end'>;
  /** The name submitted with the form. */
  name?: Bind<string>;
  /** The default is `'off'`. */
  autocomplete?: Bind<string>;
  onEnter?: (e: EnterKeyEventArgs<number | null>) => void;
}
