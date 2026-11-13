import { Component, ComponentBase, createSignal, untracked } from '@motifx/core';
import { glyphPart, loose, part, removePart, textPart } from '../../../core/draw-parts';
import { css, flag, mark, put, text } from '../../../core/part-writes';
import type { GroupCellContext } from '../group-cell-context';
import type { GridModel } from '../model/GridModel';
import type { GroupNode } from '../model/group-node';
import type { SummaryPart } from '../model/summary-part';
import { fillSummaryCell } from './summary-cell';

/**
 * One pooled group row of the body: an arrow, "Column: value", the row count and the group summary
 * items in one cell that spans the columns, moved in by its level. Items aligned by column
 * (`alignByColumn`) get cells of their own under their columns, and the group's cell ends before
 * the first of them. Like the data rows it is created once and shows other groups while the user
 * scrolls; a column's own `groupCell` content is created the first time the row shows a group of that
 * column, and kept. It follows nothing: it is drawn when it shows another group, and the body draws
 * again the parts that read what the grid tells (`drawLook`, `drawText`, `drawSummary`). The row,
 * its cell and the places a `groupCell` content goes are components, so that content is a child of
 * its place.
 */
export class GroupRow<T> {
  /** The row's component, a child of the body. */
  readonly part: Component<HTMLDivElement>;
  readonly element: HTMLDivElement;
  readonly cell: HTMLDivElement;
  /** The group's cell, which spans the columns up to the first aligned item. */
  readonly cellPart: Component<HTMLDivElement>;
  /** The arrow that opens and closes the group. */
  readonly arrowPart: Component<HTMLSpanElement>;
  /** Grid index; -1 while the row is not used. */
  index = -1;
  node: GroupNode | null = null;
  /** Grows with each other group shown: what a column's own content reads of its context follows it. */
  private readonly shown = createSignal(0);
  /** Holds the arrow, the columns' own contents and the text, in that order. */
  private readonly contentPart: Component<HTMLSpanElement>;
  private readonly textPart: Component<HTMLSpanElement>;
  private readonly caption: ComponentBase;
  private readonly count: ComponentBase;
  private readonly summary: ComponentBase;
  /** Cells of the items aligned by column, by field; made when first needed. */
  private readonly aligned = new Map<string, Component<HTMLDivElement>>();
  private visible: string[] = [];
  /** The places of the columns' own contents, by field. */
  private readonly own = new Map<string, Component<HTMLSpanElement>>();

  constructor(private readonly model: GridModel<T>) {
    this.part = new Component<HTMLDivElement>('div');
    const el = this.part.element;
    this.part.class.add('mx-data-grid__row mx-data-grid__group-row');
    this.part.attr.add({ role: 'row' });
    mark(this.part, 'hidden', true);
    const cellPart = part<HTMLDivElement>(this.part, 'div', 'mx-data-grid__group-cell');
    const cell = cellPart.element;
    cellPart.attr.add({ role: 'gridcell', 'aria-colindex': '1' });
    put(cellPart, 'tabindex', '-1');
    this.contentPart = part<HTMLSpanElement>(cellPart, 'span', 'mx-data-grid__group-content');
    const toggle = part<HTMLSpanElement>(this.contentPart, 'span', 'mx-data-grid__group-toggle');
    toggle.attr.add({ 'aria-hidden': 'true' });
    glyphPart(toggle, 'chevron-end');
    this.textPart = part<HTMLSpanElement>(this.contentPart, 'span', 'mx-data-grid__group-text');
    this.caption = textPart(this.textPart, '');
    this.count = textPart(part(this.textPart, 'span', 'mx-data-grid__group-count'), '');
    this.summary = textPart(part(this.textPart, 'span', 'mx-data-grid__group-summary'), '');
    this.element = el;
    this.cell = cell;
    this.cellPart = cellPart;
    this.arrowPart = toggle;
    this.draw();
  }

  /** The cell of items aligned by column that an event came from. */
  alignedFrom(e: Event): ComponentBase | undefined {
    for (const cell of this.aligned.values()) if (cell.motif.isEventFrom(e)) return cell;
    return undefined;
  }

  /** Draws the whole row as the grid is now. */
  draw() {
    untracked(() => {
      this.drawLook();
      this.drawText();
      this.drawSummary();
    });
  }

  /** Shows the group at grid row `index`, at `top`. */
  use(index: number, node: GroupNode, top: number) {
    if (this.index !== index || this.node !== node) {
      this.index = index;
      this.node = node;
      this.shown.value = this.shown.peek() + 1;
      this.draw();
    }
    mark(this.part, 'hidden', false);
    css(this.part, 'transform', `translateY(${top}px)`);
  }

  /** Draws the row again as it is. */
  redraw() {
    this.shown.value = this.shown.peek() + 1;
    this.draw();
  }

  /** Back to the pool, hidden. */
  release() {
    if (this.index !== -1 || this.node !== null) {
      this.index = -1;
      this.node = null;
      this.shown.value = this.shown.peek() + 1;
      this.draw();
    }
    mark(this.part, 'hidden', true);
  }

  /** The cell spans the visible columns, up to the first one holding an aligned item. */
  arrange(visible: string[]) {
    this.visible = visible;
    this.redraw();
  }

  /** Lookup keys came: the text is drawn again when it shows one. */
  drawLookup() {
    if (this.node && this.model.columns.defs.get(this.node.field)?.lookup) this.redraw();
  }

  /** A column removed, or recreated: its aligned cell and its own content go. */
  removeColumn(field: string) {
    removePart(this.aligned.get(field));
    this.aligned.delete(field);
    // Its own content goes with its place.
    const own = this.own.get(field);
    this.own.delete(field);
    if (own) this.contentPart.controls.remove(own);
    this.redraw();
  }

