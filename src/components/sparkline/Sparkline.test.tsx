import { reactive, type ComponentBase } from '@motifx/core';
import { afterEach, describe, expect, it } from 'vitest';
import { mountHost } from '../../../tests/helpers';
import { measureNow } from '../../core/measure';
import { Sparkline } from './Sparkline';
import type { SparklineProps } from './sparkline-props';

const hosts: ComponentBase[] = [];
function make(props: SparklineProps): Sparkline {
    const spark = new Sparkline(props);
    hosts.push(mountHost(spark));
    spark.refresh();
    measureNow(spark);
    return spark;
}
const settle = () => Promise.resolve().then(() => Promise.resolve());
const d = (spark: Sparkline, selector: string) => spark.element.querySelector(selector)?.getAttribute('d') ?? null;

afterEach(async () => {
    for (const host of hosts.splice(0)) if (!host.isDisposed) await host.dispose();
});

describe('Sparkline', () => {
    it('is an image whose name sums the values up', () => {
        const spark = make({ data: [4, 9, 2, 7], label: 'Visits' });
        expect(spark.element.getAttribute('role')).toBe('img');
        const name = spark.element.getAttribute('aria-label') ?? '';
        expect(name).toContain('Visits');
        expect(name).toContain('4');
        expect(name).toContain('7');
        expect(name).toMatch(/2.*9/);
    });

    it('draws a line, and marks the last value by default', () => {
        const spark = make({ data: [1, 3, 2] });
        expect(d(spark, '.mx-sparkline__line')).toMatch(/^M.*L.*L/);
        expect(d(spark, '.mx-sparkline__dot')?.match(/M/g)).toHaveLength(1);
    });

    it('marks the values asked for', () => {
        const spark = make({ data: [5, 1, 9, 4], highlight: ['min', 'max', 'last'] });
        expect(d(spark, '.mx-sparkline__dot')?.match(/M/g)).toHaveLength(3);
        expect(make({ data: [5, 1], highlight: [] }).element.querySelector('.mx-sparkline__dot')?.getAttribute('d')).toBeFalsy();
    });

    it('reads rows through a field, and leaves the rows as they are', () => {
        const rows = [{ v: 2 }, { v: 8 }];
        const copy = JSON.stringify(rows);
        const spark = make({ data: rows, yField: 'v', label: 'Sales' });
        expect(spark.element.getAttribute('aria-label')).toContain('8');
        expect(JSON.stringify(rows)).toBe(copy);
    });

    it('breaks a line at an empty value', () => {
        const spark = make({ data: [1, 2, null, 4, 5] });
        expect(d(spark, '.mx-sparkline__line')?.match(/M/g)).toHaveLength(2);
    });

    it('draws bars from zero, and wins and losses apart', () => {
        const bars = make({ type: 'bar', data: [3, -2, 4] });
        expect(d(bars, '.mx-sparkline__area')?.match(/M/g)).toHaveLength(3);
        expect(bars.element.getAttribute('data-type')).toBe('bar');
        const results = make({ type: 'winloss', data: [1, -1, 1, 0] });
        expect(d(results, '.mx-sparkline__rise')?.match(/M/g)).toHaveLength(2);
        expect(d(results, '.mx-sparkline__fall')?.match(/M/g)).toHaveLength(1);
    });

    it('draws a line at the average', () => {
        const spark = make({ data: [0, 10], reference: 'average' });
        expect(d(spark, '.mx-sparkline__reference')).toMatch(/^M0 /);
    });

    it('follows reactive data through a function', async () => {
        const s = reactive({ values: [1, 2] });
        const spark = make({ data: () => s.values, label: 'Trend' });
        s.values = [1, 2, 30];
        await settle();
        await settle();
        // The new values are drawn in the next measuring round.
        measureNow(spark);
        expect(spark.element.getAttribute('aria-label')).toContain('30');
    });

    it('draws nothing without values, and says only its name', () => {
        const spark = make({ data: [], label: 'Empty' });
        expect(d(spark, '.mx-sparkline__line')).toBeNull();
        expect(spark.element.getAttribute('aria-label')).toBe('Empty');
    });

    it('shows the value under the pointer', () => {
        const spark = make({ data: [1, 50, 2] });
        spark.element.dispatchEvent(new PointerEvent('pointermove', { clientX: 48, bubbles: true }));
        const tip = spark.element.querySelector('.mx-sparkline__tip') as HTMLElement;
        expect(tip.hidden).toBe(false);
        expect(tip.textContent).toBe('50');
        spark.element.dispatchEvent(new PointerEvent('pointerleave'));
        expect(tip.hidden).toBe(true);
    });
});
