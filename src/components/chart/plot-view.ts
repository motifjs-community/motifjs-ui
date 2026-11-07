import type { ChartAxis } from './chart-axis';
import type { ChartLook } from './chart-look';
import type { ChartModel, ModelPoint, ModelSlot } from './chart-model';

/** What a plot is drawn from. */
export interface PlotInput {
    model: ChartModel;
    xAxis: ChartAxis;
    yAxis: ChartAxis;
    horizontal: boolean;
    rtl: boolean;
    width: number;
    height: number;
    look: ChartLook;
    locale: string;
}

/** A rectangle of the SVG. */
export interface Rect {
    left: number;
    top: number;
    width: number;
    height: number;
}

/** A class of a heat map: its values and its color. */
export interface HeatClass {
    from: number;
    to: number;
    color: string;
}

/**
 * The drawing of one family of charts in an SVG of its own: on two axes, as the parts of a whole, or around a center.
 * The chart talks to each the same way: it draws, finds what is under a place, and shows a position and a value.
 */
export interface PlotView {
    svg: SVGSVGElement;
    marks: SVGGElement;
    input: PlotInput | null;
    box: Rect;
    /** The positions in the order the keyboard walks them. */
    order: ModelSlot[];
    draw(input: PlotInput): void;
    find(x: number, y: number): { slot: ModelSlot; point: ModelPoint | null } | null;
    showActive(slot: ModelSlot | null, point: ModelPoint | null, crosshair: boolean): void;
    xText(key: unknown, tick?: boolean): string;
    valueText(point: ModelPoint): string;
    /** The color of a value: its series', its part's, or its class'. */
    markOfPoint(point: ModelPoint): string;
}
