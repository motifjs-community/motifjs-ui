import type { TabDragSubject } from './tab-drag-subject';
import type { TabDropMarks } from './tab-drop-marks';
import type { TabDropPlace } from './tab-drop-place';

/**
 * Something a dragged document or group can be dropped on. A manager asks its targets in order and
 * the first answer wins: the docking one first (the dock guides, folded areas, floating), the
 * built-in one (the strips, the groups and the edges of the layout) last. An app's targets come
 * first (`addDropTarget`).
 */
export interface TabDropTarget {
  /** The kinds of place it answers with (`TabDropPlace.target`). */
  readonly kinds: readonly string[];
  /** Where a drop at this point of the viewport would land; `null` when not on this target. */
  placeAt(x: number, y: number, drag: TabDragSubject): TabDropPlace | null;
  marks(place: TabDropPlace, drag: TabDragSubject): TabDropMarks;
  /** Makes the drop; returns whether it happened. */
  drop(place: TabDropPlace, drag: TabDragSubject): boolean;
  /** Told where the pointer is while it is over this target's manager (or one of its floating windows), and `null` once it leaves or the drag ends. */
  follow?(point: { x: number; y: number } | null, drag: TabDragSubject): void;
}
