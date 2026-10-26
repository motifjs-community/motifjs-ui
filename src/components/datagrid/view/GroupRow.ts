import { ComponentBase, createSignal, effect, untracked } from '@motifx/core';
import { chevronEnd } from '../../../core/glyphs';
import type { GroupCellContext } from '../group-cell-context';
import type { GridModel } from '../model/GridModel';
import type { GroupNode } from '../model/group-node';
import type { SummaryPart } from '../model/summary-part';
import { fillSummaryCell } from './summary-cell';

/**
 * One pooled group row of the body: an arrow, "Column: value", the row count and the group summary
 * items in one cell that spans the columns, moved in by its level. Items aligned by column
 * (`alignByColumn`) get cells of their own under their columns, and the group's cell ends before
 * the first of them. Like the data rows it is made once and shows other groups while the user
 * scrolls; a column's own `groupCell` content is made the first time the row shows a group of that
 * column, and kept.
 */
export class GroupRow<T> {
  readonly element: HTMLDivElement;
  readonly cell: HTMLDivElement;
  /** Grid index; -1 while the row is not used. */
  index = -1;
  node: GroupNode | null = null;
  private readonly shown = createSignal(0);
  private readonly text: HTMLSpanElement;
  private readonly caption = document.createTextNode('');
  private readonly count = document.createTextNode('');
  private readonly summary = document.createTextNode('');
  /** Cells of the items aligned by column, by field; made when first needed. */
  private readonly aligned = new Map<string, HTMLDivElement>();
  private visible: string[] = [];
  /** Columns' own contents, by field, and those that are components. */
  private readonly own = new Map<string, HTMLElement>();
  private readonly contents = new Map<string, ComponentBase>();
  private readonly stops: (() => void)[] = [];

  constructor(
    private readonly model: GridModel<T>,
    /** Holds the components of `groupCell` contents, so they live and go with it. */
    private readonly host: ComponentBase,
  ) {
    const el = document.createElement('div');
    el.className = 'mx-data-grid__row mx-data-grid__group-row';
    el.setAttribute('role', 'row');
    el.hidden = true;
    const cell = document.createElement('div');
    cell.className = 'mx-data-grid__group-cell';
    cell.setAttribute('role', 'gridcell');
    cell.setAttribute('aria-colindex', '1');
    cell.tabIndex = -1;
    const content = document.createElement('span');
    content.className = 'mx-data-grid__group-content';
    const toggle = document.createElement('span');
    toggle.className = 'mx-data-grid__group-toggle';
    toggle.setAttribute('aria-hidden', 'true');
    toggle.append(chevronEnd());
    this.text = document.createElement('span');
    this.text.className = 'mx-data-grid__group-text';
    const count = document.createElement('span');
    count.className = 'mx-data-grid__group-count';
    count.append(this.count);
    const summary = document.createElement('span');
    summary.className = 'mx-data-grid__group-summary';
    summary.append(this.summary);
    this.text.append(this.caption, count, summary);
    content.append(toggle, this.text);
    cell.append(content);
    el.append(cell);
    this.element = el;
    this.cell = cell;
    this.stops.push(
      effect(() => this.drawLook()),
      effect(() => this.drawText()),
      effect(() => this.drawSummary()),
    );
  }

  /** Shows the group at grid row `index`, at `top`. */
  use(index: number, node: GroupNode, top: number) {
    if (this.index !== index || this.node !== node) {
      this.index = index;
      this.node = node;
      this.shown.value = this.shown.peek() + 1;
    }
    this.element.hidden = false;
    this.element.style.transform = `translateY(${top}px)`;
  }

  /** Draws the row again as it is. */
  redraw() {
    this.shown.value = this.shown.peek() + 1;
  }

  /** Back to the pool, hidden. */
  release() {
    if (this.index !== -1 || this.node !== null) {
      this.index = -1;
      this.node = null;
      this.shown.value = this.shown.peek() + 1;
    }
    this.element.hidden = true;
  }

  /** The cell spans the visible columns, up to the first one holding an aligned item. */
  arrange(visible: string[]) {
    this.visible = visible;
    this.redraw();
  }

  /** Lookup keys came: the text is drawn again when it shows one. */
  drawLookup() {
    if (this.node && this.model.columns.defs.get(this.node.field)?.lookup) this.shown.value = this.shown.peek() + 1;
  }

