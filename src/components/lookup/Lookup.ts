import { untracked, type Bind, type Component, type ComponentBase, type IBaseProp } from '@motifx/core';
import { loose, part, partBefore } from '../../core/draw-parts';
import { givenField, givenList, givenValue } from '../../core/given-field';
import { css, kept, mark, put, text } from '../../core/part-writes';
import type { ItemField } from '../../parts/list/item-field';
import type { OptionList } from '../../parts/list/OptionList';
import type { OptionParts } from '../../parts/list/option-parts';
import { readItemField } from '../../parts/list/read-item-field';
import type { Popup } from '../../parts/popup/Popup';
import { DropDown } from '../dropdown/DropDown';
import type { LookupColumn } from './lookup-column';
import type { LookupProps } from './lookup-props';

const PARTS = Symbol('mx.lookup');

interface Parts {
  header: Component<HTMLDivElement> | null;
}

/**
 * Selects one row of a table-like list, typically from a data source searched on the server, such as a
 * customer by name, city and phone. The field shows the text of the selected row.
 *
 * @example
 * <Lookup label="Customer" dataSource={this.customers} textField="CompanyName" valueField="CustomerID"
 *   columns={[{ field: 'CompanyName', caption: 'Company' }, { field: 'City', caption: 'City', width: '8rem' }]} />
 */
export class Lookup<T = unknown, V = unknown> extends DropDown<T, V> {
  constructor(props?: IBaseProp<LookupProps<T, V>>) {
    super(props as IBaseProp<LookupProps<T, V>>);
    const own = (this.props ?? {}) as LookupProps<T, V>;
    this.class.add('mx-lookup');
    if (own.searchEnabled === undefined) this.searchEnabled = true;
    if (own.matchWidth === undefined) this.matchWidth = false;
    for (const name of ['columns', 'showColumnHeaders', 'popupWidth'] as const) if (own[name] !== undefined) this.bindProperty(name, own[name]);
    this.observeProperty('columns', () => this.applyColumns());
    this.observeProperty<string>('popupWidth', (width) => css(this, '--_wanted-width', width ?? ''));
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

  /**
   * Re-reads the items and the columns after they have been changed in place. Your items and columns can be plain or
   * reactive, and the lookup reads them as they are.
   */
  override refresh(): void {
    this.applyColumns();
    super.refresh();
  }

  protected override popupCreated(popup: Popup, list: OptionList<T>): void {
    const parts = this.lookupParts;
    const header = partBefore<HTMLDivElement>(popup, list, 'div', 'mx-lookup__header');
    header.attr.add({ 'aria-hidden': 'true' });
    popup.class.add('mx-lookup__popup');
    parts.header = header;
    // Built once: the columns given (again on a refresh) are listed, each cell shows its caption; the list keeps the cells it keeps.
    const columns = () => {
      void this.getProperty('refreshed');
      return givenList(this.getProperty<readonly LookupColumn<T>[] | undefined>('columns'));
    };
    header.bindings.watch(() => {
      const shown = columns().length > 0 && this.getProperty<boolean | undefined>('showColumnHeaders') !== false;
      untracked(() => kept(header, !!shown));
    });
    header.bindings.list(columns, (column: LookupColumn<T>) => {
      const cell = loose<HTMLSpanElement>('span', 'mx-lookup__cell');
      cell.bindings.watch(() => {
        void this.getProperty('refreshed');
        const align = givenField<string | undefined>(column, 'align') ?? 'start';
        const caption = givenField<string | undefined>(column, 'caption') ?? '';
        untracked(() => {
          put(cell, 'data-align', align);
          text(cell, caption);
        });
      });
      return cell;
    });
  }

  private get lookupParts(): Parts {
    const self = this as unknown as { [PARTS]?: Parts };
    return (self[PARTS] ??= { header: null });
  }

  /** The columns lay out every row (and the header) on one grid. */
  private applyColumns(): void {
    const columns = givenList(this.peekProperty<readonly LookupColumn<T>[]>('columns'));
    css(this, '--_columns', columns.map((c) => givenField<string | undefined>(c, 'width') ?? '1fr').join(' '));
    mark(this, 'data-columns', columns.length > 0);
    this.optionDrawer = columns.length
      ? (item: T, option: OptionParts) => {
          const row = option.text;
          row.class.add('mx-lookup__row');
          for (const column of columns) this.cell(row, String(readItemField(item, givenValue<ItemField<T>>(column, 'field'), 'text') ?? ''), column);
        }
      : null;
  }

  private cell(parent: ComponentBase, text: string, column: LookupColumn<T>): void {
    const cell = part<HTMLSpanElement>(parent, 'span', 'mx-lookup__cell');
    cell.attr.add({ 'data-align': givenField<string | undefined>(column, 'align') ?? 'start' });
    cell.setText(text);
  }
}
