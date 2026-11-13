import { Component, read, untracked } from '@motifx/core';
import { rememberFocus } from '../../../core/focus';
import { put } from '../../../core/part-writes';
import { Button } from '../../button/Button';
import { FilterBuilder } from '../../filterbuilder/FilterBuilder';
import type { FilterBuilderCustomOperation } from '../../filterbuilder/filter-builder-custom-operation';
import type { FilterBuilderProps } from '../../filterbuilder/filter-builder-props';
import { MxForm } from '../../form/MxForm';
import { builderFields } from '../model/builder-fields';
import type { GridModel } from '../model/GridModel';
import type { FilterBuilderWindowHost } from './filter-builder-window-host';

/**
 * The filter builder in a modal window (the kit's `MxForm`), on the grid's filter value: OK makes
 * the builder's value the filter value, Cancel, Escape and the close button leave it as it was.
 * Every column with `filterBuilder` on is a field; the builder's own props come from `filterBuilder`.
 * It follows nothing of the grid: while it is open it draws itself again whenever the grid tells a change.
 */
export class FilterBuilderWindow<T> {
  builder: FilterBuilder | null = null;
  window: MxForm | null = null;
  /** What draws the open window again. */
  private drawOpen: (() => void) | null = null;

  constructor(
    private readonly model: GridModel<T>,
    private readonly host: FilterBuilderWindowHost,
  ) {}

  get opened(): boolean {
    return !!this.window;
  }

  /** The custom operations of the builder's props, also for the panel's text. */
  customOperations(): readonly FilterBuilderCustomOperation[] {
    return read(this.host.options.customOperations) ?? [];
  }

  open(): boolean {
    if (this.window) {
      this.window.activate();
      return true;
    }
    const { model, host } = this;
    const ev = model.events;
    const value = untracked(() => model.filters.filterValue());
    if (!ev.ask(ev.filterBuilderOpening, () => ({ value, cancel: false }))) return false;
    const options = host.options as Record<string, unknown>;
    // The app's own values as they are (a function among them the builder follows itself); given again when
    // `grid.filterBuilder` gets another one.
    const own = (name: string) => !/^on[A-Z]/.test(name) && name !== 'texts';
    const given: Record<string, unknown> = { ...options };
    delete given.texts;
    const builder = new FilterBuilder({ ...given, value } as FilterBuilderProps);
    builder.class.add('mx-data-grid__filter-builder');
    const ok = new Button({ tone: 'accent' });
    const cancel = new Button({});
    ok.class.add('mx-data-grid__apply');
    cancel.class.add('mx-data-grid__dismiss');
    ok.motif.on('click', () => untracked(() => this.close(true)));
    cancel.motif.on('click', () => untracked(() => this.close(false)));
    const footer = new Component<HTMLDivElement>('div');
    footer.class.add('mx-data-grid__filter-builder-buttons');
    footer.controls.add(ok, cancel);
    const p = host.popup;
    const title = () => p.get('title') ?? model.text('gridFilterBuilderTitle');
    const win = new MxForm({ content: builder, footer, cancelButton: cancel });
    win.class.add('mx-data-grid__filter-window');
    let fields: unknown[] = [];
    let texts = '';
    const draw = () =>
      untracked(() => {
        for (const name of Object.keys(options)) {
          if (!own(name) || Object.is(given[name], options[name])) continue;
          given[name] = options[name];
          (builder as unknown as Record<string, unknown>)[name] = options[name];
        }
        const nowFields = builderFields(model, this.customOperations());
        // By what a field is, not by its objects, which are created anew each time.
        const fieldsKey = nowFields.flatMap((f) => [f.dataField, f.dataType, f.lookup?.dataSource, f.lookup?.valueField, f.lookup?.textField, String(read(f.filterOperations) ?? '')]);
        if (fieldsKey.length !== fields.length || fieldsKey.some((v, i) => !Object.is(v, fields[i]))) {
          fields = fieldsKey;
          builder.fields = nowFields;
        }
        const nowTexts = { ...model.texts, ...read(options.texts as FilterBuilderProps['texts']) };
        const textsKey = JSON.stringify(nowTexts);
        if (textsKey !== texts) {
          texts = textsKey;
          builder.texts = nowTexts;
        }
        builder.locale = model.formatter.locale;
        builder.label = model.text('gridFilterBuilderTitle');
        ok.text = model.text('ok');
        cancel.text = model.text('cancel');
        const showTitle = p.get('showTitle');
        win.title = showTitle ? title() : '';
        win.width = p.get('width') ?? '40rem';
        win.height = p.get('height') ?? '';
        win.resizable = p.get('resizable');
        win.movable = p.get('movable');
        win.showClose = p.get('showCloseButton');
        win.showMaximize = p.get('showMaximize');
        win.windowState = p.get('fullScreen') ? 'maximized' : 'normal';
        // Without the title shown, the window still has its name.
        put(win, 'aria-label', showTitle ? null : title());
      });
    draw();
    this.drawOpen = draw;
    win.motif.setDisposable(model.notices.on(() => this.drawOpen === draw && draw()));
    win.onShown(() => builder.focus());
    // Closed some other way (the close button, the grid going away): as Cancel, which may keep it open.
    win.onClosing((e) => {
      if (this.window !== win) return;
      if (e.reason === 'owner') {
        this.window = this.builder = null;
        this.drawOpen = null;
        return;
      }
      if (!this.close(false, true)) e.cancel = true;
    });
    this.window = win;
    this.builder = builder;
    void win.showDialog(host.owner);
    ev.tell(ev.filterBuilderOpened, () => ({ builder, window: win }));
    return true;
  }

  /** Closes the window; with `apply` the builder's value becomes the filter value. `false` when `onFilterBuilderClosing` kept it open. */
  close(apply: boolean, closing = false): boolean {
    const { window: win, builder, model } = this;
    if (!win || !builder) return false;
    const ev = model.events;
    builder.closeEditor(true);
    const value = builder.value;
    if (!ev.ask(ev.filterBuilderClosing, () => ({ apply, value, builder, cancel: false }))) return false;
    this.window = this.builder = null;
    this.drawOpen = null;
    if (!closing) win.close(apply ? 'ok' : 'cancel');
    if (apply) model.filters.setFilterValue(value);
    ev.tell(ev.filterBuilderClosed, () => ({ applied: apply, value }));
    // Nothing has focus after the window: it goes back to the grid.
    queueMicrotask(() => {
      if (!rememberFocus()) this.host.returnFocus();
    });
    return true;
  }
}
