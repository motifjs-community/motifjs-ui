import { Component, ComponentBase, untracked } from '@motifx/core';
import { data } from '@motifx-community/data';
import { handOver } from '../../../core/draw-parts';
import { DateBox } from '../../datebox/DateBox';
import { DropDown } from '../../dropdown/DropDown';
import type { DropDownItem } from '../../dropdown/drop-down-item';
import { NumberBox } from '../../numberbox/NumberBox';
import { TextBox } from '../../textbox/TextBox';
import { Field } from '../../../parts/field/Field';
import { focusableIn } from '../../../core/focus';
import type { FilterEditorContext } from '../filter-editor-context';
import type { ColumnFilter } from '../column-filter';
import type { GridFilterValue } from '../grid-filter-value';
import type { GridModel } from '../model/GridModel';
import { optionOf } from '../model/option-of';
import { ChoiceListAdapter, type ChoiceRow } from '../model/ChoiceListAdapter';
import { createActionButton } from './action-button';
import { OPERATOR_MARKS, OPERATOR_TEXTS } from './operator-texts';
import { readField } from '../model/read-field';

const text = (v: unknown) => (typeof v === 'string' ? v : v === undefined || v === null ? '' : String(v));
const num = (v: unknown) => (typeof v === 'number' && !Number.isNaN(v) ? v : null);
const same = (a: readonly unknown[], b: readonly unknown[]) => a.length === b.length && a.every((v, i) => Object.is(v, b[i]));

/**
 * One cell of the filter row: a condition button (by the column type; none for a check box column)
 * and the kit's editor for the value — a `TextBox`, `NumberBox` or `DateBox`, two of them for
 * "between", none for "empty" and "not empty", a `DropDown` for list and yes/no columns. The editors
 * are bound to the grid's filters both ways and are out of the Tab order: the grid is one tab stop.
 * It follows nothing: the filter row draws it again (`draw`) whenever the grid tells a change.
 */
export class FilterCell<T> {
  /** The condition button; `null` for a check box column. */
  readonly condition: HTMLButtonElement | null;
  readonly editors: Field<any>[] = [];
  /** A custom filter editor's content when it is not a `Field`. */
  private custom: ComponentBase | null = null;
  /** What `draw` does, part by part. */
  private readonly drawers: (() => void)[] = [];
  private readonly stops: (() => void)[] = [];
  /** Holds the editors; it goes with the cell. */
  private readonly holder: Component<HTMLDivElement>;
  private disposed = false;

