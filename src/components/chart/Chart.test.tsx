import { reactive, type ComponentBase } from '@motifx/core';
import { data } from '@motifx-community/data';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mountHost } from '../../../tests/helpers';
import type { ResizeWatch } from '../../core/resize-watch';
import { uiLocale } from '../../core/ui-locale';
import { Chart } from './Chart';
import type { ChartProps } from './chart-props';

const hosts: ComponentBase[] = [];
const ROWS = [
    { month: 'Jan', a: 10, b: 30 },
    { month: 'Feb', a: 20, b: 10 },
    { month: 'Mar', a: 5, b: 15 }
];
const BARS = [{ type: 'bar', yField: 'a', name: 'A' }, { type: 'bar', yField: 'b', name: 'B' }] as const;

// What the page does a moment after a component arrives, here at once, so each test reads straight on.
function mount(chart: Chart): Chart {
    hosts.push(mountHost(chart));
    chart.onMounted();
    return chart;
}
const make = (props: ChartProps = {}) => mount(new Chart({ data: ROWS, xField: 'month', series: [...BARS], ...props }));
const settle = () => Promise.resolve().then(() => Promise.resolve());
const $ = (chart: Chart, selector: string) => chart.element.querySelector(selector) as HTMLElement;
const $$ = (chart: Chart, selector: string) => [...chart.element.querySelectorAll(selector)] as HTMLElement[];
const key = (el: HTMLElement, name: string) => el.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true }));

afterEach(async () => {
    for (const host of hosts.splice(0)) if (!host.isDisposed) await host.dispose();
});

