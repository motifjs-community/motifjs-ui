import { Component, effect, read, untracked } from '@motifx/core';
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
 */
export class FilterBuilderWindow<T> {
  builder: FilterBuilder | null = null;
  window: MxForm | null = null;

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
    const given: Record<string, unknown> = {};
    // Events as they are; every other prop followed, so a change of `grid.filterBuilder` shows at once.
    for (const name of Object.keys(options)) given[name] = /^on[A-Z]/.test(name) ? options[name] : () => read(options[name] as never);
    const builder = new FilterBuilder({
      ...given,
      fields: () => builderFields(model, this.customOperations()),
      texts: () => ({ ...model.texts, ...read(options.texts as FilterBuilderProps['texts']) }),
      locale: () => model.formatter.locale,
      label: () => model.text('gridFilterBuilderTitle'),
      value,
    } as FilterBuilderProps);
    builder.element.classList.add('mx-data-grid__filter-builder');
    const ok = new Button({ text: () => model.text('ok'), tone: 'accent' });
    const cancel = new Button({ text: () => model.text('cancel') });
    ok.element.classList.add('mx-data-grid__apply');
    cancel.element.classList.add('mx-data-grid__dismiss');
    ok.element.addEventListener('click', () => untracked(() => this.close(true)));
    cancel.element.addEventListener('click', () => untracked(() => this.close(false)));
    const footer = new Component<HTMLDivElement>('div');
    footer.element.className = 'mx-data-grid__filter-builder-buttons';
    footer.controls.add(ok, cancel);
    const p = host.popup;
    const title = () => p.get('title') ?? model.text('gridFilterBuilderTitle');
    const win = new MxForm({
      title: () => (p.get('showTitle') ? title() : ''),
      content: builder,
      footer,
      width: () => p.get('width') ?? '40rem',
      height: () => p.get('height') ?? '',
      resizable: () => p.get('resizable'),
      movable: () => p.get('movable'),
      showClose: () => p.get('showCloseButton'),
      showMaximize: () => p.get('showMaximize'),
      windowState: () => (p.get('fullScreen') ? 'maximized' : 'normal'),
      cancelButton: cancel,
    });
    win.element.classList.add('mx-data-grid__filter-window');
    // Without the title shown, the window still has its name.
    win.motif.setDisposable(
      effect(() => {
        if (p.get('showTitle')) win.element.removeAttribute('aria-label');
        else win.element.setAttribute('aria-label', title());
      }),
    );
    win.onShown(() => builder.focus());
    // Closed some other way (the close button, the grid going away): as Cancel, which may keep it open.
    win.onClosing((e) => {
      if (this.window !== win) return;
      if (e.reason === 'owner') {
        this.window = this.builder = null;
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
    if (!closing) win.close(apply ? 'ok' : 'cancel');
    if (apply) model.filters.setFilterValue(value);
    ev.tell(ev.filterBuilderClosed, () => ({ applied: apply, value }));
    queueMicrotask(() => {
      const active = document.activeElement;
      if (!active || active === document.body) this.host.returnFocus();
    });
    return true;
  }
}
