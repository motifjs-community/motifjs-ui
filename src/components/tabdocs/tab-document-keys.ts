/**
 * The keys of `TabDocumentManager`, each a list of chords (`'Ctrl+W'`, or two in a row: `'Ctrl+K W'`;
 * see `addShortcut`). They work while focus is inside the manager; the strip and splitter keys only
 * on a tab or a splitter.
 */
export interface TabDocumentKeys {
  nextTab: string[];
  previousTab: string[];
  closeTab: string[];
  /** Hides the active document; `show`, or "Show hidden" in the menus, brings it back. */
  hide: string[];
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
  /** Moves the active tab a place to the start or the end of its strip (not past the pinned or the other tabs). */
  moveTabLeft: string[];
  moveTabRight: string[];
  /** Moves the active document to the next or previous group (a new one when there is none). */
  moveToNextGroup: string[];
  moveToPreviousGroup: string[];
  /** Moves the active document to the group on that side, or into a new group there. */
  moveToGroupLeft: string[];
  moveToGroupRight: string[];
  moveToGroupUp: string[];
  moveToGroupDown: string[];
  /** Starts "Move to…" for the active document. */
  moveTo: string[];
  /** In "Move to…": a side of the group, or the next group that way; the next and previous group; move there; leave it. */
  targetLeft: string[];
  targetRight: string[];
  targetUp: string[];
  targetDown: string[];
  targetNextGroup: string[];
  targetPreviousGroup: string[];
  targetDrop: string[];
  targetCancel: string[];
  /** On a splitter: makes the group before it smaller or larger, as small or as large as it can be. */
  resizeSmaller: string[];
  resizeLarger: string[];
  resizeMin: string[];
  resizeMax: string[];
  /** Moves the active document into a floating window of its own. */
  float: string[];
  /** Puts the active document back where it was docked (from a floating window). */
  dock: string[];
  /** Moves the active document into the dock area on that side. */
  dockLeft: string[];
  dockRight: string[];
  dockTop: string[];
  dockBottom: string[];
  /** Folds the active document's dock area to its edge, or brings it back. */
  toggleAutoHide: string[];
  /** Focus to the next or previous part: the documents, each dock area, each floating window. */
  nextPart: string[];
  previousPart: string[];
  /** In a folded dock area's strip of titles: the next and the previous title (Home and End are `stripFirst`, `stripLast`). */
  autoHideNext: string[];
  autoHidePrevious: string[];
  /** In a floating window: moves and resizes it with the keys below until Enter or Escape. */
  moveWindow: string[];
  /** In a floating window: maximizes it within the page, or restores it. */
  maximizeWindow: string[];
  /** In a floating window: closes it with its documents. */
  closeWindow: string[];
  /** Moves the active document into a new browser window of its own. */
  moveToNewWindow: string[];
  /** In a new browser window: moves the active document back to the main window. */
  moveToMainWindow: string[];
  /** While moving a window by keys: moves it, makes it narrower, wider, shorter, taller; keeps it there; puts it back. */
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
