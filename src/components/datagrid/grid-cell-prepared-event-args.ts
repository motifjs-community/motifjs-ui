import type { ComponentBase } from '@motifx/core';

/**
 * Occurs when a cell is rendered for a row, so that you can style or extend it. The part is reused
 * for other rows while scrolling, so always set and clear what you change (`class.toggle`,
 * `attr`).
 */
export interface GridCellPreparedEventArgs<T> {
  readonly field: string;
  readonly row: T;
  readonly rowIndex: number;
  /** The displayed value, which is the unsaved value when there is one. */
  readonly value: unknown;
  readonly isNew: boolean;
  /** The cell's part. */
  readonly part: ComponentBase;
}
