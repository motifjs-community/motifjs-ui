import { Emitter, untracked, type Bind, type Event as MotifEvent, type IBaseProp } from '@motifx/core';
import { Control } from '../../core/control';
import { follow } from '../../core/follow';
import { givenField, givenList } from '../../core/given-field';
import { mark, put } from '../../core/draw-parts';
import type { IconSource } from '../../core/icon-source';
import { LanguageLook } from '../../core/language-look';
import type { ItemField } from '../../parts/list/item-field';
import { readItemField } from '../../parts/list/read-item-field';
import { Button } from '../button/Button';
import type { ButtonSize } from '../button/button-size';
import type { ButtonVariant } from '../button/button-variant';
import type { ButtonGroupItem } from './button-group-item';
import type { ButtonGroupItemClickEventArgs } from './button-group-item-click-event-args';
import type { ButtonGroupProps } from './button-group-props';
import type { ButtonGroupSelection } from './button-group-selection';
import type { ButtonGroupValueChangedEventArgs } from './button-group-value-changed-event-args';

const OWN = ['items', 'selection', 'value', 'allowEmpty', 'attached', 'variant', 'size', 'stretch', 'label'] as const;

/** What one item says. */
interface Look {
  item: unknown;
  value: unknown;
  text: string;
  icon: IconSource | null;
  hint: string;
  enabled: boolean;
  visible: boolean;
}

/**
 * A row of related buttons. With `selection`, it is a segmented choice (`single` selects one button, `multiple`
 * toggles each one). Otherwise, it is a set of actions (`onItemClick`). These are kit buttons, and their appearance in
 * a group comes from the design language, attached by default. The group is one Tab stop: the arrow keys, Home and End
 * move between the buttons, and Space and Enter click them.
 *
 * @example
 * <ButtonGroup label="Alignment" items={['Left', 'Center', 'Right']} x-model={() => this.doc.align} />
 * <ButtonGroup selection="multiple" items={[{ value: 'b', icon: boldIcon, hint: 'Bold' }, { value: 'i', icon: italicIcon, hint: 'Italic' }]} x-model={() => this.doc.marks} />
 */
export class ButtonGroup<T = unknown> extends Control<HTMLDivElement, ButtonGroupProps<T>> {
  /** Attached or not, when not told, is the design language's. */
  private readonly look = new LanguageLook(this.element, { attached: '--_button-group-attached' }, () => this.renderLook());
  private readonly valueChanged = new Emitter<ButtonGroupValueChangedEventArgs<T>>();
  private readonly itemClicked = new Emitter<ButtonGroupItemClickEventArgs<T>>();
  private readonly buttonList: Button[] = [];
  private looks: Look[] = [];
  private stopItems: (() => void) | null = null;
  /** The button focused last: Tab comes back to it. */
  private current: Button | null = null;
  private byUser = false;
  private ready = false;

  constructor(props?: IBaseProp<ButtonGroupProps<T>>) {
    super('div', props);
    const own = (this.props ?? {}) as ButtonGroupProps<T>;
    const el = this.element;
    el.classList.add('mx-button-group');
    el.setAttribute('role', 'group');
    for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
    // Readers, not bindings: a function here reads the item.
    for (const name of ['itemText', 'itemValue'] as const) if (own[name] !== undefined) this.setProperty(name, own[name]);
    if (own.onValueChanged) this.onValueChanged(own.onValueChanged);
    if (own.onItemClick) this.onItemClick(own.onItemClick);

    for (const name of ['items', 'itemText', 'itemValue'] as const) this.observeProperty(name, () => this.renderItems());
    for (const name of ['selection', 'value'] as const) this.observeProperty(name, () => this.renderValue());
    this.observeProperty('value', (value) => {
      if (this.ready) this.valueChanged.fire({ value: value as T | T[] | null, byUser: this.byUser, source: this });
    });
    for (const name of ['variant', 'size', 'stretch', 'attached'] as const) this.observeProperty(name, () => this.renderLook());
    this.observeProperty<string>('label', (label) => put(el, 'aria-label', label || null));
    el.addEventListener('keydown', (e) => this.keyDown(e));
    el.addEventListener('focusin', (e) => {
      const button = this.buttonAt(e.target);
      if (button) {
        this.current = button;
        this.renderStops();
      }
    });
    this.motif.setDisposable(this.look.watch());
    this.motif.setDisposable(() => {
      this.stopItems?.();
      this.valueChanged.dispose();
      this.itemClicked.dispose();
    });
    this.ready = true;
  }

  // Properties (see ButtonGroupProps).

