import { Emitter, type Bind, type Event as MotifEvent, type IBaseProp } from '@motifx/core';
import type { InputMode } from '../../core/input-mode';
import { eyeClosed, eyeOpen } from '../../core/glyphs';
import { uiLocale } from '../../core/ui-locale';
import type { EnterKeyEventArgs } from '../../parts/field/enter-key-event-args';
import { Field } from '../../parts/field/Field';
import { InputMask } from '../../parts/mask/InputMask';
import type { MaskChar } from '../../parts/mask/mask-char';
import type { ValidationRule } from '../../parts/validation/validation-rule';
import type { TextBoxProps } from './text-box-props';
import type { TextBoxType } from './text-box-type';
import { onLanguage } from '../../core/on-language';

const OWN = [
  'type',
  'placeholder',
  'maxLength',
  'minLength',
  'showCounter',
  'clearButton',
  'passwordReveal',
  'updateOn',
  'selectOnFocus',
  'align',
  'inputMode',
  'autocomplete',
  'spellcheck',
  'name',
  // The characters before the mask that uses them.
  'maskChars',
  'maskPlaceholder',
  'maskValue',
  'showMask',
  'mask',
] as const;

const MASKING = ['mask', 'maskChars', 'maskPlaceholder', 'showMask'] as const;

/** Types the browser lets a script move the caret in; a mask needs that. */
const CARET_TYPES = ['text', 'search', 'tel', 'url', 'password'];

const PARTS = Symbol('mx.textbox');

interface Parts {
  mask: InputMask | null;
  reveal: HTMLButtonElement | null;
  stopRevealLabel: (() => void) | null;
  revealed: boolean;
  /** The text was selected on focus: the mouseup of the same click must not undo it. */
  keepSelection: boolean;
  enter: Emitter<EnterKeyEventArgs<string>>;
}

/**
 * A one-line text field: a label, a placeholder, a clear button, a password that can be shown, a
 * character counter, a mask (`(000) 000 00 00`) and validation. `x-model` binds the value.
 *
 * @example
 * <TextBox label="&Email" type="email" required x-model={() => this.form.email} />
 * <TextBox label="Phone" mask="(000) 000 00 00" x-model={() => this.form.phone} />
 *
 * const name = new TextBox({ label: 'Name', clearButton: true });
 * this.panel.controls.add(name);
 * name.value = 'Ada';
 */
export class TextBox extends Field<string, TextBoxProps> {
  constructor(props?: IBaseProp<TextBoxProps>) {
    super(props);
    const own = (this.props ?? {}) as TextBoxProps;
    this.element.classList.add('mx-text-box');

    this.observeProperty('type', () => this.renderType());
    this.observeProperty('passwordReveal', () => this.renderType());
    this.observeProperty<string>('placeholder', (text) => this.renderPlaceholder(text));
    this.observeProperty('maxLength', () => this.renderMaxLength());
    this.observeProperty('showCounter', () => this.renderCounter());
    this.observeProperty('clearButton', () => this.renderClear());
    this.observeProperty<string>('align', (align) => (this.element.dataset.align = align ?? 'start'));
    this.observeProperty<string>('inputMode', (mode) => this.setAttribute('inputmode', mode));
    this.observeProperty<string>('autocomplete', (value) => this.setAttribute('autocomplete', value));
    this.observeProperty<boolean>('spellcheck', (on) => this.setAttribute('spellcheck', on === undefined ? undefined : String(on)));
    this.observeProperty<string>('name', (name) => this.setAttribute('name', name));
    for (const name of MASKING) this.observeProperty(name, () => this.renderMask());
    this.observeProperty('maskValue', () => this.renderMask());

    for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
    if (own.onEnter) this.onEnter(own.onEnter);

    this.listen();
    this.motif.setDisposable(() => {
      const parts = this.textParts;
      parts.mask?.destroy();
      parts.stopRevealLabel?.();
      parts.enter.dispose();
    });
  }

