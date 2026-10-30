import { Emitter, untracked, type Bind, type Event as MotifEvent, type IBaseProp } from '@motifx/core';
import type { data } from '@motifx-community/data';
import { follow } from '../../core/follow';
import { functionValue } from '../../core/function-value';
import { checkMark, chevronDown, dashMark, dismissMark } from '../../core/glyphs';
import type { IconSource } from '../../core/icon-source';
import { uiLocale } from '../../core/ui-locale';
import { DataItems } from '../../parts/data/DataItems';
import { Field } from '../../parts/field/Field';
import type { ItemField } from '../../parts/list/item-field';
import type { OptionChosenEventArgs } from '../../parts/list/option-chosen-event-args';
import { OptionList } from '../../parts/list/OptionList';
import { itemOwnValue } from '../../parts/list/item-own-value';
import { readItemField } from '../../parts/list/read-item-field';
import { Popup } from '../../parts/popup/Popup';
import type { PopupCloseReason } from '../../parts/popup/popup-close-reason';
import { allValues } from '../listbox/all-values';
import type { ItemTemplate } from '../listbox/item-template';
import { ListRows } from '../listbox/list-rows';
import { selectAllRow, type SelectAllRow } from '../listbox/select-all-row';
import { selectAllState } from '../listbox/select-all-state';
import { ValueItems } from '../listbox/value-items';
import type { TagBoxProps } from './tag-box-props';

const OWN = [
  'items',
  'dataSource',
  'placeholder',
  'searchMode',
  'minSearchLength',
  'searchDelay',
  'acceptCustomValue',
  'autoHighlight',
  'closeOnSelect',
  'maxTags',
  'maxSelected',
  'selectAll',
  'hideSelected',
  'openOnFieldClick',
  'showDropDownButton',
  'clearButton',
  'matchWidth',
] as const;

const FUNCTIONS = ['textField', 'valueField', 'iconField', 'groupField', 'enabledField', 'itemTemplate', 'tagTemplate', 'customValue'] as const;

/** Props the open list depends on. */
const LIST_LOOK = ['selectAll', 'hideSelected', 'maxSelected', 'textField', 'iconField', 'groupField', 'enabledField', 'itemTemplate'] as const;

/** Props the tags depend on. */
const TAG_LOOK = ['maxTags', 'tagTemplate', 'textField', 'placeholder'] as const;

/** Texts the "+3" tag lists in its title, at most. */
const TITLE_TEXTS = 20;

const PARTS = Symbol('mx.tagbox');

interface Parts<T> {
  items: DataItems<T>;
  rows: ListRows<T>;
  known: ValueItems<T>;
  chosen: Set<unknown>;
  tags: HTMLDivElement;
  releaseTags: (() => void)[];
  popup: Popup | null;
  list: OptionList<T | SelectAllRow> | null;
  arrow: HTMLButtonElement | null;
  clear: HTMLButtonElement | null;
  /** The highlight was moved with the keys since the last typing. */
  moved: boolean;
  timer: ReturnType<typeof setTimeout> | undefined;
  ready: boolean;
  /** Rows of the data source drawn last; while it stays, rows that load are drawn in place. */
  sourceCount: number;
  opened: Emitter<void>;
  closed: Emitter<PopupCloseReason>;
}

/**
 * Picks several items: the chosen ones are tags in the field, followed by a text input that
 * searches the list (the APG combobox with a multi-select listbox). Items come from memory or from
 * a `DataSource`; typed text can become a tag of its own with `acceptCustomValue`.
 *
 * @example
 * <TagBox label="&Skills" items={skills} x-model={() => this.form.skills} />
 * <TagBox label="Customers" dataSource={this.customers} textField="CompanyName" valueField="CustomerID" maxTags={3} />
 */
