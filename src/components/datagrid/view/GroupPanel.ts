import { untracked, type Component, type ComponentBase } from '@motifx/core';
import { glyphPart, loose, part, removePart } from '../../../core/draw-parts';
import { focusOn, isFocused, rememberFocus } from '../../../core/focus';
import { isInPage, isRendered, rectOf, type Rect } from '../../../core/measure';
import { nextId } from '../../../core/next-id';
import { orderControls } from '../../../core/order-controls';
import { css, mark, put, text } from '../../../core/part-writes';
import type { GridModel } from '../model/GridModel';
import type { GroupDrop } from './group-drop';
import type { GroupPanelHost } from './group-panel-host';

const NO_DROP: GroupDrop = Object.freeze({ index: -1, offset: 0 });

/**
 * The group panel at the start of the toolbar: a chip per grouped column, in order, or a line that
 * says where to drop a header. A chip turns the order of its groups (click, Enter), ungroups (Delete,
 * or dragged back onto the headers) and moves along the panel (dragged, or Shift + Left / Right);
 * the toolbar's arrow keys go from chip to chip. Headers dropped on it group by their column. It
 * follows nothing: it draws itself again whenever the grid tells a change.
 */
export class GroupPanel<T> {
  /** The panel's component; the toolbar holds it while `groupPanel` is on. */
  readonly part: Component<HTMLDivElement>;
  private readonly empty: Component<HTMLSpanElement>;
  private readonly hint: Component<HTMLSpanElement>;
  /** The id of the hint, which describes every chip. */
  private readonly hintId = nextId('group-hint');
  private readonly drop: Component<HTMLSpanElement>;
  private readonly chips = new Map<string, Component<HTMLButtonElement>>();
  private suppressClick = false;
  private readonly stops: (() => void)[] = [];

  constructor(
    private readonly model: GridModel<T>,
    private readonly host: GroupPanelHost,
  ) {
    this.part = loose<HTMLDivElement>('div', 'mx-data-grid__group-panel');
    this.part.attr.add({ role: 'group' });
    this.empty = part<HTMLSpanElement>(this.part, 'span', 'mx-data-grid__group-empty');
    this.hint = part<HTMLSpanElement>(this.part, 'span', 'mx-data-grid__hidden-text');
    this.hint.attr.add({ id: this.hintId });
    this.drop = part<HTMLSpanElement>(this.part, 'span', 'mx-data-grid__chip-drop');
    this.drop.attr.add({ 'aria-hidden': 'true' });
    mark(this.drop, 'hidden', true);
    this.stops.push(model.notices.on(() => this.draw()));
    this.draw();
  }

  /** Whether headers can be dropped here now: the panel shows and dragging is on. */
  get accepts(): boolean {
    return this.model.settings.get('groupPanelDragging') && isInPage(this.part) && isRendered(this.part);
  }

  /** Where drops for the panel are taken: the whole toolbar it sits in (its parent), not only its chips. */
  get dropArea(): ComponentBase {
    return this.part.parent ?? this.part;
  }

  /** Marks the drop area while a header that can be grouped is dragged. */
  showReady(on: boolean) {
    mark(this.dropArea, 'data-drop-ready', on);
  }

  /**
   * Where a point drops among the chips, and where its mark goes; reads only. Read it in a read, or first in a
   * handler, then write it with `showDropAt`.
   */
  dropAt(x: number, y: number): GroupDrop {
    const area = rectOf(this.dropArea);
    if (x < area.left || x > area.right || y < area.top || y > area.bottom) return NO_DROP;
    const rtl = this.host.isRtl();
    const rects = this.chipRects();
    let index = 0;
    for (const r of rects) {
      if (!r) continue;
      const centre = r.left + r.width / 2;
      if (rtl ? x < centre : x > centre) index++;
    }
    return { index, offset: this.markOffset(index, rects, rtl) };
  }

  /** Marks where a drop read with `dropAt` lands; one at -1 hides the mark. */
  showDropAt(drop: GroupDrop) {
    mark(this.dropArea, 'data-drop', drop.index >= 0);
    if (drop.index < 0) {
      mark(this.drop, 'hidden', true);
      return;
    }
    css(this.drop, 'inset-inline-start', `${drop.offset}px`);
    mark(this.drop, 'hidden', false);
  }

