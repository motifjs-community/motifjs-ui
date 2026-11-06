import type { TabDragSubject } from './tab-drag-subject';
import type { TabDropMarks } from './tab-drop-marks';
import type { TabDropPlace } from './tab-drop-place';

/**
 * A target that a dragged document or group can be dropped on. A manager checks its targets in order
 * and uses the first match: the docking target first (the dock guides, collapsed areas, floating), and
 * the built-in target (the strips, the groups and the edges of the layout) last. An application's
 * custom targets come first (`addDropTarget`).
 */
export interface TabDropTarget {
  /** The kinds of position it returns (`TabDropPlace.target`). */
  readonly kinds: readonly string[];
  /** Returns where a drop at this point of the viewport would land, or `null` when it is not on this target. */
  placeAt(x: number, y: number, drag: TabDragSubject): TabDropPlace | null;
  marks(place: TabDropPlace, drag: TabDragSubject): TabDropMarks;
  /** Performs the drop and returns whether it happened. */
  drop(place: TabDropPlace, drag: TabDragSubject): boolean;
  /**
   * Receives the pointer position while it is over this target's manager or one of its floating
   * windows, and `null` once it leaves or the drag ends.
   */
  follow?(point: { x: number; y: number } | null, drag: TabDragSubject): void;
}
