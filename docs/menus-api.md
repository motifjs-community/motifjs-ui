# MenuBar: API reference

> MenuBar · @motifx-community/ui 0.1.0-beta.10

Every prop, property, method and event of `MenuBar` and `ContextMenu`, the fields of a menu item, and the styling hooks and tokens.

## MenuBar props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` | `Bind<readonly MenuItem[]>` | `[]` | The top-level items, whose `items` define the menus they open. A top-level item without `items` runs its `click`. |
| `label` | `Bind<string>` | `''` | The accessible name of the bar. This is the same property as `text`. |
| `focusOnF10` | `Bind<boolean>` | `false` | F10 moves focus to the bar from anywhere on the page. This is off by default because browsers use F10. |
| `openOnHover` | `Bind<boolean>` | `true` | While a menu is open, hovering another top-level item opens its menu, and hovering an item opens its submenu. |
| `customizable` | `Bind<boolean>` | `false` | The user can hide and move items from the menu of a right-click or Shift+F10. Each item can say otherwise. |
| `customization` | `Bind<MenuBarCustomization \| null>` | `null` | What the user changed, as `onCustomized` reported it, to restore. |
| `commands` | `Bind<readonly MenuItem[]>` | The app’s commands | The commands the user can add in the customizer, each with a `key`. |
| `customizer` | `Bind<boolean>` | `true` | The menu of a right-click offers the customizer when `customizable` is on. |
| `customizerKeyboard` | `Bind<boolean>` | `true` | The customizer has a Keyboard page ([ShortcutEditor](shortcuteditor.md)). |
| `mergeHost` | `Bind<boolean>` | `false` | The app’s bar: other bars merge their items into it. |
| `mergeName` | `Bind<string>` | `'main'` | The name of the app’s bar, when there are several. |
| `mergeInto` | `Bind<string \| MenuBar \| null>` | `null` | The app’s bar to merge into: its name or the bar itself. |
| `mergeWhen` | `Bind<'shown' \| 'focus' \| 'manual'>` | `'shown'` | When the bar merges. |
| `mergeScope` | `Bind<ComponentBase \| null>` | Its parent | The place whose being shown or focused merges the bar. |
| `hideWhenMerged` | `Bind<boolean>` | `true` | The bar is hidden while it is merged. |
| `enabled / disabled, visible, tabStop, tabIndex` | see Control |  | Properties shared by all controls. |

## ContextMenu props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` | `Bind<readonly MenuItem[]>` | `[]` | The commands. `onOpening` can provide different ones for each component. |
| `target` | `Bind<Component \| null>` | Its parent | The component the menu belongs to. If not set, this is the component the `ContextMenu` is placed in. |
| `label` | `Bind<string>` | `''` | The accessible name of the menu. |
| `keyboard` | `Bind<boolean>` | `true` | The Menu key and Shift+F10 open the menu at the focused element. |
| `closeOnScroll` | `Bind<boolean>` | `true` | Scrolling the element out of view closes the menu. Until then, the menu follows the element. |
| `openOnHover` | `Bind<boolean>` | `true` | Hovering an item opens its submenu. |
| `enabled` | `Bind<boolean>` | `true` | `false` shows the browser’s own menu. |

## MenuItem

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

## Properties

| Property | Access | Description |
| --- | --- | --- |
| `MenuBar.openItem` | read-only, reactive | The top-level item whose menu is open. |
| `MenuBar.mergedBars` | read-only | On the app’s bar: the bars merged into it, in the order they came. |
| `MenuBar.mergedInto` | read-only | On a bar that merges: the app’s bar it is merged into, or `null`. |
| `MenuBar.mergedItems` | read-only | The top-level items as drawn now, the merged bars’ included. |
| `ContextMenu.opened` | read-only, reactive | Indicates whether it is open. |
| `ContextMenu.targetPart` | read-only, reactive | The component the menu was last opened on. |
| `ContextMenu.target` | read/write, reactive | The component the menu listens on. |

## Methods

