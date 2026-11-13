import type { Component, ComponentBase } from '@motifx/core';
import { loose, removePart } from '../../core/draw-parts';
import { dockGuideMark } from '../../core/glyphs';
import { isRtl, rectOf, styleOf, type Rect } from '../../core/measure';
import { css, kept, mark } from '../../core/part-writes';
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
  private readonly cross = new Map<TabDropSide, Component<HTMLDivElement>>();
  private readonly edges = new Map<TabDockSide, Component<HTMLDivElement>>();
  /** Each shown guide's box, and what it stands for. */
  private shown: { guide: Component<HTMLDivElement>; box: Rect; hit: DockGuideHit }[] = [];
  /** Where they show: the manager, or a new window's part. */
  private host: ComponentBase;

  constructor(private readonly manager: TabDocumentManager) {
    this.host = manager;
  }

  /**
   * Shows the cross over `group` with the sides it may take, and the edge guides of `docks`. The
   * edge guides stay put; over a short or narrow manager the cross moves off them.
   */
  show(group: TabGroup | null, sides: readonly TabDropSide[], docks: readonly TabDockSide[], host: ComponentBase = this.manager): void {
    // The boxes are read before anything is written; the guides' size is a style read.
    const rtl = isRtl(host);
    const outer = rectOf(host);
    const box = group && sides.length ? rectOf(group.panelsPart) : null;
    if (host !== this.host) {
      this.hide();
      this.host = host;
    }
    const { size, gap } = this.guideSize();
    this.shown = [];
    const mx = outer.left + outer.width / 2 - size / 2;
    const my = outer.top + outer.height / 2 - size / 2;
    const edgeAt: Record<TabDockSide, [number, number]> = {
      left: [outer.left + gap, my],
      right: [outer.right - gap - size, my],
      top: [mx, outer.top + gap],
      bottom: [mx, outer.bottom - gap - size],
    };
    const edges: { guide: Component<HTMLDivElement>; place: TabDockSide; dock: TabDockSide }[] = [];
    for (const place of EDGES) {
      const dock = rtl && (place === 'left' || place === 'right') ? (place === 'left' ? 'right' : 'left') : place;
      const guide = this.guide(this.edges, place, place === 'top' ? 'up' : place === 'bottom' ? 'down' : place, 'edge');
      if (docks.includes(dock)) edges.push({ guide, place, dock });
      else kept(guide, false);
    }
    if (group && box) {
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
        const guide = this.guide(this.cross, place, place, 'cross');
        if (!sides.includes(side)) {
          kept(guide, false);
          continue;
        }
        this.put(guide, at[place][0], at[place][1], size, { group, side });
      }
    } else {
      for (const guide of this.cross.values()) if (!guide.isDisposed) kept(guide, false);
    }
    for (const { guide, place, dock } of edges) this.put(guide, edgeAt[place][0], edgeAt[place][1], size, { dock });
  }

  /** The guide under a point of the viewport. */
  hit(x: number, y: number): DockGuideHit | null {
    for (const g of this.shown) if (x >= g.box.left && x < g.box.right && y >= g.box.top && y < g.box.bottom) return g.hit;
    return null;
  }

  /** Marks the guide pointed at (`null`: none). */
  point(hit: DockGuideHit | null): void {
    for (const g of this.shown) mark(g.guide, 'data-pointed', g.hit === hit);
  }

  hide(): void {
    this.shown = [];
    for (const guide of [...this.cross.values(), ...this.edges.values()]) {
      // A guide goes with the part it is in (the manager, a closed window's part).
      if (guide.isDisposed) continue;
      kept(guide, false);
      mark(guide, 'data-pointed', false);
    }
  }

  dispose(): void {
    this.hide();
    for (const guide of [...this.cross.values(), ...this.edges.values()]) removePart(guide);
    this.cross.clear();
    this.edges.clear();
  }

  private put(guide: Component<HTMLDivElement>, x: number, y: number, size: number, hit: DockGuideHit): void {
    kept(guide, true);
    css(guide, 'left', `${Math.round(x)}px`);
    css(guide, 'top', `${Math.round(y)}px`);
    const left = Math.round(x);
    const top = Math.round(y);
    this.shown.push({ guide, box: { left, top, right: left + size, bottom: top + size, width: size, height: size }, hit });
  }

  /** A guide, made the first time; it goes along to the window the guides show in now, alive. */
  private guide<K extends string>(map: Map<K, Component<HTMLDivElement>>, key: K, mark: TabDropSide, kind: string): Component<HTMLDivElement> {
    let guide = map.get(key);
    if (!guide || guide.isDisposed) {
      guide = loose<HTMLDivElement>('div', 'mx-tabdocs__guide');
      guide.attr.add({ 'data-kind': kind, 'data-side': key, 'aria-hidden': 'true' });
      kept(guide, false);
      guide.controls.add(dockGuideMark(mark));
      map.set(key, guide);
    }
    if (guide.parent !== this.host) this.host.controls.add(guide);
    return guide;
  }

  /** How big a guide is and how far apart they stand: their style's (the gap), 32 and 8 pixels where nothing is laid out. */
  private guideSize(): { size: number; gap: number } {
    const style = styleOf(this.guide(this.cross, 'center', 'center', 'cross'), ['inline-size', 'width', 'column-gap']);
    const width = parseFloat(style['inline-size'] || style.width);
    const size = width > 0 ? width : 32;
    const gap = parseFloat(style['column-gap']);
    return { size, gap: Math.round(gap >= 0 ? gap : size / 4) };
  }
}
