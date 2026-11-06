import{a as e,an as t,h as n,i as r,n as i,nn as a,r as o,rn as s,t as c}from"./doc-B1CtlCkV.js";import{t as l}from"./RadioGroup-BPy730Z_.js";import{t as u}from"./Stack-AS0iyAxC.js";import{t as d}from"./ActionSheet-DYh7fDD8.js";import{t as f}from"./ContextMenu-CCqfrkpd.js";import{t as p}from"./sources-BXVvOiIY.js";var m=`import { reactive, type Component } from '@motifx/core';\r
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
`,h=`import { reactive, type Component } from '@motifx/core';\r
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
          const row = (e.target as Element).closest('[data-row]')?.getAttribute('data-row');\r
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
`,_=[{text:`&Share…`},{text:`&Rename…`},{text:`&Move to`,items:[{text:`Reports`},{text:`Archive`},{text:`Shared with me`}]},{text:`&Delete`,tone:`danger`,beginGroup:!0}];function v(){let e=t({said:`Nothing chosen yet.`}),r,i=async()=>{let t=await new d({title:`report.pdf`,message:`Changed today at 09:41`}).choose(_,r);e.said=t?`Chosen: ${String(t.text).replace(`&`,``)}`:`Closed without a choice.`};return a(`div`,{ref:e=>r=e,initializeComponent:t=>{t.style(`display: contents`);let r=a(n,{text:`Actions…`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,i)}},childs:[]});t.controls.add(r);let o=a(`output`,{initializeComponent:t=>{t.bindings.method(()=>e.said)}},1);t.controls.add(o)}})}var y=[`Invoice 1042`,`Invoice 1043`,`Invoice 1044`];function b(){let e=t({presentation:`auto`,said:``}),n,r=t=>[{text:`&Open ${t}`,click:()=>e.said=`Opened ${t}`},{text:`&Copy number`,click:()=>e.said=`Copied ${t}`},{text:`&Delete`,tone:`danger`,click:()=>e.said=`Deleted ${t}`}];return a(u,{gap:`sm`,runover:{},childs:[a(l,{label:`Presentation`,orientation:`horizontal`,items:[{value:`menu`,text:`Menu`},{value:`sheet`,text:`Sheet`},{value:`auto`,text:`Auto`}],itemText:`text`,itemValue:`value`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.presentation,t=>{let n=e;n!=null&&typeof n.presentation!=`function`&&(n.presentation=t)})}},childs:[]}),a(`ul`,{ref:e=>n=e,initializeComponent:e=>{e.style(`margin: 0; padding: 0; list-style: none`),e.attr.add({"aria-label":`Invoices`});let t=a({initializeComponent:e=>{e.bindings.list(()=>y??[],e=>a(`li`,{indexkey:()=>e,initializeComponent:t=>{t.style(`padding: var(--mx-space-3); border-block-end: var(--mx-border-width-1) solid var(--mx-color-stroke-divider); user-select: none`),t.attr.add({tabindex:`0`,"data-row":e});let n=a(`text`,{initializeComponent:t=>{t.bindings.add(`textContent`,()=>{if(e!=null)return typeof e==`function`?e():()=>e})},__childExpr:()=>e});t.controls.add(n)}}))}});e.controls.add(t)}}),a(`output`,{initializeComponent:t=>{t.bindings.method(()=>e.said||`Right-click or long press a row; the Menu key on a focused row.`)}},1),a(f,{label:`Invoice`,target:()=>n,presentation:()=>e.presentation,onOpening:e=>{let t=e.target.closest(`[data-row]`)?.getAttribute(`data-row`);t?e.items=r(t):e.cancel=!0},runover:{},childs:[]})]})}function x(){let e=t({open:!1,sort:`date`,said:``}),r=(t,n)=>({text:n,group:`sort`,checked:()=>e.sort===t,click:()=>e.sort=t});return s({initializeComponent:t=>{{let i=a(n,{text:()=>`Sort by: ${e.sort}`,variant:`outline`,runover:{initializeComponent:t=>{t.motif.on(`click`,()=>e.open=!0)}},childs:[]});t.controls.add(i);let o=a(`output`,{initializeComponent:t=>{t.bindings.method(()=>e.said)}},1);t.controls.add(o);let s=a(d,{title:`Sort by`,cancelText:`Keep as it is`,items:[r(`date`,`Date`),r(`name`,`Name`),r(`size`,`Size`)],onItemClick:t=>e.said=`Sorted by ${String(t.item.text).toLowerCase()}.`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.open,t=>{let n=e;n!=null&&typeof n.open!=`function`&&(n.open=t)})}},childs:[]});t.controls.add(s)}}})}var S=p(Object.assign({"./examples/Choose.tsx":m,"./examples/FromContextMenu.tsx":h,"./examples/InJsx.tsx":g})),C=[[`items`,"`Bind<readonly MenuItem[]>`","`[]`","The commands: kit menu items with icons, check and radio marks, tones, `&` keys, groups and submenus. Shortcuts are not shown."],[`title`,"`Bind<string>`","`''`",'A title above the items, which also names the sheet. Otherwise, the name comes from `label`, or is "Actions".'],[`message`,"`Bind<string>`","`''`",`A line below the title that explains the choice.`],[`showCancel`,"`Bind<boolean>`","`true`",`Shows a separate Cancel button at the bottom.`],[`cancelText`,"`Bind<string>`","`''`","Its text. An empty value uses the `uiLocale` Cancel string."],[`detents`,"`Bind<readonly BottomSheetDetent[]>`","`['fit']`",`The height of its items, up to full. Any bottom sheet height works.`],[`onItemClick`,"`(e: MenuItemClickEventArgs) => void`",`—`,"Occurs when an item is selected, after the sheet closes and the item's own `click` runs."],[`every BottomSheet prop`,`see BottomSheet`,``,`Modal behavior, the handle, swipe down, Escape, the scrim and the back button work as on the [BottomSheet page](/bottomsheet#api).`]],w=[[`choose(items?, host?)`,"`Promise<MenuItem | null>`","Opens the sheet with these items and resolves with the selected item, or `null` if it closes without a selection. `host` gives it a place if it has none."],[`open(byKeyboard?)`,"`boolean`","Opens the sheet. `byKeyboard` moves focus to the first item. Otherwise, focus moves to the list, as with a menu opened by the pointer."],[`chosenItem`,`read-only`,`The item selected the last time the sheet was open.`],[`menu`,`read-only`,"Its `MenuList`."],[`refresh()`,"`void`","Your items can be plain or reactive, and the sheet reads them as they are. After changing them in place, call `refresh()`. The visible level updates."],[`ContextMenu presentation`,"`Bind<'menu' | 'sheet' | 'auto'>`","On `ContextMenu`, the default is `'menu'`. `'sheet'` opens its items in an action sheet. `'auto'` does so when a finger opened the menu with a long press, or on a screen with only a coarse pointer unless a key opened it. `onOpening`, `onItemClick` and `onClosed` work the same way, and `actionSheet` is the sheet."]],T=[[`Up, Down, Home, End`,`Moves between the items, wrapping at the ends.`],["Enter, Space, an item's `&` letter",`Selects the item, or opens a submenu in place.`],[`A letter`,`Moves to the next item that starts with that letter.`],[`Escape`,`Closes the sheet without a selection.`],[`Tab`,`Moves to the Cancel button and back.`]],E=[[`Dialog and menu`,"The sheet is a `dialog` named by its title. The items are a `menu` of `menuitem`, `menuitemcheckbox` and `menuitemradio` elements, as in the kit's menus."],[`Focus`,`When opened from the keyboard, focus moves to the first item. When opened by touch or pointer, it moves to the list. Focus returns to where it was when the sheet closes.`],[`Submenus`,`Submenus replace the menu in place, with "Back" as the first item. An arrow at the end of an item indicates a submenu.`],[`Touch`,"Items are `control.height.lg` tall (`actionsheet.item-height`), which exceeds the 24 pixels required by WCAG 2.2."]],D=[[`.mx-action-sheet`,"Built on the bottom sheet layer (`.mx-bottom-sheet`) and its hooks."],[`.mx-action-sheet__message`,`Text below the title.`],[`.mx-action-sheet__list`,"The menu (`.mx-menu`)."],[`.mx-action-sheet__cancel`,`The Cancel button row.`],[`.mx-action-sheet__back`,`The Back indicator.`]],O=[[`actionsheet.message, actionsheet.back, actionsheet.cancel`,"Units: the message, the Back item indicator (`rtl`), and the strip that holds the Cancel button."],[`actionsheet.menu.*, actionsheet.cancel-button.*, actionsheet.sheet.*`,`Places: touch-sized items, the Cancel button and the sheet content padding.`],[`sheet.*`,`The surface, handle and title, as on the bottom sheet.`]];function k(){return s({initializeComponent:t=>{{let n=a(`p`,{initializeComponent:e=>{e.class.add(`lead`);let t=a(o,{text:`A list of commands that slides up from the bottom of the screen, built from the kit's menu items and sized for touch. It supports a title, a message and a separate Cancel button. A context menu uses it on touch screens.`,runover:{},childs:[]});e.controls.add(t)}},1);t.controls.add(n);let s=a(r,{anchor:`import`,title:`Import`,runover:{},childs:[a(e,{code:`
import { ActionSheet, type ActionSheetProps } from '@motifx-community/ui';
`,runover:{},childs:[]})]});t.controls.add(s);let l=a(r,{anchor:`choose`,title:`Choosing programmatically`,runover:{},childs:[a(`p`,{initializeComponent:e=>{let t=a(o,{text:"`choose()` opens the sheet and resolves with the selected item, or `null`. An item with `items` opens its submenu in place, with a Back option.",runover:{},childs:[]});e.controls.add(t)}},1),a(i,{files:S(`Choose.tsx`),runover:{},childs:[a(v,{runover:{},childs:[]})]})]});t.controls.add(l);let u=a(r,{anchor:`jsx`,title:`Using it in JSX`,runover:{},childs:[a(`p`,{initializeComponent:e=>{let t=a(o,{text:"Bind it with `x-model`. Check and radio items show their marks, and `cancelText` sets the Cancel button text.",runover:{},childs:[]});e.controls.add(t)}},1),a(i,{files:S(`InJsx.tsx`),runover:{},childs:[a(x,{runover:{},childs:[]})]})]});t.controls.add(u);let d=a(r,{anchor:`context-menu`,title:`Context menus on touch screens`,runover:{},childs:[a(`p`,{initializeComponent:e=>{let t=a(o,{text:"`ContextMenu` has a `presentation` prop: `'menu'` (the default), `'sheet'`, or `'auto'`, which opens an action sheet when a finger opened the menu with a long press. The items, `onOpening` and `onItemClick` stay the same.",runover:{},childs:[]});e.controls.add(t)}},1),a(i,{files:S(`FromContextMenu.tsx`),runover:{},childs:[a(b,{runover:{},childs:[]})]})]});t.controls.add(d);let f=a(r,{anchor:`keyboard`,title:`Keyboard`,runover:{},childs:[a(c,{head:[`Key`,`Description`],rows:T,runover:{},childs:[]})]});t.controls.add(f);let p=a(r,{anchor:`a11y`,title:`Accessibility`,runover:{},childs:[a(c,{head:[`Topic`,`Details`],rows:E,runover:{},childs:[]})]});t.controls.add(p);let m=a(r,{anchor:`i18n`,title:`Localization`,runover:{},childs:[a(`p`,{initializeComponent:e=>{let t=a(o,{text:"Cancel, Back and the default name come from `uiLocale.strings` (`cancel`, `back`, `actionSheetLabel`). `cancelText` sets custom text.",runover:{},childs:[]});e.controls.add(t)}},1)]});t.controls.add(m);let h=a(r,{anchor:`styling`,title:`Styling`,runover:{},childs:[a(c,{head:[`Hook`,`Description`],rows:D,runover:{},childs:[]}),a(`h3`,{initializeComponent:e=>{let t=a(o,{text:`Component tokens`,runover:{},childs:[]});e.controls.add(t)}},1),a(c,{head:[`Token`,`Description`],rows:O,runover:{},childs:[]})]});t.controls.add(h);let g=a(r,{anchor:`api`,title:`API reference`,runover:{},childs:[a(`h3`,{initializeComponent:e=>{let t=a(o,{text:`Props`,runover:{},childs:[]});e.controls.add(t)}},1),a(c,{head:[`Prop`,`Type`,`Default`,`Description`],rows:C,runover:{},childs:[]}),a(`h3`,{initializeComponent:e=>{let t=a(o,{text:`Members`,runover:{},childs:[]});e.controls.add(t)}},1),a(c,{head:[`Member`,`Returns`,`Description`],rows:w,runover:{},childs:[]})]});t.controls.add(g)}}})}export{k as default};