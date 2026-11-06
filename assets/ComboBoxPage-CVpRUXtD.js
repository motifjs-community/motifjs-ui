import{a as e,an as t,h as n,i as r,n as i,nn as a,r as o,rn as s,t as c}from"./doc-B1CtlCkV.js";import{i as l}from"./item-own-value-yYXkkdgf.js";import{t as u}from"./Stack-AS0iyAxC.js";import{t as d}from"./ComboBox-CjSADkBH.js";import{t as f}from"./sources-BXVvOiIY.js";import{t as p}from"./slow-adapter-file-BJ0xGM0X.js";import{t as m}from"./slow-adapter-Qu7CbQ8l.js";var h=class extends d{constructor(e){super(e),this.element.classList.add(`mx-autocomplete`);let t=this.props??{};t.acceptCustomValue===void 0&&(this.acceptCustomValue=!0),t.showDropDownButton===void 0&&(this.showDropDownButton=!1)}emptyValue(){return``}itemValue(e){return this.itemText(e)}customValue(e){return e}textOfValue(e){return e??``}},g=`import { reactive } from '@motifx/core';\r
import { Autocomplete, ComboBox } from '@motifx-community/ui';\r
import { cities } from './cities';\r
\r
/** A combo box that takes text matching no item, and an Autocomplete whose value is the text itself. */\r
export default function CustomValues() {\r
  const form = reactive({ tag: '', query: '' });\r
  return (\r
    <>\r
      <ComboBox label="Tag" items={['bug', 'feature', 'docs']} acceptCustomValue x-model={() => form.tag} />\r
      <Autocomplete label="Search" items={cities} x-model={() => form.query} />\r
      <output class="cb-query">{() => \`query: "\${form.query}"\`}</output>\r
    </>\r
  );\r
}\r
`,_=`import { reactive } from '@motifx/core';\r
import { data } from '@motifx-community/data';\r
import { ComboBox } from '@motifx-community/ui';\r
import { SlowAdapter } from '../../../shared/slow-adapter';\r
\r
interface Product {\r
  id: number;\r
  name: string;\r
  category: string;\r
}\r
\r
const categories = ['Beverages', 'Condiments', 'Dairy', 'Grains', 'Produce', 'Seafood'];\r
const rows: Product[] = Array.from({ length: 10000 }, (_, i) => ({ id: i + 1, name: \`\${categories[i % 6]} item \${i + 1}\`, category: categories[i % 6] }));\r
\r
/** 10,000 products on a server that responds after 300 ms. The search goes to the data source, and the value's text is looked up by key. */\r
export default function Products() {\r
  const line = reactive({ product: 2500 as number | null });\r
  const products = new data.DataSource<Product, number>({\r
    adapter: new SlowAdapter<Product, number>({ data: rows, key: 'id' }, 300),\r
    loadMode: 'blocks',\r
    pageSize: 50,\r
    searchFields: ['name'],\r
  });\r
\r
  return (\r
    <>\r
      <ComboBox label="Product" dataSource={products} textField="name" valueField="id" x-model={() => line.product} stretch />\r
      <output class="cb-product">{() => \`product: \${line.product ?? '—'}\`}</output>\r
    </>\r
  );\r
}\r
`,v=`import { reactive } from '@motifx/core';\r
import { Button, ComboBox, Stack } from '@motifx-community/ui';\r
import { cities } from './cities';\r
\r
/** A combo box bound with x-model, and combo boxes created with \`new\` and added programmatically. */\r
export default function Programmatic() {\r
  const form = reactive({ city: 'İzmir' as string | null, result: '' });\r
  let added = 0;\r
  let host: Stack | null = null;\r
\r
  const addProgrammatic = () => {\r
    const town = new ComboBox<string, string>({ label: \`Town \${++added}\`, items: cities, minSearchLength: 2 });\r
    town.onValueChanged((e) => (form.result = \`\${town.label}: \${e.value ?? '—'}\`));\r
    host?.controls.add(town);\r
    town.focus();\r
  };\r
\r
  return (\r
    <>\r
      <ComboBox label="&City" items={cities} x-model={() => form.city} clearButton />\r
      <output class="cb-city">{() => \`city: \${form.city ?? '—'}\`}</output>\r
      <Button text="Add a combo box programmatically" variant="outline" onclick={addProgrammatic} />\r
      <output class="cb-made">{() => form.result}</output>\r
      <Stack orientation="horizontal" wrap align="center" ref={(c: Stack) => (host = c)} />\r
    </>\r
  );\r
}\r
`,y=`/** The cities the combo boxes of the examples suggest. */\r
export const cities = ['Adana', 'Ankara', 'Antalya', 'Bursa', 'Diyarbakır', 'Erzurum', 'Eskişehir', 'Gaziantep', 'İstanbul', 'İzmir', 'Kayseri', 'Konya', 'Mersin', 'Samsun', 'Trabzon'];\r
`,b=[`Adana`,`Ankara`,`Antalya`,`Bursa`,`Diyarbakır`,`Erzurum`,`Eskişehir`,`Gaziantep`,`İstanbul`,`İzmir`,`Kayseri`,`Konya`,`Mersin`,`Samsun`,`Trabzon`];function x(){let e=t({tag:``,query:``});return s({initializeComponent:t=>{{let n=a(d,{label:`Tag`,items:[`bug`,`feature`,`docs`],acceptCustomValue:!0,runover:{initializeComponent:t=>{t.bindings.model(()=>e.tag,t=>{let n=e;n!=null&&typeof n.tag!=`function`&&(n.tag=t)})}},childs:[]});t.controls.add(n);let r=a(h,{label:`Search`,items:b,runover:{initializeComponent:t=>{t.bindings.model(()=>e.query,t=>{let n=e;n!=null&&typeof n.query!=`function`&&(n.query=t)})}},childs:[]});t.controls.add(r);let i=a(`output`,{initializeComponent:t=>{t.class.add(`cb-query`),t.bindings.method(()=>`query: "${e.query}"`)}},1);t.controls.add(i)}}})}function S(){let e=t({city:`İzmir`,result:``}),r=0,i=null,o=()=>{let t=new d({label:`Town ${++r}`,items:b,minSearchLength:2});t.onValueChanged(n=>e.result=`${t.label}: ${n.value??`—`}`),i?.controls.add(t),t.focus()};return s({initializeComponent:t=>{{let r=a(d,{label:`&City`,items:b,clearButton:!0,runover:{initializeComponent:t=>{t.bindings.model(()=>e.city,t=>{let n=e;n!=null&&typeof n.city!=`function`&&(n.city=t)})}},childs:[]});t.controls.add(r);let s=a(`output`,{initializeComponent:t=>{t.class.add(`cb-city`),t.bindings.method(()=>`city: ${e.city??`—`}`)}},1);t.controls.add(s);let c=a(n,{text:`Add a combo box programmatically`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,o)}},childs:[]});t.controls.add(c);let l=a(`output`,{initializeComponent:t=>{t.class.add(`cb-made`),t.bindings.method(()=>e.result)}},1);t.controls.add(l);let f=a(u,{orientation:`horizontal`,wrap:!0,align:`center`,ref:e=>i=e,runover:{},childs:[]});t.controls.add(f)}}})}var C=[`Beverages`,`Condiments`,`Dairy`,`Grains`,`Produce`,`Seafood`],w=Array.from({length:1e4},(e,t)=>({id:t+1,name:`${C[t%6]} item ${t+1}`,category:C[t%6]}));function T(){let e=t({product:2500}),n=new l.DataSource({adapter:new m({data:w,key:`id`},300),loadMode:`blocks`,pageSize:50,searchFields:[`name`]});return s({initializeComponent:t=>{{let r=a(d,{label:`Product`,dataSource:n,textField:`name`,valueField:`id`,stretch:!0,runover:{initializeComponent:t=>{t.bindings.model(()=>e.product,t=>{let n=e;n!=null&&typeof n.product!=`function`&&(n.product=t)})}},childs:[]});t.controls.add(r);let i=a(`output`,{initializeComponent:t=>{t.class.add(`cb-product`),t.bindings.method(()=>`product: ${e.product??`—`}`)}},1);t.controls.add(i)}}})}var E=f(Object.assign({"./examples/CustomValues.tsx":g,"./examples/Products.tsx":_,"./examples/Programmatic.tsx":v,"./examples/cities.ts":y})),D=[[`value`,"`Bind<V | null>`","`null`","The value of the selected item. `x-model` binds it."],[`items / dataSource`,"`Bind<readonly T[]>` / `Bind<DataSource | null>`",`—`,"An in-memory array, searched on the client, or a `@motifx-community/data` data source, searched on the server."],[`textField, valueField, iconField, groupField, enabledField`,"`Bind<ItemField<T>>`",`—`,`Same as DropDown. Groups apply to in-memory items.`],[`searchMode`,"`Bind<'contains' | 'startswith'>`","`'contains'`",`How in-memory items are matched.`],[`minSearchLength`,"`Bind<number>`","`0`",`The number of characters to type before the list opens.`],[`searchDelay`,"`Bind<number>`","`0` / `250`",`The delay, in milliseconds, between the last keystroke and the search (in memory / with a data source).`],[`acceptCustomValue`,"`Bind<boolean>`","`false`",`Text that matches no item becomes the value. Otherwise, the field reverts to the selected item.`],[`autoHighlight`,"`Bind<boolean>`","`true`",`Highlights the first match, so Enter accepts it.`],[`showDropDownButton, clearButton`,"`Bind<boolean>`","`true`, `false`",`The arrow that opens all items, and the button that clears the value.`],[`itemTemplate, matchWidth, placeholder`,``,``,`Same as DropDown.`]],O=[[`Typing`,`Searches and opens the list, highlighting the first match.`],[`Down / Up, Alt + Down`,`Opens the list with all items, or moves the highlight within it.`],[`Enter`,"Accepts the highlighted item, or the text (see `acceptCustomValue`), and closes the list."],[`Tab, leaving`,`If an item's text matches the input, it is selected. Otherwise, the custom value is used or the selected item is restored.`],[`Escape`,"Closes the list. When closed, it reverts the typing, and then clears the value with `clearButton`."]];function k(){return s({initializeComponent:t=>{{let n=a(`p`,{initializeComponent:e=>{e.class.add(`lead`);let t=a(o,{text:"A text input with a list that filters as the user types. Items can come from memory or from a data layer source that is searched on the server. `Autocomplete` is the free-text variant, where the value is the text itself.",runover:{},childs:[]});e.controls.add(t)}},1);t.controls.add(n);let s=a(r,{anchor:`import`,title:`Import`,runover:{},childs:[a(e,{code:`
import { ComboBox, Autocomplete } from '@motifx-community/ui';
import { data } from '@motifx-community/data';
`,runover:{},childs:[]})]});t.controls.add(s);let l=a(r,{anchor:`ways`,title:`Declarative and programmatic`,runover:{},childs:[a(i,{files:E(`Programmatic.tsx`,`cities.ts`),runover:{},childs:[a(S,{runover:{},childs:[]})]})]});t.controls.add(l);let u=a(r,{anchor:`data`,title:`From a data source`,runover:{},childs:[a(`p`,{initializeComponent:e=>{let t=a(o,{text:"With `dataSource`, the search goes to the data source (using its `searchFields`) after `searchDelay`. In `'blocks'` mode, only the visible rows load, and a value that is not on a loaded page is looked up by key so the field can show its text immediately. This example has 10,000 products and responds after 300 ms.",runover:{},childs:[]});e.controls.add(t)}},1),a(i,{files:[...E(`Products.tsx`),p],runover:{},childs:[a(T,{runover:{},childs:[]})]})]});t.controls.add(u);let d=a(r,{anchor:`custom`,title:`Custom values and Autocomplete`,runover:{},childs:[a(i,{files:E(`CustomValues.tsx`,`cities.ts`),runover:{},childs:[a(x,{runover:{},childs:[]})]})]});t.controls.add(d);let f=a(r,{anchor:`keyboard`,title:`Keyboard`,runover:{},childs:[a(c,{head:[`Key`,`Description`],rows:O,runover:{},childs:[]})]});t.controls.add(f);let m=a(r,{anchor:`a11y`,title:`Accessibility`,runover:{},childs:[a(c,{head:[`Topic`,`Details`],rows:[[`Pattern`,'The APG combobox with list autocomplete. The input has `role="combobox"`, `aria-autocomplete="list"`, `aria-expanded` and `aria-controls`.'],[`Highlight`,"`aria-activedescendant` identifies the highlighted option while focus stays in the input."],[`Loading`,'Rows not loaded yet are options with `aria-busy`, which announce "Loading…" from `uiLocale`.']],runover:{},childs:[]})]});t.controls.add(m);let h=a(r,{anchor:`api`,title:`API reference`,runover:{},childs:[a(`h3`,{initializeComponent:e=>{let t=a(o,{text:`Props`,runover:{},childs:[]});e.controls.add(t)}},1),a(c,{head:[`Prop`,`Type`,`Default`,`Description`],rows:D,runover:{},childs:[]}),a(`h3`,{initializeComponent:e=>{let t=a(o,{text:`Properties, methods, events`,runover:{},childs:[]});e.controls.add(t)}},1),a(c,{head:[`Member`,`Description`],rows:[[`selectedItem`,`The item for the current value, when known.`],[`listItems`,"The `DataItems` shown in the list, which are the results of the last search."],[`opened, open(), close(), clear()`,`The list and the value.`],[`refresh()`,"Your items can be plain or reactive, and the box reads them as they are. After changing them in place, call `refresh()`. The open list and the value text update. Autocomplete has the same method."],[`onValueChanged, onOpened, onClosed, onValidated`,`Same as DropDown.`]],runover:{},childs:[]}),a(`p`,{initializeComponent:e=>{let t=a(o,{text:"The items logic is a shared part: `DataItems` supplies any list control from an array or a data source.",runover:{},childs:[]});e.controls.add(t)}},1)]});t.controls.add(h)}}})}export{k as default};