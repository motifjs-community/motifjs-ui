import type { TreeView } from './TreeView';

export interface TreeViewSelectionChangedEventArgs<T> {
  /** The selected key (`single`) or keys (`multiple`). */
  value: unknown;
  items: T[];
  /** `true` when the user selected, `false` when code did. */
  byUser: boolean;
  source: TreeView<T>;
  event?: Event;
}
