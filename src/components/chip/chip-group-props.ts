import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { ChipGroupSelection } from './chip-group-selection';
import type { ChipGroupValueChangedEventArgs } from './chip-group-value-changed-event-args';

/** Props of `ChipGroup`. Each prop is also a settable property, and a function is tracked. */
export interface ChipGroupProps extends ControlProps {
  /** The default is `'none'`. */
  selection?: Bind<ChipGroupSelection>;
  /** The value of the selected chip (`single`), or an array of selected values (`multiple`). */
  value?: Bind<unknown>;
  /** `false` keeps the chips on one line that scrolls. The default is `true`. */
  wrap?: Bind<boolean>;
  /** The accessible name of the group ("Filters"). */
  label?: Bind<string>;
  onValueChanged?: (e: ChipGroupValueChangedEventArgs) => void;
}
