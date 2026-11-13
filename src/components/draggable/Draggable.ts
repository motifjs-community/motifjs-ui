import { Component, Emitter, type Bind, type ComponentBase, type Event as MotifEvent, type IBaseProp } from "@motifx/core";
import { Control } from "../../core/control";
import { compareTreeOrder } from "../../core/component-tree";
import { part } from "../../core/draw-parts";
import { holderOf, measure, rectOf, type Rect } from "../../core/measure";
import { onLanguage } from "../../core/on-language";
import { windowOf } from "../../core/page-documents";
import { css, mark, put, text, toggleClass } from "../../core/part-writes";
import { onWindow } from "../../core/window-events";
import { uiLocale } from "../../core/ui-locale";
import { DragBoxes } from "../../parts/drag/drag-boxes";
import { DragGhost } from "../../parts/drag/DragGhost";
import { stackCover } from "../../parts/drag/stack-cover";
import type { DraggableEventArgs } from "./draggable-event-args";
import type { DragAxis, DraggableProps, DragPosition } from "./draggable-props";
import { DropTarget, TARGETS } from "./DropTarget";

const OWN = ['axis', 'boundary', 'handle', 'clone', 'group', 'data', 'step', 'position'] as const;
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
    from: DragPosition;
    started: boolean;
    target: DropTarget | null;
    refused: boolean;
    timer: ReturnType<typeof setTimeout> | null;
    // Where the draggable lay at the start, and the box it must stay in.
    rect: Rect | null;
    bound: Rect | null;
    /** The drop targets of its group on the screen, kept while it is dragged. */
    boxes: DragBoxes | null;
    /** The last pointer move, followed at the next frame. */
    event: PointerEvent | null;
    /** Takes back the pointer move waiting for the next frame. */
    waiting: (() => void) | null;
}

/**
 * Content the user moves with the pointer, a finger (a long press) or the arrow keys. The JSX children sit in a
 * box that follows the drag. It moves along `axis`, stays inside `boundary`, can be dragged by a `handle` only, or
 * can send a `clone` after the pointer and stay in place. A `DropTarget` in the same `group` under the pointer is
 * notified when it enters, leaves and drops, and receives its `data`. Your code decides what a drop does to the data.
 *
 * @example
 * <Draggable boundary="parent" x-model={() => this.note.at}><Card>…</Card></Draggable>
 * <Draggable clone group="cards" data={card} handle=".grip">…</Draggable>
 */
export class Draggable extends Control<HTMLDivElement, DraggableProps> {
    starting = new Emitter<DraggableEventArgs>();
    dragging = new Emitter<DraggableEventArgs>();
    ending = new Emitter<DraggableEventArgs>();
    ended = new Emitter<DraggableEventArgs>();
    live: Component<HTMLSpanElement>;
    ghost: DragGhost;
    session: Session | null = null;
    stops: (() => void)[] = [];
    pos: DragPosition = { x: 0, y: 0 };
    /** The child `handle` names, while there is one; without it the draggable itself takes the pointer and the keys. */
    handlePart: ComponentBase | null = null;
    /** The handle had no role of its own: the draggable gave it one. */
    gaveRole = false;

    constructor(props?: IBaseProp<DraggableProps>) {
        super('div', props);
        const own = (this.props ?? {}) as DraggableProps;
        this.class.add('mx-draggable');
        this.attr.add({ role: 'group', 'aria-roledescription': 'draggable' });
        if (this.childs?.length) this.controls.add(...this.childs);
        this.live = part<HTMLSpanElement>(this, 'span', 'mx-sr-only');
        this.live.attr.add({ 'aria-live': 'polite' });
        this.ghost = new DragGhost(() => windowOf(this)?.document ?? document, () => true, 'mx-draggable__ghost');
        for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
        if (own.onDragStarting) this.onDragStarting(own.onDragStarting);
        if (own.onDragging) this.onDragging(own.onDragging);
        if (own.onDragEnding) this.onDragEnding(own.onDragEnding);
        if (own.onDragEnded) this.onDragEnded(own.onDragEnded);

        this.observeProperty<DragPosition | null>('position', position => {
            this.pos = position ? { x: position.x, y: position.y } : { x: 0, y: 0 };
            this.applyPosition();
        });
        this.observeProperty<DragAxis>('axis', axis => put(this, 'data-axis', axis ?? 'both'));
        this.observeProperty<boolean>('clone', on => mark(this, 'data-clone', on === true));
        this.observeProperty('handle', () => this.drawHandle());
        onLanguage(this, () => this.drawHandle());
        this.motif.on('pointerdown', (_, e) => this.pointerDown(e));
        this.motif.on('keydown', (_, e) => this.keyDown(e));
        this.motif.setDisposable(() => {
            this.end(null, false);
            for (const emitter of [this.starting, this.dragging, this.ending, this.ended]) emitter.dispose();
        });
    }

