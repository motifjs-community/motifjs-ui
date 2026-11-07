import type { ComponentBase } from '@motifx/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mountHost } from '../../../tests/helpers';
import { Chart } from './Chart';
import type { ChartProps } from './chart-props';
import { PartsPlot } from './PartsPlot';
import { RadarPlot } from './RadarPlot';

const hosts: ComponentBase[] = [];
function make(props: ChartProps): Chart {
    const chart = new Chart(props);
    hosts.push(mountHost(chart));
    chart.onMounted();
    return chart;
}
const settle = () => Promise.resolve().then(() => Promise.resolve());
const $ = (chart: Chart, selector: string) => chart.element.querySelector(selector) as HTMLElement;
const $$ = (chart: Chart, selector: string) => [...chart.element.querySelectorAll(selector)] as HTMLElement[];
const key = (el: HTMLElement, name: string) => el.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true }));

afterEach(async () => {
    for (const host of hosts.splice(0)) if (!host.isDisposed) await host.dispose();
});

const SHARES = [{ k: 'Search', v: 50 }, { k: 'Direct', v: 30 }, { k: 'Email', v: 20 }];

describe('Chart, the parts of a whole', () => {
    it('draws a slice for each part, on a plot of its own', () => {
        const chart = make({ data: SHARES, xField: 'k', series: [{ type: 'pie', yField: 'v', name: 'Visits' }] });
        expect(chart.plot).toBeInstanceOf(PartsPlot);
        expect($$(chart, '.mx-chart__slice')).toHaveLength(3);
        expect((chart.cartesian.svg as unknown as HTMLElement).style.display).toBe('none');
    });

    it('lists the parts in the legend, even for one series, and keeps their colors when one is hidden', async () => {
        const toggled = vi.fn();
        const chart = make({ data: SHARES, xField: 'k', series: [{ type: 'pie', yField: 'v' }], onSeriesToggled: toggled });
        expect(chart.element.getAttribute('data-legend')).toBe('bottom');
        const items = $$(chart, '.mx-chart__legend-item');
        expect(items.map(i => i.textContent)).toEqual(['Search', 'Direct', 'Email']);
        const color = $$(chart, '.mx-chart__slice')[2].style.getPropertyValue('--_mark');
        items[0].click();
        await settle();
        expect(toggled.mock.calls[0][0].part).toBe(0);
        expect(toggled.mock.calls[0][0].visible).toBe(false);
        expect($$(chart, '.mx-chart__slice')).toHaveLength(2);
        expect($$(chart, '.mx-chart__slice')[1].style.getPropertyValue('--_mark')).toBe(color);
    });

    it('writes the shares on the slices with room, and the total in a donut', () => {
        const chart = make({ data: SHARES, xField: 'k', series: [{ type: 'donut', yField: 'v', name: 'Visits' }] });
        expect($$(chart, '.mx-chart__labels text').map(t => t.textContent)).toContain('50%');
        expect($(chart, '.mx-chart__center-value').textContent).toBe('100');
        expect($(chart, '.mx-chart__center-label').textContent).toBe('Visits');
    });

    it('walks the parts with the keyboard and names each share', () => {
        const chart = make({ data: SHARES, xField: 'k', series: [{ type: 'pie', yField: 'v' }] });
        const plot = $(chart, '.mx-chart__plot');
        key(plot, 'ArrowRight');
        expect(chart.activeSlot?.key).toBe('Direct');
        expect($$(chart, '.mx-chart__tooltip-row')).toHaveLength(1);
        expect($(chart, '.mx-chart__tooltip-value').textContent).toBe('30 · 30%');
        expect($(chart, '.mx-chart__active-slice').getAttribute('d')).toBeTruthy();
    });

    it('lists the parts with their shares in the table', () => {
        const chart = make({ data: SHARES, xField: 'k', mode: 'table', series: [{ type: 'pie', yField: 'v', name: 'Visits' }] });
        expect([...$$(chart, '.mx-chart__table tbody tr')[0].children].map(c => c.textContent)).toEqual(['Search', '50', '50%']);
    });

    it('stacks a funnel in the order of the rows, with what is left of the first stage', () => {
        const rows = [{ k: 'Visit', v: 1000 }, { k: 'Cart', v: 400 }, { k: 'Paid', v: 100 }];
        const chart = make({ data: rows, xField: 'k', series: [{ type: 'funnel', yField: 'v' }] });
        expect($$(chart, '.mx-chart__slice')).toHaveLength(3);
        const texts = $$(chart, '.mx-chart__labels text').map(t => t.textContent);
        expect(texts.some(t => t?.includes('40%'))).toBe(true);
        const marks = $$(chart, '.mx-chart__slice').map(s => s.style.getPropertyValue('--_mark'));
        expect(new Set(marks).size).toBe(3);
    });
});