  get type(): TextBoxType {
    return this.getProperty<TextBoxType | undefined>('type') ?? 'text';
  }
  set type(value: Bind<TextBoxType>) {
    this.assignProperty('type', value);
  }
  get placeholder(): string {
    return this.getProperty<string | undefined>('placeholder') ?? '';
  }
  set placeholder(value: Bind<string>) {
    this.assignProperty('placeholder', value);
  }
  get maxLength(): number | null {
    return this.getProperty<number | undefined>('maxLength') ?? null;
  }
  set maxLength(value: Bind<number | null>) {
    this.assignProperty('maxLength', value);
  }
  get minLength(): number | null {
    return this.getProperty<number | undefined>('minLength') ?? null;
  }
  set minLength(value: Bind<number | null>) {
    this.assignProperty('minLength', value);
  }
  get showCounter(): boolean {
    return !!this.getProperty<boolean>('showCounter');
  }
  set showCounter(value: Bind<boolean>) {
    this.assignProperty('showCounter', value, Boolean);
  }
  get clearButton(): boolean {
    return !!this.getProperty<boolean>('clearButton');
  }
  set clearButton(value: Bind<boolean>) {
    this.assignProperty('clearButton', value, Boolean);
  }
  get passwordReveal(): boolean {
    return this.getProperty<boolean | undefined>('passwordReveal') !== false;
  }
  set passwordReveal(value: Bind<boolean>) {
    this.assignProperty('passwordReveal', value, Boolean);
  }
  get updateOn(): 'input' | 'change' {
    return this.getProperty<'input' | 'change' | undefined>('updateOn') ?? 'input';
  }
  set updateOn(value: Bind<'input' | 'change'>) {
    this.assignProperty('updateOn', value);
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
  get inputMode(): InputMode | null {
    return this.getProperty<InputMode | undefined>('inputMode') ?? null;
  }
  set inputMode(value: Bind<InputMode | null>) {
    this.assignProperty('inputMode', value);
  }
  get autocomplete(): string {
    return this.getProperty<string | undefined>('autocomplete') ?? '';
  }
  set autocomplete(value: Bind<string>) {
    this.assignProperty('autocomplete', value);
  }
  get spellcheck(): boolean | null {
    return this.getProperty<boolean | undefined>('spellcheck') ?? null;
  }
  set spellcheck(value: Bind<boolean>) {
    this.assignProperty('spellcheck', value, Boolean);
  }
  get name(): string {
    return this.getProperty<string | undefined>('name') ?? '';
  }
  set name(value: Bind<string>) {
    this.assignProperty('name', value);
  }
  get mask(): string {
    return this.getProperty<string | undefined>('mask') ?? '';
  }
  set mask(value: Bind<string>) {
    this.assignProperty('mask', value);
  }
  get maskChars(): Readonly<Record<string, MaskChar>> {
    return this.getProperty<Readonly<Record<string, MaskChar>> | undefined>('maskChars') ?? {};
  }
  set maskChars(value: Bind<Readonly<Record<string, MaskChar>>>) {
    this.assignProperty('maskChars', value);
  }
  get maskPlaceholder(): string {
    return this.getProperty<string | undefined>('maskPlaceholder') ?? '_';
  }
  set maskPlaceholder(value: Bind<string>) {
    this.assignProperty('maskPlaceholder', value);
  }
  get maskValue(): 'raw' | 'formatted' {
    return this.getProperty<'raw' | 'formatted' | undefined>('maskValue') ?? 'raw';
  }
  set maskValue(value: Bind<'raw' | 'formatted'>) {
    this.assignProperty('maskValue', value);
  }
  get showMask(): 'always' | 'focus' {
    return this.getProperty<'always' | 'focus' | undefined>('showMask') ?? 'focus';
  }
  set showMask(value: Bind<'always' | 'focus'>) {
    this.assignProperty('showMask', value);
  }

  /** Every place of the mask is filled; `true` without a mask. */
  get maskComplete(): boolean {
    return this.textParts.mask?.complete ?? true;
  }

  get inputElement(): HTMLInputElement {
    return this.focusElement as HTMLInputElement;
  }

  get onEnter(): MotifEvent<EnterKeyEventArgs<string>> {
    return this.textParts.enter.event;
  }

  /** Selects the whole text. */
  select(): void {
    this.inputElement.select();
  }

  /** Empties the field as its clear button does. */
  clear(): void {
    this.commit('');
  }

  protected createControl(): HTMLElement {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'mx-field__input';
    return input;
  }

  protected emptyValue(): string {
    return '';
  }

  protected override normalizeValue(value: string): string {
    const text = value == null ? '' : String(value);
    const mask = this.textParts.mask;
    return mask ? mask.conform(text, this.peekProperty('maskValue') === 'formatted') : text;
  }

  protected renderValue(value: string): void {
    const mask = this.textParts.mask;
    if (mask && this.peekProperty('maskValue') === 'formatted') mask.setFormatted(value);
    else if (mask) mask.setRaw(value);
    else if (this.inputElement.value !== value) this.inputElement.value = value;
    this.renderCounter();
  }

  protected override builtInRules(): ValidationRule<string>[] {
    const rules = super.builtInRules();
    const mask = this.textParts.mask;
    const min = this.peekProperty<number>('minLength');
    const max = mask ? undefined : this.peekProperty<number>('maxLength');
    if (min || max) rules.push({ type: 'length', min: min || undefined, max: max || undefined });
    const type = this.peekProperty<TextBoxType>('type');
    if (type === 'email' || type === 'url') rules.push({ type });
    if (mask) rules.push({ type: 'custom', check: () => mask.complete, message: () => uiLocale.strings.incomplete });
    return rules;
  }

  private get textParts(): Parts {
    const self = this as unknown as { [PARTS]?: Parts };
    return (self[PARTS] ??= {
      mask: null,
      reveal: null,
      stopRevealLabel: null,
      revealed: false,
      keepSelection: false,
      enter: new Emitter(),
    });
  }

  /** What the input holds, as the value. */
  private readInput(): string {
    const mask = this.textParts.mask;
    if (!mask) return this.inputElement.value;
    return this.peekProperty('maskValue') === 'formatted' ? mask.formatted : mask.raw;
  }

  private listen(): void {
    const input = this.inputElement;
    input.addEventListener('input', (e) => {
      this.renderCounter();
      if (this.peekProperty('updateOn') !== 'change') this.commit(this.readInput(), e);
    });
    input.addEventListener('change', (e) => this.commit(this.readInput(), e));
    input.addEventListener('keydown', (e) => this.keyDown(e));
    input.addEventListener('focus', () => this.gotFocus());
    input.addEventListener('blur', () => (this.textParts.keepSelection = false));
    input.addEventListener('mouseup', (e) => {
      if (!this.textParts.keepSelection) return;
      this.textParts.keepSelection = false;
      e.preventDefault();
    });
  }

  private keyDown(e: KeyboardEvent): void {
    this.textParts.keepSelection = false;
    if (e.key === 'Enter' && !e.isComposing) {
      this.commit(this.readInput(), e);
      this.textParts.enter.fire({ value: this.peekValue(), source: this, event: e });
    } else if (e.key === 'Escape' && this.peekProperty('clearButton') && !this.peekProperty('readOnly') && !this.isEmptyValue(this.peekValue())) {
      e.preventDefault();
      e.stopPropagation();
      this.commit('', e);
    }
  }

  private gotFocus(): void {
    if (!this.peekProperty('selectOnFocus')) return;
    this.inputElement.select();
    this.textParts.keepSelection = true;
  }

  private setAttribute(name: string, value: string | undefined): void {
    if (value === undefined || value === null || value === '') this.inputElement.removeAttribute(name);
    else this.inputElement.setAttribute(name, value);
  }

  private renderPlaceholder(text: string | undefined): void {
    this.setAttribute('placeholder', text);
    this.element.toggleAttribute('data-placeholder', !!text);
  }

  private renderMaxLength(): void {
    const max = this.peekProperty<number>('maxLength');
    this.setAttribute('maxlength', max && !this.textParts.mask ? String(max) : undefined);
    this.renderCounter();
  }

  private renderCounter(): void {
    if (!this.peekProperty('showCounter')) {
      this.setCounter('');
      return;
    }
    const length = this.readInput().length;
    const max = this.peekProperty<number>('maxLength');
    this.setCounter(max ? `${length}/${max}` : String(length));
  }

  private renderType(): void {
    const parts = this.textParts;
    const type = this.peekProperty<TextBoxType>('type') ?? 'text';
    const password = type === 'password';
    const reveal = password && this.peekProperty('passwordReveal') !== false;
    if (!reveal) parts.revealed = false;
    let shown: string = password && parts.revealed ? 'text' : type;
    if (parts.mask && !CARET_TYPES.includes(shown)) shown = 'text';
    this.inputElement.type = shown;
    this.renderReveal(reveal);
  }

  private renderReveal(on: boolean): void {
    const parts = this.textParts;
    if (!on) {
      parts.stopRevealLabel?.();
      parts.reveal?.remove();
      parts.reveal = parts.stopRevealLabel = null;
      return;
    }
    if (!parts.reveal) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'mx-field__button mx-text-box__reveal';
      button.addEventListener('click', () => this.toggleReveal());
      parts.stopRevealLabel = onLanguage(this, () => button.setAttribute('aria-label', uiLocale.strings.showPassword));
      this.area('tools').append(button);
      parts.reveal = button;
    }
    parts.reveal.setAttribute('aria-pressed', String(parts.revealed));
    parts.reveal.replaceChildren(parts.revealed ? eyeClosed() : eyeOpen());
  }

