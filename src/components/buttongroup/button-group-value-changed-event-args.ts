import type { ButtonGroup } from './ButtonGroup';

export interface ButtonGroupValueChangedEventArgs<T = unknown> {
  /** The chosen value (`single`, `null` for none) or an array of the values turned on (`multiple`). */
  value: T | T[] | null;
  /** `true` when the user pressed a button, `false` when code set the value. */
  byUser: boolean;
  source: ButtonGroup<T>;
}
