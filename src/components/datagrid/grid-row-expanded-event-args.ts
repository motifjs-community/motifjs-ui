/** A group opened or closed (by the user or from code). */
export interface GridRowExpandedEventArgs {
  /** The values of the groups from the top level down to this one. */
  readonly key: readonly unknown[];
}
