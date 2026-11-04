import type { Chip } from './Chip';

export interface ChipSelectedChangedEventArgs {
  selected: boolean;
  /** `true` when the user pressed it, `false` when code set it. */
  byUser: boolean;
  source: Chip;
}
