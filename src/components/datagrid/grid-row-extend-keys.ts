/**
 * The keys that extend a multiple row selection from the anchor as the active row moves: one row up or
 * down, or one screen of rows up or down. Each is a list of chords.
 */
export interface GridRowExtendKeys {
  up: readonly string[];
  down: readonly string[];
  pageUp: readonly string[];
  pageDown: readonly string[];
}
