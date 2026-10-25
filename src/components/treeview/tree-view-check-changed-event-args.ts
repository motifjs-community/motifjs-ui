import type { TreeCheckState } from './tree-check-state';
import type { TreeView } from './TreeView';

export interface TreeViewCheckChangedEventArgs<T> {
  /** The item that was pressed; `null` when many changed at once (`checkAll`, `checkedKeys`). */
  item: T | null;
  key: unknown;
  state: TreeCheckState;
  /** Every checked key after the change. */
  keys: unknown[];
  /** `true` when the user checked, `false` when code did. */
  byUser: boolean;
  source: TreeView<T>;
}
