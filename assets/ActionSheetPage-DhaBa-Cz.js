import{Qn as e,Zn as t,er as n,n as r}from"./next-id-CtzpBrBT.js";import{t as i}from"./RadioGroup-DbpJGVz-.js";import{t as a}from"./ActionSheet-CDKOD11L.js";import{t as o}from"./ContextMenu-D9pbQKHG.js";import{t as s}from"./Stack-wRt1e9tO.js";import{a as c,i as l,n as u,r as d,t as f}from"./docs-B_LZlyP5.js";import{t as p}from"./sources-BXVvOiIY.js";var m=`import { reactive, type Component } from '@motifx/core';\r
import { ActionSheet, Button, type MenuItem } from '@motifx-community/ui';\r
\r
const ITEMS: MenuItem[] = [\r
  { text: '&Share…' },\r
  { text: '&Rename…' },\r
  {\r
    text: '&Move to',\r
    items: [{ text: 'Reports' }, { text: 'Archive' }, { text: 'Shared with me' }],\r
  },\r
  { text: '&Delete', tone: 'danger', beginGroup: true },\r
];\r
\r
/** choose() opens the sheet and resolves with the item chosen, or null; a submenu opens in place, with a way back. */\r
export default function Choose() {\r
  const s = reactive({ said: 'Nothing chosen yet.' });\r
  let host!: Component<HTMLDivElement>;\r
\r
  const ask = async () => {\r
    const sheet = new ActionSheet({ title: 'report.pdf', message: 'Changed today at 09:41' });\r
    const item = await sheet.choose(ITEMS, host);\r
    s.said = item ? \`Chosen: \${String(item.text).replace('&', '')}\` : 'Closed without a choice.';\r
  };\r
\r
  return (\r
    <div ref={(c: Component<HTMLDivElement>) => (host = c)} style="display: contents">\r
      <Button text="Actions…" variant="outline" onclick={ask} />\r
      <output>{() => s.said}</output>\r
    </div>\r
  );\r
}\r
`,h=`import { reactive, type Component, type ComponentBase } from '@motifx/core';\r
import { ContextMenu, RadioGroup, Stack, type ContextMenuPresentation, type MenuItem } from '@motifx-community/ui';\r
\r
const ROWS = ['Invoice 1042', 'Invoice 1043', 'Invoice 1044'];\r
\r
/** One ContextMenu, shown as a menu, as an action sheet, or (auto) as a sheet when opened by touch: long press a row on a phone. */\r
export default function FromContextMenu() {\r
  const s = reactive({ presentation: 'auto' as ContextMenuPresentation, said: '' });\r
  let list!: Component<HTMLUListElement>;\r
\r
  const items = (row: string): MenuItem[] => [\r
    { text: \`&Open \${row}\`, click: () => (s.said = \`Opened \${row}\`) },\r
    { text: '&Copy number', click: () => (s.said = \`Copied \${row}\`) },\r
    { text: '&Delete', tone: 'danger', click: () => (s.said = \`Deleted \${row}\`) },\r
  ];\r
\r
  return (\r
    <Stack gap="sm">\r
      <RadioGroup\r
        label="Presentation"\r
        orientation="horizontal"\r
        items={[\r
          { value: 'menu', text: 'Menu' },\r
          { value: 'sheet', text: 'Sheet' },\r
          { value: 'auto', text: 'Auto' },\r
        ]}\r
        itemText="text"\r
        itemValue="value"\r
        x-model={() => s.presentation}\r
      />\r
      <ul ref={(c: Component<HTMLUListElement>) => (list = c)} aria-label="Invoices" style="margin: 0; padding: 0; list-style: none">\r
        {ROWS.map((row) => (\r
          <li key={row} tabindex="0" data-row={row} style="padding: var(--mx-space-3); border-block-end: var(--mx-border-width-1) solid var(--mx-color-stroke-divider); user-select: none">\r
            {row}\r
          </li>\r
        ))}\r
      </ul>\r
      <output>{() => s.said || 'Right-click or long press a row; the Menu key on a focused row.'}</output>\r
      <ContextMenu\r
        label="Invoice"\r
        target={() => list}\r
        presentation={() => s.presentation}\r
        onOpening={(e) => {\r
          let row: string | null = null;\r
          for (let part: ComponentBase | null = e.part; part && !row; part = part.parent) row = part.attr.get('data-row');\r
          if (row) e.items = items(row);\r
          else e.cancel = true;\r
        }}\r
      />\r
    </Stack>\r
  );\r
}\r
`,g=`import { reactive } from '@motifx/core';\r
import { ActionSheet, Button, type MenuItem } from '@motifx-community/ui';\r
\r
/** An action sheet in JSX, bound with x-model, with checked items and its own cancel text; onItemClick reports the choice. */\r
export default function InJsx() {\r
  const s = reactive({ open: false, sort: 'date', said: '' });\r
\r
  const sortItem = (value: string, text: string): MenuItem => ({\r
    text,\r
    group: 'sort',\r
    checked: () => s.sort === value,\r
    click: () => (s.sort = value),\r
  });\r
\r
  return (\r
    <>\r
      <Button text={() => \`Sort by: \${s.sort}\`} variant="outline" onclick={() => (s.open = true)} />\r
      <output>{() => s.said}</output>\r
      <ActionSheet\r
        title="Sort by"\r
        cancelText="Keep as it is"\r
        items={[sortItem('date', 'Date'), sortItem('name', 'Name'), sortItem('size', 'Size')]}\r
        x-model={() => s.open}\r
        onItemClick={(e) => (s.said = \`Sorted by \${String(e.item.text).toLowerCase()}.\`)}\r
      />\r
    </>\r
  );\r
}\r
`,_=[{text:`&Share…`},{text:`&Rename…`},{text:`&Move to`,items:[{text:`Reports`},{text:`Archive`},{text:`Shared with me`}]},{text:`&Delete`,tone:`danger`,beginGroup:!0}];function v(){let e=n({said:`Nothing chosen yet.`}),i,o=async()=>{let t=await new a({title:`report.pdf`,message:`Changed today at 09:41`}).choose(_,i);e.said=t?`Chosen: ${String(t.text).replace(`&`,``)}`:`Closed without a choice.`};return t(`div`,{ref:e=>i=e,initializeComponent:n=>{n.style(`display: contents`);let i=t(r,{text:`Actions…`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,o)}},childs:[]});n.controls.add(i);let a=t(`output`,{initializeComponent:t=>{t.bindings.method(()=>e.said)}},1);n.controls.add(a)}})}var y=[`Invoice 1042`,`Invoice 1043`,`Invoice 1044`];function b(){let e=n({presentation:`auto`,said:``}),r,a=t=>[{text:`&Open ${t}`,click:()=>e.said=`Opened ${t}`},{text:`&Copy number`,click:()=>e.said=`Copied ${t}`},{text:`&Delete`,tone:`danger`,click:()=>e.said=`Deleted ${t}`}];return t(s,{gap:`sm`,runover:{},childs:[t(i,{label:`Presentation`,orientation:`horizontal`,items:[{value:`menu`,text:`Menu`},{value:`sheet`,text:`Sheet`},{value:`auto`,text:`Auto`}],itemText:`text`,itemValue:`value`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.presentation,t=>{let n=e;n!=null&&typeof n.presentation!=`function`&&(n.presentation=t)})}},childs:[]}),t(`ul`,{ref:e=>r=e,initializeComponent:e=>{e.style(`margin: 0; padding: 0; list-style: none`),e.attr.add({"aria-label":`Invoices`});let n=t({initializeComponent:e=>{e.bindings.list(()=>y??[],e=>t(`li`,{indexkey:()=>e,initializeComponent:n=>{n.style(`padding: var(--mx-space-3); border-block-end: var(--mx-border-width-1) solid var(--mx-color-stroke-divider); user-select: none`),n.attr.add({tabindex:`0`,"data-row":e});let r=t(`text`,{initializeComponent:t=>{t.bindings.add(`textContent`,()=>{if(e!=null)return typeof e==`function`?e():()=>e})},__childExpr:()=>e});n.controls.add(r)}}))}});e.controls.add(n)}}),t(`output`,{initializeComponent:t=>{t.bindings.method(()=>e.said||`Right-click or long press a row; the Menu key on a focused row.`)}},1),t(o,{label:`Invoice`,target:()=>r,presentation:()=>e.presentation,onOpening:e=>{let t=null;for(let n=e.part;n&&!t;n=n.parent)t=n.attr.get(`data-row`);t?e.items=a(t):e.cancel=!0},runover:{},childs:[]})]})}function x(){let i=n({open:!1,sort:`date`,said:``}),o=(e,t)=>({text:t,group:`sort`,checked:()=>i.sort===e,click:()=>i.sort=e});return e({initializeComponent:e=>{{let n=t(r,{text:()=>`Sort by: ${i.sort}`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,()=>i.open=!0)}},childs:[]});e.controls.add(n);let s=t(`output`,{initializeComponent:e=>{e.bindings.method(()=>i.said)}},1);e.controls.add(s);let c=t(a,{title:`Sort by`,cancelText:`Keep as it is`,items:[o(`date`,`Date`),o(`name`,`Name`),o(`size`,`Size`)],onItemClick:e=>i.said=`Sorted by ${String(e.item.text).toLowerCase()}.`,runover:{initializeComponent:e=>{e.bindings.model(()=>i.open,e=>{let t=i;t!=null&&typeof t.open!=`function`&&(t.open=e)})}},childs:[]});e.controls.add(c)}}})}var S=p(Object.assign({"./examples/Choose.tsx":m,"./examples/FromContextMenu.tsx":h,"./examples/InJsx.tsx":g})),C=[[`items`,"`Bind<readonly MenuItem[]>`","`[]`","The commands: kit menu items with icons, check and radio marks, tones, `&` keys, groups and submenus. Shortcuts are not shown."],[`title`,"`Bind<string>`","`''`",'A title above the items, which also names the sheet. Otherwise, the name comes from `label`, or is "Actions".'],[`message`,"`Bind<string>`","`''`",`A line below the title that explains the choice.`],[`showCancel`,"`Bind<boolean>`","`true`",`Shows a separate Cancel button at the bottom.`],[`cancelText`,"`Bind<string>`","`''`","Its text. An empty value uses the `uiLocale` Cancel string."],[`detents`,"`Bind<readonly BottomSheetDetent[]>`","`['fit']`",`The height of its items, up to full. Any bottom sheet height works.`],[`onItemClick`,"`(e: MenuItemClickEventArgs) => void`",`—`,"Occurs when an item is selected, after the sheet closes and the item's own `click` runs."],[`every BottomSheet prop`,`see BottomSheet`,``,`Modal behavior, the handle, swipe down, Escape, the scrim and the back button work as on the [BottomSheet page](/bottomsheet#api).`]],w=[[`choose(items?, host?)`,"`Promise<MenuItem | null>`","Opens the sheet with these items and resolves with the selected item, or `null` if it closes without a selection. `host` gives it a place if it has none."],[`open(byKeyboard?)`,"`boolean`","Opens the sheet. `byKeyboard` moves focus to the first item. Otherwise, focus moves to the list, as with a menu opened by the pointer."],[`chosenItem`,`read-only`,`The item selected the last time the sheet was open.`],[`menu`,`read-only`,"Its `MenuList`."],[`refresh()`,"`void`","Your items can be plain or reactive, and the sheet reads them as they are. After changing them in place, call `refresh()`. The visible level updates."],[`ContextMenu presentation`,"`Bind<'menu' | 'sheet' | 'auto'>`","On `ContextMenu`, the default is `'menu'`. `'sheet'` opens its items in an action sheet. `'auto'` does so when a finger opened the menu with a long press, or on a screen with only a coarse pointer unless a key opened it. `onOpening`, `onItemClick` and `onClosed` work the same way, and `actionSheet` is the sheet."]],T=[[`Up, Down, Home, End`,`Moves between the items, wrapping at the ends.`],["Enter, Space, an item's `&` letter",`Selects the item, or opens a submenu in place.`],[`A letter`,`Moves to the next item that starts with that letter.`],[`Escape`,`Closes the sheet without a selection.`],[`Tab`,`Moves to the Cancel button and back.`]],E=[[`Dialog and menu`,"The sheet is a `dialog` named by its title. The items are a `menu` of `menuitem`, `menuitemcheckbox` and `menuitemradio` elements, as in the kit's menus."],[`Focus`,`When opened from the keyboard, focus moves to the first item. When opened by touch or pointer, it moves to the list. Focus returns to where it was when the sheet closes.`],[`Submenus`,`Submenus replace the menu in place, with "Back" as the first item. An arrow at the end of an item indicates a submenu.`],[`Touch`,"Items are `control.height.lg` tall (`actionsheet.item-height`), which exceeds the 24 pixels required by WCAG 2.2."]],D=[[`.mx-action-sheet`,"Built on the bottom sheet layer (`.mx-bottom-sheet`) and its hooks."],[`.mx-action-sheet__message`,`Text below the title.`],[`.mx-action-sheet__list`,"The menu (`.mx-menu`)."],[`.mx-action-sheet__cancel`,`The Cancel button row.`],[`.mx-action-sheet__back`,`The Back indicator.`]],O=[[`actionsheet.message, actionsheet.back, actionsheet.cancel`,"Units: the message, the Back item indicator (`rtl`), and the strip that holds the Cancel button."],[`actionsheet.menu.*, actionsheet.cancel-button.*, actionsheet.sheet.*`,`Places: touch-sized items, the Cancel button and the sheet content padding.`],[`sheet.*`,`The surface, handle and title, as on the bottom sheet.`]];function k(){return e({initializeComponent:e=>{{let n=t(`p`,{initializeComponent:e=>{e.class.add(`lead`);let n=t(d,{text:`A list of commands that slides up from the bottom of the screen, built from the kit's menu items and sized for touch. It supports a title, a message and a separate Cancel button. A context menu uses it on touch screens.`,runover:{},childs:[]});e.controls.add(n)}},1);e.controls.add(n);let r=t(l,{anchor:`import`,title:`Import`,runover:{},childs:[t(c,{code:`
import { ActionSheet, type ActionSheetProps } from '@motifx-community/ui';
`,runover:{},childs:[]})]});e.controls.add(r);let i=t(l,{anchor:`choose`,title:`Choosing programmatically`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(d,{text:"`choose()` opens the sheet and resolves with the selected item, or `null`. An item with `items` opens its submenu in place, with a Back option.",runover:{},childs:[]});e.controls.add(n)}},1),t(u,{files:S(`Choose.tsx`),runover:{},childs:[t(v,{runover:{},childs:[]})]})]});e.controls.add(i);let a=t(l,{anchor:`jsx`,title:`Using it in JSX`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(d,{text:"Bind it with `x-model`. Check and radio items show their marks, and `cancelText` sets the Cancel button text.",runover:{},childs:[]});e.controls.add(n)}},1),t(u,{files:S(`InJsx.tsx`),runover:{},childs:[t(x,{runover:{},childs:[]})]})]});e.controls.add(a);let o=t(l,{anchor:`context-menu`,title:`Context menus on touch screens`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(d,{text:"`ContextMenu` has a `presentation` prop: `'menu'` (the default), `'sheet'`, or `'auto'`, which opens an action sheet when a finger opened the menu with a long press. The items, `onOpening` and `onItemClick` stay the same.",runover:{},childs:[]});e.controls.add(n)}},1),t(u,{files:S(`FromContextMenu.tsx`),runover:{},childs:[t(b,{runover:{},childs:[]})]})]});e.controls.add(o);let s=t(l,{anchor:`keyboard`,title:`Keyboard`,runover:{},childs:[t(f,{head:[`Key`,`Description`],rows:T,runover:{},childs:[]})]});e.controls.add(s);let p=t(l,{anchor:`a11y`,title:`Accessibility`,runover:{},childs:[t(f,{head:[`Topic`,`Details`],rows:E,runover:{},childs:[]})]});e.controls.add(p);let m=t(l,{anchor:`i18n`,title:`Localization`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(d,{text:"Cancel, Back and the default name come from `uiLocale.strings` (`cancel`, `back`, `actionSheetLabel`). `cancelText` sets custom text.",runover:{},childs:[]});e.controls.add(n)}},1)]});e.controls.add(m);let h=t(l,{anchor:`styling`,title:`Styling`,runover:{},childs:[t(f,{head:[`Hook`,`Description`],rows:D,runover:{},childs:[]}),t(`h3`,{initializeComponent:e=>{let n=t(d,{text:`Component tokens`,runover:{},childs:[]});e.controls.add(n)}},1),t(f,{head:[`Token`,`Description`],rows:O,runover:{},childs:[]})]});e.controls.add(h);let g=t(l,{anchor:`api`,title:`API reference`,runover:{},childs:[t(`h3`,{initializeComponent:e=>{let n=t(d,{text:`Props`,runover:{},childs:[]});e.controls.add(n)}},1),t(f,{head:[`Prop`,`Type`,`Default`,`Description`],rows:C,runover:{},childs:[]}),t(`h3`,{initializeComponent:e=>{let n=t(d,{text:`Members`,runover:{},childs:[]});e.controls.add(n)}},1),t(f,{head:[`Member`,`Returns`,`Description`],rows:w,runover:{},childs:[]})]});e.controls.add(g)}}})}export{k as default};