import { Component, ComponentBase, untracked } from '@motifx/core';
import { orderControls } from '../../../core/order-controls';
import { glyphPart, loose, part, removePart, textPart } from '../../../core/draw-parts';
import { css, mark, put, text as writeText } from '../../../core/part-writes';
import { measure, rectOf } from '../../../core/measure';
import type { BandCellContext } from '../band-cell-context';
import type { GridModel } from '../model/GridModel';
import { dropPlace } from './drop-place';
import type { HeaderHost } from './header-host';
import type { HeaderRow } from './HeaderRow';

/**
 * The rows of band headers above the header row: a row per level of bands, each band's header over
 * its columns (`aria-colindex` of its first one, `aria-colspan`), the places over other columns
 * empty. Over a pinned column no band covers stands an empty piece that stays with it. Parts of
 * the head's row group, before the header row. Dragging a band's header moves the band,
 * with its columns, among the columns and bands beside it; its menu button opens its menu. It
 * follows nothing: each band's header draws itself again whenever the grid tells a change.
 */
export class BandRows<T> {
  /** The band rows, components of the head before the header row. */
  readonly rows: Component<HTMLDivElement>[] = [];
  /** The mark of where a dragged band lands, over every header row. */
  readonly indicator: Component<HTMLDivElement>;
  /** The bands' headers, by band: each a component of its row, its title a component holding a band's own content. */
  private readonly cells = new Map<string, Component<HTMLDivElement>>();
  /** The empty pieces over pinned columns, by row and field. */
  private readonly fillers: Map<string, Component<HTMLDivElement>>[] = [];
  private readonly stops: (() => void)[] = [];
  /** What draws each band's header, by band. */
  private readonly drawers = new Map<string, () => void>();
  private head: ComponentBase | null = null;

  constructor(
    private readonly grid: GridModel<T>,
    private readonly host: HeaderHost,
    private readonly header: HeaderRow<T>,
  ) {
    const indicator = loose<HTMLDivElement>('div', 'mx-data-grid__drop');
    indicator.attr.add({ 'aria-hidden': 'true' });
    mark(indicator, 'hidden', true);
    this.indicator = indicator;
    this.stops.push(grid.notices.on(() => this.draw()));
  }

  /** Draws every band's header as the grid is now. */
  draw() {
    untracked(() => {
      for (const draw of this.drawers.values()) draw();
    });
  }

  /** The header of a band, while it is placed in its row. */
  cellPart(id: string): Component<HTMLDivElement> | undefined {
    const cell = this.cells.get(id);
    return cell?.parent ? cell : undefined;
  }

  /** Lays the rows out over the visible columns, in `head` before the header row (`before`). */
  arrange(visible: readonly string[], head: ComponentBase, before: ComponentBase) {
    const cols = this.grid.columns;
    this.head = head;
    const shown = cols.shownBands(visible);
    let depth = 0;
    for (const b of shown) depth = Math.max(depth, b.depth);
    while (this.rows.length < depth) this.rows.push(this.makeRow());
    while (this.rows.length > depth) {
      const row = this.rows.pop()!;
      if (row.parent) row.parent.controls.remove(row);
      this.fillers.pop();
    }
    this.rows.forEach((row, r) => put(row, 'aria-rowindex', String(r + 1)));
    orderControls(head, [...this.rows, before]);
    if (this.indicator.parent !== head) head.controls.add(this.indicator);
    const placed = new Set<string>();
    const drawn = this.grid.columnWindow;
    for (const b of shown) {
      // While columns are virtual a band spans only its columns drawn, and goes with the last of them.
      let from = -1;
      let to = -1;
      for (let i = b.first; i < b.first + b.count; i++) {
        if (!drawn.has(visible[i])) continue;
        if (from < 0) from = i;
        to = i;
      }
      if (from < 0) continue;
      const part = this.cells.get(b.id) ?? this.makeCell(b.id);
      const span = String(b.count);
      css(part, 'grid-column', `${from + 1} / span ${to - from + 1}`);
      put(part, 'aria-colindex', String(b.first + 1));
      put(part, 'aria-colspan', span);
      const row = this.rows[b.depth - 1];
      if (part.parent !== row) row.controls.add(part);
      placed.add(b.id);
    }
    for (const [id, part] of this.cells) if (!placed.has(id) && part.parent) part.parent.controls.silentDetach(part);
    this.rows.forEach((row, r) => {
      const covered = new Set<number>();
      for (const b of shown) if (b.depth === r + 1) for (let i = b.first; i < b.first + b.count; i++) covered.add(i);
      const fillers = this.fillers[r];
      const wanted = new Set<string>();
      visible.forEach((field, i) => {
        if (covered.has(i) || !cols.sideOf(field)) return;
        wanted.add(field);
        let piece = fillers.get(field);
        if (!piece) {
          piece = loose<HTMLDivElement>('div', 'mx-data-grid__band-filler');
          piece.attr.add({ 'aria-hidden': 'true', 'data-field': field });
          fillers.set(field, piece);
        }
        css(piece, 'grid-column', String(i + 1));
        if (piece.parent !== row) row.controls.add(piece);
      });
      for (const [field, piece] of fillers) {
        if (wanted.has(field)) continue;
        removePart(piece);
        fillers.delete(field);
      }
    });
  }

  dispose() {
    for (const stop of this.stops) stop();
    for (const row of this.rows) if (row.parent) row.parent.controls.remove(row);
    for (const cell of this.cells.values()) if (!cell.isDisposed) void cell.dispose({ skipLeaveTransition: true });
    removePart(this.indicator);
  }

