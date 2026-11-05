import { Component, Emitter, type Bind, type ComponentBase, type Event as MotifEvent, type IBaseProp } from "@motifx/core";
import { Control } from "../../core/control";
import type { ControlSize } from "../../core/control-size";
import { glyphPart, iconPart, part, put, shown, text } from "../../core/draw-parts";
import { follow } from "../../core/follow";
import { givenField, givenList } from "../../core/given-field";
import type { IconSource } from "../../core/icon-source";
import { onLanguage } from "../../core/on-language";
import { uiLocale } from "../../core/ui-locale";
import type { StepChangedEventArgs } from "./step-changed-event-args";
import type { StepChangingEventArgs } from "./step-changing-event-args";
import type { StepperItem } from "./stepper-item";
import type { StepperLabelPosition } from "./stepper-label-position";
import type { StepperOrientation } from "./stepper-orientation";
import type { StepperProps } from "./stepper-props";
import type { StepperStatus } from "./stepper-status";

const OWN = ['items', 'value', 'linear', 'orientation', 'labelPosition', 'size', 'clickable', 'showNumbers', 'label'] as const;

interface Look {
    item: unknown;
    key: string | null;
    text: string;
    description: string;
    icon: IconSource | null;
    status: 'done' | 'error' | 'pending' | null;
    optional: boolean;
    enabled: boolean;
}

interface Step {
    li: Component<HTMLLIElement>;
    face: Component<HTMLElement>;
    indicator: Component<HTMLSpanElement>;
    number: Component<HTMLSpanElement>;
    mark: Component<HTMLSpanElement>;
    icon: ComponentBase | null;
    position: Component<HTMLSpanElement>;
    label: Component<HTMLSpanElement>;
    description: Component<HTMLSpanElement>;
    note: Component<HTMLSpanElement>;
    state: Component<HTMLSpanElement>;
    line: Component<HTMLSpanElement>;
}

/**
 * The steps of a longer task and where the user stands in them: a numbered indicator and a text per step, a line
 * between them, the steps before the current one completed. A step is a button (`clickable`); in linear order a
 * press reaches a completed step or the one right after the last completed, and `onStepChanging` may refuse or
 * wait. One Tab stop: the arrow keys move between the steps, Enter and Space choose. The `Wizard` adds a page and
 * the buttons to each step.
 *
 * @example
 * <Stepper items={['Account', 'Address', 'Payment']} x-model={() => this.order.step} />
 * <Stepper orientation="vertical" items={[{ text: 'Details', description: 'Name and e-mail' }, { text: 'Review', optional: true }]} />
 */
export class Stepper extends Control<HTMLElement, StepperProps> {
    changing = new Emitter<StepChangingEventArgs>();
    changed = new Emitter<StepChangedEventArgs>();
    list: Component<HTMLOListElement>;
    steps: Step[] = [];
    looks: Look[] = [];
    stopItems: (() => void) | null = null;
    // The step focused last: Tab comes back to it.
    focusedAt = -1;
    byUser = false;
    ready = false;
    // Asked after onStepChanging, before the step changes: the Wizard validates the page it leaves here.
    guard: ((e: { from: number; to: number; byUser: boolean }) => boolean | Promise<boolean>) | null = null;

    constructor(props?: IBaseProp<StepperProps>) {
        super('nav', props);
        const own = (this.props ?? {}) as StepperProps;
        this.element.classList.add('mx-stepper');
        this.list = part(this, 'ol', 'mx-stepper__list');
        for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
        if (own.onStepChanging) this.onStepChanging(own.onStepChanging);
        if (own.onStepChanged) this.onStepChanged(own.onStepChanged);

        this.observeProperty('items', () => this.renderItems());
        this.observeProperty('clickable', () => this.drawSteps());
        this.observeProperty<number | string | null>('value', () => this.drawStates());
        this.observeProperty<number | string | null>('value', () => {
            const index = this.selectedIndex;
            if (!this.ready || index === this.previousIndex) {
                return;
            }
            this.changed.fire({ index, item: this.looks[index]?.item ?? null, previous: this.previousIndex, byUser: this.byUser, source: this });
            this.previousIndex = index;
        });
        for (const name of ['linear', 'showNumbers'] as const) this.observeProperty(name, () => this.drawStates());
        this.observeProperty<StepperOrientation>('orientation', o => put(this.element, 'data-orientation', o ?? 'horizontal'));
        this.observeProperty<StepperLabelPosition>('labelPosition', p => put(this.element, 'data-labels', p ?? 'bottom'));
        this.observeProperty<ControlSize>('size', size => put(this.element, 'data-size', size ?? 'md'));
        this.observeProperty<string>('label', () => this.renderName());
        onLanguage(this, () => {
            this.renderName();
            this.drawStates();
        });
        this.list.element.addEventListener('keydown', e => this.keyDown(e));
        this.list.element.addEventListener('focusin', e => {
            const at = this.steps.findIndex(step => step.face.element.contains(e.target as Node));
            if (at >= 0) {
                this.focusedAt = at;
                this.drawStops();
            }
        });
        this.motif.setDisposable(() => {
            this.stopItems?.();
            this.changing.dispose();
            this.changed.dispose();
        });
        this.previousIndex = this.selectedIndex;
        this.ready = true;
    }

