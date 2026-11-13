import { Component, Emitter, type Bind, type ComponentBase, type Event as MotifEvent, type IBaseProp } from "@motifx/core";
import { compareTreeOrder } from "../../core/component-tree";
import { Control } from "../../core/control";
import { part } from "../../core/draw-parts";
import { rememberFocus } from "../../core/focus";
import { follow } from "../../core/follow";
import { boxOf, isRtl, measure, rectOf, styleOf } from "../../core/measure";
import { isElement } from "../../core/node-kind";
import { orderControls } from "../../core/order-controls";
import { windowOf } from "../../core/page-documents";
import { onWindow } from "../../core/window-events";
import { givenList } from "../../core/given-field";
import { onLanguage } from "../../core/on-language";
import { css, mark, put, shown, text } from "../../core/part-writes";
import { uiLocale } from "../../core/ui-locale";
import { autoScroll } from "../../parts/drag/auto-scroll";
import { DragBoxes } from "../../parts/drag/drag-boxes";
import { DragGhost } from "../../parts/drag/DragGhost";
import { stackCover } from "../../parts/drag/stack-cover";
import type { SortableDragEventArgs } from "./sortable-drag-event-args";
import type { SortableDropEventArgs } from "./sortable-drop-event-args";
import type { SortableOrientation } from "./sortable-orientation";
import type { SortableProps } from "./sortable-props";

const OWN = ['items', 'handle', 'group', 'allowReordering', 'orientation', 'label'] as const;

// Every sortable on the page, so a drag finds the ones of its group under the pointer.
const ALL = new Set<Sortable<unknown>>();

// The parts a sortable made a Tab stop: the stop is taken back when moving is turned off.
const STOPS = new WeakSet<ComponentBase>();

const THRESHOLD = 4;
const LONG_PRESS = 300;
const INTERACTIVE = 'button, a[href], input, textarea, select, [contenteditable]';

interface Session {
    pointerId: number;
    touch: boolean;
    startX: number;
    startY: number;
    x: number;
    y: number;
    item: unknown;
    // The component of the item dragged.
    row: ComponentBase;
    fromIndex: number;
    started: boolean;
    // Where it would land: the sortable and the index among its items (the source counted out).
    to: Sortable<unknown> | null;
    toIndex: number;
    refused: boolean;
    timer: ReturnType<typeof setTimeout> | null;
    // The boxes of the sortables the drag aims at, kept while it lasts.
    boxes: DragBoxes | null;
    // The last pointer move, followed at the next frame.
    event: PointerEvent | null;
    // Takes back the pointer move waiting for the next frame.
    waiting: (() => void) | null;
    // Stops scrolling near the edges.
    stopEdge: (() => void) | null;
}

/** What scrolls up and down while an item is dragged over `target`: the nearest component above it that scrolls and has room to, else `target` when it has room. In a read. */
function scrollerFor(target: ComponentBase): ComponentBase | null {
    for (let c = target.parent; c; c = c.parent) {
        if (!/auto|scroll/.test(styleOf(c, ['overflow-y'])['overflow-y'])) continue;
        const box = boxOf(c);
        if (box.scrollHeight > box.clientHeight) return c;
    }
    const own = boxOf(target);
    return own.scrollHeight > own.clientHeight ? target : null;
}

/** The items under `parent`, in order: its children with an element of their own, and those inside a child without one (a JSX list, a condition). */
function itemsIn(parent: ComponentBase, own: readonly ComponentBase[], found: ComponentBase[]): ComponentBase[] {
    for (const child of parent.controls.items) {
        if (own.includes(child) || child.isDisposed || !child.isVisible || child.isWait) continue;
        if (isElement(child.element)) found.push(child);
        else itemsIn(child, own, found);
    }
    return found;
}

/** The buttons, links and fields of an item, the item itself first when it is one. */
function fieldsOf(row: ComponentBase): ComponentBase[] {
    return row.$(INTERACTIVE).fromComponent();
}

/**
 * Items the user reorders by dragging, with the pointer or a finger (a long press), or with the keyboard
 * (Ctrl + an arrow moves the focused item one position). Sortables in the same `group` exchange items. The items
 * are the JSX children, or `items` drawn with `itemTemplate`. A drop moves the item's element and reports the
 * indexes to `onReorder` (`onRemove` and `onAdd` across sortables). Your code reorders the data.
 *
 * @example
 * <Sortable label="Steps" onReorder={e => this.steps.splice(e.toIndex, 0, ...this.steps.splice(e.fromIndex, 1))}>
 *   {this.steps.map(step => <StepRow key={step.id} step={step} />)}
 * </Sortable>
 * <Sortable items={() => this.todo} itemTemplate={item => new TodoRow({ item })} group="tasks" onAdd={…} onRemove={…} />
 */
