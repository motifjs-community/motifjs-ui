import type { Bind } from '@motifx/core';
import type { FieldProps } from '../../parts/field/field-props';
import type { ColorBoxApply } from './color-box-apply';

/** Props of `ColorBox`: a field (label, help text, rules, `x-model`) plus its own. Each one is also a settable, reactive property. */
export interface ColorBoxProps extends FieldProps<string | null> {
  /** An opacity strip and input; the value keeps its opacity (`#rrggbbaa`). Default `false`. */
  alpha?: Bind<boolean>;
  /** Preset colours in the popup. Default: none. */
  palette?: Bind<readonly string[] | null>;
  /** `instantly`: the value follows every move in the popup; `useButtons`: it changes on OK, Cancel leaves it. Default `'instantly'`. */
  apply?: Bind<ColorBoxApply>;
  /** A button that empties it. Default `false`. */
  clearButton?: Bind<boolean>;
  placeholder?: Bind<string>;
}
