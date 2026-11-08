import { reactive } from '@motifx/core';
import { Button, RibbonMenu, Stack } from '@motifx-community/ui';
import { documentTabs } from './document-tabs';

/** Tabs, groups and commands added, removed, moved and changed by path. */
export default function Programmatic() {
    const s = reactive({ told: 'nothing yet', changes: 0, extra: 0, dateShown: true });
    const run = (what: string) => () => (s.told = what);
    let menu!: RibbonMenu;

    const addTab = () =>
        menu.addTab({
            key: 'review',
            text: '&Review',
            groups: [{ key: 'proofing', text: 'Proofing', commands: [{ key: 'spelling', text: 'Spelling', glyph: 'check', size: 'large', click: run('spelling') }] }]
        });
    const addCommand = () => {
        s.extra++;
        menu.addCommand('home/clipboard', { key: `extra${s.extra}`, text: `Extra ${s.extra}`, glyph: 'star', click: run(`extra ${s.extra}`) });
    };
    const toggleDate = () => {
        s.dateShown = !s.dateShown;
        menu.update('home/insert/date', { visible: s.dateShown });
    };
    const reset = () => {
        menu.items = documentTabs(run);
        s.extra = 0;
        s.dateShown = true;
    };

    return (
        <Stack gap="md" style="inline-size: 100%">
            <Stack orientation="horizontal" gap="sm" wrap>
                <Button text="Add a tab" variant="outline" onclick={addTab} />
                <Button text="Add a command" variant="outline" onclick={addCommand} />
                <Button text="Rename Cut" variant="outline" onclick={() => menu.update('home/clipboard/cut', { text: 'Cut out' })} />
                <Button text="Hide or show Date" variant="outline" onclick={toggleDate} />
                <Button text="Move Editing first" variant="outline" onclick={() => menu.move('home/editing', 0)} />
                <Button text="Remove Insert" variant="outline" onclick={() => menu.remove('home/insert')} />
                <Button text="Start again" variant="outline" onclick={reset} />
            </Stack>
            <RibbonMenu class="rb-programmatic" ref={(m: RibbonMenu) => (menu = m)} items={documentTabs(run)} onItemsChanged={() => s.changes++} />
            <output class="rb-programmatic-told">{() => `${s.changes} changes · last command: ${s.told}`}</output>
        </Stack>
    );
}
