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

/** A number as it reads in `locale`. */
export function formatNumber(value: number, format: ChartFormat | undefined, locale: string, fallback?: Intl.NumberFormatOptions): string {
    if (typeof format === 'function') return format(value);
    return new Intl.NumberFormat(locale, (format as Intl.NumberFormatOptions) ?? fallback).format(value);
}

/** A moment as it reads in `locale`. */
export function formatDate(value: number | Date, format: ChartFormat | undefined, locale: string, fallback?: Intl.DateTimeFormatOptions): string {
    if (typeof format === 'function') return format(value);
    return new Intl.DateTimeFormat(locale, (format as Intl.DateTimeFormatOptions) ?? fallback).format(value);
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
