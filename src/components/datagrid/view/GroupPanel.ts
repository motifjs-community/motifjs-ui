import { effect, untracked } from '@motifx/core';
import { chevronDown, chevronUp } from '../../../core/glyphs';
import { nextId } from '../../../core/next-id';
import type { GridModel } from '../model/GridModel';
import type { GroupPanelHost } from './group-panel-host';

/**
 * The group panel at the start of the toolbar: a chip per grouped column, in order, or a line that
 * says where to drop a header. A chip turns the order of its groups (click, Enter), ungroups (Delete,
 * or dragged back onto the headers) and moves along the panel (dragged, or Shift + Left / Right);
 * the toolbar's arrow keys go from chip to chip. Headers dropped on it group by their column.
 */
export class GroupPanel<T> {
  readonly element: HTMLDivElement;
  private readonly empty: HTMLSpanElement;
  private readonly hint: HTMLSpanElement;
  private readonly drop: HTMLSpanElement;
  private readonly chips = new Map<string, HTMLButtonElement>();
  private suppressClick = false;
  private readonly stops: (() => void)[] = [];

  constructor(
    private readonly model: GridModel<T>,
    private readonly host: GroupPanelHost,
  ) {
    const el = document.createElement('div');
    el.className = 'mx-data-grid__group-panel';
    el.setAttribute('role', 'group');
    this.empty = document.createElement('span');
    this.empty.className = 'mx-data-grid__group-empty';
    this.hint = document.createElement('span');
    this.hint.className = 'mx-data-grid__hidden-text';
    this.hint.id = nextId('group-hint');
    this.drop = document.createElement('span');
    this.drop.className = 'mx-data-grid__chip-drop';
    this.drop.setAttribute('aria-hidden', 'true');
    this.drop.hidden = true;
    el.append(this.empty, this.hint, this.drop);
    this.element = el;
    this.stops.push(effect(() => this.draw()));
  }

  /** Whether headers can be dropped here now: the panel shows and dragging is on. */
  get accepts(): boolean {
    return this.model.settings.get('groupPanelDragging') && this.element.isConnected && this.element.offsetParent !== null;
  }

  /** The place among the chips a point drops at, or -1 when it is not over the panel. */
  dropIndexAt(x: number, y: number): number {
    const box = this.element.getBoundingClientRect();
    if (x < box.left || x > box.right || y < box.top || y > box.bottom) return -1;
    const rtl = this.host.isRtl();
    let n = 0;
    for (const field of this.model.groups.fields()) {
      const r = this.chips.get(field)?.getBoundingClientRect();
      if (!r) continue;
      const centre = r.left + r.width / 2;
      if (rtl ? x < centre : x > centre) n++;
    }
    return n;
  }

  /** Marks where a drop at place `index` lands; -1 hides the mark. */
  showDrop(index: number) {
    const el = this.element;
    el.toggleAttribute('data-drop', index >= 0);
    if (index < 0) {
      this.drop.hidden = true;
      return;
    }
    const fields = this.model.groups.fields();
    const base = el.getBoundingClientRect();
    const rtl = this.host.isRtl();
    const before = this.chips.get(fields[index]);
    const after = this.chips.get(fields[index - 1]);
    let x: number;
    if (before) {
      const r = before.getBoundingClientRect();
      x = rtl ? r.right : r.left;
    } else if (after) {
      const r = after.getBoundingClientRect();
      x = rtl ? r.left : r.right;
    } else x = rtl ? base.right : base.left;
    this.drop.style.insetInlineStart = `${rtl ? base.right - x : x - base.left}px`;
    this.drop.hidden = false;
  }

  /** The chip of a grouped column, while it shows. */
  chipOf(field: string): HTMLButtonElement | undefined {
    return this.chips.get(field);
  }

  dispose() {
    for (const stop of this.stops) stop();
  }

