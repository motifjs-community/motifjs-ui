# ActionSheet

> Navigation · @motifx-community/ui 0.1.0-beta.2

A list of commands that comes up from the bottom, made of the kit's menu items and large enough for a finger, with a title, a message and a cancel button apart. A context menu opens its items here on a touch screen.

## Import

```tsx
import { ActionSheet, type ActionSheetProps } from '@motifx-community/ui';
```

## Choosing from code

`choose()` opens it and resolves with the item chosen, or `null`. An item with `items` opens its submenu in place, with a way back.

```tsx
import { reactive, type Component } from '@motifx/core';
import { ActionSheet, Button, type MenuItem } from '@motifx-community/ui';

const ITEMS: MenuItem[] = [
  { text: '&Share…' },
  { text: '&Rename…' },
  {
    text: '&Move to',
    items: [{ text: 'Reports' }, { text: 'Archive' }, { text: 'Shared with me' }],
  },
  { text: '&Delete', tone: 'danger', beginGroup: true },
];

/** choose() opens the sheet and resolves with the item chosen, or null; a submenu opens in place, with a way back. */
export default function Choose() {
  const s = reactive({ said: 'Nothing chosen yet.' });
  let host!: Component<HTMLDivElement>;

  const ask = async () => {
    const sheet = new ActionSheet({ title: 'report.pdf', message: 'Changed today at 09:41' });
    const item = await sheet.choose(ITEMS, host);
    s.said = item ? `Chosen: ${String(item.text).replace('&', '')}` : 'Closed without a choice.';
  };

  return (
    <div ref={(c: Component<HTMLDivElement>) => (host = c)} style="display: contents">
      <Button text="Actions…" variant="outline" onclick={ask} />
      <output>{() => s.said}</output>
    </div>
  );
}
```

## In JSX

Bound with `x-model`; check and radio items show their marks, `cancelText` names the cancel button.

```tsx
import { reactive } from '@motifx/core';
import { ActionSheet, Button, type MenuItem } from '@motifx-community/ui';

/** An action sheet in JSX, bound with x-model, with checked items and its own cancel text; onItemClick reports the choice. */
export default function InJsx() {
  const s = reactive({ open: false, sort: 'date', said: '' });

  const sortItem = (value: string, text: string): MenuItem => ({
    text,
    group: 'sort',
    checked: () => s.sort === value,
    click: () => (s.sort = value),
  });

  return (
    <>
      <Button text={() => `Sort by: ${s.sort}`} variant="outline" onclick={() => (s.open = true)} />
      <output>{() => s.said}</output>
      <ActionSheet
        title="Sort by"
        cancelText="Keep as it is"
        items={[sortItem('date', 'Date'), sortItem('name', 'Name'), sortItem('size', 'Size')]}
        x-model={() => s.open}
        onItemClick={(e) => (s.said = `Sorted by ${String(e.item.text).toLowerCase()}.`)}
      />
    </>
  );
}
```

## A context menu on a touch screen

`ContextMenu` has `presentation`: `'menu'` (the default), `'sheet'`, or `'auto'`, which opens an action sheet when a finger opened the menu (a long press). The items, `onOpening` and `onItemClick` stay the same.

```tsx
import { reactive, type Component } from '@motifx/core';
import { ContextMenu, RadioGroup, Stack, type ContextMenuPresentation, type MenuItem } from '@motifx-community/ui';

const ROWS = ['Invoice 1042', 'Invoice 1043', 'Invoice 1044'];

/** One ContextMenu, shown as a menu, as an action sheet, or (auto) as a sheet when a finger opened it: long press a row on a phone. */
export default function FromContextMenu() {
  const s = reactive({ presentation: 'auto' as ContextMenuPresentation, said: '' });
  let list!: Component<HTMLUListElement>;

  const items = (row: string): MenuItem[] => [
    { text: `&Open ${row}`, click: () => (s.said = `Opened ${row}`) },
    { text: '&Copy number', click: () => (s.said = `Copied ${row}`) },
    { text: '&Delete', tone: 'danger', click: () => (s.said = `Deleted ${row}`) },
  ];

  return (
    <Stack gap="sm">
      <RadioGroup
        label="Presentation"
        orientation="horizontal"
        items={[
          { value: 'menu', text: 'Menu' },
          { value: 'sheet', text: 'Sheet' },
          { value: 'auto', text: 'Auto' },
        ]}
        itemText="text"
        itemValue="value"
        x-model={() => s.presentation}
      />
      <ul ref={(c: Component<HTMLUListElement>) => (list = c)} aria-label="Invoices" style="margin: 0; padding: 0; list-style: none">
        {ROWS.map((row) => (
          <li key={row} tabindex="0" data-row={row} style="padding: var(--mx-space-3); border-block-end: var(--mx-border-width-1) solid var(--mx-color-stroke-divider); user-select: none">
            {row}
          </li>
        ))}
      </ul>
      <output>{() => s.said || 'Right-click or long press a row; the Menu key on a focused row.'}</output>
      <ContextMenu
        label="Invoice"
        target={() => list}
        presentation={() => s.presentation}
        onOpening={(e) => {
          const row = (e.target as Element).closest('[data-row]')?.getAttribute('data-row');
          if (row) e.items = items(row);
          else e.cancel = true;
        }}
      />
    </Stack>
  );
}
```

