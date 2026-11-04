import type { ChipGroup } from './ChipGroup';

export interface ChipGroupValueChangedEventArgs {
  /** The value of the selected chip (`single`, `null` for none) or of each selected chip (`multiple`). */
  value: unknown;
  /** `true` when the user pressed a chip, `false` when code set the value. */
  byUser: boolean;
  source: ChipGroup;
}