  constructor(
    private readonly model: GridModel<T>,
    readonly field: string,
    readonly cell: HTMLElement,
    owner: ComponentBase,
  ) {
    const col = model.columns.get(field);
    // The editors live in a component of their own, so showing and hiding them keeps their place.
    const holder = new Component<HTMLDivElement>('div');
    this.holder = holder;
    owner.controls.add(holder);
    const box = holder.element;
    box.className = 'mx-data-grid__filter';
    cell.append(box);
    this.condition = col.type === 'boolean' || col.lookup ? null : this.createCondition();
    const get = () => model.filters.get(field) ?? ({} as ColumnFilter);
    const set = (change: Partial<ColumnFilter>, typed: boolean) => model.filters.update(field, change, typed);
    const title = () => model.columns.title(field);
    const between = () => model.filters.operator(field) === 'between';
    const blank = () => {
      const op = model.filters.operator(field);
      return op === 'isblank' || op === 'isnotblank';
    };
    const common = { labelMode: 'hidden' as const, size: 'sm' as const, tabStop: false };
    const firstLabel = () => model.text(between() ? 'gridFilterFrom' : 'gridFilterFor', { title: title() });
    const secondLabel = () => model.text('gridFilterTo', { title: title() });
    if (col.filterEditor) this.customEditor(col.filterEditor, get, set, firstLabel);
    else if (col.lookup) this.editors.push(this.lookupList(firstLabel, get, set));
    else switch (col.type) {
      case 'number':
        for (const key of ['value', 'value2'] as const) {
          const editor = new NumberBox({
            ...common,
            showSpinButtons: false,
            align: 'end',
            onValueChanged: (e) => e.byUser && set({ [key]: e.value }, true),
          });
          this.drawers.push(() => {
            editor.label = key === 'value' ? firstLabel() : secondLabel();
            editor.locale = model.formatter.locale;
            editor.visible = key === 'value' ? !blank() : between();
            handOver(editor, num(get()[key]));
          });
          this.editors.push(editor);
        }
        break;
      case 'date':
        for (const key of ['value', 'value2'] as const) {
          const editor = new DateBox({
            ...common,
            onValueChanged: (e) => e.byUser && set({ [key]: e.value }, false),
          });
          this.drawers.push(() => {
            editor.label = key === 'value' ? firstLabel() : secondLabel();
            editor.locale = model.formatter.locale;
            editor.visible = key === 'value' ? !blank() : between();
            handOver(editor, data.toDate(get()[key]));
          });
          this.editors.push(editor);
        }
        break;
      case 'list':
        if (typeof col.options === 'function') {
          this.editors.push(this.askedList(firstLabel, get, set));
          break;
        }
      // falls through
      case 'boolean': {
        const editor = new DropDown<DropDownItem, unknown>({
          ...common,
          onValueChanged: (e) => e.byUser && set({ value: e.value ?? undefined }, false),
        });
        let shown: unknown[] = [];
        this.drawers.push(() => {
          editor.label = firstLabel();
          const choices = this.choices();
          const now = choices.flatMap((c) => [c.value, c.text]);
          if (!same(now, shown)) {
            shown = now;
            editor.items = choices;
          }
          editor.visible = !blank();
          handOver(editor, get().value === undefined ? null : get().value);
        });
        this.editors.push(editor);
        break;
      }
      default: {
        const editor = new TextBox({
          ...common,
          spellcheck: false,
          autocomplete: 'off',
          onValueChanged: (e) => e.byUser && set({ value: e.value || undefined }, true),
        });
        this.drawers.push(() => {
          editor.label = firstLabel();
          editor.visible = !blank();
          handOver(editor, text(get().value));
        });
        this.editors.push(editor);
      }
    }
    if (this.condition) box.append(this.condition);
    for (const editor of this.editors) {
      editor.element.setAttribute('data-in-filter', '');
      holder.controls.add(editor);
    }
    if (this.custom) {
      this.custom.element.setAttribute('data-in-filter', '');
      holder.controls.add(this.custom);
    }
    this.drawers.push(() => {
      const hidden = !model.columns.can(field, 'filterRow');
      if (box.hidden !== hidden) box.hidden = hidden;
    });
    this.draw();
  }

  /** Draws the editors and the condition as the column's filter is now. */
  draw() {
    if (this.disposed) return;
    untracked(() => {
      for (const draw of this.drawers) draw();
    });
  }

  /** The element that takes the keys of an editor (its input or its list's field). */
  inputOf(editor: Field<any>): HTMLElement {
    return (editor as unknown as { focusElement: HTMLElement }).focusElement;
  }

  /** The editors that show now. */
  shownEditors(): Field<any>[] {
    return this.editors.filter((e) => e.visible);
  }

  /** Focuses the first editor; a character typed on the cell starts its text. Returns whether there was one. */
  focus(typed?: string): boolean {
    if (this.custom && !this.cell.querySelector('.mx-data-grid__filter')?.hasAttribute('hidden')) {
      const target = focusableIn(this.custom.element as HTMLElement)[0];
      target?.focus();
      return !!target;
    }
    const editor = this.shownEditors()[0];
    if (!editor || this.cell.querySelector('.mx-data-grid__filter')?.hasAttribute('hidden')) return false;
    editor.focus();
    const input = this.inputOf(editor);
    if (typed !== undefined && input instanceof HTMLInputElement && (editor instanceof TextBox || editor instanceof NumberBox)) {
      input.value = typed;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.setSelectionRange(input.value.length, input.value.length);
    }
    return true;
  }

