import type { Component, ComponentBase } from '@motifx/core';
import { svgComponent } from '../chart/svg-parts';

/** A dark rectangle of a code, in modules. */
export interface CodeRect {
    x: number;
    y: number;
    width: number;
    height: number;
}

/** A code as dark rectangles on a sheet, in modules. */
export interface CodeImage {
    width: number;
    height: number;
    rects: readonly CodeRect[];
}

/** Colors and size of an image of a code. */
export interface CodeImageOptions {
    /** The size of a module in pixels. */
    scale: number;
    color: string;
    background: string;
}

/** The rectangles as the data of one SVG path. */
export function rectsPath(rects: readonly CodeRect[]): string {
    return rects.map(r => `M${r.x} ${r.y}h${r.width}v${r.height}h${-r.width}z`).join('');
}

/** A new inline `<svg>` with its path, parts of `parent`, sized in CSS and colored by `currentColor`. */
export function createCodeSvgParts(parent: ComponentBase): { svg: Component<SVGSVGElement>; path: Component<SVGPathElement> } {
    const svg = svgComponent(parent, 'svg');
    const path = svgComponent(svg, 'path');
    svg.attr.add({ preserveAspectRatio: 'xMidYMid meet', 'shape-rendering': 'crispEdges', 'aria-hidden': 'true' });
    path.attr.add({ fill: 'currentColor' });
    return { svg, path };
}

/** The code as an SVG document. */
export function codeSvgDocument(image: CodeImage, options: CodeImageOptions, extra = ''): string {
    const { width, height } = image;
    const { scale, color, background } = options;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width * scale}" height="${height * scale}" viewBox="0 0 ${width} ${height}" shape-rendering="crispEdges"><rect width="${width}" height="${height}" fill="${background}"/><path fill="${color}" d="${rectsPath(image.rects)}"/>${extra}</svg>`;
}

/** The code on a new canvas, drawn off the page for a picture of it (never placed). */
export function codeCanvas(doc: Document, image: CodeImage, options: CodeImageOptions): HTMLCanvasElement {
    const { scale, color, background } = options;
    const canvas = doc.createElement('canvas');
    canvas.width = image.width * scale;
    canvas.height = image.height * scale;
    const context = canvas.getContext('2d');
    if (!context) return canvas;
    context.fillStyle = background;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = color;
    for (const r of image.rects) context.fillRect(r.x * scale, r.y * scale, r.width * scale, r.height * scale);
    return canvas;
}
