# AppMenu: Programmatic changes

> AppMenu · @motifx-community/ui 0.1.0-beta.10

Items can be added, removed, moved and changed at any time, by their keys. Items that stay keep their place, and pages that were opened keep their state.

## Changes by key

```tsx
import { reactive } from '@motifx/core';
import { AppMenu, Button, Stack, type AppMenuItem } from '@motifx-community/ui';

const START: AppMenuItem[] = [
    { key: 'home', text: '&Home', glyph: 'star', page: () => <h2>Home</h2> },
    { key: 'open', text: '&Open', glyph: 'file', page: () => <h2>Open</h2> },
    { key: 'save', text: '&Save', glyph: 'save', group: 'file', click: () => {} },
    { key: 'account', text: '&Account', glyph: 'person', bottom: true, page: () => <h2>Account</h2> }
];

/** Items added, removed, moved and changed by key; a page that was opened stays as it was. */
export default function Programmatic() {
    const s = reactive({ open: false, changes: 0, unread: 0 });
    let menu!: AppMenu;

    return (
        <Stack gap="md">
            <Stack orientation="horizontal" gap="sm" wrap>
                <Button text="Open the menu" onclick={() => (s.open = true)} />
                <Button text="Add Print" variant="outline" onclick={() => menu.addItem({ key: 'print', text: '&Print', glyph: 'file', group: 'file', page: () => <h2>Print</h2> }, 3)} />
                <Button
                    text="New message on Account"
                    variant="outline"
                    onclick={() => {
                        s.unread++;
                        menu.updateItem('account', { badge: s.unread });
                    }}
                />
                <Button text="Move Save first" variant="outline" onclick={() => menu.moveItem('save', 0)} />
                <Button text="Remove Open" variant="outline" onclick={() => menu.removeItem('open')} />
                <Button
                    text="Start again"
                    variant="outline"
                    onclick={() => {
                        menu.items = START;
                        s.unread = 0;
                    }}
                />
            </Stack>
            <output class="am-programmatic-told">{() => `${s.changes} changes`}</output>
            <AppMenu class="am-programmatic" ref={(m: AppMenu) => (menu = m)} label="File" items={START} x-model={() => s.open} onItemsChanged={() => s.changes++} />
        </Stack>
    );
}
```

## Methods

| Method | Description |
| --- | --- |
| `addItem(item, index?)` | Adds an item at `index`, the end by default. |
| `removeItem(key)` | Removes the item with `key`; its page goes with it. |
| `moveItem(key, index)` | Moves the item to `index`. |
| `updateItem(key, changes)` | Changes some of its fields, such as `text`, `badge`, `enabled` or `visible`; the others stay as they are, and its page is kept. |
| `findItem(key)` | The item as it is now. |
| `beginUpdate(), endUpdate()` | Holds the changes until `endUpdate()`, which applies them at once. |
| `select(key), openAt(key), pageOf(key)` | Shows a page, opens the menu on it, and returns its page once it has been shown. |

Each change method returns `false` when nothing changed, such as for a key that does not exist.

## Your data

The methods never change the items you gave. Each change makes a new list, the item changed a new object and the others the ones given, and it becomes `items`. `onItemsChanged` reports the new list to keep. When the items are in reactive state, you can also change that state directly; the menu follows it, and each item’s fields can be functions it follows.

## Feedback

Loading issues…
