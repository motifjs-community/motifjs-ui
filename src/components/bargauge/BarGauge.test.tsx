import { reactive, type ComponentBase } from '@motifx/core';
import { afterEach, describe, expect, it } from 'vitest';
import { mountHost } from '../../../tests/helpers';
import { measureNow } from '../../core/measure';
import { BarGauge } from './BarGauge';
import type { BarGaugeProps } from './bar-gauge-props';

const hosts: ComponentBase[] = [];
function make<T = any>(props: BarGaugeProps<T>): BarGauge<T> {
    const gauge = new BarGauge<T>(props);
    hosts.push(mountHost(gauge));
    gauge.onMounted();
    measureNow(gauge);
    return gauge;
}
const settle = () => Promise.resolve().then(() => Promise.resolve());
const all = (gauge: BarGauge, selector: string) => [...gauge.element.querySelectorAll(selector)];

afterEach(async () => {
    for (const host of hosts.splice(0)) if (!host.isDisposed) await host.dispose();
});

describe('BarGauge', () => {
    it('draws a bar and a track for each value, and writes the values at their ends', () => {
        const gauge = make({ data: [47, 65, 84] });
        expect(all(gauge, '.mx-bar-gauge__track')).toHaveLength(3);
        expect(all(gauge, '.mx-bar-gauge__bar').every(b => b.getAttribute('d'))).toBe(true);
        expect(all(gauge, '.mx-bar-gauge__labels text').map(t => t.textContent).sort()).toEqual(['47', '65', '84']);
        expect(gauge.element.querySelector('.mx-bar-gauge__connectors')!.getAttribute('d')?.match(/M/g)).toHaveLength(3);
    });

    it('is an image whose name gives every value', () => {
        const gauge = make({ data: [10, 20], label: 'Ratings' });
        expect(gauge.element.getAttribute('role')).toBe('img');
        expect(gauge.element.getAttribute('aria-label')).toBe('Ratings: 10, 20');
    });

    it('reads rows through fields, names them in the legend, and leaves the rows as they are', () => {
        const rows = [
            { name: 'North', share: 40, color: 'red' },
            { name: 'South', share: 70 }
        ];
        const copy = JSON.stringify(rows);
        const gauge = make({ data: rows, valueField: 'share', nameField: 'name', colorField: 'color', legend: true, label: 'Sales' });
        expect(all(gauge, '.mx-bar-gauge__entry').map(e => e.textContent)).toEqual(['North: 40', 'South: 70']);
        expect((all(gauge, '.mx-bar-gauge__bar')[0] as SVGElement).style.getPropertyValue('--_bar')).toBe('red');
        expect((all(gauge, '.mx-bar-gauge__bar')[1] as SVGElement).style.getPropertyValue('--_bar')).toBe('var(--_bar-gauge-series-2)');
        expect(gauge.element.getAttribute('aria-label')).toBe('Sales: North: 40, South: 70');
        expect(JSON.stringify(rows)).toBe(copy);
    });

    it('reads a field and writes a value through functions', () => {
        const gauge = make({ data: [{ v: 2.5 }], valueField: (r: { v: number }) => r.v * 2, format: (v: number) => `${v} mm` });
        expect(all(gauge, '.mx-bar-gauge__labels text')[0].textContent).toBe('5 mm');
    });

    it('grows bars both ways from the base value', () => {
        const gauge = make({ data: [-2, 3], min: -5, max: 5, baseValue: 0 });
        const [down, up] = all(gauge, '.mx-bar-gauge__bar').map(b => b.getAttribute('d'));
        expect(down).toBeTruthy();
        expect(up).toBeTruthy();
    });

    it('follows the data as bars come and go', async () => {
        const s = reactive({ values: [10, 20] });
        const gauge = make({ data: () => s.values });
        s.values = [10, 20, 30];
        await settle();
        await settle();
        expect(all(gauge, '.mx-bar-gauge__track')).toHaveLength(3);
        s.values = [10];
        await settle();
        await settle();
        expect(all(gauge, '.mx-bar-gauge__track')).toHaveLength(1);
        expect(all(gauge, '.mx-bar-gauge__bar')).toHaveLength(1);
    });

    it('can leave out the values and the legend', () => {
        const gauge = make({ data: [10, 20], showLabels: false });
        expect(all(gauge, '.mx-bar-gauge__labels text')).toHaveLength(0);
        expect((gauge.element.querySelector('.mx-bar-gauge__legend') as HTMLElement).hidden).toBe(true);
    });

    it('draws nothing without values, and says only its name', () => {
        const gauge = make<any>({ data: [], label: 'Empty' });
        expect(all(gauge, '.mx-bar-gauge__bar')).toHaveLength(0);
        expect(gauge.element.getAttribute('aria-label')).toBe('Empty');
    });
});
