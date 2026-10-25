import { Component, ComponentBase, read } from '@motifx/core';
import { data } from '@motifx-community/data';
import { CheckBox } from '../../checkbox/CheckBox';
import { DateBox } from '../../datebox/DateBox';
import { DropDown } from '../../dropdown/DropDown';
import type { DropDownItem } from '../../dropdown/drop-down-item';
import { NumberBox } from '../../numberbox/NumberBox';
import { parseNumber } from '../../numberbox/number-text';
import { TextBox } from '../../textbox/TextBox';
import { Field } from '../../../parts/field/Field';
import type { EditorContext } from '../editor-context';
import type { GridColumn } from '../grid-column';
import type { ListOption } from '../list-option';
import { dateLike } from '../model/date-like';
import type { GridModel } from '../model/GridModel';
import { optionOf } from '../model/option-of';
import { sameValue } from '../model/same-value';
import type { EditorHost } from './editor-host';
import type { EditorKind } from './editor-kind';
import type { EditorValue } from './editor-value';

/**
 * The editor of the cell in edit mode: a kit field drawn without its frame inside the cell (a
 * `TextBox`, a `NumberBox`, a `DateBox`, a `CheckBox` or a `DropDown`, by the column type), or the
 * column's own `editor`. Only one exists at a time; it is made when editing starts and disposed when
 * it ends.
 */
export class CellEditor<T> {
  readonly kind: EditorKind;
  /** The element placed in the cell. */
  readonly box: Component<HTMLDivElement>;
  private readonly field: Field<any> | null;
  private custom: unknown;
  /** A `list` column whose options are still loading. */
  private loadingOptions = false;
  /** The text typed to start editing is in the input. */
  private typedIn = false;

  constructor(
    private readonly model: GridModel<T>,
    readonly column: GridColumn<T>,
    private readonly row: T,
    private readonly value: unknown,
    private readonly initialText: string | undefined,
    host: EditorHost,
    owner: ComponentBase,
  ) {
    this.custom = value;
    const type = column.type;
    this.kind = column.editor ? 'custom' : type === 'number' || type === 'date' || type === 'boolean' || type === 'list' ? type : 'text';
    const box = new Component<HTMLDivElement>('div');
    this.box = box;
    owner.controls.add(box);
    box.element.className = 'mx-data-grid__editor';
    box.element.dataset.kind = this.kind;
    let content: unknown;
    if (column.editor) {
      const ctx: EditorContext<T> = {
        row,
        column,
        value,
        initialText,
        setValue: (v) => (this.custom = v),
        commit: () => host.commit(),
        cancel: () => host.cancel(),
      };
      content = column.editor(ctx);
      if (content instanceof Field) content.value = value;
    } else content = this.createField();
    this.field = content instanceof Field ? content : null;
    if (content instanceof ComponentBase) box.controls.add(content);
    this.field?.element.setAttribute('data-in-cell', '');
  }

  get element(): HTMLElement {
    return this.box.element;
  }

  /** The element that takes the keys: the input, the check box, the list's field. */
  get input(): HTMLElement | null {
    return (this.field as unknown as { focusElement?: HTMLElement } | null)?.focusElement ?? null;
  }