    // Properties (see DraggableProps).

    get axis(): DragAxis {
        return this.getProperty<DragAxis | undefined>('axis') ?? 'both';
    }
    set axis(value: Bind<DragAxis>) {
        this.assignProperty('axis', value);
    }
    get boundary(): 'parent' | ComponentBase | null {
        return this.getProperty<'parent' | ComponentBase | null | undefined>('boundary') ?? null;
    }
    set boundary(value: Bind<'parent' | ComponentBase | null>) {
        this.assignProperty('boundary', value);
    }
    get handle(): string | null {
        return this.getProperty<string | null | undefined>('handle') ?? null;
    }
    set handle(value: Bind<string | null>) {
        this.assignProperty('handle', value);
    }
    get clone(): boolean {
        return this.getProperty<boolean | undefined>('clone') === true;
    }
    set clone(value: Bind<boolean>) {
        this.assignProperty('clone', value);
    }
    get group(): string | null {
        return this.getProperty<string | null | undefined>('group') ?? null;
    }
    set group(value: Bind<string | null>) {
        this.assignProperty('group', value);
    }
    get data(): unknown {
        return this.getProperty<unknown>('data');
    }
    set data(value: unknown) {
        this.setProperty('data', value);
    }
    get step(): number {
        return Math.max(1, this.getProperty<number | undefined>('step') ?? 10);
    }
    set step(value: Bind<number>) {
        this.assignProperty('step', value);
    }
    get position(): DragPosition | null {
        return this.getProperty<DragPosition | null | undefined>('position') ?? null;
    }
    set position(value: Bind<DragPosition | null>) {
        this.assignProperty('position', value);
    }
    /** Maps to `position` for `x-model`. */
    get value(): DragPosition | null {
        return this.position;
    }
    set value(value: DragPosition | null) {
        this.position = value;
    }

    /** Occurs before a drag starts. Set `cancel = true` to keep the draggable in place. */
    get onDragStarting(): MotifEvent<DraggableEventArgs> {
        return this.starting.event;
    }

    /** Occurs during a drag (`x`, `y`, `target`). */
    get onDragging(): MotifEvent<DraggableEventArgs> {
        return this.dragging.event;
    }

    /** Occurs when the pointer is released. Set `cancel = true` to return the draggable to where it started. */
    get onDragEnding(): MotifEvent<DraggableEventArgs> {
        return this.ending.event;
    }

    /** Occurs when the drag ends (`x`, `y`, `target`, `dropped`). */
    get onDragEnded(): MotifEvent<DraggableEventArgs> {
        return this.ended.event;
    }

    /** The current position, in pixels from its layout position. */
    get currentPosition(): DragPosition {
        return { ...this.pos };
    }

    /** Indicates whether it is being dragged. */
    get isDragging(): boolean {
        return !!this.session?.started;
    }

    // The children are in the page now: the handle named by the selector can be found.
    override onBuilt(): void {
        this.drawHandle();
    }

    applyPosition(): void {
        const { x, y } = this.pos;
        css(this, 'translate', x === 0 && y === 0 ? '' : `${x}px ${y}px`);
    }

    // The handle takes the press, the Tab stop and the keys; without one the whole draggable does.
    drawHandle(): void {
        const selector = this.handle;
        // One of its children, the first the selector names.
        const next = selector ? (this.$(selector).fromComponent().find(c => c !== this) ?? null) : null;
        const last = this.handlePart;
        if (last && last !== next && !last.isDisposed) {
            toggleClass(last, 'mx-draggable__handle', false);
            put(last, 'tabindex', null);
            if (this.gaveRole) put(last, 'role', null);
            put(last, 'aria-label', null);
        }
        if (last !== next) this.gaveRole = false;
        this.handlePart = next;
        mark(this, 'data-handle', !!next);
        if (next) {
            toggleClass(next, 'mx-draggable__handle', true);
            put(next, 'tabindex', '0');
            // A handle that is not a button or a field itself is a button to a reader.
            if (next !== last && !next.attr.has('role') && !this.fieldsInside().includes(next)) {
                put(next, 'role', 'button');
                this.gaveRole = true;
            }
            put(next, 'aria-label', uiLocale.strings.move);
            put(this, 'tabindex', null);
            put(this, 'aria-label', null);
        } else {
            put(this, 'tabindex', '0');
            put(this, 'aria-label', uiLocale.strings.move);
        }
    }

