import type { EventArgs } from '@motifx/core';

/** A group is about to open or close (by the user or from code); `cancel` keeps it as it is. */
export interface GridRowExpandingEventArgs extends EventArgs {
  /** The values of the groups from the top level down to this one. */
  readonly key: readonly unknown[];
}