export class Sortable<T = unknown> extends Control<HTMLDivElement, SortableProps<T>> {
    dragStarting = new Emitter<SortableDragEventArgs<T>>();
    dragChanging = new Emitter<SortableDragEventArgs<T>>();
    dragEnding = new Emitter<SortableDragEventArgs<T>>();
    reordered = new Emitter<SortableDropEventArgs<T>>();
    added = new Emitter<SortableDropEventArgs<T>>();
    removed = new Emitter<SortableDropEventArgs<T>>();
    rows = new Map<unknown, ComponentBase>();
    stopItems: (() => void) | null = null;
    session: Session | null = null;
    stops: (() => void)[] = [];
    line: Component<HTMLSpanElement>;
    live: Component<HTMLSpanElement>;
    ghost: DragGhost;
    // The item focused last: Tab comes back to it.
    focusedAt = -1;

    constructor(props?: IBaseProp<SortableProps<T>>) {
        super('div', props);
        const own = (this.props ?? {}) as SortableProps<T>;
        this.class.add('mx-sortable');
        this.attr.add({ role: 'group' });
        this.line = part<HTMLSpanElement>(this, 'span', 'mx-sortable__line');
        this.line.attr.add({ 'aria-hidden': 'true' });
        shown(this.line, false);
        this.live = part<HTMLSpanElement>(this, 'span', 'mx-sr-only');
        this.live.attr.add({ 'aria-live': 'polite' });
        this.ghost = new DragGhost(() => windowOf(this)?.document ?? document, () => true, 'mx-sortable__ghost');
        for (const child of this.childs ?? []) this.controls.add(child);

        for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
        if (own.itemTemplate !== undefined) this.setProperty('itemTemplate', own.itemTemplate);
        if (own.onDragStarting) this.dragStarting.event(own.onDragStarting);
        if (own.onDragChanging) this.dragChanging.event(own.onDragChanging);
        if (own.onDragEnding) this.dragEnding.event(own.onDragEnding);
        if (own.onReorder) this.reordered.event(own.onReorder);
        if (own.onAdd) this.added.event(own.onAdd);
        if (own.onRemove) this.removed.event(own.onRemove);

        this.observeProperty('items', () => this.renderItems());
        this.observeProperty('itemTemplate', () => this.renderItems());
        for (const name of ['handle', 'allowReordering'] as const) this.observeProperty(name, () => this.drawItems());
        this.observeProperty<SortableOrientation>('orientation', o => put(this, 'data-orientation', o ?? 'vertical'));
        this.observeProperty<string>('label', label => put(this, 'aria-label', label || null));
        onLanguage(this, () => this.drawItems());
        this.motif.on('pointerdown', (_, e) => this.pointerDown(e));
        this.motif.on('keydown', (_, e) => this.keyDown(e));
        this.motif.on('focusin', (_, e) => {
            const at = this.itemParts().findIndex(item => item.motif.isEventFrom(e));
            if (at >= 0) {
                this.focusedAt = at;
                this.drawStops();
            }
        });
        ALL.add(this as Sortable<unknown>);
        this.motif.setDisposable(() => {
            ALL.delete(this as Sortable<unknown>);
            this.end(null, false);
            this.stopItems?.();
            for (const emitter of [this.dragStarting, this.dragChanging, this.dragEnding, this.reordered, this.added, this.removed]) emitter.dispose();
        });
        this.drawItems();
    }

    // Properties (see SortableProps).