    args(target: DropTarget | null, event?: Event): DraggableEventArgs {
        return { x: this.pos.x, y: this.pos.y, target, byUser: true, cancel: false, source: this, event };
    }

    dropArgs(target: DropTarget, event?: Event): { draggable: Draggable; data: unknown; cancel: boolean; source: DropTarget; event?: Event } {
        return { draggable: this, data: this.data, cancel: false, source: target, event };
    }

    // The box the draggable must stay in, if any: the component given, or its parent's (a fragment has none: the one above).
    boundRect(): Rect | null {
        const boundary = this.boundary;
        if (boundary !== 'parent') return boundary ? rectOf(boundary) : null;
        const holder = this.parent ? holderOf(this.parent) : null;
        return holder ? rectOf(holder) : null;
    }

    // The drop targets it may aim at, inner ones first.
    aimable(): DropTarget[] {
        return [...TARGETS].filter(t => t.takes(this.group)).sort((a, b) => compareTreeOrder(b, a));
    }

    // Its own buttons, links and fields: a press or a key there is theirs, not a move.
    fieldsInside(): ComponentBase[] {
        return this.$(INTERACTIVE).fromComponent().filter(c => c !== this);
    }

    // Holds a move inside the boundary, from where the draggable lay when the drag began.
    within(dx: number, dy: number, rect: Rect | null, bound: Rect | null): DragPosition {
        if (rect && bound) {
            dx = Math.min(Math.max(dx, bound.left - rect.left), Math.max(bound.left - rect.left, bound.right - rect.right));
            dy = Math.min(Math.max(dy, bound.top - rect.top), Math.max(bound.top - rect.top, bound.bottom - rect.bottom));
        }
        const axis = this.axis;
        return { x: axis === 'y' ? 0 : Math.round(dx), y: axis === 'x' ? 0 : Math.round(dy) };
    }

