import { Component, Emitter, createSignal, untracked, type Bind, type ComponentBase, type Event as MotifEvent, type IBaseProp, type Signal } from "@motifx/core";
import { Control } from "../../core/control";
import type { ControlSize } from "../../core/control-size";
import { glyphPart, loose, part } from "../../core/draw-parts";
import { focusOn } from "../../core/focus";
import { follow } from "../../core/follow";
import { givenField, givenList } from "../../core/given-field";
import type { IconSource } from "../../core/icon-source";
import { isRtl } from "../../core/measure";
import { onLanguage } from "../../core/on-language";
import { kept, put, text } from "../../core/part-writes";
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

/** A step's place: the same while there is an item at its index, whatever item it is. */
interface Slot {
    index: number;
    /** The item at the index: a new item changes what the step says, not the step. */
    item: Signal<unknown>;
    face: Face | null;
}

/** What a step is pressed on: a button (`clickable`), else a plain step. */
interface Face {
    host: Component<HTMLElement>;
    indicator: Component<HTMLSpanElement>;
    number: Component<HTMLSpanElement>;
    mark: Component<HTMLSpanElement>;
    icon: ComponentBase | null;
    position: Component<HTMLSpanElement>;
    label: Component<HTMLSpanElement>;
    description: Component<HTMLSpanElement>;
    note: Component<HTMLSpanElement>;
    state: Component<HTMLSpanElement>;
}

/** An icon given as an address. */
function iconImage(src: string): Component<HTMLImageElement> {
    const img = loose<HTMLImageElement>('img');
    img.attr.add({ src, alt: '' });
    return img;
}

/**
 * The steps of a longer task and the user's position in them: a numbered indicator and a text per step, a line
 * between them, and the steps before the current one completed. A step is a button (`clickable`). In linear order, a
 * click reaches a completed step or the one right after the last completed step, and `onStepChanging` can cancel the
 * change or wait. The stepper is one Tab stop: the arrow keys move between the steps, and Enter and Space select.
 * `Wizard` adds a page and buttons to each step.
 *
 * @example
 * <Stepper items={['Account', 'Address', 'Payment']} x-model={() => this.order.step} />
 * <Stepper orientation="vertical" items={[{ text: 'Details', description: 'Name and e-mail' }, { text: 'Review', optional: true }]} />
 */
export class Stepper extends Control<HTMLElement, StepperProps> {
    changing = new Emitter<StepChangingEventArgs>();
    changed = new Emitter<StepChangedEventArgs>();
    list: Component<HTMLOListElement>;
    /** The step places by index; a place stays while there is an item at its index. */
    slots: Slot[] = [];
    /** What the items say, in order. */
    looksNow = createSignal<Look[]>([]);
    stopItems: (() => void) | null = null;
    // The step focused last: Tab comes back to it.
    focusedAt = createSignal(-1);
    /** Counted up by `refresh()` and a new language: what the steps say is read again. */
    revision = createSignal(0);
    byUser = false;
    ready = false;
    // Asked after onStepChanging, before the step changes: the Wizard validates the page it leaves here.
    guard: ((e: { from: number; to: number; byUser: boolean }) => boolean | Promise<boolean>) | null = null;

