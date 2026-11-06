import type { Chip } from './Chip';

export interface ChipSelectedChangedEventArgs {
  selected: boolean;
  /** `true` when the user clicked the chip, and `false` when it was set programmatically. */
  byUser: boolean;
  source: Chip;
}
