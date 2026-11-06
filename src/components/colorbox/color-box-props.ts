import type { Bind } from '@motifx/core';
import type { FieldProps } from '../../parts/field/field-props';
import type { ColorBoxApply } from './color-box-apply';

/**
 * Props of `ColorBox`, in addition to the field props (label, help text, rules, `x-model`). Each prop is also a
 * settable, reactive property.
 */
export interface ColorBoxProps extends FieldProps<string | null> {
  /** Adds an opacity strip and input, and the value keeps its opacity (`#rrggbbaa`). The default is `false`. */
  alpha?: Bind<boolean>;
  /** Preset colors in the popup. By default, there are none. */
  palette?: Bind<readonly string[] | null>;
  /**
   * With `instantly`, the value follows every change in the popup. With `useButtons`, it changes on OK, and Cancel
   * discards the change. The default is `'instantly'`.
   */
  apply?: Bind<ColorBoxApply>;
  /** Shows a button that clears the field. The default is `false`. */
  clearButton?: Bind<boolean>;
  placeholder?: Bind<string>;
}
