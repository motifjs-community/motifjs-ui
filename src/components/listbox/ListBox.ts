import { untracked, type Bind, type IBaseProp } from '@motifx/core';
import type { data } from '@motifx-community/data';
import { functionValue } from '../../core/function-value';
import { checkMark, dashMark } from '../../core/glyphs';
import type { IconSource } from '../../core/icon-source';
import { uiLocale } from '../../core/ui-locale';
import { DataItems } from '../../parts/data/DataItems';
import { Field } from '../../parts/field/Field';
import type { ItemField } from '../../parts/list/item-field';
import type { OptionChosenEventArgs } from '../../parts/list/option-chosen-event-args';
import { OptionList } from '../../parts/list/OptionList';
import { itemOwnValue } from '../../parts/list/item-own-value';
import { readItemField } from '../../parts/list/read-item-field';
import { TextBox } from '../textbox/TextBox';
import { allValues } from './all-values';
import type { ItemTemplate } from './item-template';
import type { ListBoxProps } from './list-box-props';
import { ListRows } from './list-rows';
import type { ListSelectionMode } from './list-selection-mode';
import { selectAllRow, type SelectAllRow } from './select-all-row';
import { selectAllState } from './select-all-state';
import { ValueItems } from './value-items';
import { onLanguage } from '../../core/on-language';

const OWN = [
  'items',
  'dataSource',
  'selectionMode',
  'showCheckBoxes',
  'selectAll',
  'selectionFollowsFocus',
  'searchEnabled',
  'searchMode',
  'searchDelay',
  'height',
  'noItemsText',
] as const;

const FUNCTIONS = ['textField', 'valueField', 'iconField', 'groupField', 'enabledField', 'itemTemplate'] as const;

/** Props the drawn rows depend on. */
const LOOK = ['selectionMode', 'showCheckBoxes', 'selectAll', 'textField', 'iconField', 'groupField', 'enabledField', 'itemTemplate', 'noItemsText'] as const;

const PARTS = Symbol('mx.listbox');

interface Parts<T> {
  list: OptionList<T | SelectAllRow>;
  items: DataItems<T>;
  rows: ListRows<T>;
  known: ValueItems<T>;
  /** The chosen values, for quick lookups while drawing. */
  chosen: Set<unknown>;
  search: TextBox | null;
  /** Where the last choice was made: Shift extends from there. */
  anchor: number;
  timer: ReturnType<typeof setTimeout> | undefined;
  /** Drawing waits until the constructor has bound every prop. */
  ready: boolean;
  /** Rows of the data source drawn last; while it stays, rows that load are drawn in place. */
  sourceCount: number;
}

/**
 * A list that stays on the page (the APG listbox): one item or several are chosen, with the keys
 * or the pointer. Items come from memory or from a `DataSource`; long lists draw only the rows in
 * view. A search box, groups, check boxes and a "Select all" row can be turned on.
 *
 * @example
 * <ListBox label="&City" items={cities} x-model={() => this.form.city} />
 * <ListBox label="Tags" items={tags} selectionMode="multiple" selectAll x-model={() => this.form.tags} />
 */
export class ListBox<T = unknown, V = unknown> extends Field<V | V[] | null, ListBoxProps<T, V>> {
  constructor(props?: IBaseProp<ListBoxProps<T, V>>) {
    super(props);
    const own = (this.props ?? {}) as ListBoxProps<T, V>;
    this.element.classList.add('mx-list-box');
    for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
    for (const name of FUNCTIONS) if (own[name] !== undefined) this.bindProperty(name, functionValue(own[name]));

    const parts = this.listParts;
    parts.items.textOf = (item) => this.itemText(item);
    parts.known.valueOf = (item) => this.itemValue(item);
    this.observeProperty('dataSource', () => this.renderSource());
    this.observeProperty('searchMode', (mode) => (parts.items.searchMode = mode === 'startswith' ? 'startswith' : 'contains'));
    this.observeProperty('searchEnabled', () => this.renderSearch());
    this.observeProperty<number | string | null>('height', (height) => this.renderHeight(height));
    this.observeProperty<ListSelectionMode>('selectionMode', (mode) => (this.element.dataset.selectionMode = mode ?? 'single'));
    this.observeProperty('valueField', () => {
      parts.known.clear();
      this.renderValue(this.peekValue());
    });
    for (const name of LOOK) this.observeProperty(name, () => this.drawList());
    // Items given anew are shown; items changed in place wait for `refresh`.
    this.observeProperty<readonly T[] | undefined>('items', (items) => {
      if (!this.peekProperty('dataSource')) parts.items.setArray(items ?? []);
    });
    const stopLocale = onLanguage(this, () => this.drawList());
    parts.items.onChanged(() => this.drawList(false));
    this.listen();
    this.motif.on('x:built', () => this.placeSearch());
    parts.ready = true;
    untracked(() => this.drawList());
    this.motif.setDisposable(() => {
      stopLocale();
      clearTimeout(parts.timer);
      parts.items.dispose();
      void parts.list.dispose();
    });
  }

