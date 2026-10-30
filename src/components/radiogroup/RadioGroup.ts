import { untracked, type Bind, type IBaseProp } from '@motifx/core';
import { registerControl } from '../../core/control-map';
import { follow } from '../../core/follow';
import { givenField, givenList } from '../../core/given-field';
import { LanguageLook } from '../../core/language-look';
import { deepActiveElement, isFocusable } from '../../core/focus';
import { nextId } from '../../core/next-id';
import { Field } from '../../parts/field/Field';
import type { ItemField } from '../../parts/list/item-field';
import { readItemField } from '../../parts/list/read-item-field';
import type { RadioGroupOrientation } from './radio-group-orientation';
import type { RadioGroupProps } from './radio-group-props';
import type { RadioItem } from './radio-item';

const OWN = ['items', 'orientation', 'columns', 'name'] as const;

const PARTS = Symbol('mx.radiogroup');

/** What one item says, read in an effect. */
interface Look {
  value: unknown;
  text: string;
  hint: string;
  helpText: string;
  enabled: boolean;
  visible: boolean;
}

/** One drawn option. */
interface Row {
  element: HTMLDivElement;
  input: HTMLInputElement;
  text: HTMLSpanElement;
  help: HTMLSpanElement | null;
  value: unknown;
  enabled: boolean;
  visible: boolean;
}

interface Parts {
  rows: Row[];
  name: string;
  stopItems: (() => void) | null;
}

/**
 * A set of options of which one is chosen: native radios sharing a name, in a `role="radiogroup"`
 * named by the field's label. One Tab stop; the arrow keys move and choose. `x-model` binds the
 * value of the chosen item.
 *
 * @example
 * <RadioGroup label="&Size" items={['S', 'M', 'L']} x-model={() => this.order.size} />
 * <RadioGroup label="Plan" items={() => this.plans} itemText="name" itemValue="id" orientation="horizontal" />
 *
 * const ship = new RadioGroup({ label: 'Shipping', items: [{ value: 'std', text: 'Standard' }, { value: 'exp', text: 'Express' }] });
 * this.panel.controls.add(ship);
 * ship.value = 'exp';
 */
export class RadioGroup<T = unknown> extends Field<T | null, RadioGroupProps<T>> {
  /** Where the design language puts the focus ring: around the circle, or around the circle and its text. */
  private readonly focusLook = new LanguageLook(this.element, { scope: '--_radiogroup-focus-scope' }, () => {
    this.element.dataset.focusScope = this.focusLook.get('scope') ?? 'box';
  });

  constructor(props?: IBaseProp<RadioGroupProps<T>>) {
    super(props);
    this.motif.setDisposable(this.focusLook.watch());
    const own = (this.props ?? {}) as RadioGroupProps<T>;
    const list = this.listElement;
    this.element.classList.add('mx-radio-group');
    // The access key finds the control through the element that carries it.
    registerControl(list, this);

    if (own.itemText !== undefined) this.setProperty('itemText', own.itemText);
    if (own.itemValue !== undefined) this.setProperty('itemValue', own.itemValue);
    this.observeProperty('items', () => this.renderItems());
    this.observeProperty('itemText', () => this.renderItems());
    this.observeProperty('itemValue', () => this.renderItems());
    this.observeProperty<RadioGroupOrientation>('orientation', (orientation) => {
      this.element.dataset.orientation = orientation ?? 'vertical';
      list.setAttribute('aria-orientation', orientation ?? 'vertical');
      this.renderGrid();
    });
    this.observeProperty('columns', () => this.renderGrid());
    this.observeProperty('name', () => this.renderNames());
    for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);

