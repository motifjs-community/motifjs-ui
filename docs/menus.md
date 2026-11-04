# MenuBar and ContextMenu

> Buttons · @motifx-community/ui 0.1.0-beta.1

A menu bar of an app (File, Edit, View) and the menu that opens on a right-click. Both show the same menu items: submenus, check and radio items, shortcuts, access keys.

## Import

```tsx
import { MenuBar, ContextMenu, attachContextMenu, type MenuItem } from '@motifx-community/ui';
```

## MenuBar

A `MenuBar` takes its top items as `items`; each one's `items` is its menu. `&File` makes Alt+F open File. Left and Right move along the bar and, while a menu is open, to the next menu; Escape goes back to the bar.

```tsx
import { reactive, type Component } from '@motifx/core';
import { CheckBox, MenuBar, Stack, type MenuItem } from '@motifx-community/ui';

/** An app's menu bar made with `new`: submenus, check and radio items, shortcuts, access keys, and `onItemClick`. */
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

## Submenus, checks, radios, shortcuts

An item with `items` opens a submenu at its side: Right (Left in a right-to-left page), Enter or Space open it, Left and Escape close it, and the pointer opens it after a short rest. `checked` makes a check item; `checked` with a `group` one choice of several, shown with a dot. `shortcut` is shown at the end of the item; register the key itself with `addShortcut`. The same items work in `Button`’s menu.

| Field | Type | Description |
| --- | --- | --- |
| `text` | `Bind<string>` | The label; `&Copy` makes C choose it while the menu is open (Alt+C on a menu bar’s top item). |
| `icon, hint` | `Bind<…>` | An icon at the start, a tooltip. |
| `shortcut` | `Bind<string>` | A key combination shown at the end (`Ctrl+S`). Only shown: register the key with `addShortcut`. |
| `description` | `Bind<string>` | A second, dimmer text after the label: what tells the item apart, such as a folder. Part of the item’s name, never a key. |
| `items` | `Bind<readonly MenuItem[]>` | A submenu, opened at the side. |
| `checked` | `Bind<boolean>` | A check item (`menuitemcheckbox`). |
| `group` | `Bind<string>` | With `checked`: one choice of a group (`menuitemradio`), shown with a dot. |
| `enabled, visible` | `Bind<boolean>` | Dimmed and not chosen, or left out. |
| `beginGroup` | `Bind<boolean>` | A line before the item. |
| `tone` | `Bind<'standard' \| 'accent' \| 'success' \| 'caution' \| 'danger'>` | The item in the kit tone color (`danger` for a destructive one); a toolbar button moved into the overflow menu keeps its tone. |
| `click` | `(e) => void` | Chosen, after the menu closed. `e`: `{ item, source, event }`. |
| `data` | `unknown` | Your own value. |

## ContextMenu

A `ContextMenu` opens on its target’s right-click at the pointer, and with the Menu key or Shift+F10 at the focused element. `onOpening` gets the element (`e.target`) and builds the items for it, here for the row of a list; `e.cancel = true` leaves the browser its own menu. It closes on Escape and a press outside; when the page scrolls it goes along with the element it opened on, and closes once that element is out of sight.

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

| Key | What it does |
| --- | --- |
| `Tab` | Into the menu bar (one stop), and out of it. |
| `Left / Right` | On the bar: the previous / next top item. In a menu: the neighbour’s menu, or close a submenu (Right opens one). Mirrored right to left. |
| `Down, Enter, Space` | On the bar: open the menu, first item. Up opens it on the last item. |
| `Up / Down, Home / End` | In a menu: move between the items, wrapping around. |
| `A letter` | The next item starting with it; an item’s `&` key chooses it. |
| `Alt + key` | Opens the top item with that `&` key (Control + Option on Apple platforms). |
| `Escape` | Closes a submenu, then the menu, back to where it opened. |
| `F10` | Focuses the menu bar, with `focusOnF10`. |
| `Menu key, Shift+F10` | Opens a context menu at the focused element. |

## Accessibility

| Topic | How |
| --- | --- |
| `MenuBar` | `role="menubar"` named by `label`; top items are `menuitem`s with `aria-haspopup` and `aria-expanded`, one Tab stop (roving tabindex). |
| `Menus` | `role="menu"`; items are `menuitem`, `menuitemcheckbox` or `menuitemradio` with `aria-checked`; disabled ones `aria-disabled`, still reachable. |
| `Submenus` | The item has `aria-haspopup="menu"` and `aria-expanded`; the submenu opens next to it, focus goes in and comes back. |
| `Focus` | A menu opened from the keyboard focuses its first item; from the pointer, the menu itself. Closing gives focus back. |
| `Shortcuts` | The shortcut text is part of the item’s name; access keys are in `aria-keyshortcuts` on the top items. |

## Localization

Menus write no text of their own: every label, shortcut and name comes from your items, so they follow your own translations (a function in `text` follows a language change at once).

## Styling

| Hook | What it is |
| --- | --- |
| `.mx-menubar, .mx-menubar__bar, .mx-menubar__item` | The menu bar, its row, a top item (`aria-expanded="true"` while open). |
| `.mx-context-menu, .mx-context-menu__anchor` | The context menu (no box of its own) and the point it opens at. |
| `.mx-menu, .mx-menu__item, .mx-menu__separator` | A menu (shared with Button), an item, a line. |
| `.mx-menu__check, .mx-menu__icon, .mx-menu__label, .mx-menu__description, .mx-menu__shortcut, .mx-menu__arrow` | The parts of an item. |

### Component tokens

| Token | What it sets |
| --- | --- |
| `menubar.height, menubar.item-height` | The heights of the bar and of a top item. |
| `menubar.bar, menubar.item, menubar.icon, menubar.mnemonic` | Units: the bar; a top item with its box per state (`hover`, `pressed`, `open`, `disabled`, `focus`); its icon; its access key’s mark (`shown`). |
| `menu.item, menu.item-height, menu.item-white-space` | Menu items (shared with Button’s menu): the item unit in each state (`highlight`, `pressed`, `focus`, `checked`, `disabled`, `first`, `last`, each tone and `<tone>-highlight`), the row height, whether a text wraps. |
| `menu.panel, menu.check, menu.icon, menu.check-mark, menu.radio-mark, menu.separator` | Units: the column of items, the leading mark and icon, the check and radio marks, the line between groups. |
| `menu.label, menu.description, menu.shortcut, menu.arrow` | Units: an item’s text, its description, the shortcut and the submenu arrow. |

## API reference

### MenuBar props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` | `Bind<readonly MenuItem[]>` | `[]` | The top items; their `items` are the menus they open. A top item without `items` runs its `click`. |
| `label` | `Bind<string>` | `''` | Names the bar for screen readers. The same property as `text`. |
| `focusOnF10` | `Bind<boolean>` | `false` | F10 moves focus to the bar from anywhere on the page. Off by default: browsers use F10. |
| `openOnHover` | `Bind<boolean>` | `true` | While a menu is open, pointing at another top item opens its menu; pointing at an item opens its submenu. |
| `enabled / disabled, visible, tabStop, tabIndex` | see Control |  | The shared properties of every control. |