  get items(): readonly T[] {
    return this.getProperty<readonly T[] | undefined>('items') ?? [];
  }
  set items(value: Bind<readonly T[]>) {
    this.assignProperty('items', value);
  }
  get dataSource(): data.DataSource<T, unknown> | null {
    return this.getProperty<data.DataSource<T, unknown> | null | undefined>('dataSource') ?? null;
  }
  set dataSource(value: Bind<data.DataSource<T, unknown> | null>) {
    this.assignProperty('dataSource', value);
  }
  get textField(): ItemField<T> | undefined {
    return this.getProperty<ItemField<T> | undefined>('textField');
  }
  set textField(value: Bind<ItemField<T>>) {
    this.assignProperty('textField', functionValue(value));
  }
  get valueField(): ItemField<T> | undefined {
    return this.getProperty<ItemField<T> | undefined>('valueField');
  }
  set valueField(value: Bind<ItemField<T>>) {
    this.assignProperty('valueField', functionValue(value));
  }
  get iconField(): ItemField<T> | undefined {
    return this.getProperty<ItemField<T> | undefined>('iconField');
  }
  set iconField(value: Bind<ItemField<T>>) {
    this.assignProperty('iconField', functionValue(value));
  }
  get groupField(): ItemField<T> | undefined {
    return this.getProperty<ItemField<T> | undefined>('groupField');
  }
  set groupField(value: Bind<ItemField<T>>) {
    this.assignProperty('groupField', functionValue(value));
  }
  get enabledField(): ItemField<T> | undefined {
    return this.getProperty<ItemField<T> | undefined>('enabledField');
  }
  set enabledField(value: Bind<ItemField<T>>) {
    this.assignProperty('enabledField', functionValue(value));
  }
  get selectionMode(): ListSelectionMode {
    return this.getProperty<ListSelectionMode | undefined>('selectionMode') ?? 'single';
  }
  set selectionMode(value: Bind<ListSelectionMode>) {
    this.assignProperty('selectionMode', value);
  }
  get showCheckBoxes(): boolean {
    return this.getProperty<boolean | undefined>('showCheckBoxes') !== false;
  }
  set showCheckBoxes(value: Bind<boolean>) {
    this.assignProperty('showCheckBoxes', value, Boolean);
  }
  get selectAll(): boolean {
    return !!this.getProperty<boolean>('selectAll');
  }
  set selectAll(value: Bind<boolean>) {
    this.assignProperty('selectAll', value, Boolean);
  }
  get selectionFollowsFocus(): boolean {
    return this.getProperty<boolean | undefined>('selectionFollowsFocus') !== false;
  }
  set selectionFollowsFocus(value: Bind<boolean>) {
    this.assignProperty('selectionFollowsFocus', value, Boolean);
  }
  get searchEnabled(): boolean {
    return !!this.getProperty<boolean>('searchEnabled');
  }
  set searchEnabled(value: Bind<boolean>) {
    this.assignProperty('searchEnabled', value, Boolean);
  }
  get searchMode(): 'contains' | 'startswith' {
    return this.getProperty<'contains' | 'startswith' | undefined>('searchMode') ?? 'contains';
  }
  set searchMode(value: Bind<'contains' | 'startswith'>) {
    this.assignProperty('searchMode', value);
  }
  get searchDelay(): number {
    return this.getProperty<number | undefined>('searchDelay') ?? (this.dataSource ? 250 : 0);
  }
  set searchDelay(value: Bind<number>) {
    this.assignProperty('searchDelay', value);
  }
  get height(): number | string | null {
    return this.getProperty<number | string | null | undefined>('height') ?? null;
  }
  set height(value: Bind<number | string | null>) {
    this.assignProperty('height', value);
  }
  get itemTemplate(): ItemTemplate<T> | null {
    return this.getProperty<ItemTemplate<T> | null | undefined>('itemTemplate') ?? null;
  }
  set itemTemplate(value: Bind<ItemTemplate<T> | null>) {
    this.assignProperty('itemTemplate', functionValue(value));
  }
  get noItemsText(): string {
    return this.getProperty<string | undefined>('noItemsText') ?? '';
  }
  set noItemsText(value: Bind<string>) {
    this.assignProperty('noItemsText', value);
  }

