import type { ComponentBase } from '@motifx/core';

/** What selecting by dragging asks of the grid it works in. */
export interface DragSelectHost {
  /** The grid itself, marked while a drag selection runs. */
  readonly grid?: ComponentBase;
  /** The header cell part of a column, to find the column under the pointer. */
  headerCellPart?(field: string): ComponentBase | undefined;
  isRtl(): boolean;
  /** The rows scrolled sideways: virtual columns follow. */
  columnsScrolled(): void;
  /**
   * A drag passed the threshold on grid row `index`, column `field`: rows from there (`how` the keys
   * held said), or a range from that cell. Returns whether it goes on.
   */
  begin(kind: 'rows' | 'cells', index: number, field: string, how: 'replace' | 'add' | 'extend' | 'paint'): boolean;
  /** The pointer is over grid row `index`, column `field` now. */
  reach(kind: 'rows' | 'cells', index: number, field: string): void;
  /** The drag ended; `kept` false when Escape gave it up. */
  finish(kind: 'rows' | 'cells', kept: boolean): void;
}