  get items(): readonly (ButtonGroupItem<T> | T)[] {
    return this.getProperty<readonly (ButtonGroupItem<T> | T)[] | undefined>('items') ?? [];
  }
  set items(value: Bind<readonly (ButtonGroupItem<T> | T)[]>) {
    this.assignProperty('items', value);
  }
  get itemText(): ItemField<ButtonGroupItem<T> | T> | undefined {
    return this.getProperty<ItemField<ButtonGroupItem<T> | T> | undefined>('itemText');
  }
  set itemText(value: ItemField<ButtonGroupItem<T> | T> | undefined) {
    this.setProperty('itemText', value);
  }
  get itemValue(): ItemField<ButtonGroupItem<T> | T> | undefined {
    return this.getProperty<ItemField<ButtonGroupItem<T> | T> | undefined>('itemValue');
  }
  set itemValue(value: ItemField<ButtonGroupItem<T> | T> | undefined) {
    this.setProperty('itemValue', value);
  }
  get selection(): ButtonGroupSelection {
    return this.getProperty<ButtonGroupSelection | undefined>('selection') ?? 'single';
  }
  set selection(value: Bind<ButtonGroupSelection>) {
    this.assignProperty('selection', value);
  }
  get value(): T | readonly T[] | null {
    return this.getProperty<T | readonly T[] | null | undefined>('value') ?? (this.peekProperty('selection') === 'multiple' ? [] : null);
  }
  set value(value: Bind<T | readonly T[] | null>) {
    this.assignProperty('value', value);
  }
  get allowEmpty(): boolean {
    return !!this.getProperty<boolean>('allowEmpty');
  }
  set allowEmpty(value: Bind<boolean>) {
    this.assignProperty('allowEmpty', value, Boolean);
  }
  get attached(): boolean {
    return this.getProperty<boolean | undefined>('attached') ?? this.look.get('attached') !== 'false';
  }
  set attached(value: Bind<boolean>) {
    this.assignProperty('attached', value);
  }
  get variant(): ButtonVariant | undefined {
    return this.getProperty<ButtonVariant | undefined>('variant');
  }
  set variant(value: Bind<ButtonVariant | undefined>) {
    this.assignProperty('variant', value);
  }
  get size(): ButtonSize {
    return this.getProperty<ButtonSize | undefined>('size') ?? 'md';
  }
  set size(value: Bind<ButtonSize>) {
    this.assignProperty('size', value);
  }
  get stretch(): boolean {
    return !!this.getProperty<boolean>('stretch');
  }
  set stretch(value: Bind<boolean>) {
    this.assignProperty('stretch', value, Boolean);
  }
  get label(): string {
    return this.getProperty<string | undefined>('label') ?? '';
  }
  set label(value: Bind<string>) {
    this.assignProperty('label', value);
  }

  /** Occurs when the value changes, either through user input or programmatically (`e.byUser`). */
  get onValueChanged(): MotifEvent<ButtonGroupValueChangedEventArgs<T>> {
    return this.valueChanged.event;
  }

  /** Occurs when a button is clicked, with any selection mode. */
  get onItemClick(): MotifEvent<ButtonGroupItemClickEventArgs<T>> {
    return this.itemClicked.event;
  }

  /** The kit buttons in the group, in item order, including hidden ones. */
  get buttons(): readonly Button[] {
    return this.buttonList;
  }

  /** Indicates whether the button for `value` is selected or on. */
  isSelected(value: unknown): boolean {
    const selection = this.peekProperty<ButtonGroupSelection>('selection') ?? 'single';
    const current = this.peekProperty<unknown>('value');
    if (selection === 'single') return current !== undefined && current !== null && Object.is(current, value);
    if (selection === 'multiple') return Array.isArray(current) && current.some((v) => Object.is(v, value));
    return false;
  }

  /** Re-reads the items after they have been changed in place. */
  refresh(): void {
    this.renderItems();
  }

  override onMounted(): void {
    this.look.read();
    this.renderLook();
  }

  private buttonAt(target: EventTarget | null): Button | null {
    return this.buttonList.find((button) => button.element.contains(target as Node)) ?? null;
  }

  private renderItems(): void {
    this.stopItems?.();
    const items = givenList(this.peekProperty<readonly unknown[]>('items'));
    const textField = this.peekProperty<ItemField<unknown>>('itemText');
    const valueField = this.peekProperty<ItemField<unknown>>('itemValue');
    // The items' own functions are tracked; the list, the fields and drawing are not.
    this.stopItems = follow(
      this,
      'items',
      () => items.map((item) => this.lookOf(item, textField, valueField)),
      (looks) => this.drawItems(looks),
    );
  }

  private lookOf(item: unknown, textField: ItemField<unknown> | undefined, valueField: ItemField<unknown> | undefined): Look {
    const fields = item !== null && typeof item === 'object' ? (item as ButtonGroupItem<unknown>) : null;
    // An object without a value of its own is its own value.
    const value = fields && valueField === undefined && !untracked(() => 'value' in fields) ? item : readItemField(item, valueField, 'value');
    const text = fields || textField !== undefined ? readItemField(item, textField, 'text') : item;
    return {
      item,
      value,
      // Without a text of its own, an item shows its value.
      text: text === undefined || text === null ? String(value ?? '') : String(text),
      icon: givenField<IconSource | null | undefined>(fields, 'icon') ?? null,
      hint: givenField<string | undefined>(fields, 'hint') ?? '',
      enabled: givenField(fields, 'enabled') !== false,
      visible: givenField(fields, 'visible') !== false,
    };
  }

