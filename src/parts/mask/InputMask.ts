import type { InputMaskOptions } from './input-mask-options';
import { MaskedText } from './MaskedText';
import { parseMask } from './parse-mask';

/**
 * Keeps what is typed into an `<input>` in the shape of a mask. Typing, deleting and pasting
 * follow the mask and the caret skips the fixed characters. An `input` event is fired after
 * every change.
 *
 * @example
 * const phone = new InputMask(input, { mask: '(000) 000 00 00' });
 * phone.raw; // '5321234567'
 */
export class InputMask {
  private text: MaskedText;
  private options: InputMaskOptions;
  private writing = false;
  private readonly abort = new AbortController();

  constructor(
    readonly input: HTMLInputElement,
    options: InputMaskOptions,
  ) {
    this.options = options;
    this.text = this.create(options);
    this.text.setText(input.value);
    const signal = this.abort.signal;
    input.addEventListener('beforeinput', (e) => this.beforeInput(e), { signal });
    // Before the app's own listeners: they read the value already in shape.
    input.addEventListener('input', (e) => this.afterInput(e as InputEvent), { signal, capture: true });
    input.addEventListener('compositionend', () => this.takeInput(), { signal });
    input.addEventListener('focus', () => this.focused(), { signal });
    input.addEventListener('blur', () => this.show(), { signal });
    input.addEventListener('mouseup', () => this.clampCaret(), { signal });
    input.addEventListener('keyup', () => this.clampCaret(), { signal });
    this.show();
  }

  /** The typed characters only: `5321234567`. */
  get raw(): string {
    return this.text.raw;
  }

  /** With the fixed characters: `(532) 123 45 67`. */
  get formatted(): string {
    return this.text.formatted;
  }

  get complete(): boolean {
    return this.text.complete;
  }

  get empty(): boolean {
    return this.text.empty;
  }

  setRaw(raw: string): void {
    this.text.setRaw(raw);
    this.show();
  }

  setFormatted(text: string): void {
    this.text.setText(text);
    this.show();
  }

  /** `value` in the shape of the mask, without changing the input. */
  conform(value: string, formatted = false): string {
    const text = new MaskedText(this.text.slots, this.text.placeholder);
    if (formatted) text.setText(value);
    else text.setRaw(value);
    return formatted ? text.formatted : text.raw;
  }

  /** What was typed stays where it still fits. */
  update(options: InputMaskOptions): void {
    const raw = this.text.raw;
    this.options = options;
    this.text = this.create(options);
    this.text.setRaw(raw);
    this.show();
  }

  destroy(): void {
    this.abort.abort();
  }

  private create(options: InputMaskOptions): MaskedText {
    return new MaskedText(parseMask(options.mask, options.chars), options.placeholder ?? '_');
  }

  private get hasFocus(): boolean {
    return this.input.ownerDocument.activeElement === this.input;
  }

  private beforeInput(e: InputEvent): void {
    if (this.input.readOnly || e.isComposing) return;
    const type = e.inputType;
    const from = this.input.selectionStart ?? 0;
    const to = this.input.selectionEnd ?? from;
    const before = this.text.raw;
    let caret: number;
    if (type.startsWith('delete')) {
      caret = type.includes('Backward') ? this.text.deleteBackward(from, to) : this.text.deleteForward(from, to);
    } else if (type.startsWith('insert') && type !== 'insertLineBreak' && type !== 'insertParagraph' && type !== 'insertCompositionText') {
      // Typing past the filled part goes on at the first empty place.
      const at = from === to ? this.text.clamp(from) : from;
      caret = this.text.insert(at, from === to ? at : to, e.data ?? e.dataTransfer?.getData('text/plain') ?? '');
    } else {
      return;
    }
    e.preventDefault();
    this.show(caret);
    if (this.text.raw !== before) this.announce(type, e.data);
  }

  /** The browser changed the text by itself: autofill, an input method, undo. */
  private afterInput(e: InputEvent): void {
    if (!this.writing && !e.isComposing) this.takeInput();
  }

  private takeInput(): void {
    const placeholder = this.text.placeholder;
    this.text.setText(placeholder ? this.input.value.split(placeholder).join('') : this.input.value);
    this.show(this.text.positionOf(this.text.raw.length));
  }

  private announce(inputType: string, data: string | null): void {
    this.writing = true;
    try {
      this.input.dispatchEvent(new InputEvent('input', { bubbles: true, inputType, data }));
    } finally {
      this.writing = false;
    }
  }

  private show(caret?: number): void {
    const hidden = this.options.showMask !== 'always' && this.text.empty && !this.hasFocus;
    const value = hidden ? '' : this.text.text;
    if (this.input.value !== value) this.input.value = value;
    if (caret !== undefined && this.hasFocus) this.input.setSelectionRange(caret, caret);
  }

  private focused(): void {
    this.show();
    // The click that focused the input places the caret after this.
    setTimeout(() => this.clampCaret());
  }

  private clampCaret(): void {
    const { selectionStart: from, selectionEnd: to } = this.input;
    if (from === null || from !== to || !this.hasFocus) return;
    const caret = this.text.clamp(from);
    if (caret !== from) this.input.setSelectionRange(caret, caret);
  }
}