  /** The chip of a grouped column, while it shows. */
  chipOf(field: string): Component<HTMLButtonElement> | undefined {
    return this.chips.get(field);
  }

  dispose() {
    for (const stop of this.stops) stop();
    // Out of the toolbar the panel is no one's child: it goes here.
    if (!this.part.parent && !this.part.isDisposed) void this.part.dispose();
  }

  /** Where each grouped column's chip is on the screen, in group order. */
  private chipRects(): (Rect | null)[] {
    return this.model.groups.fields().map((field) => {
      const chip = this.chips.get(field);
      return chip ? rectOf(chip) : null;
    });
  }

  /** Pixels from the panel's inline start to the edge a drop at place `index` lands on. */
  private markOffset(index: number, rects: readonly (Rect | null)[], rtl: boolean): number {
    const base = rectOf(this.part);
    const before = rects[index];
    const after = rects[index - 1];
    const x = before ? (rtl ? before.right : before.left) : after ? (rtl ? after.left : after.right) : rtl ? base.right : base.left;
    return rtl ? base.right - x : x - base.left;
  }

  private draw() {
    untracked(() => this.drawPanel());
  }

  private drawPanel() {
    const { model } = this;
    const items = model.groups.items;
    const cols = model.columns;
    const settings = model.settings;
    const label = model.text('gridGroupPanel');
    const empty = settings.get('groupPanelEmptyText') || model.text('gridGroupPanelEmpty');
    const hint = model.text('gridGroupChipHint');
    const texts = items.map((g) => ({ field: g.field, title: cols.title(g.field), dir: g.dir ?? 'asc' }));
    const labels = texts.map((t) => model.text(t.dir === 'desc' ? 'gridGroupChipDescending' : 'gridGroupChipAscending', { title: t.title }));
    const dragging = settings.get('groupPanelDragging');
    untracked(() => {
      // Moving a chip in the page blurs it: focus comes back to it.
      const focus = rememberFocus();
      put(this.part, 'aria-label', label);
      mark(this.part, 'data-locked', !dragging);
      text(this.empty, empty);
      mark(this.empty, 'hidden', texts.length > 0);
      text(this.hint, hint);
      const wanted = new Set(texts.map((t) => t.field));
      for (const [field, chip] of this.chips) {
        if (wanted.has(field)) continue;
        removePart(chip);
        this.chips.delete(field);
      }
      const chips = texts.map((t, i) => {
        const chip = this.chips.get(t.field) ?? this.makeChip(t.field);
        put(chip, 'data-dir', t.dir);
        text(chip.controls.items[0], t.title);
        put(chip, 'aria-label', labels[i]);
        return chip;
      });
      // The chips after the empty text, in order; the hint and the drop mark after them.
      orderControls(this.part, [this.empty, ...chips]);
      if (focus?.isIn(this.part)) focus.restore();
    });
  }

  /** A chip, not placed yet: the panel puts it in order. */
  private makeChip(field: string): Component<HTMLButtonElement> {
    const chip = loose<HTMLButtonElement>('button', 'mx-data-grid__chip');
    chip.attr.add({ type: 'button', 'data-group': field });
    put(chip, 'tabindex', '-1');
    chip.attr.add({ 'aria-describedby': this.hintId });
    part(chip, 'span', 'mx-data-grid__chip-text');
    const arrows = part<HTMLSpanElement>(chip, 'span', 'mx-data-grid__chip-sort');
    arrows.attr.add({ 'aria-hidden': 'true' });
    glyphPart(arrows, 'chevron-up', 'mx-data-grid__sort-up');
    glyphPart(arrows, 'chevron-down', 'mx-data-grid__sort-down');
    chip.motif.on('click', () => {
      if (this.suppressClick) {
        this.suppressClick = false;
        return;
      }
      if (this.model.columns.can(field, 'sortable')) this.model.toggleGroupOrder(field);
    });
    chip.motif.on('keydown', (_, e) => this.onChipKey(e, field));
    chip.motif.on('pointerdown', (_, e) => this.pressChip(e, field));
    this.chips.set(field, chip);
    return chip;
  }

