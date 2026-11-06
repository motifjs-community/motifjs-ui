import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import AttachedMenu from './examples/AttachedMenu';
import FileList from './examples/FileList';
import MainMenu from './examples/MainMenu';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const BAR_PROPS = [
  ['items', '`Bind<readonly MenuItem[]>`', '`[]`', 'The top-level items, whose `items` define the menus they open. A top-level item without `items` runs its `click`.'],
  ['label', '`Bind<string>`', "`''`", 'The accessible name of the bar. This is the same property as `text`.'],
  ['focusOnF10', '`Bind<boolean>`', '`false`', 'F10 moves focus to the bar from anywhere on the page. This is off by default because browsers use F10.'],
  ['openOnHover', '`Bind<boolean>`', '`true`', 'While a menu is open, hovering another top-level item opens its menu, and hovering an item opens its submenu.'],
  ['enabled / disabled, visible, tabStop, tabIndex', 'see Control', '', 'Properties shared by all controls.'],
];

const MENU_PROPS = [
  ['items', '`Bind<readonly MenuItem[]>`', '`[]`', 'The commands. `onOpening` can provide different ones for each element.'],
  ['target', '`Bind<Element | Component | null>`', 'Its parent', 'The element the menu belongs to. If not set, this is the element the `ContextMenu` is placed in.'],
  ['label', '`Bind<string>`', "`''`", 'The accessible name of the menu.'],
  ['keyboard', '`Bind<boolean>`', '`true`', 'The Menu key and Shift+F10 open the menu at the focused element.'],
  ['closeOnScroll', '`Bind<boolean>`', '`true`', 'Scrolling the element out of view closes the menu. Until then, the menu follows the element.'],
  ['openOnHover', '`Bind<boolean>`', '`true`', 'Hovering an item opens its submenu.'],
  ['enabled', '`Bind<boolean>`', '`true`', '`false` shows the browser\'s own menu.'],
];

const ITEM = [
  ['text', '`Bind<string>`', 'The label. `&Copy` makes C select the item while the menu is open (Alt+C on a top-level menu bar item).'],
  ['icon, hint', '`Bind<…>`', 'An icon at the start, and a tooltip.'],
  ['shortcut', '`Bind<string>`', 'A key combination displayed at the end (`Ctrl+S`). It is for display only, so register the key with `addShortcut`.'],
  ['description', '`Bind<string>`', 'A second, dimmer text after the label that distinguishes the item, such as a folder name. It is part of the item\'s name and never a key.'],
  ['items', '`Bind<readonly MenuItem[]>`', 'A submenu that opens at the side.'],
  ['checked', '`Bind<boolean>`', 'A check item (`menuitemcheckbox`).'],
  ['group', '`Bind<string>`', 'With `checked`, one choice in a group (`menuitemradio`), shown with a dot.'],
  ['enabled, visible', '`Bind<boolean>`', 'Dims the item so it cannot be selected, or removes it.'],
  ['beginGroup', '`Bind<boolean>`', 'Draws a separator before the item.'],
  ['tone', "`Bind<'standard' | 'accent' | 'success' | 'caution' | 'danger'>`", 'Colors the item with a kit tone (`danger` for destructive actions). A toolbar button moved into the overflow menu keeps its tone.'],
  ['click', '`(e) => void`', 'Occurs when the item is selected, after the menu closes. `e`: `{ item, source, event }`.'],
  ['data', '`unknown`', 'A custom value.'],
];

const METHODS = [
  ['MenuBar.open(item | index)', '`boolean`', 'Opens a top-level item\'s menu with focus on its first item.'],
  ['MenuBar.close()', '`void`', 'Closes the open menu.'],
  ['ContextMenu.open(at, target?)', '`boolean`', 'Opens the menu programmatically, at `{ x, y }` or at an element.'],
  ['ContextMenu.close()', '`void`', 'Closes it.'],
  ['MenuBar.refresh(), ContextMenu.refresh()', '`void`', 'Your items can be plain or reactive, and the menu reads them as they are. After changing them in place, call `refresh()`. The bar, the open menu and its submenus update.'],
  ['attachContextMenu(target, items)', '`() => void`', 'Attaches a menu to an element or component. `items` can be a function of the opening event (`e.target`). Returns a function that removes the menu.'],
];

