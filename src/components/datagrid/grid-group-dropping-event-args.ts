import type { EventArgs } from '@motifx/core';

/** A header or a chip is dropped to change the grouping; `cancel` leaves the grouping as it is. */
export interface GridGroupDroppingEventArgs extends EventArgs {
  readonly field: string;
  /** What was dragged: a column's header, or a chip of the group panel. */
  readonly from: 'header' | 'chip';
  /** Where it was dropped: on the group panel, or back on the headers. */
  readonly to: 'panel' | 'headers';
  /** The place it lands: among the chips on the panel, among the columns of its zone on the headers. */
  readonly index: number;
}
