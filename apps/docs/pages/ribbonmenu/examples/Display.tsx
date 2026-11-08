import { reactive } from '@motifx/core';
import { ButtonGroup, RibbonMenu, Stack, Switch, type RibbonCommand, type RibbonMenuDisplay, type RibbonQuickBarPosition } from '@motifx-community/ui';
import { documentTabs } from './document-tabs';

/** How the menu is shown, the button before the tabs, the quick commands and the key hints. */
export default function Display() {
    const s = reactive({ display: 'always' as RibbonMenuDisplay, quick: 'start' as RibbonQuickBarPosition, hints: true, told: 'nothing yet' });
    const run = (what: string) => () => (s.told = what);
    const quick: RibbonCommand[] = [
        { key: 'save', text: 'Save', glyph: 'save', click: run('save') },
        { key: 'undo', text: 'Undo', glyph: 'undo', click: run('undo') }
    ];

    return (
        <Stack gap="md" style="inline-size: 100%">
            <Stack orientation="horizontal" gap="lg" wrap align="center">
                <ButtonGroup
                    label="Show the commands"
                    x-model={() => s.display}
                    items={[
                        { value: 'always', text: 'Always' },
                        { value: 'tabs', text: 'Only the tabs' },
                        { value: 'auto', text: 'Hide automatically' }
                    ]}
                />
                <ButtonGroup
                    label="Quick commands"
                    x-model={() => s.quick}
                    items={[
                        { value: 'start', text: 'In the row of tabs' },
                        { value: 'below', text: 'Under the commands' },
                        { value: 'hidden', text: 'Hidden' }
                    ]}
                />
                <Switch label="Key hints" x-model={() => s.hints} />
            </Stack>
            <RibbonMenu
                class="rb-display"
                items={documentTabs(run)}
                display={() => s.display}
                quickBar={() => s.quick}
                keyHints={() => s.hints}
                quickCommands={quick}
                appButton="&File"
                onAppButton={run('the File button')}
                onDisplayChanged={e => (s.display = e.display)}
            />
            <output class="rb-display-told">{() => `Last command: ${s.told}`}</output>
        </Stack>
    );
}