  private drawItems(looks: Look[]): void {
    this.looks = looks;
    looks.forEach((look, index) => {
      let button = this.buttonList[index];
      if (!button) {
        button = new Button({ toggle: this.peekProperty('selection') !== 'none' });
        button.element.classList.add('mx-button-group__item');
        void button.motif.on('click', () => this.pressed(index));
        this.controls.add(button);
        this.buttonList.push(button);
      }
      if (button.text !== look.text) button.text = look.text;
      if (button.icon !== look.icon) button.icon = look.icon;
      if (button.hint !== look.hint) button.hint = look.hint;
      if (button.enabled !== look.enabled) button.enabled = look.enabled;
      if (button.visible !== look.visible) button.visible = look.visible;
    });
    for (const button of this.buttonList.splice(looks.length)) void button.dispose();
    this.renderLook();
    this.renderValue();
  }

  /** A button was pressed: its action, then the choice it makes. */
  private pressed(index: number): void {
    const look = this.looks[index];
    if (!look) return;
    this.itemClicked.fire({ item: look.item, value: look.value as T, source: this });
    const selection = this.peekProperty<ButtonGroupSelection>('selection') ?? 'single';
    if (selection === 'none') return;
    const on = this.isSelected(look.value);
    let next: unknown;
    if (selection === 'single') {
      if (on && !this.peekProperty('allowEmpty')) {
        // The chosen one stays chosen: the button's own toggle is put back.
        this.renderValue();
        return;
      }
      next = on ? null : look.value;
    } else {
      // A new array: the one given is the developer's.
      const current = this.peekProperty<unknown>('value');
      const list = Array.isArray(current) ? current : [];
      next = on ? list.filter((v) => !Object.is(v, look.value)) : [...list, look.value];
    }
    this.byUser = true;
    this.changeProperty('value', next);
    this.byUser = false;
    // `x-model` takes the user's choice back.
    this.bindings.writeModel(next);
  }

  private keyDown(e: KeyboardEvent): void {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const from = this.buttonAt(e.target);
    if (!from) return;
    const usable = this.buttonList.filter((button) => button.visible && button.isEnabled);
    const at = usable.indexOf(from);
    if (at < 0) return;
    const rtl = getComputedStyle(this.element).direction === 'rtl';
    const steps: Record<string, number> = { ArrowDown: 1, ArrowUp: -1, ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1 };
    let to: Button | undefined;
    if (e.key === 'Home') to = usable[0];
    else if (e.key === 'End') to = usable[usable.length - 1];
    else if (steps[e.key]) to = usable[(at + steps[e.key] + usable.length) % usable.length];
    if (!to) return;
    e.preventDefault();
    to.focus();
  }

  private renderValue(): void {
    const selection = this.peekProperty<ButtonGroupSelection>('selection') ?? 'single';
    this.buttonList.forEach((button, index) => {
      const look = this.looks[index];
      const toggle = selection !== 'none';
      if (button.toggle !== toggle) button.toggle = toggle;
      const on = toggle && !!look && this.isSelected(look.value);
      if (button.pressed !== on) button.pressed = on;
    });
    this.renderStops();
  }

  /** One Tab stop: the button focused last, else the first chosen, else the first that can be pressed. */
  private renderStops(): void {
    const usable = this.buttonList.filter((button) => button.visible && button.enabled);
    const stop =
      usable.find((button) => button === this.current) ?? usable.find((button) => button.pressed) ?? usable[0] ?? null;
    for (const button of this.buttonList) {
      const tabStop = button === stop;
      if (button.tabStop !== tabStop) button.tabStop = tabStop;
    }
  }

  private renderLook(): void {
    const el = this.element;
    const attached = this.peekProperty<boolean | undefined>('attached') ?? this.look.get('attached') !== 'false';
    mark(el, 'data-attached', attached);
    mark(el, 'data-stretch', !!this.peekProperty('stretch'));
    const variant = this.peekProperty<ButtonVariant | undefined>('variant');
    const size = this.peekProperty<ButtonSize | undefined>('size');
    for (const button of this.buttonList) {
      // Not given, the group's place decides (the design language's look for a group).
      if (variant !== undefined && button.variant !== variant) button.variant = variant;
      if (size !== undefined && button.size !== size) button.size = size;
      if (button.stretch !== !!this.peekProperty('stretch')) button.stretch = !!this.peekProperty('stretch');
    }
  }
}
