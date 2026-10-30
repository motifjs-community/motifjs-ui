import { Emitter, type Bind, type Event as MotifEvent, type IBaseProp } from '@motifx/core';
import type { data } from '@motifx-community/data';
import { follow } from '../../core/follow';
import { functionValue } from '../../core/function-value';
import { chevronDown } from '../../core/glyphs';
import type { IconSource } from '../../core/icon-source';
import { uiLocale } from '../../core/ui-locale';
import { DataItems } from '../../parts/data/DataItems';
import { Field } from '../../parts/field/Field';
import type { ItemField } from '../../parts/list/item-field';
import { OptionList } from '../../parts/list/OptionList';
import { itemOwnValue } from '../../parts/list/item-own-value';
import { readItemField } from '../../parts/list/read-item-field';
import { Popup } from '../../parts/popup/Popup';
import type { PopupCloseReason } from '../../parts/popup/popup-close-reason';
import type { ComboBoxProps } from './combo-box-props';

const OWN = [
  'items',
  'dataSource',
  'placeholder',
  'searchMode',
  'minSearchLength',
  'searchDelay',
  'acceptCustomValue',
  'autoHighlight',
  'showDropDownButton',
  'clearButton',
  'matchWidth',
] as const;

const FUNCTIONS = ['textField', 'valueField', 'iconField', 'groupField', 'enabledField', 'itemTemplate'] as const;

type Template<T> = ((item: T, host: HTMLElement) => (() => void) | void) | null;

const PARTS = Symbol('mx.combobox');

interface Parts<T> {
  items: DataItems<T>;
  popup: Popup | null;
  list: OptionList<T> | null;
  arrow: HTMLButtonElement | null;
  stopLabels: (() => void) | null;
  /** The text was typed since the value was last shown. */
  editing: boolean;
  /** The item of the value, kept when it is on no loaded page. */
  chosen: T | undefined;
  timer: ReturnType<typeof setTimeout> | undefined;
  /** Counts lookups of the value's item, so a late answer for an old value is dropped. */
  lookup: number;
  opened: Emitter<void>;
  closed: Emitter<PopupCloseReason>;
}

/**
 * A text field with a list that follows what is typed (the APG combobox with list autocomplete).
 * The list comes from items in memory or from a `DataSource` of the data layer, searched on the
 * server. Text that matches no item goes back to the chosen one, or becomes the value with
 * `acceptCustomValue`.
 *
 * @example
 * <ComboBox label="&City" items={cities} x-model={() => this.form.city} />
 * <ComboBox label="Customer" dataSource={this.customers} textField="CompanyName" valueField="CustomerID" />
 */
