/**
 * The keys of `TabDocumentManager`, each a list of chords (`'Ctrl+W'`, or two in a row: `'Ctrl+K W'`;
 * see `addShortcut`). They work while focus is inside the manager; the strip and splitter keys only
 * on a tab or a splitter.
 */
export interface TabDocumentKeys {
  nextTab: string[];
  previousTab: string[];
  closeTab: string[];
  /** Closes the active group's documents (pinned ones stay while `keepPinned` is on). */
  closeAllTabs: string[];
  /** Closes the active group's documents that have no unsaved changes. */
  closeSavedTabs: string[];
  /** `{n}` stands for 1 to 9: the n-th group. */
  focusGroup: string[];
  splitRight: string[];
  /** Opens the list of recently used documents; again while it is open, the next (the previous) one. */
  recentNext: string[];
  recentPrevious: string[];
  /** Back and forward over the documents activated last, across groups. */
  goBack: string[];
  goForward: string[];
  /** Opens the document closed last again. */
  reopenClosed: string[];
  /** Keeps the active preview tab open. */
  keepOpen: string[];
  /** Pins or unpins the active document. */
  togglePin: string[];
  /** Opens the group's list of open documents (the "…" button). */
  showOpenList: string[];
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
