import type { Bind } from '@motifx/core';
import type { ToggleFieldProps } from '../checkbox/toggle-field-props';
import type { SwitchStateText } from './switch-state-text';

/** Props of `Switch`. Each prop is also a settable, reactive property. */
export interface SwitchProps extends ToggleFieldProps<boolean> {
  /** Shown while it is on, e.g. `On`. */
  onText?: Bind<string>;
  /** Shown while it is off, e.g. `Off`. */
  offText?: Bind<string>;
  /** Where the on / off text shows. Default `'inside'`. */
  showStateText?: Bind<SwitchStateText>;
}