  /** Delete ungroups; Shift + Left / Right moves the chip (Enter and Space press it). */
  private onChipKey(e: KeyboardEvent, field: string) {
    const { model } = this;
    if (!this.host.keyHandling(e)) return;
    if (!model.settings.get('groupPanelDragging') || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      this.passFocus(field);
      model.ungroup(field, true);
      return;
    }
    if (e.shiftKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
      e.preventDefault();
      const step = (e.key === 'ArrowRight') !== this.host.isRtl() ? 1 : -1;
      const fields = model.groups.fields();
      const to = fields.indexOf(field) + step;
      if (to < 0 || to >= fields.length) return;
      model.groupBy(field, to, true);
      model.announce(model.text('gridMovedTo', { title: model.columns.title(field), position: to + 1, count: fields.length }));
      const chip = this.chips.get(field);
      if (chip) focusOn(chip);
    }
  }

  /**
   * Focus leaves a chip about to go, before anything is written for it (a focused element taken out of the page
   * makes the browser work out styles at once): to the chip that takes its place, else back to the rows.
   */
  private passFocus(field: string) {
    const fields = this.model.groups.fields();
    const at = fields.indexOf(field);
    const next = this.chips.get(fields[at + 1] ?? fields[at - 1]);
    if (next) focusOn(next);
    else this.host.focusRows();
  }

  /** Dragging a chip: along the panel moves it, onto the headers ungroups it (the column lands where it is dropped). */
  private pressChip(e: PointerEvent, field: string) {
    const { model } = this;
    if (e.button !== 0 || !model.settings.get('groupPanelDragging')) return;
    const chip = this.chips.get(field)!;
    chip.attr.add({ setPointerCapture: e.pointerId });
    const startX = e.clientX;
    const startY = e.clientY;
    let dragging = false;
    let place = -1;
    // The place among the headers the last move pointed at; -1 off them.
    let onHeaders = -1;
    const move = (_: ComponentBase, ev: PointerEvent) => {
      if (!dragging && Math.max(Math.abs(ev.clientX - startX), Math.abs(ev.clientY - startY)) < model.settings.get('dragThreshold')) return;
      // Read first, then write.
      const drop = this.dropAt(ev.clientX, ev.clientY);
      const headerDrop = drop.index < 0 ? this.host.headerDropAt(field, ev.clientX, ev.clientY) : NO_DROP;
      place = drop.index;
      onHeaders = headerDrop.index;
      if (!dragging) {
        dragging = true;
        // The ghost copies the chip's size before anything is written for the drag.
        this.host.ghost.show(chip, ev.clientX, ev.clientY, 'chip');
        mark(chip, 'data-dragging', true);
      }
      this.showDropAt(drop);
      this.host.showHeaderDrop(headerDrop);
      this.host.ghost.move(ev.clientX, ev.clientY, place >= 0 ? 'move' : onHeaders >= 0 ? 'ungroup' : 'none');
    };
    const up = (_: ComponentBase, ev: PointerEvent) => {
      void chip.motif.off('pointermove', move);
      void chip.motif.off('pointerup', up);
      void chip.motif.off('pointercancel', up);
      // The drop lands where the last move pointed: a chip dropped on the headers goes, and focus leaves it first,
      // before anything is written.
      const ungroup = dragging && ev.type !== 'pointercancel' && place < 0 && onHeaders >= 0 && model.groupDropAllowed(field, 'chip', 'headers', onHeaders);
      if (ungroup && isFocused(chip)) this.passFocus(field);
      mark(chip, 'data-dragging', false);
      this.host.ghost.hide();
      this.showDropAt(NO_DROP);
      this.host.showHeaderDrop(NO_DROP);
      if (!dragging) return;
      this.suppressClick = true;
      setTimeout(() => (this.suppressClick = false));
      if (ev.type === 'pointercancel') return;
      if (place >= 0) {
        const from = model.groups.indexOf(field);
        const to = place > from ? place - 1 : place;
        if (model.groupDropAllowed(field, 'chip', 'panel', to)) model.groupBy(field, to, true);
      } else if (ungroup) this.host.dropOnHeaders(field, onHeaders);
    };
    void chip.motif.on('pointermove', move);
    void chip.motif.on('pointerup', up);
    void chip.motif.on('pointercancel', up);
  }
}
