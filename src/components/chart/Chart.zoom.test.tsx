import type { ComponentBase } from '@motifx/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mountHost } from '../../../tests/helpers';
import { measureNow } from '../../core/measure';
import { Chart } from './Chart';
import type { ChartProps } from './chart-props';

const hosts: ComponentBase[] = [];
function make(props: ChartProps): Chart {
    const chart = new Chart(props);
    hosts.push(mountHost(chart));
    chart.onMounted();
    measureNow(chart);
    return chart;
}
// The changes land, then the draw they asked for runs with the window's next frame, here at once.
const settle = async () => {
    await Promise.resolve().then(() => Promise.resolve());
    for (const host of hosts) if (!host.isDisposed) measureNow(host);
};
const $ = (chart: Chart, selector: string) => chart.element.querySelector(selector) as HTMLElement;
const $$ = (chart: Chart, selector: string) => [...chart.element.querySelectorAll(selector)] as HTMLElement[];
const key = (el: HTMLElement, name: string) => el.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true }));
const labels = (chart: Chart) => $$(chart, '.mx-chart__ticks text').map(t => t.textContent);

afterEach(async () => {
    for (const host of hosts.splice(0)) if (!host.isDisposed) await host.dispose();
});

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'].map((m, i) => ({ m, v: (i + 1) * 10 }));

describe('Chart, zoom', () => {
    it('shows the positions asked for, fits the values to them, and tells', async () => {
        const changed = vi.fn();
        const chart = make({ data: MONTHS, xField: 'm', zoom: true, series: [{ type: 'bar', yField: 'v' }], onZoomChanged: changed });
        chart.zoomTo('Mar', 'May');
        await settle();
        expect(changed.mock.calls[0][0]).toMatchObject({ from: 'Mar', to: 'May' });
        expect(labels(chart)).toContain('Mar');
        expect(labels(chart)).not.toContain('Jan');
        expect(labels(chart)).not.toContain('80');
        expect(chart.resetButton.element.hidden).toBe(false);
        chart.resetZoom();
        await settle();
        expect(changed.mock.calls[1][0]).toMatchObject({ from: null, to: null });
        expect(labels(chart)).toContain('Jan');
        expect(chart.resetButton.element.isConnected).toBe(false);
    });

    it('takes no zoom over the whole of the data', async () => {
        const changed = vi.fn();
        const chart = make({ data: MONTHS, xField: 'm', zoom: true, series: [{ yField: 'v' }], onZoomChanged: changed });
        chart.zoomTo('Jan', 'Aug');
        await settle();
        expect(changed).not.toHaveBeenCalled();
        expect(chart.zoomWindow).toBeNull();
    });

    it('zooms with + and -, and shows all again with 0', async () => {
        const chart = make({ data: MONTHS, xField: 'm', zoom: true, series: [{ yField: 'v' }] });
        const plot = $(chart, '.mx-chart__plot');
        key(plot, '+');
        await settle();
        expect(chart.zoomWindow).not.toBeNull();
        const width = chart.zoomWindow!.to - chart.zoomWindow!.from;
        key(plot, '+');
        await settle();
        expect(chart.zoomWindow!.to - chart.zoomWindow!.from).toBeLessThan(width);
        key(plot, '0');
        await settle();
        expect(chart.zoomWindow).toBeNull();
    });

    it('leaves the keys alone without zoom', async () => {
        const chart = make({ data: MONTHS, xField: 'm', series: [{ yField: 'v' }] });
        key($(chart, '.mx-chart__plot'), '+');
        await settle();
        expect(chart.zoomWindow).toBeNull();
    });

    it('follows the keyboard past the edge of the zoomed part', async () => {
        const chart = make({ data: MONTHS, xField: 'm', zoom: true, series: [{ yField: 'v' }] });
        chart.zoomTo('Jan', 'Mar');
        await settle();
        const plot = $(chart, '.mx-chart__plot');
        for (let i = 0; i < 3; i++) key(plot, 'ArrowRight');
        await settle();
        await settle();
        expect(chart.activeSlot?.key).toBe('Apr');
        expect(chart.zoomWindow).toEqual({ from: 1, to: 3 });
    });

    it('zooms a time axis by moments, and tells them as dates', async () => {
        const changed = vi.fn();
        const rows = Array.from({ length: 10 }, (_, i) => ({ t: new Date(2026, 0, i + 1), v: i }));
        const chart = make({ data: rows, xField: 't', zoom: true, series: [{ yField: 'v' }], onZoomChanged: changed });
        chart.zoomTo(new Date(2026, 0, 3), new Date(2026, 0, 6));
        await settle();
        expect(changed.mock.calls[0][0].from).toBeInstanceOf(Date);
        expect((changed.mock.calls[0][0].from as Date).getDate()).toBe(3);
    });

    it('follows live data with a span of the latest positions', () => {
        const rows = Array.from({ length: 100 }, (_, i) => ({ x: i, v: i }));
        const chart = make({ data: rows, xField: 'x', xAxis: { kind: 'linear', span: 10 }, series: [{ yField: 'v' }] });
        // The position axis only: the value axis may well start below the values, at a round number.
        const ticks = [...chart.cartesian.xLabels.part.element.querySelectorAll('text')].map(t => Number(t.textContent));
        expect(ticks.length).toBeGreaterThan(1);
        expect(Math.min(...ticks)).toBeGreaterThanOrEqual(89);
        expect(Math.max(...ticks)).toBeLessThanOrEqual(99);
        expect(chart.zoomWindow).toBeNull();
    });
});

