import{Mt as e,a as t,an as n,h as r,i,n as a,nn as o,r as s,rn as c,t as l}from"./doc-B1CtlCkV.js";import{t as u}from"./Switch-B8uj57cD.js";import{i as d}from"./item-own-value-yYXkkdgf.js";import{t as f}from"./Stack-AS0iyAxC.js";import{t as p}from"./ValidationGroup-T1woV0-X.js";import{t as m}from"./ListBox-C5RriEsd.js";import{t as h}from"./sources-BXVvOiIY.js";var g=`import { reactive } from '@motifx/core';\r
import { ListBox } from '@motifx-community/ui';\r
\r
interface Country {\r
  code: string;\r
  name: string;\r
  region: string;\r
  flag: string;\r
  member?: boolean;\r
}\r
\r
const countries: Country[] = [\r
  { code: 'TR', name: 'Türkiye', region: 'Europe', flag: '🇹🇷' },\r
  { code: 'DE', name: 'Germany', region: 'Europe', flag: '🇩🇪' },\r
  { code: 'FR', name: 'France', region: 'Europe', flag: '🇫🇷' },\r
  { code: 'NO', name: 'Norway', region: 'Europe', flag: '🇳🇴', member: false },\r
  { code: 'JP', name: 'Japan', region: 'Asia', flag: '🇯🇵' },\r
  { code: 'KR', name: 'Korea', region: 'Asia', flag: '🇰🇷' },\r
  { code: 'BR', name: 'Brazil', region: 'Americas', flag: '🇧🇷' },\r
  { code: 'CA', name: 'Canada', region: 'Americas', flag: '🇨🇦' },\r
];\r
\r
/** Objects read through textField and valueField, under group headers, one that cannot be chosen, drawn with a template. */\r
export default function Countries() {\r
  const form = reactive({ country: 'JP' as string | null });\r
  return (\r
    <>\r
      <ListBox\r
        label="Country"\r
        items={countries}\r
        textField="name"\r
        valueField="code"\r
        groupField="region"\r
        enabledField={(c: Country) => c.member !== false}\r
        itemTemplate={(c: Country, host: HTMLElement) => {\r
          host.textContent = \`\${c.flag}  \${c.name}\`;\r
        }}\r
        height={8}\r
        x-model={() => form.country}\r
      />\r
      <output class="lb-country">{() => \`code: \${form.country ?? '—'}\`}</output>\r
    </>\r
  );\r
}\r
`,_=`import { reactive } from '@motifx/core';\r
import { Button, ListBox, uiLocale } from '@motifx-community/ui';\r
\r
/** Switches the texts of every list on the page: “Select all”, the search box, “No items”. */\r
export default function Localization() {\r
  const s = reactive({ lang: 'en' });\r
  const toggle = () => {\r
    s.lang = s.lang === 'en' ? 'tr' : 'en';\r
    void uiLocale.use(s.lang);\r
  };\r
  return (\r
    <>\r
      <Button text={() => (s.lang === 'en' ? 'Language: English' : 'Dil: Türkçe')} variant="outline" onclick={toggle} />\r
      <ListBox label="Fruit" items={['Apple', 'Cherry', 'Pear']} selectionMode="multiple" selectAll searchEnabled />\r
      <ListBox label="Empty" items={[]} height={3} />\r
    </>\r
  );\r
}\r
`,v=`import { reactive } from '@motifx/core';\r
import { data } from '@motifx-community/data';\r
import { ListBox } from '@motifx-community/ui';\r
\r
interface Order {\r
  id: number;\r
  name: string;\r
}\r
\r
const rows: Order[] = Array.from({ length: 5000 }, (_, i) => ({ id: i + 1, name: \`Order #\${String(i + 1).padStart(5, '0')}\` }));\r
\r
/** 5,000 orders from a data source, loaded in blocks while the list scrolls and searched where they live. */\r
export default function Orders() {\r
  const form = reactive({ orders: [42, 4321] as number[] });\r
  const orders = new data.DataSource<Order, number>({\r
    adapter: new data.ArrayAdapter({ data: rows, key: 'id' }),\r
    loadMode: 'blocks',\r
    pageSize: 50,\r
    searchFields: ['name'],\r
  });\r
\r
  return (\r
    <>\r
      <ListBox\r
        label="Orders"\r
        dataSource={orders}\r
        textField="name"\r
        valueField="id"\r
        selectionMode="multiple"\r
        selectAll\r
        searchEnabled\r
        height={10}\r
        x-model={() => form.orders}\r
      />\r
      <output class="lb-orders">{() => \`\${form.orders.length} chosen\${form.orders.length && form.orders.length < 6 ? \`: \${form.orders.join(', ')}\` : ''}\`}</output>\r
    </>\r
  );\r
}\r
`,y=`import { reactive } from '@motifx/core';\r
import { Button, ListBox, Stack } from '@motifx-community/ui';\r
import { cities } from './cities';\r
\r
/** A list bound with x-model, and lists created with \`new\` and added programmatically. */\r
export default function Programmatic() {\r
  const form = reactive({ city: 'İzmir' as string | null, result: '' });\r
  let added = 0;\r
  let host: Stack | null = null;\r
\r
  const addProgrammatic = () => {\r
    const list = new ListBox<string, string>({ label: \`Size \${++added}\`, items: ['S', 'M', 'L', 'XL'], height: 4 });\r
    list.onValueChanged((e) => (form.result = \`\${list.label}: \${e.value}\`));\r
    host?.controls.add(list);\r
    list.focus();\r
  };\r
\r
  return (\r
    <>\r
      <ListBox label="&City" items={cities} x-model={() => form.city} />\r
      <Stack orientation="horizontal" wrap align="center">\r
        <output class="lb-city">{() => \`city: \${form.city ?? '—'}\`}</output>\r
        <Button text="Add a list programmatically" variant="outline" onclick={addProgrammatic} />\r
        <output class="lb-made">{() => form.result}</output>\r
      </Stack>\r
      <Stack orientation="horizontal" wrap align="center" ref={(c: Stack) => (host = c)} />\r
    </>\r
  );\r
}\r
`,b=`import { reactive } from '@motifx/core';\r
import { ListBox, Stack, Switch } from '@motifx-community/ui';\r
import { cities } from './cities';\r
\r
/** One list switched between one value and several, with check boxes, “Select all”, and a search box. */\r
export default function SeveralItems() {\r
  const s = reactive({ picked: ['Bursa', 'Konya'] as string[], multiple: true, checkBoxes: true, selectAll: true, follows: true, search: false });\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Switch label="Multiple" x-model={() => s.multiple} />\r
        <Switch label="Check boxes" x-model={() => s.checkBoxes} />\r
        <Switch label="Select all" x-model={() => s.selectAll} />\r
        <Switch label="Selection follows focus" x-model={() => s.follows} />\r
        <Switch label="Search" x-model={() => s.search} />\r
      </Stack>\r
      <Stack orientation="horizontal" wrap align="center">\r
        <ListBox\r
          label="Cities"\r
          items={cities}\r
          selectionMode={() => (s.multiple ? 'multiple' : 'single')}\r
          showCheckBoxes={() => s.checkBoxes}\r
          selectAll={() => s.selectAll}\r
          selectionFollowsFocus={() => s.follows}\r
          searchEnabled={() => s.search}\r
          value={() => (s.multiple ? s.picked : (s.picked[0] ?? null))}\r
          onValueChanged={(e) => (s.picked = Array.isArray(e.value) ? (e.value as string[]) : e.value === null ? [] : [e.value as string])}\r
        />\r
        <output class="lb-picked">{() => \`value: \${JSON.stringify(s.multiple ? s.picked : (s.picked[0] ?? null))}\`}</output>\r
      </Stack>\r
    </>\r
  );\r
}\r
`,x=`import { reactive } from '@motifx/core';\r
import { Button, ListBox, Stack, ValidationGroup } from '@motifx-community/ui';\r
import { cities } from './cities';\r
\r
/** A required list checked in a group, and the read-only and disabled states. */\r
export default function Validation() {\r
  const s = reactive({ sizes: [] as string[], result: '' });\r
  const group = new ValidationGroup();\r
\r
  const check = async () => {\r
    const result = await group.validate();\r
    s.result = result.valid ? 'Fine.' : 'Pick a size.';\r
  };\r
\r
  return (\r
    <>\r
      <ListBox\r
        label="Sizes"\r
        items={['S', 'M', 'L', 'XL']}\r
        selectionMode="multiple"\r
        required\r
        helpText="Pick one or more."\r
        validationGroup={group}\r
        x-model={() => s.sizes}\r
      />\r
      <ListBox label="Read-only" items={cities} value="Bursa" readOnly height={4} />\r
      <ListBox label="Disabled" items={cities} value="Bursa" enabled={false} height={4} />\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Button text="Check" variant="outline" onclick={check} />\r
        <output class="lb-check">{() => s.result}</output>\r
      </Stack>\r
    </>\r
  );\r
}\r
`,S=`/** The cities the lists of the examples show. */\r
export const cities = ['Ankara', 'Antalya', 'Bursa', 'İstanbul', 'İzmir', 'Konya', 'Trabzon'];\r
`,C=[{code:`TR`,name:`Türkiye`,region:`Europe`,flag:`🇹🇷`},{code:`DE`,name:`Germany`,region:`Europe`,flag:`🇩🇪`},{code:`FR`,name:`France`,region:`Europe`,flag:`🇫🇷`},{code:`NO`,name:`Norway`,region:`Europe`,flag:`🇳🇴`,member:!1},{code:`JP`,name:`Japan`,region:`Asia`,flag:`🇯🇵`},{code:`KR`,name:`Korea`,region:`Asia`,flag:`🇰🇷`},{code:`BR`,name:`Brazil`,region:`Americas`,flag:`🇧🇷`},{code:`CA`,name:`Canada`,region:`Americas`,flag:`🇨🇦`}];function w(){let e=n({country:`JP`});return c({initializeComponent:t=>{{let n=o(m,{label:`Country`,items:C,textField:`name`,valueField:`code`,groupField:`region`,enabledField:e=>e.member!==!1,itemTemplate:(e,t)=>{t.textContent=`${e.flag}  ${e.name}`},height:8,runover:{initializeComponent:t=>{t.bindings.model(()=>e.country,t=>{let n=e;n!=null&&typeof n.country!=`function`&&(n.country=t)})}},childs:[]});t.controls.add(n);let r=o(`output`,{initializeComponent:t=>{t.class.add(`lb-country`),t.bindings.method(()=>`code: ${e.country??`—`}`)}},1);t.controls.add(r)}}})}var T=[`Ankara`,`Antalya`,`Bursa`,`İstanbul`,`İzmir`,`Konya`,`Trabzon`];function E(){let e=n({city:`İzmir`,result:``}),t=0,i=null,a=()=>{let n=new m({label:`Size ${++t}`,items:[`S`,`M`,`L`,`XL`],height:4});n.onValueChanged(t=>e.result=`${n.label}: ${t.value}`),i?.controls.add(n),n.focus()};return c({initializeComponent:t=>{{let n=o(m,{label:`&City`,items:T,runover:{initializeComponent:t=>{t.bindings.model(()=>e.city,t=>{let n=e;n!=null&&typeof n.city!=`function`&&(n.city=t)})}},childs:[]});t.controls.add(n);let s=o(f,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[o(`output`,{initializeComponent:t=>{t.class.add(`lb-city`),t.bindings.method(()=>`city: ${e.city??`—`}`)}},1),o(r,{text:`Add a list programmatically`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,a)}},childs:[]}),o(`output`,{initializeComponent:t=>{t.class.add(`lb-made`),t.bindings.method(()=>e.result)}},1)]});t.controls.add(s);let c=o(f,{orientation:`horizontal`,wrap:!0,align:`center`,ref:e=>i=e,runover:{},childs:[]});t.controls.add(c)}}})}function D(){let t=n({lang:`en`}),i=()=>{t.lang=t.lang===`en`?`tr`:`en`,e.use(t.lang)};return c({initializeComponent:e=>{{let n=o(r,{text:()=>t.lang===`en`?`Language: English`:`Dil: Türkçe`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,i)}},childs:[]});e.controls.add(n);let a=o(m,{label:`Fruit`,items:[`Apple`,`Cherry`,`Pear`],selectionMode:`multiple`,selectAll:!0,searchEnabled:!0,runover:{},childs:[]});e.controls.add(a);let s=o(m,{label:`Empty`,items:[],height:3,runover:{},childs:[]});e.controls.add(s)}}})}var O=Array.from({length:5e3},(e,t)=>({id:t+1,name:`Order #${String(t+1).padStart(5,`0`)}`}));function k(){let e=n({orders:[42,4321]}),t=new d.DataSource({adapter:new d.ArrayAdapter({data:O,key:`id`}),loadMode:`blocks`,pageSize:50,searchFields:[`name`]});return c({initializeComponent:n=>{{let r=o(m,{label:`Orders`,dataSource:t,textField:`name`,valueField:`id`,selectionMode:`multiple`,selectAll:!0,searchEnabled:!0,height:10,runover:{initializeComponent:t=>{t.bindings.model(()=>e.orders,t=>{let n=e;n!=null&&typeof n.orders!=`function`&&(n.orders=t)})}},childs:[]});n.controls.add(r);let i=o(`output`,{initializeComponent:t=>{t.class.add(`lb-orders`),t.bindings.method(()=>`${e.orders.length} chosen${e.orders.length&&e.orders.length<6?`: ${e.orders.join(`, `)}`:``}`)}},1);n.controls.add(i)}}})}function A(){let e=n({picked:[`Bursa`,`Konya`],multiple:!0,checkBoxes:!0,selectAll:!0,follows:!0,search:!1});return c({initializeComponent:t=>{{let n=o(f,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[o(u,{label:`Multiple`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.multiple,t=>{let n=e;n!=null&&typeof n.multiple!=`function`&&(n.multiple=t)})}},childs:[]}),o(u,{label:`Check boxes`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.checkBoxes,t=>{let n=e;n!=null&&typeof n.checkBoxes!=`function`&&(n.checkBoxes=t)})}},childs:[]}),o(u,{label:`Select all`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.selectAll,t=>{let n=e;n!=null&&typeof n.selectAll!=`function`&&(n.selectAll=t)})}},childs:[]}),o(u,{label:`Selection follows focus`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.follows,t=>{let n=e;n!=null&&typeof n.follows!=`function`&&(n.follows=t)})}},childs:[]}),o(u,{label:`Search`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.search,t=>{let n=e;n!=null&&typeof n.search!=`function`&&(n.search=t)})}},childs:[]})]});t.controls.add(n);let r=o(f,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[o(m,{label:`Cities`,items:T,selectionMode:()=>e.multiple?`multiple`:`single`,showCheckBoxes:()=>e.checkBoxes,selectAll:()=>e.selectAll,selectionFollowsFocus:()=>e.follows,searchEnabled:()=>e.search,value:()=>e.multiple?e.picked:e.picked[0]??null,onValueChanged:t=>e.picked=Array.isArray(t.value)?t.value:t.value===null?[]:[t.value],runover:{},childs:[]}),o(`output`,{initializeComponent:t=>{t.class.add(`lb-picked`),t.bindings.method(()=>`value: ${JSON.stringify(e.multiple?e.picked:e.picked[0]??null)}`)}},1)]});t.controls.add(r)}}})}function j(){let e=n({sizes:[],result:``}),t=new p,i=async()=>{let n=await t.validate();e.result=n.valid?`Fine.`:`Pick a size.`};return c({initializeComponent:n=>{{let a=o(m,{label:`Sizes`,items:[`S`,`M`,`L`,`XL`],selectionMode:`multiple`,required:!0,helpText:`Pick one or more.`,validationGroup:t,runover:{initializeComponent:t=>{t.bindings.model(()=>e.sizes,t=>{let n=e;n!=null&&typeof n.sizes!=`function`&&(n.sizes=t)})}},childs:[]});n.controls.add(a);let s=o(m,{label:`Read-only`,items:T,value:`Bursa`,readOnly:!0,height:4,runover:{},childs:[]});n.controls.add(s);let c=o(m,{label:`Disabled`,items:T,value:`Bursa`,enabled:!1,height:4,runover:{},childs:[]});n.controls.add(c);let l=o(f,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[o(r,{text:`Check`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,i)}},childs:[]}),o(`output`,{initializeComponent:t=>{t.class.add(`lb-check`),t.bindings.method(()=>e.result)}},1)]});n.controls.add(l)}}})}var M=h(Object.assign({"./examples/Countries.tsx":g,"./examples/Localization.tsx":_,"./examples/Orders.tsx":v,"./examples/Programmatic.tsx":y,"./examples/SeveralItems.tsx":b,"./examples/Validation.tsx":x,"./examples/cities.ts":S})),N=[[`value`,"`Bind<V | V[] | null>`","`null` / `[]`","The selected value (single) or values (multiple). `x-model` binds it, and a change writes a new array."],[`items / dataSource`,"`Bind<readonly T[]>` / `Bind<DataSource | null>`",`—`,"An in-memory array, searched on the client, or a `@motifx-community/data` data source, searched on the server. A data source takes precedence."],[`textField, valueField`,"`Bind<ItemField<T>>`","`'text'`, `'value'`","A property name or a function `(item) => …`. Plain values serve as their own text and value."],[`iconField, groupField, enabledField`,"`Bind<ItemField<T>>`",`—`,`An icon for each item, headers between groups (in-memory items), and items that cannot be selected.`],[`selectionMode`,"`Bind<'single' | 'multiple'>`","`'single'`",`A single value, or an array of values.`],[`showCheckBoxes`,"`Bind<boolean>`","`true`","In multiple selection, shows check boxes in front of the items. `false` draws a check mark instead, and a plain click selects only that item."],[`selectAll`,"`Bind<boolean>`","`false`",`In multiple selection, adds a "Select all" row that can be checked, empty or indeterminate.`],[`selectionFollowsFocus`,"`Bind<boolean>`","`true`",`In single selection, the arrow keys select as they move. When off, they only move, and Space or Enter selects.`],[`searchEnabled`,"`Bind<boolean>`","`false`",`Adds a search box above the list.`],[`searchMode`,"`Bind<'contains' | 'startswith'>`","`'contains'`",`How the search matches in-memory items.`],[`searchDelay`,"`Bind<number>`","`0` / `250`",`The delay, in milliseconds, between the last keystroke and the search (in memory / with a data source).`],[`height`,"`Bind<number | string | null>`",`—`,'The height, in rows (`8`) or a CSS length (`"12rem"`). Without it, the list is as tall as its items, up to the `max-height` of the list (`list.container`).'],[`itemTemplate`,"`Bind<(item, host) => cleanup | void>`",`—`,`Customizes how an item is drawn.`],[`noItemsText`,"`Bind<string>`",`—`,"The text for an empty list, which replaces the `uiLocale` “No items” string."],[`label, labelMode, helpText, hint, readOnly, required, size, variant, stretch, rules, error, validateOn, validationGroup`,`see TextBox`,``,`Field props shared by all editors.`]],P=[[`every prop above`,`read/write, reactive`,`Accepts a value or a function, the same as the prop.`],[`selectedItems, selectedItem`,`read-only, reactive`,`The known items for the selected values. With a data source, the others are requested by key and added.`],[`listItems`,`read-only`,"The `DataItems` shown in the list, which are the results of the last search."],[`searchBox`,`read-only`,"The search `TextBox` while `searchEnabled` is on."],[`isValid, validationMessage`,`read-only, reactive`,`See TextBox.`]],F=[[`selectAllItems()`,"`Promise<void>`",`In multiple selection, selects every item the list shows (with a data source, after their values load).`],[`clear()`,"`void`",`Clears the selection.`],[`scrollToItem(item)`,"`void`",`Scrolls an item into view and highlights it.`],[`refresh()`,"`void`","Your items can be plain or reactive, and the list reads them as they are. After changing them in place, call `refresh()`. It re-reads the items, their text and values, and the selection."],[`validate(), resetValidation(), focus()`,``,`See TextBox.`]],I=[[`onValueChanged(e)`,"`{ value, previousValue, byUser, source, event? }`"],[`onValidated(e)`,`See TextBox.`]],L=[[`Tab`,`The list is one Tab stop. The search box, when enabled, is another.`],[`Down, Up, Home, End, Page Down, Page Up`,`Moves the highlight and skips items that cannot be selected. In single selection, the item is also selected.`],[`A letter`,`Moves to the next item that starts with that letter. Letters typed quickly are combined into one search.`],[`Space, Enter`,`In single selection, selects the highlighted item. In multiple selection, selects or deselects it.`],[`Shift + Down / Up`,`In multiple selection, moves and selects or deselects the next item.`],[`Shift + Space`,`In multiple selection, selects every item from the last selected item to the highlighted one.`],[`Control + Shift + Home / End`,`In multiple selection, selects every item from the highlighted one to the first or last item.`],[`Control + A`,`In multiple selection, selects every item, or clears the selection if all are selected.`],[`Down in the search box`,`Moves focus to the list.`],[`Control + click, Shift + click`,`In multiple selection, adds or removes one item, or selects the items in between.`]],R=[[`Pattern`,'The APG listbox. The list has `role="listbox"` and holds focus itself, and `aria-activedescendant` identifies the highlighted option.'],[`Options`,'`role="option"` with `aria-selected`, and `aria-disabled` on disabled items. Multi-select lists have `aria-multiselectable`.'],[`Name`,"The label names the list (`aria-labelledby`), help and error text describe it, and `aria-invalid` and `aria-required` report its state."],[`Groups`,'Each group has `role="group"` and is labeled by its header.'],[`Long lists`,"Only visible rows are rendered. Each option reports its position with `aria-posinset` and `aria-setsize`, and loading rows have `aria-busy`."],[`Focus`,`The highlight appears while the list is in use, and it also gets the focus ring during keyboard use.`]],z=[[`.mx-list-box`,"Added to the field. `data-selection-mode` and `data-check-boxes`, plus the TextBox field attributes."],[`.mx-list-box__search`,`The search box.`],[`.mx-list, .mx-list__item, .mx-list__header, .mx-list__check`,"The shared list, its options (`data-active`, `data-selected`), group headers and check boxes."],[`.mx-list__item[data-select-all]`,'The "Select all" row, with `data-mixed` when only some items are selected.']],B=[[`listbox.container, listbox.box`,`Units: the spacing around the list box, and around and between its search box and list.`],[`listbox.check`,"Unit: the check box of a row in a multi-select list (`checked`, `disabled`, `checked-disabled`)."],[`listbox.keys, listbox.idle`,"Units: the ring around the row with keyboard focus (`selected`), and that row while the list is not in use."],[`listbox.field, listbox.search, listbox.list`,`Places: the field, search box and list inside a list box, which are the list and field units as they appear here.`],[`list.*`,`The rows, as in DropDown: height, padding, highlight, selected item, headers and "Select all".`]];function V(){return c({initializeComponent:e=>{{let n=o(`p`,{initializeComponent:e=>{e.class.add(`lead`);let t=o(s,{text:`A list displayed directly on the page. Users select one or more items with the keyboard or pointer. Items can come from memory or a data source, can be searched and grouped, and long lists render only the visible rows.`,runover:{},childs:[]});e.controls.add(t)}},1);e.controls.add(n);let r=o(i,{anchor:`import`,title:`Import`,runover:{},childs:[o(t,{code:`
import { ListBox } from '@motifx-community/ui';
import { data } from '@motifx-community/data';
`,runover:{},childs:[]})]});e.controls.add(r);let c=o(i,{anchor:`ways`,title:`Declarative and programmatic`,runover:{},childs:[o(`p`,{initializeComponent:e=>{let t=o(s,{text:"`items` can be plain values, and `x-model` binds the selected value. When you create the component with `new`, set the same properties programmatically.",runover:{},childs:[]});e.controls.add(t)}},1),o(a,{files:M(`Programmatic.tsx`,`cities.ts`),runover:{},childs:[o(E,{runover:{},childs:[]})]})]});e.controls.add(c);let u=o(i,{anchor:`multiple`,title:`Multiple selection`,runover:{},childs:[o(`p`,{initializeComponent:e=>{let t=o(s,{text:"When `selectionMode` is `'multiple'`, the value is an array and every change writes a new one. Each option below is a prop you can bind.",runover:{},childs:[]});e.controls.add(t)}},1),o(a,{files:M(`SeveralItems.tsx`,`cities.ts`),stack:!0,runover:{},childs:[o(A,{runover:{},childs:[]})]})]});e.controls.add(u);let d=o(i,{anchor:`objects`,title:`Objects, groups, templates`,runover:{},childs:[o(`p`,{initializeComponent:e=>{let t=o(s,{text:"Custom objects are read through `textField` and `valueField`. `groupField` places items under headers, `enabledField` disables specific items, and `itemTemplate` customizes how an item is drawn.",runover:{},childs:[]});e.controls.add(t)}},1),o(a,{files:M(`Countries.tsx`),runover:{},childs:[o(w,{runover:{},childs:[]})]})]});e.controls.add(d);let f=o(i,{anchor:`data`,title:`From a data source`,runover:{},childs:[o(`p`,{initializeComponent:e=>{let t=o(s,{text:"With `dataSource`, the list reads a `DataSource` from the data layer, and the search runs there (using its `searchFields`). In `'blocks'` mode, only the visible rows load as the list scrolls. Selected values on unloaded rows stay selected, and “Select all” loads the values of every matching row. This example has 5,000 orders.",runover:{},childs:[]});e.controls.add(t)}},1),o(a,{files:M(`Orders.tsx`),runover:{},childs:[o(k,{runover:{},childs:[]})]})]});e.controls.add(f);let p=o(i,{anchor:`validation`,title:`Validation and states`,runover:{},childs:[o(a,{files:M(`Validation.tsx`,`cities.ts`),runover:{},childs:[o(j,{runover:{},childs:[]})]})]});e.controls.add(p);let m=o(i,{anchor:`keyboard`,title:`Keyboard`,runover:{},childs:[o(l,{head:[`Key`,`Description`],rows:L,runover:{},childs:[]})]});e.controls.add(m);let h=o(i,{anchor:`a11y`,title:`Accessibility`,runover:{},childs:[o(l,{head:[`Topic`,`Details`],rows:R,runover:{},childs:[]})]});e.controls.add(h);let g=o(i,{anchor:`i18n`,title:`Localization`,runover:{},childs:[o(`p`,{initializeComponent:e=>{let t=o(s,{text:"“Select all”, the search box, “No items” and “Loading…” come from `uiLocale.strings` (`selectAll`, `search`, `noItems`, `loading`).",runover:{},childs:[]});e.controls.add(t)}},1),o(a,{files:M(`Localization.tsx`),runover:{},childs:[o(D,{runover:{},childs:[]})]})]});e.controls.add(g);let _=o(i,{anchor:`styling`,title:`Styling`,runover:{},childs:[o(l,{head:[`Hook`,`Description`],rows:z,runover:{},childs:[]}),o(`h3`,{initializeComponent:e=>{let t=o(s,{text:`Component tokens`,runover:{},childs:[]});e.controls.add(t)}},1),o(l,{head:[`Token`,`Description`],rows:B,runover:{},childs:[]})]});e.controls.add(_);let v=o(i,{anchor:`api`,title:`API reference`,runover:{},childs:[o(`h3`,{initializeComponent:e=>{let t=o(s,{text:`Props`,runover:{},childs:[]});e.controls.add(t)}},1),o(l,{head:[`Prop`,`Type`,`Default`,`Description`],rows:N,runover:{},childs:[]}),o(`p`,{initializeComponent:e=>{let t=o(s,{text:"A prop that accepts a function as its value (`textField`, a template) uses the function as is when it has parameters. A function without parameters is treated as a getter, as with every other prop.",runover:{},childs:[]});e.controls.add(t)}},1),o(`h3`,{initializeComponent:e=>{let t=o(s,{text:`Properties`,runover:{},childs:[]});e.controls.add(t)}},1),o(l,{head:[`Property`,`Access`,`Description`],rows:P,runover:{},childs:[]}),o(`h3`,{initializeComponent:e=>{let t=o(s,{text:`Methods`,runover:{},childs:[]});e.controls.add(t)}},1),o(l,{head:[`Method`,`Returns`,`Description`],rows:F,runover:{},childs:[]}),o(`h3`,{initializeComponent:e=>{let t=o(s,{text:`Events`,runover:{},childs:[]});e.controls.add(t)}},1),o(l,{head:[`Event`,`When`],rows:I,runover:{},childs:[]})]});e.controls.add(v)}}})}export{V as default};