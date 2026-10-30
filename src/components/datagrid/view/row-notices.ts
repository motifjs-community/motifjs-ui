/**
 * The notices (`GridNotices`) each part of a data row reads: when one of them is told, the rows drawn now draw that
 * part again. Taken from what the parts read (the grid's state fields as `grid.` and the field); `settings` stands
 * for every set of switches read, each told by its owner's name (`rowDrag`, `details`, `adaptive`, `columns`).
 */
export const ROW_LOOK: ReadonlySet<string> = new Set([
  'actions', 'adaptive', 'columns', 'groups', 'selection', 'settings', 'rowDrag', 'details', 'adaptive', 'summaries', 'texts',
  'grid.activeField', 'grid.activeRow', 'grid.added', 'grid.connection', 'grid.edits', 'grid.page', 'grid.pageSize', 'grid.version',
]);

export const ROW_CELLS: ReadonlySet<string> = new Set([
  'columns', 'search', 'selection', 'settings', 'rowDrag', 'details', 'adaptive', 'texts',
  'grid.edits', 'grid.measured', 'grid.version',
]);

export const ROW_RANGES: ReadonlySet<string> = new Set([
  'columns', 'groups', 'ranges', 'selection', 'settings', 'rowDrag', 'details', 'adaptive',
  'grid.added', 'grid.connection', 'grid.edits', 'grid.page', 'grid.pageSize', 'grid.version',
]);

/** The same for the parts of a group row, and for a group's footer row. */
export const GROUP_LOOK: ReadonlySet<string> = new Set([
  'adaptive', 'columns', 'groups', 'settings', 'rowDrag', 'details',
  'grid.activeRow', 'grid.added', 'grid.connection', 'grid.edits', 'grid.version',
]);

export const GROUP_TEXT: ReadonlySet<string> = new Set(['columns', 'groups', 'settings', 'rowDrag', 'details', 'adaptive', 'summaries', 'texts', 'grid.measured']);

export const GROUP_SUMMARY: ReadonlySet<string> = new Set(['columns', 'settings', 'rowDrag', 'details', 'adaptive', 'summaries', 'texts']);

export const GROUP_FOOTER: ReadonlySet<string> = new Set([
  'adaptive', 'columns', 'groups', 'settings', 'rowDrag', 'details', 'summaries', 'texts',
  'grid.activeRow', 'grid.added', 'grid.connection', 'grid.edits',
]);

export const ROW_ACTIONS: ReadonlySet<string> = new Set([
  'actions', 'columns', 'groups', 'selection', 'settings', 'rowDrag', 'details', 'adaptive', 'texts',
  'grid.added', 'grid.connection', 'grid.editing', 'grid.edits', 'grid.rowHeight', 'grid.session',
]);
