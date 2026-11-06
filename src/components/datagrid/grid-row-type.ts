/**
 * The type of a grid row: a data row, an unsaved new row, a group row, a group footer, the totals row, a
 * row's details (`masterDetail`), or a row's adaptive detail (the columns the width hides).
 */
export type GridRowType = 'data' | 'new' | 'group' | 'groupFooter' | 'totalFooter' | 'detail' | 'detailAdaptive';
