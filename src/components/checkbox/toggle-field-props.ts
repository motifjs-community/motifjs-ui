import type { Bind } from '@motifx/core';
import type { FieldProps } from '../../parts/field/field-props';
import type { LabelPosition } from './label-position';

/** Props of a field drawn as a native checkbox (`CheckBox`, `Switch`). Each prop is also a settable, reactive property. */
export interface ToggleFieldProps<T> extends FieldProps<T> {
  /** The position of the label. The default is `'end'`. */
  labelPosition?: Bind<LabelPosition>;
  /** The name submitted with the form. */
  name?: Bind<string>;
}
