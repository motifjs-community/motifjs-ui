import { Component, Emitter, type Bind, type ComponentBase, type Event as MotifEvent, type IBaseProp } from "@motifx/core";
import { loose, part } from "../../core/draw-parts";
import { glyph } from "../../core/glyphs";
import { measure, onLayout, rectOf, styleOf, type Rect, type Size } from "../../core/measure";
import { onLanguage } from "../../core/on-language";
import { windowOf } from "../../core/page-documents";
import { css, put, shown, text } from "../../core/part-writes";
import { uiLocale } from "../../core/ui-locale";
import { Field } from "../../parts/field/Field";
import { Button } from "../button/Button";
import type { SignatureExportOptions } from "./signature-export-options";
import type { SignatureProps } from "./signature-props";
import type { SignaturePoint, SignatureStroke } from "./signature-stroke";
import type { SignatureStrokeEventArgs } from "./signature-stroke-event-args";
import { drawInk, inkSvg, type InkLook } from "./signature-draw";

type Strokes = readonly SignatureStroke[];

const OWN = ['height', 'penColor', 'minWidth', 'maxWidth', 'placeholder', 'showGuide', 'showClear', 'showUndo'] as const;

/** Pixels per millisecond at which a line without a pressure-sensitive pen is at its thinnest. */
const FAST = 2.5;
/** How much of the last pressure stays, so that the width changes along the line and not point by point. */
const SMOOTH = 0.7;
/** Points closer together than this, in pixels, are one point. */
const NEAR = 1;
const STILL = 0.5;

/**
 * A pad to sign on with a pen, a finger or a mouse. The value is the strokes themselves, so that a signature can be
 * stored as data, drawn again at any size and loaded back; `toDataURL()`, `toBlob()` and `toSVG()` give an image. A pen
 * that reports pressure sets the width of the line, and otherwise it follows the speed. This is a field, so the label,
 * help text, rules and `x-model` work as in all fields. `Delete` removes the signature and `Ctrl+Z` the last stroke.
 *
 * @example
 * <Signature label="Your signature" required x-model={() => this.form.signature} />
 * const image = await signature.toBlob();
 */
export class Signature extends Field<Strokes, SignatureProps> {
    strokeBegan = new Emitter<SignatureStrokeEventArgs>();
    strokeEnded = new Emitter<SignatureStrokeEventArgs>();
    canvas!: HTMLCanvasElement;
    canvasPart!: Component<HTMLCanvasElement>;
    placeholderPart!: HTMLSpanElement;
    placeholderTextPart!: Component<HTMLSpanElement>;
    guidePart!: Component<HTMLSpanElement>;
    actions!: Component<HTMLDivElement>;
    undoButton!: Button;
    clearButton!: Button;
    /** The stroke under the pen, until it is lifted. */
    drawing: SignaturePoint[] | null = null;
    pointer: number | null = null;
    lastTime = 0;
    lastPressure = 0.5;
    /** The pad in pixels of the page, and in pixels of the screen. */
    padSize: Size = { width: 0, height: 0 };
    screenSize: Size = { width: 0, height: 0 };
    /** The size written on the canvas. */
    canvasSize: Size = { width: 0, height: 0 };

