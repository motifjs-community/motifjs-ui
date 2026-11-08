# RibbonMenu: Showing and keys

> RibbonMenu · @motifx-community/ui 0.1.0-beta.7

The menu can show only its tabs or hide itself to leave the page more room. A button before the tabs opens the app’s main menu, quick commands are at hand from every tab, and key hints let the keyboard reach any command in a few letters.

## Showing, quick commands and keys

Choose how the menu is shown and where the quick commands stand. Tap Alt (or press F10) with focus in the menu to see the key hints.

```tsx
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
```

## Showing the commands

| display | What is shown |
| --- | --- |
| ``always`` | The tabs and the commands. The default. |
| ``tabs`` | Only the tabs. A tab opens its commands over the page; they close after a command, on Escape, on a click elsewhere and when focus leaves. |
| ``auto`` | A thin strip. It opens the whole menu over the page, which closes the same way. |

A double-click on a tab and Ctrl+F1 switch between `always` and `tabs`; the menu’s context menu offers all three. The user’s choice is reported by `onDisplayChanged` and kept in `customization`.

## The button before the tabs and the ends of the row

`appButton` is the text of a button before the tabs, drawn in the accent color, such as one that opens an `AppMenu`; `onAppButton` reports it. `barStart` and `barEnd` hold any content of the app at the ends of the row of tabs: a search field, a button, an editor.

## Quick commands

`quickCommands` are small commands pressed from any tab. The user adds others from a command’s context menu, and removes them the same way. `quickBar` places them in the row of tabs (`start`), under the commands (`below`) or nowhere (`hidden`).

## Key hints

| When | What happens |
| --- | --- |
| `On the tabs` | Each tab shows its access key (the letter after `&` in its text), else its first letter. The button before the tabs has a letter too, and the quick commands have digits. |
| `On the commands` | A command shows its `keyHint`, else its access key, else its first letter. Several commands starting with the same letter have a letter and a digit. |
| `Typing` | The letters press what they stand on. A tab goes on to the letters of its commands; a command ends the hints. Typing the first of two letters hides the others. |
| `Escape` | Goes back one level: from the commands to the tabs, then ends the hints. Any other key, a click and leaving the page end them too. |

Alt and F10 reach the menu that has focus, else the first menu of the page. `keyHints: false` turns them off, and `showKeyHints()` shows them programmatically.

## Feedback

Loading issues…
