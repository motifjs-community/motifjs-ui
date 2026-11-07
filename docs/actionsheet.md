# ActionSheet

> Navigation · @motifx-community/ui 0.1.0-beta.6

A list of commands that slides up from the bottom of the screen, built from the kit's menu items and sized for touch. It supports a title, a message and a separate Cancel button. A context menu uses it on touch screens.

## Import

```tsx
import { ActionSheet, type ActionSheetProps } from '@motifx-community/ui';
```

## Choosing programmatically

`choose()` opens the sheet and resolves with the selected item, or `null`. An item with `items` opens its submenu in place, with a Back option.

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

## Using it in JSX

Bind it with `x-model`. Check and radio items show their marks, and `cancelText` sets the Cancel button text.

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

## Context menus on touch screens

`ContextMenu` has a `presentation` prop: `'menu'` (the default), `'sheet'`, or `'auto'`, which opens an action sheet when a finger opened the menu with a long press. The items, `onOpening` and `onItemClick` stay the same.

```tsx
import { reactive, type Component } from '@motifx/core';
import { ContextMenu, RadioGroup, Stack, type ContextMenuPresentation, type MenuItem } from '@motifx-community/ui';

const ROWS = ['Invoice 1042', 'Invoice 1043', 'Invoice 1044'];

/** One ContextMenu, shown as a menu, as an action sheet, or (auto) as a sheet when opened by touch: long press a row on a phone. */
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

| Key | Description |
| --- | --- |
| `Up, Down, Home, End` | Moves between the items, wrapping at the ends. |
| `Enter, Space, an item's `&` letter` | Selects the item, or opens a submenu in place. |
| `A letter` | Moves to the next item that starts with that letter. |
| `Escape` | Closes the sheet without a selection. |
| `Tab` | Moves to the Cancel button and back. |

## Accessibility

| Topic | Details |
| --- | --- |
| `Dialog and menu` | The sheet is a `dialog` named by its title. The items are a `menu` of `menuitem`, `menuitemcheckbox` and `menuitemradio` elements, as in the kit's menus. |
| `Focus` | When opened from the keyboard, focus moves to the first item. When opened by touch or pointer, it moves to the list. Focus returns to where it was when the sheet closes. |
| `Submenus` | Submenus replace the menu in place, with "Back" as the first item. An arrow at the end of an item indicates a submenu. |
| `Touch` | Items are `control.height.lg` tall (`actionsheet.item-height`), which exceeds the 24 pixels required by WCAG 2.2. |

## Localization

Cancel, Back and the default name come from `uiLocale.strings` (`cancel`, `back`, `actionSheetLabel`). `cancelText` sets custom text.

## Styling

| Hook | Description |
| --- | --- |
| `.mx-action-sheet` | Built on the bottom sheet layer (`.mx-bottom-sheet`) and its hooks. |
| `.mx-action-sheet__message` | Text below the title. |
| `.mx-action-sheet__list` | The menu (`.mx-menu`). |
| `.mx-action-sheet__cancel` | The Cancel button row. |
| `.mx-action-sheet__back` | The Back indicator. |

### Component tokens

| Token | Description |
| --- | --- |
| `actionsheet.message, actionsheet.back, actionsheet.cancel` | Units: the message, the Back item indicator (`rtl`), and the strip that holds the Cancel button. |
| `actionsheet.menu.*, actionsheet.cancel-button.*, actionsheet.sheet.*` | Places: touch-sized items, the Cancel button and the sheet content padding. |
| `sheet.*` | The surface, handle and title, as on the bottom sheet. |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` | `Bind<readonly MenuItem[]>` | `[]` | The commands: kit menu items with icons, check and radio marks, tones, `&` keys, groups and submenus. Shortcuts are not shown. |
| `title` | `Bind<string>` | `''` | A title above the items, which also names the sheet. Otherwise, the name comes from `label`, or is "Actions". |
| `message` | `Bind<string>` | `''` | A line below the title that explains the choice. |
| `showCancel` | `Bind<boolean>` | `true` | Shows a separate Cancel button at the bottom. |
| `cancelText` | `Bind<string>` | `''` | Its text. An empty value uses the `uiLocale` Cancel string. |
| `detents` | `Bind<readonly BottomSheetDetent[]>` | `['fit']` | The height of its items, up to full. Any bottom sheet height works. |
| `onItemClick` | `(e: MenuItemClickEventArgs) => void` | — | Occurs when an item is selected, after the sheet closes and the item's own `click` runs. |
| `every BottomSheet prop` | see BottomSheet |  | Modal behavior, the handle, swipe down, Escape, the scrim and the back button work as on the [BottomSheet page](bottomsheet.md#api). |

### Members

| Member | Returns | Description |
| --- | --- | --- |
| `choose(items?, host?)` | `Promise<MenuItem \| null>` | Opens the sheet with these items and resolves with the selected item, or `null` if it closes without a selection. `host` gives it a place if it has none. |
| `open(byKeyboard?)` | `boolean` | Opens the sheet. `byKeyboard` moves focus to the first item. Otherwise, focus moves to the list, as with a menu opened by the pointer. |
| `chosenItem` | read-only | The item selected the last time the sheet was open. |
| `menu` | read-only | Its `MenuList`. |
| `refresh()` | `void` | Your items can be plain or reactive, and the sheet reads them as they are. After changing them in place, call `refresh()`. The visible level updates. |
| `ContextMenu presentation` | `Bind<'menu' \| 'sheet' \| 'auto'>` | On `ContextMenu`, the default is `'menu'`. `'sheet'` opens its items in an action sheet. `'auto'` does so when a finger opened the menu with a long press, or on a screen with only a coarse pointer unless a key opened it. `onOpening`, `onItemClick` and `onClosed` work the same way, and `actionSheet` is the sheet. |

## Feedback

Loading issues…