    constructor(props?: IBaseProp<StepperProps>) {
        super('nav', props);
        const own = (this.props ?? {}) as StepperProps;
        this.class.add('mx-stepper');
        this.list = part(this, 'ol', 'mx-stepper__list');
        for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
        if (own.onStepChanging) this.onStepChanging(own.onStepChanging);
        if (own.onStepChanged) this.onStepChanged(own.onStepChanged);

        this.observeProperty('items', () => this.renderItems());
        // Built once: a step stays while there is an item at its index, and a changed item or value changes only what shows it.
        this.list.bindings.list(() => this.slots.slice(0, this.looks.length), (slot: Slot) => this.makeStep(slot));
        this.observeProperty<number | string | null>('value', () => {
            const index = this.selectedIndex;
            if (!this.ready || index === this.previousIndex) {
                return;
            }
            this.changed.fire({ index, item: this.looks[index]?.item ?? null, previous: this.previousIndex, byUser: this.byUser, source: this });
            this.previousIndex = index;
        });
        this.observeProperty<StepperOrientation>('orientation', o => put(this, 'data-orientation', o ?? 'horizontal'));
        this.observeProperty<StepperLabelPosition>('labelPosition', p => put(this, 'data-labels', p ?? 'bottom'));
        this.observeProperty<ControlSize>('size', size => put(this, 'data-size', size ?? 'md'));
        this.observeProperty<string>('label', () => this.renderName());
        onLanguage(this, () => {
            this.renderName();
            this.revision.value = this.revision.peek() + 1;
        });
        this.list.motif.on('keydown', (_, e) => this.keyDown(e));
        this.list.motif.on('focusin', (_, e) => {
            const at = this.faces().findIndex(face => face?.host.motif.isEventFrom(e));
            if (at >= 0) {
                this.focusedAt.value = at;
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

    /** What the items say, in order; followed where it is read in a binding. */
    get looks(): Look[] {
        return this.looksNow.value;
    }

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

    /** Occurs before the current step changes (`from`, `to`, `byUser`). `cancel` keeps it, and `promise` waits. */
    get onStepChanging(): MotifEvent<StepChangingEventArgs> {
        return this.changing.event;
    }

    /** Occurs after the current step changes, by the user or programmatically (`byUser`). */
    get onStepChanged(): MotifEvent<StepChangedEventArgs> {
        return this.changed.event;
    }

    /** The index of the current step, or -1 if there is none. */
    get selectedIndex(): number {
        return this.indexOf(this.peekProperty<string | number | null | undefined>('value'));
    }

    /** The number of steps. */
    get count(): number {
        return this.looks.length;
    }

    /** Indicates whether `next()` can move to a step after the current one. */
    get canGoNext(): boolean {
        return this.nextIndex(1) >= 0;
    }

    /** Indicates whether `previous()` can move to a step before the current one. */
    get canGoPrevious(): boolean {
        return this.nextIndex(-1) >= 0;
    }

    /** The status of the step at `index`, as displayed. */
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

    /**
     * Indicates whether a click can reach the step at `index`: it is enabled and, in linear order, every step before it
     * is done or optional.
     */
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

    /** Moves to the next enabled step. Returns `false` if there is none or the change was canceled. */
    next(): Promise<boolean> {
        return this.goTo(this.nextIndex(1));
    }

    /** Moves to the previous enabled step. */
    previous(): Promise<boolean> {
        return this.goTo(this.nextIndex(-1));
    }

    /** Moves to a step by index or key, in any order. `onStepChanging` is raised first. */
    goTo(step: number | string): Promise<boolean> {
        return this.go(this.indexOf(step), false);
    }

    /** Re-reads the items after they have been changed in place. */
    refresh(): void {
        this.renderItems();
        this.revision.value = this.revision.peek() + 1;
    }

    /** Returns the index that a value identifies: a key, otherwise an index in range, or -1 if there is none. */
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

    /** Returns the value that identifies the step at `index`: its key if it has one, otherwise the index. */
    valueAt(index: number): string | number {
        return this.looks[index]?.key ?? index;
    }

    renderName(): void {
        put(this, 'aria-label', this.peekProperty<string>('label') || uiLocale.strings.steps);
    }

    renderItems(): void {
        this.stopItems?.();
        const items = givenList(this.peekProperty<readonly unknown[]>('items'));
        // The items' own functions are tracked; the list and drawing are not.
        this.stopItems = follow(
            this,
            'items',
            () => items.map(item => this.lookOf(item)),
            looks => {
                looks.forEach((look, index) => {
                    const slot = (this.slots[index] ??= { index, item: createSignal<unknown>(look.item), face: null });
                    if (slot.item.peek() !== look.item) slot.item.value = look.item;
                });
                this.looksNow.value = looks;
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

    /** The faces of the steps there are, by index; `null` where a step is not built yet. */
    faces(): (Face | null)[] {
        return this.slots.slice(0, this.looks.length).map(slot => slot.face);
    }

    /** A step, built once: its face changes only when its kind (a button, or not) does, and its line shows while a step follows. */
    makeStep(slot: Slot): Component<HTMLLIElement> {
        const li = loose<HTMLLIElement>('li', 'mx-stepper__item');
        li.bindings.list(() => [this.getProperty<boolean | undefined>('clickable') !== false], (clickable: boolean) => this.makeFace(slot, clickable));
        const line = part<HTMLSpanElement>(li, 'span', 'mx-stepper__line');
        line.attr.add({ 'aria-hidden': 'true' });
        li.bindings.watch(() => {
            const looks = this.looks;
            void this.getProperty('value');
            untracked(() => {
                const index = slot.index;
                const status = this.statusOf(index);
                put(li, 'data-status', status);
                put(line, 'data-status', index < this.selectedIndex ? 'done' : status === 'done' ? 'done' : 'pending');
                kept(line, index < looks.length - 1);
            });
        });
        return li;
    }

    makeFace(slot: Slot, clickable: boolean): Component<HTMLElement> {
        const host = loose<HTMLElement>(clickable ? 'button' : 'div', 'mx-stepper__step');
        if (clickable) {
            host.attr.add({ type: 'button' });
            host.motif.on('click', (_, e) => void this.go(slot.index, true, e));
        }
        const indicator = part<HTMLSpanElement>(host, 'span', 'mx-stepper__indicator');
        indicator.attr.add({ 'aria-hidden': 'true' });
        const number = part<HTMLSpanElement>(indicator, 'span', 'mx-stepper__number');
        text(number, String(slot.index + 1));
        const mark = glyphPart(indicator, 'check', 'mx-stepper__mark');
        const texts = part<HTMLSpanElement>(host, 'span', 'mx-stepper__texts');
        const position = part<HTMLSpanElement>(texts, 'span', 'mx-sr-only');
        const label = part<HTMLSpanElement>(texts, 'span', 'mx-stepper__label');
        const description = part<HTMLSpanElement>(texts, 'span', 'mx-stepper__description');
        const note = part<HTMLSpanElement>(texts, 'span', 'mx-stepper__note');
        const state = part<HTMLSpanElement>(texts, 'span', 'mx-sr-only');
        const face: Face = { host, indicator, number, mark, icon: null, position, label, description, note, state };
        slot.face = face;
        host.motif.setDisposable(() => {
            if (slot.face === face) slot.face = null;
        });
        indicator.bindings.list(
            () => {
                void this.revision.value;
                const icon = this.lookOf(slot.item.value).icon;
                return icon ? [icon] : [];
            },
            (icon: IconSource) => this.makeIcon(slot, face, icon)
        );
        // What the item says: only its own item is followed.
        host.bindings.watch(() => {
            void this.revision.value;
            const look = this.lookOf(slot.item.value);
            untracked(() => {
                text(label, look.text);
                text(description, look.description);
                kept(description, look.description !== '');
            });
        });
        // Where the user is: the items, the current step and the options that change what the step shows of it.
        host.bindings.watch(() => {
            void [this.looks, this.getProperty('value'), this.getProperty('linear'), this.revision.value];
            const numbers = this.getProperty<boolean | undefined>('showNumbers') !== false;
            untracked(() => this.drawState(slot, face, numbers));
        });
        // One Tab stop: the step focused last, else the current one, else the first that can be reached.
        if (clickable) {
            host.bindings.watch(() => {
                void [this.looks, this.getProperty('value'), this.getProperty('linear'), this.focusedAt.value];
                untracked(() => put(host, 'tabindex', this.stopIndex() === slot.index ? '0' : '-1'));
            });
        }
        return host;
    }

    makeIcon(slot: Slot, face: Face, source: IconSource): ComponentBase {
        const icon = typeof source === 'string' ? iconImage(source) : source;
        icon.class.add('mx-stepper__icon');
        face.icon = icon;
        icon.motif.setDisposable(() => {
            if (face.icon === icon) face.icon = null;
        });
        // An icon component of the app's can come back hidden from an earlier step.
        untracked(() => kept(icon, !this.isMarked(slot.index)));
        return icon;
    }

    isMarked(index: number): boolean {
        const status = this.statusOf(index);
        return status === 'done' || status === 'error';
    }

    drawState(slot: Slot, face: Face, numbers: boolean): void {
        const index = slot.index;
        const look = this.looks[index];
        if (!look) {
            return;
        }
        const strings = uiLocale.strings;
        const status = this.statusOf(index);
        const marked = this.isMarked(index);
        put(face.host, 'data-status', status);
        put(face.host, 'aria-current', index === this.selectedIndex ? 'step' : null);
        put(face.host, 'aria-disabled', this.canReach(index) ? null : 'true');
        put(face.indicator, 'data-status', status);
        put(face.mark, 'data-status', status);
        kept(face.number, numbers && !marked && !look.icon);
        kept(face.mark, marked);
        if (face.icon) kept(face.icon, !marked);
        text(face.position, uiLocale.text('stepOf', { index: index + 1, count: this.looks.length }) + ' ');
        text(face.note, look.optional ? strings.stepOptional : '');
        kept(face.note, look.optional);
        text(face.state, status === 'done' ? `, ${strings.stepDone}` : status === 'error' ? `, ${strings.stepError}` : '');
    }

    /** The step Tab reaches: the one focused last, else the current one, else the first that can be reached. */
    stopIndex(): number {
        const reachable = this.looks.map((_, i) => this.canReach(i));
        const focused = this.focusedAt.peek();
        const current = this.selectedIndex;
        return focused >= 0 && reachable[focused] ? focused : current >= 0 && reachable[current] ? current : reachable.indexOf(true);
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
        const face = this.slots[to]?.face;
        if (byUser && face) {
            focusOn(face.host);
        }
        return true;
    }

    keyDown(e: KeyboardEvent): void {
        if (e.altKey || e.ctrlKey || e.metaKey) {
            return;
        }
        const faces = this.faces();
        const from = faces.findIndex(face => face?.host.motif.isEventFrom(e));
        if (from < 0) {
            return;
        }
        const usable = faces.map((_, i) => i).filter(i => this.canReach(i));
        const at = usable.indexOf(from);
        if (at < 0) {
            return;
        }
        const vertical = this.peekProperty<StepperOrientation>('orientation') === 'vertical';
        const rtl = isRtl(this);
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
        const face = faces[to];
        if (face) focusOn(face.host);
    }
}
