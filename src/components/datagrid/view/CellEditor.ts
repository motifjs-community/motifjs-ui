import { Component, ComponentBase, read, untracked } from '@motifx/core';
import { data } from '@motifx-community/data';
import { CheckBox } from '../../checkbox/CheckBox';
import { ComboBox } from '../../combobox/ComboBox';
import { DateBox } from '../../datebox/DateBox';
import { DropDown } from '../../dropdown/DropDown';
import type { DropDownItem } from '../../dropdown/drop-down-item';
import { Lookup } from '../../lookup/Lookup';
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
import { readField } from '../model/read-field';

/** Rows of a lookup editor's list asked for at a time. */

type Options = Record<string, unknown>;

/**
 * The editor of the cell in edit mode: a kit field drawn without its frame inside the cell (a
 * `TextBox`, a `NumberBox`, a `DateBox`, a `CheckBox` or a `DropDown`, by the column type; a
 * `DropDown`, `ComboBox` or `Lookup` over the items of a lookup column), or the column's own
 * `editor`. Only one exists at a time in the cells; it is created when editing starts and disposed when
 * it ends. The edit form makes one per field, with its frame and label (`form`: the field props the
 * form gives). `prepare` sees the kit field's props first and may change them, or say no (`false`).
 */
export class CellEditor<T> {
  readonly kind: EditorKind;
  /** The element placed in the cell. */
  readonly box: Component<HTMLDivElement>;
  /** The edit was called off before the editor was created. */
  readonly cancelled: boolean = false;
  private readonly field: Field<any> | null = null;
  /** A custom editor's content, when it is a component. */
  private content: ComponentBase | null = null;
  private custom: unknown;
  private customText: string | undefined;
  /** A `list` column whose options are still loading. */
  private loadingOptions = false;
  /** The text typed to start editing is in the input. */
  private typedIn = false;
  /** The lookup editor's own data source, on the adapter of the column's source. */
  private ownSource: data.DataSource<any, any> | null = null;
  private disposed = false;

  constructor(
    private readonly model: GridModel<T>,
    readonly column: GridColumn<T>,
    /** The row itself. */
    private readonly row: T,
    /** The values entered in the row when the editor is created. */
    private readonly entered: data.RowCheckContext<T>,
    private readonly value: unknown,
    private readonly initialText: string | undefined,
    private readonly host: EditorHost,
    owner: ComponentBase,
    prepare: (options: Options) => boolean = () => true,
    private readonly form: Options | null = null,
  ) {
    this.custom = value;
    const type = column.type;
    this.kind = column.editor ? 'custom' : column.lookup ? 'lookup' : type === 'number' || type === 'date' || type === 'boolean' || type === 'list' ? type : 'text';
    const box = new Component<HTMLDivElement>('div');
    this.box = box;
    owner.controls.add(box);
    box.element.className = 'mx-data-grid__editor';
    box.element.dataset.kind = this.kind;
    if (column.editor) {
      if (!prepare({})) {
        this.cancelled = true;
        return;
      }
      const ctx: EditorContext<T> = {
        row,
        values: entered.values,
        getValue: entered.getValue,
        column,
        lookup: column.lookup,
        value,
        initialText,
        setValue: (v, text) => {
          this.custom = v;
          this.customText = text;
        },
        commit: () => host.commit(),
        cancel: () => host.cancel(),
      };
      const content = column.editor(ctx);
      if (content instanceof Field) {
        content.value = value;
        if (form) for (const [name, given] of Object.entries(form)) if (name in content && given !== undefined) (content as unknown as Options)[name] = given;
      } else if (form && content instanceof ComponentBase) {
        const caption = box.element.appendChild(document.createElement('span'));
        caption.className = 'mx-data-grid__form-label';
        caption.textContent = String(read(form.label as string | (() => string)) ?? '');
      }
      this.field = content instanceof Field ? content : null;
      if (content instanceof ComponentBase) {
        this.content = content;
        box.controls.add(content);
      }
    } else {
      const options = this.kind === 'lookup' ? this.lookupOptions() : this.options();
      if (!prepare(options)) {
        this.cancelled = true;
        this.ownSource?.dispose();
        return;
      }
      this.field = this.kind === 'lookup' ? this.createLookup(options) : this.createField(options);
      box.controls.add(this.field);
    }
    if (!form) this.field?.element.setAttribute('data-in-cell', '');
  }