  private draw() {
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
      const el = this.element;
      // Moving a chip in the page blurs it: focus comes back to it.
      const focused = document.activeElement as HTMLElement | null;
      el.setAttribute('aria-label', label);
      el.toggleAttribute('data-locked', !dragging);
      this.empty.textContent = empty;
      this.empty.hidden = texts.length > 0;
      this.hint.textContent = hint;
      const wanted = new Set(texts.map((t) => t.field));
      for (const [field, chip] of this.chips) {
        if (wanted.has(field)) continue;
        chip.remove();
        this.chips.delete(field);
      }
      let before: ChildNode | null = this.empty.nextSibling;
      texts.forEach((t, i) => {
        const chip = this.chips.get(t.field) ?? this.makeChip(t.field);
        chip.dataset.dir = t.dir;
        (chip.firstChild as HTMLElement).textContent = t.title;
        if (chip.getAttribute('aria-label') !== labels[i]) chip.setAttribute('aria-label', labels[i]);
        if (chip !== before) el.insertBefore(chip, before);
        before = chip.nextSibling;
      });
      if (focused && el.contains(focused) && document.activeElement !== focused) focused.focus();
    });
  }

  private makeChip(field: string): HTMLButtonElement {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'mx-data-grid__chip';
    chip.dataset.group = field;
    chip.tabIndex = -1;
    chip.setAttribute('aria-describedby', this.hint.id);
    const text = document.createElement('span');
    text.className = 'mx-data-grid__chip-text';
    const arrows = document.createElement('span');
    arrows.className = 'mx-data-grid__chip-sort';
    arrows.setAttribute('aria-hidden', 'true');
    const up = chevronUp();
    up.classList.add('mx-data-grid__sort-up');
    const down = chevronDown();
    down.classList.add('mx-data-grid__sort-down');
    arrows.append(up, down);
    chip.append(text, arrows);
    chip.addEventListener('click', () => {
      if (this.suppressClick) {
        this.suppressClick = false;
        return;
      }
      if (this.model.columns.can(field, 'sortable')) this.model.toggleGroupOrder(field);
    });
    chip.addEventListener('keydown', (e) => this.onChipKey(e, field));
    chip.addEventListener('pointerdown', (e) => this.pressChip(e, field));
    this.chips.set(field, chip);
    return chip;
  }

  /** Delete ungroups; Shift + Left / Right moves the chip (Enter and Space press it). */
  private onChipKey(e: KeyboardEvent, field: string) {
    const { model } = this;
    if (!model.settings.get('groupPanelDragging') || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      const fields = model.groups.fields();
      const at = fields.indexOf(field);
      model.ungroup(field, true);
      // Focus goes to the chip that takes its place, else back to the rows.
      const next = this.chips.get(fields[at + 1] ?? fields[at - 1]);
      if (next) next.focus();
      else this.host.focusRows();
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
      this.chips.get(field)?.focus();
    }
  }

  /** Dragging a chip: along the panel moves it, onto the headers ungroups it (the column lands where it is dropped). */
  private pressChip(e: PointerEvent, field: string) {
    const { model } = this;
    if (e.button !== 0 || !model.settings.get('groupPanelDragging')) return;
    const chip = this.chips.get(field)!;
    chip.setPointerCapture?.(e.pointerId);
    const startX = e.clientX;
    const startY = e.clientY;
    let dragging = false;
    let place = -1;
    let header = false;
    const move = (ev: PointerEvent) => {
      if (!dragging) {
        if (Math.max(Math.abs(ev.clientX - startX), Math.abs(ev.clientY - startY)) < model.settings.get('dragThreshold')) return;
        dragging = true;
        chip.toggleAttribute('data-dragging', true);
      }
      place = this.dropIndexAt(ev.clientX, ev.clientY);
      this.showDrop(place);
      header = place < 0 && this.host.showHeaderDrop(field, ev.clientX, ev.clientY);
    };
    const up = (ev: PointerEvent) => {
      chip.removeEventListener('pointermove', move);
      chip.removeEventListener('pointerup', up);
      chip.removeEventListener('pointercancel', up);
      chip.toggleAttribute('data-dragging', false);
      this.showDrop(-1);
      this.host.showHeaderDrop(field, Number.NaN, Number.NaN);
      if (!dragging) return;
      this.suppressClick = true;
      setTimeout(() => (this.suppressClick = false));
      if (ev.type === 'pointercancel') return;
      if (place >= 0) {
        const from = model.groups.indexOf(field);
        const to = place > from ? place - 1 : place;
        if (model.groupDropAllowed(field, 'chip', 'panel', to)) model.groupBy(field, to, true);
      } else if (header) this.host.dropOnHeaders(field, ev.clientX);
    };
    chip.addEventListener('pointermove', move);
    chip.addEventListener('pointerup', up);
    chip.addEventListener('pointercancel', up);
  }
}
