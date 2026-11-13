import { Emitter, type Bind, type Component, type ComponentBase, type Event as MotifEvent, type IBaseProp } from "@motifx/core";
import { loose, part, removePart } from "../../core/draw-parts";
import { onLanguage } from "../../core/on-language";
import { rectOf } from "../../core/measure";
import { kept, mark, put, shown, text } from "../../core/part-writes";
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
    boxPart: Component<HTMLSpanElement>;
    charPart: Component<HTMLSpanElement>;
    caretPart: Component<HTMLSpanElement>;
    /** The separator after the box, in the page only at the end of a group. */
    separatorPart: Component<HTMLSpanElement>;
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
    rowPart!: Component<HTMLDivElement>;
    /** The complete value told last, so that it is told once. */
    told: string | null = null;
    /** A character typed into a filled box, from its `beforeinput` to its `input`: it takes the place of the next one. */
    replacing: { at: number; data: string; before: string } | null = null;

    constructor(props?: IBaseProp<OtpInputProps>) {
        super(props);
        const own = (this.props ?? {}) as OtpInputProps;
        this.class.add('mx-otp-input');
        // The boxes, in the field's box after the input.
        this.rowPart = part<HTMLDivElement>(this.boxPart, 'div', 'mx-otp-input__cells');
        this.rowPart.attr.add({ dir: 'ltr', 'aria-hidden': 'true' });
        for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
        // The field took the value before the length and the accepted characters were known.
        if (own.value !== undefined) this.value = own.value;
        if (own.onCompleted) this.onCompleted(own.onCompleted);

        for (const name of ['length', 'groupSize', 'separator'] as const) this.observeProperty(name, () => this.renderCells());
        for (const name of ['charset', 'pattern', 'uppercase'] as const) this.observeProperty(name, () => this.renderRules());
        for (const name of ['masked', 'maskCharacter', 'placeholder'] as const) this.observeProperty(name, () => this.drawCells());
        this.observeProperty<string>('autoComplete', () => this.renderInput());
        const control = this.controlPart;
        control.motif.on('beforeinput', (_, e) => this.beforeInput(e));
        control.motif.on('input', (_, e) => this.typed(e));
        control.motif.on('focus', () => this.placeCaret());
        control.motif.on('blur', () => this.drawCells());
        control.motif.on('pointerup', (_, e) => this.pressed(e));
        control.motif.on('keyup', () => this.drawCells());
        control.motif.on('select', () => this.drawCells());
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

    protected override get controlTag(): string {
        return 'input';
    }

    protected createControl(): ComponentBase {
        const control = loose<HTMLInputElement>('input', 'mx-otp-input__input');
        control.attr.add({ type: 'text', spellcheck: 'false', autocorrect: 'off', dir: 'ltr' });
        return control;
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
        // Core writes the input's value only when it differs.
        this.controlPart.attr.add({ value });
        this.drawCells();
    }

    /** The hidden input that takes the keys, as a component: write its attributes with `put` and call its methods through `attr`. */
    get inputPart(): ComponentBase<HTMLInputElement> {
        return this.controlPart as ComponentBase<HTMLInputElement>;
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
        const control = this.controlPart;
        put(control, 'autocomplete', this.autoComplete);
        put(control, 'inputmode', this.charset === 'digits' && !this.pattern ? 'numeric' : 'text');
        put(control, 'autocapitalize', this.uppercase ? 'characters' : 'off');
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
        const row = this.rowPart;
        const group = this.groupSize;
        // A box stays in its place; boxes are added or taken away at the end, separators kept in or out.
        while (this.cells.length > count) {
            const gone = this.cells.pop()!;
            removePart(gone.separatorPart);
            removePart(gone.boxPart);
        }
        while (this.cells.length < count) {
            const cell = part<HTMLSpanElement>(row, 'span', 'mx-otp-input__cell');
            const char = part<HTMLSpanElement>(cell, 'span', 'mx-otp-input__char');
            const caret = part<HTMLSpanElement>(cell, 'span', 'mx-otp-input__caret');
            const separator = part<HTMLSpanElement>(row, 'span', 'mx-otp-input__separator');
            this.cells.push({ boxPart: cell, charPart: char, caretPart: caret, separatorPart: separator });
        }
        this.cells.forEach((cell, index) => {
            const between = !!group && group > 0 && (index + 1) % group === 0 && index + 1 < count;
            if (between) text(cell.separatorPart, this.separator);
            kept(cell.separatorPart, between);
        });
        this.renderInput();
        this.fitValue();
        this.renderValue(this.peekValue());
    }

    // `caret` is where the component has just put the caret: the input takes it a little later.
    drawCells(caret?: number): void {
        // The field gives its first value before the boxes exist.
        if (!this.rowPart) return;
        const value = this.peekValue();
        const chars = [...value];
        const focused = this.focused;
        const at = Math.min(caret ?? this.inputPart.element.selectionStart ?? chars.length, this.length - 1);
        const masked = this.masked;
        this.cells.forEach((cell, index) => {
            const filled = index < chars.length;
            text(cell.charPart, filled ? (masked ? this.maskCharacter : chars[index]) : this.placeholder);
            mark(cell.boxPart, 'data-filled', filled);
            mark(cell.boxPart, 'data-active', focused && index === at);
            shown(cell.caretPart, focused && index === at && !filled);
        });
    }

    // A character typed into a filled box takes its place: `typed` leaves out the one it pushed on.
    beforeInput(e: InputEvent): void {
        const input = this.inputPart.element;
        const start = input.selectionStart ?? 0;
        const before = this.peekValue();
        const fills = e.inputType === 'insertText' && !!e.data && input.selectionEnd === start && start < before.length;
        this.replacing = fills ? { at: start, data: e.data!, before } : null;
    }

    // The text the browser wrote, without the character a character typed into a filled box pushed on.
    withoutPushed(text: string, e: InputEvent): string {
        const replacing = this.replacing;
        this.replacing = null;
        if (!replacing || e.inputType !== 'insertText') return text;
        const { at, data, before } = replacing;
        const rest = before.slice(at);
        if (text !== before.slice(0, at) + data + rest) return text;
        const pushed = [...rest][0].length;
        return before.slice(0, at) + data + rest.slice(pushed);
    }

    typed(e: Event): void {
        const input = e.target as HTMLInputElement;
        const text = (e.target as HTMLInputElement).value;
        const written = this.withoutPushed(text, e as InputEvent);
        const value = this.accepted(written);
        const caret = Math.min(this.accepted(written.slice(0, input.selectionStart ?? written.length)).length, value.length);
        if (text !== value) this.controlPart.attr.add({ value });
        this.controlPart.attr.add({ setSelectionRange: [caret, caret] });
        this.commit(value, e);
        this.drawCells(caret);
        if (this.isComplete && this.told !== value) {
            this.told = value;
            this.completed.fire({ value, source: this, originalEvent: e });
        } else if (!this.isComplete) this.told = null;
    }

    // Focus goes to the first empty box, unless a box was pressed.
    placeCaret(): void {
        const end = this.peekValue().length;
        this.controlPart.attr.add({ setSelectionRange: [end, end] });
        this.drawCells(end);
    }

    // A press puts the caret in the box under the pointer, but not beyond the characters.
    pressed(e: PointerEvent): void {
        const under = this.cells.findIndex(cell => {
            const box = rectOf(cell.boxPart);
            return e.clientX >= box.left && e.clientX <= box.right;
        });
        if (under < 0) {
            this.drawCells();
            return;
        }
        const at = Math.min(under, this.peekValue().length);
        this.controlPart.attr.add({ setSelectionRange: [at, at] });
        this.drawCells(at);
    }
}
