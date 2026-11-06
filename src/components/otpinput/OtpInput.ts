import { Emitter, type Bind, type Event as MotifEvent, type IBaseProp } from "@motifx/core";
import { mark, shown, text } from "../../core/draw-parts";
import { onLanguage } from "../../core/on-language";
import { uiLocale } from "../../core/ui-locale";
import { Field } from "../../parts/field/Field";
import type { ValidationRule } from "../../parts/validation/validation-rule";
import type { OtpCharset } from "./otp-charset";
import type { OtpCompletedEventArgs } from "./otp-completed-event-args";
import type { OtpInputProps } from "./otp-input-props";

const OWN = ['length', 'charset', 'pattern', 'uppercase', 'masked', 'maskCharacter', 'placeholder', 'groupSize', 'separator', 'autoComplete'] as const;

const CHARSETS: Record<OtpCharset, RegExp> = {
    digits: /\p{Nd}/u,
    letters: /\p{L}/u,
    alphanumeric: /[\p{L}\p{Nd}]/u
};

interface Cell {
    box: HTMLSpanElement;
    char: HTMLSpanElement;
    caret: HTMLSpanElement;
}

/**
 * A one-time code in a row of boxes. It is one real input under the boxes, so typing, pasting a whole code, the code a
 * phone offers from a message and screen readers work as in any text box, and it is one Tab stop. The next character
 * goes into the next box, Backspace goes back, and the arrow keys move between the boxes. This is a field, so the label,
 * help text, rules and `x-model` work as in all fields. `onCompleted` occurs when every box is filled.
 *
 * @example
 * <OtpInput label="Verification code" x-model={() => this.code} onCompleted={e => this.verify(e.value)} />
 * <OtpInput label="Access key" length={8} charset="alphanumeric" uppercase groupSize={4} />
 * <OtpInput label="PIN" length={4} masked />
 */
export class OtpInput extends Field<string, OtpInputProps> {
    completed = new Emitter<OtpCompletedEventArgs>();
    cells: Cell[] = [];
    row!: HTMLDivElement;
    /** The complete value told last, so that it is told once. */
    told: string | null = null;

    constructor(props?: IBaseProp<OtpInputProps>) {
        super(props);
        const own = (this.props ?? {}) as OtpInputProps;
        const input = this.input;
        this.element.classList.add('mx-otp-input');
        this.row = input.parentElement!.appendChild(document.createElement('div'));
        this.row.className = 'mx-otp-input__cells';
        this.row.setAttribute('dir', 'ltr');
        this.row.setAttribute('aria-hidden', 'true');
        for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
        // The field took the value before the length and the accepted characters were known.
        if (own.value !== undefined) this.value = own.value;
        if (own.onCompleted) this.onCompleted(own.onCompleted);

        for (const name of ['length', 'groupSize', 'separator'] as const) this.observeProperty(name, () => this.renderCells());
        for (const name of ['charset', 'pattern', 'uppercase'] as const) this.observeProperty(name, () => this.renderRules());
        for (const name of ['masked', 'maskCharacter', 'placeholder'] as const) this.observeProperty(name, () => this.drawCells());
        this.observeProperty<string>('autoComplete', () => this.renderInput());
        input.addEventListener('beforeinput', e => this.beforeInput(e));
        input.addEventListener('input', e => this.typed(e));
        input.addEventListener('focus', () => this.placeCaret());
        input.addEventListener('blur', () => this.drawCells());
        input.addEventListener('pointerup', e => this.pressed(e));
        for (const name of ['keyup', 'select'] as const) input.addEventListener(name, () => this.drawCells());
        onLanguage(this, () => this.renderInput());
        this.motif.setDisposable(() => this.completed.dispose());
        this.renderCells();
    }

    // Properties (see OtpInputProps).

    get length(): number {
        const count = Math.trunc(Number(this.getProperty('length') ?? 6));
        return count >= 1 ? count : 6;
    }
    set length(value: Bind<number>) {
        this.assignProperty('length', value);
    }
    get charset(): OtpCharset {
        return this.getProperty<OtpCharset | undefined>('charset') ?? 'digits';
    }
    set charset(value: Bind<OtpCharset>) {
        this.assignProperty('charset', value);
    }
    get pattern(): RegExp | null {
        return this.getProperty<RegExp | null | undefined>('pattern') ?? null;
    }
    set pattern(value: Bind<RegExp | null>) {
        this.assignProperty('pattern', value);
    }
    get uppercase(): boolean {
        return this.getProperty<boolean | undefined>('uppercase') ?? false;
    }
    set uppercase(value: Bind<boolean>) {
        this.assignProperty('uppercase', value);
    }
    get masked(): boolean {
        return this.getProperty<boolean | undefined>('masked') ?? false;
    }
    set masked(value: Bind<boolean>) {
        this.assignProperty('masked', value);
    }
    get maskCharacter(): string {
        return this.getProperty<string | undefined>('maskCharacter') || '•';
    }
    set maskCharacter(value: Bind<string>) {
        this.assignProperty('maskCharacter', value);
    }
    get placeholder(): string {
        return this.getProperty<string | undefined>('placeholder') ?? '';
    }
    set placeholder(value: Bind<string>) {
        this.assignProperty('placeholder', value);
    }
    get groupSize(): number | null {
        return this.getProperty<number | null | undefined>('groupSize') ?? null;
    }
    set groupSize(value: Bind<number | null>) {
        this.assignProperty('groupSize', value);
    }
    get separator(): string {
        return this.getProperty<string | undefined>('separator') || '–';
    }
    set separator(value: Bind<string>) {
        this.assignProperty('separator', value);
    }
    get autoComplete(): string {
        return this.getProperty<string | undefined>('autoComplete') || 'one-time-code';
    }
    set autoComplete(value: Bind<string>) {
        this.assignProperty('autoComplete', value);
    }
    get onCompleted(): MotifEvent<OtpCompletedEventArgs> {
        return this.completed.event;
    }

