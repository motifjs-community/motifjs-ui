import type { Bind } from '@motifx/core';
import type { ToggleFieldProps } from '../checkbox/toggle-field-props';
import type { SwitchStateText } from './switch-state-text';

/** Props of `Switch`. Each prop is also a settable, reactive property. */
export interface SwitchProps extends ToggleFieldProps<boolean> {
  /** Shown while it is on, such as `On`. */
  onText?: Bind<string>;
  /** Shown while it is off, such as `Off`. */
  offText?: Bind<string>;
  /** Where the on / off text appears. The default is `'inside'`. */
  showStateText?: Bind<SwitchStateText>;
}
