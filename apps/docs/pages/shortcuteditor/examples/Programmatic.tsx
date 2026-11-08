import { Component } from '@motifx/core';
import { Button, ShortcutEditor, Stack, addShortcut } from '@motifx-community/ui';

/** An editor created programmatically: a shortcut is selected and given other keys from code, then reset. */
export default class Programmatic extends Component<HTMLDivElement> {
    constructor() {
        super('div');
        const stack = new Stack({ gap: 'md' });
        const stop = addShortcut('Mod+K', () => {}, { scope: stack, name: 'code.palette', text: 'Command palette', category: 'Go' });
        stack.motif.setDisposable(stop);
        const editor = new ShortcutEditor({ height: '10rem', filter: (info) => info.name === 'code.palette' });
        const give = new Button({
            text: 'Give it Ctrl+Shift+P',
            variant: 'outline',
            onclick: () => {
                editor.selected = 'code.palette';
                editor.give(['Ctrl+Shift+P']);
            },
        });
        const reset = new Button({ text: 'Reset all keys', variant: 'outline', onclick: () => editor.resetAll() });
        const buttons = new Stack({ orientation: 'horizontal', gap: 'sm' });
        buttons.controls.add(give, reset);
        stack.controls.add(editor, buttons);
        this.controls.add(stack);
    }
}