    get items(): readonly T[] {
        return this.getProperty<readonly T[] | undefined>('items') ?? [];
    }
    set items(value: Bind<readonly T[]>) {
        this.assignProperty('items', value);
    }
    get itemTemplate(): ((item: T, index: number) => ComponentBase) | undefined {
        return this.getProperty<((item: T, index: number) => ComponentBase) | undefined>('itemTemplate');
    }
    set itemTemplate(value: ((item: T, index: number) => ComponentBase) | undefined) {
        this.setProperty('itemTemplate', value);
    }
    get handle(): string | null {
        return this.getProperty<string | null | undefined>('handle') ?? null;
    }
    set handle(value: Bind<string | null>) {
        this.assignProperty('handle', value);
    }
    get group(): string | null {
        return this.getProperty<string | null | undefined>('group') ?? null;
    }
    set group(value: Bind<string | null>) {
        this.assignProperty('group', value);
    }
    get allowReordering(): boolean {
        return this.getProperty<boolean | undefined>('allowReordering') !== false;
    }
    set allowReordering(value: Bind<boolean>) {
        this.assignProperty('allowReordering', value);
    }
    get orientation(): SortableOrientation {
        return this.getProperty<SortableOrientation | undefined>('orientation') ?? 'vertical';
    }
    set orientation(value: Bind<SortableOrientation>) {
        this.assignProperty('orientation', value);
    }
    get label(): string {
        return this.getProperty<string | undefined>('label') ?? '';
    }
    set label(value: Bind<string>) {
        this.assignProperty('label', value);
    }

    get onDragStarting(): MotifEvent<SortableDragEventArgs<T>> {
        return this.dragStarting.event;
    }
    get onDragChanging(): MotifEvent<SortableDragEventArgs<T>> {
        return this.dragChanging.event;
    }
    get onDragEnding(): MotifEvent<SortableDragEventArgs<T>> {
        return this.dragEnding.event;
    }
    get onReorder(): MotifEvent<SortableDropEventArgs<T>> {
        return this.reordered.event;
    }
    get onAdd(): MotifEvent<SortableDropEventArgs<T>> {
        return this.added.event;
    }
    get onRemove(): MotifEvent<SortableDropEventArgs<T>> {
        return this.removed.event;
    }

    /** Indicates whether an item is being dragged. */
    get isDragging(): boolean {
        return !!this.session?.started;
    }

    /** Moves the item at `fromIndex` to `toIndex` as a drop would, and raises `onReorder`. Returns `false` if nothing moved. */
    move(fromIndex: number, toIndex: number, event?: Event): boolean {
        const items = this.itemParts();
        const row = items[fromIndex];
        if (!row || toIndex < 0 || toIndex >= items.length || toIndex === fromIndex) {
            return false;
        }
        const item = this.itemOf(row);
        const args: SortableDragEventArgs<T> = { item, fromIndex, toIndex, from: this, to: this, cancel: false, source: this, event };
        this.dragStarting.fire(args);
        if (args.cancel) return false;
        this.dragEnding.fire(args);
        if (args.cancel) return false;
        this.place(row, toIndex);
        this.reordered.fire({ item, fromIndex, toIndex, from: this, to: this, source: this, event });
        this.announce(toIndex);
        this.drawStops();
        return true;
    }

    // The JSX children are in the page once the sortable is built: they get their class and their stops then.
    override onBuilt(): void {
        this.drawItems();
    }

    /** Re-reads the items after they have been changed in place. */
    refresh(): void {
        this.renderItems();
    }

    /** The components of the items, in order: the rows of `items`, or the children. */
    itemParts(): ComponentBase[] {
        return itemsIn(this, [this.line, this.live], []);
    }

    // The item a row stands for: the given item, or the component when the children are the items.
    itemOf(row: ComponentBase): T {
        for (const [item, r] of this.rows) if (r === row) return item as T;
        return row as unknown as T;
    }

    renderItems(): void {
        this.stopItems?.();
        this.stopItems = null;
        const given = this.peekProperty<readonly T[] | undefined>('items');
        if (given === undefined) {
            this.drawItems();
            return;
        }
        // The list is read once per refresh; its items' own functions are tracked.
        const items = givenList(given);
        this.stopItems = follow(this, 'items', () => items.slice(), list => this.drawRows(list));
    }

    // Rows keyed by item: a new item gets a row, one gone loses it, the rest keep theirs and take their place.
    drawRows(items: T[]): void {
        const template = this.peekProperty<((item: T, index: number) => ComponentBase) | undefined>('itemTemplate');
        const seen = new Set<unknown>();
        const order: ComponentBase[] = [this.line, this.live];
        items.forEach((item, index) => {
            let row = this.rows.get(item);
            if (!row) {
                row = template ? template(item, index) : this.plainRow(item);
                this.rows.set(item, row);
            }
            seen.add(item);
            order.push(row);
        });
        // In order after the line and the live text: a row already in place is left alone (it keeps focus).
        orderControls(this, order);
        for (const [item, row] of this.rows) {
            if (!seen.has(item)) {
                this.rows.delete(item);
                if (row.parent) row.parent.controls.remove(row);
                else void row.dispose();
            }
        }
        this.drawItems();
    }

