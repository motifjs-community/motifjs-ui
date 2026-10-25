import { Component, effect, read, type ComponentBase } from '@motifx/core';
import { data } from '@motifx-community/data';
import { DateBox } from '../../datebox/DateBox';
import { DropDown } from '../../dropdown/DropDown';
import type { DropDownItem } from '../../dropdown/drop-down-item';
import { NumberBox } from '../../numberbox/NumberBox';
import { TextBox } from '../../textbox/TextBox';
import type { Field } from '../../../parts/field/Field';
import type { ColumnFilter } from '../column-filter';
import type { GridModel } from '../model/GridModel';
import { optionOf } from '../model/option-of';
import { createActionButton } from './action-button';
import { OPERATOR_MARKS, OPERATOR_TEXTS } from './operator-texts';

const text = (v: unknown) => (typeof v === 'string' ? v : v === undefined || v === null ? '' : String(v));
const num = (v: unknown) => (typeof v === 'number' && !Number.isNaN(v) ? v : null);

/**
 * One cell of the filter row: a condition button (by the column type; none for a check box column)
 * and the kit's editor for the value — a `TextBox`, `NumberBox` or `DateBox`, two of them for
 * "between", none for "empty" and "not empty", a `DropDown` for list and yes/no columns. The editors
 * are bound to the grid's filters both ways and are out of the Tab order: the grid is one tab stop.
 */
export class FilterCell<T> {
  /** The condition button; `null` for a check box column. */
  readonly condition: HTMLButtonElement | null;
  readonly editors: Field<any>[] = [];
  private readonly stops: (() => void)[] = [];

  constructor(
    private readonly model: GridModel<T>,
    readonly field: string,
    readonly cell: HTMLElement,
    owner: ComponentBase,
  ) {
    const col = model.columns.get(field);
    // The editors live in a component of their own, so showing and hiding them keeps their place.
    const holder = new Component<HTMLDivElement>('div');
    owner.controls.add(holder);
    const box = holder.element;
    box.className = 'mx-data-grid__filter';
    cell.append(box);
    this.condition = col.type === 'boolean' ? null : this.createCondition();
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
    const locale = () => model.formatter.locale;
    switch (col.type) {
      case 'number':
        for (const key of ['value', 'value2'] as const) {
          this.editors.push(
            new NumberBox({
              ...common,
              label: key === 'value' ? firstLabel : secondLabel,
              locale,
              showSpinButtons: false,
              align: 'end',
              visible: key === 'value' ? () => !blank() : between,
              value: () => num(get()[key]),
              onValueChanged: (e) => e.byUser && set({ [key]: e.value }, true),
            }),
          );
        }
        break;
      case 'date':
        for (const key of ['value', 'value2'] as const) {
          this.editors.push(
            new DateBox({
              ...common,
              label: key === 'value' ? firstLabel : secondLabel,
              locale,
              visible: key === 'value' ? () => !blank() : between,
              value: () => data.toDate(get()[key]),
              onValueChanged: (e) => e.byUser && set({ [key]: e.value }, false),
            }),
          );
        }
        break;
      case 'boolean':
      case 'list':
        this.editors.push(
          new DropDown<DropDownItem, unknown>({
            ...common,
            label: firstLabel,
            items: () => this.choices(),
            visible: () => !blank(),
            value: () => (get().value === undefined ? null : get().value),
            onValueChanged: (e) => e.byUser && set({ value: e.value ?? undefined }, false),
          }),
        );
        break;
      default:
        this.editors.push(
          new TextBox({
            ...common,
            label: firstLabel,
            spellcheck: false,
            autocomplete: 'off',
            visible: () => !blank(),
            value: () => text(get().value),
            onValueChanged: (e) => e.byUser && set({ value: e.value || undefined }, true),
          }),
        );
    }
    if (this.condition) box.append(this.condition);
    for (const editor of this.editors) {
      editor.element.setAttribute('data-in-filter', '');
      holder.controls.add(editor);
    }
    this.stops.push(
      effect(() => {
        box.hidden = !model.columns.can(field, 'filterRow');
      }),
    );
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
    for (const stop of this.stops) stop();
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
    this.stops.push(
      effect(() => {
        const op = model.filters.operator(this.field);
        mark.textContent = OPERATOR_MARKS[op];
        const label = model.text('gridFilterCondition', { operator: model.text(OPERATOR_TEXTS[op]), title: read(model.columns.get(this.field).title) ?? '' });
        button.setAttribute('aria-label', label);
        button.dataset.hint = label;
        button.toggleAttribute('data-set', model.filters.isActive(this.field));
      }),
    );
    return button;
  }
}
