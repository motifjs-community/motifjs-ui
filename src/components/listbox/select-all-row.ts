/** The "Select all" row a multiple list shows before its items. */
export const selectAllRow: { readonly selectAll: true } = Object.freeze({ selectAll: true as const });

export type SelectAllRow = typeof selectAllRow;
