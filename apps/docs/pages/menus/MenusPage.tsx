import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import MainMenu from './examples/MainMenu';
import { ITEM, KEYS } from './menu-tables';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PAGES = [
  ['[ContextMenu](/menus/context)', 'The menu of an element, opened by a right-click, the Menu key or Shift+F10.'],
  ['[Customization](/menus/customization)', 'The user hides, moves, renames and adds items, and changes keyboard shortcuts; the changes are one object to save.'],
  ['[Programmatic changes](/menus/programmatic)', 'Items added, removed, moved and changed by path, and items that name app commands.'],
  ['[Merging menus](/menus/merging)', 'The bar of a document, a window or a tab shows its items in the app’s bar.'],
  ['[API reference](/menus/api)', 'Every prop, property, method and event.'],
];

const A11Y = [
  ['MenuBar', '`role="menubar"` named by `label`. Top-level items are `menuitem` elements with `aria-haspopup` and `aria-expanded`, and the bar is one Tab stop (roving tabindex).'],
  ['Menus', '`role="menu"`. Items are `menuitem`, `menuitemcheckbox` or `menuitemradio` with `aria-checked`. Disabled items have `aria-disabled` and remain reachable.'],
  ['Submenus', 'The item has `aria-haspopup="menu"` and `aria-expanded`. The submenu opens next to it, focus moves in and returns when it closes.'],
  ['Focus', 'A menu opened from the keyboard focuses its first item, and a menu opened with the pointer focuses the menu itself. Closing returns focus.'],
  ['Shortcuts', 'The shortcut text is part of the item’s name. Access keys are exposed through `aria-keyshortcuts` on top-level items.'],
];

export default function MenusPage() {
  return (
    <>
      <p class="lead">
        <Rich text="An application menu bar (File, Edit, View) and a context menu that opens on right-click. Both use the same menu items, which support submenus, check and radio items, shortcuts and access keys. The bar can be customized by the user, changed by path and merged with the bars of documents and windows." />
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
          <Rich text="An item with `items` opens a submenu at its side. Right (Left on right-to-left pages), Enter or Space opens it, Left and Escape close it, and hovering opens it after a short delay. `checked` creates a check item, and `checked` with a `group` creates one choice in a set, shown with a dot. `shortcut` is displayed at the end of the item; an item that names a [command](/commands) shows and runs the command’s keys. The same items work in a `Button` menu and a `ContextMenu`." />
        </p>
        <ApiTable head={['Field', 'Type', 'Description']} rows={ITEM} />
      </Section>

      <Section anchor="pages" title="In this group">
        <ApiTable head={['Page', 'Content']} rows={PAGES} />
      </Section>

      <Section anchor="keyboard" title="Keyboard">
        <ApiTable head={['Key', 'Description']} rows={KEYS} />
      </Section>

      <Section anchor="a11y" title="Accessibility">
        <ApiTable head={['Topic', 'Details']} rows={A11Y} />
      </Section>

      <Section anchor="i18n" title="Localization">
        <p>
          <Rich text="Every label, shortcut and name of an item comes from your items, so they follow your own translations. A function in `text` updates immediately when the language changes. The texts of the bar itself, such as those of its customizer, come from the kit’s language packs." />
        </p>
      </Section>
    </>
  );
}