  private makeRow(): Component<HTMLDivElement> {
    const part = new Component<HTMLDivElement>('div');
    part.class.add('mx-data-grid__row mx-data-grid__row--header mx-data-grid__row--band');
    part.attr.add({ role: 'row' });
    this.fillers.push(new Map());
    return part;
  }

  private makeCell(id: string): Component<HTMLDivElement> {
    const { grid, host } = this;
    const cols = grid.columns;
    const band = cols.bands.get(id)!;
    const cellPart = loose<HTMLDivElement>('div', 'mx-data-grid__header-cell mx-data-grid__band');
    cellPart.attr.add({ role: 'columnheader', tabindex: '-1', 'data-band': id });
    const titlePart = part<HTMLSpanElement>(cellPart, 'span', 'mx-data-grid__title');
    const buttonPart = part<HTMLButtonElement>(cellPart, 'button', 'mx-data-grid__menu-button');
    buttonPart.attr.add({ type: 'button', tabindex: '-1', 'aria-haspopup': 'menu' });
    glyphPart(buttonPart, 'more');
    this.cells.set(id, cellPart);
    const own = band.def.headerCell;
    if (own) {
      const ctx: BandCellContext<T> = {
        band: band.def,
        get title() {
          return cols.title(id);
        },
      };
      const content = untracked(() => own(ctx));
      if (content instanceof ComponentBase) titlePart.controls.add(content);
      else if (content !== undefined && content !== null) textPart(titlePart, String(content));
    }
    const draw = () => {
      const text = cols.title(id);
      if (own) put(cellPart, 'aria-label', text);
      else writeText(titlePart, text);
      css(titlePart, 'text-align', cols.bandAlign(id));
      const menu = host.hasMenu(id);
      mark(buttonPart, 'hidden', !menu);
      put(buttonPart, 'aria-label', grid.text('gridColumnMenu', { title: text }));
    };
    this.drawers.set(id, draw);
    untracked(draw);
    buttonPart.motif.on('pointerdown', (_, e) => e.stopPropagation());
    buttonPart.motif.on('click', (_, e) => {
      e.stopPropagation();
      host.openMenu(id, buttonPart);
    });
    cellPart.motif.on('pointerdown', (_, e) => this.press(id, cellPart, e));
    return cellPart;
  }

  /** Drag a band's header to move the band, with its columns, among the columns and bands beside it. */
  private press(id: string, sourcePart: Component<HTMLDivElement>, e: PointerEvent) {
    const { grid } = this;
    const cols = grid.columns;
    if (e.button !== 0) return;
    const [lo, hi] = cols.moveRange(id);
    if (!cols.can(id, 'movable') || lo === hi) return;
    const units = cols.siblings(id);
    const from = units.indexOf(id);
    const startX = e.clientX;
    sourcePart.attr.add({ setPointerCapture: e.pointerId });
    const indicator = this.indicator;
    const rtl = this.host.isRtl();
    const ghost = this.host.ghost;
    let dragging = false;
    let target = from;
    let x = startX;
    let y = e.clientY;
    let stopAim: (() => void) | null = null;
    // Where the band would land, read with the window's next frame; the mark and the ghost follow it.
    const readAim = () => {
      const head = this.head;
      const drop = dropPlace(units.map((u) => this.header.unitRect(u)), from, lo, hi, x, rtl);
      return { drop, start: head ? rectOf(head).left : null };
    };
    const paintAim = (aim: ReturnType<typeof readAim>) => {
      stopAim = null;
      target = aim.drop.target;
      if (aim.drop.x === null || aim.start === null) mark(indicator, 'hidden', true);
      else {
        css(indicator, 'left', `${aim.drop.x - aim.start}px`);
        mark(indicator, 'hidden', false);
      }
      ghost.move(x, y, aim.drop.x === null ? 'none' : 'move');
    };
    const move = (_: ComponentBase, ev: PointerEvent) => {
      x = ev.clientX;
      y = ev.clientY;
      if (!dragging) {
        if (Math.abs(x - startX) < grid.settings.get('dragThreshold')) return;
        dragging = true;
        mark(sourcePart, 'data-dragging', true);
        ghost.show(sourcePart, x, y, 'header');
      }
      stopAim = measure(sourcePart, readAim, paintAim);
    };
    const up = (_: ComponentBase, ev: PointerEvent) => {
      stopAim?.();
      stopAim = null;
      x = ev.clientX;
      // Where it lands is read at the drop itself, before anything is written.
      if (dragging && ev.type !== 'pointercancel') target = readAim().drop.target;
      void sourcePart.motif.off('pointermove', move);
      void sourcePart.motif.off('pointerup', up);
      void sourcePart.motif.off('pointercancel', up);
      mark(indicator, 'hidden', true);
      ghost.hide();
      mark(sourcePart, 'data-dragging', false);
      if (!dragging || ev.type === 'pointercancel' || !cols.move(id, target)) return;
      const beside = cols.siblings(id);
      grid.announce(grid.text('gridMovedTo', { title: cols.title(id), position: beside.indexOf(id) + 1, count: beside.length }));
      grid.layoutChanged();
    };
    void sourcePart.motif.on('pointermove', move);
    void sourcePart.motif.on('pointerup', up);
    void sourcePart.motif.on('pointercancel', up);
  }
}