  /** The items of the chosen values that are known; with a data source the others are asked by key and follow. Reactive. */
  get selectedItems(): T[] {
    void this.value;
    void this.getProperty('found');
    const parts = this.listParts;
    const values = [...parts.chosen];
    parts.known.lookUp(values, () => {
      if (!this.isDisposed) this.setProperty('found', (this.peekProperty<number>('found') ?? 0) + 1);
    });
    return values.map((value) => parts.known.itemOf(value)).filter((item): item is T => item !== undefined);
  }

  /** The first of `selectedItems`. Reactive. */
  get selectedItem(): T | undefined {
    return this.selectedItems[0];
  }

  /** The items the list shows: what matched the last search. */
  get listItems(): DataItems<T> {
    return this.listParts.items;
  }

  /** The search box, while `searchEnabled` is on. */
  get searchBox(): TextBox | null {
    return this.listParts.search;
  }

  /** Multiple: chooses every item the list shows (with a data source, after they load). */
  selectAllItems(): Promise<void> {
    return this.chooseAll(true);
  }

  /** Chooses nothing. */
  clear(): void {
    this.commit(this.emptyValue());
  }

  /**
   * Reads the items again after they were changed in place: which there are, their texts and values, the chosen
   * ones. Your items may be plain or reactive; the list reads them as they are.
   */
  override refresh(): void {
    super.refresh();
    const parts = this.listParts;
    parts.known.clear();
    if (!parts.items.dataSource) parts.items.setArray(this.peekProperty<readonly T[]>('items') ?? []);
    this.drawList();
    this.renderValue(this.peekValue());
    this.setProperty('found', (this.peekProperty<number>('found') ?? 0) + 1);
  }

  /** Scrolls an item into view and highlights it. */
  scrollToItem(item: T): void {
    const list = this.listParts.list;
    for (let i = 0; i < list.count; i++) {
      if (list.itemOf(i) !== item) continue;
      list.setActive(i);
      this.pointAt();
      return;
    }
  }

  protected createControl(): HTMLElement {
    const list = this.listParts.list.element;
    list.tabIndex = 0;
    return list;
  }

  protected emptyValue(): V | V[] | null {
    return this.peekProperty('selectionMode') === 'multiple' ? [] : null;
  }

  protected override sameValue(a: V | V[] | null, b: V | V[] | null): boolean {
    if (!Array.isArray(a) || !Array.isArray(b)) return Object.is(a, b);
    return a.length === b.length && a.every((value, i) => Object.is(value, b[i]));
  }

  protected renderValue(value: V | V[] | null): void {
    const parts = this.listParts;
    parts.chosen = new Set(this.valuesOf(value));
    parts.known.keep([...parts.chosen]);
    parts.list.refresh();
    this.markSelectAll();
  }

  protected itemText(item: T): string {
    return String(readItemField(item, this.peekProperty<ItemField<T>>('textField'), 'text') ?? '');
  }

  protected itemValue(item: T): unknown {
    const field = this.peekProperty<ItemField<T>>('valueField');
    if (field !== undefined) return readItemField(item, field, 'value');
    return itemOwnValue(item);
  }

  private get listParts(): Parts<T> {
    const self = this as unknown as { [PARTS]?: Parts<T> };
    if (!self[PARTS]) {
      const items = new DataItems<T>();
      const list = new OptionList<T | SelectAllRow>();
      list.build();
      self[PARTS] = {
        list,
        items,
        rows: new ListRows(items),
        known: new ValueItems(items),
        chosen: new Set(),
        search: null,
        anchor: -1,
        timer: undefined,
        ready: false,
        sourceCount: -1,
      };
      this.setUpList(list);
    }
    return self[PARTS]!;
  }

