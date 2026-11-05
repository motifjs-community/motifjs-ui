import { Component, Emitter, type Bind, type ComponentBase, type Event as MotifEvent, type IBaseProp } from "@motifx/core";
import { Control } from "../../core/control";
import { glyphPart, iconPart, mark, part, put, shown, text } from "../../core/draw-parts";
import { follow } from "../../core/follow";
import { givenField, givenList, givenValue } from "../../core/given-field";
import type { IconSource } from "../../core/icon-source";
import { nextId } from "../../core/next-id";
import { onLanguage } from "../../core/on-language";
import { uiLocale } from "../../core/ui-locale";
import type { SpeedDialAction } from "./speed-dial-action";
import type { SpeedDialActionClickEventArgs } from "./speed-dial-action-click-event-args";
import type { SpeedDialEventArgs } from "./speed-dial-event-args";
import type { SpeedDialDirection, SpeedDialPosition, SpeedDialProps } from "./speed-dial-props";

const OWN = ['actions', 'glyph', 'openGlyph', 'text', 'extended', 'direction', 'position', 'open', 'closeOnAction', 'showLabels'] as const;

interface Look {
    item: unknown;
    key: string | null;
    text: string;
    glyph: string;
    icon: IconSource | null;
    enabled: boolean;
    visible: boolean;
    click: ((e: SpeedDialActionClickEventArgs) => void) | null;
}

interface ActionPart {
    item: unknown;
    button: Component<HTMLButtonElement>;
    iconHost: Component<HTMLSpanElement>;
    glyph: Component<HTMLSpanElement>;
    icon: ComponentBase | null;
    label: Component<HTMLSpanElement>;
}

/**
 * A round button in a corner of the page (or in the flow) that fans out its actions when pressed: each a round
 * button with a glyph and a label beside it. With one action shown, the main button does it itself. The actions are
 * a menu for the keys: Up and Down (or Left and Right) move, Enter and Space choose, Escape closes.
 *
 * @example
 * <SpeedDial text="New" actions={[{ text: 'Note', glyph: 'pencil', click: () => this.newNote() }, { text: 'Event', glyph: 'calendar', click: () => this.newEvent() }]} />
 * <SpeedDial position="inline" direction="end" extended text="Share" actions={() => this.shareTargets} />
 */
export class SpeedDial extends Control<HTMLDivElement, SpeedDialProps> {
    opened = new Emitter<SpeedDialEventArgs>();
    closed = new Emitter<SpeedDialEventArgs>();
    actionClick = new Emitter<SpeedDialActionClickEventArgs>();
    fan: Component<HTMLDivElement>;
    main: Component<HTMLButtonElement>;
    mainGlyph: Component<HTMLSpanElement>;
    mainText: Component<HTMLSpanElement>;
    parts: ActionPart[] = [];
    looks: Look[] = [];
    stopItems: (() => void) | null = null;
    byUser = false;
    ready = false;
    outside = (e: PointerEvent): void => {
        if (this.isOpen && !this.element.contains(e.target as Node)) this.setOpen(false, true, e);
    };

