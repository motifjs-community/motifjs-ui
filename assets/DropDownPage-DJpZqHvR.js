import{Mt as e,a as t,an as n,h as r,i,n as a,nn as o,r as s,rn as c,t as l}from"./doc-B1CtlCkV.js";import{t as u}from"./DropDown-DyxFHNUX.js";import{t as d}from"./Stack-AS0iyAxC.js";import{t as f}from"./ValidationGroup-T1woV0-X.js";import{t as p}from"./sources-BXVvOiIY.js";var m=`import { reactive } from '@motifx/core';\r
import { DropDown } from '@motifx-community/ui';\r
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
  { code: 'TR', name: 'Türkiye', region: 'Europe', flag: '🇹🇷', member: true },\r
  { code: 'DE', name: 'Germany', region: 'Europe', flag: '🇩🇪', member: true },\r
  { code: 'FR', name: 'France', region: 'Europe', flag: '🇫🇷', member: true },\r
  { code: 'NO', name: 'Norway', region: 'Europe', flag: '🇳🇴', member: false },\r
  { code: 'JP', name: 'Japan', region: 'Asia', flag: '🇯🇵', member: true },\r
  { code: 'KR', name: 'Korea', region: 'Asia', flag: '🇰🇷', member: true },\r
  { code: 'BR', name: 'Brazil', region: 'Americas', flag: '🇧🇷', member: true },\r
  { code: 'CA', name: 'Canada', region: 'Americas', flag: '🇨🇦', member: true },\r
];\r
\r
/** Draws a country as its flag and its name, in the list and in the field. */\r
const drawCountry = (c: Country, host: HTMLElement) => {\r
  host.textContent = \`\${c.flag}  \${c.name}\`;\r
};\r
\r
/** Objects read through textField and valueField, under group headers, one that cannot be chosen, drawn with templates. */\r
export default function Countries() {\r
  const form = reactive({ country: 'TR' as string | null });\r
  return (\r
    <>\r
      <DropDown\r
        label="Country"\r
        items={countries}\r
        textField="name"\r
        valueField="code"\r
        groupField="region"\r
        enabledField={(c: Country) => c.member !== false}\r
        itemTemplate={drawCountry}\r
        fieldTemplate={drawCountry}\r
        x-model={() => form.country}\r
      />\r
      <output class="dd-country">{() => \`code: \${form.country ?? '—'}\`}</output>\r
    </>\r
  );\r
}\r
`,h=`import { reactive } from '@motifx/core';\r
import { Button, DropDown } from '@motifx-community/ui';\r
\r
/** Items changed in place: the drop-down reads them again on \`refresh()\`. */\r
export default function LiveItems() {\r
  const model = reactive({ statuses: ['Draft', 'Review'], status: 'Draft' as string | null });\r
  let field!: DropDown<string, string>;\r
  const add = () => {\r
    model.statuses.push('Published');\r
    field.refresh();\r
  };\r
  return (\r
    <>\r
      <DropDown ref={(d: DropDown<string, string>) => (field = d)} label="Status" items={() => model.statuses} x-model={() => model.status} />\r
      <Button text="Add “Published”" variant="outline" enabled={() => !model.statuses.includes('Published')} onclick={add} />\r
    </>\r
  );\r
}\r
`,g=`import { reactive } from '@motifx/core';\r
import { Button, DropDown, uiLocale } from '@motifx-community/ui';\r
\r
/** Switches the texts of every drop-down on the page: the search box, the clear button, the empty list. */\r
export default function Localization() {\r
  const s = reactive({ lang: 'en' });\r
  const toggle = () => {\r
    s.lang = s.lang === 'en' ? 'tr' : 'en';\r
    void uiLocale.use(s.lang);\r
  };\r
  return (\r
    <>\r
      <Button text={() => (s.lang === 'en' ? 'Language: English' : 'Dil: Türkçe')} variant="outline" onclick={toggle} />\r
      <DropDown label="Empty" items={[]} placeholder="Open me" />\r
    </>\r
  );\r
}\r
`,_=`import { reactive } from '@motifx/core';\r
import { DropDown } from '@motifx-community/ui';\r
\r
const orders = Array.from({ length: 5000 }, (_, i) => ({ value: i + 1, text: \`Order #\${String(i + 1).padStart(5, '0')}\` }));\r
\r
/** 5,000 orders with a search box; the list draws only the rows in view. */\r
export default function LongList() {\r
  const form = reactive({ order: 1200 as number | null });\r
  return (\r
    <>\r
      <DropDown label="Order" items={orders} searchEnabled x-model={() => form.order} />\r
      <output class="dd-order">{() => \`order: \${form.order ?? '—'}\`}</output>\r
    </>\r
  );\r
}\r
`,v=`import { reactive } from '@motifx/core';\r
import { Button, DropDown, Stack } from '@motifx-community/ui';\r
import { cities } from './cities';\r
\r
/** Drop-downs bound with x-model, and drop-downs created with \`new\` and added programmatically. */\r
export default function Programmatic() {\r
  const form = reactive({ city: 'İzmir' as string | null, size: null as string | null, result: '' });\r
  let added = 0;\r
  let host: Stack | null = null;\r
\r
  const addProgrammatic = () => {\r
    const size = new DropDown<string, string>({ label: \`Size \${++added}\`, items: ['S', 'M', 'L'], placeholder: 'Pick one' });\r
    size.onValueChanged((e) => (form.result = \`\${size.label}: \${e.value}\`));\r
    host?.controls.add(size);\r
    size.focus();\r
  };\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center">\r
        <DropDown label="&City" items={cities} x-model={() => form.city} />\r
        <output class="dd-city">{() => \`city: \${form.city ?? '—'}\`}</output>\r
      </Stack>\r
      <DropDown label="Size" items={['S', 'M', 'L', 'XL']} placeholder="Pick one" x-model={() => form.size} clearButton />\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Button text="Add a drop-down programmatically" variant="outline" onclick={addProgrammatic} />\r
        <output class="dd-made">{() => form.result}</output>\r
      </Stack>\r
      <Stack orientation="horizontal" wrap align="center" ref={(c: Stack) => (host = c)} />\r
    </>\r
  );\r
}\r
`,y=`import { reactive } from '@motifx/core';\r
import { Button, DropDown, ValidationGroup } from '@motifx-community/ui';\r
import { cities } from './cities';\r
\r
/** A required drop-down checked in a group, and the read-only and disabled states. */\r
export default function Validation() {\r
  const s = reactive({ priority: 'normal' as string | null, result: '' });\r
  const group = new ValidationGroup();\r
\r
  const check = async () => {\r
    const result = await group.validate();\r
    s.result = result.valid ? 'Fine.' : 'Pick a priority.';\r
  };\r
\r
  return (\r
    <>\r
      <DropDown label="Priority" items={['low', 'normal', 'high']} required clearButton validationGroup={group} x-model={() => s.priority} />\r
      <DropDown label="Read-only" items={cities} value="Bursa" readOnly />\r
      <DropDown label="Disabled" items={cities} value="Bursa" enabled={false} />\r
      <Button text="Check" variant="outline" onclick={check} />\r
      <output class="dd-check">{() => s.result}</output>\r
    </>\r
  );\r
}\r
`,b=`/** The cities the drop-downs of the examples show. */\r
export const cities = ['Ankara', 'Antalya', 'Bursa', 'İstanbul', 'İzmir', 'Konya', 'Trabzon'];\r
`,x=[{code:`TR`,name:`Türkiye`,region:`Europe`,flag:`🇹🇷`,member:!0},{code:`DE`,name:`Germany`,region:`Europe`,flag:`🇩🇪`,member:!0},{code:`FR`,name:`France`,region:`Europe`,flag:`🇫🇷`,member:!0},{code:`NO`,name:`Norway`,region:`Europe`,flag:`🇳🇴`,member:!1},{code:`JP`,name:`Japan`,region:`Asia`,flag:`🇯🇵`,member:!0},{code:`KR`,name:`Korea`,region:`Asia`,flag:`🇰🇷`,member:!0},{code:`BR`,name:`Brazil`,region:`Americas`,flag:`🇧🇷`,member:!0},{code:`CA`,name:`Canada`,region:`Americas`,flag:`🇨🇦`,member:!0}],S=(e,t)=>{t.textContent=`${e.flag}  ${e.name}`};function C(){let e=n({country:`TR`});return c({initializeComponent:t=>{{let n=o(u,{label:`Country`,items:x,textField:`name`,valueField:`code`,groupField:`region`,enabledField:e=>e.member!==!1,itemTemplate:S,fieldTemplate:S,runover:{initializeComponent:t=>{t.bindings.model(()=>e.country,t=>{let n=e;n!=null&&typeof n.country!=`function`&&(n.country=t)})}},childs:[]});t.controls.add(n);let r=o(`output`,{initializeComponent:t=>{t.class.add(`dd-country`),t.bindings.method(()=>`code: ${e.country??`—`}`)}},1);t.controls.add(r)}}})}var w=[`Ankara`,`Antalya`,`Bursa`,`İstanbul`,`İzmir`,`Konya`,`Trabzon`];function T(){let e=n({city:`İzmir`,size:null,result:``}),t=0,i=null,a=()=>{let n=new u({label:`Size ${++t}`,items:[`S`,`M`,`L`],placeholder:`Pick one`});n.onValueChanged(t=>e.result=`${n.label}: ${t.value}`),i?.controls.add(n),n.focus()};return c({initializeComponent:t=>{{let n=o(d,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[o(u,{label:`&City`,items:w,runover:{initializeComponent:t=>{t.bindings.model(()=>e.city,t=>{let n=e;n!=null&&typeof n.city!=`function`&&(n.city=t)})}},childs:[]}),o(`output`,{initializeComponent:t=>{t.class.add(`dd-city`),t.bindings.method(()=>`city: ${e.city??`—`}`)}},1)]});t.controls.add(n);let s=o(u,{label:`Size`,items:[`S`,`M`,`L`,`XL`],placeholder:`Pick one`,clearButton:!0,runover:{initializeComponent:t=>{t.bindings.model(()=>e.size,t=>{let n=e;n!=null&&typeof n.size!=`function`&&(n.size=t)})}},childs:[]});t.controls.add(s);let c=o(d,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[o(r,{text:`Add a drop-down programmatically`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,a)}},childs:[]}),o(`output`,{initializeComponent:t=>{t.class.add(`dd-made`),t.bindings.method(()=>e.result)}},1)]});t.controls.add(c);let l=o(d,{orientation:`horizontal`,wrap:!0,align:`center`,ref:e=>i=e,runover:{},childs:[]});t.controls.add(l)}}})}function E(){let e=n({statuses:[`Draft`,`Review`],status:`Draft`}),t,i=()=>{e.statuses.push(`Published`),t.refresh()};return c({initializeComponent:n=>{{let a=o(u,{label:`Status`,items:()=>e.statuses,ref:e=>t=e,runover:{initializeComponent:t=>{t.bindings.model(()=>e.status,t=>{let n=e;n!=null&&typeof n.status!=`function`&&(n.status=t)})}},childs:[]});n.controls.add(a);let s=o(r,{text:`Add “Published”`,variant:`outline`,enabled:()=>!e.statuses.includes(`Published`),runover:{initializeComponent:e=>{e.motif.on(`click`,i)}},childs:[]});n.controls.add(s)}}})}function D(){let t=n({lang:`en`}),i=()=>{t.lang=t.lang===`en`?`tr`:`en`,e.use(t.lang)};return c({initializeComponent:e=>{{let n=o(r,{text:()=>t.lang===`en`?`Language: English`:`Dil: Türkçe`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,i)}},childs:[]});e.controls.add(n);let a=o(u,{label:`Empty`,items:[],placeholder:`Open me`,runover:{},childs:[]});e.controls.add(a)}}})}var O=Array.from({length:5e3},(e,t)=>({value:t+1,text:`Order #${String(t+1).padStart(5,`0`)}`}));function k(){let e=n({order:1200});return c({initializeComponent:t=>{{let n=o(u,{label:`Order`,items:O,searchEnabled:!0,runover:{initializeComponent:t=>{t.bindings.model(()=>e.order,t=>{let n=e;n!=null&&typeof n.order!=`function`&&(n.order=t)})}},childs:[]});t.controls.add(n);let r=o(`output`,{initializeComponent:t=>{t.class.add(`dd-order`),t.bindings.method(()=>`order: ${e.order??`—`}`)}},1);t.controls.add(r)}}})}function A(){let e=n({priority:`normal`,result:``}),t=new f,i=async()=>{let n=await t.validate();e.result=n.valid?`Fine.`:`Pick a priority.`};return c({initializeComponent:n=>{{let a=o(u,{label:`Priority`,items:[`low`,`normal`,`high`],required:!0,clearButton:!0,validationGroup:t,runover:{initializeComponent:t=>{t.bindings.model(()=>e.priority,t=>{let n=e;n!=null&&typeof n.priority!=`function`&&(n.priority=t)})}},childs:[]});n.controls.add(a);let s=o(u,{label:`Read-only`,items:w,value:`Bursa`,readOnly:!0,runover:{},childs:[]});n.controls.add(s);let c=o(u,{label:`Disabled`,items:w,value:`Bursa`,enabled:!1,runover:{},childs:[]});n.controls.add(c);let l=o(r,{text:`Check`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,i)}},childs:[]});n.controls.add(l);let d=o(`output`,{initializeComponent:t=>{t.class.add(`dd-check`),t.bindings.method(()=>e.result)}},1);n.controls.add(d)}}})}var j=p(Object.assign({"./examples/Countries.tsx":m,"./examples/LiveItems.tsx":h,"./examples/Localization.tsx":g,"./examples/LongList.tsx":_,"./examples/Programmatic.tsx":v,"./examples/Validation.tsx":y,"./examples/cities.ts":b})),M=[[`value`,"`Bind<V | null>`","`null`","The value of the selected item. `x-model` provides two-way binding."],[`items`,"`Bind<readonly T[]>`","`[]`","Plain values, `DropDownItem` objects (`{ value, text, icon?, group?, enabled? }`) or custom objects. A function is tracked, and items changed in place appear after `refresh()`."],[`dataSource`,"`Bind<DataSource<T> | null>`","`null`","Items from the data layer, loaded as the list scrolls and searched using its `searchFields`. This takes precedence over `items`. A value that is not on a loaded page is requested by key, and the field waits in the meantime (see Lookup)."],[`valueText`,"`Bind<string>`","`''`","The display text for the value while its item is requested from `dataSource`, shown immediately instead of waiting. Use it when a record already has the name: `valueText={() => order.customerName}`."],[`searchDelay`,"`Bind<number>`","`250` with a data source, otherwise `0`",`The delay, in milliseconds, between the last keystroke in the search box and the search.`],[`textField / valueField`,"`Bind<ItemField<T>>`","`'text'` / `'value'`","A property name or a function `(item) => …`. Without `valueField`, an object with a `value` property uses that value, and anything else is its own value."],[`iconField, groupField, enabledField`,"`Bind<ItemField<T>>`",`—`,"An icon for each option. Options in the same group appear together under its name. `enabled` marks options that cannot be selected."],[`placeholder`,"`Bind<string>`","`''`",`Displayed when no item is selected.`],[`searchEnabled`,"`Bind<boolean>`","`false`",`Adds a search box at the top of the list.`],[`searchMode`,"`Bind<'contains' | 'startswith'>`","`'contains'`",`How the search matches option text.`],[`clearButton`,"`Bind<boolean>`","`false`",`Shows a button that clears the value. Escape does the same while the list is closed.`],[`itemTemplate / fieldTemplate`,"`Bind<(item, host) => cleanup | void>`",`—`,`Customizes how an option or the selected item is drawn.`],[`matchWidth`,"`Bind<boolean>`","`true`",`The list is at least as wide as the field.`],[`label, labelMode, helpText, hint, prefix, icon, buttons, readOnly, required, size, variant, stretch, rules, error, validateOn, validationGroup`,`see TextBox`,``,`Field props shared by all editors.`]],N=[[`every prop above`,`read/write, reactive`,`Accepts a value or a function, the same as the prop.`],[`selectedItem`,`read-only, reactive`,"The item whose value matches `value`."],[`opened`,`read/write, reactive`,`Indicates whether the list is open. Set it to open or close the list.`],[`isValid, validationMessage`,`read-only, reactive`,`See TextBox.`]],P=[[`open(search?)`,"`boolean`","Opens the list, and `search` starts the search box with that text. Returns `false` when the control is disabled, read-only or waiting for the item of its value."],[`close()`,"`void`",`Closes the list and returns focus to the field.`],[`clear()`,"`void`",`Clears the value.`],[`refresh()`,"`void`","Your items can be plain or reactive, and the drop-down reads them as they are. After changing them in place, call `refresh()`. The field text and the open list update."],[`validate(), resetValidation(), focus()`,``,`See TextBox.`]],F=[[`onValueChanged(e)`,"`{ value, previousValue, byUser, source, event? }`"],[`onOpened()`,`Occurs when the list opens.`],[`onClosed(reason)`,"Occurs when the list closes. The reason is `'escape'`, `'outside'`, `'focus'` or `'code'` (also after a selection)."],[`onValidated(e)`,`See TextBox.`]],I=[[`Down, Up, Enter, Space, Alt + Down`,`Opens the list on the selected option (Home and End open it on the first and last option).`],[`A letter`,`Opens the list on the next option that starts with that letter. Letters typed quickly are combined into one search.`],[`In the list: Up, Down, Home, End, Page Up, Page Down`,`Moves the highlight and skips options that cannot be selected.`],[`In the list: Enter, Space, Alt + Up`,`Selects the highlighted option and closes the list.`],[`In the list: Tab`,`Selects the highlighted option and moves to the next field.`],[`Escape`,"Closes the list without selecting. With `clearButton` and the list closed, clears the value."],["Alt + key (`&City`)",`Moves focus to the field.`]],L=[[`Pattern`,'The APG select-only combobox. The field has `role="combobox"` with `aria-haspopup="listbox"`, `aria-expanded` and `aria-controls`, and focus stays on it.'],[`Highlight`,'`aria-activedescendant` identifies the highlighted option. Options have `role="option"` with `aria-selected`, and disabled options have `aria-disabled`.'],[`Groups`,'Each group has `role="group"` and is labeled by its header.'],[`Long lists`,"Only visible rows are rendered, and each option reports its position with `aria-posinset` and `aria-setsize`."],[`Search`,`The search box controls the list and identifies the highlighted option the same way.`],[`Waiting`,'While the item for the value is being requested, the combobox has `aria-busy` and its text announces "Loading…". A key the data source does not have shows the reason in its title.']],R=[[`.mx-drop-down`,"Added to the field. `data-open` while the list is open and `data-loading` while the item for the value is requested, plus the TextBox field attributes."],[`.mx-drop-down__display, .mx-drop-down__text, .mx-drop-down__chevron`,"The combobox, the selected text (`data-placeholder` when empty, `data-missing` for a key the data source does not have), and the arrow."],[`.mx-drop-down__spinner`,`The spinner that replaces the arrow while the item for the value is requested.`],[`.mx-drop-down__popup, .mx-drop-down__search`,`The popup and its search box.`],[`.mx-list, .mx-list__item, .mx-list__header`,"The shared list, its options (`data-active`, `data-selected`) and group headers."]],z=[[`field.*`,`The field, as in TextBox.`],[`drop-down.value, drop-down.chevron, drop-down.spinner, drop-down.spinner-shape`,"Units: the selected text (`placeholder`, `missing`, `disabled`), the arrow (`open`, `disabled`), the loading ring and the shape a design language can draw instead (with the spinner's shapes and timing)."],[`list.item-height, list.item`,"The options: row height and the item unit in each state (`hover`, `pressed`, `active`, `selected`, `selected-hover`, `selected-pressed`, `disabled`, `next`, `select-all`)."],[`list.indicator, list.check, list.mark, list.icon, list.text`,"Units: the bar on the selected option (`multiple`), the check box and mark in a multi-select list, an icon and the text."],[`list.container, list.group, list.header, list.select-all-divider, list.empty`,`Units: the list (spacing and maximum height), a group, group headers, the separator below "Select all", and the empty text.`]];function B(){return c({initializeComponent:e=>{{let n=o(`p`,{initializeComponent:e=>{e.class.add(`lead`);let t=o(s,{text:`Selects one item from a list. The field shows the selected item, and the list opens below it on click or from the keyboard. The list can be searched, grouped and customized, and it stays fast with thousands of items.`,runover:{},childs:[]});e.controls.add(t)}},1);e.controls.add(n);let r=o(i,{anchor:`import`,title:`Import`,runover:{},childs:[o(t,{code:`
import { DropDown, type DropDownItem } from '@motifx-community/ui';
`,runover:{},childs:[]})]});e.controls.add(r);let c=o(i,{anchor:`ways`,title:`Declarative and programmatic`,runover:{},childs:[o(`p`,{initializeComponent:e=>{let t=o(s,{text:"`items` can be plain values, and `x-model` binds the selected value. When you create the component with `new`, set the same properties programmatically.",runover:{},childs:[]});e.controls.add(t)}},1),o(a,{files:j(`Programmatic.tsx`,`cities.ts`),stack:!0,runover:{},childs:[o(T,{runover:{},childs:[]})]})]});e.controls.add(c);let u=o(i,{anchor:`objects`,title:`Objects, groups, templates`,runover:{},childs:[o(`p`,{initializeComponent:e=>{let t=o(s,{text:"Custom objects are read through `textField` and `valueField`, each a property name or a function. `groupField` places options under headers, `enabledField` disables specific options, and a template customizes how an option is drawn.",runover:{},childs:[]});e.controls.add(t)}},1),o(a,{files:j(`Countries.tsx`),runover:{},childs:[o(C,{runover:{},childs:[]})]})]});e.controls.add(u);let d=o(i,{anchor:`search`,title:`Search and long lists`,runover:{},childs:[o(`p`,{initializeComponent:e=>{let t=o(s,{text:"`searchEnabled` adds a search box at the top of the list. A long list renders only the visible rows. This example has 5,000 orders.",runover:{},childs:[]});e.controls.add(t)}},1),o(a,{files:j(`LongList.tsx`),runover:{},childs:[o(k,{runover:{},childs:[]})]})]});e.controls.add(d);let f=o(i,{anchor:`live`,title:`Dynamic items`,runover:{},childs:[o(`p`,{initializeComponent:e=>{let t=o(s,{text:"When `items` is a function, it is tracked and a new list appears immediately. Your items can be plain or reactive, and the drop-down reads them as they are. After changing them in place, call `refresh()` to update the open list and the field.",runover:{},childs:[]});e.controls.add(t)}},1),o(a,{files:j(`LiveItems.tsx`),runover:{},childs:[o(E,{runover:{},childs:[]})]})]});e.controls.add(f);let p=o(i,{anchor:`validation`,title:`Validation and states`,runover:{},childs:[o(a,{files:j(`Validation.tsx`,`cities.ts`),runover:{},childs:[o(A,{runover:{},childs:[]})]})]});e.controls.add(p);let m=o(i,{anchor:`keyboard`,title:`Keyboard`,runover:{},childs:[o(l,{head:[`Key`,`Description`],rows:I,runover:{},childs:[]})]});e.controls.add(m);let h=o(i,{anchor:`a11y`,title:`Accessibility`,runover:{},childs:[o(l,{head:[`Topic`,`Details`],rows:L,runover:{},childs:[]})]});e.controls.add(h);let g=o(i,{anchor:`i18n`,title:`Localization`,runover:{},childs:[o(`p`,{initializeComponent:e=>{let t=o(s,{text:"The search box, clear button, empty list text, loading text (`loading`) and missing key reasons (`notInList`, `loadFailed`) come from `uiLocale.strings`.",runover:{},childs:[]});e.controls.add(t)}},1),o(a,{files:j(`Localization.tsx`),runover:{},childs:[o(D,{runover:{},childs:[]})]})]});e.controls.add(g);let _=o(i,{anchor:`styling`,title:`Styling`,runover:{},childs:[o(l,{head:[`Hook`,`Description`],rows:R,runover:{},childs:[]}),o(`h3`,{initializeComponent:e=>{let t=o(s,{text:`Component tokens`,runover:{},childs:[]});e.controls.add(t)}},1),o(l,{head:[`Token`,`Description`],rows:z,runover:{},childs:[]})]});e.controls.add(_);let v=o(i,{anchor:`api`,title:`API reference`,runover:{},childs:[o(`h3`,{initializeComponent:e=>{let t=o(s,{text:`Props`,runover:{},childs:[]});e.controls.add(t)}},1),o(l,{head:[`Prop`,`Type`,`Default`,`Description`],rows:M,runover:{},childs:[]}),o(`p`,{initializeComponent:e=>{let t=o(s,{text:"A prop that accepts a function as its value (`textField`, a template) uses the function as is when it has parameters. A function without parameters is treated as a getter, as with every other prop.",runover:{},childs:[]});e.controls.add(t)}},1),o(`h3`,{initializeComponent:e=>{let t=o(s,{text:`Properties`,runover:{},childs:[]});e.controls.add(t)}},1),o(l,{head:[`Property`,`Access`,`Description`],rows:N,runover:{},childs:[]}),o(`h3`,{initializeComponent:e=>{let t=o(s,{text:`Methods`,runover:{},childs:[]});e.controls.add(t)}},1),o(l,{head:[`Method`,`Returns`,`Description`],rows:P,runover:{},childs:[]}),o(`h3`,{initializeComponent:e=>{let t=o(s,{text:`Events`,runover:{},childs:[]});e.controls.add(t)}},1),o(l,{head:[`Event`,`When`],rows:F,runover:{},childs:[]}),o(`p`,{initializeComponent:e=>{let t=o(s,{text:"The list is a shared part, `OptionList`, exported for use in combo boxes, list boxes and your own controls.",runover:{},childs:[]});e.controls.add(t)}},1)]});e.controls.add(v)}}})}export{B as default};