    previousIndex = -1;

    // Properties (see StepperProps).

    get items(): readonly (StepperItem | string)[] {
        return this.getProperty<readonly (StepperItem | string)[] | undefined>('items') ?? [];
    }
    set items(value: Bind<readonly (StepperItem | string)[]>) {
        this.assignProperty('items', value);
    }
    get value(): string | number | null {
        const value = this.getProperty<string | number | null | undefined>('value');
        return value === undefined ? 0 : value;
    }
    set value(value: Bind<string | number | null>) {
        this.assignProperty('value', value);
    }
    get linear(): boolean {
        return this.getProperty<boolean | undefined>('linear') !== false;
    }
    set linear(value: Bind<boolean>) {
        this.assignProperty('linear', value);
    }
    get orientation(): StepperOrientation {
        return this.getProperty<StepperOrientation | undefined>('orientation') ?? 'horizontal';
    }
    set orientation(value: Bind<StepperOrientation>) {
        this.assignProperty('orientation', value);
    }
    get labelPosition(): StepperLabelPosition {
        return this.getProperty<StepperLabelPosition | undefined>('labelPosition') ?? 'bottom';
    }
    set labelPosition(value: Bind<StepperLabelPosition>) {
        this.assignProperty('labelPosition', value);
    }
    get size(): ControlSize {
        return this.getProperty<ControlSize | undefined>('size') ?? 'md';
    }
    set size(value: Bind<ControlSize>) {
        this.assignProperty('size', value);
    }
    get clickable(): boolean {
        return this.getProperty<boolean | undefined>('clickable') !== false;
    }
    set clickable(value: Bind<boolean>) {
        this.assignProperty('clickable', value);
    }
    get showNumbers(): boolean {
        return this.getProperty<boolean | undefined>('showNumbers') !== false;
    }
    set showNumbers(value: Bind<boolean>) {
        this.assignProperty('showNumbers', value);
    }
    get label(): string {
        return this.getProperty<string | undefined>('label') ?? '';
    }
    set label(value: Bind<string>) {
        this.assignProperty('label', value);
    }

    /** The current step is about to change (`from`, `to`, `byUser`); `cancel` keeps it, `promise` waits. */
    get onStepChanging(): MotifEvent<StepChangingEventArgs> {
        return this.changing.event;
    }

    /** The current step changed, by the user or from code (`byUser`). */
    get onStepChanged(): MotifEvent<StepChangedEventArgs> {
        return this.changed.event;
    }

    /** The index of the current step; -1 when there is none. */
    get selectedIndex(): number {
        return this.indexOf(this.peekProperty<string | number | null | undefined>('value'));
    }

    /** How many steps there are. */
    get count(): number {
        return this.looks.length;
    }

    /** A step after the current one can be gone to with `next()`. */
    get canGoNext(): boolean {
        return this.nextIndex(1) >= 0;
    }

    /** A step before the current one can be gone to with `previous()`. */
    get canGoPrevious(): boolean {
        return this.nextIndex(-1) >= 0;
    }

    /** The status of the step at `index`, as drawn. */
    statusOf(index: number): StepperStatus {
        const look = this.looks[index];
        if (!look) {
            return 'pending';
        }
        const current = this.selectedIndex;
        if (look.status === 'error' || look.status === 'done') {
            return look.status;
        }
        if (index === current) {
            return 'current';
        }
        return look.status ?? (index < current ? 'done' : 'pending');
    }

    /** Whether a press may reach the step at `index`: enabled, and in linear order with every step before it done or optional. */
    canReach(index: number): boolean {
        const look = this.looks[index];
        if (!look || !look.enabled) {
            return false;
        }
        const current = this.selectedIndex;
        if (this.peekProperty<boolean | undefined>('linear') === false || index <= current) {
            return true;
        }
        for (let i = current + 1; i < index; i++) {
            if (this.statusOf(i) !== 'done' && !this.looks[i].optional) {
                return false;
            }
        }
        return true;
    }

    /** Goes to the step after the current one (the next enabled); `false` when there is none or the change was refused. */
    next(): Promise<boolean> {
        return this.goTo(this.nextIndex(1));
    }

    /** Goes to the step before the current one (the previous enabled). */
    previous(): Promise<boolean> {
        return this.goTo(this.nextIndex(-1));
    }

