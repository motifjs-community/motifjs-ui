import { Component } from '@motifx/core';
import { BottomNavigation, Button, Stack } from '@motifx-community/ui';

/** A bar created programmatically. Each prop is also a property that can be set later. */
export default class Programmatic extends Component<HTMLDivElement> {
    constructor() {
        super('div');
        const bar = new BottomNavigation({
            label: 'Search pages',
            position: 'static',
            value: 'home',
            items: [
                { value: 'home', text: 'Home', glyph: 'star' },
                { value: 'search', text: 'Search', glyph: 'search' }
            ]
        });
        const go = new Button({ text: 'Go to Search', variant: 'outline', onclick: () => (bar.value = 'search') });
        const stack = new Stack({ gap: 'md' });
        stack.controls.add(bar, go);
        this.controls.add(stack);
    }
}