    plainRow(item: T): ComponentBase {
        const row = new Component<HTMLDivElement>('div');
        text(row, String(item ?? ''));
        return row;
    }

    // Every item carries the class, the handle takes the keys, the Tab stop is one.
    drawItems(): void {
        const allow = this.peekProperty<boolean | undefined>('allowReordering') !== false;
        mark(this, 'data-sortable', allow);
        for (const row of this.itemParts()) {
            row.class.add('mx-sortable__item');
            const focusable = this.focusableOf(row);
            if (focusable && focusable !== row && !focusable.attr.has('role')) put(focusable, 'role', 'button');
        }
        this.drawStops();
    }

    // What takes focus and the keys for an item: its handle, else the item itself.
    focusableOf(row: ComponentBase): ComponentBase | null {
        const handle = this.peekProperty<string | null | undefined>('handle');
        if (!handle) return row;
        return row.$(handle).fromComponent().find(c => c !== row) ?? null;
    }

    drawStops(): void {
        const allow = this.peekProperty<boolean | undefined>('allowReordering') !== false;
        const items = this.itemParts();
        const stop = this.focusedAt >= 0 && this.focusedAt < items.length ? this.focusedAt : 0;
        items.forEach((row, index) => {
            const focusable = this.focusableOf(row);
            if (!focusable) return;
            if (!allow) {
                if (STOPS.has(focusable)) {
                    STOPS.delete(focusable);
                    put(focusable, 'tabindex', null);
                }
                return;
            }
            // Focusable content of its own keeps its tab order; the item takes a stop only when it has none.
            if (focusable === row && fieldsOf(row).includes(row)) return;
            STOPS.add(focusable);
            put(focusable, 'tabindex', index === stop ? '0' : '-1');
        });
    }

    place(row: ComponentBase, toIndex: number): void {
        // Its own children move; the rows of a JSX list are placed by that list.
        if (row.parent !== this) return;
        const before = this.itemParts().filter(item => item !== row)[toIndex];
        // Past the last item it goes at the end: the line and the live text are the first controls.
        this.controls.move(row, before?.parent === this ? before : null);
    }

    announce(toIndex: number): void {
        text(this.live, uiLocale.text('sortableMoved', { index: toIndex + 1, count: this.itemParts().length }));
    }

    keyDown(e: KeyboardEvent): void {
        if (!e.ctrlKey || e.altKey || e.metaKey || this.peekProperty<boolean | undefined>('allowReordering') === false) {
            return;
        }
        const items = this.itemParts();
        const from = items.findIndex(item => item.motif.isEventFrom(e));
        if (from < 0) return;
        const vertical = (this.peekProperty<SortableOrientation>('orientation') ?? 'vertical') === 'vertical';
        const rtl = !vertical && isRtl(this);
        const back = vertical ? 'ArrowUp' : rtl ? 'ArrowRight' : 'ArrowLeft';
        const forward = vertical ? 'ArrowDown' : rtl ? 'ArrowLeft' : 'ArrowRight';
        let to = -1;
        if (e.key === back) to = from - 1;
        else if (e.key === forward) to = from + 1;
        else if (e.key === 'Home') to = 0;
        else if (e.key === 'End') to = items.length - 1;
        else return;
        e.preventDefault();
        if (to < 0 || to >= items.length) return;
        // Moving the item takes focus off it: focus goes back where it was.
        const focus = rememberFocus(e);
        if (this.move(from, to, e)) focus?.restore({ preventScroll: true });
    }

