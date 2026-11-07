import { Emitter, type Bind, type Component, type Event as MotifEvent, type IBaseProp } from "@motifx/core";
import { Control } from "../../core/control";
import { css, mark, part, shown, text } from "../../core/draw-parts";
import { onLanguage } from "../../core/on-language";
import { uiLocale } from "../../core/ui-locale";
import { encodeBarcode, type BarcodeFormat, type BarcodeModel } from "../../parts/code/barcode-encode";
import { codeCanvas, codeSvgDocument, createCodeSvg, drawCodeSvg, showSvg, type CodeImage } from "../../parts/code/code-image";
import type { BarcodeExportOptions } from "./barcode-export-options";
import type { BarcodeFailedEventArgs } from "./barcode-failed-event-args";
import type { BarcodeProps } from "./barcode-props";

const OWN = ['value', 'format', 'checkDigit', 'moduleWidth', 'height', 'margin', 'showText', 'label'] as const;

/** The height of a bar in modules when it is drawn as an image. */
const IMAGE_BAR = 60;
/** How much lower a guard bar of an EAN or a UPC runs, in modules. */
const GUARD = 5;
/** The formats whose guard bars run lower. */
const GUARDED: readonly BarcodeFormat[] = ['ean13', 'ean8', 'upca'];

/**
 * A linear barcode, drawn as vectors: Code 128, Code 39, EAN-13, EAN-8, UPC-A or Interleaved 2 of 5. EAN and UPC values
 * may leave out the check digit, which is worked out, and a wrong one is refused. A value the format cannot hold draws
 * nothing and raises `onEncodeFailed`. `toSVG()` and `toDataURL()` give an image.
 *
 * @example
 * <Barcode value={() => this.item.code} />
 * <Barcode format="ean13" value="4006381333931" />
 */
export class Barcode extends Control<HTMLDivElement, BarcodeProps> {
    encodeFailed = new Emitter<BarcodeFailedEventArgs>();
    svg: SVGSVGElement;
    path: SVGPathElement;
    textPart: Component<HTMLSpanElement>;
    model: BarcodeModel | null = null;

    constructor(props?: IBaseProp<BarcodeProps>) {
        super('div', props);
        const own = (this.props ?? {}) as BarcodeProps;
        const el = this.element;
        el.classList.add('mx-barcode');
        el.setAttribute('role', 'img');
        const { svg, path } = createCodeSvg(el.ownerDocument);
        this.svg = svg;
        this.path = path;
        svg.classList.add('mx-barcode__svg');
        el.append(svg);
        this.textPart = part<HTMLSpanElement>(this, 'span', 'mx-barcode__text');
        this.textPart.element.setAttribute('aria-hidden', 'true');
        for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
        if (own.onEncodeFailed) this.onEncodeFailed(own.onEncodeFailed);

        for (const name of ['value', 'format', 'checkDigit', 'margin', 'moduleWidth', 'height'] as const) this.observeProperty(name, () => this.render());
        this.observeProperty('showText', () => this.drawText());
        this.observeProperty('label', () => this.drawName());
        onLanguage(this, () => this.drawName());
        this.motif.setDisposable(() => this.encodeFailed.dispose());
        this.render();
    }

    // Properties (see BarcodeProps).

    get value(): string {
        return this.getProperty<string | undefined>('value') ?? '';
    }
    set value(value: Bind<string>) {
        this.assignProperty('value', value);
    }
    get format(): BarcodeFormat {
        return this.getProperty<BarcodeFormat | undefined>('format') ?? 'code128';
    }
    set format(value: Bind<BarcodeFormat>) {
        this.assignProperty('format', value);
    }
    get checkDigit(): boolean {
        return this.getProperty<boolean | undefined>('checkDigit') ?? false;
    }
    set checkDigit(value: Bind<boolean>) {
        this.assignProperty('checkDigit', value);
    }
    get moduleWidth(): number {
        return Math.max(1, this.getProperty<number | undefined>('moduleWidth') ?? 2);
    }
    set moduleWidth(value: Bind<number>) {
        this.assignProperty('moduleWidth', value);
    }
    get height(): number | null {
        return this.getProperty<number | null | undefined>('height') ?? null;
    }
    set height(value: Bind<number | null>) {
        this.assignProperty('height', value);
    }
    get margin(): number {
        return Math.max(0, this.getProperty<number | undefined>('margin') ?? 10);
    }
    set margin(value: Bind<number>) {
        this.assignProperty('margin', value);
    }
    get showText(): boolean {
        return this.getProperty<boolean | undefined>('showText') !== false;
    }
    set showText(value: Bind<boolean>) {
        this.assignProperty('showText', value);
    }
    get label(): string {
        return this.getProperty<string | undefined>('label') ?? '';
    }
    set label(value: Bind<string>) {
        this.assignProperty('label', value);
    }
    get onEncodeFailed(): MotifEvent<BarcodeFailedEventArgs> {
        return this.encodeFailed.event;
    }

