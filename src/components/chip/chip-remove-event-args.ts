import type { Chip } from './Chip';

/** The user asked to remove a chip (its remove button, or Delete / Backspace); removing it is yours to do. */
export interface ChipRemoveEventArgs {
  /** `true` when asked with the keyboard. */
  byKeyboard: boolean;
  source: Chip;
}
