import { Component } from '@motifx/core';
import { Button, Chart, Stack } from '@motifx-community/ui';
import { SALES } from './sales';

/** A chart created programmatically. Each prop is also a property that can be set later. */
export default class Programmatic extends Component<HTMLDivElement> {
    constructor() {
        super('div');
        const chart = new Chart({ label: 'Sales', data: SALES, xField: 'month', series: [{ type: 'bar', yField: 'online', name: 'Online' }] });
        const next = new Button({ text: 'Show the stores', variant: 'outline', onclick: () => (chart.series = [{ type: 'bar', yField: 'stores', name: 'Stores' }]) });
        const stack = new Stack({ gap: 'md' });
        stack.controls.add(chart, next);
        this.controls.add(stack);
    }
}