    constructor(props?: IBaseProp<SignatureProps>) {
        super(props);
        const own = (this.props ?? {}) as SignatureProps;
        this.class.add('mx-signature');
        const padPart = this.controlPart;
        this.canvasPart = part<HTMLCanvasElement>(padPart, 'canvas', 'mx-signature__canvas');
        this.canvas = this.canvasPart.element;
        this.guidePart = part<HTMLSpanElement>(padPart, 'span', 'mx-signature__guide');
        this.placeholderTextPart = part<HTMLSpanElement>(padPart, 'span', 'mx-signature__placeholder');
        this.placeholderPart = this.placeholderTextPart.element;
        // In the corner of the pad: a child of the box.
        this.actions = part<HTMLDivElement>(this.boxPart, 'div', 'mx-signature__actions');
        this.undoButton = this.actionButton('undo', () => this.undo());
        this.clearButton = this.actionButton('trash', () => this.clear());
        for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
        if (own.onStrokeBegan) this.onStrokeBegan(own.onStrokeBegan);
        if (own.onStrokeEnded) this.onStrokeEnded(own.onStrokeEnded);

        this.observeProperty<number | null>('height', height => css(padPart, 'block-size', height ? `${height}px` : ''));
        for (const name of ['penColor', 'minWidth', 'maxWidth'] as const) this.observeProperty(name, () => this.redraw());
        for (const name of ['placeholder', 'showGuide', 'showClear', 'showUndo'] as const) this.observeProperty(name, () => this.drawParts());
        onLanguage(this, () => this.drawParts());
        padPart.motif.on('pointerdown', (_, e) => this.penDown(e));
        padPart.motif.on('pointermove', (_, e) => this.penMove(e));
        padPart.motif.on('pointerup', (_, e) => this.penUp(e));
        padPart.motif.on('pointercancel', (_, e) => this.penUp(e));
        padPart.motif.on('keydown', (_, e) => this.keyDown(e));
        onLayout(this.canvasPart, 'size', size => this.fit(size, this.screenSize), { box: 'content' });
        onLayout(this.canvasPart, 'size', size => this.fit(this.padSize, size), { box: 'device' });
        // The ink has the color of the pad, which a theme changes.
        onLayout(this, 'look', () => this.redraw());
        this.motif.setDisposable(() => {
            for (const emitter of [this.strokeBegan, this.strokeEnded]) emitter.dispose();
        });
        this.drawParts();
    }

    // Properties (see SignatureProps).

    get height(): number | null {
        return this.getProperty<number | null | undefined>('height') ?? null;
    }
    set height(value: Bind<number | null>) {
        this.assignProperty('height', value);
    }
    get penColor(): string | null {
        return this.getProperty<string | null | undefined>('penColor') ?? null;
    }
    set penColor(value: Bind<string | null>) {
        this.assignProperty('penColor', value);
    }
    get minWidth(): number {
        return this.getProperty<number | undefined>('minWidth') ?? 1;
    }
    set minWidth(value: Bind<number>) {
        this.assignProperty('minWidth', value);
    }
    get maxWidth(): number {
        return this.getProperty<number | undefined>('maxWidth') ?? 3;
    }
    set maxWidth(value: Bind<number>) {
        this.assignProperty('maxWidth', value);
    }
    get placeholder(): string {
        return this.getProperty<string | undefined>('placeholder') ?? uiLocale.strings.signatureHere;
    }
    set placeholder(value: Bind<string>) {
        this.assignProperty('placeholder', value);
    }
    get showGuide(): boolean {
        return this.getProperty<boolean | undefined>('showGuide') !== false;
    }
    set showGuide(value: Bind<boolean>) {
        this.assignProperty('showGuide', value);
    }
    get showClear(): boolean {
        return this.getProperty<boolean | undefined>('showClear') !== false;
    }
    set showClear(value: Bind<boolean>) {
        this.assignProperty('showClear', value);
    }
    get showUndo(): boolean {
        return this.getProperty<boolean | undefined>('showUndo') !== false;
    }
    set showUndo(value: Bind<boolean>) {
        this.assignProperty('showUndo', value);
    }
    get onStrokeBegan(): MotifEvent<SignatureStrokeEventArgs> {
        return this.strokeBegan.event;
    }
    get onStrokeEnded(): MotifEvent<SignatureStrokeEventArgs> {
        return this.strokeEnded.event;
    }

    /** The pad, which takes the pen and the keys. */
    get padPart(): ComponentBase {
        return this.controlPart;
    }

    /** Indicates that nothing has been signed. */
    get isEmpty(): boolean {
        return this.peekValue().length === 0;
    }

    /** Removes the signature. */
    clear(): void {
        if (this.canChange) this.change([]);
    }

    /** Removes the last stroke. */
    undo(): void {
        if (this.canChange) this.change(this.peekValue().slice(0, -1));
    }

    /** The signature as an SVG document. */
    toSVG(options: SignatureExportOptions = {}): string {
        return inkSvg(this.peekValue(), this.exportLook(options), options.background ?? null);
    }

