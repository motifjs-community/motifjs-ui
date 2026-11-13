import type { ChartLook } from './chart-look';

/** What a chart reads before its plot draws: the room the plot has, its look, the color behind it and its direction. */
export interface PlotRoom {
    width: number;
    height: number;
    look: ChartLook;
    surface: string;
    rtl: boolean;
}
