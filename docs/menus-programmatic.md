# MenuBar: Programmatic changes

> MenuBar · @motifx-community/ui 0.1.0-beta.11

The items of a bar can be changed while it runs: by path, without building the whole list again, or in place followed by `refresh()`. Items can also name app commands, which give them their text, keys, state and action.

## Changes by path

An item is named by the keys along the way, joined with `/`: `file/save`; an item without a `key` is named by its position. Each change makes a new list, in which the items along the changed path are new objects and the others are the ones given, and `onItemsChanged` reports it. An open menu stays open with its new items.

```tsx
import { reactive } from '@motifx/core';
import { Button, MenuBar, Stack, type MenuItem } from '@motifx-community/ui';

const START: MenuItem[] = [
  { key: 'file', text: '&File', items: [{ key: 'new', text: '&New' }, { key: 'save', text: '&Save' }] },
  { key: 'edit', text: '&Edit', items: [{ key: 'undo', text: '&Undo' }, { key: 'paste', text: '&Paste' }] },
  { key: 'help', text: '&Help', items: [{ key: 'about', text: '&About' }] },
];

/** Items added, removed, moved and changed by path; the list given is never changed. */
export default function MenuChanges() {
  const s = reactive({ changes: 0 });
  let bar!: MenuBar;

  return (
    <Stack gap="md">
      <MenuBar ref={(b: MenuBar) => (bar = b)} class="mb-changes" label="Changes" items={START} onItemsChanged={() => s.changes++} />
      <Stack orientation="horizontal" gap="sm" wrap>
        <Button text="Add Print to File" variant="outline" onclick={() => bar.addItem('file', { key: 'print', text: '&Print', shortcut: 'Ctrl+P' })} />
        <Button text="Turn Save off" variant="outline" onclick={() => bar.updateItem('file/save', { enabled: false })} />
        <Button text="Move Paste to File" variant="outline" onclick={() => bar.moveItem('edit/paste', 0, 'file')} />
        <Button text="Move Help first" variant="outline" onclick={() => bar.moveItem('help', 0)} />
        <Button text="Remove Edit" variant="outline" onclick={() => bar.removeItem('edit')} />
        <Button text="Start again" variant="outline" onclick={() => (bar.items = START)} />
      </Stack>
      <output class="mb-changes-told">{() => `${s.changes} changes`}</output>
    </Stack>
  );
}
```

| Method | Returns | Description |
| --- | --- | --- |
| `findItem(path)` | `MenuItem \| null` | The item at the path, as it is now. |
| `addItem(parentPath, item, index?)` | `boolean` | Adds an item to the menu at `parentPath` (the bar when empty), at the end by default. |
| `removeItem(path)` | `boolean` | Removes the item with its menu. |
| `moveItem(path, index, toParent?)` | `boolean` | Moves the item to `index` in its menu, or in the menu at `toParent`. |
| `updateItem(path, changes)` | `boolean` | Changes fields of the item; the others stay as they are. |
| `beginUpdate(), endUpdate()` | `void` | Applies the changes made between them at once, with one `onItemsChanged`. |
| `refresh()` | `void` | Reads items changed in place again: the bar, the open menu and its submenus update. |

## Changes in place

Your items can be plain objects or reactive ones, and the bar reads them as they are. A field given as a function is followed by itself; after changing plain items in place, call `refresh()`.

```tsx
const items = [{ key: 'file', text: '&File', items: [{ key: 'save', text: '&Save', enabled: () => doc.dirty }] }];
items[0].items.push({ key: 'print', text: '&Print' });
bar.refresh();
```

## Items that name commands

An item with `command: 'save'` takes what it is not given from the app command with that key: its text, icon, hint, the keys shown at its end, its state and its action. The command’s keys run it, and the user can assign other keys to them. See [Commands and shortcuts](commands.md).

```tsx
commands.add({ key: 'save', text: '&Save', shortcut: 'Mod+S', enabled: () => doc.dirty, run: () => doc.save() });
<MenuBar items={[{ key: 'file', text: '&File', items: [{ command: 'save' }] }]} />
```

## Feedback

Loading issues…
