import { Component } from '@motifx/core';
import { Button, Signature, Stack } from '@motifx-community/ui';

/** A pad created programmatically. `undo()` and `clear()` do what its buttons do. */
export default class Programmatic extends Component<HTMLDivElement> {
    constructor() {
        super('div');
        const pad = new Signature({ label: 'Programmatic signature', height: 120, showUndo: false, showClear: false });
        const clear = new Button({ text: 'Clear', variant: 'outline', onclick: () => pad.clear() });
        const stack = new Stack({ gap: 'md' });
        stack.controls.add(pad, clear);
        this.controls.add(stack);
    }
}