export class TagBox<T = unknown, V = unknown> extends Field<V[], TagBoxProps<T, V>> {
  constructor(props?: IBaseProp<TagBoxProps<T, V>>) {
    super(props);
    const own = (this.props ?? {}) as TagBoxProps<T, V>;
    this.element.classList.add('mx-tag-box');
    for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
    for (const name of FUNCTIONS) if (own[name] !== undefined) this.bindProperty(name, functionValue(own[name]));
    if (own.onOpened) this.onOpened(own.onOpened);
    if (own.onClosed) this.onClosed(own.onClosed);

    const parts = this.tagParts;
    this.inputElement.before(parts.tags);
    parts.items.textOf = (item) => this.itemText(item);
    parts.known.valueOf = (item) => this.itemValue(item);
    this.observeProperty('dataSource', () => this.renderSource());
    this.observeProperty('searchMode', (mode) => (parts.items.searchMode = mode === 'startswith' ? 'startswith' : 'contains'));
    this.observeProperty('showDropDownButton', () => this.renderArrow());
    this.observeProperty('clearButton', () => this.renderClear());
    this.observeProperty('matchWidth', (on) => {
      if (parts.popup) parts.popup.matchWidth = on !== false;
    });
    this.observeProperty('valueField', () => {
      parts.known.clear();
      this.renderValue(this.peekValue());
    });
    for (const name of LIST_LOOK) this.observeProperty(name, () => this.listChanged());
    for (const name of TAG_LOOK) this.observeProperty(name, () => this.renderTags());
    // Items given anew are shown; items changed in place wait for `refresh`.
    this.observeProperty<readonly T[] | undefined>('items', (items) => {
      if (!this.peekProperty('dataSource')) parts.items.setArray(items ?? []);
    });
    const stopLocale = follow(this, 'texts', () => uiLocale.strings, (strings) => {
      parts.arrow?.setAttribute('aria-label', strings.moreOptions);
      parts.clear?.setAttribute('aria-label', strings.clear);
      this.renderTags();
      this.listChanged();
    });
    parts.items.onChanged(() => this.itemsChanged());
    this.listen();
    parts.ready = true;
    untracked(() => this.renderValue(this.peekValue()));
    this.motif.setDisposable(() => {
      stopLocale();
      clearTimeout(parts.timer);
      for (const release of parts.releaseTags.splice(0)) release();
      parts.items.dispose();
      parts.opened.dispose();
      parts.closed.dispose();
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
  get placeholder(): string {
    return this.getProperty<string | undefined>('placeholder') ?? '';
  }
  set placeholder(value: Bind<string>) {
    this.assignProperty('placeholder', value);
  }
  get searchMode(): 'contains' | 'startswith' {
    return this.getProperty<'contains' | 'startswith' | undefined>('searchMode') ?? 'contains';
  }
  set searchMode(value: Bind<'contains' | 'startswith'>) {
    this.assignProperty('searchMode', value);
  }
  get minSearchLength(): number {
    return this.getProperty<number | undefined>('minSearchLength') ?? 0;
  }
  set minSearchLength(value: Bind<number>) {
    this.assignProperty('minSearchLength', value);
  }
  get searchDelay(): number {
    return this.getProperty<number | undefined>('searchDelay') ?? (this.dataSource ? 250 : 0);
  }
  set searchDelay(value: Bind<number>) {
    this.assignProperty('searchDelay', value);
  }
  get acceptCustomValue(): boolean {
    return !!this.getProperty<boolean>('acceptCustomValue');
  }
  set acceptCustomValue(value: Bind<boolean>) {
    this.assignProperty('acceptCustomValue', value, Boolean);
  }
  get customValue(): ((text: string) => V | null) | null {
    return this.getProperty<((text: string) => V | null) | null | undefined>('customValue') ?? null;
  }
  set customValue(value: Bind<((text: string) => V | null) | null>) {
    this.assignProperty('customValue', functionValue(value));
  }
  get autoHighlight(): boolean {
    const on = this.getProperty<boolean | undefined>('autoHighlight');
    return on === undefined ? !this.acceptCustomValue : on;
  }
  set autoHighlight(value: Bind<boolean>) {
    this.assignProperty('autoHighlight', value, Boolean);
  }
  get closeOnSelect(): boolean {
    return !!this.getProperty<boolean>('closeOnSelect');
  }
  set closeOnSelect(value: Bind<boolean>) {
    this.assignProperty('closeOnSelect', value, Boolean);
  }
  get maxTags(): number {
    return this.getProperty<number | undefined>('maxTags') ?? 0;
  }
  set maxTags(value: Bind<number>) {
    this.assignProperty('maxTags', value, (v) => Math.max(0, Number(v) || 0));
  }
  get maxSelected(): number {
    return this.getProperty<number | undefined>('maxSelected') ?? 0;
  }
  set maxSelected(value: Bind<number>) {
    this.assignProperty('maxSelected', value, (v) => Math.max(0, Number(v) || 0));
  }
  get selectAll(): boolean {
    return !!this.getProperty<boolean>('selectAll');
  }
  set selectAll(value: Bind<boolean>) {
    this.assignProperty('selectAll', value, Boolean);
  }
  get hideSelected(): boolean {
    return !!this.getProperty<boolean>('hideSelected');
  }
  set hideSelected(value: Bind<boolean>) {
    this.assignProperty('hideSelected', value, Boolean);
  }
  get openOnFieldClick(): boolean {
    return this.getProperty<boolean | undefined>('openOnFieldClick') !== false;
  }
  set openOnFieldClick(value: Bind<boolean>) {
    this.assignProperty('openOnFieldClick', value, Boolean);
  }
  get showDropDownButton(): boolean {
    return this.getProperty<boolean | undefined>('showDropDownButton') !== false;
  }
  set showDropDownButton(value: Bind<boolean>) {
    this.assignProperty('showDropDownButton', value, Boolean);
  }
  get clearButton(): boolean {
    return !!this.getProperty<boolean>('clearButton');
  }
  set clearButton(value: Bind<boolean>) {
    this.assignProperty('clearButton', value, Boolean);
  }
  get itemTemplate(): ItemTemplate<T> | null {
    return this.getProperty<ItemTemplate<T> | null | undefined>('itemTemplate') ?? null;
  }
  set itemTemplate(value: Bind<ItemTemplate<T> | null>) {
    this.assignProperty('itemTemplate', functionValue(value));
  }
  get tagTemplate(): ItemTemplate<T> | null {
    return this.getProperty<ItemTemplate<T> | null | undefined>('tagTemplate') ?? null;
  }
  set tagTemplate(value: Bind<ItemTemplate<T> | null>) {
    this.assignProperty('tagTemplate', functionValue(value));
  }
  get matchWidth(): boolean {
    return this.getProperty<boolean | undefined>('matchWidth') !== false;
  }
  set matchWidth(value: Bind<boolean>) {
    this.assignProperty('matchWidth', value, Boolean);
  }

  get inputElement(): HTMLInputElement {
    return this.focusElement as HTMLInputElement;
  }

  /** The items of the chosen values that are known. Reactive. */
  get selectedItems(): T[] {
    void this.value;
    void this.getProperty('found');
    const parts = this.tagParts;
    return [...parts.chosen].map((value) => parts.known.itemOf(value)).filter((item): item is T => item !== undefined);
  }

  /** The items the list shows: what matched the last search. */
  get listItems(): DataItems<T> {
    return this.tagParts.items;
  }

  get opened(): boolean {
    return !!this.getProperty<boolean>('opened');
  }
  set opened(value: boolean) {
    if (value) this.open();
    else this.close();
  }

  get onOpened(): MotifEvent<void> {
    return this.tagParts.opened.event;
  }

  get onClosed(): MotifEvent<PopupCloseReason> {
    return this.tagParts.closed.event;
  }

  /** Opens the list; `false` when it cannot be used now. */
  open(): boolean {
    if (!this.canChange()) return false;
    const parts = this.tagParts;
    const popup = (parts.popup ??= this.createPopup());
    if (popup.isOpen) return true;
    this.drawList();
    const box = this.inputElement.parentElement!;
    popup.open(box, { toggle: box, returnFocus: this.inputElement });
    this.setProperty('opened', true);
    this.element.setAttribute('data-open', '');
    this.inputElement.setAttribute('aria-expanded', 'true');
    this.highlight();
    parts.opened.fire();
    return true;
  }

  close(): void {
    this.tagParts.popup?.close('code');
  }

  /**
   * Reads the items again after they were changed in place: the tags, the open list, the chosen items. Your items
   * may be plain or reactive; the box reads them as they are.
   */
  override refresh(): void {
    super.refresh();
    const parts = this.tagParts;
    parts.known.clear();
    if (parts.items.dataSource) this.itemsChanged();
    else parts.items.setArray(this.peekProperty<readonly T[]>('items') ?? []);
    this.renderValue(this.peekValue());
    this.setProperty('found', (this.peekProperty<number>('found') ?? 0) + 1);
  }

  /** Removes every tag. */
  clear(): void {
    this.commit([]);
  }

  /** Chooses every item the list shows (with a data source, after they load), up to `maxSelected`. */
  selectAllItems(): Promise<void> {
    return this.chooseAll(true);
  }

  protected createControl(): HTMLElement {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'mx-field__input mx-tag-box__input';
    input.autocomplete = 'off';
    input.spellcheck = false;
    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-autocomplete', 'list');
    input.setAttribute('aria-expanded', 'false');
    return input;
  }

  protected emptyValue(): V[] {
    return [];
  }

  protected override normalizeValue(value: V[]): V[] {
    if (Array.isArray(value)) return value;
    return value === null || value === undefined ? [] : [value as V];
  }

  protected override sameValue(a: V[], b: V[]): boolean {
    if (!Array.isArray(a) || !Array.isArray(b)) return Object.is(a, b);
    return a.length === b.length && a.every((value, i) => Object.is(value, b[i]));
  }

  protected renderValue(value: V[]): void {
    const parts = this.tagParts;
    const values = Array.isArray(value) ? value : [];
    parts.chosen = new Set(values);
    if (!parts.ready) return;
    parts.known.keep(values);
    this.renderTags();
    const list = parts.list;
    if (!list || !parts.popup?.isOpen) return;
    if (this.peekProperty('hideSelected') || this.peekProperty('maxSelected')) {
      this.drawList(false);
      parts.popup.place();
    } else {
      list.refresh();
      const all = list.element.querySelector<HTMLElement>('[data-select-all]');
      if (all) this.markSelectAllRow(all);
    }
  }

  protected itemText(item: T): string {
    return String(readItemField(item, this.peekProperty<ItemField<T>>('textField'), 'text') ?? '');
  }

  protected itemValue(item: T): unknown {
    const field = this.peekProperty<ItemField<T>>('valueField');
    if (field !== undefined) return readItemField(item, field, 'value');
    return itemOwnValue(item);
  }

  /** The text of a tag whose value has no item. */
  protected textOfValue(value: V): string {
    return value === null || value === undefined ? '' : String(value);
  }

  private get tagParts(): Parts<T> {
    const self = this as unknown as { [PARTS]?: Parts<T> };
    if (!self[PARTS]) {
      const items = new DataItems<T>();
      const tags = document.createElement('div');
      tags.className = 'mx-tag-box__tags';
      tags.setAttribute('role', 'list');
      tags.hidden = true;
      self[PARTS] = {
        items,
        rows: new ListRows(items),
        known: new ValueItems(items),
        chosen: new Set(),
        tags,
        releaseTags: [],
        popup: null,
        list: null,
        arrow: null,
        clear: null,
        moved: false,
        timer: undefined,
        ready: false,
        sourceCount: -1,
        opened: new Emitter(),
        closed: new Emitter(),
      };
    }
    return self[PARTS]!;
  }

  private values(): V[] {
    const value = this.peekValue();
    return Array.isArray(value) ? value : [];
  }

  private canChoose(item: T): boolean {
    return readItemField(item, this.peekProperty<ItemField<T>>('enabledField'), 'enabled') !== false;
  }

  private canChange(): boolean {
    return this.isEnabled && !this.peekProperty('readOnly');
  }

  private atLimit(): boolean {
    const max = this.peekProperty<number>('maxSelected') ?? 0;
    return max > 0 && this.tagParts.chosen.size >= max;
  }

  private allState(): boolean | 'mixed' {
    const parts = this.tagParts;
    return selectAllState(parts.items, parts.chosen, (item) => this.itemValue(item), (item) => this.canChoose(item));
  }

  private renderSource(): void {
    const parts = this.tagParts;
    const source = this.peekProperty<data.DataSource<T, unknown> | null>('dataSource');
    parts.known.clear();
    if (source) parts.items.setDataSource(source);
    else parts.items.setArray(this.peekProperty<readonly T[]>('items') ?? []);
  }

  // Tags.

  private renderTags(): void {
    const parts = this.tagParts;
    if (!parts.ready) return;
    for (const release of parts.releaseTags.splice(0)) release();
    const values = this.values();
    const max = this.peekProperty<number>('maxTags') ?? 0;
    const shown = max > 0 && values.length > max ? max : values.length;
    // Only the tags shown are asked for by key.
    parts.known.lookUp(values.slice(0, shown), () => {
      if (this.isDisposed) return;
      this.renderTags();
      this.setProperty('found', (this.peekProperty<number>('found') ?? 0) + 1);
    });
    const nodes: HTMLElement[] = [];
    for (let i = 0; i < shown; i++) nodes.push(this.tagElement(values[i], i));
    if (shown < values.length) {
      const more = document.createElement('div');
      more.className = 'mx-tag-box__tag mx-tag-box__more';
      more.setAttribute('role', 'listitem');
      more.textContent = uiLocale.strings.moreItems.replace('{count}', String(values.length - shown));
      const rest = values.slice(shown);
      more.title = rest
        .slice(0, TITLE_TEXTS)
        .map((value) => this.tagText(value))
        .concat(rest.length > TITLE_TEXTS ? ['…'] : [])
        .join(', ');
      nodes.push(more);
    }
    parts.tags.replaceChildren(...nodes);
    parts.tags.hidden = !nodes.length;
    const placeholder = this.peekProperty<string>('placeholder') ?? '';
    if (placeholder && !values.length) this.inputElement.placeholder = placeholder;
    else this.inputElement.removeAttribute('placeholder');
    this.element.toggleAttribute('data-placeholder', !!placeholder && !values.length);
  }

  private tagText(value: V): string {
    const parts = this.tagParts;
    const item = parts.known.itemOf(value);
    if (item !== undefined) return this.itemText(item);
    return parts.known.isAsking(value) ? uiLocale.strings.loading : this.textOfValue(value);
  }

  private tagElement(value: V, index: number): HTMLElement {
    const parts = this.tagParts;
    const item = parts.known.itemOf(value);
    const text = this.tagText(value);
    const tag = document.createElement('div');
    tag.className = 'mx-tag-box__tag';
    tag.setAttribute('role', 'listitem');
    tag.tabIndex = -1;
    tag.dataset.index = String(index);
    if (item === undefined && parts.known.isAsking(value)) tag.setAttribute('data-loading', '');
    const label = tag.appendChild(document.createElement('span'));
    label.className = 'mx-tag-box__tag-text';
    const template = this.peekProperty<ItemTemplate<T> | null>('tagTemplate');
    const release = item !== undefined && template ? template(item, label) : undefined;
    if (release) parts.releaseTags.push(release);
    else if (!(item !== undefined && template)) label.textContent = text;
    const remove = tag.appendChild(document.createElement('button'));
    remove.type = 'button';
    remove.tabIndex = -1;
    remove.className = 'mx-tag-box__remove';
    remove.setAttribute('aria-label', uiLocale.strings.removeItem.replace('{text}', text));
    remove.append(dismissMark());
    return tag;
  }

  private tagAt(index: number): HTMLElement | null {
    return this.tagParts.tags.querySelector<HTMLElement>(`.mx-tag-box__tag[data-index="${index}"]`);
  }

  private shownTags(): number {
    return this.tagParts.tags.querySelectorAll('.mx-tag-box__tag[data-index]').length;
  }

  private removeAt(index: number, event?: Event): void {
    if (!this.canChange()) return;
    const values = this.values();
    if (index < 0 || index >= values.length) return;
    this.commit(
      values.filter((_, i) => i !== index),
      event,
    );
  }

  // The list.

  private createPopup(): Popup {
    const parts = this.tagParts;
    const popup = new Popup();
    popup.matchWidth = this.peekProperty('matchWidth') !== false;
    popup.element.classList.add('mx-tag-box__popup');
    this.controls.add(popup);
    const list = new OptionList<T | SelectAllRow>();
    list.multiple = true;
    list.textOf = (row) => (row === selectAllRow ? '' : this.itemText(row as T));
    list.enabledOf = (row) => {
      if (row === selectAllRow) return true;
      const item = row as T;
      return this.canChoose(item) && (!this.atLimit() || parts.chosen.has(this.itemValue(item)));
    };
    list.isSelected = (row) => (row === selectAllRow ? this.allState() === true : parts.chosen.has(this.itemValue(row as T)));
    list.emptyText = () => (parts.items.loading ? uiLocale.strings.loading : uiLocale.strings.noItems);
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
    list.onChosen((e) => this.chosen(e));
    popup.controls.add(list);
    parts.list = list;
    this.inputElement.setAttribute('aria-controls', list.element.id);
    popup.onClosed((reason) => {
      this.setProperty('opened', false);
      this.element.removeAttribute('data-open');
      this.inputElement.setAttribute('aria-expanded', 'false');
      this.pointAt();
      parts.closed.fire(reason);
    });
    return popup;
  }

  /** `all`: the rows' look may have changed too, not only which rows there are. */
  private drawList(all = true): void {
    const parts = this.tagParts;
    const list = parts.list;
    if (!list) return;
    const icon = this.peekProperty<ItemField<T>>('iconField');
    const group = this.peekProperty<ItemField<T>>('groupField');
    const withAll = !!this.peekProperty('selectAll');
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
      let shown = parts.items.loaded;
      if (this.peekProperty('hideSelected')) shown = shown.filter((item) => !parts.chosen.has(this.itemValue(item)));
      list.setItems(withAll && shown.length ? [selectAllRow, ...shown] : shown);
    }
    // An empty listbox reads as empty; its "No items" is for the eyes.
    list.element.querySelector('.mx-list__empty')?.setAttribute('aria-hidden', 'true');
    this.pointAt();
  }

  private listChanged(): void {
    const parts = this.tagParts;
    if (!parts.ready || !parts.popup?.isOpen) return;
    this.drawList();
    parts.popup.place();
  }

  private itemsChanged(): void {
    const parts = this.tagParts;
    if (parts.popup?.isOpen) {
      this.drawList(false);
      this.highlight();
      parts.popup.place();
    }
    // Items of the tags may have come in.
    if (this.values().some((value) => parts.known.itemOf(value) === undefined)) this.renderTags();
  }

  private markSelectAllRow(row: HTMLElement): void {
    const state = this.allState();
    row.setAttribute('data-select-all', '');
    row.setAttribute('aria-selected', String(state === true));
    row.toggleAttribute('data-selected', state !== false);
    row.toggleAttribute('data-mixed', state === 'mixed');
    row.querySelector('.mx-list__check')?.replaceChildren(state === 'mixed' ? dashMark() : checkMark());
  }

  /** While typing, the first match is highlighted so Enter takes it. */
  private highlight(): void {
    const parts = this.tagParts;
    const list = parts.list;
    if (!list) return;
    const auto = this.peekProperty<boolean>('autoHighlight') ?? !this.peekProperty('acceptCustomValue');
    if (this.inputElement.value && auto) {
      list.move('first');
      if (list.activeItem === selectAllRow) list.move(1);
    } else if (!parts.moved) {
      list.setActive(-1);
    }
    this.pointAt();
  }

  private pointAt(): void {
    const parts = this.tagParts;
    const list = parts.list;
    if (list && parts.popup?.isOpen && list.activeIndex >= 0) this.inputElement.setAttribute('aria-activedescendant', list.idOf(list.activeIndex));
    else this.inputElement.removeAttribute('aria-activedescendant');
  }

  private chosen(e: OptionChosenEventArgs<T | SelectAllRow>): void {
    this.chooseRow(e.item, e.event);
  }

  private chooseRow(row: T | SelectAllRow, event: Event): void {
    if (row === selectAllRow) {
      void this.chooseAll(this.allState() !== true, event);
      return;
    }
    this.toggle(row as T, event);
  }

  /** Adds the item, or takes it out when it is chosen. */
  private toggle(item: T, event?: Event): void {
    const parts = this.tagParts;
    if (!this.canChange() || !this.canChoose(item)) return;
    const value = this.itemValue(item) as V;
    const values = this.values();
    if (parts.chosen.has(value)) {
      this.commit(
        values.filter((v) => !Object.is(v, value)),
        event,
      );
    } else {
      if (this.atLimit()) return;
      parts.known.remember(item);
      this.commit([...values, value], event);
    }
    this.chosenDone();
  }

  /** After a choice: the text and the search start again; the list stays open unless `closeOnSelect`. */
  private chosenDone(): void {
    const parts = this.tagParts;
    clearTimeout(parts.timer);
    parts.moved = false;
    if (this.inputElement.value) {
      this.inputElement.value = '';
      this.element.removeAttribute('data-text');
      void parts.items.search('');
    }
    if (this.peekProperty('closeOnSelect')) this.close();
  }

  private addCustom(text: string, event: Event): boolean {
    const make = this.peekProperty<((text: string) => V | null) | null>('customValue');
    const value = make ? make(text) : (text as unknown as V);
    if (value === null || value === undefined || this.atLimit()) return false;
    if (!this.tagParts.chosen.has(value)) this.commit([...this.values(), value], event);
    this.chosenDone();
    return true;
  }

  private async chooseAll(on: boolean, event?: Event): Promise<void> {
    if (!this.canChange()) return;
    const parts = this.tagParts;
    const found = allValues(
      parts.items,
      (item) => this.itemValue(item),
      (item) => this.canChoose(item),
    );
    const shown = (found instanceof Promise ? await found : found) as V[];
    if (this.isDisposed) return;
    const current = this.values();
    const chosen = new Set<unknown>(current);
    const set = new Set<unknown>(shown);
    let next = on ? [...current, ...shown.filter((v) => !chosen.has(v))] : current.filter((v) => !set.has(v));
    const max = this.peekProperty<number>('maxSelected') ?? 0;
    if (max > 0 && next.length > max) next = next.slice(0, Math.max(max, current.length));
    this.commit(next, event);
    this.chosenDone();
  }

  // Keys and the pointer.

  private listen(): void {
    const input = this.inputElement;
    const parts = this.tagParts;
    input.addEventListener('input', () => this.typed());
    input.addEventListener('keydown', (e) => this.inputKeyDown(e));
    parts.tags.addEventListener('keydown', (e) => this.tagKeyDown(e));
    parts.tags.addEventListener('click', (e) => {
      const remove = (e.target as Element).closest('.mx-tag-box__remove');
      if (!remove) return;
      e.stopPropagation();
      const tag = remove.closest<HTMLElement>('.mx-tag-box__tag')!;
      this.removeAt(Number(tag.dataset.index), e);
      this.inputElement.focus();
    });
    const box = input.parentElement!;
    // A press in the box, on a tag too, keeps focus in the input.
    box.addEventListener('mousedown', (e) => {
      const target = e.target as Element;
      if (target === input || target.closest('.mx-field__button')) return;
      e.preventDefault();
      input.focus();
    });
    box.addEventListener('click', (e) => {
      const target = e.target as Element;
      if (target.closest('.mx-field__button, .mx-tag-box__tag')) return;
      if (this.peekProperty('openOnFieldClick') !== false) this.openAll();
    });
    this.element.addEventListener('focusout', (e) => {
      const to = e.relatedTarget as Node | null;
      if (to && this.element.contains(to)) return;
      if (!this.inputElement.value) return;
      this.inputElement.value = '';
      this.element.removeAttribute('data-text');
      void this.tagParts.items.search('');
    });
  }

  private typed(): void {
    const parts = this.tagParts;
    const text = this.inputElement.value;
    parts.moved = false;
    this.element.toggleAttribute('data-text', !!text);
    clearTimeout(parts.timer);
    const run = () => {
      void parts.items.search(text);
      if (text.length >= (this.peekProperty<number>('minSearchLength') ?? 0)) {
        if (!this.open()) return;
        this.highlight();
      } else {
        this.close();
      }
    };
    const delay = this.peekProperty<number>('searchDelay') ?? (parts.items.dataSource ? 250 : 0);
    if (delay > 0) parts.timer = setTimeout(run, delay);
    else run();
  }

  /** Opens with every item, as the arrow does. */
  private openAll(): void {
    const parts = this.tagParts;
    if (!this.inputElement.value && parts.items.searchText) void parts.items.search('');
    this.open();
  }

  private inputKeyDown(e: KeyboardEvent): void {
    const parts = this.tagParts;
    const input = this.inputElement;
    const open = !!parts.popup?.isOpen;
    if (e.key === 'ArrowDown' && e.altKey) {
      e.preventDefault();
      this.openAll();
      return;
    }
    if (e.key === 'ArrowUp' && e.altKey) {
      e.preventDefault();
      this.close();
      return;
    }
    if ((e.key === 'Backspace' || e.key === 'ArrowLeft') && !input.value && this.shownTags()) {
      e.preventDefault();
      if (e.key === 'Backspace') this.removeAt(this.values().length - 1, e);
      else this.focusTag(this.shownTags() - 1);
      return;
    }
    if (e.key === 'ArrowLeft' && input.selectionStart === 0 && input.selectionEnd === 0 && this.shownTags()) {
      e.preventDefault();
      this.focusTag(this.shownTags() - 1);
      return;
    }
    if (e.key === 'Escape') {
      if (open) {
        e.preventDefault();
        e.stopPropagation();
        parts.popup?.close('escape');
      } else if (input.value) {
        e.preventDefault();
        e.stopPropagation();
        input.value = '';
        this.element.removeAttribute('data-text');
        void parts.items.search('');
      } else if (this.peekProperty('clearButton') && this.values().length && this.canChange()) {
        e.preventDefault();
        e.stopPropagation();
        this.commit([], e);
      }
      return;
    }
    if (e.key === 'Enter') {
      this.enter(e, open);
      return;
    }
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        this.openAll();
        parts.list?.move(e.key === 'ArrowUp' ? 'last' : 'first');
        parts.moved = true;
        this.pointAt();
      }
      return;
    }
    if (e.key === 'Tab') {
      parts.popup?.close('focus');
      return;
    }
    // Home and End stay with the text; the other list keys move the highlight.
    if (e.key !== 'Home' && e.key !== 'End' && parts.list!.handleKey(e)) {
      parts.moved = true;
      this.pointAt();
    }
  }