  /** A column taken out, or made again: its aligned cell and its own content go. */
  removeColumn(field: string) {
    this.aligned.get(field)?.remove();
    this.aligned.delete(field);
    this.own.get(field)?.remove();
    this.own.delete(field);
    const content = this.contents.get(field);
    this.contents.delete(field);
    if (content && !content.isDisposed) void content.dispose({ skipLeaveTransition: true });
    this.redraw();
  }

  dispose() {
    for (const stop of this.stops) stop();
  }

  private drawLook() {
    void this.shown.value;
    const { model, node, index, element } = this;
    if (!node || index < 0) {
      element.removeAttribute('aria-rowindex');
      return;
    }
    element.setAttribute('aria-rowindex', String(model.ariaRowIndex(index)));
    element.setAttribute('aria-level', String(node.level + 1));
    void model.groups.state.version;
    void model.state.version;
    const open = model.groups.isExpanded(node);
    element.toggleAttribute('data-locked', !model.canCollapse(node));
    element.dataset.expand = model.expandModeOf(node);
    element.setAttribute('aria-expanded', String(open));
    element.toggleAttribute('data-expanded', open);
    element.toggleAttribute('data-active', model.state.activeRow === index);
    element.style.setProperty('--_level', String(node.level));
    const ev = model.events;
    if (ev.listened(ev.rowPrepared)) untracked(() => ev.rowPrepared.fire({ row: undefined, rowIndex: index, rowType: 'group', groupKey: [...node.path], isSelected: false, element }));
  }

  /**
   * Group summary items: after the count, or under their columns (`alignByColumn`), not under the
   * first column, which holds the text, nor under a column that does not show.
   */
  private drawSummary() {
    void this.shown.value;
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
    this.summary.data = inText.length ? separator + inText.join(separator) : '';
    let first = visible.length;
    for (const field of aligned.keys()) first = Math.min(first, visible.indexOf(field));
    this.cell.style.gridColumn = first < visible.length ? `1 / ${first + 1}` : '';
    this.cell.setAttribute('aria-colspan', String(Math.max(1, first)));
    for (const [field, parts] of aligned) {
      let cell = this.aligned.get(field);
      if (!cell) {
        cell = document.createElement('div');
        cell.className = 'mx-data-grid__cell mx-data-grid__summary-cell';
        cell.setAttribute('role', 'gridcell');
        cell.dataset.field = field;
        this.element.append(cell);
        this.aligned.set(field, cell);
      }
      const at = visible.indexOf(field);
      // While columns are virtual, an item under a column without cells waits for it.
      cell.hidden = !model.columnWindow.has(field);
      cell.style.gridColumn = String(at + 1);
      cell.setAttribute('aria-colindex', String(at + 1));
      fillSummaryCell(cell, parts, separator);
    }
    for (const [field, cell] of this.aligned) if (!aligned.has(field)) cell.hidden = true;
  }

  private drawText() {
    void this.shown.value;
    const { model, node } = this;
    if (!node) return;
    const col = model.columns.defs.get(node.field);
    if (!col) return;
    const custom = col.groupCell || model.groupCell ? this.ownContent(node.field) : null;
    for (const [field, el] of this.own) el.hidden = field !== node.field;
    this.text.hidden = !!custom;
    if (custom) return;
    // Lookup keys are asked for once the body is measured, as cells do.
    const value = model.groupValue(node, model.state.measured);
    this.caption.data = `${model.text('gridGroupText', { title: model.columns.title(node.field), value: value.text })} `;
    this.count.data = model.columns.can(node.field, 'groupCount') ? model.text('gridGroupCount', { count: model.formatter.count(node.count) }) : '';
    if (value.state === 'loading') this.cell.setAttribute('aria-busy', 'true');
    else this.cell.removeAttribute('aria-busy');
  }

  /** A column's own content, made the first time this row shows one of its groups. */
  private ownContent(field: string): HTMLElement {
    let el = this.own.get(field);
    if (el) return el;
    el = document.createElement('span');
    el.className = 'mx-data-grid__group-own';
    const col = this.model.columns.get(field);
    const content = (col.groupCell ?? this.model.groupCell)!(this.context(field));
    if (content instanceof ComponentBase) {
      this.host.controls.add(content);
      el.append(content.element as Node);
      this.contents.set(field, content);
    } else if (content instanceof Node) el.append(content);
    else if (content !== undefined && content !== null) el.append(String(content));
    this.text.before(el);
    this.own.set(field, el);
    return el;
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
