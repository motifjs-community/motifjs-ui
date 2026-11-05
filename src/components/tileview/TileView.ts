import { Component, Emitter, type Bind, type ComponentBase, type Event as MotifEvent, type IBaseProp } from "@motifx/core";
import { Control } from "../../core/control";
import { css, mark, part, put, shown, text } from "../../core/draw-parts";
import { follow } from "../../core/follow";
import { givenField, givenList, givenValue } from "../../core/given-field";
import { onLanguage } from "../../core/on-language";
import { uiLocale } from "../../core/ui-locale";
import { DragGhost } from "../../parts/drag/DragGhost";
import { scrollStep } from "../../parts/drag/scroll-step";
import type { TileClickEventArgs } from "./tile-click-event-args";
import type { TileReorderEventArgs } from "./tile-reorder-event-args";
import type { TileSelectionChangedEventArgs } from "./tile-selection-changed-event-args";
import type { TileViewItem } from "./tile-view-item";
import type { TileViewDirection, TileViewProps, TileViewSelectionMode } from "./tile-view-props";

const OWN = ['items', 'baseItemWidth', 'baseItemHeight', 'direction', 'selectionMode', 'value', 'allowReorder', 'height', 'label'] as const;
const THRESHOLD = 4;
const LONG_PRESS = 300;
const INTERACTIVE = 'button, a[href], input, textarea, select, [contenteditable]';

interface Look {
    item: unknown;
    key: string | null;
    text: string;
    widthRatio: number;
    heightRatio: number;
    content: (() => ComponentBase) | null;
    enabled: boolean;
}

interface Tile {
    item: unknown;
    el: Component<HTMLDivElement>;
    text: Component<HTMLSpanElement>;
    content: ComponentBase | null;
}

interface Session {
    pointerId: number;
    touch: boolean;
    startX: number;
    startY: number;
    x: number;
    y: number;
    fromIndex: number;
    element: HTMLElement;
    started: boolean;
    toIndex: number;
    timer: ReturnType<typeof setTimeout> | null;
    frame: number;
}

/**
 * Tiles of different sizes packed on a grid of base cells: a tile is `widthRatio` × `heightRatio` cells. They
 * fill the height in columns and the view scrolls sideways (`horizontal`), or fill the width in rows
 * (`vertical`). Tiles can be chosen (`selectionMode`) and put in another order by dragging or with Ctrl and an
 * arrow key (`allowReorder`); a drop tells `onReordered` with the indexes, your data is yours to reorder.
 *
 * @example
 * <TileView height={320} items={[{ text: 'Sales', widthRatio: 2 }, { text: 'Stock' }, { text: 'Staff', heightRatio: 2 }]} />
 * <TileView direction="vertical" selectionMode="multiple" x-model={() => this.chosen} items={() => this.tiles} />
 */
export class TileView extends Control<HTMLDivElement, TileViewProps> {
    itemClick = new Emitter<TileClickEventArgs>();
    selectionChanged = new Emitter<TileSelectionChangedEventArgs>();
    reordering = new Emitter<TileReorderEventArgs>();
    reordered = new Emitter<TileReorderEventArgs>();
    // The list itself; the text read out after a move lies beside it, so the list holds tiles only.
    grid: Component<HTMLDivElement>;
    live: Component<HTMLSpanElement>;
    ghost: DragGhost;
    tiles = new Map<unknown, Tile>();
    looks: Look[] = [];
    stopItems: (() => void) | null = null;
    stops: (() => void)[] = [];
    session: Session | null = null;
    // The tile focused last: Tab comes back to it.
    focusedAt = -1;
    byUser = false;
    ready = false;
    lastSelection = '';