    // A click on an item (its handle when there is one): a drag may follow.
    pointerDown(e: PointerEvent): void {
        if (e.button !== 0 || this.session || !this.isEnabled || this.peekProperty<boolean | undefined>('allowReordering') === false) {
            return;
        }
        const items = this.itemParts();
        const row = items.find(item => item.motif.isEventFrom(e));
        if (!row) return;
        const handle = this.peekProperty<string | null | undefined>('handle');
        // With a handle the press must be on it; without one, a press on a button, a link or a field inside is theirs.
        const fields = handle ? [] : fieldsOf(row);
        if (handle && !row.$(handle).fromComponent().some(c => c.motif.isEventFrom(e))) return;
        if (fields.some(c => c !== row && c.motif.isEventFrom(e))) return;
        const touch = e.pointerType === 'touch';
        const session: Session = {
            pointerId: e.pointerId,
            touch,
            startX: e.clientX,
            startY: e.clientY,
            x: e.clientX,
            y: e.clientY,
            item: this.itemOf(row),
            row,
            fromIndex: items.indexOf(row),
            started: false,
            to: null,
            toIndex: -1,
            refused: false,
            timer: null,
            boxes: null,
            event: null,
            waiting: null,
            stopEdge: null
        };
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
        // The drag goes on past the list: its window is listened to while it runs.
        this.stops.push(onWindow(this, 'pointermove', move), onWindow(this, 'pointerup', up), onWindow(this, 'pointercancel', up), onWindow(this, 'keydown', key, true));
        if (touch) {
            // A finger that moves before the long press is over scrolls; one that stays lifts the item.
            session.timer = setTimeout(() => {
                session.timer = null;
                if (this.session === session) this.start(e);
            }, LONG_PRESS);
        } else if (handle || !fields.includes(row)) {
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
        s.event = e;
        s.waiting = measure(this, this.readAim, this.track);
        // Near the edges of what scrolls the list under the pointer, it scrolls; the place is read again after each step.
        s.stopEdge ??= autoScroll(this, () => scrollerFor(s.to ?? this), () => (this.session === s ? { x: s.x, y: s.y } : null), () => {
            s.boxes?.moved();
            s.waiting = measure(this, this.readAim, this.track);
        }, { axis: 'y' });
    }

    pointerUp(e: PointerEvent): void {
        const s = this.session;
        if (!s || e.pointerId !== s.pointerId) return;
        if (!s.started) {
            this.end(null, false);
            return;
        }
        // The last move still waiting for its frame lands first.
        if (s.waiting) {
            s.waiting();
            this.track(this.readAim());
        }
        // The click that follows the drop is not a click on the item.
        const swallow = (ev: MouseEvent) => {
            ev.stopPropagation();
            ev.preventDefault();
        };
        setTimeout(onWindow(this, 'click', swallow, true), 0);
        this.end(e, e.type === 'pointerup');
    }

    args(s: Session, event?: Event): SortableDragEventArgs<T> {
        return { item: s.item as T, fromIndex: s.fromIndex, toIndex: s.toIndex, from: this, to: s.to as Sortable<T> | null, cancel: false, source: this, event };
    }

    start(e: PointerEvent): boolean {
        const s = this.session!;
        s.to = this as Sortable<unknown>;
        s.toIndex = s.fromIndex;
        const args = this.args(s, e);
        this.dragStarting.fire(args);
        if (args.cancel) {
            this.end(null, false);
            return false;
        }
        s.started = true;
        // Inner sortables first: the nearest one around the pointer takes the drop, as long as it takes this one's items.
        s.boxes = new DragBoxes(this, () => [...ALL].sort((a, b) => compareTreeOrder(b, a)), stackCover);
        s.row.attr.add({ setPointerCapture: e.pointerId });
        mark(s.row, 'data-dragging', true);
        this.ghost.show(s.row, s.x, s.y, 'move');
        return true;
    }

    // The sortable under the pointer, the place among its items and where its line goes, from the kept boxes.
    readonly readAim = (): { to: Sortable<unknown> | null; toIndex: number; line: number } => {
        const s = this.session;
        const under = s?.started ? (s.boxes?.at({ x: s.x, y: s.y }, this) ?? null) : null;
        const to = under instanceof Sortable && under.takes(this as Sortable<unknown>) ? (under as Sortable<unknown>) : null;
        if (!s || !to) return { to: null, toIndex: -1, line: 0 };
        const toIndex = to.indexAt(s.x, s.y, s.row);
        return { to, toIndex, line: to.lineAt(toIndex, s.row) };
    };

    // The pointer moved: the place is told when it changes and the line shows it.
    readonly track = (aim: { to: Sortable<unknown> | null; toIndex: number; line: number }): void => {
        const s = this.session;
        if (!s?.started) return;
        s.waiting = null;
        const { to, toIndex } = aim;
        const changed = to !== s.to || toIndex !== s.toIndex;
        s.to = to;
        s.toIndex = toIndex;
        if (changed) {
            s.refused = false;
            const args = this.args(s, s.event ?? undefined);
            this.dragChanging.fire(args);
            if (args.cancel) s.refused = true;
        }
        for (const candidate of ALL) candidate.showLine(candidate === to && !s.refused ? aim.line : null);
        this.ghost.move(s.x, s.y, to && !s.refused ? 'move' : 'none');
    };

    // Whether this sortable takes items of `from`: itself, or one of its group.
    takes(from: Sortable<unknown>): boolean {
        if (from === (this as Sortable<unknown>)) return true;
        const group = this.peekProperty<string | null | undefined>('group');
        return !!group && group === from.peekProperty<string | null | undefined>('group');
    }

    // The index a drop at the point would take, among the items (`dragged` counted out). In a read.
    indexAt(x: number, y: number, dragged: ComponentBase): number {
        const vertical = (this.peekProperty<SortableOrientation>('orientation') ?? 'vertical') === 'vertical';
        const rtl = !vertical && isRtl(this);
        const items = this.itemParts().filter(item => item !== dragged);
        for (let i = 0; i < items.length; i++) {
            const box = rectOf(items[i]);
            const middle = vertical ? box.top + box.height / 2 : box.left + box.width / 2;
            if (vertical ? y < middle : rtl ? x > middle : x < middle) return i;
        }
        return items.length;
    }

    // Where the drop line before the item at `index` goes (after the last one at the end), in the sortable's scrolled content. In a read.
    lineAt(index: number, dragged: ComponentBase): number {
        const vertical = (this.peekProperty<SortableOrientation>('orientation') ?? 'vertical') === 'vertical';
        const items = this.itemParts().filter(item => item !== dragged);
        const host = boxOf(this);
        const target = items[index] ?? null;
        const last = items[items.length - 1] ?? null;
        let at = 0;
        if (target) {
            const box = rectOf(target);
            at = vertical ? box.top - host.top : box.left - host.left;
        } else if (last) {
            const box = rectOf(last);
            at = vertical ? box.bottom - host.top : box.right - host.left;
        }
        return at + (vertical ? host.scrollTop : host.rtl ? -host.scrollStart : host.scrollStart);
    }

    // The drop line at `at` (from `lineAt`), or none.
    showLine(at: number | null): void {
        const line = this.line;
        mark(this, 'data-drop-target', at !== null);
        if (at === null) {
            shown(line, false);
            return;
        }
        const vertical = (this.peekProperty<SortableOrientation>('orientation') ?? 'vertical') === 'vertical';
        css(line, vertical ? 'top' : 'left', `${at}px`);
        css(line, vertical ? 'left' : 'top', '');
        shown(line, true);
    }

    // The drag ends: a drop moves the item, within this sortable or into another of the group.
    end(e: Event | null, drop: boolean): void {
        const s = this.session;
        for (const stop of this.stops.splice(0)) stop();
        if (!s) return;
        this.session = null;
        if (s.timer) clearTimeout(s.timer);
        s.waiting?.();
        s.stopEdge?.();
        s.boxes?.stop();
        if (!s.started) return;
        this.ghost.hide();
        if (!s.row.isDisposed) {
            mark(s.row, 'data-dragging', false);
            s.row.attr.add({ releasePointerCapture: s.pointerId });
        }
        for (const candidate of ALL) candidate.showLine(null);
        const to = s.to && !s.refused ? s.to : null;
        if (drop && to && s.toIndex >= 0) {
            const args = this.args(s, e ?? undefined);
            this.dragEnding.fire(args);
            if (!args.cancel) this.drop(s, to, e ?? undefined);
        }
    }

    drop(s: Session, to: Sortable<unknown>, event?: Event): void {
        const item = s.item as T;
        if (to === (this as Sortable<unknown>)) {
            const now = this.itemParts().filter(row => row !== s.row);
            const landing = Math.min(s.toIndex, now.length);
            if (landing === s.fromIndex) return;
            this.place(s.row, landing);
            this.reordered.fire({ item, fromIndex: s.fromIndex, toIndex: landing, from: this, to: this, source: this, event });
            return;
        }
        // Across sortables: the component goes over as a child of the other one; the data is told on both sides.
        if (s.row.parent === this) {
            to.controls.add(s.row);
            to.place(s.row, s.toIndex);
        }
        for (const [key, row] of this.rows) {
            if (row === s.row) {
                this.rows.delete(key);
                to.rows.set(key, row);
            }
        }
        const args: SortableDropEventArgs<T> = { item, fromIndex: s.fromIndex, toIndex: s.toIndex, from: this, to: to as Sortable<T>, source: this, event };
        this.removed.fire(args);
        (to as Sortable<T>).added.fire({ ...args, source: to as Sortable<T> });
        this.drawItems();
        to.drawItems();
    }
}