  /** The editor component: the kit field, or a custom editor's content. */
  get editor(): ComponentBase | null {
    return this.field ?? this.content;
  }

  get element(): HTMLElement {
    return this.box.element;
  }

  /** The element that takes the keys: the input, the check box, the list's field. */
  get input(): HTMLElement | null {
    return (this.field as unknown as { focusElement?: HTMLElement } | null)?.focusElement ?? null;
  }

  /** A lookup's list is open. */
  get listOpen(): boolean {
    return !!(this.field as unknown as { opened?: boolean } | null)?.opened;
  }

  /** Focuses the editor; the text is selected, or the caret goes after what was typed to start editing (a lookup's list opens and searches it). */
  focus() {
    const field = this.field;
    if (!field) {
      const target = this.element.querySelector<HTMLElement>('input, select, textarea, button, [tabindex]:not([tabindex="-1"])') ?? this.element;
      target.focus({ preventScroll: true });
      return;
    }
    field.focus();
    const typed = this.initialText !== undefined && !this.typedIn;
    if (this.kind === 'lookup') {
      this.typedIn = true;
      if (!typed || !this.initialText) return;
      if (field instanceof DropDown) field.open(this.initialText);
      else if (field instanceof ComboBox) {
        field.inputElement.value = this.initialText;
        field.inputElement.dispatchEvent(new Event('input', { bubbles: true }));
      }
      return;
    }
    const input = this.input;
    if (!(input instanceof HTMLInputElement) || input.type === 'checkbox' || (this.kind !== 'text' && this.kind !== 'number')) return;
    if (typed && this.kind === 'number') {
      input.value = this.initialText!;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    this.typedIn = true;
    if (!typed && this.model.settings.get('selectTextOnEditStart')) input.select();
    else input.setSelectionRange(input.value.length, input.value.length);
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
      case 'lookup':
        return { ok: true, value: field!.value ?? null };
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

  /** What the editor chose for its value, to show for that key: the lookup item, or the text a custom editor gave. */
  chosen(): unknown {
    if (this.kind === 'custom') return this.customText;
    const field = this.field as unknown as { selectedItem?: unknown } | null;
    return this.kind === 'lookup' ? field?.selectedItem : undefined;
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
        return this.kind === 'list' || this.kind === 'lookup' || this.kind === 'custom';
      case 'Enter':
        return false;
      case ' ':
        return true;
      default:
        return this.kind === 'custom' && e.key !== 'Tab' && e.key !== 'Escape';
    }
  }

  dispose() {
    this.disposed = true;
    void this.box.dispose();
    this.ownSource?.dispose();
  }

  private options(): Options {
    const own = this.cellOptions();
    if (!this.form) return own;
    // In the form: framed, with the spin buttons; no alignment of the cell.
    delete own.showSpinButtons;
    delete own.align;
    return { ...own, ...this.form };
  }

  private cellOptions(): Options {
    const col = this.column;
    const label = readField(col, 'title') ?? '';
    const align = this.model.columns.align(col.field);
    const value = this.value;
    const common = { label, labelMode: 'hidden' as const };
    switch (this.kind) {
      case 'number':
        return { ...common, value: typeof value === 'number' ? value : null, showSpinButtons: false, locale: this.model.formatter.locale, align };
      case 'date':
        return { ...common, value: data.toDate(value), locale: this.model.formatter.locale };
      case 'boolean':
        return { ...common, value: !!value };
      case 'list':
        return { label, labelMode: 'hidden', value: value ?? null };
      default:
        return { ...common, value: this.initialText ?? (data.isEmpty(value) ? '' : String(value)), align, spellcheck: false, autocomplete: 'off' };
    }
  }

  private createField(options: Options): Field<any> {
    switch (this.kind) {
      case 'number':
        return new NumberBox(options);
      case 'date':
        return new DateBox(options);
      case 'boolean':
        return new CheckBox(options);
      case 'list':
        return this.createList(options);
      default:
        return new TextBox(options);
    }
  }

  private createList(options: Options): Field<any> {
    const col = this.column;
    const list = new DropDown<DropDownItem, unknown>(options);
    const fill = (choices: readonly ListOption[]) => {
      const items: DropDownItem[] = choices.map(optionOf).map((o) => ({ value: o.value, text: o.label }));
      if (!this.model.isRequired(col)) items.unshift({ value: null, text: this.model.text('gridEmptyOption') });
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
        .then(() => untracked(() => source(this.row, this.entered)))
        .catch(() => [] as readonly ListOption[])
        .then((choices) => {
          if (list.isDisposed) return;
          this.loadingOptions = false;
          list.readOnly = false;
          fill(choices);
        });
    } else fill(source ?? []);
    return list;
  }

  /**
   * The props of a lookup's editor: its items narrowed for the row (`lookup.filter`), from the
   * array, or from a data source of its own over the column's adapter (so its search never changes
   * a source the page shows elsewhere), with search, the clear button and `editorOptions`.
   */
  private lookupOptions(): Options {
    const col = this.column;
    const lookup = col.lookup!;
    const lookups = this.model.lookups;
    const items = lookups.items(col);
    const source = readField(lookup, 'dataSource');
    const search = lookups.search(col, this.row, this.entered);
    const options: Options = {
      label: readField(col, 'title') ?? '',
      labelMode: 'hidden',
      value: data.isEmpty(this.value) ? null : this.value,
      textField: (item: unknown) => lookups.textOf(col, item),
      clearButton: lookup.allowClearing ?? false,
      searchEnabled: true,
    };
    if (Array.isArray(source)) {
      const test = search.filter ? data.createRowFilter<object>(search.filter, { locale: search.locale }) : null;
      options.items = test ? source.filter((item) => item !== null && typeof item === 'object' && test(item as object)) : source;
      options.valueField = lookup.valueField ?? ((item: unknown) => items!.valueOf(item));
    } else if (source) {
      const keys = (source as data.DataSource<any, any>).adapter.keys.fields;
      options.valueField = lookup.valueField ?? (keys?.length === 1 ? keys[0] : (item: unknown) => items!.valueOf(item));
      options.searchEnabled = !!search.searchFields?.length;
      this.ownSource = new data.DataSource<any, any>({
        adapter: (source as data.DataSource<any, any>).adapter,
        loadMode: 'blocks',
        pageSize: Math.max(1, Math.floor(lookup.pageSize ?? 50)),
        filter: search.filter,
        searchFields: search.searchFields?.length ? search.searchFields : undefined,
        params: (source as data.DataSource<any, any>).params,
      });
      options.dataSource = this.ownSource;
    }
    Object.assign(options, lookup.editorOptions, this.form);
    return options;
  }

  /** The lookup's editor: a `DropDown` (default), a `ComboBox` (it searches as it is typed in, so it needs a field to search) or a `Lookup`. A pick commits the cell. */
  private createLookup(options: Options): Field<any> {
    const kind = this.column.lookup!.editor ?? 'dropdown';
    const canType = !this.ownSource || options.searchEnabled !== false;
    let field: Field<any>;
    if (kind === 'combobox' && canType) {
      const props = { ...options };
      delete props.searchEnabled;
      field = new ComboBox<any, unknown>(props);
    } else if (kind === 'lookup') field = new Lookup<any, unknown>(options);
    else field = new DropDown<any, unknown>(options);
    // Picking an item is the whole edit: the cell keeps it, unless something else (Tab) already moved on.
    field.onValueChanged((e) => {
      if (e.byUser) queueMicrotask(() => !this.disposed && this.host.commit());
    });
    return field;
  }
}
