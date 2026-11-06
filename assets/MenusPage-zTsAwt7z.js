import{St as e,a as t,an as n,i as r,n as i,nn as a,r as o,rn as s,t as c}from"./doc-B1CtlCkV.js";import{t as l}from"./CheckBox-C4nteOTt.js";import{t as u}from"./Stack-AS0iyAxC.js";import{t as d}from"./ContextMenu-CCqfrkpd.js";import{t as f}from"./MenuBar-D-nKxLVn.js";import{t as p}from"./sources-BXVvOiIY.js";function m(t,n){let r=new d({target:t,items:typeof n==`function`?[]:n});typeof n==`function`&&r.onOpening(e=>e.items=n(e)??[]);let i=()=>{r.isDisposed||(r.target=null,r.dispose())};return e(t)||t.motif.setDisposable(i),i}var h=`import { reactive, type Component } from '@motifx/core';\r
import { attachContextMenu } from '@motifx-community/ui';\r
\r
const START = 'Right-click here, or focus me and press the Menu key.';\r
const BOX = 'padding: var(--mx-space-4); background: var(--mx-color-bg-card); border: var(--mx-border-width-1) solid var(--mx-color-stroke-card); border-radius: var(--mx-radius-lg)';\r
\r
/** A menu given to an element with \`attachContextMenu\`, its items built from the opening. */\r
export default function AttachedMenu() {\r
  const s = reactive({ zone: START });\r
\r
  const attach = (c: Component<HTMLDivElement>) => {\r
    const remove = attachContextMenu(c, (e) => [\r
      { text: '&Say where', click: () => (s.zone = \`Opened \${e.byKeyboard ? 'from the keyboard' : 'with the pointer'} on <\${e.target.tagName.toLowerCase()}>.\`) },\r
      { text: '&Reset', click: () => (s.zone = START) },\r
    ]);\r
    c.motif.setDisposable(remove);\r
  };\r
\r
  return (\r
    <div class="cm-zone" tabindex="0" style={BOX} onBuilt={attach}>\r
      {() => s.zone}\r
    </div>\r
  );\r
}\r
`,g=`import { reactive, type Component } from '@motifx/core';\r
import { ContextMenu, type MenuItem } from '@motifx-community/ui';\r
\r
interface FileRow {\r
  id: number;\r
  name: string;\r
  locked: boolean;\r
  starred: boolean;\r
}\r
\r
const BOX = 'inline-size: 100%; margin: 0; list-style: none; padding: var(--mx-space-4); background: var(--mx-color-bg-card); border: var(--mx-border-width-1) solid var(--mx-color-stroke-card); border-radius: var(--mx-radius-lg)';\r
\r
/** A context menu whose items \`onOpening\` builds for the row of a list it opens on. */\r
export default function FileList() {\r
  const s = reactive({\r
    log: 'Nothing chosen yet.',\r
    files: [\r
      { id: 1, name: 'report.docx', locked: false, starred: true },\r
      { id: 2, name: 'budget.xlsx', locked: true, starred: false },\r
      { id: 3, name: 'photo.png', locked: false, starred: false },\r
    ] as FileRow[],\r
  });\r
  let renamed = 0;\r
  let list: Component<HTMLUListElement> | null = null;\r
\r
  const did = (what: string) => (s.log = what);\r
  const rename = (row: FileRow) => {\r
    row.name = \`copy-\${++renamed}-\${row.name}\`;\r
    did(\`Renamed to \${row.name}\`);\r
  };\r
\r
  const rowItems = (row: FileRow): MenuItem[] => [\r
    { text: '&Open', click: () => did(\`Open \${row.name}\`) },\r
    { text: '&Rename', enabled: !row.locked, click: () => rename(row) },\r
    { text: '&Star', checked: row.starred, click: () => (row.starred = !row.starred) },\r
    { text: '&Move to', items: ['Documents', 'Pictures', 'Archive'].map((folder) => ({ text: folder, click: () => did(\`Move \${row.name} to \${folder}\`) })) },\r
    { text: '&Delete', shortcut: 'Del', beginGroup: true, enabled: !row.locked, click: () => (s.files = s.files.filter((f) => f !== row)) },\r
  ];\r
\r
  const rowOf = (el: Element) => {\r
    const id = Number(el.closest('[data-id]')?.getAttribute('data-id'));\r
    return s.files.find((f) => f.id === id);\r
  };\r
\r
  return (\r
    <>\r
      <ul class="cm-list" aria-label="Files" ref={(c: Component<HTMLUListElement>) => (list = c)} style={BOX}>\r
        {s.files.map((file) => (\r
          <li key={file.id} data-id={String(file.id)} tabindex="0" style="padding-block: var(--mx-space-2)">\r
            {() => \`\${file.starred ? '★ ' : ''}\${file.name}\${file.locked ? ' (locked)' : ''}\`}\r
          </li>\r
        ))}\r
      </ul>\r
      <ContextMenu\r
        target={() => list}\r
        label="File"\r
        onOpening={(e) => {\r
          const row = rowOf(e.target);\r
          if (row) e.items = rowItems(row);\r
          else e.cancel = true;\r
        }}\r
      />\r
      <output class="cm-log">{() => s.log}</output>\r
    </>\r
  );\r
}\r
`,_=`import { reactive, type Component } from '@motifx/core';\r
import { CheckBox, MenuBar, Stack, type MenuItem } from '@motifx-community/ui';\r
\r
/** An application menu bar created with \`new\`: submenus, check and radio items, shortcuts, access keys and \`onItemClick\`. */\r
export default function MainMenu() {\r
  const s = reactive({\r
    log: 'Nothing chosen yet.',\r
    chosen: 0,\r
    wrap: true,\r
    statusBar: false,\r
    zoom: '100%',\r
    theme: 'light',\r
    f10: false,\r
    canUndo: true,\r
  });\r
\r
  const did = (what: string) => (s.log = what);\r
  const undo = (back: boolean) => {\r
    s.canUndo = !back;\r
    did(back ? 'Undo' : 'Redo');\r
  };\r
  const zoom = (value: string): MenuItem => ({ text: value, group: 'zoom', checked: () => s.zoom === value, click: () => (s.zoom = value) });\r
  const theme = (value: string, text: string): MenuItem => ({ text, group: 'theme', checked: () => s.theme === value, click: () => (s.theme = value) });\r
\r
  const menus: MenuItem[] = [\r
    {\r
      text: '&File',\r
      items: [\r
        { text: '&New', shortcut: 'Ctrl+N', click: () => did('New') },\r
        { text: '&Open…', shortcut: 'Ctrl+O', click: () => did('Open…') },\r
        { text: 'Open &recent', items: ['report.docx', 'budget.xlsx', 'notes.md'].map((name) => ({ text: name, click: () => did(\`Open \${name}\`) })) },\r
        { text: '&Save', shortcut: 'Ctrl+S', beginGroup: true, click: () => did('Save') },\r
        { text: 'Save &as…', click: () => did('Save as…') },\r
        { text: 'E&xit', beginGroup: true, click: () => did('Exit') },\r
      ],\r
    },\r
    {\r
      text: '&Edit',\r
      items: [\r
        { text: '&Undo', shortcut: 'Ctrl+Z', enabled: () => s.canUndo, click: () => undo(true) },\r
        { text: '&Redo', shortcut: 'Ctrl+Y', click: () => undo(false) },\r
        { text: 'Cu&t', shortcut: 'Ctrl+X', beginGroup: true, click: () => did('Cut') },\r
        { text: '&Copy', shortcut: 'Ctrl+C', click: () => did('Copy') },\r
        { text: '&Paste', shortcut: 'Ctrl+V', click: () => did('Paste') },\r
        { text: 'Paste &special', enabled: false },\r
      ],\r
    },\r
    {\r
      text: '&View',\r
      items: [\r
        { text: '&Word wrap', checked: () => s.wrap, click: () => (s.wrap = !s.wrap) },\r
        { text: '&Status bar', checked: () => s.statusBar, click: () => (s.statusBar = !s.statusBar) },\r
        { ...zoom('100%'), beginGroup: true },\r
        zoom('125%'),\r
        zoom('150%'),\r
        { text: '&Theme', beginGroup: true, items: [theme('light', 'Light'), theme('dark', 'Dark'), theme('system', 'Same as the system')] },\r
      ],\r
    },\r
    { text: '&Help', items: [{ text: '&About', click: () => did('About') }] },\r
  ];\r
\r
  const bar = new MenuBar({ label: 'Main', items: menus, focusOnF10: () => s.f10 });\r
  bar.onItemClick(() => s.chosen++);\r
\r
  return (\r
    <>\r
      <div style="inline-size: 100%" ref={(c: Component<HTMLDivElement>) => c.controls.add(bar)} />\r
      <Stack orientation="horizontal" wrap align="center">\r
        <CheckBox label="F10 focuses the bar" x-model={() => s.f10} />\r
        <output class="mb-log">{() => s.log}</output>\r
        <output class="mb-count">{() => \`onItemClick ran \${s.chosen} times.\`}</output>\r
      </Stack>\r
      <span class="mb-view">{() => \`Word wrap \${s.wrap ? 'on' : 'off'} · status bar \${s.statusBar ? 'on' : 'off'} · zoom \${s.zoom} · theme \${s.theme}\`}</span>\r
    </>\r
  );\r
}\r
`,v=`Right-click here, or focus me and press the Menu key.`,y=`padding: var(--mx-space-4); background: var(--mx-color-bg-card); border: var(--mx-border-width-1) solid var(--mx-color-stroke-card); border-radius: var(--mx-radius-lg)`;function b(){let e=n({zone:v});return a(`div`,{onBuilt:t=>{let n=m(t,t=>[{text:`&Say where`,click:()=>e.zone=`Opened ${t.byKeyboard?`from the keyboard`:`with the pointer`} on <${t.target.tagName.toLowerCase()}>.`},{text:`&Reset`,click:()=>e.zone=v}]);t.motif.setDisposable(n)},initializeComponent:t=>{t.style(y),t.attr.add({tabindex:`0`}),t.class.add(`cm-zone`),t.bindings.method(()=>e.zone)}})}var x=`inline-size: 100%; margin: 0; list-style: none; padding: var(--mx-space-4); background: var(--mx-color-bg-card); border: var(--mx-border-width-1) solid var(--mx-color-stroke-card); border-radius: var(--mx-radius-lg)`;function S(){let e=n({log:`Nothing chosen yet.`,files:[{id:1,name:`report.docx`,locked:!1,starred:!0},{id:2,name:`budget.xlsx`,locked:!0,starred:!1},{id:3,name:`photo.png`,locked:!1,starred:!1}]}),t=0,r=null,i=t=>e.log=t,o=e=>{e.name=`copy-${++t}-${e.name}`,i(`Renamed to ${e.name}`)},c=t=>[{text:`&Open`,click:()=>i(`Open ${t.name}`)},{text:`&Rename`,enabled:!t.locked,click:()=>o(t)},{text:`&Star`,checked:t.starred,click:()=>t.starred=!t.starred},{text:`&Move to`,items:[`Documents`,`Pictures`,`Archive`].map(e=>({text:e,click:()=>i(`Move ${t.name} to ${e}`)}))},{text:`&Delete`,shortcut:`Del`,beginGroup:!0,enabled:!t.locked,click:()=>e.files=e.files.filter(e=>e!==t)}],l=t=>{let n=Number(t.closest(`[data-id]`)?.getAttribute(`data-id`));return e.files.find(e=>e.id===n)};return s({initializeComponent:t=>{{let n=a(`ul`,{ref:e=>r=e,initializeComponent:t=>{t.style(x),t.attr.add({"aria-label":`Files`}),t.class.add(`cm-list`);let n=a({initializeComponent:t=>{t.bindings.list(()=>e&&e.files!==null&&e.files!==void 0?e.files:[],e=>a(`li`,{indexkey:()=>e.id,initializeComponent:t=>{t.style(`padding-block: var(--mx-space-2)`),t.attr.add({"data-id":String(e.id),tabindex:`0`}),t.bindings.method(()=>`${e.starred?`★ `:``}${e.name}${e.locked?` (locked)`:``}`)}}))}});t.controls.add(n)}});t.controls.add(n);let i=a(d,{target:()=>r,label:`File`,onOpening:e=>{let t=l(e.target);t?e.items=c(t):e.cancel=!0},runover:{},childs:[]});t.controls.add(i);let o=a(`output`,{initializeComponent:t=>{t.class.add(`cm-log`),t.bindings.method(()=>e.log)}},1);t.controls.add(o)}}})}function C(){let e=n({log:`Nothing chosen yet.`,chosen:0,wrap:!0,statusBar:!1,zoom:`100%`,theme:`light`,f10:!1,canUndo:!0}),t=t=>e.log=t,r=n=>{e.canUndo=!n,t(n?`Undo`:`Redo`)},i=t=>({text:t,group:`zoom`,checked:()=>e.zoom===t,click:()=>e.zoom=t}),o=(t,n)=>({text:n,group:`theme`,checked:()=>e.theme===t,click:()=>e.theme=t}),c=[{text:`&File`,items:[{text:`&New`,shortcut:`Ctrl+N`,click:()=>t(`New`)},{text:`&Open…`,shortcut:`Ctrl+O`,click:()=>t(`Open…`)},{text:`Open &recent`,items:[`report.docx`,`budget.xlsx`,`notes.md`].map(e=>({text:e,click:()=>t(`Open ${e}`)}))},{text:`&Save`,shortcut:`Ctrl+S`,beginGroup:!0,click:()=>t(`Save`)},{text:`Save &as…`,click:()=>t(`Save as…`)},{text:`E&xit`,beginGroup:!0,click:()=>t(`Exit`)}]},{text:`&Edit`,items:[{text:`&Undo`,shortcut:`Ctrl+Z`,enabled:()=>e.canUndo,click:()=>r(!0)},{text:`&Redo`,shortcut:`Ctrl+Y`,click:()=>r(!1)},{text:`Cu&t`,shortcut:`Ctrl+X`,beginGroup:!0,click:()=>t(`Cut`)},{text:`&Copy`,shortcut:`Ctrl+C`,click:()=>t(`Copy`)},{text:`&Paste`,shortcut:`Ctrl+V`,click:()=>t(`Paste`)},{text:`Paste &special`,enabled:!1}]},{text:`&View`,items:[{text:`&Word wrap`,checked:()=>e.wrap,click:()=>e.wrap=!e.wrap},{text:`&Status bar`,checked:()=>e.statusBar,click:()=>e.statusBar=!e.statusBar},{...i(`100%`),beginGroup:!0},i(`125%`),i(`150%`),{text:`&Theme`,beginGroup:!0,items:[o(`light`,`Light`),o(`dark`,`Dark`),o(`system`,`Same as the system`)]}]},{text:`&Help`,items:[{text:`&About`,click:()=>t(`About`)}]}],d=new f({label:`Main`,items:c,focusOnF10:()=>e.f10});return d.onItemClick(()=>e.chosen++),s({initializeComponent:t=>{{let n=a(`div`,{ref:e=>e.controls.add(d),initializeComponent:e=>{e.style(`inline-size: 100%`)}});t.controls.add(n);let r=a(u,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[a(l,{label:`F10 focuses the bar`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.f10,t=>{let n=e;n!=null&&typeof n.f10!=`function`&&(n.f10=t)})}},childs:[]}),a(`output`,{initializeComponent:t=>{t.class.add(`mb-log`),t.bindings.method(()=>e.log)}},1),a(`output`,{initializeComponent:t=>{t.class.add(`mb-count`),t.bindings.method(()=>`onItemClick ran ${e.chosen} times.`)}},1)]});t.controls.add(r);let i=a(`span`,{initializeComponent:t=>{t.class.add(`mb-view`),t.bindings.method(()=>`Word wrap ${e.wrap?`on`:`off`} · status bar ${e.statusBar?`on`:`off`} · zoom ${e.zoom} · theme ${e.theme}`)}},1);t.controls.add(i)}}})}var w=p(Object.assign({"./examples/AttachedMenu.tsx":h,"./examples/FileList.tsx":g,"./examples/MainMenu.tsx":_})),T=[[`items`,"`Bind<readonly MenuItem[]>`","`[]`","The top-level items, whose `items` define the menus they open. A top-level item without `items` runs its `click`."],[`label`,"`Bind<string>`","`''`","The accessible name of the bar. This is the same property as `text`."],[`focusOnF10`,"`Bind<boolean>`","`false`",`F10 moves focus to the bar from anywhere on the page. This is off by default because browsers use F10.`],[`openOnHover`,"`Bind<boolean>`","`true`",`While a menu is open, hovering another top-level item opens its menu, and hovering an item opens its submenu.`],[`enabled / disabled, visible, tabStop, tabIndex`,`see Control`,``,`Properties shared by all controls.`]],E=[[`items`,"`Bind<readonly MenuItem[]>`","`[]`","The commands. `onOpening` can provide different ones for each element."],[`target`,"`Bind<Element | Component | null>`",`Its parent`,"The element the menu belongs to. If not set, this is the element the `ContextMenu` is placed in."],[`label`,"`Bind<string>`","`''`",`The accessible name of the menu.`],[`keyboard`,"`Bind<boolean>`","`true`",`The Menu key and Shift+F10 open the menu at the focused element.`],[`closeOnScroll`,"`Bind<boolean>`","`true`",`Scrolling the element out of view closes the menu. Until then, the menu follows the element.`],[`openOnHover`,"`Bind<boolean>`","`true`",`Hovering an item opens its submenu.`],[`enabled`,"`Bind<boolean>`","`true`","`false` shows the browser's own menu."]],D=[[`text`,"`Bind<string>`","The label. `&Copy` makes C select the item while the menu is open (Alt+C on a top-level menu bar item)."],[`icon, hint`,"`Bind<…>`",`An icon at the start, and a tooltip.`],[`shortcut`,"`Bind<string>`","A key combination displayed at the end (`Ctrl+S`). It is for display only, so register the key with `addShortcut`."],[`description`,"`Bind<string>`",`A second, dimmer text after the label that distinguishes the item, such as a folder name. It is part of the item's name and never a key.`],[`items`,"`Bind<readonly MenuItem[]>`",`A submenu that opens at the side.`],[`checked`,"`Bind<boolean>`","A check item (`menuitemcheckbox`)."],[`group`,"`Bind<string>`","With `checked`, one choice in a group (`menuitemradio`), shown with a dot."],[`enabled, visible`,"`Bind<boolean>`",`Dims the item so it cannot be selected, or removes it.`],[`beginGroup`,"`Bind<boolean>`",`Draws a separator before the item.`],[`tone`,"`Bind<'standard' | 'accent' | 'success' | 'caution' | 'danger'>`","Colors the item with a kit tone (`danger` for destructive actions). A toolbar button moved into the overflow menu keeps its tone."],[`click`,"`(e) => void`","Occurs when the item is selected, after the menu closes. `e`: `{ item, source, event }`."],[`data`,"`unknown`",`A custom value.`]],O=[[`MenuBar.open(item | index)`,"`boolean`",`Opens a top-level item's menu with focus on its first item.`],[`MenuBar.close()`,"`void`",`Closes the open menu.`],[`ContextMenu.open(at, target?)`,"`boolean`","Opens the menu programmatically, at `{ x, y }` or at an element."],[`ContextMenu.close()`,"`void`",`Closes it.`],[`MenuBar.refresh(), ContextMenu.refresh()`,"`void`","Your items can be plain or reactive, and the menu reads them as they are. After changing them in place, call `refresh()`. The bar, the open menu and its submenus update."],[`attachContextMenu(target, items)`,"`() => void`","Attaches a menu to an element or component. `items` can be a function of the opening event (`e.target`). Returns a function that removes the menu."]],k=[[`MenuBar.openItem`,`read-only, reactive`,`The top-level item whose menu is open.`],[`ContextMenu.opened`,`read-only, reactive`,`Indicates whether it is open.`],[`ContextMenu.targetElement`,`read-only, reactive`,`The element the menu was last opened on.`],[`ContextMenu.target`,`read/write, reactive`,`The element the menu listens on.`]],A=[[`onItemClick(e)`,"On both components, occurs when an item is selected, after its own `click`."],[`ContextMenu.onOpening(e)`,"Occurs before the menu opens. `e`: `{ target, items, cancel, byKeyboard, event, source }`. Set `e.items` for the element, or set `e.cancel = true`."],[`ContextMenu.onClosed(reason)`,"`escape`, `outside`, `focus` or `code`."]],j=[[`Tab`,`Moves focus into the menu bar (one Tab stop) and out of it.`],[`Left / Right`,`On the bar, moves to the previous or next top-level item. In a menu, moves to the adjacent menu or closes a submenu (Right opens one). These keys are mirrored on right-to-left pages.`],[`Down, Enter, Space`,`On the bar, opens the menu on its first item. Up opens it on the last item.`],[`Up / Down, Home / End`,`In a menu, moves between items and wraps at the ends.`],[`A letter`,"Moves to the next item that starts with that letter. An item's `&` key selects it."],[`Alt + key`,"Opens the top-level item with that `&` key (Control + Option on Apple platforms)."],[`Escape`,`Closes a submenu, then the menu, and returns to where it opened.`],[`F10`,"Moves focus to the menu bar when `focusOnF10` is set."],[`Menu key, Shift+F10`,`Opens a context menu at the focused element.`]],M=[[`MenuBar`,'`role="menubar"` named by `label`. Top-level items are `menuitem` elements with `aria-haspopup` and `aria-expanded`, and the bar is one Tab stop (roving tabindex).'],[`Menus`,'`role="menu"`. Items are `menuitem`, `menuitemcheckbox` or `menuitemradio` with `aria-checked`. Disabled items have `aria-disabled` and remain reachable.'],[`Submenus`,'The item has `aria-haspopup="menu"` and `aria-expanded`. The submenu opens next to it, focus moves in and returns when it closes.'],[`Focus`,`A menu opened from the keyboard focuses its first item, and a menu opened with the pointer focuses the menu itself. Closing returns focus.`],[`Shortcuts`,"The shortcut text is part of the item's name. Access keys are exposed through `aria-keyshortcuts` on top-level items."]],N=[[`.mx-menubar, .mx-menubar__bar, .mx-menubar__item`,'The menu bar, its row and a top-level item (`aria-expanded="true"` while open).'],[`.mx-context-menu, .mx-context-menu__anchor`,`The context menu, which has no box of its own, and the point it opens at.`],[`.mx-menu, .mx-menu__item, .mx-menu__separator`,`A menu (shared with Button), an item and a separator.`],[`.mx-menu__check, .mx-menu__icon, .mx-menu__label, .mx-menu__description, .mx-menu__shortcut, .mx-menu__arrow`,`The parts of an item.`]],P=[[`menubar.height, menubar.item-height`,`The height of the bar and of a top-level item.`],[`menubar.bar, menubar.item, menubar.icon, menubar.mnemonic`,"Units: the bar, a top-level item with its box per state (`hover`, `pressed`, `open`, `disabled`, `focus`), its icon, and its access key indicator (`shown`)."],[`menu.item, menu.item-height, menu.item-white-space`,"Menu items, shared with the Button menu: the item unit in each state (`highlight`, `pressed`, `focus`, `checked`, `disabled`, `first`, `last`, each tone and `<tone>-highlight`), the row height, and text wrapping."],[`menu.panel, menu.check, menu.icon, menu.check-mark, menu.radio-mark, menu.separator`,`Units: the item column, the leading indicator and icon, the check and radio marks, and the separator between groups.`],[`menu.label, menu.description, menu.shortcut, menu.arrow`,`Units: the item text, its description, the shortcut and the submenu arrow.`]];function F(){return s({initializeComponent:e=>{{let n=a(`p`,{initializeComponent:e=>{e.class.add(`lead`);let t=a(o,{text:`An application menu bar (File, Edit, View) and a context menu that opens on right-click. Both use the same menu items, which support submenus, check and radio items, shortcuts and access keys.`,runover:{},childs:[]});e.controls.add(t)}},1);e.controls.add(n);let s=a(r,{anchor:`import`,title:`Import`,runover:{},childs:[a(t,{code:`
import { MenuBar, ContextMenu, attachContextMenu, type MenuItem } from '@motifx-community/ui';
`,runover:{},childs:[]})]});e.controls.add(s);let l=a(r,{anchor:`menubar`,title:`MenuBar`,runover:{},childs:[a(`p`,{initializeComponent:e=>{let t=a(o,{text:"A `MenuBar` takes its top-level items as `items`, and the `items` of each one define its menu. `&File` assigns Alt+F to open File. Left and Right move along the bar and, while a menu is open, to the next menu. Escape returns to the bar.",runover:{},childs:[]});e.controls.add(t)}},1),a(i,{files:w(`MainMenu.tsx`),stack:!0,runover:{},childs:[a(C,{runover:{},childs:[]})]})]});e.controls.add(l);let u=a(r,{anchor:`items`,title:`Submenus, check items, radio items and shortcuts`,runover:{},childs:[a(`p`,{initializeComponent:e=>{let t=a(o,{text:"An item with `items` opens a submenu at its side. Right (Left on right-to-left pages), Enter or Space opens it, Left and Escape close it, and hovering opens it after a short delay. `checked` creates a check item, and `checked` with a `group` creates one choice in a set, shown with a dot. `shortcut` is displayed at the end of the item, so register the key separately with `addShortcut`. The same items work in a `Button` menu.",runover:{},childs:[]});e.controls.add(t)}},1),a(c,{head:[`Field`,`Type`,`Description`],rows:D,runover:{},childs:[]})]});e.controls.add(u);let d=a(r,{anchor:`context`,title:`ContextMenu`,runover:{},childs:[a(`p`,{initializeComponent:e=>{let t=a(o,{text:"A `ContextMenu` opens at the pointer when its target is right-clicked, and at the focused element with the Menu key or Shift+F10. `onOpening` receives the element (`e.target`) and builds the items for it, in this case for a row in a list. Setting `e.cancel = true` leaves the browser's own menu. The menu closes on Escape or a click outside. When the page scrolls, it follows the element it opened on and closes once that element is out of view.",runover:{},childs:[]});e.controls.add(t)}},1),a(i,{files:w(`FileList.tsx`),stack:!0,runover:{},childs:[a(S,{runover:{},childs:[]})]}),a(i,{title:`attachContextMenu`,files:w(`AttachedMenu.tsx`),runover:{},childs:[a(b,{runover:{},childs:[]})]})]});e.controls.add(d);let f=a(r,{anchor:`keyboard`,title:`Keyboard`,runover:{},childs:[a(c,{head:[`Key`,`Description`],rows:j,runover:{},childs:[]})]});e.controls.add(f);let p=a(r,{anchor:`a11y`,title:`Accessibility`,runover:{},childs:[a(c,{head:[`Topic`,`Details`],rows:M,runover:{},childs:[]})]});e.controls.add(p);let m=a(r,{anchor:`i18n`,title:`Localization`,runover:{},childs:[a(`p`,{initializeComponent:e=>{let t=a(o,{text:"Menus have no strings of their own. Every label, shortcut and name comes from your items, so they follow your own translations. A function in `text` updates immediately when the language changes.",runover:{},childs:[]});e.controls.add(t)}},1)]});e.controls.add(m);let h=a(r,{anchor:`styling`,title:`Styling`,runover:{},childs:[a(c,{head:[`Hook`,`Description`],rows:N,runover:{},childs:[]}),a(`h3`,{initializeComponent:e=>{let t=a(o,{text:`Component tokens`,runover:{},childs:[]});e.controls.add(t)}},1),a(c,{head:[`Token`,`Description`],rows:P,runover:{},childs:[]})]});e.controls.add(h);let g=a(r,{anchor:`api`,title:`API reference`,runover:{},childs:[a(`h3`,{initializeComponent:e=>{let t=a(o,{text:`MenuBar props`,runover:{},childs:[]});e.controls.add(t)}},1),a(c,{head:[`Prop`,`Type`,`Default`,`Description`],rows:T,runover:{},childs:[]}),a(`h3`,{initializeComponent:e=>{let t=a(o,{text:`ContextMenu props`,runover:{},childs:[]});e.controls.add(t)}},1),a(c,{head:[`Prop`,`Type`,`Default`,`Description`],rows:E,runover:{},childs:[]}),a(`h3`,{initializeComponent:e=>{let t=a(o,{text:`Properties`,runover:{},childs:[]});e.controls.add(t)}},1),a(c,{head:[`Property`,`Access`,`Description`],rows:k,runover:{},childs:[]}),a(`h3`,{initializeComponent:e=>{let t=a(o,{text:`Methods`,runover:{},childs:[]});e.controls.add(t)}},1),a(c,{head:[`Method`,`Returns`,`Description`],rows:O,runover:{},childs:[]}),a(`h3`,{initializeComponent:e=>{let t=a(o,{text:`Events`,runover:{},childs:[]});e.controls.add(t)}},1),a(c,{head:[`Event`,`When`],rows:A,runover:{},childs:[]})]});e.controls.add(g)}}})}export{F as default};