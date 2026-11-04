import { Emitter, type Bind, type Event as MotifEvent, type IBaseProp } from '@motifx/core';
import { Control } from '../../core/control';
import { controlOf } from '../../core/control-map';
import { mark, put } from '../../core/draw-parts';
import { Chip } from './Chip';
import type { ChipGroupProps } from './chip-group-props';
import type { ChipGroupSelection } from './chip-group-selection';
import type { ChipGroupValueChangedEventArgs } from './chip-group-value-changed-event-args';

const OWN = ['selection', 'value', 'wrap', 'label'] as const;

/**
 * Chips in a row that wraps. With `selection`, pressing a chip selects it (`single`: that one,
 * `multiple`: on and off) and `value` (or `x-model`) holds the chips' values; Tab stops once and the arrow keys,
 * Home and End move between the chips. Chips from a JSX list are counted as the list changes.
 *
 * @example
 * <ChipGroup selection="multiple" value={() => this.filters.diets} onValueChanged={(e) => (this.filters.diets = e.value as string[])} label="Diet">
 *   <Chip text="Vegan" />
 *   <Chip text="Gluten free" />
 * </ChipGroup>
 */
export class ChipGroup extends Control<HTMLDivElement, ChipGroupProps> {
  private readonly valueChanged = new Emitter<ChipGroupValueChangedEventArgs>();
  /** The chip focused last: Tab comes back to it. */
  private current: HTMLElement | null = null;
  private byUser = false;
  private ready = false;

  constructor(props?: IBaseProp<ChipGroupProps>) {
    super('div', props);
    const own = (this.props ?? {}) as ChipGroupProps;
    const el = this.element;
    el.classList.add('mx-chip-group');
    if (this.childs?.length) this.controls.add(...this.childs);
    for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
    if (own.onValueChanged) this.onValueChanged(own.onValueChanged);

    for (const name of ['selection', 'value'] as const) this.observeProperty(name, () => this.renderChips());
    this.observeProperty('value', (value) => {
      if (this.ready) this.valueChanged.fire({ value, byUser: this.byUser, source: this });
    });
    this.observeProperty('wrap', (wrap) => put(el, 'data-wrap', wrap === false ? 'false' : null));
    this.observeProperty<string>('label', (label) => put(el, 'aria-label', label || null));
    void this.motif.on('controladded', () => this.renderChips(), false);
    void this.motif.on('controlremoved', () => this.renderChips(), false);
    // Chips from a JSX list come and go inside the list: only the group's own children are watched.
    if (typeof MutationObserver === 'function') {
      const rows = new MutationObserver(() => this.renderChips());
      rows.observe(el, { childList: true });
      this.motif.setDisposable(() => rows.disconnect());
    }
    el.addEventListener('click', (e) => this.pressed(e));
    el.addEventListener('keydown', (e) => this.keyDown(e));
    el.addEventListener('focusin', (e) => {
      const chip = this.chipAt(e.target);
      if (chip) {
        this.current = chip.element;
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

  /** The value changed, by the user or by code (`e.byUser`). */
  get onValueChanged(): MotifEvent<ChipGroupValueChangedEventArgs> {
    return this.valueChanged.event;
  }

  /** The chips in it, in order, from JSX lists too. */
  get chips(): Chip[] {
    const chips: Chip[] = [];
    for (const el of Array.from(this.element.children)) {
      const control = controlOf(el);
      if (control instanceof Chip) chips.push(control);
    }
    return chips;
  }

  /** Whether the chip of `value` is selected. */
  isSelected(value: unknown): boolean {
    const selection = this.peekProperty<ChipGroupSelection>('selection') ?? 'none';
    const current = this.peekProperty<unknown>('value');
    if (selection === 'single') return current !== undefined && current !== null && Object.is(current, value);
    if (selection === 'multiple') return Array.isArray(current) && current.some((v) => Object.is(v, value));
    return false;
  }

  private chipAt(target: EventTarget | null): Chip | null {
    const el = target instanceof Element ? target.closest('.mx-chip') : null;
    if (!el || el.parentElement !== this.element) return null;
    const control = controlOf(el);
    return control instanceof Chip ? control : null;
  }

  private pressed(e: MouseEvent): void {
    const chip = this.chipAt(e.target);
    const selection = this.peekProperty<ChipGroupSelection>('selection') ?? 'none';
    if (!chip || selection === 'none' || !chip.isEnabled) return;
    if ((e.target as Element).closest('.mx-chip__remove')) return;
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
    const from = this.chipAt(e.target);
    if (!from || e.target !== from.element) return;
    const chips = this.chips.filter((chip) => chip.focusable && chip.isEnabled && !chip.element.hidden);
    const at = chips.indexOf(from);
    if (at < 0) return;
    const rtl = getComputedStyle(this.element).direction === 'rtl';
    const steps: Record<string, number> = { ArrowDown: 1, ArrowUp: -1, ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1 };
    let to: Chip | undefined;
    if (e.key === 'Home') to = chips[0];
    else if (e.key === 'End') to = chips[chips.length - 1];
    else if (steps[e.key]) to = chips[(at + steps[e.key] + chips.length) % chips.length];
    if (!to) return;
    e.preventDefault();
    to.element.focus();
  }

  private renderChips(): void {
    const el = this.element;
    const selection = this.peekProperty<ChipGroupSelection>('selection') ?? 'none';
    put(el, 'role', selection === 'none' ? 'group' : 'listbox');
    put(el, 'aria-multiselectable', selection === 'multiple' ? 'true' : null);
    put(el, 'aria-orientation', selection === 'none' ? null : 'horizontal');
    for (const chip of this.chips) {
      const chipEl = chip.element;
      mark(chipEl, 'data-in-group', true);
      const option = selection !== 'none';
      const was = chipEl.hasAttribute('data-option');
      mark(chipEl, 'data-option', option);
      if (option) {
        const on = this.isSelected(chip.value);
        put(chipEl, 'role', 'option');
        put(chipEl, 'aria-selected', String(on));
        put(chipEl, 'aria-pressed', null);
        if (chip.selected !== on) chip.selected = on;
      } else if (was) {
        put(chipEl, 'aria-selected', null);
      }
      // Taken over or given back: the chip draws its role and look again.
      if (was !== option) chip.drawState();
    }
    this.renderStops();
  }

  /** One Tab stop: the chip focused last, else the first selected, else the first that takes focus. */
  private renderStops(): void {
    const chips = this.chips.filter((chip) => chip.focusable);
    const usable = chips.filter((chip) => chip.isEnabled);
    const stop =
      usable.find((chip) => chip.element === this.current) ?? usable.find((chip) => chip.selected) ?? usable[0] ?? null;
    for (const chip of chips) {
      if (chip.element.hasAttribute('data-disabled')) continue;
      put(chip.element, 'tabindex', chip === stop ? '0' : '-1');
    }
  }
}
