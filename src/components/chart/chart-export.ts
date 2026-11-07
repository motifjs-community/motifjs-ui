import { surfaceBehind, textWidth } from '../../parts/chart/chart-text';
import { svgPart } from '../../parts/chart/svg-parts';
import type { Chart } from './Chart';
import type { ChartExportOptions } from './chart-export-options';

const PAINT = ['fill', 'fill-opacity', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'stroke-dasharray', 'opacity', 'font-family', 'font-size', 'font-weight', 'paint-order'];

// An image stands alone, without the page's styles: everything the styles gave the marks is written on them.
function writePaint(from: Element, to: Element, view: Window): void {
    const style = view.getComputedStyle(from);
    let written = '';
    for (const name of PAINT) written += `${name}:${style.getPropertyValue(name)};`;
    to.setAttribute('style', written);
    to.removeAttribute('class');
    for (let i = 0; i < from.children.length; i++) writePaint(from.children[i], to.children[i], view);
}

function textAt(parent: Element, text: string, x: number, y: number, font: string, color: string): void {
    const el = svgPart(parent, 'text');
    el.textContent = text;
    el.setAttribute('x', String(x));
    el.setAttribute('y', String(y));
    el.setAttribute('style', `font:${font};fill:${color};`);
}

/** The chart as an SVG element, with its title and its legend, ready to stand alone. */
export function chartImage(chart: Chart, options: ChartExportOptions): { svg: SVGSVGElement; width: number; height: number } {
    const doc = chart.element.ownerDocument;
    const view = doc.defaultView as Window;
    const plot = chart.plot.svg;
    const look = chart.look;
    const width = Number(plot.getAttribute('width')) || 0;
    const plotHeight = Number(plot.getAttribute('height')) || 0;
    const root = chart.element;
    const color = view.getComputedStyle(root).color;
    const title = view.getComputedStyle(chart.titleText.element);
    const pad = look?.tickPad ?? 8;
    const line = look?.line ?? 16;
    const font = look?.font ?? '12px sans-serif';
    const titleFont = `${title.fontWeight} ${parseFloat(title.fontSize) || 16}px ${title.fontFamily}`;
    const titleLine = Math.round((parseFloat(title.fontSize) || 16) * 1.4);
    const legendOn = root.hasAttribute('data-legend');
    const series = chart.legendEntries;

    let top = pad;
    if (chart.title) top += titleLine;
    if (chart.subtitle) top += line + pad / 2;
    top += pad;
    const out = svgPart(root, 'svg');
    out.remove();
    out.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

    const legendTop = top + plotHeight + pad;
    let x = 0;
    let rows = 0;
    const keys: { x: number; row: number; series: (typeof series)[number] }[] = [];
    if (legendOn) {
        for (const s of series) {
            const wide = line + pad / 2 + textWidth(s.name, font, doc) + pad * 2;
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
    out.setAttribute('width', String(outerWidth));
    out.setAttribute('height', String(height));
    out.setAttribute('viewBox', `0 0 ${outerWidth} ${height}`);

    const sheet = svgPart(out, 'rect');
    sheet.setAttribute('width', String(outerWidth));
    sheet.setAttribute('height', String(height));
    sheet.setAttribute('style', `fill:${options.background ?? surfaceBehind(root)};`);
    const page = svgPart(out, 'g');
    page.setAttribute('transform', `translate(${margin} ${margin})`);

    let y = pad;
    if (chart.title) {
        y += titleLine * 0.8;
        textAt(page, chart.title, 0, y, titleFont, color);
        y += titleLine * 0.2;
    }
    if (chart.subtitle) {
        y += line;
        textAt(page, chart.subtitle, 0, y, font, color);
    }

    const copy = plot.cloneNode(true) as SVGSVGElement;
    writePaint(plot, copy, view);
    copy.setAttribute('x', '0');
    copy.setAttribute('y', String(top));
    page.append(copy);

    for (const key of keys) {
        const rowTop = legendTop + key.row * (line + pad / 2);
        const mark = key.series.mark;
        const swatch = svgPart(page, 'rect');
        swatch.setAttribute('x', String(key.x));
        swatch.setAttribute('y', String(rowTop + line / 4));
        swatch.setAttribute('width', String(line));
        swatch.setAttribute('height', String(line / 2));
        const probe = doc.createElement('span');
        probe.style.color = mark;
        root.append(probe);
        swatch.setAttribute('style', `fill:${view.getComputedStyle(probe).color};`);
        probe.remove();
        textAt(page, key.series.name, key.x + line + pad / 2, rowTop + line * 0.75, font, color);
    }
    return { svg: out, width: outerWidth, height };
}

/** The chart as an SVG document. */
export function chartSvg(chart: Chart, options: ChartExportOptions): string {
    return new XMLSerializer().serializeToString(chartImage(chart, options).svg);
}

/** The chart drawn on a canvas: the browser reads the SVG as an image first, which is not immediate. */
export function chartCanvas(chart: Chart, options: ChartExportOptions): Promise<HTMLCanvasElement> {
    const doc = chart.element.ownerDocument;
    const { svg, width, height } = chartImage(chart, options);
    const scale = options.scale ?? 2;
    const address = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(svg))}`;
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
