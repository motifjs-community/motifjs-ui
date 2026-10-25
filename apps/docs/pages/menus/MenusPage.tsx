import { reactive, type Component } from '@motifx/core';
import { attachContextMenu, CheckBox, ContextMenu, MenuBar, type MenuItem } from '@motifx-community/ui';
import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';

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
  ['closeOnScroll', '`Bind<boolean>`', '`true`', 'Scrolling the page closes it.'],
  ['openOnHover', '`Bind<boolean>`', '`true`', 'Pointing at an item opens its submenu.'],
  ['enabled', '`Bind<boolean>`', '`true`', '`false`: the browser shows its own menu.'],
];

const ITEM = [
  ['text', '`Bind<string>`', 'The label; `&Copy` makes C choose it while the menu is open (Alt+C on a menu bar’s top item).'],
  ['icon, hint', '`Bind<…>`', 'An icon at the start, a tooltip.'],
  ['shortcut', '`Bind<string>`', 'A key combination shown at the end (`Ctrl+S`). Only shown: register the key with `addShortcut`.'],
  ['items', '`Bind<readonly MenuItem[]>`', 'A submenu, opened at the side.'],
  ['checked', '`Bind<boolean>`', 'A check item (`menuitemcheckbox`).'],
  ['group', '`Bind<string>`', 'With `checked`: one choice of a group (`menuitemradio`), shown with a dot.'],
  ['enabled, visible', '`Bind<boolean>`', 'Dimmed and not chosen, or left out.'],
  ['beginGroup', '`Bind<boolean>`', 'A line before the item.'],
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
  ['.mx-menu__check, .mx-menu__icon, .mx-menu__label, .mx-menu__shortcut, .mx-menu__arrow', 'The parts of an item.'],
];

const TOKENS = [
  ['menubar.height, menubar.padding, menubar.gap, menubar.radius, menubar.background', 'The bar.'],
  ['menubar.item-height, menubar.item-padding, menubar.item-gap, menubar.item-radius', 'A top item.'],
  ['menubar.item-highlight, menubar.item-open, menubar.icon-size', 'Its hover and open fills, its icon.'],
  ['menu.item-*, menu.icon-size, menu.separator-*', 'Menu items (shared with Button’s menu).'],
  ['menu.shortcut-gap, menu.shortcut-color, menu.arrow-size', 'The shortcut text and the submenu arrow.'],
];

interface FileRow {
  id: number;
  name: string;
  locked: boolean;
  starred: boolean;
}

export default function MenusPage() {
  const s = reactive({
    log: 'Nothing chosen yet.',
    wrap: true,
    statusBar: false,
    zoom: '100%',
    theme: 'light',
    f10: false,
    canUndo: true,
    files: [
      { id: 1, name: 'report.docx', locked: false, starred: true },
      { id: 2, name: 'budget.xlsx', locked: true, starred: false },
      { id: 3, name: 'photo.png', locked: false, starred: false },
    ] as FileRow[],
    zone: 'Right-click here, or focus me and press the Menu key.',
  });
  let renamed = 0;

  const did = (what: string) => (s.log = what);
  const undo = (back: boolean) => {
    s.canUndo = !back;
    did(back ? 'Undo' : 'Redo');
  };
  const rename = (row: FileRow) => {
    row.name = `copy-${++renamed}-${row.name}`;
    did(`Renamed to ${row.name}`);
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

  let list: Component<HTMLUListElement> | null = null;

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
        <Example
          code={`
<MenuBar label="Main" items={[
  { text: '&File', items: [
    { text: '&New', shortcut: 'Ctrl+N', click: () => this.create() },
    { text: 'Open &recent', items: this.recent.map((f) => ({ text: f, click: () => this.open(f) })) },
    { text: 'E&xit', beginGroup: true, click: () => this.exit() },
  ] },
  { text: '&View', items: [
    { text: '&Word wrap', checked: () => this.view.wrap, click: () => (this.view.wrap = !this.view.wrap) },
    { text: '100%', group: 'zoom', checked: () => this.view.zoom === 100, click: () => (this.view.zoom = 100) },
    { text: '150%', group: 'zoom', checked: () => this.view.zoom === 150, click: () => (this.view.zoom = 150) },
  ] },
]} />

const bar = new MenuBar({ label: 'Main', items: this.menus, focusOnF10: true });
bar.onItemClick((e) => console.log(e.item.text));
`}
          stack
        >
          <MenuBar label="Main" items={menus} focusOnF10={() => s.f10} style="inline-size: 100%" />
          <div class="docs-flow">
            <CheckBox label="F10 focuses the bar" x-model={() => s.f10} />
            <output class="mb-log">{() => s.log}</output>
          </div>
          <span class="mb-view">{() => `Word wrap ${s.wrap ? 'on' : 'off'} · status bar ${s.statusBar ? 'on' : 'off'} · zoom ${s.zoom} · theme ${s.theme}`}</span>
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
          <Rich text="A `ContextMenu` opens on its target’s right-click at the pointer, and with the Menu key or Shift+F10 at the focused element. `onOpening` gets the element (`e.target`) and builds the items for it, here for the row of a list; `e.cancel = true` leaves the browser its own menu. It closes on Escape, a press outside, and when the page scrolls." />
        </p>
        <Example
          code={`
<ul ref={(c) => (this.list = c)}>…</ul>
<ContextMenu
  target={() => this.list}
  onOpening={(e) => {
    const row = this.rowOf(e.target);
    if (row) e.items = this.rowItems(row);
    else e.cancel = true;
  }}
/>
`}
          stack
        >
          <ul class="docs-panel cm-list" aria-label="Files" ref={(c: Component<HTMLUListElement>) => (list = c)} style="inline-size: 100%; margin: 0; list-style: none">
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
        </Example>
        <Example
          title="attachContextMenu"
          code={`
const remove = attachContextMenu(this.zone, (e) => [
  { text: 'Say where', click: () => console.log(e.target) },
]);
`}
        >
          <div
            class="docs-panel cm-zone"
            tabindex="0"
            onBuilt={(c: Component<HTMLDivElement>) =>
              c.motif.setDisposable(
                attachContextMenu(c, (e) => [
                  { text: '&Say where', click: () => (s.zone = `Opened ${e.byKeyboard ? 'from the keyboard' : 'with the pointer'} on <${e.target.tagName.toLowerCase()}>.`) },
                  { text: '&Reset', click: () => (s.zone = 'Right-click here, or focus me and press the Menu key.') },
                ]),
              )
            }
          >
            {() => s.zone}
          </div>
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
