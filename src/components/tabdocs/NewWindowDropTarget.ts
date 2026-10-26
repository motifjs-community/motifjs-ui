import type { TabDocumentManager } from './TabDocumentManager';
import type { TabDragSubject } from './tab-drag-subject';
import type { TabDropMarks } from './tab-drop-marks';
import type { TabDropPlace } from './tab-drop-place';
import type { TabDropTarget } from './tab-drop-target';

/**
 * Where a drag goes past the edge of its browser window: from the main window into a new window
 * at that place on the screen, from a new window back to the main window. The drag finds these
 * places itself (the pointer is outside every manager there); this target makes the drop.
 */
export class NewWindowDropTarget implements TabDropTarget {
  readonly kinds = ['new-window', 'main-window'];

  constructor(private readonly manager: TabDocumentManager) {}

  /** Points inside a window are never this target's. */
  placeAt(): TabDropPlace | null {
    return null;
  }

  marks(): TabDropMarks {
    return { area: null, mark: null };
  }

  drop(place: TabDropPlace, drag: TabDragSubject): boolean {
    return this.manager.dropAt(place, drag);
  }
}
