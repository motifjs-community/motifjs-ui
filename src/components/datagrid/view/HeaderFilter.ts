import { Component, type ComponentBase } from '@motifx/core';
import type { data } from '@motifx-community/data';
import { Button } from '../../button/Button';
import { ListBox } from '../../listbox/ListBox';
import { Popup } from '../../../parts/popup/Popup';
import type { GridFilterValue } from '../grid-filter-value';
import type { GridModel } from '../model/GridModel';

/** Rows the value list shows before it scrolls. */

/**
 * The header filter: a window next to the header with the column's values in the kit's `ListBox`
 * (a search box, "Select all", a check box per value with its count; long lists load and draw only
 * where they scroll) and Apply / Cancel. The chosen values filter the column (any of them); none,
 * or all of them, take the column's value filter away.
 */
export class HeaderFilter<T> {
  private popup: Popup | null = null;
  private body: Component<HTMLDivElement> | null = null;
  private list: ListBox<GridFilterValue, unknown> | null = null;
  private source: data.DataSource<GridFilterValue, unknown> | null = null;
  private field = '';

  constructor(
    private readonly model: GridModel<T>,
    private readonly owner: ComponentBase,
  ) {}

  get opened(): boolean {
    return !!this.popup?.isOpen;
  }

  /** The list of the open window, for tests and the grid. */
  get listBox(): ListBox<GridFilterValue, unknown> | null {
    return this.list;
  }

  open(field: string, anchor: HTMLElement, returnTo: HTMLElement) {
    const model = this.model;
    const popup = this.popup ?? this.create();
    this.release();
    this.field = field;
    const title = model.columns.title(field);
    popup.element.setAttribute('aria-label', model.text('gridFilterFor', { title }));
    this.source = model.values.source(field);
    const list = new ListBox<GridFilterValue, unknown>({
      label: model.text('gridFilterFor', { title }),
      labelMode: 'hidden',
      selectionMode: 'multiple',
      selectAll: true,
      searchEnabled: model.values.searchable(field),
      dataSource: this.source,
      textField: 'text',
      valueField: 'value',
      height: Math.max(1, Math.floor(model.settings.get('headerFilterRows'))),
      value: [...(model.filters.get(field)?.values ?? [])],
      itemTemplate: (item, host) => this.drawItem(item, host),
    });
    this.list = list;
    this.body!.controls.add(list);
    popup.open(anchor, { toggle: anchor, returnFocus: returnTo });
    list.focus();
  }

  close() {
    this.popup?.close('code');
  }

  /** Applies the chosen values: none, or every one of them, is no value filter. */
  apply() {
    const list = this.list;
    if (!list) return;
    const chosen = (Array.isArray(list.value) ? list.value : []) as unknown[];
    const total = this.source?.total;
    const everything = !list.listItems.searchText && total !== undefined && chosen.length >= total;
    if (!chosen.length || everything) this.model.filters.clear(this.field, 'values');
    else this.model.filters.update(this.field, { values: chosen });
    this.close();
  }

  private drawItem(item: GridFilterValue, host: HTMLElement) {
    const text = document.createElement('span');
    text.className = 'mx-data-grid__value-text';
    text.textContent = item.text ?? '';
    host.append(text);
    if (item.count === undefined) return;
    const count = document.createElement('span');
    count.className = 'mx-data-grid__value-count';
    count.textContent = this.model.formatter.count(item.count);
    host.append(count);
  }

  private create(): Popup {
    const model = this.model;
    const popup = new Popup();
    popup.placement = 'bottom-start';
    popup.matchWidth = false;
    popup.element.classList.add('mx-data-grid__values');
    popup.element.setAttribute('role', 'dialog');
    const body = new Component<HTMLDivElement>('div');
    body.element.className = 'mx-data-grid__values-list';
    const bar = new Component<HTMLDivElement>('div');
    bar.element.className = 'mx-data-grid__values-bar';
    bar.controls.add(
      new Button({ text: () => model.text('gridApply'), size: 'sm', tone: 'accent', onclick: () => this.apply() }),
      new Button({ text: () => model.text('cancel'), size: 'sm', variant: 'outline', onclick: () => this.close() }),
    );
    popup.controls.add(body, bar);
    this.owner.controls.add(popup);
    popup.onClosed(() => this.release());
    this.popup = popup;
    this.body = body;
    return popup;
  }

  /** The list and its values go when the window closes; the next opening asks again. */
  private release() {
    const list = this.list;
    const source = this.source;
    this.list = null;
    this.source = null;
    if (list && !list.isDisposed) void list.dispose();
    if (source) {
      const adapter = source.adapter;
      source.dispose();
      adapter.dispose();
    }
  }
}
