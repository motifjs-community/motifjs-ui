/** What a row of the grid is: a data row, a new row not saved yet, a group row, a group's footer, the row of totals, a row's details (`masterDetail`), or a row's adaptive detail (the columns the width hides). */
export type GridRowType = 'data' | 'new' | 'group' | 'groupFooter' | 'totalFooter' | 'detail' | 'detailAdaptive';