    /** Goes to a step by index or key, whatever the order; `onStepChanging` is asked first. */
    goTo(step: number | string): Promise<boolean> {
        return this.go(this.indexOf(step), false);
    }

    /** Reads the items again after they were changed in place. */
    refresh(): void {
        this.renderItems();
    }

    /** The index a value names: a key, else an index in range; -1 for none. */
    indexOf(value: string | number | null | undefined): number {
        if (value === undefined) {
            return this.looks.length ? 0 : -1;
        }
        if (value === null) {
            return -1;
        }
        if (typeof value === 'string') {
            return this.looks.findIndex(look => look.key === value);
        }
        return Number.isInteger(value) && value >= 0 && value < this.looks.length ? value : -1;
    }

    /** The value that names the step at `index`: its key when it has one, else the index. */
    valueAt(index: number): string | number {
        return this.looks[index]?.key ?? index;
    }

    renderName(): void {
        put(this.element, 'aria-label', this.peekProperty<string>('label') || uiLocale.strings.steps);
    }

    renderItems(): void {
        this.stopItems?.();
        const items = givenList(this.peekProperty<readonly unknown[]>('items'));
        // The items' own functions are followed; the list and drawing are not.
        this.stopItems = follow(
            this,
            'items',
            () => items.map(item => this.lookOf(item)),
            looks => {
                this.looks = looks;
                this.drawSteps();
            }
        );
    }

    lookOf(item: unknown): Look {
        if (typeof item !== 'object' || item === null) {
            return { item, key: null, text: String(item ?? ''), description: '', icon: null, status: null, optional: false, enabled: true };
        }
        const status = givenField<string | null | undefined>(item, 'status');
        return {
            item,
            key: givenField<string | undefined>(item, 'key') ?? null,
            text: String(givenField(item, 'text') ?? ''),
            description: String(givenField(item, 'description') ?? ''),
            icon: givenField<IconSource | null | undefined>(item, 'icon') ?? null,
            status: status === 'done' || status === 'error' || status === 'pending' ? status : null,
            optional: givenField(item, 'optional') === true,
            enabled: givenField(item, 'enabled') !== false
        };
    }

    // The steps are made again when their count or their kind (a button, or not) changes; otherwise written in place.
    drawSteps(): void {
        const clickable = this.peekProperty<boolean | undefined>('clickable') !== false;
        const tag = clickable ? 'button' : 'div';
        const stale = this.steps.length !== this.looks.length || this.steps.some(step => step.face.element.tagName.toLowerCase() !== tag);
        if (stale) {
            for (const step of this.steps) void step.li.dispose();
            this.steps = this.looks.map((_, index) => this.makeStep(index, clickable));
        }
        this.looks.forEach((look, index) => {
            const step = this.steps[index];
            text(step.label.element, look.text);
            text(step.description.element, look.description);
            shown(step.description.element, look.description !== '');
            if (step.icon) {
                void step.icon.dispose();
                step.icon = null;
            }
            if (look.icon) {
                step.icon = iconPart(step.indicator, look.icon);
                step.icon.element.classList.add('mx-stepper__icon');
            }
            shown(step.line.element, index < this.looks.length - 1);
        });
        this.drawStates();
    }

    makeStep(index: number, clickable: boolean): Step {
        const li = new Component<HTMLLIElement>('li');
        li.element.className = 'mx-stepper__item';
        this.list.controls.add(li);
        const face = part(li, clickable ? 'button' : 'div', 'mx-stepper__step');
        if (clickable) {
            (face.element as HTMLButtonElement).type = 'button';
            face.element.addEventListener('click', e => void this.go(index, true, e));
        }
        const indicator = part<HTMLSpanElement>(face, 'span', 'mx-stepper__indicator');
        indicator.element.setAttribute('aria-hidden', 'true');
        const number = part<HTMLSpanElement>(indicator, 'span', 'mx-stepper__number');
        const mark = glyphPart(indicator, 'check', 'mx-stepper__mark');
        const texts = part<HTMLSpanElement>(face, 'span', 'mx-stepper__texts');
        const position = part<HTMLSpanElement>(texts, 'span', 'mx-sr-only');
        const label = part<HTMLSpanElement>(texts, 'span', 'mx-stepper__label');
        const description = part<HTMLSpanElement>(texts, 'span', 'mx-stepper__description');
        const note = part<HTMLSpanElement>(texts, 'span', 'mx-stepper__note');
        const state = part<HTMLSpanElement>(texts, 'span', 'mx-sr-only');
        const line = part<HTMLSpanElement>(li, 'span', 'mx-stepper__line');
        line.element.setAttribute('aria-hidden', 'true');
        return { li, face, indicator, number, mark, icon: null, position, label, description, note, state, line };
    }