    constructor(props?: IBaseProp<TileViewProps>) {
        super('div', props);
        const own = (this.props ?? {}) as TileViewProps;
        const el = this.element;
        el.classList.add('mx-tile-view');
        this.grid = part<HTMLDivElement>(this, 'div', 'mx-tile-view__grid');
        this.live = part<HTMLSpanElement>(this, 'span', 'mx-sr-only');
        this.live.element.setAttribute('aria-live', 'polite');
        this.ghost = new DragGhost(() => el.ownerDocument.body, () => true, 'mx-tile-view__ghost');
        for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
        if (own.onItemClick) this.onItemClick(own.onItemClick);
        if (own.onSelectionChanged) this.onSelectionChanged(own.onSelectionChanged);
        if (own.onReordering) this.onReordering(own.onReordering);
        if (own.onReordered) this.onReordered(own.onReordered);

        this.observeProperty('items', () => this.renderItems());
        this.observeProperty<number>('baseItemWidth', w => css(el, '--_base-w', `${Math.max(1, w ?? 100)}px`));
        this.observeProperty<number>('baseItemHeight', h => css(el, '--_base-h', `${Math.max(1, h ?? 100)}px`));
        this.observeProperty<TileViewDirection>('direction', d => put(el, 'data-direction', d ?? 'horizontal'));
        this.observeProperty<TileViewSelectionMode>('selectionMode', () => this.drawRole());
        this.observeProperty('value', () => {
            this.drawStates();
            if (!this.ready) return;
            const indexes = this.selectedIndexes;
            if (indexes.join() === this.lastSelection) return;
            this.lastSelection = indexes.join();
            this.selectionChanged.fire({ indexes, items: indexes.map(i => this.looks[i].item), byUser: this.byUser, source: this });
        });
        this.observeProperty('allowReorder', () => this.drawStates());
        this.observeProperty<string | number | null>('height', h => css(el, 'block-size', typeof h === 'number' ? `${h}px` : h ?? ''));
        this.observeProperty<string>('label', () => this.renderName());
        onLanguage(this, () => this.renderName());
        el.addEventListener('pointerdown', e => this.pointerDown(e));
        el.addEventListener('click', e => this.click(e));
        el.addEventListener('keydown', e => this.keyDown(e));
        el.addEventListener('focusin', e => {
            const at = this.tileElements().findIndex(tile => tile.contains(e.target as Node));
            if (at >= 0) {
                this.focusedAt = at;
                this.drawStops();
            }
        });
        this.motif.setDisposable(() => {
            this.end(null, false);
            this.stopItems?.();
            for (const emitter of [this.itemClick, this.selectionChanged, this.reordering, this.reordered]) emitter.dispose();
        });
        this.ready = true;
    }

    // Properties (see TileViewProps).

    get items(): readonly (TileViewItem | string)[] {
        return this.getProperty<readonly (TileViewItem | string)[] | undefined>('items') ?? [];
    }
    set items(value: Bind<readonly (TileViewItem | string)[]>) {
        this.assignProperty('items', value);
    }
    get baseItemWidth(): number {
        return this.getProperty<number | undefined>('baseItemWidth') ?? 100;
    }
    set baseItemWidth(value: Bind<number>) {
        this.assignProperty('baseItemWidth', value);
    }
    get baseItemHeight(): number {
        return this.getProperty<number | undefined>('baseItemHeight') ?? 100;
    }
    set baseItemHeight(value: Bind<number>) {
        this.assignProperty('baseItemHeight', value);
    }
    get direction(): TileViewDirection {
        return this.getProperty<TileViewDirection | undefined>('direction') ?? 'horizontal';
    }
    set direction(value: Bind<TileViewDirection>) {
        this.assignProperty('direction', value);
    }
    get selectionMode(): TileViewSelectionMode {
        return this.getProperty<TileViewSelectionMode | undefined>('selectionMode') ?? 'none';
    }
    set selectionMode(value: Bind<TileViewSelectionMode>) {
        this.assignProperty('selectionMode', value);
    }
    get value(): string | number | null | readonly (string | number)[] {
        return this.getProperty<string | number | null | readonly (string | number)[] | undefined>('value') ?? null;
    }
    set value(value: Bind<string | number | null | readonly (string | number)[]>) {
        this.assignProperty('value', value);
    }
    get allowReorder(): boolean {
        return this.getProperty<boolean | undefined>('allowReorder') === true;
    }
    set allowReorder(value: Bind<boolean>) {
        this.assignProperty('allowReorder', value);
    }
    get height(): string | number | null {
        return this.getProperty<string | number | null | undefined>('height') ?? null;
    }
    set height(value: Bind<string | number | null>) {
        this.assignProperty('height', value);
    }
    get label(): string {
        return this.getProperty<string | undefined>('label') ?? '';
    }
    set label(value: Bind<string>) {
        this.assignProperty('label', value);
    }

