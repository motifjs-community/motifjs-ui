/**
 * The keys that extend the last cell range from its far corner, by where the corner goes: a cell
 * up, down, left or right, a screen of rows up or down, the row's first or last cell (`home`,
 * `end`), the first or last row (`top`, `bottom`), the row's leftmost or rightmost cell, the very
 * first or last cell. Each is a list of chords (`'Shift+ArrowUp'`, `'Mod+Shift+End'`).
 */
export interface GridCellExtendKeys {
  up: readonly string[];
  down: readonly string[];
  left: readonly string[];
  right: readonly string[];
  pageUp: readonly string[];
  pageDown: readonly string[];
  home: readonly string[];
  end: readonly string[];
  top: readonly string[];
  bottom: readonly string[];
  leftmost: readonly string[];
  rightmost: readonly string[];
  first: readonly string[];
  last: readonly string[];
}
