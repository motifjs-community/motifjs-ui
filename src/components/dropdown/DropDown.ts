import { Emitter, untracked, type Bind, type Component, type ComponentBase, type Event as MotifEvent, type IBaseProp } from '@motifx/core';
import type { data } from '@motifx-community/data';
import { clearParts, glyphPart, loose, part } from '../../core/draw-parts';
import { flag, kept, mark, put, text as writeText } from '../../core/part-writes';
import { follow } from '../../core/follow';
import { functionValue } from '../../core/function-value';
import type { IconSource } from '../../core/icon-source';
import { uiLocale } from '../../core/ui-locale';
import { DataItems } from '../../parts/data/DataItems';
import { isEmptyKey } from '../../parts/data/empty-key';
import { Field } from '../../parts/field/Field';
import type { ItemField } from '../../parts/list/item-field';
import { OptionList } from '../../parts/list/OptionList';
import type { OptionParts } from '../../parts/list/option-parts';
import { givenList } from '../../core/given-field';
import { itemOwnValue } from '../../parts/list/item-own-value';
import { readItemField } from '../../parts/list/read-item-field';
import { Popup } from '../../parts/popup/Popup';
import type { PopupCloseReason } from '../../parts/popup/popup-close-reason';
import { TextBox } from '../textbox/TextBox';
import type { DropDownProps } from './drop-down-props';
import { onLanguage } from '../../core/on-language';
import { foldText } from '../../core/fold-text';

const OWN = ['items', 'dataSource', 'valueText', 'placeholder', 'searchEnabled', 'searchMode', 'searchDelay', 'clearButton', 'matchWidth'] as const;

/** Props whose value may be a function of its own. */
const FUNCTIONS = ['textField', 'valueField', 'iconField', 'groupField', 'enabledField', 'itemTemplate', 'fieldTemplate'] as const;

type Template<T> = ((item: T, host: ComponentBase<HTMLElement>) => (() => void) | void) | null;

type OptionDrawer<T> = ((item: T, option: OptionParts) => (() => void) | void) | null;

const PARTS = Symbol('mx.dropdown');

/** What the field shows: the value's item or text, a value whose item is still asked for, or a key the source does not have. */
type ValueState = 'shown' | 'loading' | 'missing' | 'failed';

interface Parts<T> {
  textPart: Component<HTMLSpanElement>;
  /** The value's text or the placeholder, written in place. */
  valuePart: Component<HTMLSpanElement>;
  /** The wait's text for screen readers, made the first time the field waits. */
  waitPart: Component<HTMLSpanElement> | null;
  /** Where the app's template draws the value's item, made the first time it does. */
  drawnPart: Component<HTMLSpanElement> | null;
  releaseField: () => void;
  popup: Popup | null;
  list: OptionList<T> | null;
  search: TextBox | null;
  stopList: (() => void) | null;
  /** What the field shows now, and what the open list was drawn from: drawn again only when one of them changes. */
  fieldShown?: unknown[];
  listShown?: unknown[];
  filter: string;
  /** Items from a data source. */
  source: DataItems<T>;
  /** The drawer the rows are drawn with: the list draws its rows again only when it changes. */
  drawnWith?: { drawer: OptionDrawer<T> | undefined; draw: OptionList<T>['draw'] };
  /** The item of the value, kept when it is on no loaded page. */
  chosen: T | undefined;
  lookup: number;
  state: ValueState;
  spinner: Component<HTMLSpanElement> | null;
  stopLanguage: (() => void) | null;
  timer: ReturnType<typeof setTimeout> | undefined;
  opened: Emitter<void>;
  closed: Emitter<PopupCloseReason>;
}

/**
 * Selects one item from a list (the APG select-only combobox). The field shows the selected item, the
 * list opens below it with the keyboard or a click, and it can be searched. Items are plain values,
 * `DropDownItem` objects or custom objects read through `textField` / `valueField`.
 *
 * With a data source, a value that is not on a loaded page is requested by key. In the meantime, the field shows
 * `valueText` if provided, and otherwise it waits (a spinner replaces the arrow and the list stays closed).
 * A key that the source does not have is displayed as is and marked.
 *
 * @example
 * <DropDown label="&City" items={['Ankara', 'İstanbul', 'İzmir']} x-model={() => this.form.city} />
 * <DropDown label="Country" items={() => this.countries} textField="name" valueField="code" searchEnabled />
 */