describe('Chart, references and choices', () => {
    it('draws a line at a value and a band over positions, with their labels', () => {
        const chart = make({ data: MONTHS, xField: 'm', series: [{ type: 'bar', yField: 'v' }], references: [{ value: 40, label: 'Goal' }, { axis: 'x', from: 'Feb', to: 'Apr', label: 'Spring' }] });
        expect($(chart, '.mx-chart__reference').getAttribute('d')).toMatch(/^M/);
        expect($(chart, '.mx-chart__reference-band').getAttribute('d')).toMatch(/z$/);
        expect($$(chart, '.mx-chart__reference-label text').map(t => t.textContent)).toEqual(['Goal', 'Spring']);
    });

    it('chooses values one at a time, or several, and lets them go', () => {
        const changed = vi.fn();
        const chart = make({ data: MONTHS, xField: 'm', pointSelection: 'single', series: [{ type: 'bar', yField: 'v' }], onSelectionChanged: changed });
        const plot = $(chart, '.mx-chart__plot');
        key(plot, 'ArrowRight');
        key(plot, 'Enter');
        expect(changed.mock.calls[0][0].points.map((p: { x: unknown }) => p.x)).toEqual(['Feb']);
        expect($(chart, '.mx-chart__selected').getAttribute('d')).toBeTruthy();
        key(plot, 'ArrowRight');
        key(plot, 'Enter');
        expect(chart.selectedPoints.map(p => p.x)).toEqual(['Mar']);
        chart.pointSelection = 'multiple';
        key(plot, 'ArrowLeft');
        key(plot, 'Enter');
        expect(chart.selectedPoints.map(p => p.x)).toEqual(['Feb', 'Mar']);
        key(plot, 'Enter');
        expect(chart.selectedPoints.map(p => p.x)).toEqual(['Mar']);
        chart.clearSelection();
        expect(chart.selectedPoints).toEqual([]);
    });

    it('chooses nothing unless asked', () => {
        const changed = vi.fn();
        const chart = make({ data: MONTHS, xField: 'm', series: [{ type: 'bar', yField: 'v' }], onSelectionChanged: changed });
        key($(chart, '.mx-chart__plot'), 'Enter');
        expect(changed).not.toHaveBeenCalled();
    });
});
