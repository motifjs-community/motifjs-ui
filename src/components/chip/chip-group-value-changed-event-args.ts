import type { ChipGroup } from './ChipGroup';

export interface ChipGroupValueChangedEventArgs {
  /** The value of the selected chip (`single`, or `null` for none), or the values of each selected chip (`multiple`). */
  value: unknown;
  /** `true` when the user clicked a chip, and `false` when the value was set programmatically. */
  byUser: boolean;
  source: ChipGroup;
}
