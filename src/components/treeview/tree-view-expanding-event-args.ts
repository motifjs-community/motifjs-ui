import type { EventArgs } from '@motifx/core';
import type { TreeView } from './TreeView';

/** A branch is about to open (or close); `cancel = true` leaves it as it is. */
export interface TreeViewExpandingEventArgs<T> extends EventArgs {
  item: T;
  key: unknown;
  /** `true` when the user did it, `false` when code did. */
  byUser: boolean;
  source: TreeView<T>;
  event?: Event;
}