    list.addEventListener('click', (e) => {
      if (this.peekProperty('readOnly') && this.rowOf(e.target)) e.preventDefault();
    });
    list.addEventListener('change', (e) => {
      const row = this.rowOf(e.target);
      if (!row) return;
      this.commit(row.value as T, e);
      this.renderValue();
    });
    list.addEventListener('keydown', (e) => this.keyDown(e));
    this.motif.setDisposable(() => this.radioParts.stopItems?.());
  }

  get items(): readonly (RadioItem<T> | T)[] {
    return this.getProperty<readonly (RadioItem<T> | T)[] | undefined>('items') ?? [];
  }
  set items(value: Bind<readonly (RadioItem<T> | T)[]>) {
    this.assignProperty('items', value);
  }
  /** A property name or a reader function (not a binding). */
  get itemText(): ItemField<RadioItem<T> | T> | undefined {
    return this.getProperty<ItemField<RadioItem<T> | T> | undefined>('itemText');
  }
  set itemText(value: ItemField<RadioItem<T> | T> | undefined) {
    this.setProperty('itemText', value);
  }
  /** A property name or a reader function (not a binding). */
  get itemValue(): ItemField<RadioItem<T> | T> | undefined {
    return this.getProperty<ItemField<RadioItem<T> | T> | undefined>('itemValue');
  }
  set itemValue(value: ItemField<RadioItem<T> | T> | undefined) {
    this.setProperty('itemValue', value);
  }
  get orientation(): RadioGroupOrientation {
    return this.getProperty<RadioGroupOrientation | undefined>('orientation') ?? 'vertical';
  }
  set orientation(value: Bind<RadioGroupOrientation>) {
    this.assignProperty('orientation', value);
  }
  get columns(): number {
    return this.getProperty<number | undefined>('columns') ?? 0;
  }
  set columns(value: Bind<number>) {
    this.assignProperty('columns', value, (v) => Math.max(0, Math.floor(Number(v) || 0)));
  }
  get name(): string {
    return this.getProperty<string | undefined>('name') ?? '';
  }
  set name(value: Bind<string>) {
    this.assignProperty('name', value);
  }

  /** The element with `role="radiogroup"`. */
  get listElement(): HTMLElement {
    return this.focusElement;
  }

  /**
   * Reads the items again after they were changed in place: their texts, values and states. Your items may be
   * plain or reactive; the group reads them as they are.
   */
  override refresh(): void {
    super.refresh();
    this.renderItems();
  }

  /** The native radios, in the order of the items. */
  get inputs(): readonly HTMLInputElement[] {
    return this.radioParts.rows.map((row) => row.input);
  }

  override onMounted(): void {
    super.onMounted();
    this.focusLook.read();
  }

  override get canFocus(): boolean {
    const row = this.stopRow();
    return this.isEnabled && !!row && row.input.isConnected && isFocusable(row.input);
  }

  override get focused(): boolean {
    const active = deepActiveElement();
    return !!active && this.radioParts.rows.some((row) => row.input === active);
  }

  /** Focuses the chosen option, or the first one that can be chosen. */
  override focus(): boolean {
    if (!this.canFocus) return false;
    this.stopRow()!.input.focus();
    return this.focused;
  }

  protected createControl(): HTMLElement {
    const list = document.createElement('div');
    list.className = 'mx-radio-group__list';
    list.setAttribute('role', 'radiogroup');
    return list;
  }

  protected emptyValue(): T | null {
    return null;
  }

  protected renderValue(): void {
    const value = this.peekValue();
    for (const row of this.radioParts.rows) row.input.checked = Object.is(row.value, value);
    this.renderStops();
  }

  protected override applyProperty(name: string, value: unknown): void {
    super.applyProperty(name, value);
    if (name === 'tabStop') {
      // The group is not a Tab stop of its own; its radios are.
      this.listElement.removeAttribute('tabindex');
      this.renderStops();
    } else if (name === 'enabled') {
      this.renderEnabled();
    }
  }

  private get radioParts(): Parts {
    const self = this as unknown as { [PARTS]?: Parts };
    return (self[PARTS] ??= { rows: [], name: nextId('radio'), stopItems: null });
  }

  private renderItems(): void {
    const parts = this.radioParts;
    parts.stopItems?.();
    const items = givenList(this.peekProperty<readonly unknown[]>('items'));
    const textField = this.peekProperty<ItemField<unknown>>('itemText');
    const valueField = this.peekProperty<ItemField<unknown>>('itemValue');
    // The items' own functions are followed; the list, the fields and drawing are not.
    parts.stopItems = follow(
      this,
      'items',
      () => items.map((item) => this.lookOf(item, textField, valueField)),
      (looks) => this.drawItems(looks),
    );
  }

  private lookOf(item: unknown, textField: ItemField<unknown> | undefined, valueField: ItemField<unknown> | undefined): Look {
    const fields = item !== null && typeof item === 'object' ? (item as RadioItem<unknown>) : null;
    // An object without a value of its own is its own value.
    const value = fields && valueField === undefined && !untracked(() => 'value' in fields) ? item : readItemField(item, valueField, 'value');
    const text = fields || textField !== undefined ? readItemField(item, textField, 'text') : item;
    return {
      value,
      text: String(text ?? value ?? ''),
      hint: givenField<string | undefined>(fields, 'hint') ?? '',
      helpText: givenField<string | undefined>(fields, 'helpText') ?? '',
      enabled: givenField(fields, 'enabled') !== false,
      visible: givenField(fields, 'visible') !== false,
    };
  }

  private drawItems(looks: Look[]): void {
    const parts = this.radioParts;
    const list = this.listElement;
    looks.forEach((look, index) => {
      let row = parts.rows[index];
      if (!row) {
        row = this.createRow();
        parts.rows.push(row);
        list.append(row.element);
      }
      row.value = look.value;
      row.enabled = look.enabled;
      row.visible = look.visible;
      row.element.hidden = !look.visible;
      row.text.textContent = look.text;
      if (look.hint) row.element.title = look.hint;
      else row.element.removeAttribute('title');
      this.renderHelp(row, look.helpText, index);
    });
    for (const row of parts.rows.splice(looks.length)) row.element.remove();
    this.renderNames();
    this.renderEnabled();
    this.renderGrid();
    this.renderValue();
  }

  private createRow(): Row {
    const element = document.createElement('div');
    element.className = 'mx-radio-group__item';
    const label = element.appendChild(document.createElement('label'));
    label.className = 'mx-radio-group__label';
    const input = label.appendChild(document.createElement('input'));
    input.type = 'radio';
    input.className = 'mx-radio-group__input';
    const text = label.appendChild(document.createElement('span'));
    text.className = 'mx-radio-group__text';
    return { element, input, text, help: null, value: undefined, enabled: true, visible: true };
  }

  /** The help line sits outside the label: it describes the option, it does not name it. */
  private renderHelp(row: Row, text: string, index: number): void {
    if (!text) {
      row.help?.remove();
      row.help = null;
      row.input.removeAttribute('aria-describedby');
      return;
    }
    if (!row.help) {
      row.help = row.element.appendChild(document.createElement('span'));
      row.help.className = 'mx-radio-group__help';
    }
    row.help.id = `${this.listElement.id}-help-${index}`;
    row.help.textContent = text;
    row.input.setAttribute('aria-describedby', row.help.id);
  }

  private renderNames(): void {
    const parts = this.radioParts;
    const name = this.peekProperty<string>('name') || parts.name;
    for (const row of parts.rows) row.input.name = name;
  }

  private renderEnabled(): void {
    const off = !untracked(() => this.isEnabled);
    for (const row of this.radioParts.rows) row.input.disabled = off || !row.enabled;
    this.renderStops();
  }

  private renderGrid(): void {
    const list = this.listElement;
    const columns = this.peekProperty<number>('columns') ?? 0;
    this.element.toggleAttribute('data-columns', columns > 0);
    if (columns > 0) {
      const shown = this.radioParts.rows.filter((row) => row.visible).length;
      list.style.setProperty('--_columns', String(columns));
      list.style.setProperty('--_rows', String(Math.max(1, Math.ceil(shown / columns))));
    } else {
      list.style.removeProperty('--_columns');
      list.style.removeProperty('--_rows');
    }
  }

  /** One Tab stop: the chosen option, or the first one that can be chosen. */
  private renderStops(): void {
    const stop = this.peekProperty('tabStop') === false ? null : this.stopRow();
    for (const row of this.radioParts.rows) row.input.tabIndex = row === stop ? 0 : -1;
  }

  private stopRow(): Row | undefined {
    const rows = this.radioParts.rows.filter((row) => row.visible && row.enabled);
    return rows.find((row) => row.input.checked) ?? rows[0];
  }

  private rowOf(target: EventTarget | null): Row | undefined {
    return this.radioParts.rows.find((row) => row.input === target);
  }

  private keyDown(e: KeyboardEvent): void {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const rows = this.radioParts.rows;
    const at = rows.findIndex((row) => row.input === e.target);
    if (at < 0) return;
    const rtl = this.element.closest('[dir]')?.getAttribute('dir') === 'rtl';
    const steps: Record<string, number> = { ArrowDown: 1, ArrowUp: -1, ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1 };
    const step = steps[e.key];
    if (!step) return;
    e.preventDefault();
    const count = rows.length;
    for (let i = 1; i < count; i++) {
      const row = rows[(((at + step * i) % count) + count) % count];
      if (row.visible && !row.input.disabled) {
        this.moveTo(row, e);
        return;
      }
    }
  }

  /** Arrow keys choose the option they move to; read-only, they only move. */
  private moveTo(row: Row, e: KeyboardEvent): void {
    row.input.focus();
    if (this.peekProperty('readOnly')) {
      for (const other of this.radioParts.rows) other.input.tabIndex = other === row ? 0 : -1;
      return;
    }
    this.commit(row.value as T, e);
    this.renderValue();
  }
}
