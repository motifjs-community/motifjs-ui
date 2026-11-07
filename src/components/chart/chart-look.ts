/** Sizes a chart takes from its design language, in pixels, and the font of its axes. */
export interface ChartLook {
    barWidth: number;
    barRadius: number;
    barGap: number;
    markerSize: number;
    bubbleMin: number;
    bubbleMax: number;
    hitSize: number;
    cellRadius: number;
    sliceLift: number;
    donutHole: number;
    tickGap: number;
    tickPad: number;
    font: string;
    line: number;
}

const SIZES = {
    barWidth: ['--_chart-bar-width', 24],
    barRadius: ['--_chart-bar-radius', 4],
    barGap: ['--_chart-bar-gap', 2],
    markerSize: ['--_chart-marker-size', 8],
    bubbleMin: ['--_chart-bubble-min', 6],
    bubbleMax: ['--_chart-bubble-max', 28],
    hitSize: ['--_chart-hit-size', 24],
    cellRadius: ['--_chart-cell-radius', 2],
    sliceLift: ['--_chart-slice-lift', 6],
    tickGap: ['--_chart-tick-gap', 48],
    tickPad: ['--_chart-tick-pad', 8]
} as const;

/**
 * The look as it stands on `root`. Tokens may be in `rem`: a measuring part turns each into pixels, which the geometry
 * needs. The numbers here only stand where nothing is laid out, as in a test without a browser.
 */
export function readLook(root: HTMLElement, labels: Element): ChartLook {
    const doc = root.ownerDocument;
    const view = doc.defaultView;
    const probe = doc.createElement('div');
    probe.style.cssText = 'position:absolute;visibility:hidden;block-size:0;';
    root.append(probe);
    const look = {} as Record<keyof typeof SIZES, number>;
    for (const name of Object.keys(SIZES) as (keyof typeof SIZES)[]) {
        const [token, fallback] = SIZES[name];
        probe.style.inlineSize = `var(${token})`;
        const size = parseFloat(view?.getComputedStyle(probe).inlineSize ?? '');
        look[name] = Number.isFinite(size) ? size : fallback;
    }
    probe.remove();
    const style = view?.getComputedStyle(labels);
    const fontSize = parseFloat(style?.fontSize ?? '') || 12;
    const font = `${style?.fontStyle || 'normal'} ${style?.fontWeight || '400'} ${fontSize}px ${style?.fontFamily || 'sans-serif'}`;
    // A share, not a length: read as a number.
    const hole = parseFloat(view?.getComputedStyle(root).getPropertyValue('--_chart-donut-hole') ?? '');
    return { ...look, donutHole: Number.isFinite(hole) ? hole : 0.6, font, line: Math.round(fontSize * 1.34) };
}