    /** A press on a tile that was not a drag. */
    get onItemClick(): MotifEvent<TileClickEventArgs> {
        return this.itemClick.event;
    }

    /** The chosen tiles changed (`indexes`, `items`, `byUser`). */
    get onSelectionChanged(): MotifEvent<TileSelectionChangedEventArgs> {
        return this.selectionChanged.event;
    }

    /** A tile is about to be dragged or moved with the keys; `cancel` keeps it where it is. */
    get onReordering(): MotifEvent<TileReorderEventArgs> {
        return this.reordering.event;
    }

    /** A tile was moved to another place (`fromIndex`, `toIndex`). */
    get onReordered(): MotifEvent<TileReorderEventArgs> {
        return this.reordered.event;
    }

    /** The chosen tiles' indexes, in tile order. */
    get selectedIndexes(): number[] {
        const value = this.peekProperty<string | number | null | readonly (string | number)[] | undefined>('value');
        if (value === null || value === undefined || this.selectionMode === 'none') return [];
        const wanted = Array.isArray(value) ? value : [value as string | number];
        const indexes = wanted.map(v => this.indexOf(v)).filter(i => i >= 0);
        return [...new Set(indexes)].sort((a, b) => a - b);
    }

    /** How many tiles there are. */
    get count(): number {
        return this.looks.length;
    }

    /** Whether a tile is being dragged. */
    get isDragging(): boolean {
        return !!this.session?.started;
    }

    /** The index a value names: a key, else an index in range; -1 for none. */
    indexOf(value: string | number | null | undefined): number {
        if (value === null || value === undefined) return -1;
        if (typeof value === 'string') return this.looks.findIndex(look => look.key === value);
        return Number.isInteger(value) && value >= 0 && value < this.looks.length ? value : -1;
    }

    /** The value that names the tile at `index`: its key when it has one, else the index. */
    valueAt(index: number): string | number {
        return this.looks[index]?.key ?? index;
    }

    /** Chooses a tile from code: the only one (`single`), or one more (`multiple`). */
    select(index: number): void {
        this.choose(index, false, this.selectionMode === 'multiple' ? 'add' : 'only');
    }

    /** Reads the items again after they were changed in place. */
    refresh(): void {
        this.renderItems();
    }

    renderName(): void {
        put(this.grid.element, 'aria-label', this.peekProperty<string>('label') || uiLocale.strings.tiles);
    }

    renderItems(): void {
        this.stopItems?.();
        const items = givenList(this.peekProperty<readonly unknown[]>('items'));
        // The items' own functions are followed; the list and the drawing are not.
        this.stopItems = follow(
            this,
            'items',
            () => items.map(item => this.lookOf(item)),
            looks => {
                this.looks = looks;
                this.drawTiles();
            }
        );
    }

    lookOf(item: unknown): Look {
        if (typeof item !== 'object' || item === null) {
            return { item, key: null, text: String(item ?? ''), widthRatio: 1, heightRatio: 1, content: null, enabled: true };
        }
        const ratio = (name: string) => Math.max(1, Math.floor(Number(givenField(item, name) ?? 1) || 1));
        return {
            item,
            key: givenField<string | undefined>(item, 'key') ?? null,
            text: String(givenField(item, 'text') ?? ''),
            widthRatio: ratio('widthRatio'),
            heightRatio: ratio('heightRatio'),
            content: givenValue<(() => ComponentBase) | undefined>(item, 'content') ?? null,
            enabled: givenField(item, 'enabled') !== false
        };
    }