  private enter(e: KeyboardEvent, open: boolean): void {
    const parts = this.tagParts;
    const list = parts.list;
    const text = this.inputElement.value.trim();
    const row = open && list && list.activeIndex >= 0 ? list.activeItem : undefined;
    if (row !== undefined) {
      e.preventDefault();
      this.chooseRow(row, e);
      return;
    }
    if (!text) return;
    e.preventDefault();
    const lower = text.toLocaleLowerCase();
    const match = parts.items.loaded.find((item) => this.itemText(item).toLocaleLowerCase() === lower && this.canChoose(item));
    if (match !== undefined) this.toggle(match, e);
    else if (this.peekProperty('acceptCustomValue')) this.addCustom(text, e);
  }

  private focusTag(index: number): void {
    const tag = this.tagAt(Math.max(0, index));
    if (!tag) return;
    this.close();
    tag.focus();
  }

  private tagKeyDown(e: KeyboardEvent): void {
    const tag = (e.target as Element).closest<HTMLElement>('.mx-tag-box__tag[data-index]');
    if (!tag) return;
    const index = Number(tag.dataset.index);
    const count = this.shownTags();
    switch (e.key) {
      case 'ArrowLeft':
        this.focusTag(index - 1);
        break;
      case 'ArrowRight':
        if (index + 1 < count) this.focusTag(index + 1);
        else this.inputElement.focus();
        break;
      case 'Home':
        this.focusTag(0);
        break;
      case 'End':
        this.inputElement.focus();
        break;
      case 'Delete':
      case 'Backspace':
        if (!this.canChange()) return;
        this.removeAt(index, e);
        if (!this.shownTags()) this.inputElement.focus();
        else this.focusTag(e.key === 'Backspace' ? index - 1 : Math.min(index, this.shownTags() - 1));
        break;
      case 'Escape':
        this.inputElement.focus();
        break;
      default:
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) this.inputElement.focus();
        return;
    }
    e.preventDefault();
  }

  // Buttons in the box.

  private renderArrow(): void {
    const parts = this.tagParts;
    if (this.peekProperty('showDropDownButton') === false) {
      parts.arrow?.remove();
      parts.arrow = null;
      return;
    }
    if (parts.arrow) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.tabIndex = -1;
    button.className = 'mx-field__button mx-tag-box__arrow';
    button.setAttribute('aria-label', uiLocale.strings.moreOptions);
    button.append(chevronDown());
    button.addEventListener('mousedown', (e) => e.preventDefault());
    button.addEventListener('click', () => {
      if (this.tagParts.popup?.isOpen) this.close();
      else {
        this.inputElement.focus();
        this.openAll();
      }
    });
    this.area('actions').append(button);
    parts.arrow = button;
  }

  private renderClear(): void {
    const parts = this.tagParts;
    if (!this.peekProperty('clearButton')) {
      parts.clear?.remove();
      parts.clear = null;
      return;
    }
    if (parts.clear) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.tabIndex = -1;
    button.className = 'mx-field__button mx-tag-box__clear';
    button.setAttribute('aria-label', uiLocale.strings.clear);
    button.append(dismissMark());
    button.addEventListener('mousedown', (e) => e.preventDefault());
    button.addEventListener('click', (e) => {
      if (!this.canChange()) return;
      this.commit([], e);
      this.inputElement.focus();
    });
    this.area('tools').append(button);
    parts.clear = button;
  }
}
