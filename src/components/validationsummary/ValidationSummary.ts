import { Component, Emitter, type Bind, type Event as MotifEvent, type IBaseProp } from "@motifx/core";
import { parseAccessKey } from "../../core/access-key";
import { Control } from "../../core/control";
import { glyphPart, mark, part, shown, text } from "../../core/draw-parts";
import { follow } from "../../core/follow";
import { onLanguage } from "../../core/on-language";
import { uiLocale } from "../../core/ui-locale";
import type { ValidationGroup } from "../../parts/validation/ValidationGroup";
import type { ValidationTarget } from "../../parts/validation/validation-target";
import type { SummaryItemClickEventArgs } from "./summary-item-click-event-args";
import type { ValidationSummaryProps } from "./validation-summary-props";

const OWN = ['group', 'header', 'showHeader', 'focusOnClick'] as const;

interface Row {
    target: ValidationTarget;
    text: string;
    li: Component<HTMLLIElement>;
    button: Component<HTMLButtonElement>;
}

// What a field tells besides the target contract: its label and its message, both reactive.
interface Told {
    label?: unknown;
    validationMessage?: unknown;
}

/**
 * The invalid fields of a `ValidationGroup`, one line each with the field label and its message, below a header.
 * Clicking a line moves focus to the field. It redraws whenever a field of the group is validated, and stays
 * hidden while nothing is invalid.
 *
 * @example
 * const group = new ValidationGroup();
 * <ValidationSummary group={group} />
 * <TextBox label="Name" required validationGroup={group} />
 * <Button text="Save" onclick={() => group.validate()} />
 */
export class ValidationSummary extends Control<HTMLDivElement, ValidationSummaryProps> {
    itemClick = new Emitter<SummaryItemClickEventArgs>();
    head: Component<HTMLParagraphElement>;
    headText: Component<HTMLSpanElement>;
    list: Component<HTMLUListElement>;
    rows: Row[] = [];
    targets: readonly ValidationTarget[] = [];
    stopTargets: (() => void) | null = null;

    constructor(props?: IBaseProp<ValidationSummaryProps>) {
        super('div', props);
        const own = (this.props ?? {}) as ValidationSummaryProps;
        const el = this.element;
        el.classList.add('mx-validation-summary');
        el.setAttribute('aria-live', 'polite');
        this.head = part<HTMLParagraphElement>(this, 'p', 'mx-validation-summary__header');
        glyphPart(this.head, 'danger', 'mx-validation-summary__icon');
        this.headText = part<HTMLSpanElement>(this.head, 'span', 'mx-validation-summary__header-text');
        this.list = part<HTMLUListElement>(this, 'ul', 'mx-validation-summary__list');
        for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
        if (own.onItemClick) this.onItemClick(own.onItemClick);

        this.observeProperty('group', () => this.renderTargets());
        for (const name of ['header', 'showHeader'] as const) this.observeProperty(name, () => this.drawHeader());
        onLanguage(this, () => this.drawHeader());
        this.list.element.addEventListener('click', e => this.click(e));
        this.motif.setDisposable(() => {
            this.stopTargets?.();
            this.itemClick.dispose();
        });
        this.draw();
    }

    // Properties (see ValidationSummaryProps).

    get group(): ValidationGroup | null {
        return this.getProperty<ValidationGroup | null | undefined>('group') ?? null;
    }
    set group(value: Bind<ValidationGroup | null>) {
        this.assignProperty('group', value);
    }
    get header(): string {
        return this.getProperty<string | undefined>('header') ?? '';
    }
    set header(value: Bind<string>) {
        this.assignProperty('header', value);
    }
    get showHeader(): boolean {
        return this.getProperty<boolean | undefined>('showHeader') !== false;
    }
    set showHeader(value: Bind<boolean>) {
        this.assignProperty('showHeader', value);
    }
    get focusOnClick(): boolean {
        return this.getProperty<boolean | undefined>('focusOnClick') !== false;
    }
    set focusOnClick(value: Bind<boolean>) {
        this.assignProperty('focusOnClick', value);
    }

    /** Occurs when a line is clicked (`target`, `text`). */
    get onItemClick(): MotifEvent<SummaryItemClickEventArgs> {
        return this.itemClick.event;
    }

    /** The invalid targets currently listed, in group order. */
    get failed(): readonly ValidationTarget[] {
        return this.rows.map(row => row.target);
    }

    /** The number of lines. */
    get count(): number {
        return this.rows.length;
    }

    /** Redraws the lines from the current state of the fields. */
    refresh(): void {
        this.draw();
    }

    renderTargets(): void {
        this.stopTargets?.();
        this.stopTargets = null;
        const group = this.peekProperty<ValidationGroup | null | undefined>('group');
        if (!group) {
            this.targets = [];
            this.draw();
            return;
        }
        // One binding follows the group's members and each one's validity and message: a field that joins or
        // leaves, a check, a reset or a new error draws the lines again.
        this.stopTargets = follow(
            this,
            'targets',
            () => {
                const targets = group.targets;
                return { targets, state: targets.map(target => `${target.isValid}|${this.messageOf(target)}`).join('; ') };
            },
            ({ targets }) => {
                this.targets = targets;
                this.draw();
            }
        );
    }

    messageOf(target: ValidationTarget): string {
        const told = target as unknown as Told;
        return typeof told.validationMessage === 'string' ? told.validationMessage : '';
    }

    // The field's label and message, as a field tells them; another target gives its element's name.
    textOf(target: ValidationTarget): string {
        const told = target as unknown as Told;
        // A label's access key marker is for the field, not for this text.
        const label = typeof told.label === 'string' ? parseAccessKey(told.label).text : target.element.getAttribute('aria-label') ?? '';
        const message = this.messageOf(target);
        return label && message ? `${label}: ${message}` : label || message;
    }

    draw(): void {
        const failed = this.targets.filter(target => !target.isValid);
        for (const row of this.rows) void row.li.dispose();
        this.rows = failed.map(target => {
            const li = new Component<HTMLLIElement>('li');
            li.element.className = 'mx-validation-summary__line';
            this.list.controls.add(li);
            const button = part<HTMLButtonElement>(li, 'button', 'mx-validation-summary__item');
            button.element.type = 'button';
            const line = this.textOf(target);
            text(button.element, line);
            return { target, text: line, li, button };
        });
        // Out of sight while nothing has failed; `hidden` is the page's, so an attribute of its own.
        mark(this.element, 'data-empty', this.rows.length === 0);
        this.drawHeader();
    }

    drawHeader(): void {
        text(this.headText.element, this.peekProperty<string>('header') || uiLocale.strings.validationSummary);
        shown(this.head.element, this.showHeader);
    }

    click(e: MouseEvent): void {
        const button = (e.target as Element).closest('.mx-validation-summary__item');
        const row = this.rows.find(r => r.button.element === button);
        if (!row) return;
        this.itemClick.fire({ target: row.target, text: row.text, source: this, event: e });
        if (this.focusOnClick) row.target.focus();
    }
}
