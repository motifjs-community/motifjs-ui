# MenuBar and ContextMenu

> Buttons · @motifx-community/ui 0.1.0-beta.7

An application menu bar (File, Edit, View) and a context menu that opens on right-click. Both use the same menu items, which support submenus, check and radio items, shortcuts and access keys.

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

An item with `items` opens a submenu at its side. Right (Left on right-to-left pages), Enter or Space opens it, Left and Escape close it, and hovering opens it after a short delay. `checked` creates a check item, and `checked` with a `group` creates one choice in a set, shown with a dot. `shortcut` is displayed at the end of the item, so register the key separately with `addShortcut`. The same items work in a `Button` menu.

| Field | Type | Description |
| --- | --- | --- |
| `text` | `Bind<string>` | The label. `&Copy` makes C select the item while the menu is open (Alt+C on a top-level menu bar item). |
| `icon, hint` | `Bind<…>` | An icon at the start, and a tooltip. |
| `shortcut` | `Bind<string>` | A key combination displayed at the end (`Ctrl+S`). It is for display only, so register the key with `addShortcut`. |
| `description` | `Bind<string>` | A second, dimmer text after the label that distinguishes the item, such as a folder name. It is part of the item's name and never a key. |
| `items` | `Bind<readonly MenuItem[]>` | A submenu that opens at the side. |
| `checked` | `Bind<boolean>` | A check item (`menuitemcheckbox`). |
| `group` | `Bind<string>` | With `checked`, one choice in a group (`menuitemradio`), shown with a dot. |
| `enabled, visible` | `Bind<boolean>` | Dims the item so it cannot be selected, or removes it. |
| `beginGroup` | `Bind<boolean>` | Draws a separator before the item. |
| `tone` | `Bind<'standard' \| 'accent' \| 'success' \| 'caution' \| 'danger'>` | Colors the item with a kit tone (`danger` for destructive actions). A toolbar button moved into the overflow menu keeps its tone. |
| `click` | `(e) => void` | Occurs when the item is selected, after the menu closes. `e`: `{ item, source, event }`. |
| `data` | `unknown` | A custom value. |

## ContextMenu

A `ContextMenu` opens at the pointer when its target is right-clicked, and at the focused element with the Menu key or Shift+F10. `onOpening` receives the element (`e.target`) and builds the items for it, in this case for a row in a list. Setting `e.cancel = true` leaves the browser's own menu. The menu closes on Escape or a click outside. When the page scrolls, it follows the element it opened on and closes once that element is out of view.

```tsx
import { reactive, type Component } from '@motifx/core';
import { ContextMenu, type MenuItem } from '@motifx-community/ui';

interface FileRow {
  id: number;
  name: string;
  locked: boolean;
  starred: boolean;
}

const BOX = 'inline-size: 100%; margin: 0; list-style: none; padding: var(--mx-space-4); background: var(--mx-color-bg-card); border: var(--mx-border-width-1) solid var(--mx-color-stroke-card); border-radius: var(--mx-radius-lg)';

/** A context menu whose items `onOpening` builds for the row of a list it opens on. */
export default function FileList() {
  const s = reactive({
    log: 'Nothing chosen yet.',
    files: [
      { id: 1, name: 'report.docx', locked: false, starred: true },
      { id: 2, name: 'budget.xlsx', locked: true, starred: false },
      { id: 3, name: 'photo.png', locked: false, starred: false },
    ] as FileRow[],
  });
  let renamed = 0;
  let list: Component<HTMLUListElement> | null = null;

  const did = (what: string) => (s.log = what);
  const rename = (row: FileRow) => {
    row.name = `copy-${++renamed}-${row.name}`;
    did(`Renamed to ${row.name}`);
  };

  const rowItems = (row: FileRow): MenuItem[] => [
    { text: '&Open', click: () => did(`Open ${row.name}`) },
    { text: '&Rename', enabled: !row.locked, click: () => rename(row) },
    { text: '&Star', checked: row.starred, click: () => (row.starred = !row.starred) },
    { text: '&Move to', items: ['Documents', 'Pictures', 'Archive'].map((folder) => ({ text: folder, click: () => did(`Move ${row.name} to ${folder}`) })) },
    { text: '&Delete', shortcut: 'Del', beginGroup: true, enabled: !row.locked, click: () => (s.files = s.files.filter((f) => f !== row)) },
  ];

  const rowOf = (el: Element) => {
    const id = Number(el.closest('[data-id]')?.getAttribute('data-id'));
    return s.files.find((f) => f.id === id);
  };

  return (
    <>
      <ul class="cm-list" aria-label="Files" ref={(c: Component<HTMLUListElement>) => (list = c)} style={BOX}>
        {s.files.map((file) => (
          <li key={file.id} data-id={String(file.id)} tabindex="0" style="padding-block: var(--mx-space-2)">
            {() => `${file.starred ? '★ ' : ''}${file.name}${file.locked ? ' (locked)' : ''}`}
          </li>
        ))}
      </ul>
      <ContextMenu
        target={() => list}
        label="File"
        onOpening={(e) => {
          const row = rowOf(e.target);
          if (row) e.items = rowItems(row);
          else e.cancel = true;
        }}
      />
      <output class="cm-log">{() => s.log}</output>
    </>
  );
}
```

