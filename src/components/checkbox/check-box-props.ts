import type { Bind } from '@motifx/core';
import type { ToggleFieldProps } from './toggle-field-props';

/** Props of `CheckBox`. Each prop is also a settable, reactive property. */
export interface CheckBoxProps extends ToggleFieldProps<boolean | null> {
  /** A click goes unchecked → checked → indeterminate (`null`) → unchecked. Default `false`: checked and unchecked only. */
  threeState?: Bind<boolean>;
}
