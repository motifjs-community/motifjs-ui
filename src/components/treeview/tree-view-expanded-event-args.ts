import type { TreeView } from './TreeView';

export interface TreeViewExpandedEventArgs<T> {
  item: T;
  key: unknown;
  /** `true` when the user did it, `false` when code did. */
  byUser: boolean;
  source: TreeView<T>;
}
