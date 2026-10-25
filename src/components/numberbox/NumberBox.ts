import { effect, Emitter, type Bind, type Event as MotifEvent, type IBaseProp } from '@motifx/core';
import { chevronDown, chevronUp, dashMark, plusMark } from '../../core/glyphs';
import { uiLocale } from '../../core/ui-locale';
import type { EnterKeyEventArgs } from '../../parts/field/enter-key-event-args';
import { Field } from '../../parts/field/Field';
import type { ValidationRule } from '../../parts/validation/validation-rule';
import { addDecimal, roundDecimal, shiftDecimal } from './decimal-math';
import type { NumberBoxProps } from './number-box-props';
import { checkedLocale, isPartialNumber, parseNumber, plainNumber } from './number-text';
import type { SpinLayout } from './spin-layout';

const OWN = [
  'min',
  'max',
  'step',
  'largeStep',
  'showSpinButtons',
  'spinLayout',
  'wheel',
  'format',
  'locale',
  'decimals',
  'clamp',
  'allowEmpty',
  'updateOn',
  'placeholder',
  'selectOnFocus',
  'align',
  'name',
  'autocomplete',
] as const;

const SHOWN = ['format', 'locale', 'decimals'] as const;

/** A held spin button waits this long, then repeats at the second pace (ms). */
const HOLD = [400, 60] as const;

