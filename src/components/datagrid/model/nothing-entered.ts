import { untracked } from '@motifx/core';
import { data } from '@motifx-community/data';

/** The context of a row nothing was entered in (or of no row): every value is the row's own. */
export function nothingEntered<T>(row: T | null | undefined): data.RowCheckContext<T> {
  return {
    values: {} as Partial<T>,
    isNew: false,
    getValue: (field) => (row === null || row === undefined ? undefined : untracked(() => data.getField(row, field))),
  };
}
