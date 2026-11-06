import { Component } from '@motifx/core';
import { AppBar, Button, Stack } from '@motifx-community/ui';

/** A bar created programmatically. Each prop is also a property that can be set later. */
export default class Programmatic extends Component<HTMLDivElement> {
    constructor() {
        super('div');
        const bar = new AppBar({ title: 'Draft', position: 'static', navigation: 'back' });
        const rename = new Button({ text: 'Rename', variant: 'outline', onclick: () => (bar.title = 'Final') });
        const stack = new Stack({ gap: 'md' });
        stack.controls.add(bar, rename);
        this.controls.add(stack);
    }
}