/** Digits, signs and the separators locales use. */
const TYPABLE = /^[\p{Nd}\s.,'’+\-−٫٬]*$/u;

const PARTS = Symbol('mx.numberbox');

interface Parts {
  spin: HTMLSpanElement | null;
  up: HTMLButtonElement | null;
  down: HTMLButtonElement | null;
  stopSpinLabels: (() => void) | null;
  repeat: ReturnType<typeof setTimeout> | undefined;
  hasFocus: boolean;
  /** The value is being typed: the text stays as the user writes it. */
  typing: boolean;
  /** The text put in the field on focus, to tell whether the user changed it. */
  editText: string | null;
  keepSelection: boolean;
  formatKey: string;
  formatter: Intl.NumberFormat | null;
  wheel: ((e: WheelEvent) => void) | null;
  enter: Emitter<EnterKeyEventArgs<number | null>>;
}

function finite(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

/**
 * A number field: arrow keys, PageUp/PageDown, Home/End, spin buttons that repeat while held and
 * an optional mouse wheel change the value by `step`; `min`, `max` and `decimals` shape what is
 * entered. Without focus it shows the value formatted (`Intl.NumberFormat`: currency, percent…);
 * with focus the plain number, typed in the locale's own way. `x-model` binds a number (or `null`).
 *
 * @example
 * <NumberBox label="&Price" min={0} step={0.5} format={{ style: 'currency', currency: 'TRY' }} locale="tr-TR" x-model={() => this.item.price} />
 *
 * const qty = new NumberBox({ label: 'Quantity', min: 1, max: 99, allowEmpty: false });
 * this.panel.controls.add(qty);
 * qty.value = 3;
 */
export class NumberBox extends Field<number | null, NumberBoxProps> {
  constructor(props?: IBaseProp<NumberBoxProps>) {
    super(props);
    const own = (this.props ?? {}) as NumberBoxProps;
    this.element.classList.add('mx-number-box');

    for (const name of ['min', 'max'] as const) this.observeProperty(name, () => this.renderRange());
    for (const name of SHOWN) this.observeProperty(name, () => this.renderShown());
    this.observeProperty('showSpinButtons', () => this.renderSpin());
    this.observeProperty('spinLayout', () => this.renderSpin());
    this.observeProperty<boolean>('wheel', (on) => this.renderWheel(!!on));
    this.observeProperty<string>('placeholder', (text) => this.renderPlaceholder(text));
    this.observeProperty<string>('align', (align) => (this.element.dataset.align = align ?? 'start'));
    this.observeProperty<string>('name', (name) => this.setAttribute('name', name));
    this.observeProperty<string>('autocomplete', (value) => this.setAttribute('autocomplete', value ?? 'off'));

    for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
    if (own.onEnter) this.onEnter(own.onEnter);

    this.listen();
    this.motif.setDisposable(() => {
      const parts = this.numberParts;
      this.stopRepeat();
      parts.stopSpinLabels?.();
      parts.enter.dispose();
    });
  }

  get min(): number | null {
    return finite(this.getProperty('min'));
  }
  set min(value: Bind<number | null>) {
    this.assignProperty('min', value);
  }
  get max(): number | null {
    return finite(this.getProperty('max'));
  }
  set max(value: Bind<number | null>) {
    this.assignProperty('max', value);
  }
  get step(): number {
    const step = finite(this.getProperty('step'));
    return step && step > 0 ? step : 1;
  }
  set step(value: Bind<number>) {
    this.assignProperty('step', value);
  }
  get largeStep(): number {
    const step = finite(this.getProperty('largeStep'));
    return step && step > 0 ? step : shiftDecimal(this.step, 1);
  }
  set largeStep(value: Bind<number>) {
    this.assignProperty('largeStep', value);
  }
  get showSpinButtons(): boolean {
    return this.getProperty<boolean | undefined>('showSpinButtons') !== false;
  }
  set showSpinButtons(value: Bind<boolean>) {
    this.assignProperty('showSpinButtons', value, Boolean);
  }
  get spinLayout(): SpinLayout {
    return this.getProperty<SpinLayout | undefined>('spinLayout') ?? 'stacked';
  }
  set spinLayout(value: Bind<SpinLayout>) {
    this.assignProperty('spinLayout', value);
  }
  get wheel(): boolean {
    return !!this.getProperty<boolean>('wheel');
  }
  set wheel(value: Bind<boolean>) {
    this.assignProperty('wheel', value, Boolean);
  }
  get format(): Intl.NumberFormatOptions {
    return this.getProperty<Intl.NumberFormatOptions | undefined>('format') ?? {};
  }
  set format(value: Bind<Intl.NumberFormatOptions>) {
    this.assignProperty('format', value);
  }
  /** The locale in use: the one set, else the page's. */
  get locale(): string {
    return checkedLocale(this.getProperty<string | undefined>('locale'));
  }
  set locale(value: Bind<string>) {
    this.assignProperty('locale', value);
  }
  get decimals(): number | null {
    return finite(this.getProperty('decimals'));
  }
  set decimals(value: Bind<number | null>) {
    this.assignProperty('decimals', value);
  }
  get clamp(): boolean {
    return this.getProperty<boolean | undefined>('clamp') !== false;
  }
  set clamp(value: Bind<boolean>) {
    this.assignProperty('clamp', value, Boolean);
  }
  get allowEmpty(): boolean {
    return this.getProperty<boolean | undefined>('allowEmpty') !== false;
  }
  set allowEmpty(value: Bind<boolean>) {
    this.assignProperty('allowEmpty', value, Boolean);
  }
  get updateOn(): 'input' | 'change' {
    return this.getProperty<'input' | 'change' | undefined>('updateOn') ?? 'input';
  }
  set updateOn(value: Bind<'input' | 'change'>) {
    this.assignProperty('updateOn', value);
  }
  get placeholder(): string {
    return this.getProperty<string | undefined>('placeholder') ?? '';
  }
  set placeholder(value: Bind<string>) {
    this.assignProperty('placeholder', value);
  }
  get selectOnFocus(): boolean {
    return !!this.getProperty<boolean>('selectOnFocus');
  }
  set selectOnFocus(value: Bind<boolean>) {
    this.assignProperty('selectOnFocus', value, Boolean);
  }
  get align(): 'start' | 'center' | 'end' {
    return this.getProperty<'start' | 'center' | 'end' | undefined>('align') ?? 'start';
  }
  set align(value: Bind<'start' | 'center' | 'end'>) {
    this.assignProperty('align', value);
  }
  get name(): string {
    return this.getProperty<string | undefined>('name') ?? '';
  }
  set name(value: Bind<string>) {
    this.assignProperty('name', value);
  }
  get autocomplete(): string {
    return this.getProperty<string | undefined>('autocomplete') ?? 'off';
  }
  set autocomplete(value: Bind<string>) {
    this.assignProperty('autocomplete', value);
  }

  /** The value as it shows without focus, `''` when empty. Reactive. */
  get formattedValue(): string {
    const value = this.value;
    // Read only to follow them.
    void [this.getProperty('format'), this.getProperty('locale'), this.getProperty('decimals')];
    return value === null ? '' : this.formatter().format(value);
  }

  get inputElement(): HTMLInputElement {
    return this.focusElement as HTMLInputElement;
  }

  get onEnter(): MotifEvent<EnterKeyEventArgs<number | null>> {
    return this.numberParts.enter.event;
  }

  /** Adds `step` × `times`, kept within `min` / `max`, as the up arrow does. */
  stepUp(times = 1): void {
    this.spin(this.peekStep() * times);
  }

  /** Takes `step` × `times` away, as the down arrow does. */
  stepDown(times = 1): void {
    this.spin(-this.peekStep() * times);
  }

  /** Selects the whole text. */
  select(): void {
    this.inputElement.select();
  }

  protected createControl(): HTMLElement {
    const input = document.createElement('input');
    input.type = 'text';
    input.inputMode = 'decimal';
    input.autocomplete = 'off';
    input.className = 'mx-field__input';
    input.setAttribute('role', 'spinbutton');
    return input;
  }

  protected emptyValue(): number | null {
    return null;
  }

  protected override normalizeValue(value: number | null): number | null {
    if (value === null || value === undefined || (value as unknown) === '') return null;
    const n = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(n) ? n : null;
  }

  protected renderValue(value: number | null): void {
    this.showText();
    this.renderAria(value);
    this.renderSpinState();
  }

  protected override renderReadOnly(on: boolean): void {
    super.renderReadOnly(on);
    this.renderSpinState();
  }

  protected override builtInRules(): ValidationRule<number | null>[] {
    const rules = super.builtInRules();
    const min = finite(this.peekProperty('min'));
    const max = finite(this.peekProperty('max'));
    if (min !== null || max !== null) rules.push({ type: 'range', min: min ?? undefined, max: max ?? undefined });
    return rules;
  }

  private get numberParts(): Parts {
    const self = this as unknown as { [PARTS]?: Parts };
    return (self[PARTS] ??= {
      spin: null,
      up: null,
      down: null,
      stopSpinLabels: null,
      repeat: undefined,
      hasFocus: false,
      typing: false,
      editText: null,
      keepSelection: false,
      formatKey: '',
      formatter: null,
      wheel: null,
      enter: new Emitter(),
    });
  }

  private peekLocale(): string {
    return checkedLocale(this.peekProperty<string>('locale'));
  }

  private peekStep(): number {
    const step = finite(this.peekProperty('step'));
    return step && step > 0 ? step : 1;
  }

  private peekLargeStep(): number {
    const step = finite(this.peekProperty('largeStep'));
    return step && step > 0 ? step : shiftDecimal(this.peekStep(), 1);
  }

  /** Percent values are edited as the number shown: 0.25 as 25. */
  private scale(): number {
    return this.peekProperty<Intl.NumberFormatOptions>('format')?.style === 'percent' ? 2 : 0;
  }

  private formatter(): Intl.NumberFormat {
    const parts = this.numberParts;
    const locale = this.peekLocale();
    const format = this.peekProperty<Intl.NumberFormatOptions>('format') ?? {};
    const decimals = finite(this.peekProperty('decimals'));
    const key = `${locale}|${decimals}|${JSON.stringify(format)}`;
    if (parts.formatter && parts.formatKey === key) return parts.formatter;
    const options: Intl.NumberFormatOptions = { ...format };
    if (options.maximumFractionDigits === undefined && options.maximumSignificantDigits === undefined) {
      if (decimals !== null) options.maximumFractionDigits = Math.min(20, Math.max(0, decimals));
      else if (options.style !== 'currency') options.maximumFractionDigits = 20;
    }
    let formatter: Intl.NumberFormat;
    try {
      formatter = new Intl.NumberFormat(locale, options);
    } catch {
      try {
        formatter = new Intl.NumberFormat(locale, { ...options, minimumFractionDigits: options.maximumFractionDigits });
      } catch {
        formatter = new Intl.NumberFormat(locale);
      }
    }
    parts.formatKey = key;
    parts.formatter = formatter;
    return formatter;
  }

  private editTextOf(value: number | null): string {
    return value === null ? '' : plainNumber(shiftDecimal(value, this.scale()), this.peekLocale());
  }

  /** What the field holds, as a value: `null` when empty, `NaN` when it is not a number. */
  private readText(): number | null {
    const read = parseNumber(this.inputElement.value, this.peekLocale());
    return read === null || Number.isNaN(read) ? read : shiftDecimal(read, -this.scale());
  }

  private clampToRange(value: number): number {
    const min = finite(this.peekProperty('min'));
    const max = finite(this.peekProperty('max'));
    if (max !== null && value > max && (min === null || min <= max)) return max;
    if (min !== null && value < min) return min;
    return value;
  }

  private inRange(value: number): boolean {
    return this.clampToRange(value) === value;
  }

  private showText(): void {
    const parts = this.numberParts;
    if (parts.typing) return;
    const value = this.peekValue();
    const text = parts.hasFocus ? this.editTextOf(value) : value === null ? '' : this.formatter().format(value);
    if (parts.hasFocus) parts.editText = text;
    if (this.inputElement.value !== text) this.inputElement.value = text;
  }

  private listen(): void {
    const input = this.inputElement;
    // Only what a number is written with can be typed; a paste is read as well as it can be.
    input.addEventListener('beforeinput', (e) => {
      if (e.inputType === 'insertText' && e.data && !TYPABLE.test(e.data)) e.preventDefault();
    });
    input.addEventListener('input', (e) => this.typed(e));
    input.addEventListener('keydown', (e) => this.keyDown(e));
    input.addEventListener('focus', () => this.gotFocus());
    input.addEventListener('blur', (e) => this.lostFocus(e));
    input.addEventListener('mouseup', (e) => {
      if (!this.numberParts.keepSelection) return;
      this.numberParts.keepSelection = false;
      e.preventDefault();
    });
  }

  private typed(e: Event): void {
    if (this.peekProperty('updateOn') === 'change') return;
    const text = this.inputElement.value;
    const value = this.readText();
    if (value === null) {
      if (this.peekProperty('allowEmpty') !== false) this.commitTyped(null, e);
      return;
    }
    if (Number.isNaN(value) || isPartialNumber(text, this.peekLocale())) return;
    const decimals = finite(this.peekProperty('decimals'));
    if (decimals !== null && roundDecimal(value, decimals) !== value) return;
    if (this.peekProperty('clamp') !== false && !this.inRange(value)) return;
    this.commitTyped(value, e);
  }

  private commitTyped(value: number | null, e: Event): void {
    const parts = this.numberParts;
    parts.typing = true;
    try {
      this.commit(value, e);
    } finally {
      parts.typing = false;
    }
  }

  /** The text is entered (the field is left, Enter): read, rounded, kept in range and shown again. */
  private enterText(event?: Event): void {
    const parts = this.numberParts;
    if (parts.editText !== null && this.inputElement.value === parts.editText) {
      this.showText();
      return;
    }
    let value = this.readText();
    if (value !== null && Number.isNaN(value)) {
      this.showText();
      return;
    }
    if (value === null && this.peekProperty('allowEmpty') === false) value = this.clampToRange(finite(this.peekProperty('min')) ?? 0);
    if (value !== null) {
      const decimals = finite(this.peekProperty('decimals'));
      if (decimals !== null) value = roundDecimal(value, Math.max(0, decimals));
      if (this.peekProperty('clamp') !== false) value = this.clampToRange(value);
    }
    this.commit(value, event);
    this.showText();
  }

  private keyDown(e: KeyboardEvent): void {
    this.numberParts.keepSelection = false;
    if (e.isComposing) return;
    if (e.key === 'Enter') {
      this.enterText(e);
      this.numberParts.enter.fire({ value: this.peekValue(), source: this, event: e });
      return;
    }
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const step = this.peekStep();
    const large = this.peekLargeStep();
    const moves: Record<string, () => boolean> = {
      ArrowUp: () => this.spin(step, e),
      ArrowDown: () => this.spin(-step, e),
      PageUp: () => this.spin(large, e),
      PageDown: () => this.spin(-large, e),
      Home: () => this.goTo(finite(this.peekProperty('min')), e),
      End: () => this.goTo(finite(this.peekProperty('max')), e),
    };
    const move = moves[e.key];
    if (!move) return;
    if ((e.key === 'Home' || e.key === 'End') && (!this.canChange() || finite(this.peekProperty(e.key === 'Home' ? 'min' : 'max')) === null)) return;
    e.preventDefault();
    move();
  }

  private canChange(): boolean {
    return !this.peekProperty('readOnly') && this.isEnabled;
  }

  private goTo(bound: number | null, e: Event): boolean {
    if (bound === null || !this.canChange()) return false;
    this.commit(bound, e);
    this.showText();
    this.inputElement.select();
    return true;
  }

  /** Adds `delta` to what the field holds now; `false` when nothing changed. */
  private spin(delta: number, event?: Event): boolean {
    if (!this.canChange()) return false;
    const parts = this.numberParts;
    const typed = parts.hasFocus ? this.readText() : null;
    const base = typed !== null && !Number.isNaN(typed) ? typed : this.peekValue();
    let next = this.clampToRange(addDecimal(base ?? 0, delta));
    const decimals = finite(this.peekProperty('decimals'));
    if (decimals !== null) next = roundDecimal(next, Math.max(0, decimals));
    const before = this.peekValue();
    this.commit(next, event);
    this.showText();
    return before !== this.peekValue();
  }

  private gotFocus(): void {
    const parts = this.numberParts;
    parts.hasFocus = true;
    this.showText();
    if (!this.peekProperty('selectOnFocus')) return;
    this.inputElement.select();
    parts.keepSelection = true;
  }

  private lostFocus(e: FocusEvent): void {
    const parts = this.numberParts;
    this.stopRepeat();
    parts.keepSelection = false;
    this.enterText(e);
    parts.hasFocus = false;
    parts.editText = null;
    this.showText();
  }

  private setAttribute(name: string, value: string | undefined): void {
    if (value === undefined || value === null || value === '') this.inputElement.removeAttribute(name);
    else this.inputElement.setAttribute(name, value);
  }

  private renderPlaceholder(text: string | undefined): void {
    this.setAttribute('placeholder', text);
    this.element.toggleAttribute('data-placeholder', !!text);
  }

  private renderShown(): void {
    this.showText();
    this.renderAria(this.peekValue());
  }

  private renderRange(): void {
    const min = finite(this.peekProperty('min'));
    const max = finite(this.peekProperty('max'));
    this.setAttribute('aria-valuemin', min === null ? undefined : String(min));
    this.setAttribute('aria-valuemax', max === null ? undefined : String(max));
    this.renderSpinState();
  }

  private renderAria(value: number | null): void {
    this.setAttribute('aria-valuenow', value === null ? undefined : String(value));
    this.setAttribute('aria-valuetext', value === null ? undefined : this.formatter().format(value));
  }

  private renderWheel(on: boolean): void {
    const parts = this.numberParts;
    if (on && !parts.wheel) {
      parts.wheel = (e: WheelEvent) => {
        if (!parts.hasFocus || !e.deltaY) return;
        e.preventDefault();
        this.spin(e.deltaY < 0 ? this.peekStep() : -this.peekStep(), e);
      };
      this.inputElement.addEventListener('wheel', parts.wheel, { passive: false });
    } else if (!on && parts.wheel) {
      this.inputElement.removeEventListener('wheel', parts.wheel);
      parts.wheel = null;
    }
  }

  private renderSpin(): void {
    const parts = this.numberParts;
    const show = this.peekProperty('showSpinButtons') !== false;
    const layout = this.peekProperty<SpinLayout>('spinLayout') ?? 'stacked';
    this.element.toggleAttribute('data-spin', show);
    if (!show) {
      this.stopRepeat();
      parts.stopSpinLabels?.();
      parts.spin?.remove();
      parts.spin = parts.up = parts.down = parts.stopSpinLabels = null;
      return;
    }
    if (!parts.spin) {
      parts.spin = this.area('actions');
      parts.spin.classList.add('mx-number-box__spin');
      parts.up = this.spinButton(1);
      parts.down = this.spinButton(-1);
      const { up, down } = parts;
      parts.stopSpinLabels = effect(() => {
        up.setAttribute('aria-label', uiLocale.strings.increase);
        down.setAttribute('aria-label', uiLocale.strings.decrease);
      });
    }
    const { spin, up, down } = parts as { spin: HTMLSpanElement; up: HTMLButtonElement; down: HTMLButtonElement };
    spin.dataset.layout = layout;
    up.replaceChildren(layout === 'inline' ? plusMark() : chevronUp());
    down.replaceChildren(layout === 'inline' ? dashMark() : chevronDown());
    if (layout === 'inline') spin.replaceChildren(down, up);
    else spin.replaceChildren(up, down);
    this.renderSpinState();
  }

  private spinButton(direction: 1 | -1): HTMLButtonElement {
    const button = document.createElement('button');
    button.type = 'button';
    button.tabIndex = -1;
    button.className = 'mx-field__button mx-number-box__step';
    button.dataset.step = direction > 0 ? 'up' : 'down';
    const delta = () => direction * this.peekStep();
    button.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      if (e.pointerType !== 'touch' && !this.numberParts.hasFocus) this.inputElement.focus();
      button.setPointerCapture?.(e.pointerId);
      this.stopRepeat();
      if (!this.spin(delta(), e)) return;
      const parts = this.numberParts;
      const again = () => {
        parts.repeat = this.spin(delta()) ? setTimeout(again, HOLD[1]) : undefined;
      };
      parts.repeat = setTimeout(again, HOLD[0]);
    });
    for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) button.addEventListener(type, () => this.stopRepeat());
    // A press made with the pointer already counted; a click from assistive technology has no pointer.
    button.addEventListener('click', (e) => {
      if (e.detail === 0) this.spin(delta(), e);
    });
    return button;
  }

  private stopRepeat(): void {
    const parts = this.numberParts;
    clearTimeout(parts.repeat);
    parts.repeat = undefined;
  }

  private renderSpinState(): void {
    const { up, down } = this.numberParts;
    if (!up || !down) return;
    const value = this.peekValue();
    const min = finite(this.peekProperty('min'));
    const max = finite(this.peekProperty('max'));
    const locked = !!this.peekProperty('readOnly');
    up.disabled = locked || (value !== null && max !== null && value >= max);
    down.disabled = locked || (value !== null && min !== null && value <= min);
  }
}