    /** Indicates that every box is filled. */
    get isComplete(): boolean {
        return this.peekValue().length === this.length;
    }

    /** Empties the boxes and puts the caret in the first one. */
    clear(): void {
        this.commit('');
        this.focus();
    }

    protected createControl(): HTMLElement {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'mx-otp-input__input';
        input.spellcheck = false;
        input.setAttribute('autocorrect', 'off');
        input.setAttribute('dir', 'ltr');
        return input;
    }

    protected emptyValue(): string {
        return '';
    }

    protected override normalizeValue(value: string): string {
        return this.accepted(value == null ? '' : String(value));
    }

    protected override builtInRules(): ValidationRule<string>[] {
        const incomplete: ValidationRule<string> = {
            type: 'custom',
            check: value => value.length === this.length || uiLocale.text('otpIncomplete', { count: this.length })
        };
        return [...super.builtInRules(), incomplete];
    }

    protected renderValue(value: string): void {
        const input = this.input;
        if (input.value !== value) input.value = value;
        this.drawCells();
    }

    get input(): HTMLInputElement {
        return this.focusElement as HTMLInputElement;
    }

    /** The characters of `value` the field takes, at most `length` of them. */
    accepted(value: string): string {
        const test = this.pattern ?? CHARSETS[this.charset] ?? CHARSETS.digits;
        const upper = this.peekProperty<boolean | undefined>('uppercase');
        const taken = [...value].filter(char => new RegExp(test.source, test.flags.replace(/[gy]/g, '')).test(char));
        const joined = taken.slice(0, this.length).join('');
        return upper ? joined.toLocaleUpperCase(uiLocale.locale) : joined;
    }

    renderInput(): void {
        const input = this.input;
        input.autocomplete = this.autoComplete as AutoFill;
        input.inputMode = this.charset === 'digits' && !this.pattern ? 'numeric' : 'text';
        input.setAttribute('autocapitalize', this.uppercase ? 'characters' : 'off');
    }

    // No `maxlength`: it would cut a pasted code before its separators are left out.
    renderRules(): void {
        this.renderInput();
        this.fitValue();
    }

    // What the field holds no longer fits the new rules: cut to fit, and the model follows.
    fitValue(): void {
        const value = this.peekValue();
        const fitted = this.accepted(value);
        if (fitted === value) return;
        this.changeProperty('value', fitted);
        this.writeBack(fitted);
    }

    renderCells(): void {
        const count = this.length;
        const row = this.row;
        const group = this.groupSize;
        row.textContent = '';
        this.cells = Array.from({ length: count }, (_, index) => {
            const box = document.createElement('span');
            box.className = 'mx-otp-input__cell';
            const char = box.appendChild(document.createElement('span'));
            char.className = 'mx-otp-input__char';
            const caret = box.appendChild(document.createElement('span'));
            caret.className = 'mx-otp-input__caret';
            row.append(box);
            if (group && group > 0 && (index + 1) % group === 0 && index + 1 < count) {
                const line = row.appendChild(document.createElement('span'));
                line.className = 'mx-otp-input__separator';
                line.textContent = this.separator;
            }
            return { box, char, caret };
        });
        this.renderInput();
        this.fitValue();
        this.renderValue(this.peekValue());
    }

    drawCells(): void {
        // The field gives its first value before the boxes exist.
        if (!this.row) return;
        const input = this.input;
        const value = this.peekValue();
        const chars = [...value];
        const focused = input.ownerDocument.activeElement === input;
        const at = Math.min(input.selectionStart ?? chars.length, this.length - 1);
        const masked = this.masked;
        this.cells.forEach((cell, index) => {
            const filled = index < chars.length;
            text(cell.char, filled ? (masked ? this.maskCharacter : chars[index]) : this.placeholder);
            mark(cell.box, 'data-filled', filled);
            mark(cell.box, 'data-active', focused && index === at);
            shown(cell.caret, focused && index === at && !filled);
        });
    }

    // A character typed into a filled box takes its place.
    beforeInput(e: InputEvent): void {
        const input = this.input;
        const start = input.selectionStart ?? 0;
        if (e.inputType !== 'insertText' || input.selectionEnd !== start || start >= input.value.length) return;
        input.setSelectionRange(start, start + 1);
    }

    typed(e: Event): void {
        const input = this.input;
        const written = input.value;
        const value = this.accepted(written);
        const caret = Math.min(this.accepted(written.slice(0, input.selectionStart ?? written.length)).length, value.length);
        if (written !== value) input.value = value;
        input.setSelectionRange(caret, caret);
        this.commit(value, e);
        this.drawCells();
        if (this.isComplete && this.told !== value) {
            this.told = value;
            this.completed.fire({ value, source: this, originalEvent: e });
        } else if (!this.isComplete) this.told = null;
    }

    // Focus goes to the first empty box, unless a box was pressed.
    placeCaret(): void {
        const end = this.input.value.length;
        this.input.setSelectionRange(end, end);
        this.drawCells();
    }

    // A press puts the caret in the box under the pointer, but not beyond the characters.
    pressed(e: PointerEvent): void {
        const input = this.input;
        const under = this.cells.findIndex(cell => {
            const box = cell.box.getBoundingClientRect();
            return e.clientX >= box.left && e.clientX <= box.right;
        });
        if (under >= 0) {
            const at = Math.min(under, input.value.length);
            input.setSelectionRange(at, at);
        }
        this.drawCells();
    }
}
