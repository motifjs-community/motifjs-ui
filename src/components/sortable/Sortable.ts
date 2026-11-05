import { Component, Emitter, type Bind, type ComponentBase, type Event as MotifEvent, type IBaseProp } from "@motifx/core";
import { Control } from "../../core/control";
import { css, mark, part, put, shown, text } from "../../core/draw-parts";
import { follow } from "../../core/follow";
import { givenList } from "../../core/given-field";
import { onLanguage } from "../../core/on-language";
import { uiLocale } from "../../core/ui-locale";
import { DragGhost } from "../../parts/drag/DragGhost";
import { scrollStep } from "../../parts/drag/scroll-step";
import type { SortableDragEventArgs } from "./sortable-drag-event-args";
import type { SortableDropEventArgs } from "./sortable-drop-event-args";
import type { SortableOrientation } from "./sortable-orientation";
import type { SortableProps } from "./sortable-props";

const OWN = ['items', 'handle', 'group', 'allowReordering', 'orientation', 'label'] as const;

// Every sortable on the page, so a drag finds the ones of its group under the pointer.
const ALL = new Set<Sortable<unknown>>();

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
    element: HTMLElement;
    fromIndex: number;
    started: boolean;
    // Where it would land: the sortable and the index among its items (the source counted out).
    to: Sortable<unknown> | null;
    toIndex: number;
    refused: boolean;
    timer: ReturnType<typeof setTimeout> | null;
    frame: number;
}

/** The nearest ancestor that scrolls along `axis`. */
function scrollerOf(el: HTMLElement, axis: 'x' | 'y'): HTMLElement | null {
    for (let node = el.parentElement; node; node = node.parentElement) {
        const style = getComputedStyle(node);
        const overflow = axis === 'y' ? style.overflowY : style.overflowX;
        const room = axis === 'y' ? node.scrollHeight > node.clientHeight : node.scrollWidth > node.clientWidth;
        if (/auto|scroll/.test(overflow) && room) return node;
    }
    return null;
}

