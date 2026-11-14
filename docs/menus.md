# MenuBar and ContextMenu

> MenuBar · @motifx-community/ui 0.1.0-beta.10

An application menu bar (File, Edit, View) and a context menu that opens on right-click. Both use the same menu items, which support submenus, check and radio items, shortcuts and access keys. The bar can be customized by the user, changed by path and merged with the bars of documents and windows.

## Import

```tsx
import { MenuBar, ContextMenu, attachContextMenu, type MenuItem } from '@motifx-community/ui';
```

## MenuBar

A `MenuBar` takes its top-level items as `items`, and the `items` of each one define its menu. `&File` assigns Alt+F to open File. Left and Right move along the bar and, while a menu is open, to the next menu. Escape returns to the bar.

```tsx
import { reactive, type Component } from '@motifx/core';
import { CheckBox, MenuBar, Stack, type MenuItem } from '@motifx-community/ui';

/** An application menu bar created with `new`: submenus, check and radio items, shortcuts, access keys and `onItemClick`. */
export default function MainMenu() {
  const s = reactive({
    log: 'Nothing chosen yet.',
    chosen: 0,
    wrap: true,
    statusBar: false,
    zoom: '100%',
    theme: 'light',
    f10: false,
    canUndo: true,
  });

  const did = (what: string) => (s.log = what);
  const undo = (back: boolean) => {
    s.canUndo = !back;
    did(back ? 'Undo' : 'Redo');
  };
  const zoom = (value: string): MenuItem => ({ text: value, group: 'zoom', checked: () => s.zoom === value, click: () => (s.zoom = value) });
  const theme = (value: string, text: string): MenuItem => ({ text, group: 'theme', checked: () => s.theme === value, click: () => (s.theme = value) });

  const menus: MenuItem[] = [
    {
      text: '&File',
      items: [
        { text: '&New', shortcut: 'Ctrl+N', click: () => did('New') },
        { text: '&Open…', shortcut: 'Ctrl+O', click: () => did('Open…') },
        { text: 'Open &recent', items: ['report.docx', 'budget.xlsx', 'notes.md'].map((name) => ({ text: name, click: () => did(`Open ${name}`) })) },
        { text: '&Save', shortcut: 'Ctrl+S', beginGroup: true, click: () => did('Save') },
        { text: 'Save &as…', click: () => did('Save as…') },
        { text: 'E&xit', beginGroup: true, click: () => did('Exit') },
      ],
    },
    {
      text: '&Edit',
      items: [
        { text: '&Undo', shortcut: 'Ctrl+Z', enabled: () => s.canUndo, click: () => undo(true) },
        { text: '&Redo', shortcut: 'Ctrl+Y', click: () => undo(false) },
        { text: 'Cu&t', shortcut: 'Ctrl+X', beginGroup: true, click: () => did('Cut') },
        { text: '&Copy', shortcut: 'Ctrl+C', click: () => did('Copy') },
        { text: '&Paste', shortcut: 'Ctrl+V', click: () => did('Paste') },
        { text: 'Paste &special', enabled: false },
      ],
    },
    {
      text: '&View',
      items: [
        { text: '&Word wrap', checked: () => s.wrap, click: () => (s.wrap = !s.wrap) },
        { text: '&Status bar', checked: () => s.statusBar, click: () => (s.statusBar = !s.statusBar) },
        { ...zoom('100%'), beginGroup: true },
        zoom('125%'),
        zoom('150%'),
        { text: '&Theme', beginGroup: true, items: [theme('light', 'Light'), theme('dark', 'Dark'), theme('system', 'Same as the system')] },
      ],
    },
    { text: '&Help', items: [{ text: '&About', click: () => did('About') }] },
  ];

  const bar = new MenuBar({ label: 'Main', items: menus, focusOnF10: () => s.f10 });
  bar.onItemClick(() => s.chosen++);

  return (
    <>
      <div style="inline-size: 100%" ref={(c: Component<HTMLDivElement>) => c.controls.add(bar)} />
      <Stack orientation="horizontal" wrap align="center">
        <CheckBox label="F10 focuses the bar" x-model={() => s.f10} />
        <output class="mb-log">{() => s.log}</output>
        <output class="mb-count">{() => `onItemClick ran ${s.chosen} times.`}</output>
      </Stack>
      <span class="mb-view">{() => `Word wrap ${s.wrap ? 'on' : 'off'} · status bar ${s.statusBar ? 'on' : 'off'} · zoom ${s.zoom} · theme ${s.theme}`}</span>
    </>
  );
}
```

## Submenus, check items, radio items and shortcuts

An item with `items` opens a submenu at its side. Right (Left on right-to-left pages), Enter or Space opens it, Left and Escape close it, and hovering opens it after a short delay. `checked` creates a check item, and `checked` with a `group` creates one choice in a set, shown with a dot. `shortcut` is displayed at the end of the item; an item that names a [command](commands.md) shows and runs the command’s keys. The same items work in a `Button` menu and a `ContextMenu`.

