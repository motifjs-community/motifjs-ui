import type { Bind } from '@motifx/core';

/**
 * The position of a child of a `Grid`, in its own props: `<TextBox row={2} column={1} columnSpan={2} />`.
 * Lines are counted from 1, as in CSS, and a string is passed to CSS as is (`'-1'`, `'span 2'`).
 */
export interface GridCell {
  row?: Bind<number | string>;
  column?: Bind<number | string>;
  rowSpan?: Bind<number>;
  columnSpan?: Bind<number>;
}