/**
 * Items the user puts in order by dragging them, with the pointer or a finger (a long press), or with the keys
 * (Ctrl + an arrow moves the focused item a place); sortables of one `group` take each other's items. The items
 * are the JSX children, or `items` drawn with `itemTemplate`. A drop moves the item's element and tells
 * `onReorder` (`onRemove` and `onAdd` across sortables) with the indexes: your data is yours to reorder.
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
        const el = this.element;
        el.classList.add('mx-sortable');
        el.setAttribute('role', 'group');
        this.line = part<HTMLSpanElement>(this, 'span', 'mx-sortable__line');
        this.line.element.setAttribute('aria-hidden', 'true');
        shown(this.line.element, false);
        this.live = part<HTMLSpanElement>(this, 'span', 'mx-sr-only');
        this.live.element.setAttribute('aria-live', 'polite');
        this.ghost = new DragGhost(() => el.ownerDocument.body, () => true, 'mx-sortable__ghost');
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
        this.observeProperty<SortableOrientation>('orientation', o => put(el, 'data-orientation', o ?? 'vertical'));
        this.observeProperty<string>('label', label => put(el, 'aria-label', label || null));
        onLanguage(this, () => this.drawItems());
        el.addEventListener('pointerdown', e => this.pointerDown(e));
        el.addEventListener('keydown', e => this.keyDown(e));
        el.addEventListener('focusin', e => {
            const at = this.itemElements().findIndex(item => item.contains(e.target as Node));
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

    /** The items' elements, in order. */
    get elements(): readonly HTMLElement[] {
        return this.itemElements();
    }

    /** Whether an item is being dragged. */
    get isDragging(): boolean {
        return !!this.session?.started;
    }

    /** Moves the item at `fromIndex` to `toIndex` as a drop would, and tells `onReorder`; `false` when nothing moved. */
    move(fromIndex: number, toIndex: number, event?: Event): boolean {
        const elements = this.itemElements();
        const el = elements[fromIndex];
        if (!el || toIndex < 0 || toIndex >= elements.length || toIndex === fromIndex) {
            return false;
        }
        const item = this.itemOf(el);
        const args: SortableDragEventArgs<T> = { item, fromIndex, toIndex, from: this, to: this, cancel: false, source: this, event };
        this.dragStarting.fire(args);
        if (args.cancel) return false;
        this.dragEnding.fire(args);
        if (args.cancel) return false;
        this.place(el, toIndex);
        this.reordered.fire({ item, fromIndex, toIndex, from: this, to: this, source: this, event });
        this.announce(toIndex);
        this.drawStops();
        return true;
    }

    // The JSX children are in the page once the sortable is built: they get their class and their stops then.
    override onBuilt(): void {
        this.drawItems();
    }

    /** Reads the items again after they were changed in place. */
    refresh(): void {
        this.renderItems();
    }

    itemElements(): HTMLElement[] {
        return Array.from(this.element.children).filter(el => el !== this.line.element && el !== this.live.element) as HTMLElement[];
    }

    // The item an element stands for: the given item, or the component when the children are the items.
    itemOf(el: HTMLElement): T {
        for (const [item, row] of this.rows) if (row.element === el) return item as T;
        for (const child of this.controls.items) if (child.element === el) return child as unknown as T;
        return el as unknown as T;
    }

    renderItems(): void {
        this.stopItems?.();
        this.stopItems = null;
        const given = this.peekProperty<readonly T[] | undefined>('items');
        if (given === undefined) {
            this.drawItems();
            return;
        }
        // The list is read once per refresh; its items' own functions are followed.
        const items = givenList(given);
        this.stopItems = follow(this, 'items', () => items.slice(), list => this.drawRows(list));
    }

    // Rows keyed by item: a new item gets a row, one gone loses it, the rest keep theirs and take their place.
    drawRows(items: T[]): void {
        const template = this.peekProperty<((item: T, index: number) => ComponentBase) | undefined>('itemTemplate');
        const seen = new Set<unknown>();
        let before: HTMLElement = this.live.element;
        items.forEach((item, index) => {
            let row = this.rows.get(item);
            if (!row) {
                row = template ? template(item, index) : this.plainRow(item);
                this.rows.set(item, row);
                this.controls.add(row);
            }
            seen.add(item);
            // In order, from the top: a row already in place is left alone (it keeps focus).
            const el = row.element as HTMLElement;
            if (before.nextSibling !== el) this.element.insertBefore(el, before.nextSibling);
            before = el;
        });
        for (const [item, row] of this.rows) {
            if (!seen.has(item)) {
                this.rows.delete(item);
                void row.dispose();
            }
        }
        this.drawItems();
    }

    plainRow(item: T): ComponentBase {
        const row = new Component<HTMLDivElement>('div');
        text(row.element, String(item ?? ''));
        return row;
    }

    // Every item carries the class, the handle takes the keys, the Tab stop is one.
    drawItems(): void {
        const allow = this.peekProperty<boolean | undefined>('allowReordering') !== false;
        mark(this.element, 'data-sortable', allow);
        for (const el of this.itemElements()) {
            el.classList.add('mx-sortable__item');
            const focusable = this.focusableOf(el);
            if (focusable && focusable !== el && !focusable.hasAttribute('role')) {
                focusable.setAttribute('role', 'button');
            }
        }
        this.drawStops();
    }

    // What takes focus and the keys for an item: its handle, else the item itself.
    focusableOf(el: HTMLElement): HTMLElement | null {
        const handle = this.peekProperty<string | null | undefined>('handle');
        if (!handle) return el;
        try {
            return el.querySelector<HTMLElement>(handle);
        } catch {
            return null;
        }
    }

    drawStops(): void {
        const allow = this.peekProperty<boolean | undefined>('allowReordering') !== false;
        const elements = this.itemElements();
        const stop = this.focusedAt >= 0 && this.focusedAt < elements.length ? this.focusedAt : 0;
        elements.forEach((el, index) => {
            const focusable = this.focusableOf(el);
            if (!focusable) return;
            if (!allow) {
                if (focusable.getAttribute('data-sortable-stop') === 'true') {
                    focusable.removeAttribute('tabindex');
                    focusable.removeAttribute('data-sortable-stop');
                }
                return;
            }
            // Focusable content of its own keeps its tab order; the item takes a stop only when it has none.
            if (focusable === el && el.matches(INTERACTIVE)) return;
            focusable.setAttribute('data-sortable-stop', 'true');
            focusable.tabIndex = index === stop ? 0 : -1;
        });
    }

    place(el: HTMLElement, toIndex: number): void {
        const others = this.itemElements().filter(item => item !== el);
        // Past the last item it goes at the end: the line and the live text sit before the items.
        this.element.insertBefore(el, others[toIndex] ?? null);
    }

    announce(toIndex: number): void {
        text(this.live.element, uiLocale.text('sortableMoved', { index: toIndex + 1, count: this.itemElements().length }));
    }

    keyDown(e: KeyboardEvent): void {
        if (!e.ctrlKey || e.altKey || e.metaKey || this.peekProperty<boolean | undefined>('allowReordering') === false) {
            return;
        }
        const elements = this.itemElements();
        const from = elements.findIndex(el => el.contains(e.target as Node));
        if (from < 0) return;
        const vertical = (this.peekProperty<SortableOrientation>('orientation') ?? 'vertical') === 'vertical';
        const rtl = getComputedStyle(this.element).direction === 'rtl';
        const back = vertical ? 'ArrowUp' : rtl ? 'ArrowRight' : 'ArrowLeft';
        const forward = vertical ? 'ArrowDown' : rtl ? 'ArrowLeft' : 'ArrowRight';
        let to = -1;
        if (e.key === back) to = from - 1;
        else if (e.key === forward) to = from + 1;
        else if (e.key === 'Home') to = 0;
        else if (e.key === 'End') to = elements.length - 1;
        else return;
        e.preventDefault();
        if (to < 0 || to >= elements.length) return;
        const focused = e.target as HTMLElement;
        if (this.move(from, to, e)) focused.focus({ preventScroll: true });
    }

    // A press on an item (its handle when there is one): a drag may follow.
    pointerDown(e: PointerEvent): void {
        if (e.button !== 0 || this.session || !this.isEnabled || this.peekProperty<boolean | undefined>('allowReordering') === false) {
            return;
        }
        const target = e.target as HTMLElement;
        const element = this.itemElements().find(el => el.contains(target));
        if (!element) return;
        const handle = this.peekProperty<string | null | undefined>('handle');
        if (handle) {
            const by = target.closest(handle);
            if (!by || !element.contains(by)) return;
        } else if (target.closest(INTERACTIVE) && target.closest(INTERACTIVE) !== element) {
            return;
        }
        const touch = e.pointerType === 'touch';
        const session: Session = {
            pointerId: e.pointerId,
            touch,
            startX: e.clientX,
            startY: e.clientY,
            x: e.clientX,
            y: e.clientY,
            item: this.itemOf(element),
            element,
            fromIndex: this.itemElements().indexOf(element),
            started: false,
            to: null,
            toIndex: -1,
            refused: false,
            timer: null,
            frame: 0
        };
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
            // A finger that moves before the long press is over scrolls; one that stays lifts the item.
            session.timer = setTimeout(() => {
                session.timer = null;
                if (this.session === session) this.start(e);
            }, LONG_PRESS);
        } else if (handle || !target.closest(INTERACTIVE)) {
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
        this.track(e);
        this.autoScroll();
    }

    pointerUp(e: PointerEvent): void {
        const s = this.session;
        if (!s || e.pointerId !== s.pointerId) return;
        if (!s.started) {
            this.end(null, false);
            return;
        }
        // The click that follows the drop is not a press on the item.
        const win = s.element.ownerDocument.defaultView ?? window;
        const swallow = (ev: MouseEvent) => {
            ev.stopPropagation();
            ev.preventDefault();
        };
        win.addEventListener('click', swallow, true);
        setTimeout(() => win.removeEventListener('click', swallow, true), 0);
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
        s.element.setPointerCapture?.(e.pointerId);
        mark(s.element, 'data-dragging', true);
        this.ghost.show(s.element, s.x, s.y, 'move');
        return true;
    }

    // The pointer moved: the sortable under it and the place among its items; the line shows it.
    track(e: PointerEvent): void {
        const s = this.session;
        if (!s?.started) return;
        const doc = s.element.ownerDocument;
        const under = doc.elementFromPoint(s.x, s.y);
        const container = under?.closest<HTMLElement>('.mx-sortable') ?? null;
        let to: Sortable<unknown> | null = null;
        for (const candidate of ALL) {
            if (candidate.element === container && candidate.takes(this as Sortable<unknown>)) to = candidate;
        }
        const toIndex = to ? to.indexAt(s.x, s.y, s.element) : -1;
        const changed = to !== s.to || toIndex !== s.toIndex;
        s.to = to;
        s.toIndex = toIndex;
        if (changed) {
            s.refused = false;
            const args = this.args(s, e);
            this.dragChanging.fire(args);
            if (args.cancel) s.refused = true;
        }
        for (const candidate of ALL) candidate.showLine(candidate === to && !s.refused ? toIndex : -1, s.element);
        this.ghost.move(s.x, s.y, to && !s.refused ? 'move' : 'none');
    }

    // Whether this sortable takes items of `from`: itself, or one of its group.
    takes(from: Sortable<unknown>): boolean {
        if (from === (this as Sortable<unknown>)) return true;
        const group = this.peekProperty<string | null | undefined>('group');
        return !!group && group === from.peekProperty<string | null | undefined>('group');
    }

    // The index a drop at the point would take, among the items (`dragged` counted out).
    indexAt(x: number, y: number, dragged: HTMLElement): number {
        const vertical = (this.peekProperty<SortableOrientation>('orientation') ?? 'vertical') === 'vertical';
        const rtl = !vertical && getComputedStyle(this.element).direction === 'rtl';
        const items = this.itemElements().filter(el => el !== dragged);
        for (let i = 0; i < items.length; i++) {
            const box = items[i].getBoundingClientRect();
            const middle = vertical ? box.top + box.height / 2 : box.left + box.width / 2;
            if (vertical ? y < middle : rtl ? x > middle : x < middle) return i;
        }
        return items.length;
    }

    // The drop line before the item at `index` (after the last one at the end), or none.
    showLine(index: number, dragged: HTMLElement): void {
        const line = this.line.element;
        if (index < 0) {
            shown(line, false);
            mark(this.element, 'data-drop-target', false);
            return;
        }
        mark(this.element, 'data-drop-target', true);
        const vertical = (this.peekProperty<SortableOrientation>('orientation') ?? 'vertical') === 'vertical';
        const items = this.itemElements().filter(el => el !== dragged);
        const host = this.element.getBoundingClientRect();
        const target = items[index] ?? null;
        const last = items[items.length - 1] ?? null;
        let at: number;
        if (target) {
            const box = target.getBoundingClientRect();
            at = vertical ? box.top - host.top : box.left - host.left;
        } else if (last) {
            const box = last.getBoundingClientRect();
            at = vertical ? box.bottom - host.top : box.right - host.left;
        } else {
            at = 0;
        }
        css(line, vertical ? 'top' : 'left', `${at + (vertical ? this.element.scrollTop : this.element.scrollLeft)}px`);
        css(line, vertical ? 'left' : 'top', '');
        shown(line, true);
    }

    autoScroll(): void {
        const s = this.session;
        if (!s?.started) return;
        const win = s.element.ownerDocument.defaultView ?? window;
        win.cancelAnimationFrame?.(s.frame);
        const step = () => {
            if (this.session !== s || !s.started) return;
            const target = (s.to ?? this).element;
            const scroller = scrollerOf(target, 'y') ?? (target.scrollHeight > target.clientHeight ? target : null);
            if (scroller) {
                const box = scroller.getBoundingClientRect();
                const by = scrollStep(s.y, box.top, box.bottom, 40, 12);
                if (by) {
                    scroller.scrollTop += by;
                    this.track(new PointerEvent('pointermove', { clientX: s.x, clientY: s.y }));
                    s.frame = win.requestAnimationFrame(step);
                }
            }
        };
        s.frame = win.requestAnimationFrame(step);
    }

    // The drag ends: a drop moves the item, within this sortable or into another of the group.
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
        if (s.element.hasPointerCapture?.(s.pointerId)) s.element.releasePointerCapture(s.pointerId);
        for (const candidate of ALL) candidate.showLine(-1, s.element);
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
            const now = this.itemElements().filter(el => el !== s.element);
            const landing = Math.min(s.toIndex, now.length);
            if (landing === s.fromIndex) return;
            this.place(s.element, landing);
            this.reordered.fire({ item, fromIndex: s.fromIndex, toIndex: landing, from: this, to: this, source: this, event });
            return;
        }
        // Across sortables: the element goes over; the data is told on both sides.
        const others = to.itemElements();
        to.element.insertBefore(s.element, others[s.toIndex] ?? null);
        for (const [key, row] of this.rows) {
            if (row.element === s.element) {
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
