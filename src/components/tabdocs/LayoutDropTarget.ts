import type { ComponentBase } from '@motifx/core';
import { isRtl, rectOf, type Rect } from '../../core/measure';
import { itemPart } from './item-part';
import type { SplitDirection } from './split-direction';
import type { TabBrowserWindow } from './TabBrowserWindow';
import { TabSplit } from './TabSplit';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabDragSubject } from './tab-drag-subject';
import type { TabDropMarks } from './tab-drop-marks';
import type { TabDropTarget } from './tab-drop-target';
import type { TabDropPlace } from './tab-drop-place';
import type { TabDropSide } from './tab-drop-side';
import type { TabGroup } from './TabGroup';

const EDGES: readonly SplitDirection[] = ['left', 'right', 'up', 'down'];

/**
 * The drop target every manager has: a group's strip (among its tabs, or at the end), a group's
 * content (its centre, or one of its edges for a new group there), and the edges of the whole
 * layout (a thin band along the manager's sides, for a new group along that side); in a new
 * browser window, the edges of its layout.
 */
export class LayoutDropTarget implements TabDropTarget {
  readonly kinds = ['strip', 'group', 'edge'];

  constructor(private readonly manager: TabDocumentManager) {}

  placeAt(x: number, y: number, drag: TabDragSubject): TabDropPlace | null {
    const m = this.manager;
    if (drag.window && drag.manager !== m) return null;
    const group = m.groupAt(x, y, drag.window ?? null);
    if (!group || !group.acceptsDrop) return null;
    if (contains(rectOf(group.barPart), x, y)) return this.stripPlace(group, this.indexAt(group, x, y, drag), drag);
    // The dock guides take the place of the zones; a window moved docks by them or by a strip only.
    if (m.dockGuides || drag.window) return null;
    const content = rectOf(group.panelsPart);
    const edge = !group.window && !group.dockArea ? this.layoutEdgeAt(group, content, x, y) : null;
    const along = edge ? this.edgePlace(edge, drag, group.browserWindow) : null;
    if (along) return along;
    const side = this.sideAt(group, content, x, y);
    return side ? this.groupPlace(group, side, drag) : null;
  }

  marks(place: TabDropPlace, drag: TabDragSubject): TabDropMarks {
    const group = place.group;
    if (place.target === 'strip' && group) return { area: null, mark: this.markAt(group, place.index, drag) };
    if (place.target === 'group' && group && place.side) {
      return { area: half(rectOf(group.panelsPart), onScreen(place.side, group), 0.5), mark: null };
    }
    if (place.target === 'edge' && place.side && place.side !== 'center') return { area: this.edgeArea(place.side, place.browserWindow ?? null), mark: null };
    return { area: null, mark: null };
  }

  drop(place: TabDropPlace, drag: TabDragSubject): boolean {
    return this.manager.dropAt(place, drag);
  }

  /** The place among a group's tabs, `null` when nothing would change or the group takes nothing. */
  stripPlace(group: TabGroup, index: number, drag: TabDragSubject): TabDropPlace | null {
    if (!group.acceptsDrop || (!drag.document && drag.group === group)) return null;
    if (drag.window && group.window === drag.window) return null;
    if (drag.document && drag.copy && drag.group === group) return null;
    return { target: 'strip', manager: this.manager, group, index: this.clampIndex(group, index, drag), side: null };
  }

  /** Into a group or beside it; `null` when the group takes nothing there or nothing would change. */
  groupPlace(group: TabGroup, side: TabDropSide, drag: TabDragSubject): TabDropPlace | null {
    if (!group.acceptsDrop || !group.dropSidesNow.includes(side)) return null;
    if (drag.window && group.window === drag.window) return null;
    if (drag.group === group) {
      // A group onto itself, a document into the group it is in, or out of it into a group of its own beside it.
      if (!drag.document || side === 'center' || (!drag.copy && group.documents.length < 2)) return null;
    }
    return { target: 'group', manager: this.manager, group, index: -1, side };
  }

  /** A new group along an edge of the layout (of a new window's, `host`); `null` when nothing would change. */
  edgePlace(side: SplitDirection, drag: TabDragSubject, host: TabBrowserWindow | null = null): TabDropPlace | null {
    const m = this.manager;
    if (!m.layoutEdgeDrop) return null;
    const groups = m.groups.filter((g) => !g.window && !g.dockArea && g.browserWindow === host);
    const only = groups.length === 1 && drag.manager === m && groups[0] === drag.group;
    if (only && (!drag.document || (!drag.copy && groups[0].documents.length < 2))) return null;
    return { target: 'edge', manager: m, group: null, index: -1, side, browserWindow: host };
  }

  /** The place in a group's strip under the pointer: before the first tab whose middle is past it. */
  indexAt(group: TabGroup, x: number, y: number, drag: TabDragSubject): number {
    const rtl = isRtl(group);
    let index = 0;
    for (const tab of group.tabs) {
      if (tab.document === drag.document) continue;
      const box = rectOf(tab.headerPart);
      const middle = box.left + box.width / 2;
      // A row above the pointer's, or before it on the same row.
      if (y >= box.bottom || (y >= box.top && (rtl ? x < middle : x > middle))) index++;
      else break;
    }
    return index;
  }

