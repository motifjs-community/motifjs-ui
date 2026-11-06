import type { Chip } from './Chip';

/** The user asked to remove a chip (its remove button, or Delete / Backspace); your code performs the removal. */
export interface ChipRemoveEventArgs {
  /** `true` when asked with the keyboard. */
  byKeyboard: boolean;
  source: Chip;
}