describe('Chart, around a center', () => {
    it('draws a radar shape for each series', () => {
        const rows = [{ k: 'a', x: 1, y: 3 }, { k: 'b', x: 2, y: 2 }, { k: 'c', x: 3, y: 1 }];
        const chart = make({ data: rows, xField: 'k', series: [{ type: 'radar', yField: 'x' }, { type: 'radar', yField: 'y' }] });
        expect(chart.plot).toBeInstanceOf(RadarPlot);
        expect($$(chart, '.mx-chart__series')).toHaveLength(2);
        expect($(chart, '.mx-chart__line').getAttribute('d')).toMatch(/Z$/);
        key($(chart, '.mx-chart__plot'), 'ArrowRight');
        expect(chart.activeSlot?.key).toBe('b');
    });
});

describe('Chart, more types on two axes', () => {
    it('colors heat map cells in steps, and lists the steps in the legend', () => {
        const rows = Array.from({ length: 12 }, (_, i) => ({ k: `c${i % 4}`, r: `r${Math.floor(i / 4)}`, v: i * 10 }));
        const chart = make({ data: rows, xField: 'k', series: [{ type: 'heatmap', yField: 'r', valueField: 'v' }] });
        const cells = $$(chart, '.mx-chart__cell');
        expect(cells.length).toBeGreaterThan(1);
        expect(cells.length).toBeLessThanOrEqual(7);
        const entries = $$(chart, '.mx-chart__legend-item');
        expect(entries).toHaveLength(7);
        expect((entries[0] as HTMLButtonElement).disabled).toBe(true);
        expect($$(chart, '.mx-chart__ticks text').map(t => t.textContent)).toContain('r2');
    });

    it('takes two hues for a heat map across zero', () => {
        const rows = [{ k: 'a', r: 'x', v: -10 }, { k: 'b', r: 'x', v: 10 }];
        const chart = make({ data: rows, xField: 'k', series: [{ type: 'heatmap', yField: 'r', valueField: 'v' }] });
        const marks = $$(chart, '.mx-chart__cell').map(c => c.style.getPropertyValue('--_mark')).join(' ');
        expect(marks).toContain('scale-negative');
        expect(marks).toContain('scale-positive');
    });

    it('lays a heat map out as a grid in the table', () => {
        const rows = [{ k: 'a', r: 'x', v: 1 }, { k: 'b', r: 'x', v: 2 }, { k: 'a', r: 'y', v: 3 }];
        const chart = make({ data: rows, xField: 'k', mode: 'table', series: [{ type: 'heatmap', yField: 'r', valueField: 'v' }] });
        const body = $$(chart, '.mx-chart__table tbody tr').map(tr => [...tr.children].map(c => c.textContent));
        expect(body).toEqual([['x', '1', '2'], ['y', '3', '']]);
    });

    it('draws rising candles apart from falling ones, and names the four prices', () => {
        const rows = [{ k: 'a', o: 10, h: 15, l: 8, c: 12 }, { k: 'b', o: 12, h: 13, l: 6, c: 7 }];
        const chart = make({ data: rows, xField: 'k', series: [{ type: 'candlestick', openField: 'o', highField: 'h', lowField: 'l', closeField: 'c' }] });
        expect($(chart, '.mx-chart__rise').getAttribute('d')).toBeTruthy();
        expect($(chart, '.mx-chart__fall').getAttribute('d')).toBeTruthy();
        key($(chart, '.mx-chart__plot'), 'ArrowRight');
        expect($(chart, '[role="status"]').textContent).toContain('12');
        expect($(chart, '.mx-chart__tooltip-value').textContent).toMatch(/12.*13.*6.*7/);
    });

    it('draws a waterfall with its steps up and down, totals and the line between them', () => {
        const rows = [{ k: 'a', v: 10 }, { k: 'b', v: -4 }, { k: 'c', t: true }];
        const chart = make({ data: rows, xField: 'k', mode: 'table', series: [{ type: 'waterfall', yField: 'v', totalField: 't' }] });
        expect($$(chart, '.mx-chart__table tbody td').map(c => c.textContent)).toEqual(['+10', '-4', '6']);
        chart.mode = 'chart';
    });

    it('draws a range as a band between its ends', () => {
        const rows = [{ k: 'a', lo: 1, hi: 5 }, { k: 'b', lo: 2, hi: 6 }];
        const chart = make({ data: rows, xField: 'k', series: [{ type: 'rangeArea', lowField: 'lo', highField: 'hi' }] });
        expect($(chart, '.mx-chart__area').getAttribute('d')).toMatch(/Z$/);
        key($(chart, '.mx-chart__plot'), 'ArrowRight');
        expect($(chart, '.mx-chart__tooltip-value').textContent).toBe('2 – 6');
    });
});