  /** Focuses the editor; the text is selected, or the caret goes after what was typed to start editing. */
  focus() {
    const field = this.field;
    if (!field) {
      const target = this.element.querySelector<HTMLElement>('input, select, textarea, button, [tabindex]:not([tabindex="-1"])') ?? this.element;
      target.focus({ preventScroll: true });
      return;
    }
    field.focus();
    const input = this.input;
    if (!(input instanceof HTMLInputElement) || input.type === 'checkbox' || (this.kind !== 'text' && this.kind !== 'number')) return;
    const typed = this.initialText !== undefined && !this.typedIn;
    if (typed && this.kind === 'number') {
      input.value = this.initialText!;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    this.typedIn = true;
    if (typed) input.setSelectionRange(input.value.length, input.value.length);
    else input.select();
  }

  /** Reads the value; a number or a date that cannot be read is reported, not kept. */
  read(): EditorValue {
    const field = this.field;
    switch (this.kind) {
      case 'custom':
        return { ok: true, value: field ? field.value : this.custom };
      case 'boolean':
        return { ok: true, value: !!field!.value };
      case 'list':
        return { ok: true, value: this.loadingOptions ? this.value : (field!.value ?? null) };
      case 'date': {
        const box = field as DateBox;
        if (box.unfinished) return { ok: false, message: this.model.text('invalidDate') };
        return { ok: true, value: dateLike(box.value, this.value) };
      }
      case 'number': {
        const n = parseNumber((this.input as HTMLInputElement).value, this.model.formatter.locale);
        if (n !== null && Number.isNaN(n)) return { ok: false, message: this.model.text('gridInvalidNumber') };
        return { ok: true, value: n };
      }
      default: {
        const text = (field as TextBox).value;
        return { ok: true, value: text === '' && data.isEmpty(this.value) ? this.value : text };
      }
    }
  }

  /**
   * Whether a key belongs to the editor rather than to the grid: arrows and Home/End inside text,
   * the arrows of a list, Space, and everything in a custom editor but Tab, Enter and Escape.
   */
  ownsKey(e: KeyboardEvent): boolean {
    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowRight':
      case 'Home':
      case 'End':
        return this.kind !== 'boolean';
      case 'ArrowUp':
      case 'ArrowDown':
        return this.kind === 'list' || this.kind === 'custom';
      case 'Enter':
        return false;
      case ' ':
        return true;
      default:
        return this.kind === 'custom' && e.key !== 'Tab' && e.key !== 'Escape';
    }
  }

  dispose() {
    void this.box.dispose();
  }

  private createField(): Field<any> {
    const col = this.column;
    const label = read(col.title) ?? '';
    const align = this.model.columns.align(col.field);
    const value = this.value;
    const common = { label, labelMode: 'hidden' as const };
    switch (this.kind) {
      case 'number':
        return new NumberBox({ ...common, value: typeof value === 'number' ? value : null, showSpinButtons: false, locale: this.model.formatter.locale, align });
      case 'date':
        return new DateBox({ ...common, value: data.toDate(value), locale: this.model.formatter.locale });
      case 'boolean':
        return new CheckBox({ ...common, value: !!value });
      case 'list':
        return this.createList();
      default:
        return new TextBox({
          ...common,
          value: this.initialText ?? (data.isEmpty(value) ? '' : String(value)),
          align,
          spellcheck: false,
          autocomplete: 'off',
        });
    }
  }

  private createList(): Field<any> {
    const col = this.column;
    const list = new DropDown<DropDownItem, unknown>({ label: read(col.title) ?? '', labelMode: 'hidden', value: this.value ?? null });
    const fill = (options: readonly ListOption[]) => {
      const items: DropDownItem[] = options.map(optionOf).map((o) => ({ value: o.value, text: o.label }));
      if (!col.required) items.unshift({ value: null, text: this.model.text('gridEmptyOption') });
      list.items = items;
      const typed = this.initialText;
      if (!typed) return;
      const collator = this.model.formatter.collator;
      const match = items.find((item) => item.value !== null && collator.compare(String(item.text).slice(0, typed.length), typed) === 0);
      if (match && !sameValue(match.value, list.value)) list.value = match.value;
    };
    const source = col.options;
    if (typeof source === 'function') {
      this.loadingOptions = true;
      list.readOnly = true;
      void Promise.resolve()
        .then(() => source(this.row))
        .catch(() => [] as readonly ListOption[])
        .then((options) => {
          if (list.isDisposed) return;
          this.loadingOptions = false;
          list.readOnly = false;
          fill(options);
        });
    } else fill(source ?? []);
    return list;
  }
}
