/** The tables of the MenuBar pages: the API reference shows them all, the other pages the ones they speak about. */

export const ITEM = [
  ['key', '`string | number`', 'Names the item in paths (`file/save`), in what the user changed and in merging. Without it, an item is named by its position.'],
  ['text', '`Bind<string>`', 'The label. `&Copy` makes C select the item while the menu is open (Alt+C on a top-level menu bar item).'],
  ['command', '`string`', 'The key of an app command (`commands`). What the item is not given, such as its text, icon, keys, state and action, comes from the command.'],
  ['icon, hint', '`Bind<…>`', 'An icon at the start, and a tooltip.'],
  ['shortcut', '`Bind<string>`', 'A key combination displayed at the end (`Ctrl+S`). It is for display only: register the key with `addShortcut`, or name a command, whose keys are shown and run.'],
  ['description', '`Bind<string>`', 'A second, dimmer text after the label that distinguishes the item, such as a folder name. It is part of the item’s name and never a key.'],
  ['items', '`Bind<readonly MenuItem[]>`', 'A submenu that opens at the side.'],
  ['checked', '`Bind<boolean>`', 'A check item (`menuitemcheckbox`).'],
  ['group', '`Bind<string>`', 'With `checked`, one choice in a group (`menuitemradio`), shown with a dot.'],
  ['enabled, visible', '`Bind<boolean>`', 'Dims the item so it cannot be selected, or removes it.'],
  ['beginGroup', '`Bind<boolean>`', 'Draws a separator before the item.'],
  ['tone', "`Bind<'standard' | 'accent' | 'success' | 'caution' | 'danger'>`", 'Colors the item with a kit tone (`danger` for destructive actions). A toolbar button moved into the overflow menu keeps its tone.'],
  ['customizable', '`Bind<boolean>`', '`false` keeps the item shown and in its place in a customizable bar; nothing moves past it.'],
  ['merge', "`Bind<'auto' | 'add' | 'replace' | 'remove' | 'none'>`", 'In a bar merged into another: what the item does there. The default is `auto`.'],
  ['mergeAt', '`Bind<number | { before } | { after }>`', 'In a bar merged into another: where the item stands there. The default is the end.'],
  ['click', '`(e) => void`', 'Occurs when the item is selected, after the menu closes. `e`: `{ item, source, event }`.'],
  ['data', '`unknown`', 'A custom value.'],
];

export const KEYS = [
  ['Tab', 'Moves focus into the menu bar (one Tab stop) and out of it.'],
  ['Left / Right', 'On the bar, moves to the previous or next top-level item. In a menu, moves to the adjacent menu or closes a submenu (Right opens one). These keys are mirrored on right-to-left pages.'],
  ['Down, Enter, Space', 'On the bar, opens the menu on its first item. Up opens it on the last item.'],
  ['Up / Down, Home / End', 'In a menu, moves between items and wraps at the ends.'],
  ['A letter', 'Moves to the next item that starts with that letter. An item’s `&` key selects it.'],
  ['Alt + key', 'Opens the top-level item with that `&` key (Control + Option on Apple platforms).'],
  ['Escape', 'Closes a submenu, then the menu, and returns to where it opened.'],
  ['F10', 'Moves focus to the menu bar when `focusOnF10` is set.'],
  ['Menu key, Shift+F10', 'Opens a context menu at the focused element; on a customizable bar, the menu of the focused item.'],
];
