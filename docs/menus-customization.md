# MenuBar: Customization

> MenuBar · @motifx-community/ui 0.1.0-beta.10

With `customizable`, the user arranges the bar: hides and moves items, renames them, adds commands and menus, and changes keyboard shortcuts. The items you give stay as they are; what the user changed is one object for the app to save.

## Changes by the user

The user right-clicks an item, or presses Shift+F10 on it, to hide it or move it along the bar or up and down its menu. An item with `customizable: false` stays shown and in its place, and nothing moves past it. “Customize…” in that menu, or `openCustomizer()`, opens the customizer window. On a touch screen the window takes the whole screen; `customizer: false` leaves the command out of the menu.

```tsx
import { reactive } from '@motifx/core';
import { Button, MenuBar, Stack, type MenuBarCustomization, type MenuItem } from '@motifx-community/ui';

const MENUS: MenuItem[] = [
  {
    key: 'file',
    text: '&File',
    items: [
      { key: 'new', text: '&New', shortcut: 'Ctrl+N' },
      { key: 'open', text: '&Open…', shortcut: 'Ctrl+O' },
      { key: 'save', text: '&Save', shortcut: 'Ctrl+S', beginGroup: true },
      { key: 'export', text: '&Export', items: [{ key: 'pdf', text: 'PDF' }, { key: 'html', text: 'HTML' }] },
      { key: 'exit', text: 'E&xit', beginGroup: true, customizable: false },
    ],
  },
  { key: 'edit', text: '&Edit', items: [{ key: 'undo', text: '&Undo' }, { key: 'redo', text: '&Redo' }, { key: 'find', text: '&Find' }] },
  { key: 'view', text: '&View', items: [{ key: 'zoom', text: '&Zoom' }, { key: 'full', text: '&Full screen' }] },
  { key: 'help', text: '&Help', customizable: false, items: [{ key: 'about', text: '&About' }] },
];

// Commands the user can add from the customizer.
const COMMANDS: MenuItem[] = [
  { key: 'print', text: '&Print', shortcut: 'Ctrl+P' },
  { key: 'share', text: 'S&hare' },
  { key: 'spelling', text: 'Check &spelling', shortcut: 'F7' },
];

/** Right-click an item, or press Shift+F10 on it, to hide or move it; what the user changed is one object to save. */
export default function CustomizableMenu() {
  const s = reactive({ saved: null as MenuBarCustomization | null, told: 'Nothing yet.' });
  let bar!: MenuBar;

  return (
    <Stack gap="md">
      <MenuBar
        ref={(b: MenuBar) => (bar = b)}
        label="Editor"
        items={MENUS}
        customizable
        commands={COMMANDS}
        onCustomized={(e) => (s.saved = e.customization)}
        onCustomMenuOpening={(e) => {
          if (e.path) e.items.push({ text: 'Show the path', beginGroup: true, click: () => (s.told = `Path: ${e.path}`) });
        }}
      />
      <output class="mb-custom-told">{() => s.told}</output>
      <pre class="mb-custom-saved">{() => JSON.stringify(s.saved ?? {}, null, 2)}</pre>
      <Stack orientation="horizontal" gap="sm" wrap>
        <Button text="Customize…" variant="outline" onclick={() => bar.openCustomizer()} />
        <Button text="Forget the changes" variant="outline" onclick={() => (bar.customization = null)} />
        <Button text="Restore the saved changes" variant="outline" onclick={() => (bar.customization = s.saved)} />
      </Stack>
    </Stack>
  );
}
```

| Page of the window | Content |
| --- | --- |
| `Menus` | Every item in a tree. Its check box shows or hides it; the toolbar adds a menu of the user’s own, renames, deletes what the user added, moves items up, down or into another menu, and resets. Alt with an arrow moves the selected item, F2 renames it, Delete deletes it. |
| `Commands` | The commands given as `commands`, or the app’s commands (`commands.add`) when none are given, to add one to a menu. |
| `Keyboard` | A [ShortcutEditor](shortcuteditor.md): the app’s keyboard shortcuts, to assign other keys. `customizerKeyboard: false` leaves the page out. |

## Saving the changes

`onCustomized` reports everything the user changed so far as one plain object; assigning it to `customization` restores the changes, and `null` forgets them. An item of the app is named by its path in the items given and keeps that name wherever the user moves it, so a saved object still applies after the app adds items. How the object is stored is up to the app.

```tsx
bar.customization = JSON.parse(localStorage.getItem('menu') ?? 'null');
bar.onCustomized((e) => localStorage.setItem('menu', JSON.stringify(e.customization)));
```

| Field | Type | Description |
| --- | --- | --- |
| `hidden` | `string[]` | The items the user hid. |
| `order` | `Record<string, string[]>` | The order the user gave: the bar’s items under `''`, a menu’s items under the name of the menu. |
| `moves` | `Record<string, string>` | The items the user moved to another menu, and the menu each went to. |
| `texts` | `Record<string, string>` | The names the user gave to items. |
| `added` | `MenuBarAddedItem[]` | The commands and menus the user added, each with its `id` (`user:1`). |

## Commands of your own in the menu

`onCustomMenuOpening` occurs before the menu of a right-click opens, with the item, its path and the commands about to be shown: add commands of your own, leave some out, or set `cancel`. It occurs without `customizable` too, with no commands of the bar, so a bar can have a right-click menu of the app’s own.

```tsx
import { reactive } from '@motifx/core';
import { MenuBar, Stack, type MenuItem } from '@motifx-community/ui';

const MENUS: MenuItem[] = [
  { key: 'file', text: '&File', items: [{ key: 'new', text: '&New' }, { key: 'open', text: '&Open…' }] },
  { key: 'edit', text: '&Edit', items: [{ key: 'undo', text: '&Undo' }, { key: 'redo', text: '&Redo' }] },
  { key: 'help', text: '&Help', items: [{ key: 'about', text: '&About' }] },
];

/**
 * The menu a right-click opens on the bar, with commands of the app's own: the bar is not `customizable`, so they are
 * the only ones. Help opens no menu at all.
 */
export default function CustomMenuCommands() {
  const s = reactive({ told: 'Nothing yet.' });

  return (
    <Stack gap="md">
      <MenuBar
        label="Own commands"
        items={MENUS}
        onCustomMenuOpening={(e) => {
          if (e.path === 'help') {
            e.cancel = true;
            return;
          }
          const name = e.item ? String(e.item.text).replace('&', '') : 'the bar';
          e.items.push(
            { text: `Copy the path of ${name}`, click: () => (s.told = `Path: ${e.path ?? '(none)'}`) },
            { text: 'Show all menus', beginGroup: true, click: () => (s.told = 'Every menu is shown.') },
          );
        }}
      />
      <output class="mb-own-told">{() => s.told}</output>
    </Stack>
  );
}
```

## Feedback

Loading issues…
