import { Emitter, type Bind, type ComponentBase, type Event as MotifEvent, type IBaseProp } from '@motifx/core';
import { isWithin } from '../../core/component-tree';
import { Control } from '../../core/control';
import { isRtl } from '../../core/measure';
import { isElement } from '../../core/node-kind';
import { put } from '../../core/part-writes';
import { Chip } from './Chip';
import type { ChipGroupProps } from './chip-group-props';
import type { ChipGroupSelection } from './chip-group-selection';
import type { ChipGroupValueChangedEventArgs } from './chip-group-value-changed-event-args';

const OWN = ['selection', 'value', 'wrap', 'label'] as const;

/**
 * Chips in a wrapping row. With `selection`, clicking a chip selects it (`single` selects that chip, `multiple` toggles
 * it), and `value` (or `x-model`) holds the values of the chips. The group is one Tab stop, and the arrow keys, Home and
 * End move between the chips. Chips from a JSX list are counted as the list changes.
 *
 * @example
 * <ChipGroup selection="multiple" value={() => this.filters.diets} onValueChanged={(e) => (this.filters.diets = e.value as string[])} label="Diet">
 *   <Chip text="Vegan" />
 *   <Chip text="Gluten free" />
 * </ChipGroup>
 */
export class ChipGroup extends Control<HTMLDivElement, ChipGroupProps> {
  private readonly valueChanged = new Emitter<ChipGroupValueChangedEventArgs>();
  /** The chips listened to, and the lists and conditions around them. */
  private readonly heard = new WeakSet<ComponentBase>();
  /** The chip focused last: Tab comes back to it. */
  private current: Chip | null = null;
  private byUser = false;
  private ready = false;

  constructor(props?: IBaseProp<ChipGroupProps>) {
    super('div', props);
    const own = (this.props ?? {}) as ChipGroupProps;
    this.class.add('mx-chip-group');
    if (this.childs?.length) this.controls.add(...this.childs);
    for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
    if (own.onValueChanged) this.onValueChanged(own.onValueChanged);

    for (const name of ['selection', 'value'] as const) this.observeProperty(name, () => this.renderChips());
    this.observeProperty('value', (value) => {
      if (this.ready) this.valueChanged.fire({ value, byUser: this.byUser, source: this });
    });
    this.observeProperty('wrap', (wrap) => put(this, 'data-wrap', wrap === false ? 'false' : null));
    this.observeProperty<string>('label', (label) => put(this, 'aria-label', label || null));
    // Chips come and go as the group's children, and inside the JSX lists and conditions among them.
    void this.motif.on('controladded', this.contentAdded, false);
    void this.motif.on('controlremoved', this.contentRemoved, false);
    for (const child of this.controls.items) this.listen(child);
    this.motif.on('click', (_, e) => this.pressed(e));
    this.motif.on('keydown', (_, e) => this.keyDown(e));
    this.motif.on('focusin', (_, e) => {
      const chip = this.chipOf(e);
      if (chip) {
        this.current = chip;
        this.renderStops();
      }
    });
    this.motif.setDisposable(() => this.valueChanged.dispose());
    this.ready = true;
  }

  // Properties (see ChipGroupProps).

  get selection(): ChipGroupSelection {
    return this.getProperty<ChipGroupSelection | undefined>('selection') ?? 'none';
  }
  set selection(value: Bind<ChipGroupSelection>) {
    this.assignProperty('selection', value);
  }
  get value(): unknown {
    return this.getProperty<unknown>('value') ?? (this.peekProperty('selection') === 'multiple' ? [] : null);
  }
  set value(value: Bind<unknown>) {
    this.assignProperty('value', value);
  }
  get wrap(): boolean {
    return this.getProperty<boolean | undefined>('wrap') !== false;
  }
  set wrap(value: Bind<boolean>) {
    this.assignProperty('wrap', value);
  }
  get label(): string {
    return this.getProperty<string | undefined>('label') ?? '';
  }
  set label(value: Bind<string>) {
    this.assignProperty('label', value);
  }

  /** Occurs when the value changes, either through user input or programmatically (`e.byUser`). */
  get onValueChanged(): MotifEvent<ChipGroupValueChangedEventArgs> {
    return this.valueChanged.event;
  }

  /** The chips in order, including those from JSX lists. */
  get chips(): Chip[] {
    return chipsIn(this, []);
  }

  /** Indicates whether the chip for `value` is selected. */
  isSelected(value: unknown): boolean {
    const selection = this.peekProperty<ChipGroupSelection>('selection') ?? 'none';
    const current = this.peekProperty<unknown>('value');
    if (selection === 'single') return current !== undefined && current !== null && Object.is(current, value);
    if (selection === 'multiple') return Array.isArray(current) && current.some((v) => Object.is(v, value));
    return false;
  }

  /** The chip an event came from. */
  private chipOf(e: Event): Chip | null {
    return this.chips.find((chip) => chip.motif.isEventFrom(e)) ?? null;
  }

