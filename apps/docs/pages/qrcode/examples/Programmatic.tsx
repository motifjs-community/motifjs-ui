import { Component } from '@motifx/core';
import { Button, QRCode, Stack } from '@motifx-community/ui';

/** A code created programmatically. Each prop is also a property that can be set later. */
export default class Programmatic extends Component<HTMLDivElement> {
    constructor() {
        super('div');
        const code = new QRCode({ value: 'First', size: 140 });
        const next = new Button({ text: 'Change the text', variant: 'outline', onclick: () => (code.value = 'Second') });
        const stack = new Stack({ gap: 'md' });
        stack.controls.add(code, next);
        this.controls.add(stack);
    }
}
