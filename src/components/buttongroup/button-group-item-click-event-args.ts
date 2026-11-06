import type { ButtonGroup } from './ButtonGroup';

/** Provides data for the event that occurs when a button of the group is clicked, with any selection mode. */
export interface ButtonGroupItemClickEventArgs<T = unknown> {
  /** The item as provided. */
  item: unknown;
  value: T;
  source: ButtonGroup<T>;
}
