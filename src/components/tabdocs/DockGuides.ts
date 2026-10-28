import { dockGuideMark } from '../../core/glyphs';
import type { TabDockSide } from './tab-dock-side';
import type { TabDocumentManager } from './TabDocumentManager';
import type { TabDropSide } from './tab-drop-side';
import type { DockGuideHit } from './dock-guide-hit';
import type { TabGroup } from './TabGroup';

const CROSS: readonly TabDropSide[] = ['center', 'left', 'right', 'up', 'down'];
const EDGES: readonly TabDockSide[] = ['left', 'right', 'top', 'bottom'];

/**
 * The dock guides a drag shows: a cross over the group under the pointer (its middle and four
 * sides) and one guide in the middle of each of the manager's edges. They sit above everything,
 * never take the pointer, and the one pointed at shows it. In a new browser window they show in it.
 */
export class DockGuides {
  private readonly cross = new Map<TabDropSide, HTMLDivElement>();
  private readonly edges = new Map<TabDockSide, HTMLDivElement>();
  /** Each shown guide's box, and what it stands for. */
  private shown: { el: HTMLDivElement; box: DOMRect; hit: DockGuideHit }[] = [];
  /** Where they show: the manager's element, or a new window's. */
  private root: HTMLElement;

  constructor(private readonly manager: TabDocumentManager) {
    this.root = manager.element;
  }

  /**
   * Shows the cross over `group` with the sides it may take, and the edge guides of `docks`. The
   * edge guides stay put; over a short or narrow manager the cross moves off them.
   */
  show(group: TabGroup | null, sides: readonly TabDropSide[], docks: readonly TabDockSide[], root: HTMLElement = this.manager.element): void {
    if (root !== this.root) {
      this.hide();
      this.root = root;
    }
    const { size, gap } = this.measure();
    const rtl = isRtl(root);
    this.shown = [];
    const outer = root.getBoundingClientRect();
    const mx = outer.left + outer.width / 2 - size / 2;
    const my = outer.top + outer.height / 2 - size / 2;
    const edgeAt: Record<TabDockSide, [number, number]> = {
      left: [outer.left + gap, my],
      right: [outer.right - gap - size, my],
      top: [mx, outer.top + gap],
      bottom: [mx, outer.bottom - gap - size],
    };
    const edges: { el: HTMLDivElement; place: TabDockSide; dock: TabDockSide }[] = [];
    for (const place of EDGES) {
      const dock = rtl && (place === 'left' || place === 'right') ? (place === 'left' ? 'right' : 'left') : place;
      const el = this.guide(this.edges, place, place === 'top' ? 'up' : place === 'bottom' ? 'down' : place, 'edge');
      if (docks.includes(dock)) edges.push({ el, place, dock });
      else el.hidden = true;
    }
    if (group && sides.length) {
      const box = group.panelsElement.getBoundingClientRect();
      let cx = box.left + box.width / 2 - size / 2;
      let cy = box.top + box.height / 2 - size / 2;
      // How far the arms reach from the middle guide's corner, and the room kept from an edge guide.
      const arm = size + gap;
      for (const { place } of edges) {
        const [ex, ey] = edgeAt[place];
        const across = place === 'top' || place === 'bottom' ? Math.abs(cx - ex) < size + arm : Math.abs(cy - ey) < size + arm;
        if (!across) continue;
        if (place === 'top') cy = Math.max(cy, ey + size + gap + arm);
        else if (place === 'bottom') cy = Math.min(cy, ey - gap - arm - size);
        else if (place === 'left') cx = Math.max(cx, ex + size + gap + arm);
        else cx = Math.min(cx, ex - gap - arm - size);
      }
      const at: Record<TabDropSide, [number, number]> = {
        center: [cx, cy],
        left: [cx - arm, cy],
        right: [cx + arm, cy],
        up: [cx, cy - arm],
        down: [cx, cy + arm],
      };
      for (const place of CROSS) {
        // Right to left, a group's start (`left`) is on the right: the guide on the screen's left stands for its end.
        const side = rtl && (place === 'left' || place === 'right') ? (place === 'left' ? 'right' : 'left') : place;
        const el = this.guide(this.cross, place, place, 'cross');
        if (!sides.includes(side)) {
          el.hidden = true;
          continue;
        }
        this.put(el, at[place][0], at[place][1], size, { group, side });
      }
    } else {
      for (const el of this.cross.values()) el.hidden = true;
    }
    for (const { el, place, dock } of edges) this.put(el, edgeAt[place][0], edgeAt[place][1], size, { dock });
  }

  /** The guide under a point of the viewport. */
  hit(x: number, y: number): DockGuideHit | null {
    for (const g of this.shown) if (x >= g.box.left && x < g.box.right && y >= g.box.top && y < g.box.bottom) return g.hit;
    return null;
  }

  /** Marks the guide pointed at (`null`: none). */
  point(hit: DockGuideHit | null): void {
    for (const g of this.shown) g.el.toggleAttribute('data-pointed', g.hit === hit);
  }

  hide(): void {
    this.shown = [];
    for (const el of [...this.cross.values(), ...this.edges.values()]) {
      el.hidden = true;
      el.removeAttribute('data-pointed');
    }
  }

  dispose(): void {
    this.hide();
    for (const el of [...this.cross.values(), ...this.edges.values()]) el.remove();
    this.cross.clear();
    this.edges.clear();
  }

  private put(el: HTMLDivElement, x: number, y: number, size: number, hit: DockGuideHit): void {
    el.hidden = false;
    el.style.left = `${Math.round(x)}px`;
    el.style.top = `${Math.round(y)}px`;
    this.shown.push({ el, box: new DOMRect(Math.round(x), Math.round(y), size, size), hit });
  }

  private guide<K extends string>(map: Map<K, HTMLDivElement>, key: K, mark: TabDropSide, kind: string): HTMLDivElement {
    let el = map.get(key);
    if (!el) {
      el = this.root.ownerDocument.createElement('div');
      el.className = 'mx-tabdocs__guide';
      el.dataset.kind = kind;
      el.dataset.side = key;
      el.hidden = true;
      el.setAttribute('aria-hidden', 'true');
      el.append(dockGuideMark(mark));
      map.set(key, el);
    }
    if (el.parentElement !== this.root) this.root.append(el);
    return el;
  }

  /** How big a guide is and how far apart they stand: their style's (the gap), 32 and 8 pixels where nothing is laid out. */
  private measure(): { size: number; gap: number } {
    const probe = this.cross.get('center') ?? this.guide(this.cross, 'center', 'center', 'cross');
    const style = this.root.ownerDocument.defaultView?.getComputedStyle(probe);
    const width = style ? parseFloat(style.inlineSize || style.width) : NaN;
    const size = width > 0 ? width : 32;
    const gap = style ? parseFloat(style.columnGap) : NaN;
    return { size, gap: Math.round(gap >= 0 ? gap : size / 4) };
  }
}

function isRtl(el: Element): boolean {
  const view = el.ownerDocument.defaultView;
  return !!view && view.getComputedStyle(el).direction === 'rtl';
}