    /** The signature as a data URL, a PNG by default. */
    toDataURL(type = 'image/png', options: SignatureExportOptions = {}): string {
        return this.exportCanvas(options).toDataURL(type);
    }

    /** The signature as an image file, a PNG by default. */
    toBlob(type = 'image/png', options: SignatureExportOptions = {}): Promise<Blob | null> {
        return new Promise(resolve => this.exportCanvas(options).toBlob(resolve, type));
    }

    protected createControl(): ComponentBase {
        const pad = loose<HTMLDivElement>('div', 'mx-signature__pad');
        put(pad, 'tabindex', '0');
        pad.attr.add({ role: 'img' });
        return pad;
    }

    // An image, whose role has no `aria-required` or `aria-readonly`.
    protected override get formRole(): boolean {
        return false;
    }

    protected emptyValue(): Strokes {
        return [];
    }

    protected override normalizeValue(value: Strokes): Strokes {
        return value ?? [];
    }

    protected override isEmptyValue(value: Strokes): boolean {
        return !value || value.length === 0;
    }

    protected override sameValue(a: Strokes, b: Strokes): boolean {
        return a === b;
    }

    protected renderValue(): void {
        if (!this.canvas) return;
        this.redraw();
        this.drawParts();
    }

    // The field does not draw what the user changed, as an input shows it by itself. A pad has to.
    change(value: Strokes, event?: Event): void {
        this.commit(value, event);
        this.renderValue();
    }

    get canChange(): boolean {
        return this.isEnabled && !this.readOnly;
    }

    actionButton(icon: string, press: () => void): Button {
        const button = new Button({ variant: 'ghost', size: 'sm', icon: () => glyph(icon), onclick: press });
        this.actions.controls.add(button);
        return button;
    }

    drawParts(): void {
        if (!this.placeholderTextPart) return;
        const strings = uiLocale.strings;
        const empty = this.isEmpty && !this.drawing;
        text(this.placeholderTextPart, this.placeholder);
        shown(this.placeholderTextPart, empty && this.placeholder !== '');
        shown(this.guidePart, this.showGuide);
        this.undoButton.hint = strings.signatureUndo;
        this.clearButton.hint = strings.clear;
        const canChange = !this.readOnly;
        shown(this.undoButton, this.showUndo && canChange);
        shown(this.clearButton, this.showClear && canChange);
        shown(this.actions, (this.showUndo || this.showClear) && canChange);
        this.undoButton.enabled = !this.isEmpty;
        this.clearButton.enabled = !this.isEmpty;
        const pad = this.controlPart;
        const hint = strings.signatureName;
        put(pad, 'aria-roledescription', hint);
        put(pad, 'aria-description', this.isEmpty ? strings.signatureEmpty : strings.signatureSigned);
    }

    /** Sizes the canvas to the pad, in the pixels of the screen. */
    fit(pad: Size, screen: Size): void {
        // A pad that is not laid out keeps the last size.
        if (pad.width && pad.height) this.padSize = pad;
        if (screen.width && screen.height) this.screenSize = screen;
        if (!this.padSize.width || !this.screenSize.width) return;
        this.canvasSize = { width: Math.round(this.screenSize.width), height: Math.round(this.screenSize.height) };
        put(this.canvasPart, 'width', String(this.canvasSize.width));
        put(this.canvasPart, 'height', String(this.canvasSize.height));
        this.redraw();
    }

    padLook(color: string): InkLook {
        return { width: this.padSize.width, height: this.padSize.height, minWidth: this.minWidth, maxWidth: this.maxWidth, color };
    }

    /** Draws the strokes again in the next frame, with the color the pad has then. */
    redraw(): void {
        measure(this, this.readColor, this.paint);
    }

    readonly readColor = (): string => this.penColor ?? styleOf(this.controlPart, ['color']).color;

    readonly paint = (color: string): void => {
        const context = this.canvas?.getContext('2d');
        if (!context || !this.padSize.width || !this.canvasSize.width) return;
        const ratio = this.canvasSize.width / this.padSize.width;
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        context.clearRect(0, 0, this.padSize.width, this.padSize.height);
        const strokes = this.drawing ? [...this.peekValue(), { points: this.drawing }] : this.peekValue();
        drawInk(context, strokes, this.padLook(color));
    };