    pointerDown(e: PointerEvent): void {
        if (e.button !== 0 || this.session || !this.isEnabled) return;
        const handle = this.handlePart;
        if (handle && !handle.motif.isEventFrom(e)) return;
        // Without a handle, a press on a button, a link or a field inside is theirs.
        const onField = this.fieldsInside().some(c => c.motif.isEventFrom(e));
        if (!handle && onField) return;
        const touch = e.pointerType === 'touch';
        const session: Session = { pointerId: e.pointerId, touch, startX: e.clientX, startY: e.clientY, x: e.clientX, y: e.clientY, from: { ...this.pos }, started: false, target: null, refused: false, timer: null, rect: null, bound: null, boxes: null, event: null, waiting: null };
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
        // The drag goes on past the element: its window is listened to while it runs.
        this.stops.push(onWindow(this, 'pointermove', move), onWindow(this, 'pointerup', up), onWindow(this, 'pointercancel', up), onWindow(this, 'keydown', key, true));
        if (touch) {
            // A finger that moves before the long press is over scrolls; one that stays lifts the draggable.
            session.timer = setTimeout(() => {
                session.timer = null;
                if (this.session === session) this.start(e);
            }, LONG_PRESS);
        } else if (!onField) {
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
        s.waiting = measure(this, this.readAim, this.follow);
    }

    // The drop target under the pointer, from the kept boxes.
    readonly readAim = (): DropTarget | null => {
        const s = this.session;
        const under = s?.boxes?.at({ x: s.x, y: s.y }, this) ?? null;
        return under instanceof DropTarget ? under : null;
    };

    // Moves the draggable, or its copy, to the pointer and tells the target under it.
    readonly follow = (under: DropTarget | null): void => {
        const s = this.session;
        if (!s?.started) return;
        s.waiting = null;
        const e = s.event ?? undefined;
        this.track(under, e);
        const moved = this.within(s.x - s.startX, s.y - s.startY, s.rect, s.bound);
        if (this.clone) {
            this.ghost.move(s.x, s.y, s.target && !s.refused ? 'move' : 'none');
        } else {
            this.pos = { x: s.from.x + moved.x, y: s.from.y + moved.y };
            this.applyPosition();
        }
        this.dragging.fire(this.args(s.target && !s.refused ? s.target : null, e));
    };

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
            this.follow(this.readAim());
        }
        // The click that follows the drop is not a click on what is under the pointer.
        const swallow = (ev: MouseEvent) => {
            ev.stopPropagation();
            ev.preventDefault();
        };
        setTimeout(onWindow(this, 'click', swallow, true), 0);
        this.end(e, e.type === 'pointerup');
    }

    start(e: PointerEvent): boolean {
        const s = this.session!;
        const rect = rectOf(this);
        const bound = this.boundRect();
        const args = this.args(null, e);
        this.starting.fire(args);
        if (args.cancel) {
            this.end(null, false);
            return false;
        }
        s.started = true;
        s.rect = rect;
        s.bound = bound;
        s.boxes = new DragBoxes(this, () => this.aimable(), stackCover);
        if (this.clone) this.ghost.show(this, s.x, s.y, 'move');
        (this.handlePart ?? this).attr.add({ setPointerCapture: e.pointerId });
        mark(this, 'data-dragging', true);
        for (const target of TARGETS) if (target.takes(this.group)) target.markActive(true);
        return true;
    }

    // The drop target under the pointer, told when the draggable comes over it and leaves it.
    track(target: DropTarget | null, e?: Event): void {
        const s = this.session;
        if (!s?.started || target === s.target) return;
        if (s.target) s.target.leave(this.dropArgs(s.target, e));
        s.target = target;
        s.refused = target ? !target.enter(this.dropArgs(target, e)) : false;
    }

    end(e: Event | null, drop: boolean): void {
        const s = this.session;
        for (const stop of this.stops.splice(0)) stop();
        if (!s) return;
        this.session = null;
        if (s.timer) clearTimeout(s.timer);
        s.waiting?.();
        s.boxes?.stop();
        if (!s.started) return;
        this.ghost.hide();
        mark(this, 'data-dragging', false);
        (this.handlePart ?? this).attr.add({ releasePointerCapture: s.pointerId });
        for (const target of TARGETS) target.markActive(false);
        const target = s.target && !s.refused ? s.target : null;
        const args = this.args(target, e ?? undefined);
        this.ending.fire(args);
        const cancelled = !drop || args.cancel;
        if (cancelled) {
            this.pos = { ...s.from };
            this.applyPosition();
        } else {
            if (target) target.drop({ draggable: this, data: this.data, cancel: false, source: target, event: e ?? undefined });
            // `x-model` takes the place back.
            if (!this.clone) this.bindings.writeModel({ ...this.pos });
        }
        this.ended.fire({ ...this.args(target, e ?? undefined), dropped: !cancelled && !!target });
        if (!this.clone) this.announce();
    }

    // The arrow keys move it by `step`, within the boundary and along the axis.
    keyDown(e: KeyboardEvent): void {
        if (!this.isEnabled || e.altKey || e.ctrlKey || e.metaKey || this.clone) return;
        const step = this.step;
        let dx = 0;
        let dy = 0;
        if (e.key === 'ArrowRight') dx = step;
        else if (e.key === 'ArrowLeft') dx = -step;
        else if (e.key === 'ArrowDown') dy = step;
        else if (e.key === 'ArrowUp') dy = -step;
        else return;
        // The handle's keys (the draggable's without one); a button or a field inside keeps its own.
        const on = this.handlePart ?? this;
        if (!on.motif.isEventFrom(e) || this.fieldsInside().some(c => c !== on && c.motif.isEventFrom(e))) return;
        e.preventDefault();
        const rect = rectOf(this);
        const bound = this.boundRect();
        const args = this.args(null, e);
        this.starting.fire(args);
        if (args.cancel) return;
        const moved = this.within(dx, dy, rect, bound);
        if (moved.x === 0 && moved.y === 0) return;
        this.pos = { x: this.pos.x + moved.x, y: this.pos.y + moved.y };
        this.applyPosition();
        this.dragging.fire(this.args(null, e));
        this.bindings.writeModel({ ...this.pos });
        this.ended.fire({ ...this.args(null, e), dropped: false });
        this.announce();
    }

    announce(): void {
        text(this.live, uiLocale.text('positionNow', { x: this.pos.x, y: this.pos.y }));
    }
}