  dispose() {
    if (this.part.parent) this.part.parent.controls.remove(this.part);
    else if (!this.part.isDisposed) void this.part.dispose({ skipLeaveTransition: true });
  }

  drawLook() {
    const { model, node, index, element } = this;
    if (!node || index < 0) {
      put(this.part, 'aria-rowindex', null);
      return;
    }
    put(this.part, 'aria-rowindex', String(model.ariaRowIndex(index)));
    put(this.part, 'aria-level', String(node.level + 1));
    const open = model.groups.isExpanded(node);
    mark(this.part, 'data-locked', !model.canCollapse(node));
    put(this.part, 'data-expand', model.expandModeOf(node));
    put(this.part, 'aria-expanded', String(open));
    mark(this.part, 'data-expanded', open);
    mark(this.part, 'data-active', model.state.activeRow === index);
    css(this.part, '--_level', String(node.level));
    const ev = model.events;
    if (ev.listened(ev.rowPrepared)) ev.rowPrepared.fire({ row: undefined, rowIndex: index, rowType: 'group', groupKey: [...node.path], isSelected: false, part: this.part });
  }

  /**
   * Group summary items: after the count, or under their columns (`alignByColumn`), not under the
   * first column, which holds the text, nor under a column that does not show.
   */
  drawSummary() {
    const { model, node, visible } = this;
    const inText: string[] = [];
    let aligned = new Map<string, SummaryPart[]>();
    if (node) {
      const s = model.summaries;
      const values = s.groupValues(node);
      const items = s.groupItems().filter((i) => i.visible && !i.footer);
      const under = items.filter((i) => i.align && i.place !== undefined && visible.indexOf(i.place) > 0);
      aligned = s.partsByColumn(under, values);
      for (const i of items) {
        if (under.includes(i)) continue;
        const text = s.text(i, values[i.index], i.field !== node.field);
        if (text) inText.push(text);
      }
    }
    const separator = model.text('gridSummarySeparator');
    text(this.summary, inText.length ? separator + inText.join(separator) : '');
    let first = visible.length;
    for (const field of aligned.keys()) first = Math.min(first, visible.indexOf(field));
    css(this.cellPart, 'grid-column', first < visible.length ? `1 / ${first + 1}` : '');
    put(this.cellPart, 'aria-colspan', String(Math.max(1, first)));
    for (const [field, parts] of aligned) {
      let cell = this.aligned.get(field);
      if (!cell) {
        cell = part<HTMLDivElement>(this.part, 'div', 'mx-data-grid__cell mx-data-grid__summary-cell');
        cell.attr.add({ role: 'gridcell', 'data-field': field });
        this.aligned.set(field, cell);
      }
      const at = visible.indexOf(field);
      // While columns are virtual, an item under a column without cells waits for it.
      mark(cell, 'hidden', !model.columnWindow.has(field));
      css(cell, 'grid-column', String(at + 1));
      put(cell, 'aria-colindex', String(at + 1));
      fillSummaryCell(cell, parts, separator);
    }
    for (const [field, cell] of this.aligned) if (!aligned.has(field)) mark(cell, 'hidden', true);
  }

  drawText() {
    const { model, node } = this;
    if (!node) return;
    const col = model.columns.defs.get(node.field);
    if (!col) return;
    const custom = col.groupCell || model.groupCell ? this.ownContent(node.field) : null;
    for (const [field, own] of this.own) mark(own, 'hidden', field !== node.field);
    mark(this.textPart, 'hidden', !!custom);
    if (custom) return;
    // Lookup keys are requested once the body is measured, as cells do.
    const value = model.groupValue(node, model.state.measured);
    text(this.caption, `${model.text('gridGroupText', { title: model.columns.title(node.field), value: value.text })} `);
    text(this.count, model.columns.can(node.field, 'groupCount') ? model.text('gridGroupCount', { count: model.formatter.count(node.count) }) : '');
    flag(this.cellPart, 'aria-busy', value.state === 'loading');
  }

  /** A column's own content, made the first time this row shows one of its groups. */
  private ownContent(field: string): Component<HTMLSpanElement> {
    const known = this.own.get(field);
    if (known) return known;
    const own = loose<HTMLSpanElement>('span', 'mx-data-grid__group-own');
    const col = this.model.columns.get(field);
    const content = (col.groupCell ?? this.model.groupCell)!(this.context(field));
    if (content instanceof ComponentBase) own.controls.add(content);
    else if (content !== undefined && content !== null) textPart(own, String(content));
    // Before the text.
    this.contentPart.controls.insert(this.contentPart.controls.items.indexOf(this.textPart), own);
    this.own.set(field, own);
    return own;
  }

  private context(field: string): GroupCellContext<T> {
    const view = this;
    const model = this.model;
    const node = () => {
      void view.shown.value;
      return view.node?.field === field ? view.node : null;
    };
    return {
      get value() {
        return node()?.key ?? null;
      },
      get text() {
        const n = node();
        return n ? model.groupValue(n).text : '';
      },
      get count() {
        return node()?.count ?? 0;
      },
      get level() {
        return node()?.level ?? 0;
      },
      get key() {
        return node()?.path ?? [];
      },
      get isExpanded() {
        const n = node();
        void model.groups.state.version;
        return n ? model.groups.isExpanded(n) : false;
      },
      get summaryItems() {
        const n = node();
        return n ? model.summaries.groupEntries(n, false) : [];
      },
      column: this.model.columns.get(field),
    };
  }
}