const PROPERTIES = [
  ['MenuBar.openItem', 'read-only, reactive', 'The top-level item whose menu is open.'],
  ['ContextMenu.opened', 'read-only, reactive', 'Indicates whether it is open.'],
  ['ContextMenu.targetElement', 'read-only, reactive', 'The element the menu was last opened on.'],
  ['ContextMenu.target', 'read/write, reactive', 'The element the menu listens on.'],
];

const EVENTS = [
  ['onItemClick(e)', 'On both components, occurs when an item is selected, after its own `click`.'],
  ['ContextMenu.onOpening(e)', 'Occurs before the menu opens. `e`: `{ target, items, cancel, byKeyboard, event, source }`. Set `e.items` for the element, or set `e.cancel = true`.'],
  ['ContextMenu.onClosed(reason)', '`escape`, `outside`, `focus` or `code`.'],
];

const KEYS = [
  ['Tab', 'Moves focus into the menu bar (one Tab stop) and out of it.'],
  ['Left / Right', 'On the bar, moves to the previous or next top-level item. In a menu, moves to the adjacent menu or closes a submenu (Right opens one). These keys are mirrored on right-to-left pages.'],
  ['Down, Enter, Space', 'On the bar, opens the menu on its first item. Up opens it on the last item.'],
  ['Up / Down, Home / End', 'In a menu, moves between items and wraps at the ends.'],
  ['A letter', 'Moves to the next item that starts with that letter. An item\'s `&` key selects it.'],
  ['Alt + key', 'Opens the top-level item with that `&` key (Control + Option on Apple platforms).'],
  ['Escape', 'Closes a submenu, then the menu, and returns to where it opened.'],
  ['F10', 'Moves focus to the menu bar when `focusOnF10` is set.'],
  ['Menu key, Shift+F10', 'Opens a context menu at the focused element.'],
];

const A11Y = [
  ['MenuBar', '`role="menubar"` named by `label`. Top-level items are `menuitem` elements with `aria-haspopup` and `aria-expanded`, and the bar is one Tab stop (roving tabindex).'],
  ['Menus', '`role="menu"`. Items are `menuitem`, `menuitemcheckbox` or `menuitemradio` with `aria-checked`. Disabled items have `aria-disabled` and remain reachable.'],
  ['Submenus', 'The item has `aria-haspopup="menu"` and `aria-expanded`. The submenu opens next to it, focus moves in and returns when it closes.'],
  ['Focus', 'A menu opened from the keyboard focuses its first item, and a menu opened with the pointer focuses the menu itself. Closing returns focus.'],
  ['Shortcuts', 'The shortcut text is part of the item\'s name. Access keys are exposed through `aria-keyshortcuts` on top-level items.'],
];

const HOOKS = [
  ['.mx-menubar, .mx-menubar__bar, .mx-menubar__item', 'The menu bar, its row and a top-level item (`aria-expanded="true"` while open).'],
  ['.mx-context-menu, .mx-context-menu__anchor', 'The context menu, which has no box of its own, and the point it opens at.'],
  ['.mx-menu, .mx-menu__item, .mx-menu__separator', 'A menu (shared with Button), an item and a separator.'],
  ['.mx-menu__check, .mx-menu__icon, .mx-menu__label, .mx-menu__description, .mx-menu__shortcut, .mx-menu__arrow', 'The parts of an item.'],
];

const TOKENS = [
  ['menubar.height, menubar.item-height', 'The height of the bar and of a top-level item.'],
  ['menubar.bar, menubar.item, menubar.icon, menubar.mnemonic', 'Units: the bar, a top-level item with its box per state (`hover`, `pressed`, `open`, `disabled`, `focus`), its icon, and its access key indicator (`shown`).'],
  ['menu.item, menu.item-height, menu.item-white-space', 'Menu items, shared with the Button menu: the item unit in each state (`highlight`, `pressed`, `focus`, `checked`, `disabled`, `first`, `last`, each tone and `<tone>-highlight`), the row height, and text wrapping.'],
  ['menu.panel, menu.check, menu.icon, menu.check-mark, menu.radio-mark, menu.separator', 'Units: the item column, the leading indicator and icon, the check and radio marks, and the separator between groups.'],
  ['menu.label, menu.description, menu.shortcut, menu.arrow', 'Units: the item text, its description, the shortcut and the submenu arrow.'],
];

