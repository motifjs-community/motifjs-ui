import { effect, read, type Bind, type IBaseProp } from '@motifx/core';
import type { OptionList } from '../../parts/list/OptionList';
import { readItemField } from '../../parts/list/read-item-field';
import type { Popup } from '../../parts/popup/Popup';
import { DropDown } from '../dropdown/DropDown';
import type { LookupColumn } from './lookup-column';
import type { LookupProps } from './lookup-props';

const PARTS = Symbol('mx.lookup');

interface Parts {
  header: HTMLDivElement | null;
  stopHeader: (() => void) | null;
}

/**
 * Picks one row of a table-like list, typically from a data source searched on the server: a
 * customer by name, city and phone. The field shows the chosen row's text.
 *
 * @example
 * <Lookup label="Customer" dataSource={this.customers} textField="CompanyName" valueField="CustomerID"
 *   columns={[{ field: 'CompanyName', caption: 'Company' }, { field: 'City', caption: 'City', width: '8rem' }]} />
 */
export class Lookup<T = unknown, V = unknown> extends DropDown<T, V> {
  constructor(props?: IBaseProp<LookupProps<T, V>>) {
    super(props as IBaseProp<LookupProps<T, V>>);
    const own = (this.props ?? {}) as LookupProps<T, V>;
    this.element.classList.add('mx-lookup');
    if (own.searchEnabled === undefined) this.searchEnabled = true;
    if (own.matchWidth === undefined) this.matchWidth = false;
    for (const name of ['columns', 'showColumnHeaders', 'popupWidth'] as const) if (own[name] !== undefined) this.bindProperty(name, own[name]);
    this.observeProperty('columns', () => this.applyColumns());
    this.observeProperty<string>('popupWidth', (width) => this.element.style.setProperty('--_wanted-width', width ?? ''));
    this.motif.setDisposable(() => this.lookupParts.stopHeader?.());
  }

  get columns(): readonly LookupColumn<T>[] {
    return this.getProperty<readonly LookupColumn<T>[] | undefined>('columns') ?? [];
  }
  set columns(value: Bind<readonly LookupColumn<T>[]>) {
    this.assignProperty('columns', value);
  }
  get showColumnHeaders(): boolean {
    return this.getProperty<boolean | undefined>('showColumnHeaders') !== false;
  }
  set showColumnHeaders(value: Bind<boolean>) {
    this.assignProperty('showColumnHeaders', value, Boolean);
  }
  get popupWidth(): string {
    return this.getProperty<string | undefined>('popupWidth') ?? '';
  }
  set popupWidth(value: Bind<string>) {
    this.assignProperty('popupWidth', value);
  }

  protected override popupCreated(popup: Popup, list: OptionList<T>): void {
    const parts = this.lookupParts;
    const header = document.createElement('div');
    header.className = 'mx-lookup__header';
    header.setAttribute('aria-hidden', 'true');
    list.element.before(header);
    popup.element.classList.add('mx-lookup__popup');
    parts.header = header;
    parts.stopHeader = effect(() => {
      const columns = this.getProperty<readonly LookupColumn<T>[] | undefined>('columns') ?? [];
      const shown = columns.length > 0 && this.getProperty<boolean | undefined>('showColumnHeaders') !== false;
      const cells = columns.map((column) => this.cell(read(column.caption) ?? '', column));
      header.hidden = !shown;
      header.replaceChildren(...cells);
    });
  }

  private get lookupParts(): Parts {
    const self = this as unknown as { [PARTS]?: Parts };
    return (self[PARTS] ??= { header: null, stopHeader: null });
  }

  /** The columns lay out every row (and the header) on one grid. */
  private applyColumns(): void {
    const columns = this.peekProperty<readonly LookupColumn<T>[]>('columns') ?? [];
    this.element.style.setProperty('--_columns', columns.map((c) => read(c.width) ?? '1fr').join(' '));
    this.element.toggleAttribute('data-columns', columns.length > 0);
    this.itemTemplate = columns.length
      ? (item: T, host: HTMLElement) => {
          host.classList.add('mx-lookup__row');
          host.replaceChildren(...columns.map((column) => this.cell(String(readItemField(item, column.field, 'text') ?? ''), column)));
        }
      : null;
  }

  private cell(text: string, column: LookupColumn<T>): HTMLSpanElement {
    const cell = document.createElement('span');
    cell.className = 'mx-lookup__cell';
    cell.dataset.align = read(column.align) ?? 'start';
    cell.textContent = text;
    return cell;
  }
}
