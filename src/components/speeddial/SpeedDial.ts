import { Component, Emitter, type Bind, type ComponentBase, type Event as MotifEvent, type IBaseProp } from "@motifx/core";
import { Control } from "../../core/control";
import { css, glyphPart, iconPart, mark, part, put, shown, text } from "../../core/draw-parts";
import { follow } from "../../core/follow";
import { givenField, givenList, givenValue } from "../../core/given-field";
import type { IconSource } from "../../core/icon-source";
import { nextId } from "../../core/next-id";
import { onLanguage } from "../../core/on-language";
import { uiLocale } from "../../core/ui-locale";
import { Tooltip } from "../tooltip/Tooltip";
import type { SpeedDialAction } from "./speed-dial-action";
import type { SpeedDialActionClickEventArgs } from "./speed-dial-action-click-event-args";
import type { SpeedDialEventArgs } from "./speed-dial-event-args";
import type { SpeedDialDirection, SpeedDialLayout, SpeedDialPosition, SpeedDialProps, SpeedDialRelativeTo } from "./speed-dial-props";
import type { SpeedDialTooltip } from "./speed-dial-tooltip";

const OWN = ['actions', 'glyph', 'openGlyph', 'text', 'extended', 'layout', 'radius', 'direction', 'position', 'relativeTo', 'open', 'closeOnAction', 'showLabels', 'tooltip'] as const;

// Angles run clockwise from the inline end, so a right-to-left page mirrors them by itself.
const ANGLES: Record<SpeedDialDirection, number> = { end: 0, 'down-end': 45, down: 90, 'down-start': 135, start: 180, 'up-start': 225, up: 270, 'up-end': 315 };
const SPANS: Record<SpeedDialLayout, number> = { linear: 0, circle: 360, 'semi-circle': 180, 'quarter-circle': 90 };
const TOOLTIP_DELAY = 200;

type Side = 'top' | 'bottom' | 'start' | 'end';

interface Look {
    item: unknown;
    key: string | null;
    text: string;
    glyph: string;
    icon: IconSource | null;
    enabled: boolean;
    visible: boolean;
    click: ((e: SpeedDialActionClickEventArgs) => void) | null;
    tooltip: string | boolean | SpeedDialTooltip | undefined;
}

interface ActionPart {
    item: unknown;
    button: Component<HTMLButtonElement>;
    iconHost: Component<HTMLSpanElement>;
    glyph: Component<HTMLSpanElement>;
    icon: ComponentBase | null;
    label: Component<HTMLSpanElement>;
    tooltip: Tooltip | null;
}

