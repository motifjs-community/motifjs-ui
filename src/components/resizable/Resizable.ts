import { Component, Emitter, type Bind, type Event as MotifEvent, type IBaseProp } from "@motifx/core";
import { Control } from "../../core/control";
import { css, glyphPart, mark, part, put, shown, text } from "../../core/draw-parts";
import { onLanguage } from "../../core/on-language";
import { uiLocale } from "../../core/ui-locale";
import { followPointer } from "../../parts/window/follow-pointer";
import { resizeBox } from "../../parts/window/resize-box";
import { resizeFrame } from "../../parts/window/resize-frame";
import type { WindowBox } from "../../parts/window/window-box";
import type { ResizeEventArgs } from "./resize-event-args";
import type { ResizableProps, ResizeEdge, ResizeHandles, ResizeSize } from "./resizable-props";

const OWN = ['handles', 'minWidth', 'minHeight', 'maxWidth', 'maxHeight', 'area', 'keepAspectRatio', 'step', 'width', 'height', 'size'] as const;
const EDGES: readonly ResizeEdge[] = ['top', 'bottom', 'start', 'end', 'top-start', 'top-end', 'bottom-start', 'bottom-end'];
const SIDES: readonly ResizeEdge[] = ['top', 'bottom', 'start', 'end'];
const CORNERS: readonly ResizeEdge[] = ['top-start', 'top-end', 'bottom-start', 'bottom-end'];

interface Limits {
    minW: number;
    minH: number;
    maxW: number;
    maxH: number;
}

/**
 * A box the user resizes from its edges and corners with the pointer, or with the arrow keys on the grip in its
 * end corner. The JSX children are its content. It stays at least `minWidth` × `minHeight`, at most the maximums,
 * and inside `area` if one is set, and `keepAspectRatio` preserves its shape. A box laid out by its position
 * (`absolute`, `fixed`) also moves when a start or top edge is dragged, so the far edge stays in place. A box in
 * the normal flow only changes size.
 *
 * @example
 * <Resizable minWidth={160} minHeight={100} x-model={() => this.layout.size}><Panel padding="md">…</Panel></Resizable>
 * <Resizable handles={['end', 'bottom', 'bottom-end']} area="parent" keepAspectRatio><img src="…" /></Resizable>
 */
export class Resizable extends Control<HTMLDivElement, ResizableProps> {
    starting = new Emitter<ResizeEventArgs>();
    resizing = new Emitter<ResizeEventArgs>();
    resized = new Emitter<ResizeEventArgs>();
    frame: HTMLDivElement;
    grip: Component<HTMLDivElement>;
    live: Component<HTMLSpanElement>;

    constructor(props?: IBaseProp<ResizableProps>) {
        super('div', props);
        const own = (this.props ?? {}) as ResizableProps;
        const el = this.element;
        el.classList.add('mx-resizable');
        if (this.childs?.length) this.controls.add(...this.childs);
        this.frame = resizeFrame(el.ownerDocument, 'mx-resizable__frame', 'mx-resizable__handle');
        el.append(this.frame);
        this.grip = part<HTMLDivElement>(this, 'div', 'mx-resizable__grip');
        this.grip.element.setAttribute('role', 'button');
        this.grip.element.tabIndex = 0;
        glyphPart(this.grip, 'grip', 'mx-resizable__grip-glyph');
        this.live = part<HTMLSpanElement>(this, 'span', 'mx-sr-only');
        this.live.element.setAttribute('aria-live', 'polite');
        for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
        if (own.onResizeStarting) this.onResizeStarting(own.onResizeStarting);
        if (own.onResizing) this.onResizing(own.onResizing);
        if (own.onResized) this.onResized(own.onResized);

        this.observeProperty('handles', () => this.drawHandles());
        this.observeProperty<number | string | null>('width', w => css(el, 'inline-size', this.length(w)));
        this.observeProperty<number | string | null>('height', h => css(el, 'block-size', this.length(h)));
        this.observeProperty<ResizeSize | null>('size', size => {
            if (!size) return;
            css(el, 'inline-size', `${size.width}px`);
            css(el, 'block-size', `${size.height}px`);
        });
        onLanguage(this, () => put(this.grip.element, 'aria-label', uiLocale.strings.resize));
        this.frame.addEventListener('pointerdown', e => this.pointerDown(e, null));
        this.grip.element.addEventListener('pointerdown', e => this.pointerDown(e, 'bottom-end'));
        this.grip.element.addEventListener('keydown', e => this.keyDown(e));
        this.motif.setDisposable(() => {
            for (const emitter of [this.starting, this.resizing, this.resized]) emitter.dispose();
        });
        this.drawHandles();
    }

    // Properties (see ResizableProps).

