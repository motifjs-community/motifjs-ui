import type { ButtonGroup } from './ButtonGroup';

export interface ButtonGroupValueChangedEventArgs<T = unknown> {
  /** The selected value (`single`, or `null` for none) or an array of the values that are on (`multiple`). */
  value: T | T[] | null;
  /** `true` when the user clicked a button, and `false` when the value was set programmatically. */
  byUser: boolean;
  source: ButtonGroup<T>;
}