    exportLook(options: SignatureExportOptions): InkLook {
        const scale = 2;
        const shape = this.padSize.height / (this.padSize.width || 1) || 1 / 3;
        const width = options.width ?? Math.round((this.padSize.width || 400) * scale);
        const height = options.height ?? Math.round(width * shape);
        const grow = width / (this.padSize.width || width);
        return { width, height, minWidth: this.minWidth * grow, maxWidth: this.maxWidth * grow, color: options.color ?? '#000000' };
    }

    exportCanvas(options: SignatureExportOptions): HTMLCanvasElement {
        const look = this.exportLook(options);
        const target = (windowOf(this)?.document ?? document).createElement('canvas');
        target.width = look.width;
        target.height = look.height;
        const context = target.getContext('2d');
        if (!context) return target;
        if (options.background) {
            context.fillStyle = options.background;
            context.fillRect(0, 0, look.width, look.height);
        }
        drawInk(context, this.peekValue(), look);
        return target;
    }

    pointOf(e: PointerEvent, box: Rect): SignaturePoint {
        const x = Math.min(1, Math.max(0, (e.clientX - box.left) / (box.width || 1)));
        const y = Math.min(1, Math.max(0, (e.clientY - box.top) / (box.height || 1)));
        return { x, y, pressure: this.pressureOf(e, x, y, box) };
    }

    // A pen tells its pressure. Otherwise the width follows the speed: a slow line is a thick one.
    pressureOf(e: PointerEvent, x: number, y: number, box: { width: number; height: number }): number {
        if (e.pointerType === 'pen' && e.pressure > 0) return e.pressure;
        const last = this.drawing?.[this.drawing.length - 1];
        if (!last) return STILL;
        const distance = Math.hypot((x - last.x) * box.width, (y - last.y) * box.height);
        const time = Math.max(1, e.timeStamp - this.lastTime);
        const wanted = Math.max(0, 1 - distance / time / FAST);
        this.lastPressure = this.lastPressure * SMOOTH + wanted * (1 - SMOOTH);
        return this.lastPressure;
    }

    penDown(e: PointerEvent): void {
        if (e.button !== 0 || !this.canChange || this.drawing) return;
        const box = rectOf(this.canvasPart);
        // The press itself gives the pad focus, without the ring of the keyboard.
        this.controlPart.attr.add({ setPointerCapture: e.pointerId });
        this.pointer = e.pointerId;
        this.lastPressure = STILL;
        this.drawing = [this.pointOf(e, box)];
        this.lastTime = e.timeStamp;
        this.drawParts();
        this.redraw();
        this.strokeBegan.fire({ stroke: { points: this.drawing }, originalEvent: e, source: this });
    }

    penMove(e: PointerEvent): void {
        if (!this.drawing || e.pointerId !== this.pointer) return;
        const box = rectOf(this.canvasPart);
        const pad = this.padSize;
        for (const step of e.getCoalescedEvents?.() ?? [e]) {
            const point = this.pointOf(step, box);
            const last = this.drawing[this.drawing.length - 1];
            if (Math.hypot((point.x - last.x) * pad.width, (point.y - last.y) * pad.height) < NEAR) continue;
            this.drawing.push(point);
            this.lastTime = step.timeStamp;
        }
        this.redraw();
    }

    penUp(e: PointerEvent): void {
        if (!this.drawing || e.pointerId !== this.pointer) return;
        const stroke: SignatureStroke = { points: this.drawing };
        this.drawing = null;
        this.pointer = null;
        this.change([...this.peekValue(), stroke], e);
        this.strokeEnded.fire({ stroke, originalEvent: e, source: this });
    }

    keyDown(e: KeyboardEvent): void {
        if (!this.canChange) return;
        if (e.key === 'Delete') {
            e.preventDefault();
            this.clear();
        } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
            e.preventDefault();
            this.undo();
        }
    }
}