  dispose() {
    this.disposed = true;
    for (const stop of this.stops) stop();
    if (!this.holder.isDisposed) void this.holder.dispose({ skipLeaveTransition: true });
  }

  /**
   * A list column whose choices come from a function: it is asked with no row when the list first opens (or for the
   * text of a chosen value), and the list says it is loading until the answer is there.
   */
  private askedList(label: () => string, get: () => ColumnFilter, set: (change: Partial<ColumnFilter>, typed: boolean) => void): DropDown<ChoiceRow, unknown> {
    const model = this.model;
    const col = model.columns.get(this.field);
    let source: data.DataSource<ChoiceRow, unknown> | null = null;
    let shown: unknown[] = [];
    const arrived = model.choices.onChanged((field) => {
      if (field !== this.field) return;
      shown = [];
      this.draw();
    });
    this.stops.push(() => {
      arrived.dispose();
      source?.dispose();
    });
    const list = new DropDown<ChoiceRow, unknown>({
      labelMode: 'hidden',
      size: 'sm',
      tabStop: false,
      textField: 'text',
      valueField: 'value',
      onValueChanged: (e) => e.byUser && set({ value: e.value ?? undefined }, false),
      onOpened: () => {
        // A failed answer is asked for again; any other is the one kept.
        if (source && !model.choices.failed(col)) return;
        source?.dispose();
        source = new data.DataSource({ adapter: new ChoiceListAdapter(model.choices, col, { value: null, text: model.text('gridAll') }) });
        list.dataSource = source;
      },
    });
    this.drawers.push(() => {
      list.label = label();
      list.placeholder = model.text('gridAll');
      // Until it opens, the field shows the chosen value's text alone.
      const value = get().value;
      if (!source) {
        const label = data.isEmpty(value) ? '' : model.choices.of(col)?.find((o) => Object.is(o.value, value) || String(o.value) === String(value))?.label;
        const items = data.isEmpty(value) || label === undefined ? [] : [{ value, text: label }];
        const now = items.flatMap((i) => [i.value, i.text]);
        if (!same(now, shown)) {
          shown = now;
          list.items = items;
        }
      }
      handOver(list, value === undefined ? null : value);
    });
    return list;
  }