    constructor(props?: IBaseProp<SpeedDialProps>) {
        super('div', props);
        const own = (this.props ?? {}) as SpeedDialProps;
        const el = this.element;
        el.classList.add('mx-speed-dial');
        this.fan = part<HTMLDivElement>(this, 'div', 'mx-speed-dial__fan');
        this.fan.element.setAttribute('role', 'menu');
        this.main = part<HTMLButtonElement>(this, 'button', 'mx-speed-dial__main');
        this.main.element.type = 'button';
        this.main.element.id = nextId('speed-dial');
        this.fan.element.setAttribute('aria-labelledby', this.main.element.id);
        this.mainGlyph = glyphPart(this.main, 'plus', 'mx-speed-dial__main-glyph');
        this.mainText = part<HTMLSpanElement>(this.main, 'span', 'mx-speed-dial__main-text');
        for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
        if (own.onOpened) this.onOpened(own.onOpened);
        if (own.onClosed) this.onClosed(own.onClosed);
        if (own.onActionClick) this.onActionClick(own.onActionClick);

        this.observeProperty('actions', () => this.renderItems());
        for (const name of ['glyph', 'openGlyph', 'text', 'extended'] as const) this.observeProperty(name, () => this.drawMain());
        this.observeProperty<SpeedDialDirection>('direction', d => put(el, 'data-direction', d ?? 'up'));
        this.observeProperty<SpeedDialPosition>('position', p => put(el, 'data-position', p ?? 'bottom-end'));
        this.observeProperty<boolean>('showLabels', on => mark(el, 'data-labels', on !== false));
        this.observeProperty<boolean>('open', on => {
            this.drawOpen();
            if (!this.ready) return;
            const args: SpeedDialEventArgs = { byUser: this.byUser, source: this };
            if (on) this.opened.fire(args);
            else this.closed.fire(args);
        });
        onLanguage(this, () => this.drawMain());
        this.main.element.addEventListener('click', e => this.mainClick(e));
        this.main.element.addEventListener('keydown', e => this.mainKeyDown(e));
        this.fan.element.addEventListener('keydown', e => this.fanKeyDown(e));
        this.fan.element.addEventListener('click', e => this.fanClick(e));
        el.ownerDocument.addEventListener('pointerdown', this.outside, true);
        this.motif.setDisposable(() => {
            el.ownerDocument.removeEventListener('pointerdown', this.outside, true);
            this.stopItems?.();
            for (const emitter of [this.opened, this.closed, this.actionClick]) emitter.dispose();
        });
        this.ready = true;
    }

    // Properties (see SpeedDialProps).

    get actions(): readonly SpeedDialAction[] {
        return this.getProperty<readonly SpeedDialAction[] | undefined>('actions') ?? [];
    }
    set actions(value: Bind<readonly SpeedDialAction[]>) {
        this.assignProperty('actions', value);
    }
    get glyph(): string {
        return this.getProperty<string | undefined>('glyph') || 'plus';
    }
    set glyph(value: Bind<string>) {
        this.assignProperty('glyph', value);
    }
    get openGlyph(): string {
        return this.getProperty<string | undefined>('openGlyph') || 'dismiss';
    }
    set openGlyph(value: Bind<string>) {
        this.assignProperty('openGlyph', value);
    }
    get extended(): boolean {
        return this.getProperty<boolean | undefined>('extended') === true;
    }
    set extended(value: Bind<boolean>) {
        this.assignProperty('extended', value);
    }
    get direction(): SpeedDialDirection {
        return this.getProperty<SpeedDialDirection | undefined>('direction') ?? 'up';
    }
    set direction(value: Bind<SpeedDialDirection>) {
        this.assignProperty('direction', value);
    }
    get position(): SpeedDialPosition {
        return this.getProperty<SpeedDialPosition | undefined>('position') ?? 'bottom-end';
    }
    set position(value: Bind<SpeedDialPosition>) {
        this.assignProperty('position', value);
    }
    get open(): boolean {
        return this.getProperty<boolean | undefined>('open') === true;
    }
    set open(value: Bind<boolean>) {
        this.assignProperty('open', value);
    }
    /** `open`, for `x-model`. */
    get value(): boolean {
        return this.open;
    }
    set value(value: boolean) {
        this.open = value;
    }
    get closeOnAction(): boolean {
        return this.getProperty<boolean | undefined>('closeOnAction') !== false;
    }
    set closeOnAction(value: Bind<boolean>) {
        this.assignProperty('closeOnAction', value);
    }
    get showLabels(): boolean {
        return this.getProperty<boolean | undefined>('showLabels') !== false;
    }
    set showLabels(value: Bind<boolean>) {
        this.assignProperty('showLabels', value);
    }

    /** The actions opened. */
    get onOpened(): MotifEvent<SpeedDialEventArgs> {
        return this.opened.event;
    }

    /** The actions closed. */
    get onClosed(): MotifEvent<SpeedDialEventArgs> {
        return this.closed.event;
    }

    /** An action was pressed (`index`, `action`). */
    get onActionClick(): MotifEvent<SpeedDialActionClickEventArgs> {
        return this.actionClick.event;
    }

    /** Whether the actions are open. */
    get isOpen(): boolean {
        return this.open && !this.single;
    }

    /** The main button. */
    get mainElement(): HTMLButtonElement {
        return this.main.element;
    }

