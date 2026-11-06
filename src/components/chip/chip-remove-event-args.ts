import type { Chip } from './Chip';

/**
 * Provides data for the event that occurs when the user requests removal of a chip (its remove button, or Delete /
 * Backspace). Your code performs the removal.
 */
export interface ChipRemoveEventArgs {
  /** `true` when removal was requested with the keyboard. */
  byKeyboard: boolean;
  source: Chip;
}
