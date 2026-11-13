import { Emitter, createSignal, untracked, type Bind, type Component, type ComponentBase, type Event as MotifEvent, type IBaseProp, type Signal } from '@motifx/core';
import type { data } from '@motifx-community/data';
import { glyphPart, loose, part, partBefore, removePart } from '../../core/draw-parts';
import { focusGoesInto, focusOn } from '../../core/focus';
import { kept, mark, put, text as writeText } from '../../core/part-writes';
import { functionValue } from '../../core/function-value';
import type { IconSource } from '../../core/icon-source';
import { uiLocale } from '../../core/ui-locale';
import { DataItems } from '../../parts/data/DataItems';
import { Field } from '../../parts/field/Field';
import { pressedFocusable } from '../../parts/field/pressed-focusable';
import type { ItemField } from '../../parts/list/item-field';
import type { OptionChosenEventArgs } from '../../parts/list/option-chosen-event-args';
import type { OptionParts } from '../../parts/list/option-parts';
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
import { onLanguage } from '../../core/on-language';
import { foldText } from '../../core/fold-text';

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

/** A value's tag: made when the value is chosen, kept while it stays, its texts written in place. */
interface TagSlot {
  tag: Component<HTMLDivElement>;
  label: Component<HTMLSpanElement>;
  remove: Component<HTMLButtonElement>;
  /** The text written in the label, `null` while a template draws it. */
  text: string | null;
  /** The item and template the label is drawn with. */
  item: unknown;
  template: unknown;
  release?: () => void;
}