    /** The one action shown, when there is exactly one: the main button does it itself. */
    get single(): Look | null {
        const shown = this.looks.filter(look => look.visible);
        return shown.length === 1 ? shown[0] : null;
    }

    /** Opens the actions from code. */
    show(): void {
        this.setOpen(true, false);
    }

    /** Closes the actions from code. */
    close(): void {
        this.setOpen(false, false);
    }

    /** Opens the actions, or closes them. */
    toggle(): void {
        this.setOpen(!this.open, false);
    }

    /** Reads the actions again after they were changed in place. */
    refresh(): void {
        this.renderItems();
    }

    renderItems(): void {
        this.stopItems?.();
        const items = givenList(this.peekProperty<readonly unknown[]>('actions'));
        // The actions' own functions are followed; the list and the drawing are not.
        this.stopItems = follow(
            this,
            'actions',
            () => items.map(item => this.lookOf(item)),
            looks => {
                this.looks = looks;
                this.drawActions();
            }
        );
    }

    lookOf(item: unknown): Look {
        if (typeof item !== 'object' || item === null) {
            return { item, key: null, text: String(item ?? ''), glyph: '', icon: null, enabled: true, visible: true, click: null };
        }
        return {
            item,
            key: givenField<string | undefined>(item, 'key') ?? null,
            text: String(givenField(item, 'text') ?? ''),
            glyph: String(givenField(item, 'glyph') ?? ''),
            icon: givenValue<IconSource | undefined>(item, 'icon') ?? null,
            enabled: givenField(item, 'enabled') !== false,
            visible: givenField(item, 'visible') !== false,
            click: givenValue<((e: SpeedDialActionClickEventArgs) => void) | undefined>(item, 'click') ?? null
        };
    }

    // The action buttons are made again when the actions are others; otherwise written in place.
    drawActions(): void {
        const stale = this.parts.length !== this.looks.length || this.parts.some((p, i) => p.item !== this.looks[i].item);
        if (stale) {
            for (const p of this.parts) void p.button.dispose();
            this.parts = this.looks.map(look => this.makeAction(look));
        }
        this.looks.forEach((look, i) => {
            const p = this.parts[i];
            text(p.label.element, look.text);
            put(p.button.element, 'aria-label', look.text);
            put(p.button.element, 'aria-disabled', look.enabled ? null : 'true');
            shown(p.button.element, look.visible);
            if (p.icon) {
                void p.icon.dispose();
                p.icon = null;
            }
            if (look.icon) {
                p.icon = iconPart(p.iconHost, look.icon);
                p.icon.element.classList.add('mx-speed-dial__icon');
            }
            put(p.glyph.element, 'data-icon', look.glyph || null);
            shown(p.glyph.element, !look.icon && look.glyph !== '');
        });
        this.drawMain();
        this.drawOpen();
    }

    makeAction(look: Look): ActionPart {
        const button = part<HTMLButtonElement>(this.fan, 'button', 'mx-speed-dial__action');
        button.element.type = 'button';
        button.element.setAttribute('role', 'menuitem');
        button.element.tabIndex = -1;
        const iconHost = part<HTMLSpanElement>(button, 'span', 'mx-speed-dial__action-face');
        iconHost.element.setAttribute('aria-hidden', 'true');
        const glyph = glyphPart(iconHost, look.glyph || 'plus', 'mx-speed-dial__action-icon');
        const label = part<HTMLSpanElement>(button, 'span', 'mx-speed-dial__label');
        label.element.setAttribute('aria-hidden', 'true');
        return { item: look.item, button, iconHost, glyph, icon: null, label };
    }

    // The main button: the glyph, its name, and whether it opens the actions or is the one action itself.
    drawMain(): void {
        const single = this.single;
        const open = this.isOpen;
        const name = single ? single.text : this.peekProperty<string>('text') || uiLocale.strings.actions;
        const main = this.main.element;
        put(main, 'aria-label', name);
        put(main, 'aria-haspopup', single ? null : 'menu');
        put(main, 'aria-expanded', single ? null : open ? 'true' : 'false');
        put(main, 'aria-controls', single ? null : this.fan.element.id || null);
        put(main, 'aria-disabled', single && !single.enabled ? 'true' : null);
        put(this.mainGlyph.element, 'data-icon', open ? this.openGlyph : single?.glyph || this.glyph);
        text(this.mainText.element, name);
        shown(this.mainText.element, this.extended);
        mark(this.element, 'data-extended', this.extended);
        mark(this.element, 'data-single', !!single);
    }

