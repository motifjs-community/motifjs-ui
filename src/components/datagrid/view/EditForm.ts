import { Component, untracked, type ComponentBase } from '@motifx/core';
import { part } from '../../../core/draw-parts';
import { focusGoesInto, focusInLineField, holdsFocus, isRendered } from '../../../core/focus';
import { kept, put, text as writeText } from '../../../core/part-writes';
import { Button } from '../../button/Button';
import { ToggleField } from '../../checkbox/ToggleField';
import type { FormItem } from '../../formlayout/form-item';
import { FormLayout } from '../../formlayout/FormLayout';
import { RadioGroup } from '../../radiogroup/RadioGroup';
import type { GridModel } from '../model/GridModel';
import { sameValue } from '../model/same-value';
import type { Switches } from '../model/Switches';
import { CellEditor } from './CellEditor';
import type { EditFormHost } from './edit-form-host';
import type { FormValues } from './form-values';
import { readField } from '../model/read-field';

interface Placed<T> {
  holder: Component<HTMLDivElement>;
  /** The form item given for the field, if any. */
  item: FormItem;
  editor: CellEditor<T> | null;
  /** The value the editor was created with. */
  value: unknown;
  /** The form draws the editor's label mode and message, unless the app gives them. */
  drawsLabelMode: boolean;
  drawsError: boolean;
}

/**
 * The edit form of a row (`editMode` `'form'` and `'popup'`): the kit's `FormLayout` with a field per
 * column, each the editor its cell would get (by type, a lookup's, the column's own) with its frame
 * and label. The fields stand for the row's draft: a value is written when its field is left or an
 * item is picked, the grid's checks show their messages on the fields, and a field whose value
 * changed through another one (`setCellValue`) is recreated. Save and Cancel are its own buttons,
 * under the fields or in the window that holds the form. It follows nothing of the grid: it draws
 * itself again whenever the grid tells a change.
 */
export class EditForm<T> extends Component<HTMLDivElement> {
  readonly layout: FormLayout;
  /** Save and Cancel. */
  readonly buttons: Component<HTMLDivElement>;
  readonly saveButton: Button;
  readonly cancelButton: Button;
  private readonly placed = new Map<string, Placed<T>>();
  private readonly message: Component<HTMLDivElement>;
  private readonly isNew: boolean;
  /** The `items` option the fields were laid out from, as text; `null` before the first time. */
  private itemsFrom: string | null = null;

