# RibbonMenu: Programmatic changes

> RibbonMenu · @motifx-community/ui 0.1.0-beta.11

Tabs, groups and commands can be added, removed, moved and changed at any time, by their paths. The menu redraws only what changed: groups and commands that stay keep their buttons, their state and their place.

## Changes by path

```tsx
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
```

## Methods

| Method | Description |
| --- | --- |
| `addTab(tab, index?)` | Adds a tab at `index`, the end by default. |
| `addGroup(tabPath, group, index?)` | Adds a group to a tab. |
| `addCommand(parentPath, command, index?)` | Adds a command to a group (`tab/group`) or to a row (`tab/group/row`). |
| `remove(path)` | Removes a tab, a group or a command. |
| `move(path, index, toParent?)` | Moves it to `index` in its list, or in the list at `toParent`: a group to another tab, a command to another group or row. |
| `update(path, changes)` | Changes some of its fields, such as `text`, `visible`, `enabled` or `glyph`; the others stay as they are. |
| `findTab(key), findGroup(path), findCommand(path)` | The tab, group or command as it is now. |
| `beginUpdate(), endUpdate()` | Holds the changes until `endUpdate()`, which applies them at once. |

Each method returns `false` when nothing changed, such as for a path that does not exist.

```tsx
menu.beginUpdate();
menu.addGroup('home', { key: 'styles', text: 'Styles', commands: [] }, 1);
menu.addCommand('home/styles', { key: 'normal', text: 'Normal', glyph: 'star' });
menu.update('home/clipboard/paste', { enabled: false });
menu.endUpdate();
```

## Paths

A path names an item by its keys joined with `/`: `home` is a tab, `home/clipboard` a group, `home/clipboard/paste` a command, and a fourth part a command of a row. A missing key is the position, which changes when items are added or removed before it, so give the items you change keys.

## Your data

The methods never change the tabs, groups and commands you gave. Each change makes a new list, with new objects only along the changed path, and it becomes `items`. `onItemsChanged` reports the new list: keep it in your state when you save the menu or bind `items` to it. When you keep the tabs in reactive state, you can also change that state directly; the menu follows it, and with plain data `refresh()` reads it again.

## Feedback

Loading issues…