| Method | Returns | Description |
| --- | --- | --- |
| `MenuBar.open(item \| index \| key)` | `boolean` | Opens a top-level item’s menu with focus on its first item. |
| `MenuBar.close()` | `void` | Closes the open menu. |
| `MenuBar.findItem(path)` | `MenuItem \| null` | The item at the path, as it is now. |
| `MenuBar.addItem(parentPath, item, index?)` | `boolean` | Adds an item to the menu at `parentPath` (the bar when empty). |
| `MenuBar.removeItem(path)` | `boolean` | Removes the item with its menu. |
| `MenuBar.moveItem(path, index, toParent?)` | `boolean` | Moves the item in its menu or into another one. |
| `MenuBar.updateItem(path, changes)` | `boolean` | Changes fields of the item. |
| `MenuBar.beginUpdate(), endUpdate()` | `void` | Applies the changes made between them at once. |
| `MenuBar.openCustomizer()` | `boolean` | Opens the customizer window. Returns `false` when it is already open. |
| `MenuBar.merge(), unmerge()` | `boolean` | Merges the bar into the app’s bar, or takes its items back. |
| `MenuBar.refresh(), ContextMenu.refresh()` | `void` | Reads items changed in place again. The bar, the open menu and its submenus update. |
| `ContextMenu.open(at, target?)` | `boolean` | Opens the menu programmatically, at `{ x, y }` or at a component. |
| `ContextMenu.close()` | `void` | Closes it. |
| `attachContextMenu(target, items)` | `() => void` | Attaches a menu to a component. `items` can be a function of the opening event (`e.part`). Returns a function that removes the menu. |

## Events

| Event | When |
| --- | --- |
| `onItemClick(e)` | On both components, occurs when an item is selected, after its own `click`. `e`: `{ item, source, event }`. |
| `MenuBar.onCustomized(e)` | The user changed the bar. `e`: `{ customization, source }`, everything changed so far. |
| `MenuBar.onCustomMenuOpening(e)` | Before the menu of a right-click opens. `e`: `{ item, path, items, cancel, byKeyboard, event, source }`. |
| `MenuBar.onItemsChanged(e)` | After a change by path. `e`: `{ items, source }`, the new list to keep. |
| `MenuBar.onMerged(e), onUnmerged(e)` | On the app’s bar: a bar merged into it or left it. `e`: `{ bar, source }`. |
| `ContextMenu.onOpening(e)` | Occurs before the menu opens. `e`: `{ part, items, cancel, byKeyboard, event, source }`. Set `e.items` for the component `part`, or set `e.cancel = true`. |
| `ContextMenu.onClosed(reason)` | `escape`, `outside`, `focus` or `code`. |

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

## Styling

| Hook | Description |
| --- | --- |
| `.mx-menubar, .mx-menubar__bar, .mx-menubar__item` | The menu bar, its row and a top-level item (`aria-expanded="true"` while open). |
| `.mx-context-menu, .mx-context-menu__anchor` | The context menu, which has no box of its own, and the point it opens at. |
| `.mx-menu, .mx-menu__item, .mx-menu__separator` | A menu (shared with Button), an item and a separator. |
| `.mx-menu__check, .mx-menu__icon, .mx-menu__label, .mx-menu__description, .mx-menu__shortcut, .mx-menu__arrow` | The parts of an item. |
| `.mx-customizer__pages, .mx-customizer__tree, .mx-customizer__commands` | The customizer window: its pages, the tree of items and the list of commands. |

### Component tokens

| Token | Description |
| --- | --- |
| `menubar.height, menubar.item-height` | The height of the bar and of a top-level item. |
| `menubar.bar, menubar.item, menubar.icon, menubar.mnemonic` | Units: the bar, a top-level item with its box per state (`hover`, `pressed`, `open`, `disabled`, `focus`), its icon, and its access key indicator (`shown`). |
| `menu.item, menu.item-height, menu.item-white-space` | Menu items, shared with the Button menu: the item unit in each state (`highlight`, `pressed`, `focus`, `checked`, `disabled`, `first`, `last`, each tone and `<tone>-highlight`), the row height, and text wrapping. |
| `menu.panel, menu.check, menu.icon, menu.check-mark, menu.radio-mark, menu.separator` | Units: the item column, the leading indicator and icon, the check and radio marks, and the separator between groups. |
| `menu.label, menu.description, menu.shortcut, menu.arrow` | Units: the item text, its description, the shortcut and the submenu arrow. |
| `customizer.page, .buttons, .footer` | Units: the gaps of a customizer page, of the buttons of its forms and of its footer. |

## Feedback

Loading issues…