  private setUpList(list: OptionList<T | SelectAllRow>): void {
    list.textOf = (row) => (row === selectAllRow ? '' : this.itemText(row as T));
    list.enabledOf = (row) => row === selectAllRow || this.canChoose(row as T);
    list.isSelected = (row) => (row === selectAllRow ? this.allState() === true : this.listParts.chosen.has(this.itemValue(row as T)));
    list.emptyText = () => this.peekProperty<string>('noItemsText') || (this.listParts.items.loading ? uiLocale.strings.loading : uiLocale.strings.noItems);
    list.draw = (row, host) => {
      if (row === selectAllRow) {
        host.textContent = uiLocale.strings.selectAll;
        if (host.parentElement) this.markSelectAllRow(host.parentElement);
        return;
      }
      const template = this.peekProperty<ItemTemplate<T> | null>('itemTemplate');
      if (template) return template(row as T, host);
      host.textContent = this.itemText(row as T);
    };
  }

  private isMultiple(): boolean {
    return this.peekProperty('selectionMode') === 'multiple';
  }

  private valuesOf(value: V | V[] | null | undefined): unknown[] {
    if (Array.isArray(value)) return value;
    return value === null || value === undefined ? [] : [value];
  }

  private canChoose(item: T): boolean {
    return readItemField(item, this.peekProperty<ItemField<T>>('enabledField'), 'enabled') !== false;
  }

  private canChange(): boolean {
    return this.isEnabled && !this.peekProperty('readOnly');
  }

  private allState(): boolean | 'mixed' {
    const parts = this.listParts;
    return selectAllState(parts.items, parts.chosen, (item) => this.itemValue(item), (item) => this.canChoose(item));
  }

  private renderSource(): void {
    const parts = this.listParts;
    const source = this.peekProperty<data.DataSource<T, unknown> | null>('dataSource');
    parts.known.clear();
    if (source) parts.items.setDataSource(source);
    else parts.items.setArray(this.peekProperty<readonly T[]>('items') ?? []);
  }

  private renderHeight(height: number | string | null | undefined): void {
    const style = this.listParts.list.element.style;
    if (height === null || height === undefined || height === '') {
      style.removeProperty('block-size');
      style.removeProperty('max-block-size');
      return;
    }
    style.blockSize = typeof height === 'number' ? `calc(${height} * var(--mx-list-item-height))` : height;
    style.maxBlockSize = 'none';
  }

