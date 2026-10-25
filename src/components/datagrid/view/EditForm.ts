import { Component, effect, read, untracked } from '@motifx/core';
import { Button } from '../../button/Button';
import type { FormItem } from '../../formlayout/form-item';
import { FormLayout } from '../../formlayout/FormLayout';
import type { GridModel } from '../model/GridModel';
import { sameValue } from '../model/same-value';
import type { Switches } from '../model/Switches';
import { CellEditor } from './CellEditor';
import type { EditFormHost } from './edit-form-host';
import type { FormValues } from './form-values';

/** Where Enter saves the form: one-line fields, not buttons, check boxes or multi-line text. */
const ENTER_FIELDS =
  'input:not([type=button],[type=submit],[type=reset],[type=image],[type=file],[type=checkbox],[type=radio]), select, [role=textbox]:not([aria-multiline=true]), [role=combobox], [role=spinbutton]';

interface Placed<T> {
  holder: Component<HTMLDivElement>;
  /** The form item given for the field, if any. */
  item: FormItem;
  editor: CellEditor<T> | null;
  /** The value the editor was made with. */
  value: unknown;
}

/**
 * The edit form of a row (`editMode` `'form'` and `'popup'`): the kit's `FormLayout` with a field per
 * column, each the editor its cell would get (by type, a lookup's, the column's own) with its frame
 * and label. The fields stand for the row's draft: a value is written when its field is left or an
 * item is picked, the grid's checks show their messages on the fields, and a field whose value
 * changed through another one (`setCellValue`) is made again. Save and Cancel are its own buttons,
 * under the fields or in the window that holds the form.
 */
export class EditForm<T> extends Component<HTMLDivElement> {
  readonly layout: FormLayout;
  /** Save and Cancel. */
  readonly buttons: Component<HTMLDivElement>;
  readonly saveButton: Button;
  readonly cancelButton: Button;
  private readonly placed = new Map<string, Placed<T>>();

