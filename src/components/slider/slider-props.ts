import type { Bind } from '@motifx/core';
import type { FieldProps } from '../../parts/field/field-props';
import type { SliderOrientation } from './slider-orientation';
import type { SliderShowValue } from './slider-show-value';
import type { SliderValue } from './slider-value';

/** Props of `Slider`: the field props plus its own. Each one is also a settable, reactive property. */
export interface SliderProps extends FieldProps<SliderValue> {
  /** Default `0`. */
  min?: Bind<number>;
  /** Default `100`. */
  max?: Bind<number>;
  /** Default `1`; `0` lets the value take any number. */
  step?: Bind<number>;
  /** What Page Up and Page Down move by. Default ten steps. */
  largeStep?: Bind<number>;
  /** Two thumbs; the value is `[start, end]`. */
  range?: Bind<boolean>;
  /** A centred slider: the active segment runs from this value to the thumb. Not with `range`. */
  origin?: Bind<number | undefined>;
  /** The least distance between the two thumbs. Default `0`. */
  minDistance?: Bind<number>;
  /** Default `'horizontal'`. */
  orientation?: Bind<SliderOrientation>;
  /** `true` a mark at every step, a number that many equal parts. */
  ticks?: Bind<boolean | number>;
  /** The values under the marks (at the two ends without marks). */
  tickLabels?: Bind<boolean>;
  /** Default `'never'`. */
  showValue?: Bind<SliderShowValue>;
  /** How the bubble and the tick labels write the value. */
  format?: Bind<Intl.NumberFormatOptions | null>;
  /** Default: the page's `lang`. */
  locale?: Bind<string>;
  /** `input` (default) changes the value while the thumb moves, `change` when it is let go. */
  updateOn?: Bind<'input' | 'change'>;
  /** The name it is sent with in a form; a range sends two values. */
  name?: Bind<string>;
  /** What screen readers say for a value, e.g. `(v) => v + ' °C'`. A function, so it is not bound like the other props. */
  valueText?: (value: number) => string;
}
