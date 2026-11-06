import type { TreeCheckState } from './tree-check-state';
import type { TreeView } from './TreeView';

export interface TreeViewCheckChangedEventArgs<T> {
  /** The item that was clicked, or `null` when several rows changed at once (`checkAll`, `checkedKeys`). */
  item: T | null;
  key: unknown;
  state: TreeCheckState;
  /** Every checked key after the change. */
  keys: unknown[];
  /** `true` when the user checked the row, and `false` when it changed programmatically. */
  byUser: boolean;
  source: TreeView<T>;
}
