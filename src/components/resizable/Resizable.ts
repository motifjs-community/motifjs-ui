import { Component, Emitter, type Bind, type ComponentBase, type Event as MotifEvent, type IBaseProp } from "@motifx/core";
import { Control } from "../../core/control";
import { glyphPart, part } from "../../core/draw-parts";
import { boxOf, holderOf, measure, styleOf } from "../../core/measure";
import { onLanguage } from "../../core/on-language";
import { css, kept, mark, put, text } from "../../core/part-writes";
import { uiLocale } from "../../core/ui-locale";
import { followPointer } from "../../parts/window/follow-pointer";
import { resizeBox } from "../../parts/window/resize-box";
import { resizeFrame } from "../../parts/window/resize-frame";
import type { WindowBox } from "../../parts/window/window-box";
import type { ResizeEventArgs } from "./resize-event-args";
import type { ResizeStart } from "./resize-start";
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
    frame: Component<HTMLDivElement>;
    /** The grip in the end corner, which is the Tab stop for keyboard resizing. */
    grip: Component<HTMLDivElement>;
    live: Component<HTMLSpanElement>;
    /** The handle of each edge and corner. */
    private readonly handleParts: ReadonlyMap<ResizeEdge, Component<HTMLDivElement>>;
    /** The edge and the event of the resize that ended, told with the size once it is laid out. */
    private ended: { edge: ResizeEdge; event?: Event } | null = null;

    constructor(props?: IBaseProp<ResizableProps>) {
        super('div', props);
        const own = (this.props ?? {}) as ResizableProps;
        this.class.add('mx-resizable');
        if (this.childs?.length) this.controls.add(...this.childs);
        const { frame, handles } = resizeFrame('mx-resizable__frame', 'mx-resizable__handle');
        this.controls.add(frame);
        this.frame = frame;
        this.handleParts = handles;
        this.grip = part<HTMLDivElement>(this, 'div', 'mx-resizable__grip');
        this.grip.attr.add({ role: 'button' });
        put(this.grip, 'tabindex', '0');
        glyphPart(this.grip, 'grip', 'mx-resizable__grip-glyph');
        this.live = part<HTMLSpanElement>(this, 'span', 'mx-sr-only');
        this.live.attr.add({ 'aria-live': 'polite' });
        for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
        if (own.onResizeStarting) this.onResizeStarting(own.onResizeStarting);
        if (own.onResizing) this.onResizing(own.onResizing);
        if (own.onResized) this.onResized(own.onResized);

        this.observeProperty('handles', () => this.drawHandles());
        this.observeProperty<number | string | null>('width', w => css(this, 'inline-size', this.length(w)));
        this.observeProperty<number | string | null>('height', h => css(this, 'block-size', this.length(h)));
        this.observeProperty<ResizeSize | null>('size', size => {
            if (!size) return;
            css(this, 'inline-size', `${size.width}px`);
            css(this, 'block-size', `${size.height}px`);
        });
        onLanguage(this, () => put(this.grip, 'aria-label', uiLocale.strings.resize));
        for (const [edge, handle] of this.handleParts) handle.motif.on('pointerdown', (_, e) => this.pointerDown(e, edge, handle));
        this.grip.motif.on('pointerdown', (_, e) => this.pointerDown(e, 'bottom-end', null));
        this.grip.motif.on('keydown', (_, e) => this.keyDown(e));
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
    get area(): 'parent' | ComponentBase | null {
        return this.getProperty<'parent' | ComponentBase | null | undefined>('area') ?? null;
    }
    set area(value: Bind<'parent' | ComponentBase | null>) {
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
        const box = boxOf(this);
        return { width: box.offsetWidth, height: box.offsetHeight };
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
        for (const [edge, handle] of this.handleParts) kept(handle, allowed.has(edge));
        kept(this.grip, allowed.size > 0);
    }

    // The component the box stays inside: its parent, or the area given; none for no limit.
    areaOf(): ComponentBase | null {
        const area = this.area;
        if (area === 'parent') return this.parent ? holderOf(this.parent) : null;
        return area;
    }

    // What a resize starts from, read once before anything is written: where the box is and how big, the room its
    // area leaves, and how it is laid out. A positioned box is where its `left` and `top` put it; one in the flow is
    // measured from its area, else from its parent.
    readStart(): ResizeStart {
        const own = boxOf(this);
        const area = this.areaOf();
        const style = styleOf(this, ['position', 'left', 'top']);
        const positioned = style.position === 'absolute' || style.position === 'fixed';
        let x = 0;
        let y = 0;
        const from = area ?? (this.parent ? holderOf(this.parent) : null);
        if (positioned) {
            x = parseFloat(style.left) || 0;
            y = parseFloat(style.top) || 0;
        } else if (from) {
            const around = boxOf(from);
            x = own.left - around.left - around.clientLeft + (around.rtl ? -around.scrollStart : around.scrollStart);
            y = own.top - around.top - around.clientTop + around.scrollTop;
        }
        const room = area ? boxOf(area) : null;
        return {
            box: { x, y, w: own.offsetWidth, h: own.offsetHeight },
            room: room ? { w: room.clientWidth, h: room.clientHeight } : { w: Number.POSITIVE_INFINITY, h: Number.POSITIVE_INFINITY },
            positioned,
            rtl: own.rtl,
        };
    }

    limits(): Limits {
        return { minW: this.minWidth, minH: this.minHeight, maxW: this.maxWidth ?? Number.POSITIVE_INFINITY, maxH: this.maxHeight ?? Number.POSITIVE_INFINITY };
    }

    // The edge in physical terms: right to left, `start` is the right side.
    physical(edge: ResizeEdge, rtl: boolean): ResizeEdge {
        if (!rtl) return edge;
        return edge.replace('start', 'END').replace('end', 'start').replace('END', 'end') as ResizeEdge;
    }

    // The box the pointer asks for: within the limits and the room, and keeping its shape when told.
    next(edge: ResizeEdge, from: ResizeStart, dx: number, dy: number): WindowBox {
        const { minW, minH, maxW, maxH } = this.limits();
        const start = from.box;
        const side = this.physical(edge, from.rtl);
        const box = resizeBox(side, start, dx, dy, { w: minW, h: minH }, from.room);
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
        if (from.positioned) {
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

    applyBox(box: WindowBox, positioned: boolean): void {
        css(this, 'inline-size', `${box.w}px`);
        css(this, 'block-size', `${box.h}px`);
        if (positioned) {
            css(this, 'left', `${Math.round(box.x)}px`);
            css(this, 'top', `${Math.round(box.y)}px`);
        }
    }

    args(edge: ResizeEdge, box: WindowBox, event?: Event): ResizeEventArgs {
        return { edge, width: box.w, height: box.h, byUser: true, cancel: false, source: this, event };
    }

    // A press on a handle, or on the grip (`handle` null).
    pointerDown(e: PointerEvent, edge: ResizeEdge, handle: Component<HTMLDivElement> | null): void {
        if (e.button !== 0 || !this.isEnabled || !this.allowed().has(edge)) return;
        e.preventDefault();
        const from = this.readStart();
        const args = this.args(edge, from.box, e);
        this.starting.fire(args);
        if (args.cancel) return;
        const on = handle ?? this.grip;
        mark(this, 'data-resizing', true);
        put(this, 'data-edge', edge);
        if (handle) mark(handle, 'data-active', true);
        followPointer(on, e, (dx, dy) => {
            const box = this.next(edge, from, dx, dy);
            this.applyBox(box, from.positioned);
            this.resizing.fire(this.args(edge, box, e));
        }, () => {
            mark(this, 'data-resizing', false);
            put(this, 'data-edge', null);
            if (handle) mark(handle, 'data-active', false);
            this.finish(edge, e);
        });
    }

    // The arrow keys on the grip: Left and Right change the width (the other way round right to left), Up and Down the height.
    keyDown(e: KeyboardEvent): void {
        if (!this.isEnabled || e.altKey || e.ctrlKey || e.metaKey) return;
        const step = this.step;
        let dx = 0;
        let dy = 0;
        if (e.key === 'ArrowRight') dx = step;
        else if (e.key === 'ArrowLeft') dx = -step;
        else if (e.key === 'ArrowDown') dy = step;
        else if (e.key === 'ArrowUp') dy = -step;
        else return;
        e.preventDefault();
        const from = this.readStart();
        const args = this.args('bottom-end', from.box, e);
        this.starting.fire(args);
        if (args.cancel) return;
        // Right to left the end corner is on the left: a step to the right moves its edge in.
        const box = this.next('bottom-end', from, dx, dy);
        this.applyBox(box, from.positioned);
        this.resizing.fire(this.args('bottom-end', box, e));
        this.finish('bottom-end', e);
    }

    // The size is told once the box is laid out with it: the styles of the page may keep it from what was written.
    finish(edge: ResizeEdge, event?: Event): void {
        this.ended = { edge, event };
        measure(this, this.readSize, this.tellSize);
    }

    private readonly readSize = (): ResizeSize => this.currentSize;

    private readonly tellSize = (size: ResizeSize): void => {
        const { edge, event } = this.ended ?? { edge: 'bottom-end' as ResizeEdge };
        this.ended = null;
        this.resized.fire({ edge, width: size.width, height: size.height, byUser: true, cancel: false, source: this, event });
        // `x-model` takes the size back.
        this.bindings.writeModel(size);
        text(this.live, uiLocale.text('sizeNow', { width: size.width, height: size.height }));
    };
}