  constructor(
    private readonly model: GridModel<T>,
    readonly rowId: string,
    readonly row: T,
    private readonly settings: Switches<FormValues>,
    private readonly host: EditFormHost<T>,
    inline: boolean,
  ) {
    super('div');
    this.class.add('mx-data-grid__form');
    const message = part<HTMLDivElement>(this, 'div', 'mx-data-grid__form-message');
    message.attr.add({ role: 'alert' });
    this.message = message;
    this.isNew = model.isNew(rowId);
    this.layout = new FormLayout({});
    this.controls.add(this.layout);

    this.buttons = new Component<HTMLDivElement>('div');
    this.buttons.class.add('mx-data-grid__form-buttons');
    this.saveButton = new Button({ tone: 'accent' });
    this.cancelButton = new Button({});
    this.saveButton.class.add('mx-data-grid__apply');
    this.cancelButton.class.add('mx-data-grid__dismiss');
    this.saveButton.motif.on('click', () => host.save());
    this.cancelButton.motif.on('click', () => host.cancel());
    this.buttons.controls.add(this.saveButton, this.cancelButton);
    // A click keeps focus in the field: leaving it would take its message away and move the buttons under the pointer.
    for (const button of [this.saveButton, this.cancelButton]) button.motif.on('pointerdown', (_, e) => e.preventDefault());
    if (inline) this.controls.add(this.buttons);

    // The grid checks and saves the row: the form element is never sent (Enter in its only field would).
    this.motif.on('submit:capture', (_, e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    // A field left: its value goes into the draft.
    this.motif.on('focusout', (_, e) => {
      const field = this.fieldFrom(e);
      if (field === null) return;
      const holder = this.placed.get(field)?.holder;
      if (holder && focusGoesInto(holder, e)) return;
      this.keep(field);
    });
    // Enter saves and Escape cancels; in a window, the window's buttons do that.
    if (inline) {
      this.motif.on('keydown', (_, e) => {
        if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
        if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          host.cancel();
        } else if (e.key === 'Enter' && focusInLineField(e) && !this.fromChoice(e)) {
          e.preventDefault();
          host.save();
        }
      });
    }
    this.motif.setDisposable(model.notices.on(() => this.draw()));
    this.motif.setDisposable(() => {
      for (const p of this.placed.values()) p.editor?.dispose();
    });
    this.draw();
  }

  /** Draws the form as the grid and the row's draft are now; values written some other way (an async `setCellValue`) remake their fields. */
  draw() {
    if (this.isDisposed) return;
    untracked(() => {
      const { model, rowId, settings, layout } = this;
      const text = model.edit(rowId)?.errors[''] ?? '';
      writeText(this.message, text);
      kept(this.message, !!text);
      const given = settings.get('items');
      const from = JSON.stringify(given ?? null);
      if (from !== this.itemsFrom) {
        this.itemsFrom = from;
        layout.items = this.items(given);
      }
      layout.columns = settings.get('colCount');
      layout.minColumnWidth = settings.get('minColWidth') ?? '';
      const labelMode = settings.get('labelMode');
      layout.labelMode = labelMode;
      put(layout, 'aria-label',model.text(this.isNew ? 'gridNewRowTitle' : 'gridEditRowTitle'));
      const busy = model.state.busy;
      this.saveButton.text = model.text('gridSave');
      this.saveButton.enabled = !busy;
      this.cancelButton.text = model.text('gridCancelEdit');
      this.cancelButton.enabled = !busy;
      for (const [field, p] of this.placed) {
        const editor = p.editor?.editor as unknown as Record<string, unknown> | null | undefined;
        if (!editor) continue;
        if (p.drawsLabelMode && 'labelMode' in editor) editor.labelMode = labelMode;
        if (p.drawsError && 'error' in editor) editor.error = model.error(rowId, field) || null;
      }
      this.follow();
    });
  }

  /** Lays the fields out again from the `items` option: what it holds changed in a way its text does not show. */
  relayout() {
    this.itemsFrom = null;
    this.draw();
  }

  /** Focuses a field's editor, else the first one that can be filled in. */
  focus(field?: string): boolean {
    const usable = (p: Placed<T> | undefined) => !!p?.editor && isRendered(p.holder) && !this.readOnly(p);
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

  /** The field an event came from, or `null`. */
  fieldFrom(e: Event): string | null {
    for (const [field, p] of this.placed) if (p.holder.motif.isEventFrom(e)) return field;
    return null;
  }

  /** Whether a key came from a check box, a switch or a radio button: Enter there does not save. */
  private fromChoice(e: Event): boolean {
    let at: ComponentBase | undefined = this;
    while (at) {
      at = at.controls.items.find((c) => c.motif.isEventFrom(e));
      if (at instanceof ToggleField || at instanceof RadioGroup) return true;
    }
    return false;
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

  /** A column's place in the form: a holder its editor is created in when the form lays it out. */
  private fieldItem(field: string, given: FormItem): FormItem | null {
    const own = this.model.columns.get(field).formItem ?? {};
    if (given.visible === undefined && own.visible === false) return null;
    const holder = new Component<HTMLDivElement>('div');
    holder.class.add('mx-data-grid__form-field');
    holder.attr.add({ 'data-field': field });
    this.placed.set(field, { holder, item: given, editor: null, value: undefined, drawsLabelMode: true, drawsError: true });
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
    const entered = model.enteredOf(rowId, row);
    const value = model.value(rowId, row, col);
    const own = col.formItem ?? {};
    const given = p.item;
    const fillable = model.columns.canFill(field, row, isNew);
    const theirs = { ...own.editorOptions, ...given.editorProps } as Record<string, unknown>;
    p.drawsLabelMode = theirs.labelMode === undefined;
    p.drawsError = theirs.error === undefined;
    const props: Record<string, unknown> = {
      label: given.label ?? own.label ?? col.title,
      labelMode: this.settings.get('labelMode'),
      helpText: given.helpText ?? own.helpText,
      required: model.isRequired(col),
      // The app's own function is followed by the field itself.
      readOnly: typeof given.readOnly === 'function' ? () => !fillable || readField(given, 'readOnly') === true : !fillable || given.readOnly === true,
      enabled: given.enabled,
      validateOn: 'manual',
      error: model.error(rowId, field) || null,
      stretch: true,
      ...theirs,
    };
    for (const key of Object.keys(props)) if (props[key] === undefined) delete props[key];
    const editor = new CellEditor<T>(
      model,
      col,
      row,
      entered,
      value,
      undefined,
      { commit: () => this.keep(field), cancel: () => this.host.cancel() },
      p.holder,
      (options) => this.host.prepare(field, row, entered, isNew, options),
      props,
    );
    p.value = value;
    if (editor.cancelled) {
      editor.dispose();
      return;
    }
    p.editor = editor;
    this.host.prepared(field, row, entered, isNew, editor);
  }

  /** Fields whose value in the draft is not the one their editor was created with are recreated. */
  private follow() {
    const { model, rowId, row } = this;
    for (const [field, p] of this.placed) {
      if (!p.editor) continue;
      const now = model.value(rowId, row, model.columns.get(field));
      if (sameValue(now, p.value)) continue;
      const focused = holdsFocus(p.holder);
      this.make(field);
      if (focused) p.editor?.focus();
    }
  }
}