```tsx
import { reactive, type Component } from '@motifx/core';
import { attachContextMenu } from '@motifx-community/ui';

const START = 'Right-click here, or focus me and press the Menu key.';
const BOX = 'padding: var(--mx-space-4); background: var(--mx-color-bg-card); border: var(--mx-border-width-1) solid var(--mx-color-stroke-card); border-radius: var(--mx-radius-lg)';

/** A menu given to an element with `attachContextMenu`, its items built from the opening. */
export default function AttachedMenu() {
  const s = reactive({ zone: START });

  const attach = (c: Component<HTMLDivElement>) => {
    const remove = attachContextMenu(c, (e) => [
      { text: '&Say where', click: () => (s.zone = `Opened ${e.byKeyboard ? 'from the keyboard' : 'with the pointer'} on <${e.target.tagName.toLowerCase()}>.`) },
      { text: '&Reset', click: () => (s.zone = START) },
    ]);
    c.motif.setDisposable(remove);
  };

  return (
    <div class="cm-zone" tabindex="0" style={BOX} onBuilt={attach}>
      {() => s.zone}
    </div>
  );
}
```

## Keyboard

| Key | Description |
| --- | --- |
| `Tab` | Moves focus into the menu bar (one Tab stop) and out of it. |
| `Left / Right` | On the bar, moves to the previous or next top-level item. In a menu, moves to the adjacent menu or closes a submenu (Right opens one). These keys are mirrored on right-to-left pages. |
| `Down, Enter, Space` | On the bar, opens the menu on its first item. Up opens it on the last item. |
| `Up / Down, Home / End` | In a menu, moves between items and wraps at the ends. |
| `A letter` | Moves to the next item that starts with that letter. An item's `&` key selects it. |
| `Alt + key` | Opens the top-level item with that `&` key (Control + Option on Apple platforms). |
| `Escape` | Closes a submenu, then the menu, and returns to where it opened. |
| `F10` | Moves focus to the menu bar when `focusOnF10` is set. |
| `Menu key, Shift+F10` | Opens a context menu at the focused element. |

## Accessibility

| Topic | Details |
| --- | --- |
| `MenuBar` | `role="menubar"` named by `label`. Top-level items are `menuitem` elements with `aria-haspopup` and `aria-expanded`, and the bar is one Tab stop (roving tabindex). |
| `Menus` | `role="menu"`. Items are `menuitem`, `menuitemcheckbox` or `menuitemradio` with `aria-checked`. Disabled items have `aria-disabled` and remain reachable. |
| `Submenus` | The item has `aria-haspopup="menu"` and `aria-expanded`. The submenu opens next to it, focus moves in and returns when it closes. |
| `Focus` | A menu opened from the keyboard focuses its first item, and a menu opened with the pointer focuses the menu itself. Closing returns focus. |
| `Shortcuts` | The shortcut text is part of the item's name. Access keys are exposed through `aria-keyshortcuts` on top-level items. |

## Localization

Menus have no strings of their own. Every label, shortcut and name comes from your items, so they follow your own translations. A function in `text` updates immediately when the language changes.

## Styling

| Hook | Description |
| --- | --- |
| `.mx-menubar, .mx-menubar__bar, .mx-menubar__item` | The menu bar, its row and a top-level item (`aria-expanded="true"` while open). |
| `.mx-context-menu, .mx-context-menu__anchor` | The context menu, which has no box of its own, and the point it opens at. |
| `.mx-menu, .mx-menu__item, .mx-menu__separator` | A menu (shared with Button), an item and a separator. |
| `.mx-menu__check, .mx-menu__icon, .mx-menu__label, .mx-menu__description, .mx-menu__shortcut, .mx-menu__arrow` | The parts of an item. |

