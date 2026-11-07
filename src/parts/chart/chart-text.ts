/** How a value reads: a function of your own, or options of the browser's number or date formats. */
export type ChartFormat = ((value: any) => string) | Intl.NumberFormatOptions | Intl.DateTimeFormatOptions;

let measuring: CanvasRenderingContext2D | null = null;

/** The width of `text` in `font` (a CSS font). Where there is nothing to measure with, an estimate from the font's size. */
export function textWidth(text: string, font: string, doc: Document): number {
    if (typeof CanvasRenderingContext2D !== 'undefined') {
        measuring ??= doc.createElement('canvas').getContext('2d');
        if (measuring) {
            measuring.font = font;
            return measuring.measureText(text).width;
        }
    }
    const size = Number(/([\d.]+)px/.exec(font)?.[1] ?? 12);
    return text.length * size * 0.56;
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

/** The background behind `el`: the first one up its parents that can be seen. */
export function surfaceBehind(el: Element): string {
    const view = el.ownerDocument.defaultView;
    for (let at: Element | null = el; at && view; at = at.parentElement) {
        const color = view.getComputedStyle(at).backgroundColor;
        if (color && color !== 'transparent' && !/rgba?\(.*[,/]\s*0\)$/.test(color)) return color;
    }
    return 'Canvas';
}

/** A motion token of the design language in milliseconds: languages write it in seconds or in milliseconds. */
export function motionOf(el: Element, token: string): number {
    const text = el.ownerDocument.defaultView?.getComputedStyle(el).getPropertyValue(token).trim() ?? '';
    const number = parseFloat(text);
    if (!Number.isFinite(number)) return 0;
    return /ms$/.test(text) ? number : /s$/.test(text) ? number * 1000 : number;
}
