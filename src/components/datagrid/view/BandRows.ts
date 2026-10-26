import { ComponentBase, effect, untracked } from '@motifx/core';
import { moreMark } from '../../../core/glyphs';
import type { BandCellContext } from '../band-cell-context';
import type { GridModel } from '../model/GridModel';
import { dropPlace } from './drop-place';
import type { HeaderHost } from './header-host';
import type { HeaderRow } from './HeaderRow';

/**
 * The rows of band headers above the header row: a row per level of bands, each band's header over
 * its columns (`aria-colindex` of its first one, `aria-colspan`), the places over other columns
 * empty. Over a pinned column no band covers stands an empty piece that stays with it. Plain
 * elements in the head's row group, before the header row. Dragging a band's header moves the band,
 * with its columns, among the columns and bands beside it; its menu button opens its menu.
 */
export class BandRows<T> {
  readonly rows: HTMLDivElement[] = [];
  /** The mark of where a dragged band lands, over every header row. */
  readonly indicator: HTMLDivElement;
  private readonly cells = new Map<string, HTMLDivElement>();
  /** The empty pieces over pinned columns, by row and field. */
  private readonly fillers: Map<string, HTMLDivElement>[] = [];
  private readonly stops: (() => void)[] = [];
  private head: HTMLElement | null = null;

  constructor(
    private readonly grid: GridModel<T>,
    private readonly host: HeaderHost,
    private readonly header: HeaderRow<T>,
    /** Holds the components of the bands' own header contents. */
    private readonly owner: ComponentBase,
  ) {
    const indicator = document.createElement('div');
    indicator.className = 'mx-data-grid__drop';
    indicator.setAttribute('aria-hidden', 'true');
    indicator.hidden = true;
    this.indicator = indicator;
  }

  /** The header element of a band, while it shows. */
  cellElement(id: string): HTMLElement | undefined {
    const cell = this.cells.get(id);
    return cell?.isConnected ? cell : undefined;
  }

