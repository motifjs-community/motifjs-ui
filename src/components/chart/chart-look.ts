import type { ComponentBase } from '@motifx/core';
import { lengthOf, styleOf } from '../../core/measure';

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

/** What the chart's probes measure (see `probeLengths`). */
export const LOOK_TOKENS: readonly string[] = [...Object.values(SIZES).map(([token]) => token), HOLE];

const FONT = ['font-style', 'font-weight', 'font-size', 'font-family'] as const;

/**
 * The look as it stands on `chart`, read in a read of the measuring layer: `labels` is the part whose style gives the
 * font of the axis labels. Tokens may be in `rem`: the chart's probes (`probeLengths(chart, LOOK_TOKENS)`) turn each
 * into pixels, which the geometry needs. The numbers here only stand where nothing is laid out, as in a test without a
 * browser.
 */
export function readLook(chart: ComponentBase, labels: ComponentBase): ChartLook {
    const look = {} as Record<keyof typeof SIZES, number>;
    for (const name of Object.keys(SIZES) as (keyof typeof SIZES)[]) {
        const [token, fallback] = SIZES[name];
        look[name] = lengthOf(chart, token, fallback);
    }
    const style = styleOf(labels, FONT);
    const fontSize = parseFloat(style['font-size']) || 12;
    const font = `${style['font-style'] || 'normal'} ${style['font-weight'] || '400'} ${fontSize}px ${style['font-family'] || 'sans-serif'}`;
    return { ...look, donutHole: lengthOf(chart, HOLE, 600) / 1000, font, line: Math.round(fontSize * 1.34) };
}
