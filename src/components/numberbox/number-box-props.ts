import type { Bind } from '@motifx/core';
import type { EnterKeyEventArgs } from '../../parts/field/enter-key-event-args';
import type { FieldProps } from '../../parts/field/field-props';
import type { SpinLayout } from './spin-layout';

/** Props of `NumberBox`: the field props plus its own. Each one is also a settable, reactive property. */
export interface NumberBoxProps extends FieldProps<number | null> {
  min?: Bind<number | null>;
  max?: Bind<number | null>;
  /** What the arrow keys, the spin buttons and the wheel add. Default `1`. */
  step?: Bind<number>;
  /** What PageUp and PageDown add. Default 10 × `step`. */
  largeStep?: Bind<number>;
  /** Default `true`. */
  showSpinButtons?: Bind<boolean>;
  /** `stacked` (default): up and down arrows on top of each other; `inline`: − and + side by side. */
  spinLayout?: Bind<SpinLayout>;
  /** The mouse wheel changes the value while the field has focus. Default `false`. */
  wheel?: Bind<boolean>;
  /** How the value shows when the field does not have focus: currency, percent, digits… */
  format?: Bind<Intl.NumberFormatOptions>;
  /** The locale of the format and of what is typed. Default the page's `lang`. */
  locale?: Bind<string>;
  /**
   * Digits after the decimal point: every value is rounded to them (entered, given or set programmatically, written back
   * to `x-model`), and shown with exactly that many while the field is not edited. Default: as given.
   */
  decimals?: Bind<number | null>;
  /** A value outside `min` / `max` is brought inside when entered. Default `true`; `false` leaves it to the range check. */
  clamp?: Bind<boolean>;
  /** An empty field is `null`. Default `true`; `false` puts `min` (or 0) in its place. */
  allowEmpty?: Bind<boolean>;
  /** `input` (default) changes the value as soon as the text is a whole number, `change` when the field is left or Enter is pressed. */
  updateOn?: Bind<'input' | 'change'>;
  placeholder?: Bind<string>;
  /** Selects the whole text when the field gets focus. */
  selectOnFocus?: Bind<boolean>;
  /** Default `'start'`. */
  align?: Bind<'start' | 'center' | 'end'>;
  /** The name it is sent with in a form. */
  name?: Bind<string>;
  /** Default `'off'`. */
  autocomplete?: Bind<string>;
  onEnter?: (e: EnterKeyEventArgs<number | null>) => void;
}
