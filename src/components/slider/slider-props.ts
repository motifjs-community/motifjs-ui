import type { Bind } from '@motifx/core';
import type { FieldProps } from '../../parts/field/field-props';
import type { SliderOrientation } from './slider-orientation';
import type { SliderShowValue } from './slider-show-value';
import type { SliderValue } from './slider-value';

/** Props of `Slider`, in addition to the field props. Each prop is also a settable, reactive property. */
export interface SliderProps extends FieldProps<SliderValue> {
  /** The default is `0`. */
  min?: Bind<number>;
  /** The default is `100`. */
  max?: Bind<number>;
  /** The default is `1`. `0` allows continuous values. */
  step?: Bind<number>;
  /** The amount Page Up and Page Down move the thumb. The default is ten steps. */
  largeStep?: Bind<number>;
  /** Shows two thumbs, and the value is `[start, end]`. */
  range?: Bind<boolean>;
  /**
   * Creates a centered slider, where the active part of the track runs from this value to the thumb. It cannot be used
   * with `range`.
   */
  origin?: Bind<number | undefined>;
  /** The minimum distance between the two thumbs. The default is `0`. */
  minDistance?: Bind<number>;
  /** The default is `'horizontal'`. */
  orientation?: Bind<SliderOrientation>;
  /** `true` adds a mark at every step, and a number adds that many equal parts. */
  ticks?: Bind<boolean | number>;
  /** Shows values under the marks, or at the two ends if there are no marks. */
  tickLabels?: Bind<boolean>;
  /** The default is `'never'`. */
  showValue?: Bind<SliderShowValue>;
  /** The format used by the tooltip and the tick labels. */
  format?: Bind<Intl.NumberFormatOptions | null>;
  /** The default is the page's `lang`. */
  locale?: Bind<string>;
  /**
   * With `input` (the default), the value updates while the thumb moves. With `change`, it updates when the thumb is
   * released.
   */
  updateOn?: Bind<'input' | 'change'>;
  /** The name submitted with the form. A range submits two values. */
  name?: Bind<string>;
  /**
   * The text screen readers announce for a value, such as `(v) => v + ' °C'`. Because it is a function, it is stored as
   * is and not bound.
   */
  valueText?: (value: number) => string;
}