    drawOpen(): void {
        const open = this.isOpen;
        mark(this.element, 'data-open', open);
        const fan = this.fan.element;
        fan.inert = !open;
        put(fan, 'aria-hidden', open ? null : 'true');
        this.drawMain();
    }

    setOpen(on: boolean, byUser: boolean, event?: Event): void {
        if (on === this.open || (on && this.single)) return;
        this.byUser = byUser;
        this.changeProperty('open', on);
        this.byUser = false;
        // `x-model` takes the state back.
        this.bindings.writeModel(on);
        if (!on && byUser && this.element.contains(this.element.ownerDocument.activeElement)) this.main.element.focus({ preventScroll: true });
    }

    shownActions(): ActionPart[] {
        return this.parts.filter((p, i) => this.looks[i].visible && this.looks[i].enabled);
    }

    run(index: number, event: Event): void {
        const look = this.looks[index];
        if (!look || !look.enabled) return;
        const args: SpeedDialActionClickEventArgs = { index, action: look.item, source: this, event };
        look.click?.(args);
        this.actionClick.fire(args);
        if (this.closeOnAction) this.setOpen(false, true, event);
    }

    mainClick(e: MouseEvent): void {
        if (!this.isEnabled) return;
        const single = this.single;
        if (single) {
            this.run(this.looks.indexOf(single), e);
            return;
        }
        this.setOpen(!this.open, true, e);
    }

    // Enter, Space and the arrow keys open the actions and put the focus on the first (or the last); Escape closes.
    mainKeyDown(e: KeyboardEvent): void {
        if (!this.isEnabled || this.single || e.altKey || e.ctrlKey || e.metaKey) return;
        const [back, forward] = this.axisKeys();
        if (e.key === 'Escape') {
            if (this.open) {
                e.preventDefault();
                this.setOpen(false, true, e);
            }
            return;
        }
        if (e.key !== forward && e.key !== back) return;
        e.preventDefault();
        this.setOpen(true, true, e);
        const actions = this.shownActions();
        const first = e.key === forward ? actions[0] : actions[actions.length - 1];
        first?.button.element.focus({ preventScroll: true });
    }

    // The keys along the fan move between the actions, Home and End to the ends, Escape and Tab close.
    fanKeyDown(e: KeyboardEvent): void {
        if (e.altKey || e.ctrlKey || e.metaKey) return;
        const actions = this.shownActions();
        const at = actions.findIndex(p => p.button.element === e.target);
        if (at < 0) return;
        const [back, forward] = this.axisKeys();
        let to = -1;
        if (e.key === forward) to = (at + 1) % actions.length;
        else if (e.key === back) to = (at - 1 + actions.length) % actions.length;
        else if (e.key === 'Home') to = 0;
        else if (e.key === 'End') to = actions.length - 1;
        else if (e.key === 'Escape') {
            e.preventDefault();
            this.setOpen(false, true, e);
            return;
        } else if (e.key === 'Tab') {
            this.setOpen(false, true, e);
            return;
        } else return;
        e.preventDefault();
        actions[to]?.button.element.focus({ preventScroll: true });
    }

    // The keys that run along the fan: Up and Down for an upright one, Left and Right for one that lies.
    axisKeys(): [string, string] {
        const direction = this.direction;
        if (direction === 'up') return ['ArrowDown', 'ArrowUp'];
        if (direction === 'down') return ['ArrowUp', 'ArrowDown'];
        const rtl = getComputedStyle(this.element).direction === 'rtl';
        const toStart = rtl ? 'ArrowRight' : 'ArrowLeft';
        const toEnd = rtl ? 'ArrowLeft' : 'ArrowRight';
        return direction === 'start' ? [toEnd, toStart] : [toStart, toEnd];
    }

    fanClick(e: MouseEvent): void {
        const button = (e.target as Element).closest<HTMLElement>('.mx-speed-dial__action');
        const index = this.parts.findIndex(p => p.button.element === button);
        if (index >= 0 && this.looks[index].enabled) this.run(index, e);
    }
}
