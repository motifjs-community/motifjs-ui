import { Component } from '@motifx/core';
import { Button, Gauge, Stack } from '@motifx-community/ui';

/** A gauge created programmatically. Each prop is also a property that can be set later. */
export default class Programmatic extends Component<HTMLDivElement> {
    constructor() {
        super('div');
        const gauge = new Gauge({ value: 30, label: 'Queue', scale: 'ticks', tickInterval: 25 });
        const add = new Button({ text: 'Add 10', variant: 'outline', onclick: () => (gauge.value = Math.min(100, (gauge.value ?? 0) + 10)) });
        const needle = new Button({ text: 'Needle on or off', variant: 'outline', onclick: () => (gauge.marker = gauge.marker ? null : 'needle') });
        const buttons = new Stack({ orientation: 'horizontal', gap: 'sm', wrap: true });
        buttons.controls.add(add, needle);
        const stack = new Stack({ gap: 'md', align: 'start' });
        stack.controls.add(gauge, buttons);
        this.controls.add(stack);
    }
}
