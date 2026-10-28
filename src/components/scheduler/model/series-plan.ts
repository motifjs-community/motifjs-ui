/** The writes a change to a series comes to: appointments to add, to change and to delete, in that order. */
export interface SeriesPlan<T> {
  add: Partial<T>[];
  update: { item: T; changes: Partial<T> }[];
  remove: T[];
}