    // Tiles keyed by item: a new item gets a tile, one gone loses it, the rest keep theirs and take their place.
    drawTiles(): void {
        const seen = new Set<unknown>();
        const grid = this.grid.element;
        let before: HTMLElement | null = null;
        this.looks.forEach(look => {
            let tile = this.tiles.get(look.item);
            if (!tile) {
                tile = this.makeTile(look);
                this.tiles.set(look.item, tile);
            }
            seen.add(look.item);
            const el = tile.el.element;
            const wanted = before ? before.nextSibling : grid.firstChild;
            if (wanted !== el) grid.insertBefore(el, wanted);
            before = el;
            text(tile.text.element, look.text);
            shown(tile.text.element, look.text !== '' && !tile.content);
            css(el, 'grid-column', `span ${look.widthRatio}`);
            css(el, 'grid-row', `span ${look.heightRatio}`);
        });
        for (const [item, tile] of this.tiles) {
            if (!seen.has(item)) {
                this.tiles.delete(item);
                void tile.el.dispose();
            }
        }
        this.drawStates();
    }

    makeTile(look: Look): Tile {
        const el = new Component<HTMLDivElement>('div');
        el.element.className = 'mx-tile-view__tile';
        this.grid.controls.add(el);
        const label = part<HTMLSpanElement>(el, 'span', 'mx-tile-view__text');
        let content: ComponentBase | null = null;
        if (look.content) {
            content = look.content();
            el.controls.add(content);
        }
        return { item: look.item, el, text: label, content };
    }

    tileElements(): HTMLElement[] {
        return this.looks.map(look => this.tiles.get(look.item)!.el.element);
    }

    drawRole(): void {
        const mode = this.selectionMode;
        put(this.grid.element, 'role', mode === 'none' ? 'list' : 'listbox');
        put(this.grid.element, 'aria-multiselectable', mode === 'multiple' ? 'true' : null);
        this.drawStates();
    }

    // What depends on the choice and the settings: roles, the chosen tiles, the disabled ones, the Tab stop.
    drawStates(): void {
        const mode = this.selectionMode;
        const chosen = new Set(this.selectedIndexes);
        this.looks.forEach((look, index) => {
            const el = this.tiles.get(look.item)?.el.element;
            if (!el) return;
            put(el, 'role', mode === 'none' ? 'listitem' : 'option');
            put(el, 'aria-selected', mode === 'none' ? null : chosen.has(index) ? 'true' : 'false');
            put(el, 'aria-disabled', look.enabled ? null : 'true');
        });
        mark(this.element, 'data-reorder', this.allowReorder);
        this.drawStops();
    }

    // One Tab stop: the tile focused last, else the first chosen, else the first enabled.
    drawStops(): void {
        const elements = this.tileElements();
        const usable = this.looks.map(look => look.enabled);
        const chosen = this.selectedIndexes.find(i => usable[i]);
        const stop = this.focusedAt >= 0 && this.focusedAt < elements.length && usable[this.focusedAt] ? this.focusedAt : (chosen ?? usable.indexOf(true));
        elements.forEach((el, index) => (el.tabIndex = index === stop ? 0 : -1));
    }

