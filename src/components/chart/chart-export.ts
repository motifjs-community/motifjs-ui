import type { Component, ComponentBase } from '@motifx/core';
import { estimateWidth, surfaceBehind } from '../../parts/chart/chart-text';
import { svgTagOf } from '../../parts/chart/svg-parts';
import { part, removePart } from '../../core/draw-parts';
import { measure, measureNow, styleOf, textWidths } from '../../core/measure';
import { windowOf } from '../../core/page-documents';
import { css } from '../../core/part-writes';
import type { Chart } from './Chart';
import type { ChartExportOptions } from './chart-export-options';
import { textOf } from './text-parts';

const PAINT = ['fill', 'fill-opacity', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'stroke-dasharray', 'opacity', 'font-family', 'font-size', 'font-weight', 'paint-order'] as const;
const TITLE = ['font-weight', 'font-size', 'font-family'] as const;
/** What an image keeps of a part's own attributes: where it is and what it draws. Its paint is written instead of its class and style. */
const SHAPE = ['viewBox', 'width', 'height', 'x', 'y', 'id', 'clip-path', 'd', 'stroke-dasharray', 'transform', 'text-anchor'];

const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
const escape = (text: string) => text.replace(/[&<>"]/g, (c) => ESCAPES[c]);

/** What the image takes from the page's styles, read together. */
interface ImageStyles {
    /** The paint of each part of the plot, as the styles give it. */
    paints: Map<ComponentBase, string>;
    color: string;
    title: Record<(typeof TITLE)[number], string>;
    /** The colors the legend's keys come to, in the order of the entries. */
    keys: string[];
    /** What shows behind the chart. */
    background: string;
}

/** The paint of `from` and of every part in it. */
function readPaints(from: ComponentBase, paints: Map<ComponentBase, string>): void {
    const style = styleOf(from, PAINT);
    let paint = '';
    for (const name of PAINT) paint += `${name}:${style[name]};`;
    paints.set(from, paint);
    for (const child of from.controls.items) readPaints(child, paints);
}

function readStyles(chart: Chart, probes: readonly ComponentBase[]): ImageStyles {
    const paints = new Map<ComponentBase, string>();
    readPaints(chart.plot.svgPart, paints);
    return {
        paints,
        color: styleOf(chart, ['color']).color,
        title: styleOf(chart.titleText, TITLE),
        keys: probes.map(probe => styleOf(probe, ['color']).color),
        background: surfaceBehind(chart)
    };
}

/**
 * A part of the plot as SVG markup that stands alone, without the page's styles: everything the styles gave the
 * marks is written on them. `extra`: attributes for the part itself.
 */
function paintedMarkup(from: ComponentBase, paints: Map<ComponentBase, string>, extra = ''): string {
    // Every part of the plot is made by `svgComponent`; anything else is kept as a group.
    const tag = svgTagOf(from) ?? 'g';
    let attributes = '';
    for (const name of SHAPE) {
        const value = from.attr.get(name);
        if (value !== null) attributes += ` ${name}="${escape(value)}"`;
    }
    let inner = escape(textOf(from) ?? '');
    for (const child of from.controls.items) inner += paintedMarkup(child, paints);
    return `<${tag}${attributes}${extra} style="${escape(paints.get(from) ?? '')}">${inner}</${tag}>`;
}

function textAt(text: string, x: number, y: number, font: string, color: string): string {
    return `<text x="${x}" y="${y}" style="${escape(`font:${font};fill:${color};`)}">${escape(text)}</text>`;
}

/** A part made for a moment whose color is `color` (a token): what it comes to on the chart is read from it. */
function colorProbe(chart: Chart, color: string): Component<HTMLSpanElement> {
    const probe = part<HTMLSpanElement>(chart, 'span', '');
    css(probe, 'color', color);
    return probe;
}

/**
 * The chart's styles for an image, read at once: an export needs its answer now, so the reads waiting in the window run
 * with this one. Asked for inside a run of the measuring layer, where nothing runs at once, they are read fresh.
 */
function stylesNow(chart: Chart, probes: readonly ComponentBase[]): ImageStyles {
    let styles: ImageStyles | null = null;
    const stop = measure(chart, () => readStyles(chart, probes), value => (styles = value));
    measureNow(chart);
    stop();
    return styles ?? readStyles(chart, probes);
}

/** The chart as an SVG document, with its title and its legend, ready to stand alone. It is written as text: nothing is put on the page. */
export function chartImage(chart: Chart, options: ChartExportOptions): { svg: string; width: number; height: number } {
    const plot = chart.plot;
    const look = chart.look;
    const { width, height: plotHeight } = plot.size;
    const legendOn = chart.legendOn;
    const series = chart.legendEntries;
    const probes = legendOn ? series.map(s => colorProbe(chart, s.mark)) : [];
    // The legend's names are measured in the chart's font with the styles, at once.
    let nameWidths: number[] = [];
    const stopNames = legendOn ? textWidths(chart, series.map(s => s.name), widths => (nameWidths = widths)) : null;
    const styles = stylesNow(chart, probes);
    stopNames?.();
    for (const probe of probes) removePart(probe);
    const { color, title } = styles;
    const pad = look?.tickPad ?? 8;
    const line = look?.line ?? 16;
    const font = look?.font ?? '12px sans-serif';
    const titleSize = parseFloat(title['font-size']) || 16;
    const titleFont = `${title['font-weight']} ${titleSize}px ${title['font-family']}`;
    const titleLine = Math.round(titleSize * 1.4);

    let top = pad;
    if (chart.title) top += titleLine;
    if (chart.subtitle) top += line + pad / 2;
    top += pad;

    const legendTop = top + plotHeight + pad;
    let x = 0;
    let rows = 0;
    const keys: { x: number; row: number; series: (typeof series)[number] }[] = [];
    if (legendOn) {
        for (const [i, s] of series.entries()) {
            const wide = line + pad / 2 + (nameWidths[i] || estimateWidth(s.name, font)) + pad * 2;
            if (x && x + wide > width) {
                x = 0;
                rows++;
            }
            keys.push({ x, row: rows, series: s });
            x += wide;
        }
    }
    const margin = pad * 2;
    const inner = Math.ceil(legendTop + (legendOn ? (rows + 1) * (line + pad / 2) : 0));
    const outerWidth = width + margin * 2;
    const height = inner + margin * 2;
    let page = '';
    let y = pad;
    if (chart.title) {
        y += titleLine * 0.8;
        page += textAt(chart.title, 0, y, titleFont, color);
        y += titleLine * 0.2;
    }
    if (chart.subtitle) {
        y += line;
        page += textAt(chart.subtitle, 0, y, font, color);
    }
    page += paintedMarkup(plot.svgPart, styles.paints, ` x="0" y="${top}"`);

    keys.forEach((key, i) => {
        const rowTop = legendTop + key.row * (line + pad / 2);
        page += `<rect x="${key.x}" y="${rowTop + line / 4}" width="${line}" height="${line / 2}" style="${escape(`fill:${styles.keys[i]};`)}"/>`;
        page += textAt(key.series.name, key.x + line + pad / 2, rowTop + line * 0.75, font, color);
    });
    const sheet = `<rect width="${outerWidth}" height="${height}" style="${escape(`fill:${options.background ?? styles.background};`)}"/>`;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${outerWidth}" height="${height}" viewBox="0 0 ${outerWidth} ${height}">${sheet}<g transform="translate(${margin} ${margin})">${page}</g></svg>`;
    return { svg, width: outerWidth, height };
}

/** The chart as an SVG document. */
export function chartSvg(chart: Chart, options: ChartExportOptions): string {
    return chartImage(chart, options).svg;
}

/** The chart drawn on a canvas, off the page: the browser reads the SVG as an image first, which is not immediate. */
export function chartCanvas(chart: Chart, options: ChartExportOptions): Promise<HTMLCanvasElement> {
    const doc = windowOf(chart)?.document;
    if (!doc) return Promise.reject(new Error('The chart could not be drawn as an image.'));
    const { svg, width, height } = chartImage(chart, options);
    const scale = options.scale ?? 2;
    const address = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
            const canvas = doc.createElement('canvas');
            canvas.width = Math.round(width * scale);
            canvas.height = Math.round(height * scale);
            canvas.getContext('2d')?.drawImage(image, 0, 0, canvas.width, canvas.height);
            resolve(canvas);
        };
        image.onerror = () => reject(new Error('The chart could not be drawn as an image.'));
        image.src = address;
    });
}
