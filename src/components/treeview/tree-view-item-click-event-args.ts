import type { TreeView } from './TreeView';

/** Provides data for the event that occurs when a row is clicked, or when Enter is pressed on it. */
export interface TreeViewItemClickEventArgs<T> {
  item: T;
  key: unknown;
  source: TreeView<T>;
  event: Event;
}