    // `only`: the tile alone; `add`: one more; `toggle`: in or out.
    choose(index: number, byUser: boolean, how: 'only' | 'add' | 'toggle'): void {
        const mode = this.selectionMode;
        const look = this.looks[index];
        if (mode === 'none' || !look || !look.enabled) return;
        const now = this.selectedIndexes;
        let next: (string | number)[] | string | number | null;
        if (mode === 'single') {
            const same = now.length === 1 && now[0] === index;
            if (same && how !== 'toggle') return;
            next = same ? null : this.valueAt(index);
        } else {
            const set = how === 'only' ? new Set<number>() : new Set(now);
            if (how === 'toggle' && set.has(index)) set.delete(index);
            else set.add(index);
            next = [...set].sort((a, b) => a - b).map(i => this.valueAt(i));
        }
        this.byUser = byUser;
        this.changeProperty('value', next);
        this.byUser = false;
        // `x-model` takes the choice back.
        this.bindings.writeModel(next);
    }

    click(e: MouseEvent): void {
        const target = e.target as Element;
        const el = target.closest<HTMLElement>('.mx-tile-view__tile');
        const index = el ? this.tileElements().indexOf(el) : -1;
        if (index < 0 || el!.parentElement !== this.grid.element) return;
        const control = target.closest(INTERACTIVE);
        if (control && control !== el && el!.contains(control)) return;
        if (!this.looks[index].enabled) return;
        this.itemClick.fire({ index, item: this.looks[index].item, source: this, event: e });
        this.choose(index, true, this.selectionMode === 'multiple' && (e.ctrlKey || e.metaKey) ? 'toggle' : 'only');
    }

    // The tile in a direction: the nearest one whose middle lies that way.
    neighbour(from: number, dx: number, dy: number): number {
        const elements = this.tileElements();
        const origin = elements[from].getBoundingClientRect();
        const ox = origin.left + origin.width / 2;
        const oy = origin.top + origin.height / 2;
        let best = -1;
        let bestScore = Number.POSITIVE_INFINITY;
        elements.forEach((el, i) => {
            if (i === from || !this.looks[i].enabled) return;
            const box = el.getBoundingClientRect();
            const cx = box.left + box.width / 2;
            const cy = box.top + box.height / 2;
            const along = (cx - ox) * dx + (cy - oy) * dy;
            if (along <= 1) return;
            const across = Math.abs((cx - ox) * dy) + Math.abs((cy - oy) * dx);
            const score = along + across * 3;
            if (score < bestScore) {
                bestScore = score;
                best = i;
            }
        });
        return best;
    }

    keyDown(e: KeyboardEvent): void {
        if (e.altKey || e.metaKey) return;
        const elements = this.tileElements();
        const from = elements.findIndex(el => el.contains(e.target as Node));
        if (from < 0) return;
        const rtl = getComputedStyle(this.element).direction === 'rtl';
        if (e.ctrlKey) {
            if (!this.allowReorder) return;
            let to = -1;
            if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') to = from - 1;
            else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') to = from + 1;
            else if (e.key === 'Home') to = 0;
            else if (e.key === 'End') to = elements.length - 1;
            else return;
            e.preventDefault();
            if (to < 0 || to >= elements.length || !this.looks[from].enabled) return;
            if (this.move(from, to, e, true)) elements[from].focus({ preventScroll: true });
            return;
        }
        let to = -1;
        if (e.key === 'ArrowLeft') to = this.neighbour(from, rtl ? 1 : -1, 0);
        else if (e.key === 'ArrowRight') to = this.neighbour(from, rtl ? -1 : 1, 0);
        else if (e.key === 'ArrowUp') to = this.neighbour(from, 0, -1);
        else if (e.key === 'ArrowDown') to = this.neighbour(from, 0, 1);
        else if (e.key === 'Home') to = this.looks.findIndex(look => look.enabled);
        else if (e.key === 'End') to = this.looks.map(look => look.enabled).lastIndexOf(true);
        else if (e.key === ' ' || e.key === 'Enter') {
            if (!this.looks[from].enabled) return;
            e.preventDefault();
            if (e.key === 'Enter') this.itemClick.fire({ index: from, item: this.looks[from].item, source: this, event: e });
            this.choose(from, true, e.key === ' ' ? 'toggle' : 'only');
            return;
        } else return;
        e.preventDefault();
        if (to >= 0) elements[to].focus({ preventScroll: true });
    }