describe('Chart', () => {
    it('names itself', () => {
        const chart = make({ title: 'Sales' });
        expect(chart.element.getAttribute('role')).toBe('figure');
        expect(chart.element.getAttribute('aria-label')).toBe('Sales');
        expect(make({ label: 'Own', title: 'Sales' }).element.getAttribute('aria-label')).toBe('Own');
        expect(make().element.getAttribute('aria-label')).toBe(uiLocale.strings.chartName);
    });

    it('hides its drawing from a screen reader, which walks the values instead', () => {
        const chart = make({ title: 'Sales' });
        expect($(chart, 'svg').getAttribute('aria-hidden')).toBe('true');
        const plot = $(chart, '.mx-chart__plot');
        expect(plot.tabIndex).toBe(0);
        expect(plot.getAttribute('aria-roledescription')).toBe(uiLocale.strings.chartRole);
    });

    it('draws one path per series, however many values', () => {
        const rows = Array.from({ length: 500 }, (_, i) => ({ month: `m${i}`, a: i, b: i }));
        const chart = make({ data: rows });
        expect($$(chart, '.mx-chart__bars')).toHaveLength(2);
    });

    it('takes the names that start with x from JSX too', () => {
        const chart = (<Chart data={ROWS} xField="month" xAxis={{ title: 'Month' }} yAxis={{ title: 'Sales' }} series={[{ type: 'bar', yField: 'a' }]} />) as unknown as Chart;
        mount(chart);
        expect(chart.xField).toBe('month');
        expect(chart.xAxis.title).toBe('Month');
        expect($$(chart, '.mx-chart__ticks text').map(t => t.textContent)).toContain('Jan');
        expect($$(chart, '.mx-chart__axis-title text').map(t => t.textContent)).toEqual(['Month', 'Sales']);
    });

    it('marks positions with the values of the field, not with row numbers', () => {
        const chart = make();
        const labels = $$(chart, '.mx-chart__ticks text').map(t => t.textContent);
        expect(labels).toContain('Jan');
        expect(labels).toContain('Mar');
    });

    it('has no legend for one series, and one for two', () => {
        const one = make({ series: [{ yField: 'a', name: 'A' }] });
        expect(one.element.hasAttribute('data-legend')).toBe(false);
        const two = make();
        expect(two.element.getAttribute('data-legend')).toBe('bottom');
        expect($$(two, '.mx-chart__legend-item').map(i => i.textContent)).toEqual(['A', 'B']);
    });

    it('follows the options of the legend', () => {
        expect(make({ legend: false }).element.hasAttribute('data-legend')).toBe(false);
        expect(make({ legend: { position: 'end' } }).element.getAttribute('data-legend')).toBe('end');
        expect(make({ legend: { visible: true }, series: [{ yField: 'a' }] }).element.getAttribute('data-legend')).toBe('bottom');
        expect($$(make({ series: [{ yField: 'a', legend: false }, { yField: 'b', name: 'B' }] }), '.mx-chart__legend-item')).toHaveLength(1);
    });

    it('hides a series from the legend, keeps the other color, and tells', async () => {
        const toggled = vi.fn();
        const chart = make({ onSeriesToggled: toggled });
        const other = (chart.plot.parts[1].group as SVGGElement).style.getPropertyValue('--_mark');
        const item = $$(chart, '.mx-chart__legend-item')[0];
        expect(item.getAttribute('aria-pressed')).toBe('true');
        item.click();
        await settle();
        expect(item.getAttribute('aria-pressed')).toBe('false');
        expect(item.hasAttribute('data-off')).toBe(true);
        expect(chart.isSeriesVisible(0)).toBe(false);
        expect(toggled.mock.calls[0][0].visible).toBe(false);
        expect((chart.plot.parts[1].group as SVGGElement).style.getPropertyValue('--_mark')).toBe(other);
        expect(chart.plot.parts[0].group.style.display).toBe('none');
    });

    it('can keep the legend from hiding anything', () => {
        const chart = make({ legend: { toggle: false } });
        const item = $$(chart, '.mx-chart__legend-item')[0] as HTMLButtonElement;
        expect(item.disabled).toBe(true);
        expect(item.hasAttribute('aria-pressed')).toBe(false);
    });

    it('takes one Tab stop in the legend, and the arrows walk it', () => {
        const chart = make();
        const items = $$(chart, '.mx-chart__legend-item');
        expect(items.map(i => i.tabIndex)).toEqual([0, -1]);
        items[0].focus();
        key(items[0], 'ArrowRight');
        expect(items.map(i => i.tabIndex)).toEqual([-1, 0]);
        expect(document.activeElement).toBe(items[1]);
    });

    it('walks the values with the keyboard and says each one', async () => {
        const focused = vi.fn();
        const chart = make({ onPointFocused: focused });
        const plot = $(chart, '.mx-chart__plot');
        key(plot, 'ArrowRight');
        expect(chart.activeSlot?.key).toBe('Feb');
        expect($(chart, '[role="status"]').textContent).toContain('A');
        expect($(chart, '[role="status"]').textContent).toContain('Feb');
        expect($(chart, '[role="status"]').textContent).toContain('20');
        expect(focused).toHaveBeenCalledTimes(1);
        expect(focused.mock.calls[0][0].point.y).toBe(20);
        expect(focused.mock.calls[0][0].point.row).toBe(ROWS[1]);
        key(plot, 'ArrowUp');
        expect(chart.activePoint?.series).toBe(1);
        key(plot, 'ArrowRight');
        expect(chart.activeSlot?.key).toBe('Mar');
        expect(chart.activePoint?.series).toBe(1);
        key(plot, 'Home');
        expect(chart.activeSlot?.key).toBe('Jan');
        key(plot, 'End');
        expect(chart.activeSlot?.key).toBe('Mar');
        key(plot, 'Escape');
        expect(chart.activeSlot).toBeNull();
    });

    it('stops at the ends instead of coming round', () => {
        const chart = make();
        const plot = $(chart, '.mx-chart__plot');
        key(plot, 'ArrowLeft');
        expect(chart.activeSlot?.key).toBe('Jan');
    });

    it('turns the arrows with a chart on its side', () => {
        const chart = make({ horizontal: true });
        const plot = $(chart, '.mx-chart__plot');
        key(plot, 'ArrowDown');
        expect(chart.activeSlot?.key).toBe('Feb');
        key(plot, 'ArrowRight');
        expect(chart.activePoint?.series).toBe(1);
    });

    it('raises a click on Enter', () => {
        const click = vi.fn();
        const chart = make({ onPointClick: click });
        key($(chart, '.mx-chart__plot'), 'Enter');
        expect(click.mock.calls[0][0].point.series).toBe('A');
    });

    it('lists every series in the tooltip, value first', () => {
        const chart = make();
        key($(chart, '.mx-chart__plot'), 'ArrowRight');
        const tip = $(chart, '.mx-chart__tooltip');
        expect(tip.hidden).toBe(false);
        expect($$(chart, '.mx-chart__tooltip-title')[0].textContent).toBe('Feb');
        const rows = $$(chart, '.mx-chart__tooltip-row');
        expect(rows).toHaveLength(2);
        expect(rows[0].children[1].textContent).toBe('20');
        expect(rows[0].children[2].textContent).toBe('A');
        expect(tip.getAttribute('aria-hidden')).toBe('true');
    });

    it('writes names from data as text', () => {
        const chart = make({ series: [{ yField: 'a', name: '<img src=x onerror=alert(1)>' }] });
        key($(chart, '.mx-chart__plot'), 'ArrowRight');
        expect(chart.element.querySelector('.mx-chart__tooltip img')).toBeNull();
    });

    it('follows the options of the tooltip', () => {
        const none = make({ tooltip: false });
        key($(none, '.mx-chart__plot'), 'ArrowRight');
        expect($(none, '.mx-chart__tooltip').hidden).toBe(true);

        const single = make({ tooltip: { shared: false } });
        key($(single, '.mx-chart__plot'), 'ArrowRight');
        expect($$(single, '.mx-chart__tooltip-row')).toHaveLength(1);

        const own = make({ tooltip: { format: c => `Here: ${c.title}` } });
        key($(own, '.mx-chart__plot'), 'ArrowRight');
        expect($(own, '.mx-chart__tooltip').textContent).toBe('Here: Feb');

        const left = make({ series: [{ yField: 'a', name: 'A' }, { yField: 'b', name: 'B', tooltip: false }] });
        key($(left, '.mx-chart__plot'), 'ArrowRight');
        expect($$(left, '.mx-chart__tooltip-row')).toHaveLength(1);
    });

    it('turns into a table of the same values and back', async () => {
        const changed = vi.fn();
        const chart = make({ onModeChanged: changed });
        const button = $(chart, '.mx-chart__tools button');
        button.click();
        await settle();
        expect(chart.element.getAttribute('data-mode')).toBe('table');
        expect(changed.mock.calls[0][0].mode).toBe('table');
        const cells = $$(chart, '.mx-chart__table tbody tr')[1].children;
        expect([...cells].map(c => c.textContent)).toEqual(['Feb', '20', '10']);
        expect($$(chart, '.mx-chart__table thead th').map(c => c.textContent)).toEqual([uiLocale.strings.chartPosition, 'A', 'B']);
        expect($(chart, '.mx-chart__area-box').hidden).toBe(true);
        button.click();
        await settle();
        expect(chart.mode).toBe('chart');
        expect($(chart, '.mx-chart__table').hidden).toBe(true);
    });

    it('can open as a table, and leave the button out', () => {
        const chart = make({ mode: 'table', tableButton: false });
        expect($$(chart, '.mx-chart__table td').length).toBeGreaterThan(0);
        expect($(chart, '.mx-chart__tools').hidden).toBe(true);
    });

    it('writes the mode back to its model', async () => {
        const s = reactive({ mode: 'chart' });
        const chart = make({ mode: () => s.mode as 'chart' });
        chart.mode = 'table';
        await settle();
        expect(chart.element.getAttribute('data-mode')).toBe('table');
    });

    it('says when there is nothing to draw', () => {
        const chart = make({ data: [] });
        expect($(chart, '.mx-chart__message').textContent).toBe(uiLocale.strings.chartEmpty);
        expect(chart.element.hasAttribute('data-empty')).toBe(true);
        expect($(make({ data: [], emptyText: 'Nothing yet' }), '.mx-chart__message').textContent).toBe('Nothing yet');
    });

    it('holds its marks while loading, and says nothing is missing only once it knows', async () => {
        const chart = make({ data: [], loading: true });
        expect(chart.element.hasAttribute('data-loading')).toBe(true);
        expect(chart.element.getAttribute('aria-busy')).toBe('true');
        expect($(chart, '.mx-chart__message').hidden).toBe(true);
        chart.loading = false;
        await settle();
        expect(chart.element.hasAttribute('data-loading')).toBe(false);
        expect($(chart, '.mx-chart__message').hidden).toBe(false);
    });

    it('follows reactive data through a function', async () => {
        const s = reactive({ rows: ROWS.slice(0, 2) });
        const chart = make({ data: () => s.rows });
        expect(chart.model?.categories).toHaveLength(2);
        s.rows = ROWS;
        await settle();
        await settle();
        expect(chart.model?.categories).toHaveLength(3);
    });

    it('takes plain rows changed in place through refresh and reState', async () => {
        const rows = [...ROWS];
        const chart = make({ data: rows });
        rows.push({ month: 'Apr', a: 1, b: 1 });
        chart.refresh();
        await settle();
        expect(chart.model?.categories).toHaveLength(4);
        rows.push({ month: 'May', a: 1, b: 1 });
        chart.reState();
        await settle();
        expect(chart.model?.categories).toHaveLength(5);
    });

    it('draws several changes at once as one', async () => {
        const chart = make();
        const draw = vi.spyOn(chart, 'draw');
        chart.title = 'One';
        chart.subtitle = 'Two';
        chart.horizontal = true;
        await settle();
        expect(draw).toHaveBeenCalledTimes(1);
    });

    it('never changes the rows it is given', () => {
        const rows = [{ month: 'Feb', a: 2, b: 1 }, { month: 'Jan', a: 1, b: 2 }];
        const copy = JSON.stringify(rows);
        make({ data: rows, stacked: 'normal' });
        expect(JSON.stringify(rows)).toBe(copy);
    });

    it('follows a data source and its loading', async () => {
        const source = new data.DataSource({ adapter: new data.ArrayAdapter({ data: ROWS, key: 'month' }) });
        const chart = make({ data: undefined, dataSource: source });
        await source.load();
        await settle();
        expect(chart.model?.categories).toHaveLength(3);
    });

    it('stops listening to a source when it goes', async () => {
        const source = new data.DataSource({ adapter: new data.ArrayAdapter({ data: ROWS, key: 'month' }) });
        const chart = make({ data: undefined, dataSource: source });
        await source.load();
        await settle();
        await chart.dispose();
        const draw = vi.spyOn(chart, 'draw');
        await source.reload();
        await settle();
        expect(draw).not.toHaveBeenCalled();
    });

    it('reads in the language of the kit', async () => {
        const rows = [{ k: 'a', v: 1234.5 }];
        const chart = make({ data: rows, xField: 'k', series: [{ yField: 'v' }], mode: 'table' });
        expect($(chart, '.mx-chart__table td').textContent).toBe(new Intl.NumberFormat(uiLocale.locale).format(1234.5));
    });

    it('takes a format of the series over the axis', () => {
        const chart = make({ mode: 'table', yAxis: { format: v => `axis ${v}` }, series: [{ yField: 'a', name: 'A', format: { style: 'currency', currency: 'EUR' } }] });
        expect($(chart, '.mx-chart__table td').textContent).toContain('10');
        expect($(chart, '.mx-chart__table td').textContent).not.toContain('axis');
    });

    it('writes a bubble size in the table too', () => {
        const rows = [{ x: 1, y: 2, s: 9 }];
        const chart = make({ data: rows, xField: 'x', mode: 'table', series: [{ type: 'bubble', yField: 'y', sizeField: 's', name: 'B' }] });
        expect($(chart, '.mx-chart__table td').textContent).toBe('2 (9)');
    });

    it('breaks a line at an empty value', () => {
        const rows = [{ k: 'a', v: 1 }, { k: 'b', v: 2 }, { k: 'c', v: null }, { k: 'd', v: 4 }, { k: 'e', v: 5 }];
        const chart = make({ data: rows, xField: 'k', series: [{ yField: 'v' }] });
        expect(chart.plot.parts[0].line.getAttribute('d')?.match(/M/g)).toHaveLength(2);
        const joined = make({ data: rows, xField: 'k', series: [{ yField: 'v', gaps: 'connect' }] });
        expect(joined.plot.parts[0].line.getAttribute('d')?.match(/M/g)).toHaveLength(1);
    });

    it('shows a value alone between gaps as a dot', () => {
        const rows = [{ k: 'a', v: null }, { k: 'b', v: 2 }, { k: 'c', v: null }];
        const chart = make({ data: rows, xField: 'k', series: [{ yField: 'v' }] });
        expect(chart.plot.parts[0].dots.getAttribute('d')).toContain('a');
    });

    it('thins a long line to the width, and keeps every value to read', () => {
        const rows = Array.from({ length: 20000 }, (_, i) => ({ k: i, v: Math.sin(i / 50) }));
        const chart = make({ data: rows, xField: 'k', series: [{ yField: 'v' }] });
        expect(chart.plot.parts[0].line.getAttribute('d')?.match(/L/g)?.length).toBeLessThan(2000);
        expect(chart.model?.slots).toHaveLength(20000);
    });

    it('writes a label on the chosen values only', () => {
        const count = (labels: 'last' | 'extremes' | 'all') => $$(make({ series: [{ type: 'bar', yField: 'a', labels }] }), '.mx-chart__labels text').length;
        expect(count('last')).toBe(1);
        expect(count('extremes')).toBe(2);
        expect(count('all')).toBe(3);
    });

    it('keeps room for the label of the tallest bar, which reaches the top of the axis', () => {
        const rows = [{ k: 'a', v: 100 }, { k: 'b', v: 50 }];
        const chart = make({ data: rows, xField: 'k', series: [{ type: 'bar', yField: 'v', labels: 'all' }] });
        expect($$(chart, '.mx-chart__labels text').map(t => t.textContent)).toEqual(['100', '50']);
    });

    it('pulls a label at the far edge back inside', () => {
        const rows = [{ d: new Date(2026, 0, 1), v: 1000000 }, { d: new Date(2026, 0, 31), v: 2000000 }];
        const chart = make({ data: rows, xField: 'd', series: [{ yField: 'v', labels: 'last' }] });
        expect($(chart, '.mx-chart__labels text').getAttribute('text-anchor')).toBe('end');
    });

    it('fixes the axis where it is told', () => {
        const chart = make({ yAxis: { min: 0, max: 100, tickCount: 4 } });
        const labels = $$(chart, '.mx-chart__ticks text').map(t => t.textContent);
        expect(labels).toContain('100');
        expect(labels).toContain('0');
    });

    it('draws shares of a hundred on a percent axis', () => {
        const chart = make({ stacked: 'percent' });
        expect($$(chart, '.mx-chart__ticks text').some(t => t.textContent?.includes('%'))).toBe(true);
    });

    it('turns what an axis should not show off', () => {
        const chart = make({ yAxis: { visible: false }, xAxis: { visible: false } });
        expect($$(chart, '.mx-chart__ticks text')).toHaveLength(0);
    });

    it('sets a height of its own', () => {
        expect(make({ height: 200 }).element.style.getPropertyValue('--_height')).toBe('200px');
    });

    it('stays still on a chart with no values', () => {
        const chart = make({ data: [] });
        expect(key($(chart, '.mx-chart__plot'), 'ArrowRight')).toBe(true);
        expect(chart.plot.find(10, 10)).toBeNull();
    });

    it('stops watching its size when it goes', async () => {
        const chart = make();
        const stop = vi.spyOn(chart.watch as ResizeWatch, 'disconnect');
        await chart.dispose();
        expect(stop).toHaveBeenCalled();
    });
});
