import type { EventArgs } from '@motifx/core';

/** Occurs when a header or chip is dropped to change the grouping. Set `cancel = true` to keep the grouping. */
export interface GridGroupDroppingEventArgs extends EventArgs {
  readonly field: string;
  /** What was dragged: a column's header, or a chip of the group panel. */
  readonly from: 'header' | 'chip';
  /** Where it was dropped: on the group panel, or back on the headers. */
  readonly to: 'panel' | 'headers';
  /** The position where it lands: among the chips on the panel, or among the columns of its zone on the headers. */
  readonly index: number;
}
