import { Component } from '@motifx/core';
import { BarGauge, Button, Stack } from '@motifx-community/ui';

/** A bar gauge created programmatically. Each prop is also a property that can be set later. */
export default class Programmatic extends Component<HTMLDivElement> {
    constructor() {
        super('div');
        const gauge = new BarGauge({ data: [42, 67], label: 'Goals' });
        const add = new Button({ text: 'Add a bar', variant: 'outline', onclick: () => (gauge.data = [...gauge.data, Math.round(20 + Math.random() * 70)]) });
        const legend = new Button({ text: 'Legend on or off', variant: 'outline', onclick: () => (gauge.legend = !gauge.legend) });
        const buttons = new Stack({ orientation: 'horizontal', gap: 'sm', wrap: true });
        buttons.controls.add(add, legend);
        const stack = new Stack({ gap: 'md', align: 'start' });
        stack.controls.add(gauge, buttons);
        this.controls.add(stack);
    }
}
