import { untracked, type Bind, type Component, type ComponentBase, type IBaseProp } from '@motifx/core';
import { loose, part, removePart } from '../../core/draw-parts';
import { css, mark, put, text as writeText } from '../../core/part-writes';
import { follow } from '../../core/follow';
import { givenField, givenList } from '../../core/given-field';
import { LanguageLook } from '../../core/language-look';
import { canTakeFocus, focusOn, isFocused } from '../../core/focus';
import { isRtl } from '../../core/measure';
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
  part: Component<HTMLDivElement>;
  input: Component<HTMLInputElement>;
  text: Component<HTMLSpanElement>;
  help: Component<HTMLSpanElement> | null;
  value: unknown;
  enabled: boolean;
  visible: boolean;
}

interface Parts {
  rows: Row[];
  /** The row drawn checked. */
  checked: Row | null;
  name: string;
  /** What the ids of the help lines start with. */
  id: string;
  stopItems: (() => void) | null;
}

/**
 * A set of options with one selected: native radios sharing a name, in a `role="radiogroup"`
 * named by the field label. It is one Tab stop, and the arrow keys move and select. `x-model` binds the
 * value of the selected item.
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
  private readonly focusLook = new LanguageLook(this, { scope: '--_radiogroup-focus-scope' }, () => {
    put(this, 'data-focus-scope', this.focusLook.get('scope') ?? 'box');
  });

  constructor(props?: IBaseProp<RadioGroupProps<T>>) {
    super(props);
    this.motif.setDisposable(this.focusLook.watch());
    const own = (this.props ?? {}) as RadioGroupProps<T>;
    this.class.add('mx-radio-group');

    if (own.itemText !== undefined) this.setProperty('itemText', own.itemText);
    if (own.itemValue !== undefined) this.setProperty('itemValue', own.itemValue);
    this.observeProperty('items', () => this.renderItems());
    this.observeProperty('itemText', () => this.renderItems());
    this.observeProperty('itemValue', () => this.renderItems());
    this.observeProperty<RadioGroupOrientation>('orientation', (orientation) => {
      put(this, 'data-orientation', orientation ?? 'vertical');
      put(this.controlPart, 'aria-orientation', orientation ?? 'vertical');
      this.renderGrid();
    });
    this.observeProperty('columns', () => this.renderGrid());
    this.observeProperty('name', () => this.renderNames());
    for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);

    const control = this.controlPart;
    control.motif.on('click', (_, e) => {
      if (this.peekProperty('readOnly') && this.rowOf(e)) e.preventDefault();
    });
    control.motif.on('change', (_, e) => {
      const row = this.rowOf(e);
      if (!row) return;
      this.commit(row.value as T, e);
      this.renderValue();
    });
    control.motif.on('keydown', (_, e) => this.keyDown(e));
    this.motif.setDisposable(() => this.radioParts.stopItems?.());
  }

  get items(): readonly (RadioItem<T> | T)[] {
    return this.getProperty<readonly (RadioItem<T> | T)[] | undefined>('items') ?? [];
  }
  set items(value: Bind<readonly (RadioItem<T> | T)[]>) {
    this.assignProperty('items', value);
  }
  /** A property name or a reader function, not a binding. */
  get itemText(): ItemField<RadioItem<T> | T> | undefined {
    return this.getProperty<ItemField<RadioItem<T> | T> | undefined>('itemText');
  }
  set itemText(value: ItemField<RadioItem<T> | T> | undefined) {
    this.setProperty('itemText', value);
  }
  /** A property name or a reader function, not a binding. */
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

  /** The part with `role="radiogroup"`. */
  get listPart(): ComponentBase {
    return this.controlPart;
  }

  /**
   * Re-reads the items after they have been changed in place, including their text, values and states. Your items can
   * be plain or reactive, and the group reads them as they are.
   */
  override refresh(): void {
    super.refresh();
    this.renderItems();
  }

  /** The native radios as components, in item order. */
  get inputParts(): readonly ComponentBase<HTMLInputElement>[] {
    return this.radioParts.rows.map((row) => row.input);
  }

  override onMounted(): void {
    super.onMounted();
    this.focusLook.read();
  }

  override get canFocus(): boolean {
    const row = this.stopRow();
    return this.isEnabled && !!row && canTakeFocus(row.input);
  }

  override get focused(): boolean {
    return this.radioParts.rows.some((row) => isFocused(row.input));
  }

  /** Sets focus on the selected option, or on the first available one. */
  override focus(): boolean {
    if (!this.canFocus) return false;
    focusOn(this.stopRow()!.input);
    return this.focused;
  }

  protected createControl(): ComponentBase {
    const list = loose<HTMLDivElement>('div', 'mx-radio-group__list');
    list.attr.add({ role: 'radiogroup' });
    return list;
  }

  protected emptyValue(): T | null {
    return null;
  }

  protected renderValue(): void {
    const parts = this.radioParts;
    const value = this.peekValue();
    parts.checked = null;
    for (const row of parts.rows) {
      const on = Object.is(row.value, value);
      row.input.attr.add({ checked: on });
      // Radios of one name keep one checked: the last one given it.
      if (on) parts.checked = row;
    }
    this.renderStops();
  }

  protected override applyProperty(name: string, value: unknown): void {
    super.applyProperty(name, value);
    if (name === 'tabStop') {
      // The group is not a Tab stop of its own; its radios are.
      put(this.controlPart, 'tabindex', null);
      this.renderStops();
    } else if (name === 'enabled') {
      this.renderEnabled();
    }
  }

  private get radioParts(): Parts {
    const self = this as unknown as { [PARTS]?: Parts };
    return (self[PARTS] ??= { rows: [], checked: null, name: nextId('radio'), id: nextId('radio-group'), stopItems: null });
  }

  private renderItems(): void {
    const parts = this.radioParts;
    parts.stopItems?.();
    const items = givenList(this.peekProperty<readonly unknown[]>('items'));
    const textField = this.peekProperty<ItemField<unknown>>('itemText');
    const valueField = this.peekProperty<ItemField<unknown>>('itemValue');
    // The items' own functions are tracked; the list, the fields and drawing are not.
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
    looks.forEach((look, index) => {
      let row = parts.rows[index];
      if (!row) {
        row = this.createRow();
        parts.rows.push(row);
      }
      row.value = look.value;
      row.enabled = look.enabled;
      row.visible = look.visible;
      mark(row.part, 'hidden', !look.visible);
      writeText(row.text, look.text);
      if (look.hint) put(row.part, 'title', look.hint);
      else put(row.part, 'title', null);
      this.renderHelp(row, look.helpText, index);
    });
    for (const row of parts.rows.splice(looks.length)) removePart(row.part);
    this.renderNames();
    this.renderEnabled();
    this.renderGrid();
    this.renderValue();
  }

  /** A row at the end of the list: a label with its radio and text. */
  private createRow(): Row {
    const row = part<HTMLDivElement>(this.controlPart, 'div', 'mx-radio-group__item');
    const label = part<HTMLLabelElement>(row, 'label', 'mx-radio-group__label');
    const input = part<HTMLInputElement>(label, 'input', 'mx-radio-group__input');
    input.attr.add({ type: 'radio' });
    const text = part<HTMLSpanElement>(label, 'span', 'mx-radio-group__text');
    return { part: row, input, text, help: null, value: undefined, enabled: true, visible: true };
  }

  /** The help line sits outside the label: it describes the option, it does not name it. */
  private renderHelp(row: Row, text: string, index: number): void {
    if (!text) {
      removePart(row.help);
      row.help = null;
      put(row.input, 'aria-describedby', null);
      return;
    }
    row.help ??= part<HTMLSpanElement>(row.part, 'span', 'mx-radio-group__help');
    const help = row.help;
    const id = `${this.radioParts.id}-help-${index}`;
    put(help, 'id', id);
    writeText(help, text);
    put(row.input, 'aria-describedby', id);
  }

  private renderNames(): void {
    const parts = this.radioParts;
    const name = this.peekProperty<string>('name') || parts.name;
    for (const row of parts.rows) put(row.input, 'name', name);
  }

  private renderEnabled(): void {
    const off = !untracked(() => this.isEnabled);
    for (const row of this.radioParts.rows) mark(row.input, 'disabled', off || !row.enabled);
    this.renderStops();
  }

  private renderGrid(): void {
    const list = this.controlPart;
    const columns = this.peekProperty<number>('columns') ?? 0;
    mark(this, 'data-columns', columns > 0);
    if (columns > 0) {
      const shown = this.radioParts.rows.filter((row) => row.visible).length;
      css(list, '--_columns', String(columns));
      css(list, '--_rows', String(Math.max(1, Math.ceil(shown / columns))));
    } else {
      css(list, '--_columns', '');
      css(list, '--_rows', '');
    }
  }

  /** One Tab stop: the chosen option, or the first one that can be chosen. */
  private renderStops(): void {
    const stop = this.peekProperty('tabStop') === false ? null : this.stopRow();
    for (const row of this.radioParts.rows) put(row.input, 'tabindex', row === stop ? '0' : '-1');
  }

  private stopRow(): Row | undefined {
    const parts = this.radioParts;
    const rows = parts.rows.filter((row) => row.visible && row.enabled);
    return rows.find((row) => row === parts.checked) ?? rows[0];
  }

  /** The row whose radio an event came from. */
  private rowOf(e: Event): Row | undefined {
    return this.radioParts.rows.find((row) => row.input.motif.isEventFrom(e));
  }

  private keyDown(e: KeyboardEvent): void {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const rtl = isRtl(this);
    const rows = this.radioParts.rows;
    const at = rows.findIndex((row) => row.input.motif.isEventFrom(e));
    if (at < 0) return;
    const steps: Record<string, number> = { ArrowDown: 1, ArrowUp: -1, ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1 };
    const step = steps[e.key];
    if (!step) return;
    e.preventDefault();
    const count = rows.length;
    for (let i = 1; i < count; i++) {
      const row = rows[(((at + step * i) % count) + count) % count];
      if (row.visible && row.enabled && this.isEnabled) {
        this.moveTo(row, e);
        return;
      }
    }
  }

  /** Arrow keys choose the option they move to; read-only, they only move. */
  private moveTo(row: Row, e: KeyboardEvent): void {
    focusOn(row.input);
    if (this.peekProperty('readOnly')) {
      for (const other of this.radioParts.rows) put(other.input, 'tabindex', other === row ? '0' : '-1');
      return;
    }
    this.commit(row.value as T, e);
    this.renderValue();
  }
}