    get handles(): ResizeHandles {
        return this.getProperty<ResizeHandles | undefined>('handles') ?? 'all';
    }
    set handles(value: Bind<ResizeHandles>) {
        this.assignProperty('handles', value);
    }
    get minWidth(): number {
        return Math.max(0, this.getProperty<number | undefined>('minWidth') ?? 30);
    }
    set minWidth(value: Bind<number>) {
        this.assignProperty('minWidth', value);
    }
    get minHeight(): number {
        return Math.max(0, this.getProperty<number | undefined>('minHeight') ?? 30);
    }
    set minHeight(value: Bind<number>) {
        this.assignProperty('minHeight', value);
    }
    get maxWidth(): number | null {
        return this.getProperty<number | null | undefined>('maxWidth') ?? null;
    }
    set maxWidth(value: Bind<number | null>) {
        this.assignProperty('maxWidth', value);
    }
    get maxHeight(): number | null {
        return this.getProperty<number | null | undefined>('maxHeight') ?? null;
    }
    set maxHeight(value: Bind<number | null>) {
        this.assignProperty('maxHeight', value);
    }
    get area(): 'parent' | HTMLElement | null {
        return this.getProperty<'parent' | HTMLElement | null | undefined>('area') ?? null;
    }
    set area(value: Bind<'parent' | HTMLElement | null>) {
        this.assignProperty('area', value);
    }
    get keepAspectRatio(): boolean {
        return this.getProperty<boolean | undefined>('keepAspectRatio') === true;
    }
    set keepAspectRatio(value: Bind<boolean>) {
        this.assignProperty('keepAspectRatio', value);
    }
    get step(): number {
        return Math.max(1, this.getProperty<number | undefined>('step') ?? 10);
    }
    set step(value: Bind<number>) {
        this.assignProperty('step', value);
    }
    get width(): number | string | null {
        return this.getProperty<number | string | null | undefined>('width') ?? null;
    }
    set width(value: Bind<number | string | null>) {
        this.assignProperty('width', value);
    }
    get height(): number | string | null {
        return this.getProperty<number | string | null | undefined>('height') ?? null;
    }
    set height(value: Bind<number | string | null>) {
        this.assignProperty('height', value);
    }
    get size(): ResizeSize | null {
        return this.getProperty<ResizeSize | null | undefined>('size') ?? null;
    }
    set size(value: Bind<ResizeSize | null>) {
        this.assignProperty('size', value);
    }
    /** Maps to `size` for `x-model`. */
    get value(): ResizeSize | null {
        return this.size;
    }
    set value(value: ResizeSize | null) {
        this.size = value;
    }

    /** Occurs before a resize starts from a handle (`edge`). Set `cancel = true` to keep the size. */
    get onResizeStarting(): MotifEvent<ResizeEventArgs> {
        return this.starting.event;
    }

    /** Occurs while the box is being resized (the current `width` and `height`). */
    get onResizing(): MotifEvent<ResizeEventArgs> {
        return this.resizing.event;
    }

    /** Occurs when a resize ends, either when the pointer is released or when a key moves an edge. */
    get onResized(): MotifEvent<ResizeEventArgs> {
        return this.resized.event;
    }

    /** The current size in pixels. */
    get currentSize(): ResizeSize {
        return { width: this.element.offsetWidth, height: this.element.offsetHeight };
    }

    /** The grip in the end corner, which is the Tab stop for keyboard resizing. */
    get gripElement(): HTMLDivElement {
        return this.grip.element;
    }

    length(value: number | string | null | undefined): string {
        return typeof value === 'number' ? `${value}px` : value ?? '';
    }

    // The handles asked for; the grip stays as long as one handle is, so the keys can resize.
    allowed(): Set<ResizeEdge> {
        const handles = this.handles;
        const list = handles === 'all' ? EDGES : handles === 'edges' ? SIDES : handles === 'corners' ? CORNERS : handles;
        return new Set(list);
    }

    drawHandles(): void {
        const allowed = this.allowed();
        for (const handle of Array.from(this.frame.children) as HTMLElement[]) shown(handle, allowed.has(handle.dataset.edge as ResizeEdge));
        shown(this.grip.element, allowed.size > 0);
    }

    // Where the box is and how big, in pixels from its offset parent.
    box(): WindowBox {
        const el = this.element;
        return { x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight };
    }

    // The room the box may fill: its area's size, or no limit.
    room(): { w: number; h: number } {
        const area = this.area;
        const el = area === 'parent' ? (this.element.offsetParent as HTMLElement | null) : area;
        if (!el) return { w: Number.POSITIVE_INFINITY, h: Number.POSITIVE_INFINITY };
        return { w: el.clientWidth, h: el.clientHeight };
    }

    limits(): Limits {
        return { minW: this.minWidth, minH: this.minHeight, maxW: this.maxWidth ?? Number.POSITIVE_INFINITY, maxH: this.maxHeight ?? Number.POSITIVE_INFINITY };
    }

    get positioned(): boolean {
        const position = getComputedStyle(this.element).position;
        return position === 'absolute' || position === 'fixed';
    }

