/**
 * The keys of `TabDocumentManager`, each a list of chords such as `'Ctrl+W'`, or two in a row such as
 * `'Ctrl+K W'` (see `addShortcut`). They work while focus is inside the manager, and the strip and
 * splitter keys work only on a tab or a splitter.
 */
export interface TabDocumentKeys {
  nextTab: string[];
  previousTab: string[];
  closeTab: string[];
  /** Hides the active document. `show`, or "Show hidden" in the menus, restores it. */
  hide: string[];
  /** Closes the documents of the active group. Pinned documents stay while `keepPinned` is on. */
  closeAllTabs: string[];
  /** Closes the documents of the active group that have no unsaved changes. */
  closeSavedTabs: string[];
  /** Sets focus on the n-th group, where `{n}` is 1 to 9. */
  focusGroup: string[];
  splitRight: string[];
  /** Opens the list of recently used documents. While it is open, moves to the next or previous document. */
  recentNext: string[];
  recentPrevious: string[];
  /** Moves back and forward through the most recently activated documents, across groups. */
  goBack: string[];
  goForward: string[];
  /** Reopens the most recently closed document. */
  reopenClosed: string[];
  /** Keeps the active preview tab open. */
  keepOpen: string[];
  /** Pins or unpins the active document. */
  togglePin: string[];
  /** Opens the group's list of open documents (the "…" button). */
  showOpenList: string[];
  /** On a tab, moves to the next or previous tab in the strip (reversed right to left), or to the first or last. */
  stripNext: string[];
  stripPrevious: string[];
  stripFirst: string[];
  stripLast: string[];
  /** On a tab, closes it. */
  closeFocusedTab: string[];
  /**
   * Moves the active tab one position toward the start or end of its strip, without passing the
   * boundary between pinned and other tabs.
   */
  moveTabLeft: string[];
  moveTabRight: string[];
  /** Moves the active document to the next or previous group, or to a new group when there is none. */
  moveToNextGroup: string[];
  moveToPreviousGroup: string[];
  /** Moves the active document to the group on that side, or to a new group there. */
  moveToGroupLeft: string[];
  moveToGroupRight: string[];
  moveToGroupUp: string[];
  moveToGroupDown: string[];
  /** Starts "Move to…" for the active document. */
  moveTo: string[];
  /**
   * In "Move to…", chooses a side of the group or the next group in that direction, moves to the next
   * or previous group, moves the item to the chosen position, or cancels.
   */
  targetLeft: string[];
  targetRight: string[];
  targetUp: string[];
  targetDown: string[];
  targetNextGroup: string[];
  targetPreviousGroup: string[];
  targetDrop: string[];
  targetCancel: string[];
  /** On a splitter, makes the group before it smaller or larger, or as small or as large as it can be. */
  resizeSmaller: string[];
  resizeLarger: string[];
  resizeMin: string[];
  resizeMax: string[];
  /** Moves the active document into its own floating window. */
  float: string[];
  /** Returns the active document from a floating window to where it was docked. */
  dock: string[];
  /** Moves the active document into the dock area on that side. */
  dockLeft: string[];
  dockRight: string[];
  dockTop: string[];
  dockBottom: string[];
  /** Collapses the active document's dock area to its edge, or restores it. */
  toggleAutoHide: string[];
  /** Moves focus to the next or previous part: the documents, each dock area and each floating window. */
  nextPart: string[];
  previousPart: string[];
  /**
   * In a collapsed dock area's strip of titles, moves to the next or previous title. Home and End are
   * `stripFirst` and `stripLast`.
   */
  autoHideNext: string[];
  autoHidePrevious: string[];
  /** In a floating window, moves and resizes it with the keys below until Enter or Escape. */
  moveWindow: string[];
  /** In a floating window, maximizes it within the page or restores it. */
  maximizeWindow: string[];
  /** In a floating window, closes it with its documents. */
  closeWindow: string[];
  /** Moves the active document into its own new browser window. */
  moveToNewWindow: string[];
  /** In a new browser window, moves the active document back to the main window. */
  moveToMainWindow: string[];
  /** While moving a window with the keys, moves it, resizes it, keeps the change, or reverts it. */
  windowLeft: string[];
  windowRight: string[];
  windowUp: string[];
  windowDown: string[];
  windowNarrower: string[];
  windowWider: string[];
  windowShorter: string[];
  windowTaller: string[];
  windowDone: string[];
  windowCancel: string[];
}