interface Parts<T> {
  items: DataItems<T>;
  rows: ListRows<T>;
  known: ValueItems<T>;
  chosen: Set<unknown>;
  tags: Component<HTMLDivElement>;
  /** The tags shown, in the order of the values, with their remove buttons. */
  shownTags: { tag: Component<HTMLDivElement>; remove: Component<HTMLButtonElement> }[];
  /** The "+3" tag, while some values have no tag of their own. */
  more: Component<HTMLDivElement> | null;
  /** The "+3" tag, made once when first needed. */
  moreTag: Component<HTMLDivElement> | null;
  /** The tags of the values, by value (a value given twice has two). */
  slots: Map<unknown, TagSlot[]>;
  /** The parts in the tag list, in order; the list follows `drawn`. */
  tagList: ComponentBase[];
  drawn: Signal<number>;
  popup: Popup | null;
  list: OptionList<T | SelectAllRow> | null;
  /** The "Select all" rows drawn: the list draws its rows again when they change or scroll into view. */
  allRows: Set<OptionParts>;
  /** What the rows are drawn with: the list draws its rows again only when it changes. */
  drawnWith?: { withAll: boolean; template: ItemTemplate<T> | null };
  arrow: Component<HTMLButtonElement> | null;
  clear: Component<HTMLButtonElement> | null;
  /** Clicks on a tag or a button, told before their own listeners run: a click can take its part away. */
  partClicks: WeakSet<Event>;
  /** The text typed in the input. */
  text: string;
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
 * Selects several items: the selected ones appear as tags in the field, followed by a text input that
 * searches the list (the APG combobox with a multi-select listbox). Items come from memory or from
 * a `DataSource`, and with `acceptCustomValue`, typed text can become a custom tag.
 *
 * @example
 * <TagBox label="&Skills" items={skills} x-model={() => this.form.skills} />
 * <TagBox label="Customers" dataSource={this.customers} textField="CompanyName" valueField="CustomerID" maxTags={3} />
 */
export class TagBox<T = unknown, V = unknown> extends Field<V[], TagBoxProps<T, V>> {
  constructor(props?: IBaseProp<TagBoxProps<T, V>>) {
    super(props);
    const own = (this.props ?? {}) as TagBoxProps<T, V>;
    this.class.add('mx-tag-box');
    for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
    for (const name of FUNCTIONS) if (own[name] !== undefined) this.bindProperty(name, functionValue(own[name]));
    if (own.onOpened) this.onOpened(own.onOpened);
    if (own.onClosed) this.onClosed(own.onClosed);

    const parts = this.tagParts;
    this.boxPart.controls.insert(this.boxPart.controls.items.indexOf(this.controlPart), parts.tags);
    // Built once: the list holds the tags of the values, made when a value comes and taken out when it goes.
    parts.tags.bindings.list(
      () => {
        void parts.drawn.value;
        return untracked(() => parts.tagList);
      },
      (c: ComponentBase) => c
    );
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
    const stopLocale = onLanguage(this, () => {
      const strings = uiLocale.strings;
      if (parts.arrow) put(parts.arrow, 'aria-label', strings.moreOptions);
      if (parts.clear) put(parts.clear, 'aria-label', strings.clear);
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
      for (const slot of [...parts.slots.values()].flat()) slot.release?.();
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

  /** The text input as a component: write its attributes with `put` and call its methods through `attr`. */
  get inputPart(): ComponentBase<HTMLInputElement> {
    return this.controlPart as ComponentBase<HTMLInputElement>;
  }

  /** The known items for the selected values. Reactive. */
  get selectedItems(): T[] {
    void this.value;
    void this.getProperty('found');
    const parts = this.tagParts;
    return [...parts.chosen].map((value) => parts.known.itemOf(value)).filter((item): item is T => item !== undefined);
  }

  /** The items shown in the list, which are the results of the last search. */
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

  /** Opens the list. Returns `false` when it cannot be used. */
  open(): boolean {
    if (!this.canChange()) return false;
    const parts = this.tagParts;
    const popup = (parts.popup ??= this.createPopup());
    if (popup.isOpen) return true;
    this.drawList();
    popup.open(this.boxPart, { returnFocus: this.controlPart });
    this.setProperty('opened', true);
    mark(this, 'data-open', true);
    put(this.controlPart, 'aria-expanded', 'true');
    this.highlight();
    parts.opened.fire();
    return true;
  }

  close(): void {
    this.tagParts.popup?.close('code');
  }

  /**
   * Re-reads the items after they have been changed in place, and updates the tags, the open list and the selected
   * items. Your items can be plain or reactive, and the box reads them as they are.
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

  /** Removes all tags. */
  clear(): void {
    this.commit([]);
  }

  /** Selects every item the list shows, up to `maxSelected` (with a data source, after they load). */
  selectAllItems(): Promise<void> {
    return this.chooseAll(true);
  }

  protected override get controlTag(): string {
    return 'input';
  }

  protected createControl(): ComponentBase {
    const control = loose<HTMLInputElement>('input', 'mx-field__input mx-tag-box__input');
    control.attr.add({ type: 'text', autocomplete: 'off', spellcheck: 'false', role: 'combobox', 'aria-autocomplete': 'list', 'aria-expanded': 'false' });
    return control;
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
      this.markSelectAll();
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
      const tags = loose<HTMLDivElement>('div', 'mx-tag-box__tags');
      tags.attr.add({ role: 'list' });
      kept(tags, false);
      self[PARTS] = {
        items,
        rows: new ListRows(items),
        known: new ValueItems(items),
        chosen: new Set(),
        tags,
        shownTags: [],
        more: null,
        moreTag: null,
        slots: new Map(),
        tagList: [],
        drawn: createSignal(0),
        popup: null,
        list: null,
        allRows: new Set(),
        arrow: null,
        clear: null,
        partClicks: new WeakSet(),
        text: '',
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
    const values = this.values();
    const max = this.peekProperty<number>('maxTags') ?? 0;
    const shown = max > 0 && values.length > max ? max : values.length;
    // Only the tags shown are requested by key.
    parts.known.lookUp(values.slice(0, shown), () => {
      if (this.isDisposed) return;
      this.renderTags();
      this.setProperty('found', (this.peekProperty<number>('found') ?? 0) + 1);
    });
    // A value keeps its tag; a tag whose value went is taken out by the list.
    const old = parts.slots;
    const slots = new Map<unknown, TagSlot[]>();
    const list: ComponentBase[] = [];
    parts.shownTags = [];
    for (let i = 0; i < shown; i++) {
      const value = values[i];
      const slot = old.get(value)?.shift() ?? this.makeTag();
      const same = slots.get(value);
      if (same) same.push(slot);
      else slots.set(value, [slot]);
      this.writeTag(slot, value);
      parts.shownTags.push({ tag: slot.tag, remove: slot.remove });
      list.push(slot.tag);
    }
    for (const slot of [...old.values()].flat()) slot.release?.();
    parts.slots = slots;
    parts.more = null;
    if (shown < values.length && !parts.moreTag) {
      parts.moreTag = loose<HTMLDivElement>('div', 'mx-tag-box__tag mx-tag-box__more');
      parts.moreTag.attr.add({ role: 'listitem' });
    }
    // Once made, it stays last in the list, kept out of the page while every value has a tag.
    if (parts.moreTag) list.push(parts.moreTag);
    if (shown < values.length && parts.moreTag) {
      const more = parts.moreTag;
      writeText(more, uiLocale.strings.moreItems.replace('{count}', String(values.length - shown)));
      const rest = values.slice(shown);
      put(
        more,
        'title',
        rest
          .slice(0, TITLE_TEXTS)
          .map((value) => this.tagText(value))
          .concat(rest.length > TITLE_TEXTS ? ['…'] : [])
          .join(', ')
      );
      parts.more = more;
    }
    parts.tagList = list;
    untracked(() => parts.drawn.value++);
    if (parts.moreTag) kept(parts.moreTag, !!parts.more);
    kept(parts.tags, !!values.length);
    const placeholder = this.peekProperty<string>('placeholder') ?? '';
    if (placeholder && !values.length) put(this.controlPart, 'placeholder', placeholder);
    else put(this.controlPart, 'placeholder', null);
    mark(this, 'data-placeholder', !!placeholder && !values.length);
  }

  private tagText(value: V): string {
    const parts = this.tagParts;
    const item = parts.known.itemOf(value);
    if (item !== undefined) return this.itemText(item);
    return parts.known.isAsking(value) ? uiLocale.strings.loading : this.textOfValue(value);
  }

  private makeTag(): TagSlot {
    const tag = loose<HTMLDivElement>('div', 'mx-tag-box__tag');
    tag.attr.add({ role: 'listitem' });
    put(tag, 'tabindex', '-1');
    const label = part<HTMLSpanElement>(tag, 'span', 'mx-tag-box__tag-text');
    const remove = part<HTMLButtonElement>(tag, 'button', 'mx-tag-box__remove');
    remove.attr.add({ type: 'button' });
    put(remove, 'tabindex', '-1');
    glyphPart(remove, 'dismiss');
    return { tag, label, remove, text: null, item: undefined, template: null };
  }

  /** Writes what the tag shows of `value`; its label is drawn again only when its item or the template changes. */
  private writeTag(slot: TagSlot, value: V): void {
    const parts = this.tagParts;
    const item = parts.known.itemOf(value);
    const text = this.tagText(value);
    mark(slot.tag, 'data-loading', item === undefined && parts.known.isAsking(value));
    put(slot.remove, 'aria-label', uiLocale.strings.removeItem.replace('{text}', text));
    const template = item !== undefined ? this.peekProperty<ItemTemplate<T> | null>('tagTemplate') : null;
    if (template) {
      if (slot.text === null && slot.item === item && slot.template === template) return;
      this.freshLabel(slot);
      slot.item = item;
      slot.template = template;
      slot.release = template(item as T, slot.label) || undefined;
      return;
    }
    if (slot.text === null && slot.template) this.freshLabel(slot);
    slot.item = item;
    slot.template = null;
    if (slot.text !== text) slot.label.setText(text);
    slot.text = text;
  }

  /** A new label for a template to draw in, the one drawn before taken out. */
  private freshLabel(slot: TagSlot): void {
    slot.release?.();
    slot.release = undefined;
    removePart(slot.label);
    slot.label = partBefore<HTMLSpanElement>(slot.tag, slot.remove, 'span', 'mx-tag-box__tag-text');
    slot.text = null;
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
    popup.class.add('mx-tag-box__popup');
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
    list.onChosen((e) => this.chosen(e));
    popup.controls.add(list);
    parts.list = list;
    put(this.controlPart, 'aria-controls', list.id);
    popup.onClosed((reason) => {
      this.setProperty('opened', false);
      mark(this, 'data-open', false);
      put(this.controlPart, 'aria-expanded', 'false');
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
    // The list writes the items' texts itself; a template, or a "Select all" row to mark, is drawn here. The drawing is
    // made anew only when what it draws with changes, so the rows are not drawn again with every change of the items.
    const template = this.peekProperty<ItemTemplate<T> | null>('itemTemplate') ?? null;
    const drawn = parts.drawnWith;
    if (!drawn || drawn.withAll !== withAll || drawn.template !== template) {
      parts.drawnWith = { withAll, template };
      list.draw = withAll || template ? (row, host, option) => this.drawRow(row, host, option, template) : null;
    }
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
    this.pointAt();
  }

  /** Draws a row's content when the list leaves it to the box: with a template, or with a "Select all" row, kept to be marked. */
  private drawRow(row: T | SelectAllRow, host: ComponentBase<HTMLElement>, option: OptionParts, template: ItemTemplate<T> | null): (() => void) | void {
    const list = this.tagParts.list!;
    if (row === selectAllRow) {
      // Bound, written in place when the items are given again or the language changes.
      const release = list.bindText(option, () => uiLocale.strings.selectAll);
      this.keepSelectAllRow(option);
      return release;
    }
    if (template) return template(row as T, host);
    return list.bindText(option, () => this.itemText(row as T));
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

  /** Keeps a "Select all" row the list drew, to mark it again when the selection changes. */
  private keepSelectAllRow(option: OptionParts): void {
    this.tagParts.allRows.add(option);
    this.markSelectAll();
  }

  /** Marks the "Select all" rows drawn, letting go of those the list took away. */
  private markSelectAll(): void {
    const rows = this.tagParts.allRows;
    for (const option of rows) if (option.row.isDisposed) rows.delete(option);
    if (!rows.size) return;
    const state = this.allState();
    for (const option of rows) this.markSelectAllRow(option, state);
  }

  /** The "Select all" row is chosen when every item is, and shows a dash when some are. */
  private markSelectAllRow(option: OptionParts, state: boolean | 'mixed'): void {
    const row = option.row;
    mark(row, 'data-select-all', true);
    put(row, 'aria-selected', String(state === true));
    mark(row, 'data-selected', state !== false);
    mark(row, 'data-mixed', state === 'mixed');
    if (option.check) put(option.check, 'data-icon', state === 'mixed' ? 'dash' : 'check');
  }

  /** While typing, the first match is highlighted so Enter takes it. */
  private highlight(): void {
    const parts = this.tagParts;
    const list = parts.list;
    if (!list) return;
    const auto = this.peekProperty<boolean>('autoHighlight') ?? !this.peekProperty('acceptCustomValue');
    if (parts.text && auto) {
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
    if (list && parts.popup?.isOpen && list.activeIndex >= 0) put(this.controlPart, 'aria-activedescendant', list.idOf(list.activeIndex));
    else put(this.controlPart, 'aria-activedescendant', null);
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
    if (parts.text) this.clearText();
    if (this.peekProperty('closeOnSelect')) this.close();
  }

  /** Empties the input, and the search with it. */
  private clearText(): void {
    const parts = this.tagParts;
    parts.text = '';
    this.controlPart.attr.add({ value: '' });
    mark(this, 'data-text', false);
    void parts.items.search('');
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
    const parts = this.tagParts;
    this.controlPart.motif.on('input', (_, e) => this.typed((e.target as HTMLInputElement).value));
    this.controlPart.motif.on('keydown', (_, e: KeyboardEvent) => this.inputKeyDown(e));
    parts.tags.motif.on('keydown', (_, e: KeyboardEvent) => this.tagKeyDown(e));
    parts.tags.motif.on('click', (_, e: MouseEvent) => {
      const index = parts.shownTags.findIndex((shown) => shown.remove.motif.isEventFrom(e));
      if (index < 0) return;
      e.stopPropagation();
      this.removeAt(index, e);
      this.focus();
    });
    // A click in the box, on a tag too, keeps focus in the input; the input and the buttons handle their own clicks.
    this.boxPart.motif.on('mousedown', (_, e: MouseEvent) => {
      if (this.controlPart.motif.isEventFrom(e) || this.fromButton(e)) return;
      e.preventDefault();
      this.focus();
    });
    // Where a click started is told before the tags and the buttons handle it: their own click can take them away.
    this.boxPart.motif.on('click:capture', (_, e: MouseEvent) => {
      const onTag = parts.shownTags.some((shown) => shown.tag.motif.isEventFrom(e)) || !!parts.more?.motif.isEventFrom(e);
      if (onTag || this.fromButton(e)) parts.partClicks.add(e);
    });
    this.boxPart.motif.on('click', (_, e: MouseEvent) => {
      if (parts.partClicks.has(e)) return;
      if (this.peekProperty('openOnFieldClick') !== false) this.openAll();
    });
    // Leaving with text typed starts the text and the search again.
    this.motif.on('focusout', (_, e: FocusEvent) => {
      if (parts.text && !focusGoesInto(this, e)) this.clearText();
    });
  }

  /**
   * Whether an event came from a button in the box (the arrow, the clear button, the buttons given): a part outside the
   * input and the tags that takes focus itself.
   */
  private fromButton(e: Event): boolean {
    return !this.tagParts.tags.motif.isEventFrom(e) && !this.controlPart.motif.isEventFrom(e) && pressedFocusable(this.boxPart, e);
  }

  private typed(text: string): void {
    const parts = this.tagParts;
    parts.text = text;
    parts.moved = false;
    mark(this, 'data-text', !!text);
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
    if (!parts.text && parts.items.searchText) void parts.items.search('');
    this.open();
  }

  private inputKeyDown(e: KeyboardEvent): void {
    const parts = this.tagParts;
    const input = e.target as HTMLInputElement;
    const open = !!parts.popup?.isOpen;
    const tags = parts.shownTags.length;
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
    if ((e.key === 'Backspace' || e.key === 'ArrowLeft') && !parts.text && tags) {
      e.preventDefault();
      if (e.key === 'Backspace') this.removeAt(this.values().length - 1, e);
      else this.focusTag(tags - 1);
      return;
    }
    if (e.key === 'ArrowLeft' && input.selectionStart === 0 && input.selectionEnd === 0 && tags) {
      e.preventDefault();
      this.focusTag(tags - 1);
      return;
    }
    if (e.key === 'Escape') {
      if (open) {
        e.preventDefault();
        e.stopPropagation();
        parts.popup?.close('escape');
      } else if (parts.text) {
        e.preventDefault();
        e.stopPropagation();
        this.clearText();
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
    const text = parts.text.trim();
    const row = open && list && list.activeIndex >= 0 ? list.activeItem : undefined;
    if (row !== undefined) {
      e.preventDefault();
      this.chooseRow(row, e);
      return;
    }
    if (!text) return;
    e.preventDefault();
    const lower = foldText(text);
    const match = parts.items.loaded.find((item) => foldText(this.itemText(item)) === lower && this.canChoose(item));
    if (match !== undefined) this.toggle(match, e);
    else if (this.peekProperty('acceptCustomValue')) this.addCustom(text, e);
  }

  private focusTag(index: number): void {
    const shown = this.tagParts.shownTags[Math.max(0, index)];
    if (!shown) return;
    this.close();
    focusOn(shown.tag);
  }

  private tagKeyDown(e: KeyboardEvent): void {
    const parts = this.tagParts;
    const index = parts.shownTags.findIndex((shown) => shown.tag.motif.isEventFrom(e));
    if (index < 0) return;
    const count = parts.shownTags.length;
    switch (e.key) {
      case 'ArrowLeft':
        this.focusTag(index - 1);
        break;
      case 'ArrowRight':
        if (index + 1 < count) this.focusTag(index + 1);
        else this.focus();
        break;
      case 'Home':
        this.focusTag(0);
        break;
      case 'End':
        this.focus();
        break;
      case 'Delete':
      case 'Backspace':
        if (!this.canChange()) return;
        this.removeAt(index, e);
        // The tags are drawn again for the values left.
        if (!parts.shownTags.length) this.focus();
        else this.focusTag(e.key === 'Backspace' ? index - 1 : Math.min(index, parts.shownTags.length - 1));
        break;
      case 'Escape':
        this.focus();
        break;
      default:
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) this.focus();
        return;
    }
    e.preventDefault();
  }

  // Buttons in the box.

  private renderArrow(): void {
    const parts = this.tagParts;
    if (this.peekProperty('showDropDownButton') === false) {
      removePart(parts.arrow);
      parts.arrow = null;
      return;
    }
    if (parts.arrow) return;
    const arrow = part<HTMLButtonElement>(this.area('actions'), 'button', 'mx-field__button mx-tag-box__arrow');
    arrow.attr.add({ type: 'button' });
    put(arrow, 'tabindex', '-1');
    put(arrow, 'aria-label', uiLocale.strings.moreOptions);
    glyphPart(arrow, 'chevron-down');
    arrow.motif.on('mousedown', (_, e: MouseEvent) => e.preventDefault());
    arrow.motif.on('click', () => {
      if (this.tagParts.popup?.isOpen) this.close();
      else {
        this.focus();
        this.openAll();
      }
    });
    parts.arrow = arrow;
  }

  private renderClear(): void {
    const parts = this.tagParts;
    if (!this.peekProperty('clearButton')) {
      removePart(parts.clear);
      parts.clear = null;
      return;
    }
    if (parts.clear) return;
    const clear = part<HTMLButtonElement>(this.area('tools'), 'button', 'mx-field__button mx-tag-box__clear');
    clear.attr.add({ type: 'button' });
    put(clear, 'tabindex', '-1');
    put(clear, 'aria-label', uiLocale.strings.clear);
    glyphPart(clear, 'dismiss');
    clear.motif.on('mousedown', (_, e: MouseEvent) => e.preventDefault());
    clear.motif.on('click', (_, e: MouseEvent) => {
      if (!this.canChange()) return;
      this.commit([], e);
      this.focus();
    });
    parts.clear = clear;
  }
}