    // The edge in physical terms: right to left, `start` is the right side.
    physical(edge: ResizeEdge): ResizeEdge {
        if (getComputedStyle(this.element).direction !== 'rtl') return edge;
        return edge.replace('start', 'END').replace('end', 'start').replace('END', 'end') as ResizeEdge;
    }

    // The box the pointer asks for: within the limits and the room, and keeping its shape when told.
    next(edge: ResizeEdge, start: WindowBox, dx: number, dy: number): WindowBox {
        const { minW, minH, maxW, maxH } = this.limits();
        const positioned = this.positioned;
        const side = this.physical(edge);
        const box = resizeBox(side, start, dx, dy, { w: minW, h: minH }, this.room());
        box.w = Math.min(box.w, maxW);
        box.h = Math.min(box.h, maxH);
        if (this.keepAspectRatio && start.h > 0 && start.w > 0) {
            const ratio = start.w / start.h;
            const corner = edge.includes('-');
            const byWidth = corner ? Math.abs(box.w - start.w) / start.w >= Math.abs(box.h - start.h) / start.h : edge === 'start' || edge === 'end';
            if (byWidth) box.h = Math.min(Math.max(box.w / ratio, minH), maxH);
            else box.w = Math.min(Math.max(box.h * ratio, minW), maxW);
            if (byWidth) box.w = box.h * ratio;
            else box.h = box.w / ratio;
        }
        if (positioned) {
            if (side.includes('start')) box.x = start.x + start.w - box.w;
            if (side.includes('top')) box.y = start.y + start.h - box.h;
        } else {
            box.x = start.x;
            box.y = start.y;
        }
        box.w = Math.round(box.w);
        box.h = Math.round(box.h);
        return box;
    }

    applyBox(box: WindowBox): void {
        const el = this.element;
        css(el, 'inline-size', `${box.w}px`);
        css(el, 'block-size', `${box.h}px`);
        if (this.positioned) {
            css(el, 'left', `${Math.round(box.x)}px`);
            css(el, 'top', `${Math.round(box.y)}px`);
        }
    }

    args(edge: ResizeEdge, box: WindowBox, event?: Event): ResizeEventArgs {
        return { edge, width: box.w, height: box.h, byUser: true, cancel: false, source: this, event };
    }

    pointerDown(e: PointerEvent, given: ResizeEdge | null): void {
        const handle = given ? null : (e.target as HTMLElement).closest<HTMLElement>('.mx-resizable__handle');
        const edge = given ?? (handle?.dataset.edge as ResizeEdge | undefined);
        if (e.button !== 0 || !edge || !this.isEnabled || !this.allowed().has(edge)) return;
        e.preventDefault();
        const start = this.box();
        const args = this.args(edge, start, e);
        this.starting.fire(args);
        if (args.cancel) return;
        const on = handle ?? this.grip.element;
        mark(this.element, 'data-resizing', true);
        put(this.element, 'data-edge', edge);
        if (handle) mark(handle, 'data-active', true);
        let last = start;
        followPointer(on, e, (dx, dy) => {
            last = this.next(edge, start, dx, dy);
            this.applyBox(last);
            this.resizing.fire(this.args(edge, last, e));
        }, () => {
            mark(this.element, 'data-resizing', false);
            put(this.element, 'data-edge', null);
            if (handle) mark(handle, 'data-active', false);
            this.finish(edge, last, e);
        });
    }

    // The arrow keys on the grip: Left and Right change the width (the other way round right to left), Up and Down the height.
    keyDown(e: KeyboardEvent): void {
        if (!this.isEnabled || e.altKey || e.ctrlKey || e.metaKey) return;
        const rtl = getComputedStyle(this.element).direction === 'rtl';
        const step = this.step;
        let dx = 0;
        let dy = 0;
        if (e.key === 'ArrowRight') dx = rtl ? -step : step;
        else if (e.key === 'ArrowLeft') dx = rtl ? step : -step;
        else if (e.key === 'ArrowDown') dy = step;
        else if (e.key === 'ArrowUp') dy = -step;
        else return;
        e.preventDefault();
        const start = this.box();
        const args = this.args('bottom-end', start, e);
        this.starting.fire(args);
        if (args.cancel) return;
        const box = this.next('bottom-end', start, rtl ? -dx : dx, dy);
        this.applyBox(box);
        this.resizing.fire(this.args('bottom-end', box, e));
        this.finish('bottom-end', box, e);
    }

    finish(edge: ResizeEdge, box: WindowBox, event?: Event): void {
        const size = this.currentSize;
        this.resized.fire({ edge, width: size.width, height: size.height, byUser: true, cancel: false, source: this, event });
        // `x-model` takes the size back.
        this.bindings.writeModel(size);
        text(this.live.element, uiLocale.text('sizeNow', { width: size.width, height: size.height }));
    }
}
