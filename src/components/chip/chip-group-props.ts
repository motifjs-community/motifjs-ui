import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { ChipGroupSelection } from './chip-group-selection';
import type { ChipGroupValueChangedEventArgs } from './chip-group-value-changed-event-args';

/** Props of `ChipGroup`. Each prop is also a settable property, and a function is tracked. */
export interface ChipGroupProps extends ControlProps {
  /** Default `'none'`. */
  selection?: Bind<ChipGroupSelection>;
  /** The selected chip's value (`single`), or an array of the selected ones' values (`multiple`). */
  value?: Bind<unknown>;
  /** `false` keeps the chips on one line that scrolls. Default `true`. */
  wrap?: Bind<boolean>;
  /** What screen readers call the group ("Filters"). */
  label?: Bind<string>;
  onValueChanged?: (e: ChipGroupValueChangedEventArgs) => void;
}
