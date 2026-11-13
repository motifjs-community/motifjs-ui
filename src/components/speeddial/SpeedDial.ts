import { Component, Emitter, reactive, untracked, type Bind, type ComponentBase, type Event as MotifEvent, type IBaseProp } from "@motifx/core";
import { Control } from "../../core/control";
import { glyphPart, iconPart, loose, part } from "../../core/draw-parts";
import { onDocument } from "../../core/window-events";
import { focusOn, holdsFocus } from "../../core/focus";
import { isRtl } from "../../core/measure";
import { follow } from "../../core/follow";
import { givenField, givenList, givenValue } from "../../core/given-field";
import type { IconSource } from "../../core/icon-source";
import { nextId } from "../../core/next-id";
import { onLanguage } from "../../core/on-language";
import { css, kept, mark, put, text } from "../../core/part-writes";
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
    iconSource: IconSource | null;
    label: Component<HTMLSpanElement>;
    /** The side its label and tooltip take (`data-side`), once it was laid out. */
    side: Side | null;
    tooltip: Tooltip | null;
}

/** The options each tooltip was made with. */
const madeWith = new WeakMap<Tooltip, SpeedDialTooltip>();

/** The tooltip of `target` for `options`: the one it has while they stay the same, else a new one that goes with `target`. */
function tooltipFor(target: ComponentBase, tooltip: Tooltip | null, options: SpeedDialTooltip | null): Tooltip | null {
    if (tooltip && options && sameOptions(madeWith.get(tooltip), options)) return tooltip;
    void tooltip?.dispose();
    if (!options) return null;
    const made = new Tooltip({ ...options, target });
    madeWith.set(made, options);
    return made;
}

/** Whether a tooltip made with `made` shows what `options` ask for: the same value in every field. */
function sameOptions(made: SpeedDialTooltip | undefined, options: SpeedDialTooltip): boolean {
    if (!made) return false;
    const keys = Object.keys(made) as (keyof SpeedDialTooltip)[];
    return keys.length === Object.keys(options).length && keys.every(key => key in options && Object.is(made[key], options[key]));
}