  private renderSearch(): void {
    const parts = this.listParts;
    if (!this.peekProperty('searchEnabled')) {
      if (parts.search) {
        clearTimeout(parts.timer);
        void parts.items.search('');
        void parts.search.dispose();
        parts.search.element.remove();
        parts.search = null;
      }
      return;
    }
    if (parts.search) return;
    const search = new TextBox({ type: 'search', labelMode: 'hidden', stretch: true, autocomplete: 'off' });
    onLanguage(search, () => {
      search.label = uiLocale.strings.search;
      search.placeholder = uiLocale.strings.search;
    });
    search.element.classList.add('mx-list-box__search');
    search.onValueChanged((e) => this.searchFor(e.value));
    search.inputElement.setAttribute('aria-controls', parts.list.element.id);
    search.inputElement.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowDown') return;
      e.preventDefault();
      this.focus();
      if (parts.list.activeIndex < 0) parts.list.move('first');
      this.pointAt();
    });
    this.controls.add(search);
    parts.search = search;
    this.placeSearch();
  }

  /** Above the list, in the box; the build places controls at the end. */
  private placeSearch(): void {
    const parts = this.listParts;
    if (parts.search && parts.search.element.nextElementSibling !== parts.list.element) parts.list.element.before(parts.search.element);
  }

  private searchFor(text: string): void {
    const parts = this.listParts;
    clearTimeout(parts.timer);
    const run = () => {
      parts.list.setActive(-1);
      void parts.items.search(text);
      this.pointAt();
    };
    const delay = this.peekProperty<number>('searchDelay') ?? (parts.items.dataSource ? 250 : 0);
    if (delay > 0) parts.timer = setTimeout(run, delay);
    else run();
  }

  /** `all`: the rows' look may have changed too, not only which rows there are. */
  private drawList(all = true): void {
    const parts = this.listParts;
    if (!parts.ready) return;
    const list = parts.list;
    const multiple = this.isMultiple();
    const icon = this.peekProperty<ItemField<T>>('iconField');
    const group = this.peekProperty<ItemField<T>>('groupField');
    const withAll = multiple && !!this.peekProperty('selectAll');
    this.element.toggleAttribute('data-check-boxes', multiple && this.peekProperty('showCheckBoxes') !== false);
    list.multiple = multiple;
    list.iconOf = icon === undefined ? null : (row) => (row === selectAllRow ? undefined : (readItemField(row as T, icon, 'icon') as IconSource | undefined));
    if (parts.items.dataSource) {
      list.groupOf = null;
      parts.rows.withSelectAll = withAll;
      // Drawing the whole list again would scroll it back to the top.
      if (!all && parts.rows.count === parts.sourceCount) list.redraw();
      else list.setSource(parts.rows);
      parts.sourceCount = parts.rows.count;
    } else {
      parts.sourceCount = -1;
      list.groupOf =
        group === undefined ? null : (row) => (row === selectAllRow ? undefined : ((readItemField(row as T, group, 'group') as string | undefined) ?? undefined));
      const shown = parts.items.loaded;
      list.setItems(withAll && shown.length ? [selectAllRow, ...shown] : shown);
    }
    // An empty listbox reads as empty; its "No items" is for the eyes.
    list.element.querySelector('.mx-list__empty')?.setAttribute('aria-hidden', 'true');
    this.pointAt();
  }

  private markSelectAll(): void {
    const row = this.listParts.list.element.querySelector<HTMLElement>('[data-select-all]');
    if (row) this.markSelectAllRow(row);
  }

  /** The "Select all" row is chosen when every item is, and shows a dash when some are. */
  private markSelectAllRow(row: HTMLElement): void {
    const state = this.allState();
    row.setAttribute('data-select-all', '');
    row.setAttribute('aria-selected', String(state === true));
    row.toggleAttribute('data-selected', state !== false);
    row.toggleAttribute('data-mixed', state === 'mixed');
    row.querySelector('.mx-list__check')?.replaceChildren(state === 'mixed' ? dashMark() : checkMark());
  }

  private pointAt(): void {
    const list = this.listParts.list;
    if (list.activeIndex >= 0) list.element.setAttribute('aria-activedescendant', list.idOf(list.activeIndex));
    else list.element.removeAttribute('aria-activedescendant');
  }

  private listen(): void {
    const list = this.listParts.list;
    const el = list.element;
    el.addEventListener('keydown', (e) => this.keyDown(e));
    el.addEventListener('focus', () => this.gotFocus());
    // The list keeps focus off its options; a press still focuses the list itself, without the
    // keyboard ring (Chrome would show it when the focus before came from the keyboard).
    el.addEventListener('mousedown', (e) => {
      if (e.button !== 0 || !this.enabled) return;
      el.removeAttribute('data-keys');
      if (el.ownerDocument.activeElement !== el) el.focus({ preventScroll: true, focusVisible: false } as FocusOptions);
    });
    // Keys after a press bring the ring back (`data-keys`); the browser would not.
    el.addEventListener('keydown', (e) => {
      if (!e.ctrlKey && !e.metaKey && !e.altKey && e.key !== 'Shift' && e.key !== 'Tab') el.setAttribute('data-keys', '');
    });
    el.addEventListener('blur', () => el.removeAttribute('data-keys'));
    el.addEventListener('pointermove', () => this.pointAt());
    list.onChosen((e) => this.chosen(e));
  }

  private gotFocus(): void {
    const parts = this.listParts;
    const list = parts.list;
    if (list.activeIndex < 0 && list.count) {
      let index = -1;
      if (parts.chosen.size) {
        for (let i = 0; i < list.count && index < 0; i++) {
          const row = list.itemOf(i);
          if (row !== undefined && row !== selectAllRow && parts.chosen.has(this.itemValue(row as T))) index = i;
        }
      }
      if (index >= 0) list.setActive(index);
      else list.move('first');
    }
    this.pointAt();
  }

  private keyDown(e: KeyboardEvent): void {
    const parts = this.listParts;
    const list = parts.list;
    const multiple = this.isMultiple();
    const command = e.ctrlKey || e.metaKey;
    if (multiple && command && !e.altKey && e.key.toLowerCase() === 'a') {
      e.preventDefault();
      void this.chooseAll(this.allState() !== true, e);
      return;
    }
    if (e.key === ' ' && !command && !e.altKey) {
      e.preventDefault();
      const index = list.activeIndex;
      if (index < 0) return;
      if (multiple && e.shiftKey) this.chooseRange(parts.anchor, index, e);
      else this.chooseAt(index, e, multiple ? 'toggle' : 'add');
      return;
    }
    const before = list.activeIndex;
    if (e.key === 'PageDown' || e.key === 'PageUp') {
      e.preventDefault();
      list.move((e.key === 'PageDown' ? 1 : -1) * this.pageRows());
    } else if (e.key === 'Enter') {
      list.handleKey(e);
      return;
    } else if (!list.handleKey(e)) {
      if (e.key.length !== 1 || command || e.altKey) return;
      const index = list.typeAhead(e.key);
      if (index < 0) return;
      list.setActive(index);
    }
    this.moved(e, before);
  }

  /** The highlight moved with a key: the item follows it in a single list; Shift chooses in a multiple one. */
  private moved(e: KeyboardEvent, before: number): void {
    const list = this.listParts.list;
    const index = list.activeIndex;
    this.pointAt();
    if (index < 0 || index === before) return;
    if (!this.isMultiple()) {
      if (this.peekProperty('selectionFollowsFocus') !== false) this.chooseAt(index, e, 'add');
      return;
    }
    if (!e.shiftKey) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') this.chooseAt(index, e, 'toggle');
    else if ((e.key === 'Home' || e.key === 'End') && (e.ctrlKey || e.metaKey)) this.chooseRange(before, index, e);
  }

  private pageRows(): number {
    const el = this.listParts.list.element;
    const row = el.querySelector('[role="option"]')?.getBoundingClientRect().height || 1;
    return Math.max(1, Math.floor(el.clientHeight / row) - 1);
  }

  private chosen(e: OptionChosenEventArgs<T | SelectAllRow>): void {
    const event = e.event;
    if (!this.isMultiple()) {
      this.chooseAt(e.index, event, 'add');
    } else if ('key' in event) {
      this.chooseAt(e.index, event as KeyboardEvent, 'toggle');
    } else {
      const mouse = event as MouseEvent;
      const parts = this.listParts;
      if (mouse.shiftKey && parts.anchor >= 0) this.chooseRange(parts.anchor, e.index, mouse);
      else this.chooseAt(e.index, mouse, mouse.ctrlKey || mouse.metaKey || this.peekProperty('showCheckBoxes') !== false ? 'toggle' : 'only');
    }
    this.pointAt();
  }

  /** `add` chooses the item (the only one in a single list), `toggle` flips it, `only` makes it the only one. */
  private chooseAt(index: number, event: Event, how: 'add' | 'toggle' | 'only'): void {
    const parts = this.listParts;
    const row = parts.list.itemOf(index);
    if (row === undefined) return;
    if (row === selectAllRow) {
      void this.chooseAll(this.allState() !== true, event);
      return;
    }
    const item = row as T;
    if (!this.canChoose(item) || !this.canChange()) return;
    parts.anchor = index;
    parts.known.remember(item);
    const value = this.itemValue(item);
    if (!this.isMultiple()) {
      this.commit(value as V, event);
      return;
    }
    const values = this.valuesOf(this.peekValue());
    let next: unknown[];
    if (how === 'only') next = [value];
    else if (parts.chosen.has(value)) next = how === 'toggle' ? values.filter((v) => !Object.is(v, value)) : values;
    else next = [...values, value];
    this.commit(next as V[], event);
  }

  /** Chooses every item from one index to another (Shift + Space, Shift + click). */
  private chooseRange(from: number, to: number, event: Event): void {
    if (!this.canChange()) return;
    const parts = this.listParts;
    const start = Math.min(from < 0 ? to : from, to);
    const end = Math.max(from < 0 ? to : from, to);
    const next = this.valuesOf(this.peekValue()).slice();
    for (let i = start; i <= end; i++) {
      const row = parts.list.itemOf(i);
      if (row === undefined || row === selectAllRow || !this.canChoose(row as T)) continue;
      const value = this.itemValue(row as T);
      if (!next.some((v) => Object.is(v, value))) next.push(value);
    }
    this.commit(next as V[], event);
  }

  /** Chooses (`on`) or lets go of every item the list shows. */
  private async chooseAll(on: boolean, event?: Event): Promise<void> {
    if (!this.isMultiple() || !this.canChange()) return;
    const parts = this.listParts;
    const found = allValues(
      parts.items,
      (item) => this.itemValue(item),
      (item) => this.canChoose(item),
    );
    const shown = found instanceof Promise ? await found : found;
    if (this.isDisposed) return;
    const current = this.valuesOf(this.peekValue());
    const chosen = new Set(current);
    const set = new Set(shown);
    const next = on ? [...current, ...shown.filter((v) => !chosen.has(v))] : current.filter((v) => !set.has(v));
    this.commit(next as V[], event);
  }
}
