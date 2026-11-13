import { untracked } from '@motifx/core';
import { rectOf, type Rect } from '../../core/measure';
import type { DockGuideHit } from './dock-guide-hit';
import { DockGuides } from './DockGuides';
import type { TabDockSide } from './tab-dock-side';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabDragSubject } from './tab-drag-subject';
import type { TabDropMarks } from './tab-drop-marks';
import type { TabDropPlace } from './tab-drop-place';
import type { TabDropSide } from './tab-drop-side';
import type { TabDropTarget } from './tab-drop-target';
import type { TabGroup } from './TabGroup';

const SIDES: readonly TabDockSide[] = ['left', 'right', 'top', 'bottom'];
const CROSS: readonly TabDropSide[] = ['center', 'left', 'right', 'up', 'down'];

/**
 * The drop target of docking, asked before the built-in one: the dock guides (a cross over the
 * group under the pointer, one at each edge of the manager) when `dockGuides` is on, the strips of
 * folded dock areas, and floating, which a drop away from every guide and strip does. A floating
 * window moved by its title area stays where it is let go.
 */
export class DockDropTarget implements TabDropTarget {
  readonly kinds = ['dock-guide', 'dock-area', 'float'];
  private readonly guides: DockGuides;
  private pointed: DockGuideHit | null = null;

  constructor(private readonly manager: TabDocumentManager) {
    this.guides = new DockGuides(manager);
  }

  placeAt(x: number, y: number, drag: TabDragSubject): TabDropPlace | null {
    const m = this.manager;
    if (drag.window && drag.manager !== m) return null;
    const group = m.groupAt(x, y, drag.window ?? null);
    // In a new window there are no dock areas and no floating: only the guides over its groups.
    const main = m.hostIn(m.dragSpace) === m;
    const hit = m.dockGuides ? this.guides.hit(x, y) : null;
    let place: TabDropPlace | null = null;
    if (hit && 'dock' in hit) place = this.areaPlace(hit.dock, drag);
    else if (hit) place = this.guidePlace(hit.group, hit.side, drag);
    this.pointed = place ? hit : null;
    this.guides.point(this.pointed);
    if (place) return place;
    // The strips are the built-in target's.
    if (group && contains(rectOf(group.barPart), x, y)) return null;
    if (!main) return null;
    const folded = m.dockAreas.find((a) => a.autoHidden && a.strip && contains(rectOf(a.strip.part), x, y));
    if (folded) return this.areaPlace(folded.side, drag);
    if (drag.window || m.dockGuides) return m.floatPlace(drag, x, y);
    return null;
  }

  marks(place: TabDropPlace, drag: TabDragSubject): TabDropMarks {
    const m = this.manager;
    if (place.target === 'dock-guide') return m.layoutTarget.marks({ ...place, target: 'group' }, drag);
    if (place.target === 'dock-area' && place.dockSide) return { area: m.dockAreaBox(place.dockSide), mark: null };
    return { area: null, mark: null };
  }

  drop(place: TabDropPlace, drag: TabDragSubject): boolean {
    return this.manager.dropAt(place, drag);
  }

  /** The pointer is over this manager (`point`), or gone from it: the guides follow it. */
  follow(point: { x: number; y: number } | null, drag: TabDragSubject): void {
    const m = this.manager;
    if (!point || (drag.window && drag.manager !== m) || !untracked(() => m.dockGuides)) {
      this.pointed = null;
      this.guides.hide();
      return;
    }
    untracked(() => {
      const kinds = m.dockGuideKinds;
      const host = m.hostIn(m.dragSpace);
      const main = host === m;
      const group = kinds.includes('group') ? m.groupAt(point.x, point.y, drag.window ?? null) : null;
      const sides = group && group.acceptsDrop ? CROSS.filter((side) => !!this.guidePlace(group, side, drag)) : [];
      const docks = main && kinds.includes('edges') ? SIDES.filter((side) => !!this.areaPlace(side, drag)) : [];
      this.guides.show(sides.length ? group : null, sides, docks, host);
    });
  }

  /** Into the dock area of `side`; `null` when what is dragged may not go there, or is alone there already. */
  areaPlace(side: TabDockSide, drag: TabDragSubject): TabDropPlace | null {
    const m = this.manager;
    if (drag.manager !== m || !m.maySubject(drag, side)) return null;
    const area = drag.group.dockArea;
    if (!drag.window && area?.side === side && (area.groups.length === 1 && (!drag.document || drag.group.documents.length === 1))) return null;
    return { target: 'dock-area', manager: m, group: null, index: -1, side: null, dockSide: side };
  }

  /** A guide of the cross over a group: into it or beside it, as the group's own drop zones would. */
  guidePlace(group: TabGroup, side: TabDropSide, drag: TabDragSubject): TabDropPlace | null {
    const place = this.manager.layoutTarget.groupPlace(group, side, drag);
    return place ? { ...place, target: 'dock-guide' } : null;
  }

  dispose(): void {
    this.guides.dispose();
  }
}

function contains(box: Rect, x: number, y: number): boolean {
  return x >= box.left && x < box.right && y >= box.top && y < box.bottom;
}