  constructor(
    private readonly model: GridModel<T>,
    readonly rowId: string,
    readonly row: T,
    private readonly settings: Switches<FormValues>,
    private readonly host: EditFormHost<T>,
    inline: boolean,
  ) {
    super('div');
    const el = this.element;
    el.className = 'mx-data-grid__form';
    const message = el.appendChild(document.createElement('div'));
    message.className = 'mx-data-grid__form-message';
    message.setAttribute('role', 'alert');
    this.motif.setDisposable(
      effect(() => {
        void model.state.edits;
        const text = model.edit(rowId)?.errors[''] ?? '';
        message.textContent = text;
        message.hidden = !text;
      }),
    );
    this.layout = new FormLayout({
      items: () => {
        const given = settings.get('items');
        return untracked(() => this.items(given));
      },
      columns: () => settings.get('colCount'),
      minColumnWidth: () => settings.get('minColWidth') ?? '',
      labelMode: () => settings.get('labelMode'),
    });
    const isNew = model.isNew(rowId);
    this.motif.setDisposable(effect(() => this.layout.element.setAttribute('aria-label', model.text(isNew ? 'gridNewRowTitle' : 'gridEditRowTitle'))));
    this.controls.add(this.layout);

    this.buttons = new Component<HTMLDivElement>('div');
    this.buttons.element.className = 'mx-data-grid__form-buttons';
    const busy = () => model.state.busy;
    this.saveButton = new Button({ text: () => model.text('gridSave'), tone: 'accent', enabled: () => !busy() });
    this.cancelButton = new Button({ text: () => model.text('gridCancelEdit'), variant: 'outline', enabled: () => !busy() });
    this.saveButton.element.addEventListener('click', () => host.save());
    this.cancelButton.element.addEventListener('click', () => host.cancel());
    this.buttons.controls.add(this.saveButton, this.cancelButton);
    // A press keeps focus in the field: leaving it would take its message away and move the buttons under the pointer.
    this.buttons.element.addEventListener('pointerdown', (e) => {
      if ((e.target as Element).closest?.('button')) e.preventDefault();
    });
    if (inline) this.controls.add(this.buttons);

    // The grid checks and saves the row: the form element is never sent (Enter in its only field would).
    el.addEventListener(
      'submit',
      (e) => {
        e.preventDefault();
        e.stopPropagation();
      },
      true,
    );
    // A field left: its value goes into the draft.
    el.addEventListener('focusout', (e) => {
      const holder = (e.target as Element).closest?.('.mx-data-grid__form-field') as HTMLElement | null;
      const next = e.relatedTarget as Node | null;
      if (!holder || (next && holder.contains(next))) return;
      if (holder.dataset.field) this.keep(holder.dataset.field);
    });
    // Enter saves and Escape cancels; in a window, the window's buttons do that.
    if (inline) {
      el.addEventListener('keydown', (e) => {
        if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
        if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          host.cancel();
        } else if (e.key === 'Enter' && (e.target as Element).matches?.(ENTER_FIELDS)) {
          e.preventDefault();
          host.save();
        }
      });
    }
    // Values written some other way (an async `setCellValue`): the fields follow.
    this.motif.setDisposable(
      effect(() => {
        void model.state.edits;
        untracked(() => this.follow());
      }),
    );
    this.motif.setDisposable(() => {
      for (const p of this.placed.values()) p.editor?.dispose();
    });
  }

  /** Focuses a field's editor, else the first one that can be filled in. */
  focus(field?: string): boolean {
    const usable = (p: Placed<T> | undefined) => !!p?.editor && !p.holder.element.closest('[hidden]') && !this.readOnly(p);
    const given = field ? this.placed.get(field) : undefined;
    const target = usable(given) ? given : [...this.placed.values()].find(usable);
    if (!target?.editor) return false;
    target.editor.focus();
    return true;
  }

  /** Writes a field's value into the row's draft. `false` when its editor cannot read what it holds. */
  keep(field: string): boolean {
    const p = this.placed.get(field);
    const ed = p?.editor;
    if (!p || !ed || this.readOnly(p)) return true;
    const { model, rowId, row } = this;
    const r = ed.read();
    if (!r.ok) {
      model.setError(row, field, r.message);
      return false;
    }
    const col = model.columns.get(field);
    if (sameValue(r.value, model.value(rowId, row, col))) return true;
    if (col.lookup) model.lookups.remember(col, r.value, ed.chosen());
    p.value = r.value;
    const i = model.indexOfKey(rowId);
    model.writeCell(rowId, row, field, r.value, i >= 0 ? model.dataIndex(i) : -1);
    this.follow();
    return true;
  }

  /** Writes every field; the first one whose editor cannot read its value, or `null`. */
  keepAll(): string | null {
    for (const field of this.placed.keys()) if (!this.keep(field)) return field;
    return null;
  }

  /** The editor of a field. */
  editorOf(field: string): CellEditor<T> | null {
    return this.placed.get(field)?.editor ?? null;
  }

  private readOnly(p: Placed<T>): boolean {
    return p.editor?.editor ? !!(p.editor.editor as unknown as { readOnly?: boolean }).readOnly : false;
  }

  /** The form items: the given ones, else every column; a column's field gets the grid's editor. */
  private items(given: readonly (string | FormItem)[] | undefined): FormItem[] {
    for (const p of this.placed.values()) p.editor?.dispose();
    this.placed.clear();
    const list = given ?? this.columnFields();
    return list.map((item) => this.item(item)).filter((item): item is FormItem => item !== null);
  }

  /** Every column, the visible ones in their order, then the hidden ones; `formItem.order` first. */
  private columnFields(): string[] {
    const { columns } = this.model;
    const visible = columns.visibleData();
    const all = [...visible, ...[...columns.defs.keys()].filter((f) => !columns.isInternal(f) && !visible.includes(f))];
    const order = (f: string) => columns.get(f).formItem?.order ?? Number.MAX_SAFE_INTEGER;
    return all.map((field, i) => ({ field, i })).sort((a, b) => order(a.field) - order(b.field) || a.i - b.i).map((x) => x.field);
  }

  private item(item: string | FormItem): FormItem | null {
    const { columns } = this.model;
    const isColumn = (field: string | undefined) => field !== undefined && columns.defs.has(field) && !columns.isInternal(field);
    if (typeof item === 'string') return isColumn(item) ? this.fieldItem(item, {}) : null;
    if (item.items) return { ...item, items: item.items.map((i) => this.item(i)).filter((i): i is FormItem => i !== null) };
    if (!item.template && !item.button && isColumn(item.field)) return this.fieldItem(item.field!, item);
    return item;
  }

  /** A column's place in the form: a holder its editor is made in when the form lays it out. */
  private fieldItem(field: string, given: FormItem): FormItem | null {
    const own = this.model.columns.get(field).formItem ?? {};
    if (given.visible === undefined && own.visible === false) return null;
    const holder = new Component<HTMLDivElement>('div');
    holder.element.className = 'mx-data-grid__form-field';
    holder.element.dataset.field = field;
    this.placed.set(field, { holder, item: given, editor: null, value: undefined });
    return {
      colSpan: given.colSpan ?? own.colSpan,
      visible: given.visible ?? own.visible,
      template: () => {
        this.make(field);
        return holder;
      },
    };
  }

  /** Makes (or makes again) the editor of a field, with the value of the draft. */
  private make(field: string) {
    const p = this.placed.get(field);
    if (!p) return;
    p.editor?.dispose();
    p.editor = null;
    const { model, rowId, row } = this;
    const col = model.columns.get(field);
    const rec = model.edit(rowId);
    const isNew = !!rec?.isNew;
    const merged = { ...(row as object), ...(rec?.draft ?? {}) } as T;
    const value = model.value(rowId, row, col);
    const own = col.formItem ?? {};
    const given = p.item;
    const fillable = model.columns.canFill(field, row, isNew);
    const props: Record<string, unknown> = {
      label: given.label ?? own.label ?? col.title,
      labelMode: () => this.settings.get('labelMode'),
      helpText: given.helpText ?? own.helpText,
      required: model.isRequired(col),
      readOnly: () => !fillable || read(given.readOnly) === true,
      enabled: given.enabled,
      validateOn: 'manual',
      error: () => {
        void model.state.edits;
        return model.error(rowId, field) || null;
      },
      stretch: true,
      ...own.editorOptions,
      ...given.editorProps,
    };
    for (const key of Object.keys(props)) if (props[key] === undefined) delete props[key];
    const editor = new CellEditor<T>(
      model,
      col,
      merged,
      value,
      undefined,
      { commit: () => this.keep(field), cancel: () => this.host.cancel() },
      p.holder,
      (options) => this.host.prepare(field, merged, isNew, options),
      props,
    );
    p.value = value;
    if (editor.cancelled) {
      editor.dispose();
      return;
    }
    p.editor = editor;
    this.host.prepared(field, merged, isNew, editor);
  }

  /** Fields whose value in the draft is not the one their editor was made with are made again. */
  private follow() {
    const { model, rowId, row } = this;
    for (const [field, p] of this.placed) {
      if (!p.editor) continue;
      const now = model.value(rowId, row, model.columns.get(field));
      if (sameValue(now, p.value)) continue;
      const focused = p.holder.element.contains(document.activeElement);
      this.make(field);
      if (focused) p.editor?.focus();
    }
  }
}
