import { data } from '@motifx-community/data';
import type { GridColumn } from '../grid-column';

/** The raw value of a column in a row: its `value` reader, else the field. */
export function cellValue<T>(col: GridColumn<T>, row: T | undefined): unknown {
  if (row === undefined || row === null) return undefined;
  return col.value ? col.value(row) : data.getField(row, col.field);
}