    /** Indicates that the value could not be drawn. */
    get isInvalid(): boolean {
        return this.element.hasAttribute('data-invalid');
    }

    /** The text under the bars, with the check digit where the format has one. */
    get codeText(): string {
        return this.model?.text ?? '';
    }

    /** The code as an SVG document, with the text under the bars. */
    toSVG(options: BarcodeExportOptions = {}): string {
        const image = this.imageOf(IMAGE_BAR);
        if (!image) return '';
        const look = this.exportLook(options);
        const words = this.showText ? this.svgText(image) : '';
        return codeSvgDocument(this.withTextRoom(image), look, words.replace('#text', look.color));
    }

    /** The code as a data URL, a PNG by default. */
    toDataURL(type = 'image/png', options: BarcodeExportOptions = {}): string {
        const image = this.imageOf(IMAGE_BAR);
        if (!image) return '';
        const look = this.exportLook(options);
        const room = this.withTextRoom(image);
        const canvas = codeCanvas(this.element.ownerDocument, room, look);
        const context = canvas.getContext('2d');
        if (context && this.showText) {
            context.fillStyle = look.color;
            context.font = `${10 * look.scale}px sans-serif`;
            context.textAlign = 'center';
            context.textBaseline = 'alphabetic';
            context.fillText(this.codeText, (room.width * look.scale) / 2, (room.height - 3) * look.scale);
        }
        return canvas.toDataURL(type);
    }

    exportLook(options: BarcodeExportOptions) {
        return { scale: Math.max(1, Math.round(options.scale ?? 2)), color: options.color ?? '#000000', background: options.background ?? '#ffffff' };
    }

    withTextRoom(image: CodeImage): CodeImage {
        return this.showText ? { ...image, height: image.height + 14 } : image;
    }

    svgText(image: CodeImage): string {
        const words = this.codeText.replace(/&/g, '&amp;').replace(/</g, '&lt;');
        return `<text x="${image.width / 2}" y="${image.height + 11}" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#text">${words}</text>`;
    }

    // The bars, and the guards of an EAN or a UPC a little lower, in modules.
    imageOf(barHeight: number): CodeImage | null {
        const model = this.model;
        if (!model) return null;
        const margin = this.margin;
        const guarded = GUARDED.includes(this.format);
        const rects = model.bars.map(bar => ({ x: bar.x + margin, y: 0, width: bar.width, height: barHeight + (guarded && bar.guard ? GUARD : 0) }));
        return { width: model.width + margin * 2, height: barHeight + (guarded ? GUARD : 0), rects };
    }

    render(): void {
        const el = this.element;
        const value = this.value;
        let model: BarcodeModel | null = null;
        let failed = false;
        if (value !== '') {
            try {
                model = encodeBarcode(value, this.format, this.checkDigit);
            } catch {
                failed = true;
            }
        }
        this.model = model;
        mark(el, 'data-invalid', failed);
        showSvg(this.svg, !!model);
        if (model) {
            const barHeight = (this.height ?? this.barHeightOfLanguage()) / this.moduleWidth;
            const image = this.imageOf(barHeight) as CodeImage;
            drawCodeSvg(this.svg, this.path, image);
            this.svg.setAttribute('preserveAspectRatio', 'none');
            css(this.svg as unknown as HTMLElement, 'inline-size', `${image.width * this.moduleWidth}px`);
            css(this.svg as unknown as HTMLElement, 'block-size', `${image.height * this.moduleWidth}px`);
        }
        this.drawText();
        this.drawName();
        if (failed) this.encodeFailed.fire({ value, format: this.format, source: this });
    }

    // The height the language gives, read once the bar is in the page.
    barHeightOfLanguage(): number {
        const given = this.element.isConnected ? parseFloat(getComputedStyle(this.element).getPropertyValue('--_barcode-height')) : NaN;
        return Number.isFinite(given) && given > 0 ? given : 64;
    }

    override onMounted(): void {
        this.render();
    }

    drawText(): void {
        const on = this.showText && !!this.model;
        text(this.textPart.element, this.codeText);
        shown(this.textPart.element, on);
    }

    drawName(): void {
        this.element.setAttribute('aria-label', this.label || uiLocale.text('barcodeLabel', { value: this.codeText || this.value }));
    }
}