### ContextMenu props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` | `Bind<readonly MenuItem[]>` | `[]` | The commands; `onOpening` can give others per element. |
| `target` | `Bind<Element \| Component \| null>` | its parent | Whose menu it is. Without it, the element the `ContextMenu` is placed in. |
| `label` | `Bind<string>` | `''` | Names the menu for screen readers. |
| `keyboard` | `Bind<boolean>` | `true` | The Menu key and Shift+F10 open it at the focused element. |
| `closeOnScroll` | `Bind<boolean>` | `true` | Scrolling that takes the element it opened on out of sight closes it; until then the menu goes along with that element. |
| `openOnHover` | `Bind<boolean>` | `true` | Pointing at an item opens its submenu. |
| `enabled` | `Bind<boolean>` | `true` | `false`: the browser shows its own menu. |

### Properties

| Property | Access | Description |
| --- | --- | --- |
| `MenuBar.openItem` | read-only, reactive | The top item whose menu is open. |
| `ContextMenu.opened` | read-only, reactive | Whether it is open. |
| `ContextMenu.targetElement` | read-only, reactive | The element it was last opened on. |
| `ContextMenu.target` | read/write, reactive | The element it listens on. |

### Methods

| Method | Returns | Description |
| --- | --- | --- |
| `MenuBar.open(item \| index)` | `boolean` | Opens a top item’s menu with focus on its first item. |
| `MenuBar.close()` | `void` | Closes the open menu. |
| `ContextMenu.open(at, target?)` | `boolean` | Opens it from code, at `{ x, y }` or at an element. |
| `ContextMenu.close()` | `void` | Closes it. |
| `MenuBar.refresh(), ContextMenu.refresh()` | `void` | Your items may be plain or reactive; the menu reads them as they are. After changing them in place, call `refresh()`. The bar, the open menu and its submenus follow. |
| `attachContextMenu(target, items)` | `() => void` | Gives an element or component a menu; `items` can be a function of the opening (`e.target`). Returns the remover. |

### Events

| Event | When |
| --- | --- |
| `onItemClick(e)` | Both: an item was chosen, after its own `click`. |
| `ContextMenu.onOpening(e)` | About to open. `e`: `{ target, items, cancel, byKeyboard, event, source }`; set `e.items` for the element, or `e.cancel = true`. |
| `ContextMenu.onClosed(reason)` | `escape`, `outside`, `focus` or `code`. |
