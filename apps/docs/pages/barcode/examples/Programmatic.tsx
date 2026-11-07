import { Component } from '@motifx/core';
import { Barcode, Button, Stack } from '@motifx-community/ui';

/** A code created programmatically. Each prop is also a property that can be set later. */
export default class Programmatic extends Component<HTMLDivElement> {
    constructor() {
        super('div');
        const code = new Barcode({ value: 'FIRST' });
        const next = new Button({ text: 'Change the value', variant: 'outline', onclick: () => (code.value = 'SECOND') });
        const stack = new Stack({ gap: 'md' });
        stack.controls.add(code, next);
        this.controls.add(stack);
    }
}
