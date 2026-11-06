import { Component } from '@motifx/core';
import { Button, OtpInput, Stack } from '@motifx-community/ui';

/** A field created programmatically. `clear()` empties it and puts the caret in the first box. */
export default class Programmatic extends Component<HTMLDivElement> {
    constructor() {
        super('div');
        const code = new OtpInput({ label: 'Programmatic code', length: 4, value: '12' });
        const clear = new Button({ text: 'Clear', variant: 'outline', onclick: () => code.clear() });
        const stack = new Stack({ gap: 'md' });
        stack.controls.add(code, clear);
        this.controls.add(stack);
    }
}
