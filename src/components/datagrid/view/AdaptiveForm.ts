import { Component, effect, reactive, untracked } from '@motifx/core';
import type { FieldLabelMode } from '../../../parts/field/field-label-mode';
import type { FormItem } from '../../formlayout/form-item';
import type { GridAdaptiveFormOptions } from '../grid-adaptive-form-options';
import type { GridModel } from '../model/GridModel';
import { givenList } from '../../../core/given-field';
import { Switches } from '../model/Switches';
import type { AdaptiveFormHost } from './adaptive-form-host';
import { EditForm } from './EditForm';
import type { FormValues } from './form-values';

/**
 * What a row's adaptive detail holds: the columns the width hides, each its title and the text its
 * cell would show, laid out by the edit form's `FormLayout`; a cell the user can fill gets the
 * editor its cell would get instead (edit modes `'row'`, `'cell'`, `'batch'`), writing into the
 * row's draft as a cell does. The fields follow the columns that hide and show while it is open.
 */
export class AdaptiveForm<T> extends Component<HTMLDivElement> {
  readonly form: EditForm<T>;
  /** How the form is laid out; `items` grows when `this.items` is set anew. */
  private readonly shape = reactive({ items: 0, colCount: 2, minColWidth: undefined as string | undefined, labelMode: 'side' as FieldLabelMode });
  /** The form items: column names, and the app's own items from `onAdaptiveDetailRowPreparing`, kept as they are. */
  private items: (string | FormItem)[] = [];
  /** Grows when texts of lookup keys arrive, and on `redraw()`. */
  private readonly texts = reactive({ n: 0 });

  constructor(
    private readonly model: GridModel<T>,
    readonly rowId: string,
    readonly row: T,
    private readonly host: AdaptiveFormHost<T>,
  ) {
    super('div');
    this.element.className = 'mx-data-grid__adaptive';
    const lookups = model.lookups.onChanged(() => this.texts.n++);
    this.motif.setDisposable(() => lookups.dispose());
    this.motif.setDisposable(effect(() => this.lay()));
    const shape = this.shape;
    const settings = new Switches<FormValues>(['items', 'colCount', 'minColWidth', 'labelMode'], {}, {
      items: () => {
        void shape.items;
        return this.items;
      },
      colCount: () => shape.colCount,
      minColWidth: () => shape.minColWidth,
      labelMode: () => shape.labelMode,
    });
    this.form = new EditForm<T>(model, rowId, row, settings, host, false);
    this.form.element.classList.add('mx-data-grid__adaptive-form');
    this.controls.add(this.form);
    this.element.addEventListener('focusin', (e) => {
      if ((e.target as Element).closest?.('.mx-data-grid__form-field')) host.begin();
    });
    // After the form wrote the value of the field left.
    this.element.addEventListener('focusout', (e) => {
      const holder = (e.target as Element).closest?.('.mx-data-grid__form-field') as HTMLElement | null;
      const next = e.relatedTarget as Node | null;
      if (holder?.dataset.field && !(next && holder.contains(next))) host.kept(holder.dataset.field);
    });
  }

  /** The texts of the columns are read again from the row (`grid.repaint()`). */
  redraw() {
    untracked(() => this.texts.n++);
  }

  /** Focuses its first editor; `false` when it has none. */
  focusFirst(): boolean {
    return this.form.focus();
  }

  /** The fields of the columns hidden now, as `onAdaptiveDetailRowPreparing` leaves them. */
  private lay() {
    const { model, rowId, row } = this;
    const cols = model.columns;
    const hidden = [...cols.state.adaptive];
    const o = model.adaptive.options;
    const editors = o.get('editors') && !model.editsInForm;
    const isNew = model.isNew(rowId);
    const fill = new Map(hidden.map((f) => [f, editors && cols.canFill(f, row, isNew)]));
    const options: GridAdaptiveFormOptions = { items: [...hidden], colCount: o.get('colCount'), minColWidth: o.get('minColWidth'), labelMode: o.get('labelMode') };
    untracked(() => {
      const ev = model.events;
      let chosen = options;
      if (ev.listened(ev.adaptiveDetailRowPreparing)) {
        const adapter = model.data.source.adapter;
        const e = { row, key: isNew || !adapter.keys.hasKey(row) ? undefined : adapter.keyOf(row), rowIndex: model.adaptiveIndex(), editors, formOptions: options };
        ev.adaptiveDetailRowPreparing.fire(e);
        chosen = e.formOptions;
      }
      const isColumn = (f: string) => cols.defs.has(f) && !cols.isInternal(f);
      const items = givenList(chosen.items).map((item) => {
        if (typeof item !== 'string' || !isColumn(item)) return item;
        const editor = fill.get(item) ?? (editors && cols.canFill(item, row, isNew));
        return editor ? item : this.textItem(item);
      });
      const shape = this.shape;
      this.items = items;
      shape.items++;
      shape.colCount = chosen.colCount;
      shape.minColWidth = chosen.minColWidth;
      shape.labelMode = chosen.labelMode;
    });
  }

  /** A column's title and the text its cell shows. */
  private textItem(field: string): FormItem {
    return {
      template: () => {
        const { model, rowId, row } = this;
        const col = model.columns.get(field);
        const item = new Component<HTMLDivElement>('div');
        const el = item.element;
        el.className = 'mx-data-grid__adaptive-item';
        el.dataset.column = field;
        const label = el.appendChild(document.createElement('span'));
        label.className = 'mx-data-grid__adaptive-label';
        const value = el.appendChild(document.createElement('span'));
        value.className = 'mx-data-grid__adaptive-value';
        item.motif.setDisposable(
          effect(() => {
            void model.state.edits;
            void model.state.version;
            void this.texts.n;
            label.textContent = model.columns.title(field);
            value.textContent = model.shownText(rowId, row, col);
            el.dataset.labelMode = this.shape.labelMode;
          }),
        );
        return item;
      },
    };
  }
}