## Keyboard

| Key | What it does |
| --- | --- |
| `Up, Down, Home, End` | Between the items, round at the ends. |
| `Enter, Space, an item's `&` letter` | Chooses it; on a submenu, opens it in place. |
| `A letter` | The next item that starts with it. |
| `Escape` | Closes it without a choice. |
| `Tab` | To the cancel button and back. |

## Accessibility

| Topic | How |
| --- | --- |
| `Dialog and menu` | The sheet is a `dialog` named by its title; the items are a `menu` of `menuitem`, `menuitemcheckbox` and `menuitemradio`, as in the kit's menus. |
| `Focus` | Opened by a key, on the first item; by a finger or the pointer, on the list. It goes back where it was when the sheet closes. |
| `Submenus` | Open in place of their menu with "Back" first; the arrow at the end of an item says it has one. |
| `Touch` | Items are `control.height.lg` high (`actionsheet.item-height`), larger than the 24 pixels WCAG 2.2 asks for. |

## Localization

Cancel, the way back and its default name come from `uiLocale.strings` (`cancel`, `back`, `actionSheetLabel`); `cancelText` gives one of your own.

## Styling

| Hook | What it is |
| --- | --- |
| `.mx-action-sheet` | On the bottom sheet's layer (`.mx-bottom-sheet`), whose hooks it has. |
| `.mx-action-sheet__message` | The line under the title. |
| `.mx-action-sheet__list` | The menu (`.mx-menu`). |
| `.mx-action-sheet__cancel` | The row of the cancel button. |
| `.mx-action-sheet__back` | The mark of the way back. |

### Component tokens

| Token | What it sets |
| --- | --- |
| `actionsheet.message, actionsheet.back, actionsheet.cancel` | Units: the message, the mark of the item that goes back out of a submenu (`rtl`), the strip that holds the cancel button. |
| `actionsheet.menu.*, actionsheet.cancel-button.*, actionsheet.sheet.*` | Places: the items, large enough for a finger; the cancel button; the sheet’s content padding. |
| `sheet.*` | The surface, the handle and the title, as on the bottom sheet. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` | `Bind<readonly MenuItem[]>` | `[]` | The commands: the kit's menu items, with their icons, check and radio marks, tones, `&` keys, groups and submenus (shortcuts are not shown). |
| `title` | `Bind<string>` | `''` | A title above the items; it names the sheet (else `label`, else "Actions"). |
| `message` | `Bind<string>` | `''` | A line under the title that says what the choice is about. |
| `showCancel` | `Bind<boolean>` | `true` | A cancel button apart, at the bottom. |
| `cancelText` | `Bind<string>` | `''` | Its text; empty for `uiLocale`'s Cancel. |
| `detents` | `Bind<readonly BottomSheetDetent[]>` | `['fit']` | As tall as its items (up to full); any of the bottom sheet's heights. |
| `onItemClick` | `(e: MenuItemClickEventArgs) => void` | — | An item was chosen, after the sheet closed and the item's own `click` ran. |
| `every BottomSheet prop` | see BottomSheet |  | Modal, the handle, swipe down, Escape, the scrim and the back button work as on the [BottomSheet page](bottomsheet.md#api). |

### Members

| Member | Returns | Description |
| --- | --- | --- |
| `choose(items?, host?)` | `Promise<MenuItem \| null>` | Opens it (with these items) and resolves with the item chosen, or `null` when it was closed without one. `host` gives it a place when it has none. |
| `open(byKeyboard?)` | `boolean` | Opens it; `byKeyboard` puts focus on the first item, else on the list as a menu the pointer opened. |
| `chosenItem` | read-only | The item chosen the last time it was open. |
| `menu` | read-only | Its `MenuList`. |
| `refresh()` | `void` | Your items may be plain or reactive; the sheet reads them as they are. After changing them in place, call `refresh()`. The level shown follows. |
| `ContextMenu presentation` | `Bind<'menu' \| 'sheet' \| 'auto'>` | On `ContextMenu`, default `'menu'`. `'sheet'` opens its items in an action sheet; `'auto'` does when a finger opened it (a long press), or on a screen with only a coarse pointer when not opened by a key. `onOpening`, `onItemClick` and `onClosed` work the same; `actionSheet` is the sheet. |
