import type { TreeView } from './TreeView';

export interface TreeViewExpandedEventArgs<T> {
  item: T;
  key: unknown;
  /** `true` when the user expanded or collapsed the row, and `false` when it changed programmatically. */
  byUser: boolean;
  source: TreeView<T>;
}
