/**
 * The keys of `TabDocumentManager`, each a list of chords (`'Ctrl+W'`, see `addShortcut`). They work
 * while focus is inside the manager; the strip and splitter keys only on a tab or a splitter.
 */
export interface TabDocumentKeys {
  nextTab: string[];
  previousTab: string[];
  closeTab: string[];
  /** `{n}` stands for 1 to 9: the n-th group. */
  focusGroup: string[];
  splitRight: string[];
  /** On a tab: the next and previous tab in the strip (the other way round right to left), the first and the last. */
  stripNext: string[];
  stripPrevious: string[];
  stripFirst: string[];
  stripLast: string[];
  /** On a tab: closes it. */
  closeFocusedTab: string[];
  /** On a splitter: makes the group before it smaller or larger, as small or as large as it can be. */
  resizeSmaller: string[];
  resizeLarger: string[];
  resizeMin: string[];
  resizeMax: string[];
}