### Component tokens

| Token | Description |
| --- | --- |
| `menubar.height, menubar.item-height` | The height of the bar and of a top-level item. |
| `menubar.bar, menubar.item, menubar.icon, menubar.mnemonic` | Units: the bar, a top-level item with its box per state (`hover`, `pressed`, `open`, `disabled`, `focus`), its icon, and its access key indicator (`shown`). |
| `menu.item, menu.item-height, menu.item-white-space` | Menu items, shared with the Button menu: the item unit in each state (`highlight`, `pressed`, `focus`, `checked`, `disabled`, `first`, `last`, each tone and `<tone>-highlight`), the row height, and text wrapping. |
| `menu.panel, menu.check, menu.icon, menu.check-mark, menu.radio-mark, menu.separator` | Units: the item column, the leading indicator and icon, the check and radio marks, and the separator between groups. |
| `menu.label, menu.description, menu.shortcut, menu.arrow` | Units: the item text, its description, the shortcut and the submenu arrow. |

## API reference

### MenuBar props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` | `Bind<readonly MenuItem[]>` | `[]` | The top-level items, whose `items` define the menus they open. A top-level item without `items` runs its `click`. |
| `label` | `Bind<string>` | `''` | The accessible name of the bar. This is the same property as `text`. |
| `focusOnF10` | `Bind<boolean>` | `false` | F10 moves focus to the bar from anywhere on the page. This is off by default because browsers use F10. |
| `openOnHover` | `Bind<boolean>` | `true` | While a menu is open, hovering another top-level item opens its menu, and hovering an item opens its submenu. |
| `enabled / disabled, visible, tabStop, tabIndex` | see Control |  | Properties shared by all controls. |

### ContextMenu props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` | `Bind<readonly MenuItem[]>` | `[]` | The commands. `onOpening` can provide different ones for each element. |
| `target` | `Bind<Element \| Component \| null>` | Its parent | The element the menu belongs to. If not set, this is the element the `ContextMenu` is placed in. |
| `label` | `Bind<string>` | `''` | The accessible name of the menu. |
| `keyboard` | `Bind<boolean>` | `true` | The Menu key and Shift+F10 open the menu at the focused element. |
| `closeOnScroll` | `Bind<boolean>` | `true` | Scrolling the element out of view closes the menu. Until then, the menu follows the element. |
| `openOnHover` | `Bind<boolean>` | `true` | Hovering an item opens its submenu. |
| `enabled` | `Bind<boolean>` | `true` | `false` shows the browser's own menu. |

### Properties

| Property | Access | Description |
| --- | --- | --- |
| `MenuBar.openItem` | read-only, reactive | The top-level item whose menu is open. |
| `ContextMenu.opened` | read-only, reactive | Indicates whether it is open. |
| `ContextMenu.targetElement` | read-only, reactive | The element the menu was last opened on. |
| `ContextMenu.target` | read/write, reactive | The element the menu listens on. |

### Methods

| Method | Returns | Description |
| --- | --- | --- |
| `MenuBar.open(item \| index)` | `boolean` | Opens a top-level item's menu with focus on its first item. |
| `MenuBar.close()` | `void` | Closes the open menu. |
| `ContextMenu.open(at, target?)` | `boolean` | Opens the menu programmatically, at `{ x, y }` or at an element. |
| `ContextMenu.close()` | `void` | Closes it. |
| `MenuBar.refresh(), ContextMenu.refresh()` | `void` | Your items can be plain or reactive, and the menu reads them as they are. After changing them in place, call `refresh()`. The bar, the open menu and its submenus update. |
| `attachContextMenu(target, items)` | `() => void` | Attaches a menu to an element or component. `items` can be a function of the opening event (`e.target`). Returns a function that removes the menu. |

### Events

| Event | When |
| --- | --- |
| `onItemClick(e)` | On both components, occurs when an item is selected, after its own `click`. |
| `ContextMenu.onOpening(e)` | Occurs before the menu opens. `e`: `{ target, items, cancel, byKeyboard, event, source }`. Set `e.items` for the element, or set `e.cancel = true`. |
| `ContextMenu.onClosed(reason)` | `escape`, `outside`, `focus` or `code`. |

## Feedback

Loading issues…
