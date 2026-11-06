import { Emitter, type Bind, type Event as MotifEvent, type IBaseProp } from "@motifx/core";
import { Control } from "../../core/control";
import { mark } from "../../core/draw-parts";
import type { DropEventArgs } from "./drop-event-args";
import type { DropTargetProps } from "./drop-target-props";

/** Every drop target on the page, for the draggables to find the one under the pointer. */
export const TARGETS = new Set<DropTarget>();

const OWN = ['group'] as const;

/**
 * An area that accepts a `Draggable` of its group. It is marked while a drag from the group is in progress and
 * while the draggable is over it. `onDragEntering` can reject the draggable, and `onDropped` reports what was
 * dropped, with its `data`. The JSX children are its content. Your code decides what a drop does to the data.
 *
 * @example
 * <DropTarget group="cards" onDropped={e => this.board.move(e.data as Card, 'done')}>…</DropTarget>
 */
export class DropTarget extends Control<HTMLDivElement, DropTargetProps> {
    entered = new Emitter<DropEventArgs>();
    left = new Emitter<DropEventArgs>();
    dropped = new Emitter<DropEventArgs>();

    constructor(props?: IBaseProp<DropTargetProps>) {
        super('div', props);
        const own = (this.props ?? {}) as DropTargetProps;
        this.element.classList.add('mx-drop-target');
        if (this.childs?.length) this.controls.add(...this.childs);
        for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
        if (own.onDragEntering) this.onDragEntering(own.onDragEntering);
        if (own.onDragLeaving) this.onDragLeaving(own.onDragLeaving);
        if (own.onDropped) this.onDropped(own.onDropped);
        TARGETS.add(this);
        this.motif.setDisposable(() => {
            TARGETS.delete(this);
            for (const emitter of [this.entered, this.left, this.dropped]) emitter.dispose();
        });
    }

    get group(): string | null {
        return this.getProperty<string | null | undefined>('group') ?? null;
    }
    set group(value: Bind<string | null>) {
        this.assignProperty('group', value);
    }

    /** Occurs when a draggable enters (`draggable`, `data`). Set `cancel = true` to reject it. */
    get onDragEntering(): MotifEvent<DropEventArgs> {
        return this.entered.event;
    }

    /** Occurs when the draggable leaves. */
    get onDragLeaving(): MotifEvent<DropEventArgs> {
        return this.left.event;
    }

    /** Occurs when a draggable is dropped on it. */
    get onDropped(): MotifEvent<DropEventArgs> {
        return this.dropped.event;
    }

    /** Indicates whether it accepts the draggables of `group`. */
    takes(group: string | null): boolean {
        return this.isEnabled && this.group === group;
    }

    /** @internal A drag of its group began or ended. */
    markActive(on: boolean): void {
        mark(this.element, 'data-drop-active', on);
        if (!on) {
            mark(this.element, 'data-drop-over', false);
            mark(this.element, 'data-drop-refused', false);
        }
    }

    /** @internal The draggable came over it; `false` when it is refused. */
    enter(args: DropEventArgs): boolean {
        this.entered.fire(args);
        mark(this.element, 'data-drop-over', !args.cancel);
        mark(this.element, 'data-drop-refused', args.cancel);
        return !args.cancel;
    }

    /** @internal The draggable left it. */
    leave(args: DropEventArgs): void {
        mark(this.element, 'data-drop-over', false);
        mark(this.element, 'data-drop-refused', false);
        this.left.fire(args);
    }

    /** @internal The draggable was dropped on it. */
    drop(args: DropEventArgs): void {
        mark(this.element, 'data-drop-over', false);
        this.dropped.fire(args);
    }
}
