import type { TreeView } from './TreeView';

/** A row was pressed, or Enter was pressed on it. */
export interface TreeViewItemClickEventArgs<T> {
  item: T;
  key: unknown;
  source: TreeView<T>;
  event: Event;
}
