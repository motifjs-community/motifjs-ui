import type { Bind } from '@motifx/core';
import type { FieldProps } from '../../parts/field/field-props';
import type { RatingTone } from './rating-tone';

/**
 * Props of `Rating`, in addition to the field props (label, help text, rules, `x-model`). Each prop is also a settable,
 * reactive property.
 */
export interface RatingProps extends FieldProps<number | null> {
  /** The number of stars. The default is `5`. */
  max?: Bind<number>;
  /** `0.5` allows half stars, using the first half of a star or the arrow keys. The default is `1`. */
  step?: Bind<1 | 0.5>;
  /** Clicking the selected value, or pressing Delete or Backspace, clears the score. The default is `true`. */
  allowClear?: Bind<boolean>;
  /** On hover, the stars preview the score a click would set. The default is `true`. */
  preview?: Bind<boolean>;
  /** The default comes from the design language (`accent`). */
  tone?: Bind<RatingTone>;
  /**
   * The shape of an empty star: a name from the kit's icon set, or an image address (drawn in the star color).
   * The default comes from the design language (`star`).
   */
  emptyIcon?: Bind<string | null>;
  /** The shape of a filled star, set as in `emptyIcon`. The default comes from the design language (`star-filled`). */
  filledIcon?: Bind<string | null>;
}
