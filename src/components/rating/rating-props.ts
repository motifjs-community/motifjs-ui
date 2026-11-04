import type { Bind } from '@motifx/core';
import type { FieldProps } from '../../parts/field/field-props';
import type { RatingTone } from './rating-tone';

/** Props of `Rating`: a field (label, help text, rules, `x-model`) plus its own. Each one is also a settable, reactive property. */
export interface RatingProps extends FieldProps<number | null> {
  /** How many stars. Default `5`. */
  max?: Bind<number>;
  /** `0.5` takes halves (a press on a star's first half, or the arrow keys). Default `1`. */
  step?: Bind<1 | 0.5>;
  /** A press on the value chosen, Delete or Backspace leave none. Default `true`. */
  allowClear?: Bind<boolean>;
  /** Under the pointer, the stars show what a press would give. Default `true`. */
  preview?: Bind<boolean>;
  /** Default: the design language's (`accent`). */
  tone?: Bind<RatingTone>;
  /** The shape of an empty star: a name of the kit's icon set, or an image address (drawn in the star's colour). Default: the language's (`star`). */
  emptyIcon?: Bind<string | null>;
  /** The shape of a filled star, as `emptyIcon`. Default: the language's (`star-filled`). */
  filledIcon?: Bind<string | null>;
}