    // What depends on the current step: statuses, reachability, the texts read out, the Tab stop.
    drawStates(): void {
        const current = this.selectedIndex;
        const numbers = this.peekProperty<boolean | undefined>('showNumbers') !== false;
        const strings = uiLocale.strings;
        this.steps.forEach((step, index) => {
            const look = this.looks[index];
            const status = this.statusOf(index);
            const reachable = this.canReach(index);
            const marked = status === 'done' || status === 'error';
            put(step.li.element, 'data-status', status);
            put(step.face.element, 'data-status', status);
            put(step.face.element, 'aria-current', index === current ? 'step' : null);
            put(step.face.element, 'aria-disabled', reachable ? null : 'true');
            put(step.indicator.element, 'data-status', status);
            put(step.mark.element, 'data-status', status);
            put(step.line.element, 'data-status', index < current ? 'done' : status === 'done' ? 'done' : 'pending');
            text(step.number.element, String(index + 1));
            shown(step.number.element, numbers && !marked && !look.icon);
            shown(step.mark.element, marked);
            if (step.icon) {
                shown(step.icon.element as HTMLElement, !marked);
            }
            text(step.position.element, uiLocale.text('stepOf', { index: index + 1, count: this.looks.length }) + ' ');
            text(step.note.element, look.optional ? strings.stepOptional : '');
            shown(step.note.element, look.optional);
            text(step.state.element, status === 'done' ? `, ${strings.stepDone}` : status === 'error' ? `, ${strings.stepError}` : '');
        });
        this.drawStops();
    }

    // One Tab stop: the step focused last, else the current one, else the first that can be reached.
    drawStops(): void {
        if (this.peekProperty<boolean | undefined>('clickable') === false) {
            return;
        }
        const reachable = this.steps.map((_, i) => this.canReach(i));
        const current = this.selectedIndex;
        let stop = this.focusedAt >= 0 && reachable[this.focusedAt] ? this.focusedAt : current >= 0 && reachable[current] ? current : reachable.indexOf(true);
        this.steps.forEach((step, index) => {
            const el = step.face.element as HTMLButtonElement;
            if (!reachable[index]) {
                el.tabIndex = -1;
            } else {
                el.tabIndex = index === stop ? 0 : -1;
            }
        });
    }

    nextIndex(direction: 1 | -1): number {
        const current = this.selectedIndex;
        for (let i = current + direction; i >= 0 && i < this.looks.length; i += direction) {
            if (this.looks[i].enabled) {
                return i;
            }
        }
        return -1;
    }

    async go(to: number, byUser: boolean, event?: Event): Promise<boolean> {
        const from = this.selectedIndex;
        if (to < 0 || to >= this.looks.length || to === from) {
            return false;
        }
        if (byUser && !this.canReach(to)) {
            return false;
        }
        const args: StepChangingEventArgs = { from, to, fromItem: this.looks[from]?.item ?? null, toItem: this.looks[to].item, byUser, cancel: false, source: this, event };
        this.changing.fire(args);
        if (args.cancel) {
            return false;
        }
        if (args.promise) {
            const ok = await args.promise.catch(() => false);
            if (!ok || this.isDisposed || this.selectedIndex !== from) {
                return false;
            }
        }
        if (this.guard) {
            const ok = await this.guard({ from, to, byUser });
            if (!ok || this.isDisposed || this.selectedIndex !== from) {
                return false;
            }
        }
        const value = this.valueAt(to);
        this.byUser = byUser;
        this.changeProperty('value', value);
        this.byUser = false;
        // `x-model` takes the step back.
        this.bindings.writeModel(value);
        if (byUser) {
            this.steps[to]?.face.element.focus();
        }
        return true;
    }

    keyDown(e: KeyboardEvent): void {
        if (e.altKey || e.ctrlKey || e.metaKey) {
            return;
        }
        const from = this.steps.findIndex(step => step.face.element.contains(e.target as Node));
        if (from < 0) {
            return;
        }
        const usable = this.steps.map((_, i) => i).filter(i => this.canReach(i));
        const at = usable.indexOf(from);
        if (at < 0) {
            return;
        }
        const vertical = this.peekProperty<StepperOrientation>('orientation') === 'vertical';
        const rtl = getComputedStyle(this.element).direction === 'rtl';
        const forward = vertical ? 'ArrowDown' : rtl ? 'ArrowLeft' : 'ArrowRight';
        const back = vertical ? 'ArrowUp' : rtl ? 'ArrowRight' : 'ArrowLeft';
        let to: number | undefined;
        if (e.key === 'Home') {
            to = usable[0];
        } else if (e.key === 'End') {
            to = usable[usable.length - 1];
        } else if (e.key === forward) {
            to = usable[(at + 1) % usable.length];
        } else if (e.key === back) {
            to = usable[(at - 1 + usable.length) % usable.length];
        }
        if (to === undefined) {
            return;
        }
        e.preventDefault();
        this.steps[to].face.element.focus();
    }
}
