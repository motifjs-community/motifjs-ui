import { uiLocale } from '../../core/ui-locale';
import { formatDate, formatNumber } from '../../parts/chart/chart-text';
import type { ModelPoint } from './chart-model';
import type { PlotInput } from './plot-view';

/** A position, as it reads: a date, a number or a name. `tick` is the short form of an axis. */
export function positionText(input: PlotInput, key: unknown, tickFormat?: Intl.DateTimeFormatOptions): string {
    const { model, xAxis, locale } = input;
    const format = xAxis.format;
    if (key instanceof Date || model.kind === 'time') {
        const time = key instanceof Date ? key : new Date(Number(key));
        return formatDate(time, format, locale, tickFormat ?? { dateStyle: 'medium' });
    }
    if (typeof key === 'number') return formatNumber(key, format, locale, { useGrouping: model.kind !== 'category' });
    return typeof format === 'function' ? format(key) : String(key ?? '');
}

/** A row of a heat map, as it reads. */
export function laneText(input: PlotInput, lane: number): string {
    const key = input.model.lanes[lane];
    if (key instanceof Date) return formatDate(key, input.yAxis.format, input.locale, { dateStyle: 'medium' });
    return typeof input.yAxis.format === 'function' ? input.yAxis.format(key) : String(key ?? '');
}

/** A value, as it reads for its type: a range, four prices, a change, or a number. */
export function pointText(input: PlotInput, point: ModelPoint): string {
    const { model, yAxis, locale } = input;
    const series = model.series[point.series];
    const format = series.source.format ?? yAxis.format;
    const number = (value: number | null, options?: Intl.NumberFormatOptions) => formatNumber(value ?? 0, format, locale, options);
    switch (series.type) {
        case 'rangeArea':
        case 'rangeBar':
            return uiLocale.text('chartRange', { low: number(point.low), high: number(point.high) });
        case 'candlestick':
        case 'ohlc':
            return uiLocale.text('chartPrices', { open: number(point.open), high: number(point.high), low: number(point.low), close: number(point.close) });
        case 'waterfall':
            return point.kind === 'total' ? number(point.y) : number(point.y, { signDisplay: 'exceptZero' });
        case 'heatmap':
            return formatNumber(point.heat ?? 0, series.source.format ?? input.yAxis.format, locale);
        default:
            return number(point.y);
    }
}

/** A share of a whole, as it reads. */
export function shareText(locale: string, share: number): string {
    return new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: share < 0.1 ? 1 : 0 }).format(share);
}
