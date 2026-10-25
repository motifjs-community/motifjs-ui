import type { Bind } from '@motifx/core';
import type { FieldProps } from '../../parts/field/field-props';
import type { LabelPosition } from './label-position';

/** Props of a field drawn as a native checkbox (`CheckBox`, `Switch`). Each one is also a settable, reactive property. */
export interface ToggleFieldProps<T> extends FieldProps<T> {
  /** Where the caption sits. Default `'end'`. */
  labelPosition?: Bind<LabelPosition>;
  /** The name it is sent with in a form. */
  name?: Bind<string>;
}
