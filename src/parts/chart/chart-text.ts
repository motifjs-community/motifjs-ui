import type { ComponentBase } from '@motifx/core';
import { onLookChange, pageBackgroundOf, styleOf, textSizes, type Size } from '../../core/measure';

/** How a value reads: a function of your own, or options of the browser's number or date formats. */
export type ChartFormat = ((value: any) => string) | Intl.NumberFormatOptions | Intl.DateTimeFormatOptions;

/** An estimate of the width of `text` in `font` (a CSS font), from the font's size: what stands until the text is measured. */
export function estimateWidth(text: string, font: string): number {
    const size = Number(/([\d.]+)px/.exec(font)?.[1] ?? 12);
    return text.length * size * 0.56;
}

/**
 * The sizes of the texts a drawing lays out, measured in `host`'s font (with the CSS of `className`, see `textSizes`).
 * A text not measured yet stands at an estimate and is asked for (`ask`, after the drawing): it is measured with the
 * next reads of the window, and `changed` is called when one came out another size than the drawing used, to draw again.
 * The sizes are kept until the look changes.
 */
export class DrawnTexts {
    private readonly sizes = new Map<string, Size>();
    /** The texts asked for, with the width the drawing used for each; `null` for one whose height it used. */
    private readonly wanted = new Map<string, number | null>();

    constructor(
        private readonly host: ComponentBase,
        private readonly changed: () => void,
        private readonly className = ''
    ) {
        host.motif.setDisposable(onLookChange(host, () => this.sizes.clear()));
    }

    /** The width of `text`: measured, or an estimate in `font` while it is not (asked for by the next `ask`). */
    width(text: string, font: string): number {
        const known = this.sizes.get(text);
        if (known) return known.width;
        const guess = estimateWidth(text, font);
        if (!this.wanted.has(text)) this.wanted.set(text, guess);
        return guess;
    }

    /** The width of `text` as known now, asking for nothing: for drawing that moves (a value on its way). */
    peek(text: string, font: string): number {
        return this.sizes.get(text)?.width ?? estimateWidth(text, font);
    }

    /** The height of a line of `text`'s font, measured, or `fallback` while it is not (asked for by the next `ask`). */
    height(text: string, fallback: number): number {
        const known = this.sizes.get(text);
        if (known) return known.height || fallback;
        this.wanted.set(text, null);
        return fallback;
    }

    /** Measures the texts asked for since the last time. */
    ask(): void {
        if (!this.wanted.size) return;
        const wanted = [...this.wanted];
        this.wanted.clear();
        textSizes(
            this.host,
            wanted.map(([text]) => text),
            (sizes) => {
                let moved = false;
                wanted.forEach(([text, guess], i) => {
                    // A text that came out at no width (nothing laid out) keeps its estimate and is measured again next time.
                    if (!(sizes[i].width > 0)) return;
                    this.sizes.set(text, sizes[i]);
                    if (guess === null || Math.abs(sizes[i].width - guess) > 0.5) moved = true;
                });
                if (moved) this.changed();
            },
            this.className
        );
    }
}

// Making a format is much slower than using one, and a table of many rows uses the same few again and again.
const numberFormats = new Map<string, Intl.NumberFormat>();
const dateFormats = new Map<string, Intl.DateTimeFormat>();
const MOST_KEPT = 64;

function kept<F>(cache: Map<string, F>, key: string, make: () => F): F {
    let found = cache.get(key);
    if (!found) {
        if (cache.size >= MOST_KEPT) cache.clear();
        cache.set(key, (found = make()));
    }
    return found;
}

/** A number as it reads in `locale`. */
export function formatNumber(value: number, format: ChartFormat | undefined, locale: string, fallback?: Intl.NumberFormatOptions): string {
    if (typeof format === 'function') return format(value);
    const options = (format as Intl.NumberFormatOptions) ?? fallback;
    return kept(numberFormats, `${locale}|${JSON.stringify(options ?? null)}`, () => new Intl.NumberFormat(locale, options)).format(value);
}

/** A moment as it reads in `locale`. */
export function formatDate(value: number | Date, format: ChartFormat | undefined, locale: string, fallback?: Intl.DateTimeFormatOptions): string {
    if (typeof format === 'function') return format(value);
    const options = (format as Intl.DateTimeFormatOptions) ?? fallback;
    return kept(dateFormats, `${locale}|${JSON.stringify(options ?? null)}`, () => new Intl.DateTimeFormat(locale, options)).format(value);
}

const BACKGROUND: readonly 'background-color'[] = ['background-color'];

/** The background behind `component`: the first one up its parents that can be seen, else the page's. */
export function surfaceBehind(component: ComponentBase): string {
    for (let at: ComponentBase | null = component; at; at = at.parent) {
        const color = styleOf(at, BACKGROUND)['background-color'];
        if (isSeen(color)) return color;
    }
    return pageBackgroundOf(component);
}

function isSeen(color: string): boolean {
    return !!color && color !== 'transparent' && !/rgba?\(.*[,/]\s*0\)$/.test(color);
}

/** A motion token of the design language in milliseconds: languages write it in seconds or in milliseconds. */
export function motionOf(component: ComponentBase, token: string): number {
    const text = styleOf(component, [token])[token];
    const number = parseFloat(text);
    if (!Number.isFinite(number)) return 0;
    return /ms$/.test(text) ? number : /s$/.test(text) ? number * 1000 : number;
}
