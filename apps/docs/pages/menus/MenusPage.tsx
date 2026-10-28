import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import AttachedMenu from './examples/AttachedMenu';
import FileList from './examples/FileList';
import MainMenu from './examples/MainMenu';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const BAR_PROPS = [
  ['items', '`Bind<readonly MenuItem[]>`', '`[]`', 'The top items; their `items` are the menus they open. A top item without `items` runs its `click`.'],
  ['label', '`Bind<string>`', "`''`", 'Names the bar for screen readers. The same property as `text`.'],
  ['focusOnF10', '`Bind<boolean>`', '`false`', 'F10 moves focus to the bar from anywhere on the page. Off by default: browsers use F10.'],
  ['openOnHover', '`Bind<boolean>`', '`true`', 'While a menu is open, pointing at another top item opens its menu; pointing at an item opens its submenu.'],
  ['enabled / disabled, visible, tabStop, tabIndex', 'see Control', '', 'The shared properties of every control.'],
];

const MENU_PROPS = [
  ['items', '`Bind<readonly MenuItem[]>`', '`[]`', 'The commands; `onOpening` can give others per element.'],
  ['target', '`Bind<Element | Component | null>`', 'its parent', 'Whose menu it is. Without it, the element the `ContextMenu` is placed in.'],
  ['label', '`Bind<string>`', "`''`", 'Names the menu for screen readers.'],
  ['keyboard', '`Bind<boolean>`', '`true`', 'The Menu key and Shift+F10 open it at the focused element.'],
  ['closeOnScroll', '`Bind<boolean>`', '`true`', 'Scrolling that takes the element it opened on out of sight closes it; until then the menu goes along with that element.'],
  ['openOnHover', '`Bind<boolean>`', '`true`', 'Pointing at an item opens its submenu.'],
  ['enabled', '`Bind<boolean>`', '`true`', '`false`: the browser shows its own menu.'],
];

const ITEM = [
  ['text', '`Bind<string>`', 'The label; `&Copy` makes C choose it while the menu is open (Alt+C on a menu bar’s top item).'],
  ['icon, hint', '`Bind<…>`', 'An icon at the start, a tooltip.'],
  ['shortcut', '`Bind<string>`', 'A key combination shown at the end (`Ctrl+S`). Only shown: register the key with `addShortcut`.'],
  ['description', '`Bind<string>`', 'A second, dimmer text after the label: what tells the item apart, such as a folder. Part of the item’s name, never a key.'],
  ['items', '`Bind<readonly MenuItem[]>`', 'A submenu, opened at the side.'],
  ['checked', '`Bind<boolean>`', 'A check item (`menuitemcheckbox`).'],
  ['group', '`Bind<string>`', 'With `checked`: one choice of a group (`menuitemradio`), shown with a dot.'],
  ['enabled, visible', '`Bind<boolean>`', 'Dimmed and not chosen, or left out.'],
  ['beginGroup', '`Bind<boolean>`', 'A line before the item.'],
  ['tone', "`Bind<'standard' | 'accent' | 'success' | 'caution' | 'danger'>`", 'The item in the kit tone color (`danger` for a destructive one); a toolbar button moved into the overflow menu keeps its tone.'],
  ['click', '`(e) => void`', 'Chosen, after the menu closed. `e`: `{ item, source, event }`.'],
  ['data', '`unknown`', 'Your own value.'],
];

const METHODS = [
  ['MenuBar.open(item | index)', '`boolean`', 'Opens a top item’s menu with focus on its first item.'],
  ['MenuBar.close()', '`void`', 'Closes the open menu.'],
  ['ContextMenu.open(at, target?)', '`boolean`', 'Opens it from code, at `{ x, y }` or at an element.'],
  ['ContextMenu.close()', '`void`', 'Closes it.'],
  ['attachContextMenu(target, items)', '`() => void`', 'Gives an element or component a menu; `items` can be a function of the opening (`e.target`). Returns the remover.'],
];

const PROPERTIES = [
  ['MenuBar.openItem', 'read-only, reactive', 'The top item whose menu is open.'],
  ['ContextMenu.opened', 'read-only, reactive', 'Whether it is open.'],
  ['ContextMenu.targetElement', 'read-only, reactive', 'The element it was last opened on.'],
  ['ContextMenu.target', 'read/write, reactive', 'The element it listens on.'],
];

const EVENTS = [
  ['onItemClick(e)', 'Both: an item was chosen, after its own `click`.'],
  ['ContextMenu.onOpening(e)', 'About to open. `e`: `{ target, items, cancel, byKeyboard, event, source }`; set `e.items` for the element, or `e.cancel = true`.'],
  ['ContextMenu.onClosed(reason)', '`escape`, `outside`, `focus` or `code`.'],
];

const KEYS = [
  ['Tab', 'Into the menu bar (one stop), and out of it.'],
  ['Left / Right', 'On the bar: the previous / next top item. In a menu: the neighbour’s menu, or close a submenu (Right opens one). Mirrored right to left.'],
  ['Down, Enter, Space', 'On the bar: open the menu, first item. Up opens it on the last item.'],
  ['Up / Down, Home / End', 'In a menu: move between the items, wrapping around.'],
  ['A letter', 'The next item starting with it; an item’s `&` key chooses it.'],
  ['Alt + key', 'Opens the top item with that `&` key (Control + Option on Apple platforms).'],
  ['Escape', 'Closes a submenu, then the menu, back to where it opened.'],
  ['F10', 'Focuses the menu bar, with `focusOnF10`.'],
  ['Menu key, Shift+F10', 'Opens a context menu at the focused element.'],
];