  /** Listens to a part of the group's content: a chip, or a list or condition that brings chips. */
  private listen(component: ComponentBase): void {
    if (component.isDisposed || this.heard.has(component)) return;
    if (component instanceof Chip) {
      this.heard.add(component);
      void component.motif.on('x:built', this.chipChanged);
      void component.motif.on('x:visibilityChanged', this.chipChanged);
      void component.motif.on('x:disposed', this.chipChanged);
    } else if (!isElement(component.element)) {
      this.heard.add(component);
      void component.motif.on('controladded', this.contentAdded, false);
      void component.motif.on('controlremoved', this.contentRemoved, false);
      for (const child of component.controls.items) this.listen(child);
    }
  }

  /** Stops listening to what left the group's content; a chip that left is given back. */
  private forget(component: ComponentBase): void {
    if (!this.heard.has(component)) return;
    this.heard.delete(component);
    if (component.isDisposed) return;
    if (component instanceof Chip) {
      void component.motif.off('x:built', this.chipChanged);
      void component.motif.off('x:visibilityChanged', this.chipChanged);
      void component.motif.off('x:disposed', this.chipChanged);
      if (this.current === component) this.current = null;
      component.leaveGroup(this);
      return;
    }
    void component.motif.off('controladded', this.contentAdded);
    void component.motif.off('controlremoved', this.contentRemoved);
    for (const child of component.controls.items) this.forget(child);
  }

  /** A chip, or a list or condition that may hold chips, came into the group's content. */
  private readonly contentAdded = (_sender: ComponentBase, e: { control: ComponentBase }): void => {
    this.listen(e.control);
    this.renderChips();
  };

  /** Something left the group's content: moved elsewhere in the group, or out of it. */
  private readonly contentRemoved = (_sender: ComponentBase, e: { control: ComponentBase }): void => {
    if (!isWithin(e.control, this)) this.forget(e.control);
    this.renderChips();
  };

  /** A chip was built, showed, hid or went away: the Tab stop may move. */
  private readonly chipChanged = (): void => {
    if (this.isDisposed) return;
    if (this.current?.isDisposed) this.current = null;
    this.renderStops();
  };

  private pressed(e: MouseEvent): void {
    const selection = this.peekProperty<ChipGroupSelection>('selection') ?? 'none';
    if (selection === 'none') return;
    // A press on a chip's remove button stops at the chip.
    const chip = this.chipOf(e);
    if (!chip || !chip.isEnabled) return;
    const value = chip.value;
    const on = this.isSelected(value);
    let next: unknown;
    if (selection === 'single') next = on ? null : value;
    else {
      // A new array: the one given is the developer's.
      const current = this.peekProperty<unknown>('value');
      const list = Array.isArray(current) ? current : [];
      next = on ? list.filter((v) => !Object.is(v, value)) : [...list, value];
    }
    this.byUser = true;
    this.changeProperty('value', next);
    this.byUser = false;
    // `x-model` takes the user's choice back.
    this.bindings.writeModel(next);
  }

  private keyDown(e: KeyboardEvent): void {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const from = this.chipOf(e);
    // Keys go where focus is: on the chip itself, not on its remove button.
    if (!from?.focused) return;
    const chips = this.chips.filter((chip) => chip.focusable && isUsable(chip));
    const at = chips.indexOf(from);
    if (at < 0) return;
    const rtl = isRtl(this);
    const steps: Record<string, number> = { ArrowDown: 1, ArrowUp: -1, ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1 };
    let to: Chip | undefined;
    if (e.key === 'Home') to = chips[0];
    else if (e.key === 'End') to = chips[chips.length - 1];
    else if (steps[e.key]) to = chips[(at + steps[e.key] + chips.length) % chips.length];
    if (!to) return;
    e.preventDefault();
    to.focus();
  }

  private renderChips(): void {
    const selection = this.peekProperty<ChipGroupSelection>('selection') ?? 'none';
    put(this, 'role', selection === 'none' ? 'group' : 'listbox');
    put(this, 'aria-multiselectable', selection === 'multiple' ? 'true' : null);
    put(this, 'aria-orientation', selection === 'none' ? null : 'horizontal');
    const option = selection !== 'none';
    for (const chip of this.chips) chip.joinGroup(this, option, option && this.isSelected(chip.value));
    this.renderStops();
  }

  /** One Tab stop: the chip focused last, else the first selected, else the first that takes focus. */
  private renderStops(): void {
    const chips = this.chips.filter((chip) => chip.focusable);
    const usable = chips.filter(isUsable);
    const stop = usable.find((chip) => chip === this.current) ?? usable.find((chip) => chip.selected) ?? usable[0] ?? null;
    for (const chip of chips) put(chip, 'tabindex', chip === stop ? '0' : '-1');
  }
}

/** The chips among the children of `component`, and inside those without an element of their own (JSX lists, conditions). */
function chipsIn(component: ComponentBase, found: Chip[]): Chip[] {
  for (const child of component.controls.items) {
    if (child instanceof Chip) found.push(child);
    else if (!child.isDisposed && !isElement(child.element)) chipsIn(child, found);
  }
  return found;
}

/** A chip in the row now: enabled, built, and not hidden (`visible`, or held back by `x-wait` / `x-display`). */
function isUsable(chip: Chip): boolean {
  return chip.isEnabled && chip.isBuilt && chip.visible && !chip.isWait;
}