    // A move by the keys or a drop: the tile's element goes to its place and the app is told the indexes.
    move(from: number, to: number, event: Event | undefined, ask: boolean): boolean {
        if (from === to) return false;
        if (ask) {
            const args: TileReorderEventArgs = { item: this.looks[from].item, fromIndex: from, toIndex: to, cancel: false, source: this, event };
            this.reordering.fire(args);
            if (args.cancel) return false;
        }
        const elements = this.tileElements();
        const el = elements[from];
        const others = elements.filter(other => other !== el);
        this.grid.element.insertBefore(el, others[to] ?? null);
        const look = this.looks.splice(from, 1)[0];
        this.looks.splice(to, 0, look);
        this.focusedAt = to;
        this.drawStops();
        text(this.live.element, uiLocale.text('sortableMoved', { index: to + 1, count: elements.length }));
        this.reordered.fire({ item: look.item, fromIndex: from, toIndex: to, cancel: false, source: this, event });
        return true;
    }

    // A press on a tile: a drag may follow (a long press with a finger).
    pointerDown(e: PointerEvent): void {
        if (e.button !== 0 || this.session || !this.isEnabled || !this.allowReorder) return;
        const target = e.target as HTMLElement;
        const element = this.tileElements().find(el => el.contains(target));
        if (!element) return;
        const index = this.tileElements().indexOf(element);
        if (!this.looks[index].enabled) return;
        if (target.closest(INTERACTIVE) && target.closest(INTERACTIVE) !== element) return;
        const touch = e.pointerType === 'touch';
        const session: Session = { pointerId: e.pointerId, touch, startX: e.clientX, startY: e.clientY, x: e.clientX, y: e.clientY, fromIndex: index, element, started: false, toIndex: -1, timer: null, frame: 0 };
        this.session = session;
        const win = element.ownerDocument.defaultView ?? window;
        const move = (ev: PointerEvent) => this.pointerMove(ev);
        const up = (ev: PointerEvent) => this.pointerUp(ev);
        const key = (ev: KeyboardEvent) => {
            if (ev.key === 'Escape' && this.session?.started) {
                ev.preventDefault();
                ev.stopPropagation();
                this.end(ev, false);
            }
        };
        win.addEventListener('pointermove', move);
        win.addEventListener('pointerup', up);
        win.addEventListener('pointercancel', up);
        win.addEventListener('keydown', key, true);
        this.stops.push(() => {
            win.removeEventListener('pointermove', move);
            win.removeEventListener('pointerup', up);
            win.removeEventListener('pointercancel', up);
            win.removeEventListener('keydown', key, true);
        });
        if (touch) {
            // A finger that moves before the long press is over scrolls; one that stays lifts the tile.
            session.timer = setTimeout(() => {
                session.timer = null;
                if (this.session === session) this.start(e);
            }, LONG_PRESS);
        } else if (!target.closest(INTERACTIVE)) {
            e.preventDefault();
        }
    }

    pointerMove(e: PointerEvent): void {
        const s = this.session;
        if (!s || e.pointerId !== s.pointerId) return;
        s.x = e.clientX;
        s.y = e.clientY;
        if (!s.started) {
            const moved = Math.max(Math.abs(e.clientX - s.startX), Math.abs(e.clientY - s.startY));
            if (s.touch) {
                if (moved >= THRESHOLD && s.timer) this.end(null, false);
                return;
            }
            if (moved < THRESHOLD || !this.start(e)) return;
        }
        if (s.touch) e.preventDefault();
        this.track();
        this.autoScroll();
    }

    pointerUp(e: PointerEvent): void {
        const s = this.session;
        if (!s || e.pointerId !== s.pointerId) return;
        if (!s.started) {
            this.end(null, false);
            return;
        }
        // The click that follows the drop is not a press on the tile.
        const win = s.element.ownerDocument.defaultView ?? window;
        const swallow = (ev: MouseEvent) => {
            ev.stopPropagation();
            ev.preventDefault();
        };
        win.addEventListener('click', swallow, true);
        setTimeout(() => win.removeEventListener('click', swallow, true), 0);
        this.end(e, e.type === 'pointerup');
    }

