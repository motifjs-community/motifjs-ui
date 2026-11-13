import type { ComponentBase } from '@motifx/core';
import { isFocused } from '../../core/focus';
import type { InputMaskOptions } from './input-mask-options';
import { MaskedText } from './MaskedText';
import { parseMask } from './parse-mask';

/**
 * Keeps what is typed into an `<input>` in the shape of a mask. Typing, deleting and pasting
 * follow the mask, and the caret skips the fixed characters. An `input` event is raised after
 * every change.
 *
 * @example
 * const phone = new InputMask(input, { mask: '(000) 000 00 00' });
 * phone.raw; // '5321234567'
 */
export class InputMask {
  /** Whether typing is refused now. A field answers from its own `readOnly`; the default asks the input. */
  readOnly: () => boolean = () => this.field.attr.has('readonly');

  private text: MaskedText;
  private options: InputMaskOptions;
  private writing = false;
  private caretTimer: ReturnType<typeof setTimeout> | undefined;
  /** The input, as the component given. */
  private readonly field: ComponentBase<HTMLInputElement>;
  /** Stops listening on the input. */
  private readonly stop: () => void;

  /** `input`: the `<input>` component, such as a field's input part. */
  constructor(input: ComponentBase<HTMLInputElement>, options: InputMaskOptions) {
    this.field = input;
    this.options = options;
    this.text = this.create(options);
    // browser object read: allowed exception
    this.text.setText(this.input.value);
    type Handler = (sender: ComponentBase, e: Event) => void;
    const on: [string, Handler][] = [
      ['beforeinput', (_, e) => this.beforeInput(e as InputEvent)],
      // Before the app's own listeners: they read the value already in shape.
      ['input:capture', (_, e) => this.afterInput(e as InputEvent)],
      ['compositionend', () => this.takeInput()],
      ['focus', () => this.focused()],
      ['blur', () => this.show()],
      ['mouseup', () => this.clampCaret()],
      ['keyup', () => this.clampCaret()],
    ];
    for (const [name, handler] of on) void this.field.motif.on(name as 'click', handler);
    this.stop = () => {
      for (const [name, handler] of on) void this.field.motif.off(name as 'click', handler);
    };
    this.show();
  }

  // browser object read: allowed exception (the input's value and selection are read through it)
  get input(): HTMLInputElement {
    return this.field.element;
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

  /** Returns `value` in the shape of the mask, without changing the input. */
  conform(value: string, formatted = false): string {
    const text = new MaskedText(this.text.slots, this.text.placeholder);
    if (formatted) text.setText(value);
    else text.setRaw(value);
    return formatted ? text.formatted : text.raw;
  }

  /** Updates the options. What was typed stays where it still fits. */
  update(options: InputMaskOptions): void {
    const raw = this.text.raw;
    this.options = options;
    this.text = this.create(options);
    this.text.setRaw(raw);
    this.show();
  }

  destroy(): void {
    clearTimeout(this.caretTimer);
    this.stop();
  }

  private create(options: InputMaskOptions): MaskedText {
    return new MaskedText(parseMask(options.mask, options.chars), options.placeholder ?? '_');
  }

  private beforeInput(e: InputEvent): void {
    if (this.readOnly() || e.isComposing) return;
    const type = e.inputType;
    // browser object read: allowed exception
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
    // browser object read: allowed exception
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
    const focused = isFocused(this.field);
    const hidden = this.options.showMask !== 'always' && this.text.empty && !focused;
    this.field.attr.add({ value: hidden ? '' : this.text.text });
    // At once, not a turn later: the next key's `beforeinput` reads the caret.
    if (caret !== undefined && focused) this.input.setSelectionRange(caret, caret);
  }

  private focused(): void {
    this.show();
    // The click that focused the input places the caret after this.
    clearTimeout(this.caretTimer);
    this.caretTimer = setTimeout(() => this.clampCaret());
  }

  private clampCaret(): void {
    // A turn after focus the field may be gone.
    if (this.field.isDisposed) return;
    // browser object read: allowed exception
    const { selectionStart: from, selectionEnd: to } = this.input;
    if (from === null || from !== to || !isFocused(this.field)) return;
    const caret = this.text.clamp(from);
    if (caret !== from) this.input.setSelectionRange(caret, caret);
  }
}
