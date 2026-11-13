import { Component, Emitter, type Bind, type ComponentBase, type Event as MotifEvent, type IBaseProp } from "@motifx/core";
import { Control } from "../../core/control";
import { part, removePart } from "../../core/draw-parts";
import { focusOn } from "../../core/focus";
import { orderControls } from "../../core/order-controls";
import { onWindow } from "../../core/window-events";
import { follow } from "../../core/follow";
import { givenField, givenList, givenValue } from "../../core/given-field";
import { isRtl, measure, rectOf, shareAlong } from "../../core/measure";
import { onLanguage } from "../../core/on-language";
import { windowOf } from "../../core/page-documents";
import { css, mark, put, shown, text } from "../../core/part-writes";
import { uiLocale } from "../../core/ui-locale";
import { autoScroll } from "../../parts/drag/auto-scroll";
import { DragBoxes } from "../../parts/drag/drag-boxes";
import { DragGhost } from "../../parts/drag/DragGhost";
import { stackCover } from "../../parts/drag/stack-cover";
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
    tile: Component<HTMLDivElement>;
    started: boolean;
    toIndex: number;
    timer: ReturnType<typeof setTimeout> | null;
    boxes: DragBoxes | null;
    stopEdge: (() => void) | null;
}

// The tile a drag aims at and where the drop would land.
interface Aim {
    session: Session;
    over: ComponentBase | null;
    to: number;
    side: 'before' | 'after' | null;
}