    start(e: PointerEvent): boolean {
        const s = this.session!;
        const args: TileReorderEventArgs = { item: this.looks[s.fromIndex].item, fromIndex: s.fromIndex, toIndex: s.fromIndex, cancel: false, source: this, event: e };
        this.reordering.fire(args);
        if (args.cancel) {
            this.end(null, false);
            return false;
        }
        s.started = true;
        s.toIndex = s.fromIndex;
        s.element.setPointerCapture?.(e.pointerId);
        mark(s.element, 'data-dragging', true);
        mark(this.element, 'data-dragging', true);
        this.ghost.show(s.element, s.x, s.y, 'move');
        return true;
    }

    // The tile under the pointer and which side of it: the drop lands before or after it.
    track(): void {
        const s = this.session;
        if (!s?.started) return;
        const doc = s.element.ownerDocument;
        const under = doc.elementFromPoint(s.x, s.y)?.closest<HTMLElement>('.mx-tile-view__tile') ?? null;
        const elements = this.tileElements();
        const at = under && under !== s.element && under.parentElement === this.grid.element ? elements.indexOf(under) : -1;
        let to = -1;
        let side: 'before' | 'after' | null = null;
        if (at >= 0) {
            const box = under!.getBoundingClientRect();
            const columns = this.direction === 'horizontal';
            const rtl = !columns && getComputedStyle(this.element).direction === 'rtl';
            const first = columns ? s.y < box.top + box.height / 2 : rtl ? s.x > box.left + box.width / 2 : s.x < box.left + box.width / 2;
            side = first ? 'before' : 'after';
            // Among the others, with the dragged tile counted out.
            const others = elements.filter(el => el !== s.element);
            to = others.indexOf(under!) + (first ? 0 : 1);
        }
        s.toIndex = to;
        elements.forEach(el => put(el, 'data-drop', el === under && to >= 0 ? side : null));
        this.ghost.move(s.x, s.y, to >= 0 ? 'move' : 'none');
    }

    autoScroll(): void {
        const s = this.session;
        if (!s?.started) return;
        const win = s.element.ownerDocument.defaultView ?? window;
        win.cancelAnimationFrame?.(s.frame);
        const step = () => {
            if (this.session !== s || !s.started) return;
            const el = this.grid.element;
            const box = el.getBoundingClientRect();
            const columns = this.direction === 'horizontal';
            const by = columns ? scrollStep(s.x, box.left, box.right, 40, 12) : scrollStep(s.y, box.top, box.bottom, 40, 12);
            if (by) {
                if (columns) el.scrollLeft += by;
                else el.scrollTop += by;
                this.track();
                s.frame = win.requestAnimationFrame(step);
            }
        };
        s.frame = win.requestAnimationFrame(step);
    }

    end(e: Event | null, drop: boolean): void {
        const s = this.session;
        for (const stop of this.stops.splice(0)) stop();
        if (!s) return;
        this.session = null;
        if (s.timer) clearTimeout(s.timer);
        const win = s.element.ownerDocument.defaultView ?? window;
        win.cancelAnimationFrame?.(s.frame);
        if (!s.started) return;
        this.ghost.hide();
        mark(s.element, 'data-dragging', false);
        mark(this.element, 'data-dragging', false);
        if (s.element.hasPointerCapture?.(s.pointerId)) s.element.releasePointerCapture(s.pointerId);
        for (const el of this.tileElements()) put(el, 'data-drop', null);
        if (!drop || s.toIndex < 0) return;
        const landing = Math.min(s.toIndex, this.looks.length - 1);
        if (landing !== s.fromIndex) this.move(s.fromIndex, landing, e ?? undefined, false);
    }
}
