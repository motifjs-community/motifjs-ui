import type { Bind } from '@motifx/core';

/**
 * Where a child of a `Grid` goes, in its own props: `<TextBox row={2} column={1} columnSpan={2} />`.
 * Lines count from 1, as in CSS; a string is passed to CSS as it is (`'-1'`, `'span 2'`).
 */
export interface GridCell {
  row?: Bind<number | string>;
  column?: Bind<number | string>;
  rowSpan?: Bind<number>;
  columnSpan?: Bind<number>;
}
