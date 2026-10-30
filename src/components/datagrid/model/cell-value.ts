import { untracked } from '@motifx/core';
import { data } from '@motifx-community/data';
import type { GridColumn } from '../grid-column';

/** The raw value of a column in a row: its `value` reader, else the field. Read untracked: the row is the developer's, plain or reactive. */
export function cellValue<T>(col: GridColumn<T>, row: T | undefined): unknown {
  if (row === undefined || row === null) return undefined;
  const reader = col.value;
  return untracked(() => (reader ? reader(row) : data.getField(row, col.field)));
}