export class ComboBox<T = unknown, V = unknown> extends Field<V | null, ComboBoxProps<T, V>> {
  constructor(props?: IBaseProp<ComboBoxProps<T, V>>) {
    super(props);
    const own = (this.props ?? {}) as ComboBoxProps<T, V>;
    this.element.classList.add('mx-combo-box');
    for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
    for (const name of FUNCTIONS) if (own[name] !== undefined) this.bindProperty(name, functionValue(own[name]));
    if (own.onOpened) this.onOpened(own.onOpened);
    if (own.onClosed) this.onClosed(own.onClosed);

    const parts = this.comboParts;
    this.observeProperty<string>('placeholder', (text) => {
      if (text) this.inputElement.placeholder = text;
      else this.inputElement.removeAttribute('placeholder');
      this.element.toggleAttribute('data-placeholder', !!text);
    });
    this.observeProperty('showDropDownButton', () => this.renderArrow());
    this.observeProperty('clearButton', () => this.renderClear());
    this.observeProperty('dataSource', () => this.renderSource());
    // A value field by name lets a value on no loaded page be asked for by that field.
    this.observeProperty<ItemField<T> | undefined>('valueField', (field) => (parts.items.valueField = typeof field === 'string' ? field : undefined));
    this.observeProperty('searchMode', (mode) => (parts.items.searchMode = mode === 'startswith' ? 'startswith' : 'contains'));
    parts.items.textOf = (item) => this.itemText(item);
    parts.items.onChanged(() => this.itemsChanged());
    // Items given anew are shown; items changed in place wait for `refresh`.
    this.observeProperty<readonly T[] | undefined>('items', (items) => {
      if (!this.peekProperty('dataSource')) parts.items.setArray(items ?? []);
    });
    parts.stopLabels = follow(this, 'labels', () => uiLocale.strings.moreOptions, (label) => parts.arrow?.setAttribute('aria-label', label));
    this.listen();
    this.motif.setDisposable(() => {
      parts.stopLabels?.();
      clearTimeout(parts.timer);
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
  get itemTemplate(): Template<T> {
    return this.getProperty<Template<T> | undefined>('itemTemplate') ?? null;
  }
  set itemTemplate(value: Bind<Template<T>>) {
    this.assignProperty('itemTemplate', functionValue(value));
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
  get autoHighlight(): boolean {
    return this.getProperty<boolean | undefined>('autoHighlight') !== false;
  }
  set autoHighlight(value: Bind<boolean>) {
    this.assignProperty('autoHighlight', value, Boolean);
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
  get matchWidth(): boolean {
    return this.getProperty<boolean | undefined>('matchWidth') !== false;
  }
  set matchWidth(value: Bind<boolean>) {
    this.assignProperty('matchWidth', value, Boolean);
  }

  get inputElement(): HTMLInputElement {
    return this.focusElement as HTMLInputElement;
  }

  /** The item of the value, when it is known. */
  get selectedItem(): T | undefined {
    void this.value;
    return this.comboParts.chosen;
  }

  /** The items the list shows: what matched the last search. */
  get listItems(): DataItems<T> {
    return this.comboParts.items;
  }

  get opened(): boolean {
    return !!this.getProperty<boolean>('opened');
  }
  set opened(value: boolean) {
    if (value) this.open();
    else this.close();
  }

  get onOpened(): MotifEvent<void> {
    return this.comboParts.opened.event;
  }

  get onClosed(): MotifEvent<PopupCloseReason> {
    return this.comboParts.closed.event;
  }

  /** Opens the list; `false` when it cannot be used now. */
  open(): boolean {
    if (!this.isEnabled || this.peekProperty('readOnly')) return false;
    const parts = this.comboParts;
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
    this.comboParts.popup?.close('code');
  }

  /** Empties the value and the text. */
  clear(): void {
    this.choose(undefined, null);
  }

  /**
   * Reads the items again after they were changed in place: the open list and the text of the value. Your items
   * may be plain or reactive; the box reads them as they are.
   */
  override refresh(): void {
    super.refresh();
    const parts = this.comboParts;
    if (parts.items.dataSource) this.itemsChanged();
    else parts.items.setArray(this.peekProperty<readonly T[]>('items') ?? []);
    if (!parts.editing) this.renderValue(this.peekValue());
  }

  protected createControl(): HTMLElement {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'mx-field__input';
    input.autocomplete = 'off';
    input.spellcheck = false;
    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-autocomplete', 'list');
    input.setAttribute('aria-expanded', 'false');
    return input;
  }

  protected emptyValue(): V | null {
    return null;
  }

  protected renderValue(value: V | null): void {
    const parts = this.comboParts;
    if (value === null || value === undefined) {
      parts.chosen = undefined;
      this.showText('');
      return;
    }
    const near = parts.items.findLoaded(value, (item) => this.itemValue(item), (a, b) => this.sameValue(a as V, b as V));
    if (near !== undefined || !parts.items.dataSource) {
      parts.chosen = near;
      this.showText(near === undefined ? this.textOfValue(value) : this.itemText(near));
      return;
    }
    // On no loaded page: asked by key; a later value wins.
    const lookup = ++parts.lookup;
    this.showText(parts.chosen !== undefined && this.sameValue(this.itemValue(parts.chosen) as V, value) ? this.itemText(parts.chosen) : '');
    void parts.items.find(value, (item) => this.itemValue(item)).then((item) => {
      if (lookup !== parts.lookup || this.isDisposed) return;
      parts.chosen = item;
      this.showText(item === undefined ? this.textOfValue(value) : this.itemText(item));
    });
  }

  /** The text shown for a value that has no item. */
  protected textOfValue(value: V | null): string {
    return value === null || value === undefined ? '' : String(value);
  }

  protected itemText(item: T): string {
    return String(readItemField(item, this.peekProperty<ItemField<T>>('textField'), 'text') ?? '');
  }

  protected itemValue(item: T): unknown {
    const field = this.peekProperty<ItemField<T>>('valueField');
    if (field !== undefined) return readItemField(item, field, 'value');
    return itemOwnValue(item);
  }

  /** The value of text that matches no item, with `acceptCustomValue`. */
  protected customValue(text: string): V | null {
    return (text ? text : null) as V | null;
  }

  private get comboParts(): Parts<T> {
    const self = this as unknown as { [PARTS]?: Parts<T> };
    return (self[PARTS] ??= {
      items: new DataItems<T>(),
      popup: null,
      list: null,
      arrow: null,
      stopLabels: null,
      editing: false,
      chosen: undefined,
      timer: undefined,
      lookup: 0,
      opened: new Emitter(),
      closed: new Emitter(),
    });
  }

  private showText(text: string): void {
    const parts = this.comboParts;
    parts.editing = false;
    if (this.inputElement.value !== text) this.inputElement.value = text;
    this.element.toggleAttribute('data-text', !!text);
  }

  private renderSource(): void {
    const parts = this.comboParts;
    const source = this.peekProperty<data.DataSource<T, unknown> | null>('dataSource');
    if (source) parts.items.setDataSource(source);
    else parts.items.setArray(this.peekProperty<readonly T[]>('items') ?? []);
  }

  private listen(): void {
    const input = this.inputElement;
    input.addEventListener('input', () => this.typed());
    input.addEventListener('keydown', (e) => this.keyDown(e));
    input.addEventListener('blur', () => {
      // Leaving for the list (a press on an option) is not leaving.
      if (this.element.contains(document.activeElement)) return;
      if (this.comboParts.editing) this.finish();
    });
  }

  private typed(): void {
    const parts = this.comboParts;
    parts.editing = true;
    this.element.toggleAttribute('data-text', !!this.inputElement.value);
    const text = this.inputElement.value;
    clearTimeout(parts.timer);
    const run = () => {
      void parts.items.search(text);
      if (text.length >= (this.peekProperty<number>('minSearchLength') ?? 0)) this.open();
      else this.close();
    };
    const delay = this.peekProperty<number>('searchDelay') ?? (parts.items.dataSource ? 250 : 0);
    if (delay > 0) parts.timer = setTimeout(run, delay);
    else run();
  }

  /** The user is done with the text: an item that has it, a custom value, or back to the chosen item. */
  private finish(event?: Event): void {
    const parts = this.comboParts;
    const text = this.inputElement.value.trim();
    if (!text) {
      this.choose(undefined, null, event);
      return;
    }
    const lower = text.toLocaleLowerCase();
    const match = parts.items.loaded.find((item) => this.itemText(item).toLocaleLowerCase() === lower && this.canChoose(item));
    if (match !== undefined) this.choose(match, this.itemValue(match) as V, event);
    else if (this.peekProperty('acceptCustomValue')) this.choose(undefined, this.customValue(text), event);
    else this.renderValue(this.peekValue());
  }

  private canChoose(item: T): boolean {
    return readItemField(item, this.peekProperty<ItemField<T>>('enabledField'), 'enabled') !== false;
  }

  private choose(item: T | undefined, value: V | null, event?: Event): void {
    const parts = this.comboParts;
    clearTimeout(parts.timer);
    parts.chosen = item;
    this.commit(value, event);
    this.showText(item !== undefined ? this.itemText(item) : this.textOfValue(value));
    void parts.items.search('');
  }

  private keyDown(e: KeyboardEvent): void {
    const parts = this.comboParts;
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
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        this.openAll();
        if (e.key === 'ArrowUp') parts.list?.move('last');
        this.pointAt();
      } else if (e.key === 'Enter') {
        if (parts.editing) this.finish(e);
      } else if (e.key === 'Escape') {
        if (parts.editing) {
          e.preventDefault();
          e.stopPropagation();
          this.renderValue(this.peekValue());
        } else if (this.peekProperty('clearButton') && this.peekValue() !== null && !this.peekProperty('readOnly')) {
          e.preventDefault();
          e.stopPropagation();
          this.choose(undefined, null, e);
        }
      }
      return;
    }
    const list = parts.list!;
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      parts.popup?.close('escape');
      return;
    }
    if (e.key === 'Enter') {
      const item = list.activeIndex >= 0 ? list.activeItem : undefined;
      e.preventDefault();
      if (item !== undefined && this.canChoose(item)) this.choose(item, this.itemValue(item) as V, e);
      else this.finish(e);
      this.close();
      return;
    }
    if (e.key === 'Tab') {
      const item = list.activeIndex >= 0 && parts.editing ? list.activeItem : undefined;
      if (item !== undefined && this.canChoose(item)) this.choose(item, this.itemValue(item) as V, e);
      else if (parts.editing) this.finish(e);
      parts.popup?.close('focus');
      return;
    }
    // Home and End stay with the text; the other list keys move the highlight.
    if (e.key !== 'Home' && e.key !== 'End' && list.handleKey(e)) this.pointAt();
  }

  /** Opens with every item, as the arrow does. */
  private openAll(): void {
    const parts = this.comboParts;
    if (!parts.editing) void parts.items.search('');
    this.open();
  }

  private itemsChanged(): void {
    const parts = this.comboParts;
    if (parts.popup?.isOpen) {
      this.drawList();
      this.highlight();
      parts.popup.place();
    }
    // The value's item may have come in.
    if (!parts.editing && this.peekValue() !== null && parts.chosen === undefined) this.renderValue(this.peekValue());
  }

  private highlight(): void {
    const parts = this.comboParts;
    const list = parts.list;
    if (!list) return;
    const value = this.peekValue();
    let index = -1;
    if (!parts.editing && value !== null) {
      for (let i = 0; i < list.count; i++) {
        const item = list.itemOf(i);
        if (item !== undefined && this.sameValue(this.itemValue(item) as V, value)) {
          index = i;
          break;
        }
      }
    }
    if (index >= 0) list.setActive(index);
    else if (parts.editing && this.inputElement.value && this.peekProperty('autoHighlight') !== false) list.move('first');
    else list.setActive(-1);
    this.pointAt();
  }

  private pointAt(): void {
    const parts = this.comboParts;
    const list = parts.list;
    if (list && parts.popup?.isOpen && list.activeIndex >= 0) this.inputElement.setAttribute('aria-activedescendant', list.idOf(list.activeIndex));
    else this.inputElement.removeAttribute('aria-activedescendant');
  }

  private drawList(): void {
    const parts = this.comboParts;
    const list = parts.list!;
    const icon = this.peekProperty<ItemField<T>>('iconField');
    const group = this.peekProperty<ItemField<T>>('groupField');
    list.iconOf = icon === undefined ? null : (item) => readItemField(item, icon, 'icon') as IconSource | undefined;
    list.draw = this.peekProperty<Template<T>>('itemTemplate') ?? null;
    if (group !== undefined && !parts.items.dataSource) {
      list.groupOf = (item) => (readItemField(item, group, 'group') as string | undefined) ?? undefined;
      list.setItems(parts.items.loaded);
    } else {
      list.groupOf = null;
      list.setSource(parts.items);
    }
  }

  private createPopup(): Popup {
    const parts = this.comboParts;
    const popup = new Popup();
    popup.matchWidth = this.peekProperty('matchWidth') !== false;
    popup.element.classList.add('mx-combo-box__popup');
    this.controls.add(popup);
    const list = new OptionList<T>();
    list.textOf = (item) => this.itemText(item);
    list.enabledOf = (item) => this.canChoose(item);
    list.isSelected = (item) => this.sameValue(this.itemValue(item) as V, this.peekValue());
    list.emptyText = () => (parts.items.loading ? uiLocale.strings.loading : uiLocale.strings.noItems);
    list.onChosen((e) => {
      this.choose(e.item, this.itemValue(e.item) as V, e.event);
      this.close();
    });
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

  private renderArrow(): void {
    const parts = this.comboParts;
    if (this.peekProperty('showDropDownButton') === false) {
      parts.arrow?.remove();
      parts.arrow = null;
      return;
    }
    if (parts.arrow) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.tabIndex = -1;
    button.className = 'mx-field__button mx-combo-box__arrow';
    button.setAttribute('aria-label', uiLocale.strings.moreOptions);
    button.append(chevronDown());
    button.addEventListener('mousedown', (e) => e.preventDefault());
    button.addEventListener('click', () => {
      if (this.comboParts.popup?.isOpen) this.close();
      else {
        this.inputElement.focus();
        this.openAll();
      }
    });
    this.area('actions').append(button);
    parts.arrow = button;
  }

  private renderClear(): void {
    this.showClearButton(!!this.peekProperty('clearButton'), (e) => this.choose(undefined, null, e), 'mx-combo-box__clear');
  }
}
