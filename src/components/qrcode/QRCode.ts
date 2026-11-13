import { Emitter, type Bind, type Component, type Event as MotifEvent, type IBaseProp } from "@motifx/core";
import { Control } from "../../core/control";
import { part } from "../../core/draw-parts";
import { onLanguage } from "../../core/on-language";
import { windowOf } from "../../core/page-documents";
import { css, mark, put, shown } from "../../core/part-writes";
import { uiLocale } from "../../core/ui-locale";
import { codeCanvas, codeSvgDocument, createCodeSvgParts, rectsPath, type CodeImage, type CodeRect } from "../../parts/code/code-image";
import { encodeQr, type QrLevel, type QrMatrix } from "../../parts/code/qr-encode";
import type { QRCodeExportOptions } from "./qr-code-export-options";
import type { QRCodeFailedEventArgs } from "./qr-code-failed-event-args";
import type { QRCodeProps } from "./qr-code-props";

const OWN = ['value', 'level', 'size', 'margin', 'logo', 'logoSize', 'label'] as const;

/** The share of a code a logo may cover: more would take away what error correction can restore. */
const MOST_LOGO = 0.3;

/**
 * A QR code, drawn as vectors so that it stays sharp at any size. The smallest version that holds the text is chosen, and
 * the text may hold any characters. `level` sets how much of the code can be damaged, and `logo` puts an image in the
 * middle. `toSVG()` and `toDataURL()` give an image. A text too long for a code draws nothing and raises `onEncodeFailed`.
 *
 * @example
 * <QRCode value={() => this.link} size={200} />
 * <QRCode value="https://example.com" level="H" logo="/logo.svg" />
 */
export class QRCode extends Control<HTMLDivElement, QRCodeProps> {
    encodeFailed = new Emitter<QRCodeFailedEventArgs>();
    svg: SVGSVGElement;
    svgPart: Component<SVGSVGElement>;
    path: SVGPathElement;
    pathPart: Component<SVGPathElement>;
    logoImage: HTMLImageElement;
    logoPart: Component<HTMLImageElement>;
    matrix: QrMatrix | null = null;
    image: CodeImage | null = null;
    invalid = false;

    constructor(props?: IBaseProp<QRCodeProps>) {
        super('div', props);
        const own = (this.props ?? {}) as QRCodeProps;
        this.class.add('mx-qr-code');
        this.attr.add({ role: 'img' });
        const { svg, path } = createCodeSvgParts(this);
        this.svgPart = svg;
        this.svg = svg.element;
        this.pathPart = path;
        this.path = path.element;
        svg.class.add('mx-qr-code__svg');
        this.logoPart = part<HTMLImageElement>(this, 'img', 'mx-qr-code__logo');
        this.logoImage = this.logoPart.element;
        this.logoPart.attr.add({ alt: '' });
        for (const name of OWN) if (own[name] !== undefined) this.bindProperty(name, own[name]);
        if (own.onEncodeFailed) this.onEncodeFailed(own.onEncodeFailed);

        for (const name of ['value', 'level', 'margin', 'logo', 'logoSize'] as const) this.observeProperty(name, () => this.render());
        this.observeProperty<number | null>('size', size => css(this, '--_size', size ? `${size}px` : ''));
        this.observeProperty('label', () => this.drawName());
        onLanguage(this, () => this.drawName());
        this.motif.setDisposable(() => this.encodeFailed.dispose());
        this.render();
    }

    // Properties (see QRCodeProps).