  private clampIndex(group: TabGroup, index: number, drag: TabDragSubject): number {
    const doc = drag.document;
    const others = group.tabs.filter((t) => t.document !== doc).length;
    const at = Math.max(0, Math.min(index, others));
    if (!doc || this.manager.pinOnDrag) return at;
    // Pinned tabs stay among the pinned, the others among the others.
    const pinned = group.tabs.filter((t) => t.document !== doc && t.document.pinned).length;
    return doc.pinned ? Math.min(at, pinned) : Math.max(at, pinned);
  }

  private markAt(group: TabGroup, index: number, drag: TabDragSubject): DOMRect {
    const rtl = isRtl(group);
    const headers = group.tabs.filter((t) => t.document !== drag.document).map((t) => t.headerPart);
    const before = headers[index];
    const after = headers[index - 1];
    if (before) {
      const box = rectOf(before);
      return new DOMRect(rtl ? box.right : box.left, box.top, 0, box.height);
    }
    if (after) {
      const box = rectOf(after);
      return new DOMRect(rtl ? box.left : box.right, box.top, 0, box.height);
    }
    const strip = rectOf(group.rowPart);
    const bar = rectOf(group.barPart);
    return new DOMRect(rtl ? strip.right : strip.left, bar.top, 0, bar.height);
  }

  /** Which side of the content the pointer is near (`dropEdgeSize` from it), else the centre. */
  private sideAt(group: TabGroup, box: Rect, x: number, y: number): TabDropSide | null {
    const allowed = group.dropSidesNow;
    const across = size(this.manager.dropEdgeSize, box.width);
    const down = size(this.manager.dropEdgeSize, box.height);
    const rtl = isRtl(group);
    // How far into each edge band the pointer is, 0 at the edge, 1 at the band's inner end.
    const depth: [TabDropSide, number][] = [
      [rtl ? 'right' : 'left', (x - box.left) / across],
      [rtl ? 'left' : 'right', (box.right - x) / across],
      ['up', (y - box.top) / down],
      ['down', (box.bottom - y) / down],
    ];
    const near = depth.filter(([side, d]) => d < 1 && allowed.includes(side)).sort((a, b) => a[1] - b[1])[0];
    if (near) return near[0];
    return allowed.includes('center') ? 'center' : null;
  }

  /** The edge of the layout the pointer is on: a band along the content of a group that touches that edge. */
  private layoutEdgeAt(group: TabGroup, content: Rect, x: number, y: number): SplitDirection | null {
    const m = this.manager;
    const band = m.layoutEdgeSize;
    const host = group.browserWindow;
    const root = host ? host.root : m.rootItem;
    if (!m.layoutEdgeDrop || band <= 0 || !root) return null;
    const outer = rectOf(itemPart(root));
    const box = rectOf(group);
    const near: Record<SplitDirection, boolean> = {
      left: box.left - outer.left < 2 && x - content.left < band,
      right: outer.right - box.right < 2 && content.right - x < band,
      up: box.top - outer.top < 2 && y - content.top < band,
      down: outer.bottom - box.bottom < 2 && content.bottom - y < band,
    };
    const edge = EDGES.find((e) => near[e]);
    return edge ? (onScreen(edge, host ? host.part : m) as SplitDirection) : null;
  }

  /** The room a new group along an edge of the layout (of a new window's, `host`) would get. */
  private edgeArea(side: SplitDirection, host: TabBrowserWindow | null): DOMRect | null {
    const root = host ? host.root : this.manager.rootItem;
    if (!root) return null;
    const box = rectOf(itemPart(root));
    const horizontal = side === 'left' || side === 'right';
    const lined = root instanceof TabSplit && root.orientation === (horizontal ? 'horizontal' : 'vertical');
    const share = lined ? 1 / (root.children.length + 1) : 0.5;
    return half(box, onScreen(side, host ? host.part : this.manager), share);
  }
}

/** The side on the screen: right to left, a group's start (`left`) is on the right. Its own inverse. */
function onScreen(side: TabDropSide, of: ComponentBase): TabDropSide {
  if (!isRtl(of) || side === 'up' || side === 'down' || side === 'center') return side;
  return side === 'left' ? 'right' : 'left';
}

function contains(box: Rect, x: number, y: number): boolean {
  return x >= box.left && x < box.right && y >= box.top && y < box.bottom;
}

/** Pixels, or a share of `length` (`'30%'`). */
function size(value: number | string, length: number): number {
  const text = String(value).trim();
  const n = parseFloat(text);
  if (!(n > 0)) return 1;
  return text.endsWith('%') ? Math.max(1, (length * n) / 100) : n;
}

/** The part of a box on one side of it (all of it for the centre), `share` of it wide or tall; screen sides. */
function half(box: Rect, side: TabDropSide, share: number): DOMRect {
  if (side === 'center') return new DOMRect(box.left, box.top, box.width, box.height);
  if (side === 'left') return new DOMRect(box.left, box.top, box.width * share, box.height);
  if (side === 'right') return new DOMRect(box.right - box.width * share, box.top, box.width * share, box.height);
  if (side === 'up') return new DOMRect(box.left, box.top, box.width, box.height * share);
  return new DOMRect(box.left, box.bottom - box.height * share, box.width, box.height * share);
}