/**
 * Tiles of different sizes packed on a grid of base cells, where a tile spans `widthRatio` × `heightRatio` cells. They
 * fill the height in columns and scroll horizontally (`horizontal`), or fill the width in rows (`vertical`). Tiles can
 * be selected (`selectionMode`) and reordered by dragging or with Ctrl and an arrow key (`allowReorder`). A drop
 * raises `onReordered` with the indexes, and your code reorders the data.
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
        this.class.add('mx-tile-view');
        this.grid = part<HTMLDivElement>(this, 'div', 'mx-tile-view__grid');
        this.live = part<HTMLSpanElement>(this, 'span', 'mx-sr-only');
        this.live.attr.add({ 'aria-live': 'polite' });
        this.ghost = new DragGhost(() => windowOf(this)?.document ?? document, () => true, 'mx-tile-view__ghost');
        for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
        if (own.onItemClick) this.onItemClick(own.onItemClick);
        if (own.onSelectionChanged) this.onSelectionChanged(own.onSelectionChanged);
        if (own.onReordering) this.onReordering(own.onReordering);
        if (own.onReordered) this.onReordered(own.onReordered);

        this.observeProperty('items', () => this.renderItems());
        this.observeProperty<number>('baseItemWidth', w => css(this, '--_base-w', `${Math.max(1, w ?? 100)}px`));
        this.observeProperty<number>('baseItemHeight', h => css(this, '--_base-h', `${Math.max(1, h ?? 100)}px`));
        this.observeProperty<TileViewDirection>('direction', d => put(this, 'data-direction', d ?? 'horizontal'));
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
        this.observeProperty<string | number | null>('height', h => css(this, 'block-size', typeof h === 'number' ? `${h}px` : h ?? ''));
        this.observeProperty<string>('label', () => this.renderName());
        onLanguage(this, () => this.renderName());
        this.motif.on('pointerdown', (_, e) => this.pointerDown(e));
        this.motif.on('click', (_, e) => this.click(e));
        this.motif.on('keydown', (_, e) => this.keyDown(e));
        this.motif.on('focusin', (_, e) => {
            const at = this.tileParts().findIndex(tile => tile.motif.isEventFrom(e));
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

    /** Occurs when a tile is clicked without dragging. */
    get onItemClick(): MotifEvent<TileClickEventArgs> {
        return this.itemClick.event;
    }

    /** Occurs when the selected tiles change (`indexes`, `items`, `byUser`). */
    get onSelectionChanged(): MotifEvent<TileSelectionChangedEventArgs> {
        return this.selectionChanged.event;
    }

    /** Occurs before a tile is dragged or moved with the keyboard. `cancel` keeps it in place. */
    get onReordering(): MotifEvent<TileReorderEventArgs> {
        return this.reordering.event;
    }

    /** Occurs after a tile is moved to a new position (`fromIndex`, `toIndex`). */
    get onReordered(): MotifEvent<TileReorderEventArgs> {
        return this.reordered.event;
    }

    /** The indexes of the selected tiles, in tile order. */
    get selectedIndexes(): number[] {
        const value = this.peekProperty<string | number | null | readonly (string | number)[] | undefined>('value');
        if (value === null || value === undefined || this.selectionMode === 'none') return [];
        const wanted = Array.isArray(value) ? value : [value as string | number];
        const indexes = wanted.map(v => this.indexOf(v)).filter(i => i >= 0);
        return [...new Set(indexes)].sort((a, b) => a - b);
    }

    /** The number of tiles. */
    get count(): number {
        return this.looks.length;
    }

    /** Indicates that a tile is being dragged. */
    get isDragging(): boolean {
        return !!this.session?.started;
    }

    /** Returns the index that a value identifies: a key, otherwise an index in range, or -1 if there is none. */
    indexOf(value: string | number | null | undefined): number {
        if (value === null || value === undefined) return -1;
        if (typeof value === 'string') return this.looks.findIndex(look => look.key === value);
        return Number.isInteger(value) && value >= 0 && value < this.looks.length ? value : -1;
    }

    /** Returns the value that identifies the tile at `index`: its key if it has one, otherwise the index. */
    valueAt(index: number): string | number {
        return this.looks[index]?.key ?? index;
    }

    /** Selects a tile programmatically, as the only one (`single`) or in addition to others (`multiple`). */
    select(index: number): void {
        this.choose(index, false, this.selectionMode === 'multiple' ? 'add' : 'only');
    }

    /** Re-reads the items after they have been changed in place. */
    refresh(): void {
        this.renderItems();
    }

    renderName(): void {
        put(this.grid, 'aria-label', this.peekProperty<string>('label') || uiLocale.strings.tiles);
    }

    renderItems(): void {
        this.stopItems?.();
        const items = givenList(this.peekProperty<readonly unknown[]>('items'));
        // The items' own functions are tracked; the list and the drawing are not.
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
        const order: ComponentBase[] = [];
        this.looks.forEach(look => {
            let tile = this.tiles.get(look.item);
            if (!tile) {
                tile = this.makeTile(look);
                this.tiles.set(look.item, tile);
            }
            seen.add(look.item);
            order.push(tile.el);
            const el = tile.el;
            text(tile.text, look.text);
            shown(tile.text, look.text !== '' && !tile.content);
            css(el, 'grid-column', `span ${look.widthRatio}`);
            css(el, 'grid-row', `span ${look.heightRatio}`);
        });
        for (const [item, tile] of this.tiles) {
            if (!seen.has(item)) {
                this.tiles.delete(item);
                removePart(tile.el);
            }
        }
        // The tiles in the items' order, the focused one never moved.
        orderControls(this.grid, order);
        this.drawStates();
    }

    makeTile(look: Look): Tile {
        const el = part<HTMLDivElement>(this.grid, 'div', 'mx-tile-view__tile');
        const label = part<HTMLSpanElement>(el, 'span', 'mx-tile-view__text');
        let content: ComponentBase | null = null;
        if (look.content) {
            content = look.content();
            el.controls.add(content);
        }
        return { item: look.item, el, text: label, content };
    }

    // The tiles in the items' order.
    tileParts(): Component<HTMLDivElement>[] {
        return this.looks.map(look => this.tiles.get(look.item)!.el);
    }

    // Whether an event started on something inside the tile that the selector picks (a button, a link, a field…).
    startedOn(tile: ComponentBase, selector: string, e: Event): boolean {
        return tile.$(selector).fromComponent().some(inner => inner !== tile && inner.motif.isEventFrom(e));
    }

    // Whether an event started on a tile of a tile view inside `root`.
    onInnerTile(root: ComponentBase, e: Event): boolean {
        return root.controls.items.some(child => {
            if (!child.motif.isEventFrom(e)) return false;
            if (child instanceof TileView && child.tileParts().some(tile => tile.motif.isEventFrom(e))) return true;
            return this.onInnerTile(child, e);
        });
    }

    drawRole(): void {
        const mode = this.selectionMode;
        put(this.grid, 'role', mode === 'none' ? 'list' : 'listbox');
        put(this.grid, 'aria-multiselectable', mode === 'multiple' ? 'true' : null);
        this.drawStates();
    }

    // What depends on the choice and the settings: roles, the chosen tiles, the disabled ones, the Tab stop.
    drawStates(): void {
        const mode = this.selectionMode;
        const chosen = new Set(this.selectedIndexes);
        this.looks.forEach((look, index) => {
            const el = this.tiles.get(look.item)?.el;
            if (!el) return;
            put(el, 'role', mode === 'none' ? 'listitem' : 'option');
            put(el, 'aria-selected', mode === 'none' ? null : chosen.has(index) ? 'true' : 'false');
            put(el, 'aria-disabled', look.enabled ? null : 'true');
        });
        mark(this, 'data-reorder', this.allowReorder);
        this.drawStops();
    }

    // One Tab stop: the tile focused last, else the first chosen, else the first enabled.
    drawStops(): void {
        const usable = this.looks.map(look => look.enabled);
        const chosen = this.selectedIndexes.find(i => usable[i]);
        const stop = this.focusedAt >= 0 && this.focusedAt < usable.length && usable[this.focusedAt] ? this.focusedAt : (chosen ?? usable.indexOf(true));
        this.looks.forEach((look, index) => put(this.tiles.get(look.item)!.el, 'tabindex', index === stop ? '0' : '-1'));
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
        const tiles = this.tileParts();
        const index = tiles.findIndex(tile => tile.motif.isEventFrom(e));
        if (index < 0) return;
        // A click on a button, a link or a field inside the tile is theirs, and so is one on a tile of a view inside it.
        if (this.startedOn(tiles[index], INTERACTIVE, e) || this.onInnerTile(tiles[index], e)) return;
        if (!this.looks[index].enabled) return;
        this.itemClick.fire({ index, item: this.looks[index].item, source: this, event: e });
        this.choose(index, true, this.selectionMode === 'multiple' && (e.ctrlKey || e.metaKey) ? 'toggle' : 'only');
    }

    // The tile in a direction: the nearest one whose middle lies that way.
    neighbour(from: number, dx: number, dy: number): number {
        const tiles = this.tileParts();
        const origin = rectOf(tiles[from]);
        const ox = origin.left + origin.width / 2;
        const oy = origin.top + origin.height / 2;
        let best = -1;
        let bestScore = Number.POSITIVE_INFINITY;
        tiles.forEach((tile, i) => {
            if (i === from || !this.looks[i].enabled) return;
            const box = rectOf(tile);
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
        const tiles = this.tileParts();
        const from = tiles.findIndex(tile => tile.motif.isEventFrom(e));
        if (from < 0) return;
        if (e.ctrlKey) {
            if (!this.allowReorder) return;
            let to = -1;
            if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') to = from - 1;
            else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') to = from + 1;
            else if (e.key === 'Home') to = 0;
            else if (e.key === 'End') to = tiles.length - 1;
            else return;
            e.preventDefault();
            if (to < 0 || to >= tiles.length || !this.looks[from].enabled) return;
            if (this.move(from, to, e, true)) focusOn(tiles[from], { preventScroll: true });
            return;
        }
        const rtl = isRtl(this);
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
        if (to >= 0) focusOn(tiles[to], { preventScroll: true });
    }

    // A move by the keys or a drop: the tile's element goes to its place and the app is told the indexes.
    move(from: number, to: number, event: Event | undefined, ask: boolean): boolean {
        if (from === to) return false;
        if (ask) {
            const args: TileReorderEventArgs = { item: this.looks[from].item, fromIndex: from, toIndex: to, cancel: false, source: this, event };
            this.reordering.fire(args);
            if (args.cancel) return false;
        }
        const tiles = this.tileParts();
        const tile = tiles[from];
        const others = tiles.filter(other => other !== tile);
        // The tile is moved alive among the grid's children.
        this.grid.controls.move(tile, others[to] ?? null);
        const look = this.looks.splice(from, 1)[0];
        this.looks.splice(to, 0, look);
        this.focusedAt = to;
        this.drawStops();
        text(this.live, uiLocale.text('sortableMoved', { index: to + 1, count: tiles.length }));
        this.reordered.fire({ item: look.item, fromIndex: from, toIndex: to, cancel: false, source: this, event });
        return true;
    }

    // A click on a tile: a drag may follow (a long press with a finger).
    pointerDown(e: PointerEvent): void {
        if (e.button !== 0 || this.session || !this.isEnabled || !this.allowReorder) return;
        const tiles = this.tileParts();
        const index = tiles.findIndex(tile => tile.motif.isEventFrom(e));
        if (index < 0 || !this.looks[index].enabled) return;
        const tile = tiles[index];
        // A press on a button, a link or a field inside the tile is theirs.
        if (this.startedOn(tile, INTERACTIVE, e)) return;
        const touch = e.pointerType === 'touch';
        const session: Session = { pointerId: e.pointerId, touch, startX: e.clientX, startY: e.clientY, x: e.clientX, y: e.clientY, fromIndex: index, tile, started: false, toIndex: -1, timer: null, boxes: null, stopEdge: null };
        this.session = session;
        const move = (ev: PointerEvent) => this.pointerMove(ev);
        const up = (ev: PointerEvent) => this.pointerUp(ev);
        const key = (ev: KeyboardEvent) => {
            if (ev.key === 'Escape' && this.session?.started) {
                ev.preventDefault();
                ev.stopPropagation();
                this.end(ev, false);
            }
        };
        // The drag goes on past the view: its window is listened to while it runs.
        this.stops.push(onWindow(this, 'pointermove', move), onWindow(this, 'pointerup', up), onWindow(this, 'pointercancel', up), onWindow(this, 'keydown', key, true));
        if (touch) {
            // A finger that moves before the long press is over scrolls; one that stays lifts the tile.
            session.timer = setTimeout(() => {
                session.timer = null;
                if (this.session === session) this.start(e);
            }, LONG_PRESS);
        } else {
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
        measure(this, this.readAim, this.paint);
    }

    pointerUp(e: PointerEvent): void {
        const s = this.session;
        if (!s || e.pointerId !== s.pointerId) return;
        if (!s.started) {
            this.end(null, false);
            return;
        }
        // The drop lands where the pointer is let go: read now, before anything is written.
        s.x = e.clientX;
        s.y = e.clientY;
        const aim = this.readAim();
        if (aim) s.toIndex = aim.to;
        // The click that follows the drop is not a click on the tile.
        const swallow = (ev: MouseEvent) => {
            ev.stopPropagation();
            ev.preventDefault();
        };
        setTimeout(onWindow(this, 'click', swallow, true), 0);
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
        // The other tiles are the ones a drop aims at; a window over the view hides what lies under it.
        s.boxes = new DragBoxes(this, () => this.tileParts().filter(tile => tile !== s.tile), stackCover);
        s.tile.attr.add({ setPointerCapture: e.pointerId });
        if (!s.tile.isDisposed) mark(s.tile, 'data-dragging', true);
        mark(this, 'data-dragging', true);
        if (!s.tile.isDisposed) this.ghost.show(s.tile, s.x, s.y, 'move');
        // Near an edge of the grid it scrolls on, along the way the tiles flow.
        s.stopEdge = autoScroll(this, this.grid, () => (this.session === s ? { x: s.x, y: s.y } : null), () => {
            s.boxes?.moved();
            measure(this, this.readAim, this.paint);
        }, { axis: this.direction === 'horizontal' ? 'x' : 'y' });
        return true;
    }

    // The tile under the pointer and which side of it: the drop lands before or after it.
    readonly readAim = (): Aim | null => {
        const s = this.session;
        if (!s?.started || !s.boxes) return null;
        const point = { x: s.x, y: s.y };
        const over = s.boxes.at(point, this);
        if (!over) return { session: s, over: null, to: -1, side: null };
        const first = shareAlong(over, point, this.direction === 'horizontal' ? 'y' : 'x') < 0.5;
        // Among the others, with the dragged tile counted out.
        const others = this.tileParts().filter(tile => tile !== s.tile);
        return { session: s, over, to: others.indexOf(over as Component<HTMLDivElement>) + (first ? 0 : 1), side: first ? 'before' : 'after' };
    };

    readonly paint = (aim: Aim | null): void => {
        const s = this.session;
        if (!aim || !s || aim.session !== s) return;
        s.toIndex = aim.to;
        for (const tile of this.tiles.values()) put(tile.el, 'data-drop', tile.el === aim.over && aim.to >= 0 ? aim.side : null);
        this.ghost.move(s.x, s.y, aim.to >= 0 ? 'move' : 'none');
    };

    end(e: Event | null, drop: boolean): void {
        const s = this.session;
        for (const stop of this.stops.splice(0)) stop();
        if (!s) return;
        this.session = null;
        if (s.timer) clearTimeout(s.timer);
        s.stopEdge?.();
        s.boxes?.stop();
        if (!s.started) return;
        this.ghost.hide();
        if (!s.tile.isDisposed) mark(s.tile, 'data-dragging', false);
        mark(this, 'data-dragging', false);
        // Let go after Escape; after a pointerup the browser already did, and letting go again does nothing.
        if (!s.tile.isDisposed) s.tile.attr.add({ releasePointerCapture: s.pointerId });
        for (const tile of this.tiles.values()) put(tile.el, 'data-drop', null);
        if (!drop || s.toIndex < 0) return;
        const landing = Math.min(s.toIndex, this.looks.length - 1);
        if (landing !== s.fromIndex) this.move(s.fromIndex, landing, e ?? undefined, false);
    }
}