export class DropDown<T = unknown, V = unknown> extends Field<V | null, DropDownProps<T, V>> {
  constructor(props?: IBaseProp<DropDownProps<T, V>>) {
    super(props);
    const own = (this.props ?? {}) as DropDownProps<T, V>;
    this.class.add('mx-drop-down');
    // Pressed like a button: the field shows its pressed look while held.
    mark(this, 'data-pressable', true);

    this.observeProperty('clearButton', () => this.renderClear());
    this.observeProperty('matchWidth', (on) => {
      if (this.dropParts.popup) this.dropParts.popup.matchWidth = on !== false;
    });
    for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
    for (const name of FUNCTIONS) if (own[name] !== undefined) this.bindProperty(name, functionValue(own[name]));
    if (own.onOpened) this.onOpened(own.onOpened);
    if (own.onClosed) this.onClosed(own.onClosed);

    const parts = this.dropParts;
    glyphPart(this.area('actions'), 'chevron-down', 'mx-drop-down__chevron');
    // The field follows the items given, the value and its own props; the items' fields are read as they are.
    const stopField = follow(
      this,
      'field',
      () => {
        void this.getProperty('textField');
        void this.getProperty('valueField');
        return {
          // A refresh or a choice draws the value again: an app's template reads its item as it is now.
          tick: `${this.getProperty('chosenTick') ?? 0}|${this.getProperty('refreshed') ?? 0}`,
          items: this.items,
          value: this.value,
          valueText: this.getProperty<string | undefined>('valueText') ?? '',
          placeholder: this.getProperty<string | undefined>('placeholder') ?? '',
          template: this.getProperty<Template<T>>('fieldTemplate'),
        };
      },
      ({ tick, items, value, valueText, placeholder, template }) => this.renderField(tick, items, value, valueText, placeholder, template),
    );
    this.observeProperty('dataSource', () => this.renderSource());
    // A value field by name lets a value on no loaded page be asked for by that field.
    this.observeProperty<ItemField<T> | undefined>('valueField', (field) => (parts.source.valueField = typeof field === 'string' ? field : undefined));
    parts.source.onChanged(() => this.sourceChanged());
    this.listen();
    this.motif.setDisposable(() => {
      stopField();
      clearTimeout(parts.timer);
      parts.source.dispose();
      parts.stopList?.();
      parts.stopLanguage?.();
      parts.releaseField();
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
  get dataSource(): data.DataSource<T, unknown> | null {
    return this.getProperty<data.DataSource<T, unknown> | null | undefined>('dataSource') ?? null;
  }
  set dataSource(value: Bind<data.DataSource<T, unknown> | null>) {
    this.assignProperty('dataSource', value);
  }
  get valueText(): string {
    return this.getProperty<string | undefined>('valueText') ?? '';
  }
  set valueText(value: Bind<string>) {
    this.assignProperty('valueText', value);
  }
  get searchDelay(): number {
    return this.getProperty<number | undefined>('searchDelay') ?? (this.dataSource ? 250 : 0);
  }
  set searchDelay(value: Bind<number>) {
    this.assignProperty('searchDelay', value);
  }
  get placeholder(): string {
    return this.getProperty<string | undefined>('placeholder') ?? '';
  }
  set placeholder(value: Bind<string>) {
    this.assignProperty('placeholder', value);
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
  get clearButton(): boolean {
    return !!this.getProperty<boolean>('clearButton');
  }
  set clearButton(value: Bind<boolean>) {
    this.assignProperty('clearButton', value, Boolean);
  }
  get itemTemplate(): Template<T> {
    return this.getProperty<Template<T> | undefined>('itemTemplate') ?? null;
  }
  set itemTemplate(value: Bind<Template<T>>) {
    this.assignProperty('itemTemplate', functionValue(value));
  }
  get fieldTemplate(): Template<T> {
    return this.getProperty<Template<T> | undefined>('fieldTemplate') ?? null;
  }
  set fieldTemplate(value: Bind<Template<T>>) {
    this.assignProperty('fieldTemplate', functionValue(value));
  }
  get matchWidth(): boolean {
    return this.getProperty<boolean | undefined>('matchWidth') !== false;
  }
  set matchWidth(value: Bind<boolean>) {
    this.assignProperty('matchWidth', value, Boolean);
  }

  /** The item whose value matches `value`, when known. */
  get selectedItem(): T | undefined {
    void this.getProperty('chosenTick');
    void this.getProperty('refreshed');
    const items = this.items;
    const value = this.value;
    return untracked(() => this.itemOfValue(items, value));
  }

  /** Indicates whether the list is open. Reactive. Set it to open or close the list. */
  get opened(): boolean {
    return !!this.getProperty<boolean>('opened');
  }
  set opened(value: boolean) {
    if (value) this.open();
    else this.close();
  }

  get onOpened(): MotifEvent<void> {
    return this.dropParts.opened.event;
  }

  get onClosed(): MotifEvent<PopupCloseReason> {
    return this.dropParts.closed.event;
  }

  /**
   * Opens the list, and `search` starts the search box with that text (or jumps to it without one). Returns `false` when
   * it cannot be used.
   */
  open(search?: string): boolean {
    const parts = this.dropParts;
    if (!this.isEnabled || this.peekProperty('readOnly') || parts.state === 'loading') return false;
    if (parts.state === 'failed') this.lookUp(this.peekValue() as V, true);
    const popup = (parts.popup ??= this.createPopup());
    if (popup.isOpen) return true;
    parts.filter = '';
    parts.search?.clear();
    if (parts.source.dataSource && parts.source.searchText) void parts.source.search('');
    this.watchList();
    popup.open(this.boxPart, { returnFocus: this.controlPart });
    this.setProperty('opened', true);
    mark(this, 'data-open', true);
    put(this.controlPart, 'aria-expanded', 'true');
    const list = parts.list!;
    const selected = list.count ? this.indexOfValue() : -1;
    if (selected >= 0) list.setActive(selected);
    else list.move('first');
    this.pointAt(list.activeIndex);
    if (parts.search) parts.search.focus();
    if (search && parts.search) {
      parts.search.value = search;
      parts.search.inputPart.attr.add({ setSelectionRange: [search.length, search.length] });
    } else if (search) this.typeAhead(search);
    parts.opened.fire();
    return true;
  }

  close(): void {
    this.dropParts.popup?.close('code');
  }

  /** Clears the field, as its clear button does. */
  clear(): void {
    this.commit(null);
  }

  /**
   * Re-reads the items after they have been changed in place, and updates the field text and the open list. Your items
   * can be plain or reactive, and the drop-down reads them as they are.
   */
  override refresh(): void {
    super.refresh();
    const parts = this.dropParts;
    this.setProperty('refreshed', (this.peekProperty<number>('refreshed') ?? 0) + 1);
    if (parts.popup?.isOpen) {
      this.drawList();
      parts.popup.place();
    }
  }

  /**
   * For subclasses: draws an option's content into its parts instead of its text. It wins over `itemTemplate`;
   * the open list is drawn again when it changes.
   */
  protected get optionDrawer(): OptionDrawer<T> {
    return this.getProperty<OptionDrawer<T> | undefined>('optionDrawer') ?? null;
  }
  protected set optionDrawer(value: OptionDrawer<T>) {
    this.setProperty('optionDrawer', value);
  }

  /** For subclasses: the popup and its list were created (e.g. to add a header above the list). */
  protected popupCreated(_popup: Popup, _list: OptionList<T>): void {}

  protected createControl(): ComponentBase {
    const control = loose<HTMLDivElement>('div', 'mx-drop-down__display');
    put(control, 'tabindex', '0');
    control.attr.add({ role: 'combobox', 'aria-haspopup': 'listbox', 'aria-expanded': 'false' });
    return control;
  }

  protected emptyValue(): V | null {
    return null;
  }

  protected renderValue(): void {
    // The field effect draws the chosen item; the open list shows it as selected.
    this.dropParts.list?.refresh();
  }

  private get dropParts(): Parts<T> {
    const self = this as unknown as { [PARTS]?: Parts<T> };
    if (!self[PARTS]) {
      const textPart = part<HTMLSpanElement>(this.controlPart, 'span', 'mx-drop-down__text');
      self[PARTS] = {
        textPart,
        valuePart: part<HTMLSpanElement>(textPart, 'span', 'mx-drop-down__value'),
        waitPart: null,
        drawnPart: null,
        releaseField: () => {},
        popup: null,
        list: null,
        search: null,
        stopList: null,
        filter: '',
        source: new DataItems<T>(),
        chosen: undefined,
        lookup: 0,
        state: 'shown',
        spinner: null,
        stopLanguage: null,
        timer: undefined,
        opened: new Emitter(),
        closed: new Emitter(),
      };
    }
    return self[PARTS]!;
  }

  private itemText(item: T): string {
    return String(readItemField(item, this.peekProperty<ItemField<T>>('textField'), 'text') ?? '');
  }

  private itemValue(item: T): unknown {
    const field = this.peekProperty<ItemField<T>>('valueField');
    if (field !== undefined) return readItemField(item, field, 'value');
    return itemOwnValue(item);
  }

  private indexOfValue(): number {
    const value = this.peekValue();
    const list = this.dropParts.list;
    if (this.dropParts.source.dataSource && list) {
      for (let i = 0; i < list.count; i++) {
        const item = list.itemOf(i);
        if (item !== undefined && this.sameValue(this.itemValue(item) as V | null, value)) return i;
      }
      return -1;
    }
    return this.visibleItems().findIndex((item) => this.sameValue(this.itemValue(item) as V | null, value));
  }

  /** The item of `value`: among the items in memory, or the one known from a data source (asked by key when needed). */
  private itemOfValue(items: readonly T[], value: V | null): T | undefined {
    const parts = this.dropParts;
    const same = (item: T) => this.sameValue(this.itemValue(item) as V | null, value);
    if (!parts.source.dataSource) return givenList(items).find(same);
    // An empty text is no value, as the data source counts it: nothing to ask for.
    if (isEmptyKey(value)) return undefined;
    if (parts.chosen !== undefined && same(parts.chosen)) return parts.chosen;
    const near = parts.source.findLoaded(value, (item) => this.itemValue(item), (a, b) => this.sameValue(a as V, b as V));
    if (near !== undefined) return near;
    // Known from an earlier request, here or in another list over the same source.
    const known = parts.source.known(value);
    if (known?.item !== undefined) return known.item;
    if (known?.state !== 'found' && known?.state !== 'missing') this.lookUp(value);
    return undefined;
  }

  /** Asks the data source for the item of `value` (`again`: after its request failed); the field shows the answer. */
  private lookUp(value: V, again = false): void {
    const parts = this.dropParts;
    const lookup = ++parts.lookup;
    const asked = again ? parts.source.retry(value) : parts.source.find(value, (item) => this.itemValue(item));
    void asked.then((item) => {
      if (lookup !== parts.lookup || this.isDisposed) return;
      if (item !== undefined) parts.chosen = item;
      this.setProperty('chosenTick', lookup);
    });
  }

  /** What the field shows for `value` and its text. */
  private valueLook(items: readonly T[], value: V | null, valueText: string): { item?: T; text: string; state: ValueState } {
    const item = this.itemOfValue(items, value);
    if (item !== undefined) return { item, text: this.itemText(item), state: 'shown' };
    if (isEmptyKey(value)) return { text: '', state: 'shown' };
    const parts = this.dropParts;
    if (!parts.source.dataSource) return { text: String(value), state: 'shown' };
    const known = parts.source.known(value);
    if (known?.state === 'found') return { text: known.text ?? valueText, state: 'shown' };
    if (known?.state === 'missing') return { text: valueText || String(value), state: known.failed ? 'failed' : 'missing' };
    return valueText ? { text: valueText, state: 'shown' } : { text: '', state: 'loading' };
  }

  private renderSource(): void {
    const parts = this.dropParts;
    const source = this.peekProperty<data.DataSource<T, unknown> | null>('dataSource');
    if (source) {
      parts.source.setDataSource(source);
      parts.source.textOf = (item) => this.itemText(item);
    } else {
      parts.source.setArray([]);
    }
    this.setProperty('chosenTick', -1);
  }

  private sourceChanged(): void {
    const parts = this.dropParts;
    if (!parts.source.dataSource) return;
    if (parts.popup?.isOpen) {
      this.drawList();
      const list = parts.list!;
      if (list.activeIndex < 0) {
        const at = this.indexOfValue();
        if (at >= 0) list.setActive(at);
        else list.move('first');
      }
      this.pointAt(list.activeIndex);
      parts.popup.place();
    }
    // The value's item may be among the rows that came in.
    if (parts.chosen === undefined && this.peekValue() !== null) this.setProperty('chosenTick', parts.lookup + 0.5);
  }

  private visibleItems(): readonly T[] {
    const items = givenList(this.peekProperty<readonly T[]>('items'));
    const filter = foldText(this.dropParts.filter.trim());
    if (!filter) return items;
    const starts = this.peekProperty('searchMode') === 'startswith';
    return items.filter((item) => {
      const text = foldText(this.itemText(item));
      return starts ? text.startsWith(filter) : text.includes(filter);
    });
  }

  private listen(): void {
    const parts = this.dropParts;
    this.controlPart.motif.on('keydown', (_, e) => this.displayKeyDown(e));
    // The box's buttons (the clear button, the buttons given) do their own work.
    const onButton = (e: Event) => this.boxButtons.some((button) => button.motif.isEventFrom(e));
    // A click anywhere else in the box toggles the list; focus stays on the field.
    this.boxPart.motif.on('mousedown', (_, e) => {
      // A press on the field itself, not on its text, focuses it as any press does.
      if (onButton(e) || (this.controlPart.motif.isEventFrom(e) && !parts.textPart.motif.isEventFrom(e))) return;
      e.preventDefault();
      this.focus();
    });
    this.boxPart.motif.on('click', (_, e) => {
      if (onButton(e)) return;
      if (parts.popup?.isOpen) this.close();
      else this.open();
    });
  }

  private displayKeyDown(e: KeyboardEvent): void {
    const parts = this.dropParts;
    const open = !!parts.popup?.isOpen;
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ' || e.key === 'Home' || e.key === 'End') {
        e.preventDefault();
        if (!this.open()) return;
        if (e.key === 'Home' || e.key === 'ArrowUp') parts.list!.move('first');
        if (e.key === 'End') parts.list!.move('last');
        this.pointAt(parts.list!.activeIndex);
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey && e.key !== ' ') {
        if (!this.open()) return;
        this.typeAhead(e.key);
      } else if (e.key === 'Escape' && this.peekProperty('clearButton') && !this.isEmptyValue(this.peekValue()) && !this.peekProperty('readOnly') && parts.state !== 'loading') {
        e.preventDefault();
        e.stopPropagation();
        this.commit(null, e);
      }
      return;
    }
    this.listKeyDown(e, true);
  }

  /** Keys while the list is open, from the field or the search box. */
  private listKeyDown(e: KeyboardEvent, fromField: boolean): void {
    const list = this.dropParts.list!;
    if (e.key === 'Escape') {
      // Handled here: a window around the field must not close too.
      e.preventDefault();
      e.stopPropagation();
      this.dropParts.popup?.close('escape');
      return;
    }
    if ((e.key === 'ArrowUp' && e.altKey) || e.key === 'Tab' || (fromField && e.key === ' ')) {
      const item = list.activeItem;
      if (e.key !== 'Tab') e.preventDefault();
      if (item !== undefined && list.activeIndex >= 0) this.choose(item, e, e.key !== 'Tab');
      else if (e.key !== 'Tab') this.close();
      else this.dropParts.popup?.close('focus');
      return;
    }
    if (list.handleKey(e)) {
      this.pointAt(list.activeIndex);
      return;
    }
    if (fromField && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) this.typeAhead(e.key);
  }

  private typeAhead(key: string): void {
    const list = this.dropParts.list!;
    const index = list.typeAhead(key);
    if (index >= 0) list.setActive(index);
    this.pointAt(list.activeIndex);
  }

  private pointAt(index: number): void {
    const parts = this.dropParts;
    const id = index >= 0 && parts.list ? parts.list.idOf(index) : null;
    put(this.controlPart, 'aria-activedescendant', id && parts.popup?.isOpen ? id : null);
    const input = parts.search?.inputPart;
    if (!input) return;
    put(input, 'aria-activedescendant', id && parts.popup?.isOpen ? id : null);
  }

  private choose(item: T, event: Event, refocus = true): void {
    this.dropParts.chosen = item;
    this.commit(this.itemValue(item) as V | null, event);
    if (refocus) this.close();
    else this.dropParts.popup?.close('focus');
  }

  private createPopup(): Popup {
    const parts = this.dropParts;
    const popup = new Popup();
    popup.matchWidth = this.peekProperty('matchWidth') !== false;
    popup.class.add('mx-drop-down__popup');
    this.controls.add(popup);
    if (this.peekProperty('searchEnabled')) {
      const search = new TextBox({ type: 'search', labelMode: 'hidden', stretch: true, autocomplete: 'off' });
      onLanguage(search, () => {
        search.label = uiLocale.strings.search;
        search.placeholder = uiLocale.strings.search;
      });
      search.class.add('mx-drop-down__search');
      search.onValueChanged((e) => {
        parts.filter = e.value;
        if (parts.source.dataSource) {
          clearTimeout(parts.timer);
          const delay = this.peekProperty<number>('searchDelay') ?? 250;
          parts.timer = setTimeout(() => {
            this.dropParts.list?.setActive(-1);
            void parts.source.search(e.value);
          }, delay);
          return;
        }
        this.drawList();
        this.dropParts.list!.move('first');
        this.pointAt(this.dropParts.list!.activeIndex);
      });
      // The input's keys reach the search box.
      search.motif.on('keydown', (_, e) => this.listKeyDown(e, false));
      popup.controls.add(search);
      parts.search = search;
    }
    const list = new OptionList<T>();
    list.textOf = (item) => this.itemText(item);
    list.enabledOf = (item) => readItemField(item, this.peekProperty<ItemField<T>>('enabledField'), 'enabled') !== false;
    list.isSelected = (item) => this.sameValue(this.itemValue(item) as V | null, this.peekValue());
    // A list from a data source says it is loading until its rows arrive, not that there are none.
    list.emptyText = () => (parts.source.loading ? uiLocale.strings.loading : uiLocale.strings.noItems);
    list.onChosen((e) => this.choose(e.item, e.event));
    popup.controls.add(list);
    parts.list = list;
    put(this.controlPart, 'aria-controls', list.id);
    if (parts.search) put(parts.search.inputPart, 'aria-controls', list.id);
    this.popupCreated(popup, list);
    popup.onClosed((reason) => {
      parts.stopList?.();
      parts.stopList = null;
      this.setProperty('opened', false);
      mark(this, 'data-open', false);
      put(this.controlPart, 'aria-expanded', 'false');
      this.pointAt(-1);
      parts.closed.fire(reason);
    });
    return popup;
  }

  /** While open, the list follows the items and their fields. */
  private watchList(): void {
    const parts = this.dropParts;
    parts.stopList?.();
    parts.listShown = undefined;
    parts.stopList = follow(
      this,
      'list',
      () => [this.items, this.getProperty('textField'), this.getProperty('iconField'), this.getProperty('groupField'), this.getProperty('itemTemplate'), this.getProperty('optionDrawer')],
      (looks) => {
        // A `reState()` that finds the same items and fields leaves the list as it is.
        const same = parts.listShown?.length === looks.length && looks.every((v, i) => Object.is(v, parts.listShown![i]));
        parts.listShown = looks;
        if (same) return;
        this.drawList();
        parts.popup?.place();
      },
    );
  }

  private drawList(): void {
    const parts = this.dropParts;
    const list = parts.list!;
    const icon = this.peekProperty<ItemField<T>>('iconField');
    const group = this.peekProperty<ItemField<T>>('groupField');
    list.iconOf = icon === undefined ? null : (item) => readItemField(item, icon, 'icon') as IconSource | undefined;
    list.groupOf = group === undefined ? null : (item) => (readItemField(item, group, 'group') as string | undefined) ?? undefined;
    // A subclass's drawer gets the option's parts; the app's template gets the item and its place only.
    const drawer = this.peekProperty<OptionDrawer<T> | undefined>('optionDrawer');
    const template = this.peekProperty<Template<T>>('itemTemplate');
    if (!drawer) list.draw = template ?? null;
    else if (parts.drawnWith?.drawer === drawer) list.draw = parts.drawnWith.draw;
    else {
      parts.drawnWith = { drawer, draw: (item, _host, option) => drawer(item, option) };
      list.draw = parts.drawnWith.draw;
    }
    if (parts.source.dataSource) {
      list.groupOf = null;
      list.setSource(parts.source);
      return;
    }
    const active = list.activeItem;
    list.setItems(this.visibleItems());
    if (active !== undefined) {
      const at = this.visibleItems().indexOf(active);
      if (at >= 0) list.setActive(at, false);
    }
  }

  /** The value in the field: what shows it changes only when it does, the marks and the title as they are. */
  private renderField(tick: string, items: readonly T[], value: V | null, valueText: string, placeholder: string, template: Template<T>): void {
    const parts = this.dropParts;
    const { item, text, state } = this.valueLook(items, value, valueText);
    const shown = [tick, item, text, state, placeholder, template];
    const same = parts.fieldShown?.length === shown.length && shown.every((v, i) => Object.is(v, parts.fieldShown![i]));
    parts.fieldShown = shown;
    if (same) return;
    parts.releaseField();
    parts.releaseField = () => {};
    parts.state = state;
    const loading = state === 'loading';
    const empty = item === undefined && !text && !loading;
    mark(parts.textPart, 'data-placeholder', empty);
    mark(parts.textPart, 'data-missing', state === 'missing' || state === 'failed');
    mark(this, 'data-loading', loading);
    flag(this.controlPart, 'aria-busy', loading);
    if (state !== 'shown') this.followLanguage();
    // The kit's parts stay and are written in place; only what the app's template drew goes, drawn for the new item.
    const drawn = !loading && item !== undefined && !!template;
    if (loading && !parts.waitPart) parts.waitPart = part<HTMLSpanElement>(parts.textPart, 'span', 'mx-sr-only');
    if (parts.waitPart) {
      if (loading) writeText(parts.waitPart, uiLocale.strings.loading);
      kept(parts.waitPart, loading);
    }
    if (loading) this.addSpinner();
    if (drawn && !parts.drawnPart) parts.drawnPart = part<HTMLSpanElement>(parts.textPart, 'span', 'mx-drop-down__drawn');
    if (parts.drawnPart) {
      clearParts(parts.drawnPart);
      parts.drawnPart.setText('');
      if (drawn) parts.releaseField = template!(item as T, parts.drawnPart) ?? (() => {});
      kept(parts.drawnPart, drawn);
    }
    writeText(parts.valuePart, loading || drawn ? '' : empty ? placeholder : text);
    kept(parts.valuePart, !loading && !drawn);
    if (state === 'missing' || state === 'failed') put(parts.textPart, 'title', state === 'failed' ? uiLocale.strings.loadFailed : uiLocale.strings.notInList);
    else put(parts.textPart, 'title', null);
    mark(this, 'data-placeholder', !!placeholder);
  }

  /** The texts of the wait and of a missing key are the kit's: the field draws them again when its language changes. */
  private followLanguage(): void {
    const parts = this.dropParts;
    if (parts.stopLanguage) return;
    const changed = uiLocale.onChanged(() => {
      if (!this.isDisposed && parts.state !== 'shown') this.setProperty('refreshed', (this.peekProperty<number>('refreshed') ?? 0) + 1);
    });
    parts.stopLanguage = () => changed.dispose();
  }

  /** The spinner in the arrow's place while the value's item is requested; made the first time it is needed. */
  private addSpinner(): void {
    const parts = this.dropParts;
    if (parts.spinner) return;
    parts.spinner = part<HTMLSpanElement>(this.area('actions'), 'span', 'mx-drop-down__spinner');
    parts.spinner.attr.add({ 'aria-hidden': 'true' });
  }

  private renderClear(): void {
    this.showClearButton(
      !!this.peekProperty('clearButton'),
      (e) => {
        if (this.dropParts.state !== 'loading') this.commit(null, e);
      },
      'mx-drop-down__clear',
    );
  }
}