export default function MenusPage() {
  return (
    <>
      <p class="lead">
        <Rich text="An application menu bar (File, Edit, View) and a context menu that opens on right-click. Both use the same menu items, which support submenus, check and radio items, shortcuts and access keys." />
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { MenuBar, ContextMenu, attachContextMenu, type MenuItem } from '@motifx-community/ui';
`}
        />
      </Section>

      <Section anchor="menubar" title="MenuBar">
        <p>
          <Rich text={'A `MenuBar` takes its top-level items as `items`, and the `items` of each one define its menu. `&File` assigns Alt+F to open File. Left and Right move along the bar and, while a menu is open, to the next menu. Escape returns to the bar.'} />
        </p>
        <Example files={code('MainMenu.tsx')} stack>
          <MainMenu />
        </Example>
      </Section>

      <Section anchor="items" title="Submenus, check items, radio items and shortcuts">
        <p>
          <Rich text="An item with `items` opens a submenu at its side. Right (Left on right-to-left pages), Enter or Space opens it, Left and Escape close it, and hovering opens it after a short delay. `checked` creates a check item, and `checked` with a `group` creates one choice in a set, shown with a dot. `shortcut` is displayed at the end of the item, so register the key separately with `addShortcut`. The same items work in a `Button` menu." />
        </p>
        <ApiTable head={['Field', 'Type', 'Description']} rows={ITEM} />
      </Section>

      <Section anchor="context" title="ContextMenu">
        <p>
          <Rich text="A `ContextMenu` opens at the pointer when its target is right-clicked, and at the focused element with the Menu key or Shift+F10. `onOpening` receives the element (`e.target`) and builds the items for it, in this case for a row in a list. Setting `e.cancel = true` leaves the browser's own menu. The menu closes on Escape or a click outside. When the page scrolls, it follows the element it opened on and closes once that element is out of view." />
        </p>
        <Example files={code('FileList.tsx')} stack>
          <FileList />
        </Example>
        <Example title="attachContextMenu" files={code('AttachedMenu.tsx')}>
          <AttachedMenu />
        </Example>
      </Section>

      <Section anchor="keyboard" title="Keyboard">
        <ApiTable head={['Key', 'Description']} rows={KEYS} />
      </Section>

      <Section anchor="a11y" title="Accessibility">
        <ApiTable head={['Topic', 'Details']} rows={A11Y} />
      </Section>

      <Section anchor="i18n" title="Localization">
        <p>
          <Rich text="Menus have no strings of their own. Every label, shortcut and name comes from your items, so they follow your own translations. A function in `text` updates immediately when the language changes." />
        </p>
      </Section>

      <Section anchor="styling" title="Styling">
        <ApiTable head={['Hook', 'Description']} rows={HOOKS} />
        <h3>
          <Rich text="Component tokens" />
        </h3>
        <ApiTable head={['Token', 'Description']} rows={TOKENS} />
      </Section>

      <Section anchor="api" title="API reference">
        <h3>
          <Rich text="MenuBar props" />
        </h3>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={BAR_PROPS} />
        <h3>
          <Rich text="ContextMenu props" />
        </h3>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={MENU_PROPS} />
        <h3>
          <Rich text="Properties" />
        </h3>
        <ApiTable head={['Property', 'Access', 'Description']} rows={PROPERTIES} />
        <h3>
          <Rich text="Methods" />
        </h3>
        <ApiTable head={['Method', 'Returns', 'Description']} rows={METHODS} />
        <h3>
          <Rich text="Events" />
        </h3>
        <ApiTable head={['Event', 'When']} rows={EVENTS} />
      </Section>
    </>
  );
}