/**
 * A round button in a corner of the page (or in the flow) that opens its actions when pressed: each a round button
 * with a glyph, in a line with a label beside it, or on a circle around the button with a tooltip. With one action
 * shown, the main button does it itself. The actions are a menu for the keys: the arrows move, Enter and Space
 * choose, Escape closes.
 *
 * @example
 * <SpeedDial text="New" actions={[{ text: 'Note', glyph: 'pencil', click: () => this.newNote() }, { text: 'Event', glyph: 'calendar', click: () => this.newEvent() }]} />
 * <SpeedDial layout="quarter-circle" actions={() => this.tools} />
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
    mainTooltip: Tooltip | null = null;
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
        for (const name of ['layout', 'radius', 'direction', 'position', 'relativeTo', 'showLabels', 'tooltip'] as const) this.observeProperty(name, () => this.drawLayout());
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
            for (const p of this.parts) void p.tooltip?.dispose();
            void this.mainTooltip?.dispose();
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
    get layout(): SpeedDialLayout {
        return this.getProperty<SpeedDialLayout | undefined>('layout') ?? 'linear';
    }
    set layout(value: Bind<SpeedDialLayout>) {
        this.assignProperty('layout', value);
    }
    get radius(): number | null {
        return this.getProperty<number | undefined>('radius') ?? null;
    }
    set radius(value: Bind<number | null>) {
        this.assignProperty('radius', value);
    }
    get direction(): SpeedDialDirection {
        return this.getProperty<SpeedDialDirection | undefined>('direction') ?? this.awayFromEdges();
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
    get relativeTo(): SpeedDialRelativeTo {
        return this.getProperty<SpeedDialRelativeTo | undefined>('relativeTo') ?? 'viewport';
    }
    set relativeTo(value: Bind<SpeedDialRelativeTo>) {
        this.assignProperty('relativeTo', value);
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
        return this.getProperty<boolean | undefined>('showLabels') ?? this.layout === 'linear';
    }
    set showLabels(value: Bind<boolean>) {
        this.assignProperty('showLabels', value);
    }
    get tooltip(): boolean | SpeedDialTooltip {
        return this.getProperty<boolean | SpeedDialTooltip | undefined>('tooltip') ?? !this.showLabels;
    }
    set tooltip(value: Bind<boolean | SpeedDialTooltip>) {
        this.assignProperty('tooltip', value);
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
            return { item, key: null, text: String(item ?? ''), glyph: '', icon: null, enabled: true, visible: true, click: null, tooltip: undefined };
        }
        return {
            item,
            key: givenField<string | undefined>(item, 'key') ?? null,
            text: String(givenField(item, 'text') ?? ''),
            glyph: String(givenField(item, 'glyph') ?? ''),
            icon: givenValue<IconSource | undefined>(item, 'icon') ?? null,
            enabled: givenField(item, 'enabled') !== false,
            visible: givenField(item, 'visible') !== false,
            click: givenValue<((e: SpeedDialActionClickEventArgs) => void) | undefined>(item, 'click') ?? null,
            tooltip: givenField<string | boolean | SpeedDialTooltip | undefined>(item, 'tooltip')
        };
    }

    // The action buttons are made again when the actions are others; otherwise written in place.
    drawActions(): void {
        const stale = this.parts.length !== this.looks.length || this.parts.some((p, i) => p.item !== this.looks[i].item);
        if (stale) {
            for (const p of this.parts) {
                void p.tooltip?.dispose();
                void p.button.dispose();
            }
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
        this.drawLayout();
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
        return { item: look.item, button, iconHost, glyph, icon: null, label, tooltip: null };
    }

    // How the actions lie: their places around the button, the side their labels and tooltips take.
    drawLayout(): void {
        const el = this.element;
        const layout = this.layout;
        const direction = this.direction;
        const linear = layout === 'linear';
        put(el, 'data-layout', layout);
        put(el, 'data-direction', linear ? this.lineDirection() : direction);
        put(el, 'data-position', this.position);
        put(el, 'data-relative', this.relativeTo);
        mark(el, 'data-labels', this.showLabels);
        const radius = this.radius;
        css(el, '--_radius', radius === null || linear ? '' : `${radius}px`);
        const shownParts = this.parts.filter((p, i) => this.looks[i].visible);
        const span = SPANS[layout];
        const count = shownParts.length;
        const step = count < 2 ? 180 : span === 360 ? span / count : span / (count - 1);
        const first = ANGLES[direction] - (span === 360 ? 0 : span / 2);
        css(el, '--_step', linear ? '' : `${step}deg`);
        shownParts.forEach((p, i) => {
            const angle = first + i * step;
            css(p.button.element, '--_angle', linear ? '' : `${angle}deg`);
            put(p.button.element, 'data-side', linear ? this.lineSide() : this.sideAt(angle));
        });
        this.drawTooltips();
    }

    // The way a line runs: a diagonal takes its first word.
    lineDirection(): 'up' | 'down' | 'start' | 'end' {
        return this.direction.split('-')[0] as 'up' | 'down' | 'start' | 'end';
    }

    // A line's labels lie across it, on the side away from the edge.
    lineSide(): Side {
        const position = this.position;
        const way = this.lineDirection();
        if (way === 'up' || way === 'down') return position.endsWith('start') ? 'end' : 'start';
        return position.startsWith('top') ? 'bottom' : 'top';
    }

    // On a circle a label lies outwards: over or under near the top and the bottom, beside it elsewhere.
    sideAt(angle: number): Side {
        const across = Math.cos((angle * Math.PI) / 180);
        if (Math.abs(across) >= 0.38) return across > 0 ? 'end' : 'start';
        return Math.sin((angle * Math.PI) / 180) < 0 ? 'top' : 'bottom';
    }

    // The way into the page from the edges `position` names.
    awayFromEdges(): SpeedDialDirection {
        const position = this.position;
        const up = position.startsWith('top') ? 'down' : position.startsWith('bottom') ? 'up' : '';
        const along = position.endsWith('start') ? 'end' : position.endsWith('end') ? 'start' : '';
        if (up && along && this.layout !== 'linear') return `${up}-${along}` as SpeedDialDirection;
        return (up || along || 'up') as SpeedDialDirection;
    }

    // What an action's tooltip shows; its own word wins over the speed dial's.
    tooltipOf(look: Look, side: Side): SpeedDialTooltip | null {
        const own = look.tooltip;
        const all = this.tooltip;
        if (own === false || (own === undefined && all === false)) return null;
        return {
            text: look.text,
            placement: side,
            delay: TOOLTIP_DELAY,
            ...(typeof all === 'object' ? all : {}),
            ...(typeof own === 'string' ? { text: own } : typeof own === 'object' ? own : {})
        };
    }

    // With one action shown, the main button is that action and carries its tooltip.
    drawTooltips(): void {
        this.parts.forEach((p, i) => {
            void p.tooltip?.dispose();
            const options = this.tooltipOf(this.looks[i], (p.button.element.getAttribute('data-side') as Side | null) ?? 'start');
            p.tooltip = options ? new Tooltip({ ...options, target: p.button.element }) : null;
        });
        void this.mainTooltip?.dispose();
        const single = this.single;
        const options = single && this.tooltipOf(single, this.lineSide());
        this.mainTooltip = options ? new Tooltip({ ...options, target: this.main.element }) : null;
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
        if (!open) for (const p of this.parts) p.tooltip?.close();
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
        const [back, forward] = this.moveKeys();
        if (e.key === 'Escape') {
            if (this.open) {
                e.preventDefault();
                this.setOpen(false, true, e);
            }
            return;
        }
        if (!forward.includes(e.key) && !back.includes(e.key)) return;
        e.preventDefault();
        this.setOpen(true, true, e);
        const actions = this.shownActions();
        const first = forward.includes(e.key) ? actions[0] : actions[actions.length - 1];
        first?.button.element.focus({ preventScroll: true });
    }

    // The keys along the fan move between the actions, Home and End to the ends, Escape and Tab close.
    fanKeyDown(e: KeyboardEvent): void {
        if (e.altKey || e.ctrlKey || e.metaKey) return;
        const actions = this.shownActions();
        const at = actions.findIndex(p => p.button.element === e.target);
        if (at < 0) return;
        const [back, forward] = this.moveKeys();
        let to = -1;
        if (forward.includes(e.key)) to = (at + 1) % actions.length;
        else if (back.includes(e.key)) to = (at - 1 + actions.length) % actions.length;
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

    // The keys back and forward: along a line Up and Down, or Left and Right; around the button either pair.
    moveKeys(): [string[], string[]] {
        const rtl = getComputedStyle(this.element).direction === 'rtl';
        const toStart = rtl ? 'ArrowRight' : 'ArrowLeft';
        const toEnd = rtl ? 'ArrowLeft' : 'ArrowRight';
        if (this.layout !== 'linear') return [['ArrowUp', toStart], ['ArrowDown', toEnd]];
        const direction = this.lineDirection();
        if (direction === 'up') return [['ArrowDown'], ['ArrowUp']];
        if (direction === 'down') return [['ArrowUp'], ['ArrowDown']];
        return direction === 'start' ? [[toEnd], [toStart]] : [[toStart], [toEnd]];
    }

    fanClick(e: MouseEvent): void {
        const button = (e.target as Element).closest<HTMLElement>('.mx-speed-dial__action');
        const index = this.parts.findIndex(p => p.button.element === button);
        if (index >= 0 && this.looks[index].enabled) this.run(index, e);
    }
}
