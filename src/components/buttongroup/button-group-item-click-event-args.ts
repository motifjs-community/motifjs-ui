import type { ButtonGroup } from './ButtonGroup';

/** A button of the group was pressed (with any selection). */
export interface ButtonGroupItemClickEventArgs<T = unknown> {
  /** The item as given. */
  item: unknown;
  value: T;
  source: ButtonGroup<T>;
}
