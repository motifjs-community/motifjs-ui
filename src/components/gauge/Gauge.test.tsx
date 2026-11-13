import { reactive, type ComponentBase } from '@motifx/core';
import { afterEach, describe, expect, it } from 'vitest';
import { mountHost } from '../../../tests/helpers';
import { measureNow } from '../../core/measure';
import { Gauge } from './Gauge';
import type { GaugeProps } from './gauge-props';

const hosts: ComponentBase[] = [];
function make(props: GaugeProps): Gauge {
    const gauge = new Gauge(props);
    hosts.push(mountHost(gauge));
    gauge.onMounted();
    measureNow(gauge);
    return gauge;
}
const settle = () => Promise.resolve().then(() => Promise.resolve());
const $ = (gauge: Gauge, selector: string) => gauge.element.querySelector(selector) as HTMLElement;

afterEach(async () => {
    for (const host of hosts.splice(0)) if (!host.isDisposed) await host.dispose();
});

const RANGES = [
    { from: 0, to: 70, tone: 'good' as const, label: 'normal' },
    { from: 70, to: 90, tone: 'warning' as const, label: 'high' },
    { from: 90, to: 100, tone: 'danger' as const, label: 'critical' }
];

describe('Gauge', () => {
    it('is a meter with its value and scale', () => {
        const gauge = make({ value: 42, label: 'CPU' });
        const el = gauge.element;
        expect(el.getAttribute('role')).toBe('meter');
        expect(el.getAttribute('aria-label')).toBe('CPU');
        expect([el.getAttribute('aria-valuenow'), el.getAttribute('aria-valuemin'), el.getAttribute('aria-valuemax')]).toEqual(['42', '0', '100']);
        expect($(gauge, '.mx-gauge__value').textContent).toBe('42');
        expect($(gauge, '.mx-gauge__label').textContent).toBe('CPU');
    });

    it('reads the range a value is in, and takes its tone', () => {
        const gauge = make({ value: 80, ranges: RANGES, format: { style: 'unit', unit: 'percent' } });
        expect(gauge.element.getAttribute('aria-valuetext')).toMatch(/80.*high/);
        expect(gauge.element.style.getPropertyValue('--_tone')).toBe('var(--_gauge-warning)');
        expect(gauge.element.querySelectorAll('.mx-gauge__band')).toHaveLength(3);
    });

    it('keeps the fill outside a range in its own color', () => {
        const gauge = make({ value: 50 });
        expect(gauge.element.style.getPropertyValue('--_tone')).toBe('var(--_gauge-fill)');
    });

    it('fills an arc as far as its value, and draws nothing for no value', async () => {
        const gauge = make({ value: 25 });
        const quarter = $(gauge, '.mx-gauge__fill').getAttribute('d');
        expect(quarter).toBeTruthy();
        gauge.value = null;
        await settle();
        expect($(gauge, '.mx-gauge__fill').getAttribute('d')).toBeNull();
        expect(gauge.element.hasAttribute('aria-valuenow')).toBe(false);
    });

    it('keeps a value past the ends of the scale at the ends', () => {
        const over = make({ value: 150 });
        const full = make({ value: 100 });
        expect($(over, '.mx-gauge__fill').getAttribute('d')).toBe($(full, '.mx-gauge__fill').getAttribute('d'));
    });

    it('draws a circle, a needle and a bar', () => {
        expect(make({ type: 'circle', value: 30 }).element.getAttribute('data-type')).toBe('circle');
        const needle = make({ value: 30, marker: 'needle' });
        expect($(needle, '.mx-gauge__needle').getAttribute('d')).toBeTruthy();
        expect(needle.element.hasAttribute('data-needle')).toBe(true);
        const bar = make({ type: 'linear', value: 30 });
        expect($(bar, '.mx-gauge__fill').getAttribute('d')).toMatch(/^M/);
        expect($(bar, '.mx-gauge__needle').getAttribute('d')).toBeNull();
    });

    it('follows reactive data', async () => {
        const s = reactive({ value: 10 });
        const gauge = make({ value: () => s.value });
        s.value = 60;
        await settle();
        await settle();
        expect(gauge.element.getAttribute('aria-valuenow')).toBe('60');
    });

    it('can hide its value and its scale', () => {
        const gauge = make({ value: 10, showValue: false, scale: 'none' });
        expect($(gauge, '.mx-gauge__value')).toBeNull();
        expect(gauge.element.querySelectorAll('.mx-gauge__scale text')).toHaveLength(0);
    });

    it('draws ticks every interval, small ones between, or at values of its own', () => {
        const gauge = make({ value: 50, scale: 'ticks', tickInterval: 25, minorTicks: 4 });
        expect([...gauge.element.querySelectorAll('.mx-gauge__scale text')].map(t => t.textContent)).toEqual(['0', '25', '50', '75', '100']);
        expect($(gauge, '.mx-gauge__minor').getAttribute('d')?.match(/M/g)).toHaveLength(16);
        const own = make({ value: 5, max: 50, scale: 'ticks', ticks: [0, 10, 25, 50] });
        expect([...own.element.querySelectorAll('.mx-gauge__scale text')].map(t => t.textContent)).toEqual(['0', '10', '25', '50']);
    });

    it('writes the values of the scale with a format function', () => {
        const gauge = make({ value: 20, min: -45, max: 45, scale: 'ticks', tickInterval: 45, format: (v: number) => `${v}°` });
        expect([...gauge.element.querySelectorAll('.mx-gauge__scale text')].map(t => t.textContent)).toEqual(['-45°', '0°', '45°']);
        expect($(gauge, '.mx-gauge__value').textContent).toBe('20°');
    });

    it('runs a scale the other way when min is above max', () => {
        const gauge = make({ value: 30, min: 100, max: 0 });
        expect([gauge.element.getAttribute('aria-valuemin'), gauge.element.getAttribute('aria-valuemax')]).toEqual(['0', '100']);
        expect($(gauge, '.mx-gauge__fill').getAttribute('d')).toBeTruthy();
    });

    it('fills from the base value to either side', () => {
        const up = make({ value: 20, min: -45, max: 45, baseValue: 0 });
        const down = make({ value: -20, min: -45, max: 45, baseValue: 0 });
        expect($(up, '.mx-gauge__fill').getAttribute('d')).toBeTruthy();
        expect($(down, '.mx-gauge__fill').getAttribute('d')).toBeTruthy();
        expect($(up, '.mx-gauge__fill').getAttribute('d')).not.toBe($(down, '.mx-gauge__fill').getAttribute('d'));
    });

    it('points at the value with each marker, with or without the fill', () => {
        for (const marker of ['triangle', 'circle', 'rhombus', 'line'] as const) {
            const gauge = make({ value: 40, marker, fill: false });
            expect($(gauge, '.mx-gauge__marker').getAttribute('d')).toBeTruthy();
            expect($(gauge, '.mx-gauge__fill').getAttribute('d')).toBeNull();
        }
        const split = make({ value: 40, marker: 'needle', needleShape: 'two-tone' });
        expect($(split, '.mx-gauge__needle-tip').getAttribute('d')).toBeTruthy();
        const callout = make({ value: 40, marker: 'text' });
        expect($(callout, '.mx-gauge__callout text').textContent).toBe('40');
        expect($(callout, '.mx-gauge__value')).toBeNull();
    });

    it('turns a needle into a triangle on a straight gauge', () => {
        const gauge = make({ type: 'linear', value: 40, marker: 'needle' });
        expect($(gauge, '.mx-gauge__needle').getAttribute('d')).toBeNull();
        expect($(gauge, '.mx-gauge__marker').getAttribute('d')).toBeTruthy();
    });

    it('marks other values and reads them with the value', () => {
        const gauge = make({ value: 85, marks: [{ value: 40, label: 'Lowest' }, { value: 90, shape: 'text' }] });
        expect(gauge.element.querySelectorAll('.mx-gauge__mark')).toHaveLength(2);
        expect(gauge.element.querySelectorAll('.mx-gauge__mark')[1].getAttribute('data-shape')).toBe('text');
        expect(gauge.element.getAttribute('aria-valuetext')).toBe('85; Lowest: 40; mark at 90');
    });

    it('stands upright, taller than wide', () => {
        const gauge = make({ type: 'linear', orientation: 'vertical', size: 200, value: 40, scale: 'ticks' });
        expect(gauge.element.getAttribute('data-orientation')).toBe('vertical');
        const svg = gauge.element.querySelector('svg')!;
        expect(Number(svg.getAttribute('height'))).toBe(200);
        expect(Number(svg.getAttribute('width'))).toBeLessThan(200);
    });

    it('gives a range with neither a tone nor a color the next chart color', () => {
        const gauge = make({ value: 50, ranges: [{ from: 0, to: 40 }, { from: 40, to: 100 }] });
        expect(gauge.element.style.getPropertyValue('--_tone')).toBe('var(--_gauge-series-2)');
    });
});