    get value(): string {
        return this.getProperty<string | undefined>('value') ?? '';
    }
    set value(value: Bind<string>) {
        this.assignProperty('value', value);
    }
    get level(): QrLevel {
        return this.getProperty<QrLevel | undefined>('level') ?? 'M';
    }
    set level(value: Bind<QrLevel>) {
        this.assignProperty('level', value);
    }
    get size(): number | null {
        return this.getProperty<number | null | undefined>('size') ?? null;
    }
    set size(value: Bind<number | null>) {
        this.assignProperty('size', value);
    }
    get margin(): number {
        return Math.max(0, this.getProperty<number | undefined>('margin') ?? 4);
    }
    set margin(value: Bind<number>) {
        this.assignProperty('margin', value);
    }
    get logo(): string | null {
        return this.getProperty<string | null | undefined>('logo') ?? null;
    }
    set logo(value: Bind<string | null>) {
        this.assignProperty('logo', value);
    }
    get logoSize(): number {
        return Math.min(MOST_LOGO, Math.max(0, this.getProperty<number | undefined>('logoSize') ?? 0.2));
    }
    set logoSize(value: Bind<number>) {
        this.assignProperty('logoSize', value);
    }
    get label(): string {
        return this.getProperty<string | undefined>('label') ?? '';
    }
    set label(value: Bind<string>) {
        this.assignProperty('label', value);
    }
    get onEncodeFailed(): MotifEvent<QRCodeFailedEventArgs> {
        return this.encodeFailed.event;
    }

    /** Indicates that the value could not be drawn. */
    get isInvalid(): boolean {
        return this.invalid;
    }

    /** The number of modules along a side of the code, without its margin. */
    get modules(): number {
        return this.matrix?.size ?? 0;
    }

    /** The code as an SVG document. The logo is not part of it. */
    toSVG(options: QRCodeExportOptions = {}): string {
        return this.image ? codeSvgDocument(this.image, this.exportLook(options)) : '';
    }

    /** The code as a data URL, a PNG by default. The logo is not part of it. */
    toDataURL(type = 'image/png', options: QRCodeExportOptions = {}): string {
        const doc = windowOf(this)?.document;
        return this.image && doc ? codeCanvas(doc, this.image, this.exportLook(options)).toDataURL(type) : '';
    }

    exportLook(options: QRCodeExportOptions) {
        const sheet = this.image?.width ?? 1;
        return {
            scale: Math.max(1, Math.round((options.size ?? 512) / sheet)),
            color: options.color ?? '#000000',
            background: options.background ?? '#ffffff'
        };
    }

    render(): void {
        const text = this.value;
        let matrix: QrMatrix | null = null;
        let failed = false;
        if (text !== '') {
            try {
                matrix = encodeQr(text, this.level);
            } catch {
                failed = true;
            }
        }
        this.matrix = matrix;
        this.image = matrix ? this.imageOf(matrix) : null;
        this.invalid = failed;
        mark(this, 'data-invalid', failed);
        mark(this.svgPart, 'hidden', !matrix);
        if (this.image) {
            put(this.svgPart, 'viewBox', `0 0 ${this.image.width} ${this.image.height}`);
            put(this.pathPart, 'd', rectsPath(this.image.rects));
        }
        this.drawLogo();
        this.drawName();
        if (failed) this.encodeFailed.fire({ value: text, source: this });
    }

    // Rows of dark modules, joined along each row, with a place cleared for the logo.
    imageOf(matrix: QrMatrix): CodeImage {
        const { size, modules } = matrix;
        const margin = this.margin;
        const hole = this.logoHole(size);
        const rects: CodeRect[] = [];
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                if (!modules[y][x] || hole(x, y)) continue;
                let end = x;
                while (end + 1 < size && modules[y][end + 1] && !hole(end + 1, y)) end++;
                rects.push({ x: x + margin, y: y + margin, width: end - x + 1, height: 1 });
                x = end;
            }
        }
        const side = size + margin * 2;
        return { width: side, height: side, rects };
    }

    logoHole(size: number): (x: number, y: number) => boolean {
        if (!this.logo) return () => false;
        const span = Math.ceil(size * this.logoSize);
        const from = Math.floor((size - span) / 2);
        return (x, y) => x >= from && x < from + span && y >= from && y < from + span;
    }

    drawLogo(): void {
        const image = this.logoPart;
        const logo = this.logo;
        shown(image, !!logo && !!this.matrix);
        put(image, 'src', logo);
        if (this.matrix) css(image, 'inline-size', `${(Math.ceil(this.matrix.size * this.logoSize) / (this.matrix.size + this.margin * 2)) * 100}%`);
    }

    drawName(): void {
        const value = this.value;
        put(this, 'aria-label', this.label || uiLocale.text('qrCodeLabel', { value }));
    }
}
