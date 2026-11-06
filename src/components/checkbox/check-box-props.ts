import type { Bind } from '@motifx/core';
import type { ToggleFieldProps } from './toggle-field-props';

/** Props of `CheckBox`. Each prop is also a settable, reactive property. */
export interface CheckBoxProps extends ToggleFieldProps<boolean | null> {
  /**
   * A click cycles through unchecked, checked and indeterminate (`null`). The default is `false`, which allows only
   * checked and unchecked.
   */
  threeState?: Bind<boolean>;
}