  /**
   * The column's own filter editor: a `Field` is bound to the filter both ways, any other component sets the value
   * through the context and hears changes through it.
   */
  private customEditor(make: (ctx: FilterEditorContext<T>) => unknown, get: () => ColumnFilter, set: (change: Partial<ColumnFilter>, typed: boolean) => void, label: () => string) {
    const model = this.model;
    const listeners = new Set<(value: unknown, value2: unknown) => void>();
    const empty = (v: unknown) => (data.isEmpty(v) ? undefined : v);
    const ctx: FilterEditorContext<T> = {
      column: model.columns.get(this.field),
      get operator() {
        return model.filters.operator(ctx.column.field);
      },
      get value() {
        return get().value;
      },
      get value2() {
        return get().value2;
      },
      setValue: (value, value2) => set(value2 === undefined ? { value: empty(value) } : { value: empty(value), value2: empty(value2) }, false),
      clear: () => set({ value: undefined, value2: undefined }, false),
      onChanged: (listener) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
      },
    };
    const content = make(ctx);
    if (content instanceof Field) {
      content.onValueChanged((e) => e.byUser && set({ value: empty(e.value) }, content instanceof TextBox));
      this.editors.push(content);
    } else if (content instanceof ComponentBase) {
      this.custom = content;
    }
    // Told only when the filter changes after the editor was made with it.
    let last: unknown[] = [get().value, get().value2];
    this.drawers.push(() => {
      const now = [get().value, get().value2];
      if (content instanceof Field) {
        if (!content.label) content.label = label();
        handOver(content, now[0] === undefined ? null : now[0]);
      }
      if (same(now, last)) return;
      last = now;
      for (const listener of listeners) listener(now[0], now[1]);
    });
    this.stops.push(() => listeners.clear());
  }

  /**
   * A lookup column's list: "(All)" first, then the texts of its keys, searched by text. Its values
   * are requested the first time it opens, and again when the other filters changed since.
   */
  private lookupList(label: () => string, get: () => ColumnFilter, set: (change: Partial<ColumnFilter>, typed: boolean) => void): DropDown<GridFilterValue, unknown> {
    const model = this.model;
    const col = model.columns.get(this.field);
    const values = model.values.lookups.source(this.field, 'all');
    let opened = false;
    let loadedWith = '';
    let source: unknown = undefined;
    let shown: unknown[] = [];
    const texts = model.lookups.onChanged(() => {
      shown = [];
      this.draw();
    });
    this.stops.push(() => {
      texts.dispose();
      const adapter = values.adapter;
      values.dispose();
      adapter.dispose();
    });
    const list = new DropDown<GridFilterValue, unknown>({
      labelMode: 'hidden',
      size: 'sm',
      tabStop: false,
      searchEnabled: true,
      textField: 'text',
      valueField: 'value',
      onValueChanged: (e) => e.byUser && set({ value: e.value ?? undefined }, false),
      onOpened: () => {
        const filter = JSON.stringify(model.values.lookups.otherFilter(this.field));
        if (opened && filter !== loadedWith) void values.reload();
        loadedWith = filter;
        if (opened) return;
        opened = true;
        this.draw();
      },
    });
    this.drawers.push(() => {
      list.label = label();
      list.placeholder = model.text('gridAll');
      if (source !== (opened ? values : null)) {
        source = opened ? values : null;
        list.dataSource = opened ? values : null;
      }
      // Until it opens, the field shows the chosen key's text alone.
      const value = get().value;
      const items = data.isEmpty(value) ? [] : [{ value, text: model.lookups.textOfKey(col, value) }];
      const now = items.flatMap((i) => [i.value, i.text]);
      if (!same(now, shown)) {
        shown = now;
        list.items = items;
      }
      handOver(list, value === undefined ? null : value);
    });
    return list;
  }

  /** The choices of a list or yes/no column; "All" first stands for no filter. */
  private choices(): DropDownItem[] {
    const col = this.model.columns.get(this.field);
    const all: DropDownItem = { value: null, text: this.model.text('gridAll') };
    if (col.type === 'boolean') return [all, { value: true, text: this.model.text('yes') }, { value: false, text: this.model.text('no') }];
    const options = Array.isArray(col.options) ? col.options : [];
    return [all, ...options.map(optionOf).map((o) => ({ value: o.value, text: o.label }))];
  }

  private createCondition(): HTMLButtonElement {
    const model = this.model;
    const button = createActionButton();
    button.classList.remove('mx-data-grid__action');
    button.classList.add('mx-data-grid__condition');
    button.dataset.tone = 'standard';
    button.setAttribute('aria-haspopup', 'menu');
    const mark = document.createElement('span');
    mark.className = 'mx-data-grid__condition-mark';
    mark.setAttribute('aria-hidden', 'true');
    button.append(mark);
    this.drawers.push(() => {
      const op = model.filters.operator(this.field);
      if (mark.textContent !== OPERATOR_MARKS[op]) mark.textContent = OPERATOR_MARKS[op];
      const label = model.text('gridFilterCondition', { operator: model.text(OPERATOR_TEXTS[op]), title: readField(model.columns.get(this.field), 'title') ?? '' });
      if (button.getAttribute('aria-label') !== label) button.setAttribute('aria-label', label);
      if (button.dataset.hint !== label) button.dataset.hint = label;
      const set = model.filters.isActive(this.field);
      if (button.hasAttribute('data-set') !== set) button.toggleAttribute('data-set', set);
    });
    return button;
  }
}
