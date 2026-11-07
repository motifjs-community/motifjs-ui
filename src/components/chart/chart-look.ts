import type { TokenLengths } from "../../parts/chart/token-lengths";

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

/** The donut's hole is a share, not a length: its probe measures it as thousandths of a pixel. */
const HOLE = 'calc(var(--_chart-donut-hole) * 1000px)';

/** What the chart's probes measure (see `TokenLengths`). */
export const LOOK_TOKENS: readonly string[] = [...Object.values(SIZES).map(([token]) => token), HOLE];

/**
 * The look as it stands on `root`. Tokens may be in `rem`: the probes turn each into pixels, which the geometry needs.
 * The numbers here only stand where nothing is laid out, as in a test without a browser.
 */
export function readLook(root: HTMLElement, labels: Element, lengths: TokenLengths): ChartLook {
    const view = root.ownerDocument.defaultView;
    const look = {} as Record<keyof typeof SIZES, number>;
    for (const name of Object.keys(SIZES) as (keyof typeof SIZES)[]) {
        const [token, fallback] = SIZES[name];
        look[name] = lengths.get(token, fallback);
    }
    const style = view?.getComputedStyle(labels);
    const fontSize = parseFloat(style?.fontSize ?? '') || 12;
    const font = `${style?.fontStyle || 'normal'} ${style?.fontWeight || '400'} ${fontSize}px ${style?.fontFamily || 'sans-serif'}`;
    return { ...look, donutHole: lengths.get(HOLE, 600) / 1000, font, line: Math.round(fontSize * 1.34) };
}