/**
 * A round button in a corner of the page, or in the page flow, that opens its actions when clicked. Each action is a
 * round button with a glyph, either in a line with a label next to it or on a circle around the button with a tooltip.
 * If one action is visible, the main button performs it directly. The actions act as a menu for the keyboard: the
 * arrow keys move, Enter and Space select, and Escape closes.
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
    /** The main button. */
    main: Component<HTMLButtonElement>;
    mainGlyph: Component<HTMLSpanElement>;
    mainText: Component<HTMLSpanElement>;
    parts: ActionPart[] = [];
    // The actions' parts by their key (else the action itself); a count that tells the fan to take the parts again.
    slots = new Map<unknown, ActionPart[]>();
    drawn = reactive({ count: 0 });
    looks: Look[] = [];
    mainTooltip: Tooltip | null = null;
    stopItems: (() => void) | null = null;
    byUser = false;
    ready = false;
    outside = (e: PointerEvent): void => {
        if (this.isOpen && !this.motif.isEventFrom(e)) this.setOpen(false, true, e);
    };

    constructor(props?: IBaseProp<SpeedDialProps>) {
        super('div', props);
        const own = (this.props ?? {}) as SpeedDialProps;
        const mainId = nextId('speed-dial');
        this.class.add('mx-speed-dial');
        this.fan = part<HTMLDivElement>(this, 'div', 'mx-speed-dial__fan');
        this.fan.attr.add({ role: 'menu', 'aria-labelledby': mainId });
        // Built once: the fan holds a button per action, made when the action comes and taken out when it goes.
        this.fan.bindings.list(
            () => {
                void this.drawn.count;
                return untracked(() => this.parts.map(p => p.button));
            },
            (c: ComponentBase) => c
        );
        this.main =part<HTMLButtonElement>(this, 'button', 'mx-speed-dial__main');
        this.main.attr.add({ type: 'button', id: mainId });
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
        this.main.motif.on('click', (_, e) => this.mainClick(e));
        this.main.motif.on('keydown', (_, e) => this.mainKeyDown(e));
        this.fan.motif.on('keydown', (_, e) => this.fanKeyDown(e));
        this.fan.motif.on('click', (_, e) => this.fanClick(e));
        // A press outside closes it.
        const stopOutside = onDocument(this, 'pointerdown', this.outside, true);
        this.motif.setDisposable(() => {
            stopOutside();
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
    /** Maps to `open` for `x-model`. */
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

    /** Occurs when the actions open. */
    get onOpened(): MotifEvent<SpeedDialEventArgs> {
        return this.opened.event;
    }

    /** Occurs when the actions close. */
    get onClosed(): MotifEvent<SpeedDialEventArgs> {
        return this.closed.event;
    }

    /** Occurs when an action is clicked (`index`, `action`). */
    get onActionClick(): MotifEvent<SpeedDialActionClickEventArgs> {
        return this.actionClick.event;
    }

    /** Indicates whether the actions are open. */
    get isOpen(): boolean {
        return this.open && !this.single;
    }

    /** The single visible action, when there is exactly one. The main button performs it directly. */
    get single(): Look | null {
        const shown = this.looks.filter(look => look.visible);
        return shown.length === 1 ? shown[0] : null;
    }

    /** Opens the actions programmatically. */
    show(): void {
        this.setOpen(true, false);
    }

    /** Closes the actions programmatically. */
    close(): void {
        this.setOpen(false, false);
    }

    /** Opens or closes the actions. */
    toggle(): void {
        this.setOpen(!this.open, false);
    }

    /** Re-reads the actions after they have been changed in place. */
    refresh(): void {
        this.renderItems();
    }

    renderItems(): void {
        this.stopItems?.();
        const items = givenList(this.peekProperty<readonly unknown[]>('actions'));
        // The actions' own functions are tracked; the list and the drawing are not.
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

    // An action keeps its button while an action of its key (else the same action) stays; a new one gets a button, and
    // the button of one that is gone goes with it. The buttons are written in place.
    drawActions(): void {
        const used = new Map<unknown, ActionPart[]>();
        this.parts = this.looks.map(look => {
            const id = look.key !== null ? `key:${look.key}` : look.item;
            const taken = used.get(id) ?? [];
            const p = this.slots.get(id)?.[taken.length] ?? this.makeAction(look);
            used.set(id, [...taken, p]);
            return p;
        });
        for (const [id, list] of this.slots) {
            const stay = used.get(id) ?? [];
            for (const p of list) if (!stay.includes(p)) void p.tooltip?.dispose();
        }
        this.slots = used;
        untracked(() => this.drawn.count++);
        this.looks.forEach((look, i) => {
            const p = this.parts[i];
            p.item = look.item;
            text(p.label, look.text);
            put(p.button, 'aria-label', look.text);
            put(p.button, 'aria-disabled', look.enabled ? null : 'true');
            kept(p.button, look.visible);
            if (look.icon !== p.iconSource) {
                void p.icon?.dispose();
                p.icon = look.icon ? iconPart(p.iconHost, look.icon) : null;
                p.icon?.class.add('mx-speed-dial__icon');
                p.iconSource = look.icon;
            }
            put(p.glyph, 'data-icon', look.glyph || null);
            kept(p.glyph, !look.icon && look.glyph !== '');
        });
        this.drawLayout();
        this.drawMain();
        this.drawOpen();
    }

    makeAction(look: Look): ActionPart {
        const button = loose<HTMLButtonElement>('button', 'mx-speed-dial__action');
        button.attr.add({ type: 'button', role: 'menuitem' });
        put(button, 'tabindex', '-1');
        const iconHost = part<HTMLSpanElement>(button, 'span', 'mx-speed-dial__action-face');
        iconHost.attr.add({ 'aria-hidden': 'true' });
        const glyph = glyphPart(iconHost, look.glyph || 'plus', 'mx-speed-dial__action-icon');
        const label = part<HTMLSpanElement>(button, 'span', 'mx-speed-dial__label');
        label.attr.add({ 'aria-hidden': 'true' });
        return { item: look.item, button, iconHost, glyph, icon: null, iconSource: null, label, side: null, tooltip: null };
    }

    // How the actions lie: their places around the button, the side their labels and tooltips take.
    drawLayout(): void {
        const layout = this.layout;
        const direction = this.direction;
        const linear = layout === 'linear';
        put(this, 'data-layout', layout);
        put(this, 'data-direction', linear ? this.lineDirection() : direction);
        put(this, 'data-position', this.position);
        put(this, 'data-relative', this.relativeTo);
        mark(this, 'data-labels', this.showLabels);
        const radius = this.radius;
        css(this, '--_radius', radius === null || linear ? '' : `${radius}px`);
        const shownParts = this.parts.filter((p, i) => this.looks[i].visible);
        const span = SPANS[layout];
        const count = shownParts.length;
        const step = count < 2 ? 180 : span === 360 ? span / count : span / (count - 1);
        const first = ANGLES[direction] - (span === 360 ? 0 : span / 2);
        css(this, '--_step', linear ? '' : `${step}deg`);
        shownParts.forEach((p, i) => {
            const angle = first + i * step;
            p.side = linear ? this.lineSide() : this.sideAt(angle);
            css(p.button, '--_angle', linear ? '' : `${angle}deg`);
            put(p.button, 'data-side', p.side);
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

    // What an action's tooltip shows; its own word takes precedence over the speed dial's.
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
            p.tooltip = tooltipFor(p.button, p.tooltip, this.tooltipOf(this.looks[i], p.side ?? 'start'));
        });
        const single = this.single;
        this.mainTooltip = tooltipFor(this.main, this.mainTooltip, single && this.tooltipOf(single, this.lineSide()));
    }

    // The main button: the glyph, its name, and whether it opens the actions or is the one action itself.
    drawMain(): void {
        const single = this.single;
        const open = this.isOpen;
        const name = single ? single.text : this.peekProperty<string>('text') || uiLocale.strings.actions;
        const main = this.main;
        put(main, 'aria-label', name);
        put(main, 'aria-haspopup', single ? null : 'menu');
        put(main, 'aria-expanded', single ? null : open ? 'true' : 'false');
        put(main, 'aria-disabled', single && !single.enabled ? 'true' : null);
        put(this.mainGlyph, 'data-icon', open ? this.openGlyph : single?.glyph || this.glyph);
        text(this.mainText, name);
        kept(this.mainText, this.extended);
        mark(this, 'data-extended', this.extended);
        mark(this, 'data-single', !!single);
    }

    drawOpen(): void {
        const open = this.isOpen;
        mark(this, 'data-open', open);
        mark(this.fan, 'inert', !open);
        put(this.fan, 'aria-hidden', open ? null : 'true');
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
        if (!on && byUser && holdsFocus(this)) focusOn(this.main, { preventScroll: true });
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
        if (first) focusOn(first.button, { preventScroll: true });
    }

    // The keys along the fan move between the actions, Home and End to the ends, Escape and Tab close.
    fanKeyDown(e: KeyboardEvent): void {
        if (e.altKey || e.ctrlKey || e.metaKey) return;
        const actions = this.shownActions();
        const at = actions.findIndex(p => p.button.motif.isEventFrom(e));
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
        focusOn(actions[to].button, { preventScroll: true });
    }

    // The keys back and forward: along a line Up and Down, or Left and Right; around the button either pair.
    moveKeys(): [string[], string[]] {
        const rtl = isRtl(this);
        const toStart = rtl ? 'ArrowRight' : 'ArrowLeft';
        const toEnd = rtl ? 'ArrowLeft' : 'ArrowRight';
        if (this.layout !== 'linear') return [['ArrowUp', toStart], ['ArrowDown', toEnd]];
        const direction = this.lineDirection();
        if (direction === 'up') return [['ArrowDown'], ['ArrowUp']];
        if (direction === 'down') return [['ArrowUp'], ['ArrowDown']];
        return direction === 'start' ? [[toEnd], [toStart]] : [[toStart], [toEnd]];
    }

    fanClick(e: MouseEvent): void {
        const index = this.parts.findIndex(p => p.button.motif.isEventFrom(e));
        if (index >= 0 && this.looks[index].enabled) this.run(index, e);
    }
}