const A11Y = [
  ['MenuBar', '`role="menubar"` named by `label`; top items are `menuitem`s with `aria-haspopup` and `aria-expanded`, one Tab stop (roving tabindex).'],
  ['Menus', '`role="menu"`; items are `menuitem`, `menuitemcheckbox` or `menuitemradio` with `aria-checked`; disabled ones `aria-disabled`, still reachable.'],
  ['Submenus', 'The item has `aria-haspopup="menu"` and `aria-expanded`; the submenu opens next to it, focus goes in and comes back.'],
  ['Focus', 'A menu opened from the keyboard focuses its first item; from the pointer, the menu itself. Closing gives focus back.'],
  ['Shortcuts', 'The shortcut text is part of the item’s name; access keys are in `aria-keyshortcuts` on the top items.'],
];

const HOOKS = [
  ['.mx-menubar, .mx-menubar__bar, .mx-menubar__item', 'The menu bar, its row, a top item (`aria-expanded="true"` while open).'],
  ['.mx-context-menu, .mx-context-menu__anchor', 'The context menu (no box of its own) and the point it opens at.'],
  ['.mx-menu, .mx-menu__item, .mx-menu__separator', 'A menu (shared with Button), an item, a line.'],
  ['.mx-menu__check, .mx-menu__icon, .mx-menu__label, .mx-menu__description, .mx-menu__shortcut, .mx-menu__arrow', 'The parts of an item.'],
];

const TOKENS = [
  ['menubar.height, menubar.item-height', 'The heights of the bar and of a top item.'],
  ['menubar.bar, menubar.item, menubar.icon, menubar.mnemonic', 'Units: the bar; a top item with its box per state (`hover`, `pressed`, `open`, `disabled`, `focus`); its icon; its access key’s mark (`shown`).'],
  ['menu.item, menu.item-height, menu.item-white-space', 'Menu items (shared with Button’s menu): the item unit in each state (`highlight`, `pressed`, `focus`, `checked`, `disabled`, `first`, `last`, each tone and `<tone>-highlight`), the row height, whether a text wraps.'],
  ['menu.panel, menu.check, menu.icon, menu.check-mark, menu.radio-mark, menu.separator', 'Units: the column of items, the leading mark and icon, the check and radio marks, the line between groups.'],
  ['menu.label, menu.description, menu.shortcut, menu.arrow', 'Units: an item’s text, its description, the shortcut and the submenu arrow.'],
];

export default function MenusPage() {
  return (
    <>
      <p class="lead">
        A menu bar of an app (File, Edit, View) and the menu that opens on a right-click. Both show the same menu items: submenus,
        check and radio items, shortcuts, access keys.
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
          <Rich text="A `MenuBar` takes its top items as `items`; each one's `items` is its menu. `&File` makes Alt+F open File. Left and Right move along the bar and, while a menu is open, to the next menu; Escape goes back to the bar." />
        </p>
        <Example files={code('MainMenu.tsx')} stack>
          <MainMenu />
        </Example>
      </Section>

      <Section anchor="items" title="Submenus, checks, radios, shortcuts">
        <p>
          <Rich text="An item with `items` opens a submenu at its side: Right (Left in a right-to-left page), Enter or Space open it, Left and Escape close it, and the pointer opens it after a short rest. `checked` makes a check item; `checked` with a `group` one choice of several, shown with a dot. `shortcut` is shown at the end of the item; register the key itself with `addShortcut`. The same items work in `Button`’s menu." />
        </p>
        <ApiTable head={['Field', 'Type', 'Description']} rows={ITEM} />
      </Section>

      <Section anchor="context" title="ContextMenu">
        <p>
          <Rich text="A `ContextMenu` opens on its target’s right-click at the pointer, and with the Menu key or Shift+F10 at the focused element. `onOpening` gets the element (`e.target`) and builds the items for it, here for the row of a list; `e.cancel = true` leaves the browser its own menu. It closes on Escape and a press outside; when the page scrolls it goes along with the element it opened on, and closes once that element is out of sight." />
        </p>
        <Example files={code('FileList.tsx')} stack>
          <FileList />
        </Example>
        <Example title="attachContextMenu" files={code('AttachedMenu.tsx')}>
          <AttachedMenu />
        </Example>
      </Section>

      <Section anchor="keyboard" title="Keyboard">
        <ApiTable head={['Key', 'What it does']} rows={KEYS} />
      </Section>

      <Section anchor="a11y" title="Accessibility">
        <ApiTable head={['Topic', 'How']} rows={A11Y} />
      </Section>

      <Section anchor="i18n" title="Localization">
        <p>
          <Rich text="Menus write no text of their own: every label, shortcut and name comes from your items, so they follow your own translations (a function in `text` follows a language change at once)." />
        </p>
      </Section>

      <Section anchor="styling" title="Styling">
        <ApiTable head={['Hook', 'What it is']} rows={HOOKS} />
        <h3>Component tokens</h3>
        <ApiTable head={['Token', 'What it sets']} rows={TOKENS} />
      </Section>

      <Section anchor="api" title="API reference">
        <h3>MenuBar props</h3>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={BAR_PROPS} />
        <h3>ContextMenu props</h3>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={MENU_PROPS} />
        <h3>Properties</h3>
        <ApiTable head={['Property', 'Access', 'Description']} rows={PROPERTIES} />
        <h3>Methods</h3>
        <ApiTable head={['Method', 'Returns', 'Description']} rows={METHODS} />
        <h3>Events</h3>
        <ApiTable head={['Event', 'When']} rows={EVENTS} />
      </Section>
    </>
  );
}