  private toggleReveal(): void {
    const parts = this.textParts;
    const input = this.inputElement;
    const { selectionStart, selectionEnd } = input;
    parts.revealed = !parts.revealed;
    this.renderType();
    if (selectionStart !== null) input.setSelectionRange(selectionStart, selectionEnd);
  }

  private renderClear(): void {
    this.showClearButton(!!this.peekProperty('clearButton'), (e) => this.commit('', e), 'mx-text-box__clear');
  }

  private renderMask(): void {
    const parts = this.textParts;
    const pattern = this.peekProperty<string>('mask');
    if (!pattern) {
      if (!parts.mask) return;
      parts.mask.destroy();
      parts.mask = null;
      this.inputElement.value = this.peekValue();
    } else {
      const options = {
        mask: pattern,
        chars: this.peekProperty<Readonly<Record<string, MaskChar>>>('maskChars'),
        placeholder: this.peekProperty<string>('maskPlaceholder'),
        showMask: this.peekProperty<'always' | 'focus'>('showMask'),
      };
      if (parts.mask) parts.mask.update(options);
      else parts.mask = new InputMask(this.inputElement, options);
      this.renderValue(this.peekValue());
    }
    this.renderType();
    this.renderMaxLength();
    // The value takes the shape of the new mask.
    const shaped = this.readInput();
    if (shaped !== this.peekValue()) {
      this.changeProperty('value', shaped);
      this.bindings.writeModel(shaped);
    }
  }
}
