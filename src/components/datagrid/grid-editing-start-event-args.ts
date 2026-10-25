import type { EventArgs } from '@motifx/core';

/** A cell is about to be edited (its editor opens); `cancel` keeps it as it is. */
export interface GridEditingStartEventArgs<T> extends EventArgs {
  readonly field: string;
  readonly row: T;
  readonly rowIndex: number;
  readonly isNew: boolean;
}
