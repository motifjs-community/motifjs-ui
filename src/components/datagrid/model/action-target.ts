import type { GridSelection } from '../grid-selection';

/**
 * What the bars' actions act on: nothing, loaded rows (the selected ones or the active one), or a
 * selection whose rows are not all loaded ("select all" over a server), kept as a state.
 */
export type ActionTarget<T> =
  | { kind: 'none' }
  | { kind: 'rows'; rows: T[]; from: 'selection' | 'focused' }
  | { kind: 'selection'; selection: GridSelection; count: number };