| Field | Type | Description |
| --- | --- | --- |
| `key` | `string \| number` | Names the item in paths (`file/save`), in what the user changed and in merging. Without it, an item is named by its position. |
| `text` | `Bind<string>` | The label. `&Copy` makes C select the item while the menu is open (Alt+C on a top-level menu bar item). |
| `command` | `string` | The key of an app command (`commands`). What the item is not given, such as its text, icon, keys, state and action, comes from the command. |
| `icon, hint` | `Bind<…>` | An icon at the start, and a tooltip. |
| `shortcut` | `Bind<string>` | A key combination displayed at the end (`Ctrl+S`). It is for display only: register the key with `addShortcut`, or name a command, whose keys are shown and run. |
| `description` | `Bind<string>` | A second, dimmer text after the label that distinguishes the item, such as a folder name. It is part of the item’s name and never a key. |
| `items` | `Bind<readonly MenuItem[]>` | A submenu that opens at the side. |
| `checked` | `Bind<boolean>` | A check item (`menuitemcheckbox`). |
| `group` | `Bind<string>` | With `checked`, one choice in a group (`menuitemradio`), shown with a dot. |
| `enabled, visible` | `Bind<boolean>` | Dims the item so it cannot be selected, or removes it. |
| `beginGroup` | `Bind<boolean>` | Draws a separator before the item. |
| `tone` | `Bind<'standard' \| 'accent' \| 'success' \| 'caution' \| 'danger'>` | Colors the item with a kit tone (`danger` for destructive actions). A toolbar button moved into the overflow menu keeps its tone. |
| `customizable` | `Bind<boolean>` | `false` keeps the item shown and in its place in a customizable bar; nothing moves past it. |
| `merge` | `Bind<'auto' \| 'add' \| 'replace' \| 'remove' \| 'none'>` | In a bar merged into another: what the item does there. The default is `auto`. |
| `mergeAt` | `Bind<number \| { before } \| { after }>` | In a bar merged into another: where the item stands there. The default is the end. |
| `click` | `(e) => void` | Occurs when the item is selected, after the menu closes. `e`: `{ item, source, event }`. |
| `data` | `unknown` | A custom value. |

## In this group

| Page | Content |
| --- | --- |
| `[ContextMenu](menus-context.md)` | The menu of an element, opened by a right-click, the Menu key or Shift+F10. |
| `[Customization](menus-customization.md)` | The user hides, moves, renames and adds items, and changes keyboard shortcuts; the changes are one object to save. |
| `[Programmatic changes](menus-programmatic.md)` | Items added, removed, moved and changed by path, and items that name app commands. |
| `[Merging menus](menus-merging.md)` | The bar of a document, a window or a tab shows its items in the app’s bar. |
| `[API reference](menus-api.md)` | Every prop, property, method and event. |

## Keyboard

| Key | Description |
| --- | --- |
| `Tab` | Moves focus into the menu bar (one Tab stop) and out of it. |
| `Left / Right` | On the bar, moves to the previous or next top-level item. In a menu, moves to the adjacent menu or closes a submenu (Right opens one). These keys are mirrored on right-to-left pages. |
| `Down, Enter, Space` | On the bar, opens the menu on its first item. Up opens it on the last item. |
| `Up / Down, Home / End` | In a menu, moves between items and wraps at the ends. |
| `A letter` | Moves to the next item that starts with that letter. An item’s `&` key selects it. |
| `Alt + key` | Opens the top-level item with that `&` key (Control + Option on Apple platforms). |
| `Escape` | Closes a submenu, then the menu, and returns to where it opened. |
| `F10` | Moves focus to the menu bar when `focusOnF10` is set. |
| `Menu key, Shift+F10` | Opens a context menu at the focused element; on a customizable bar, the menu of the focused item. |

## Accessibility

| Topic | Details |
| --- | --- |
| `MenuBar` | `role="menubar"` named by `label`. Top-level items are `menuitem` elements with `aria-haspopup` and `aria-expanded`, and the bar is one Tab stop (roving tabindex). |
| `Menus` | `role="menu"`. Items are `menuitem`, `menuitemcheckbox` or `menuitemradio` with `aria-checked`. Disabled items have `aria-disabled` and remain reachable. |
| `Submenus` | The item has `aria-haspopup="menu"` and `aria-expanded`. The submenu opens next to it, focus moves in and returns when it closes. |
| `Focus` | A menu opened from the keyboard focuses its first item, and a menu opened with the pointer focuses the menu itself. Closing returns focus. |
| `Shortcuts` | The shortcut text is part of the item’s name. Access keys are exposed through `aria-keyshortcuts` on top-level items. |

## Localization

Every label, shortcut and name of an item comes from your items, so they follow your own translations. A function in `text` updates immediately when the language changes. The texts of the bar itself, such as those of its customizer, come from the kit’s language packs.

## Feedback

Loading issues…
