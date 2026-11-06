import type { EventArgs } from '@motifx/core';
import type { TreeView } from './TreeView';

/** Provides data for the events before a branch expands or collapses. Set `cancel = true` to keep the current state. */
export interface TreeViewExpandingEventArgs<T> extends EventArgs {
  item: T;
  key: unknown;
  /** `true` when the user expanded or collapsed the row, and `false` when it changed programmatically. */
  byUser: boolean;
  source: TreeView<T>;
  event?: Event;
}