  /** Lays the rows out over the visible columns, in `head` before the header row. */
  arrange(visible: readonly string[], head: HTMLElement, before: Element) {
    const cols = this.grid.columns;
    this.head = head;
    const shown = cols.shownBands(visible);
    let depth = 0;
    for (const b of shown) depth = Math.max(depth, b.depth);
    while (this.rows.length < depth) this.rows.push(this.makeRow());
    while (this.rows.length > depth) {
      this.rows.pop()!.remove();
      this.fillers.pop();
    }
    this.rows.forEach((row, r) => {
      row.setAttribute('aria-rowindex', String(r + 1));
      if (row.parentElement !== head || row.nextElementSibling !== (this.rows[r + 1] ?? before)) head.insertBefore(row, before);
    });
    if (this.indicator.parentElement !== head) head.append(this.indicator);
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
      const cell = this.cells.get(b.id) ?? this.makeCell(b.id);
      const span = String(b.count);
      cell.style.gridColumn = `${from + 1} / span ${to - from + 1}`;
      cell.setAttribute('aria-colindex', String(b.first + 1));
      cell.setAttribute('aria-colspan', span);
      const row = this.rows[b.depth - 1];
      if (cell.parentElement !== row) row.append(cell);
      placed.add(b.id);
    }
    for (const [id, cell] of this.cells) if (!placed.has(id)) cell.remove();
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
          piece = document.createElement('div');
          piece.className = 'mx-data-grid__band-filler';
          piece.setAttribute('aria-hidden', 'true');
          piece.dataset.field = field;
          fillers.set(field, piece);
        }
        piece.style.gridColumn = String(i + 1);
        if (piece.parentElement !== row) row.append(piece);
      });
      for (const [field, piece] of fillers) {
        if (wanted.has(field)) continue;
        piece.remove();
        fillers.delete(field);
      }
    });
  }

  dispose() {
    for (const stop of this.stops) stop();
    for (const row of this.rows) row.remove();
    this.indicator.remove();
  }

  private makeRow(): HTMLDivElement {
    const row = document.createElement('div');
    row.className = 'mx-data-grid__row mx-data-grid__row--header mx-data-grid__row--band';
    row.setAttribute('role', 'row');
    this.fillers.push(new Map());
    return row;
  }

  private makeCell(id: string): HTMLDivElement {
    const { grid, host } = this;
    const cols = grid.columns;
    const band = cols.bands.get(id)!;
    const cell = document.createElement('div');
    cell.className = 'mx-data-grid__header-cell mx-data-grid__band';
    cell.setAttribute('role', 'columnheader');
    cell.tabIndex = -1;
    cell.dataset.band = id;
    const title = document.createElement('span');
    title.className = 'mx-data-grid__title';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'mx-data-grid__menu-button';
    button.tabIndex = -1;
    button.setAttribute('aria-haspopup', 'menu');
    button.append(moreMark());
    cell.append(title, button);
    this.cells.set(id, cell);
    const own = band.def.headerCell;
    if (own) {
      const ctx: BandCellContext<T> = {
        band: band.def,
        get title() {
          return cols.title(id);
        },
      };
      const content = untracked(() => own(ctx));
      if (content instanceof ComponentBase) {
        this.owner.controls.add(content);
        title.append(content.element as Node);
      } else if (content instanceof Node) title.append(content);
      else if (content !== undefined && content !== null) title.append(String(content));
    }
    this.stops.push(
      effect(() => {
        const text = cols.title(id);
        if (own) cell.setAttribute('aria-label', text);
        else title.textContent = text;
        title.style.textAlign = cols.bandAlign(id);
        button.hidden = !host.hasMenu(id);
        button.setAttribute('aria-label', grid.text('gridColumnMenu', { title: text }));
      }),
    );
    button.addEventListener('pointerdown', (e) => e.stopPropagation());
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      host.openMenu(id, button);
    });
    cell.addEventListener('pointerdown', (e) => this.press(id, cell, e));
    return cell;
  }

  /** Drag a band's header to move the band, with its columns, among the columns and bands beside it. */
  private press(id: string, source: HTMLElement, e: PointerEvent) {
    const { grid } = this;
    const cols = grid.columns;
    if (e.button !== 0) return;
    const [lo, hi] = cols.moveRange(id);
    if (!cols.can(id, 'movable') || lo === hi) return;
    const units = cols.siblings(id);
    const from = units.indexOf(id);
    const startX = e.clientX;
    source.setPointerCapture?.(e.pointerId);
    const indicator = this.indicator;
    const rtl = this.host.isRtl();
    const ghost = this.host.ghost;
    let dragging = false;
    let target = from;
    const move = (ev: PointerEvent) => {
      if (!dragging) {
        if (Math.abs(ev.clientX - startX) < grid.settings.get('dragThreshold')) return;
        dragging = true;
        source.toggleAttribute('data-dragging', true);
        ghost.show(source, ev.clientX, ev.clientY);
      }
      const drop = dropPlace(
        units.map((u) => this.header.unitRect(u)),
        from,
        lo,
        hi,
        ev.clientX,
        rtl,
      );
      target = drop.target;
      if (drop.x === null || !this.head) indicator.hidden = true;
      else {
        indicator.style.left = `${drop.x - this.head.getBoundingClientRect().left}px`;
        indicator.hidden = false;
      }
      ghost.move(ev.clientX, ev.clientY, drop.x === null ? 'none' : 'move');
    };
    const up = (ev: PointerEvent) => {
      source.removeEventListener('pointermove', move);
      source.removeEventListener('pointerup', up);
      source.removeEventListener('pointercancel', up);
      indicator.hidden = true;
      ghost.hide();
      source.toggleAttribute('data-dragging', false);
      if (!dragging || ev.type === 'pointercancel' || !cols.move(id, target)) return;
      const beside = cols.siblings(id);
      grid.announce(grid.text('gridMovedTo', { title: cols.title(id), position: beside.indexOf(id) + 1, count: beside.length }));
      grid.layoutChanged();
    };
    source.addEventListener('pointermove', move);
    source.addEventListener('pointerup', up);
    source.addEventListener('pointercancel', up);
  }
}
