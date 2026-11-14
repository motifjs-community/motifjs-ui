import{Qn as e,Zn as t,er as n,n as r}from"./next-id-CtzpBrBT.js";import{i}from"./item-own-value-BI1Pj7jY.js";import{t as a}from"./ComboBox-QWx-NTD_.js";import{t as o}from"./Stack-wRt1e9tO.js";import{a as s,i as c,n as l,r as u,t as d}from"./docs-B_LZlyP5.js";import{t as f}from"./sources-BXVvOiIY.js";import{t as p}from"./slow-adapter-file-BJ0xGM0X.js";import{t as m}from"./slow-adapter-CFBLJVRT.js";var h=class extends a{constructor(e){super(e),this.class.add(`mx-autocomplete`);let t=this.props??{};t.acceptCustomValue===void 0&&(this.acceptCustomValue=!0),t.showDropDownButton===void 0&&(this.showDropDownButton=!1)}emptyValue(){return``}itemValue(e){return this.itemText(e)}customValue(e){return e}textOfValue(e){return e??``}},g=`import { reactive } from '@motifx/core';\r
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
`,b=[`Adana`,`Ankara`,`Antalya`,`Bursa`,`Diyarbakır`,`Erzurum`,`Eskişehir`,`Gaziantep`,`İstanbul`,`İzmir`,`Kayseri`,`Konya`,`Mersin`,`Samsun`,`Trabzon`];function x(){let r=n({tag:``,query:``});return e({initializeComponent:e=>{{let n=t(a,{label:`Tag`,items:[`bug`,`feature`,`docs`],acceptCustomValue:!0,runover:{initializeComponent:e=>{e.bindings.model(()=>r.tag,e=>{let t=r;t!=null&&typeof t.tag!=`function`&&(t.tag=e)})}},childs:[]});e.controls.add(n);let i=t(h,{label:`Search`,items:b,runover:{initializeComponent:e=>{e.bindings.model(()=>r.query,e=>{let t=r;t!=null&&typeof t.query!=`function`&&(t.query=e)})}},childs:[]});e.controls.add(i);let o=t(`output`,{initializeComponent:e=>{e.class.add(`cb-query`),e.bindings.method(()=>`query: "${r.query}"`)}},1);e.controls.add(o)}}})}function S(){let i=n({city:`İzmir`,result:``}),s=0,c=null,l=()=>{let e=new a({label:`Town ${++s}`,items:b,minSearchLength:2});e.onValueChanged(t=>i.result=`${e.label}: ${t.value??`—`}`),c?.controls.add(e),e.focus()};return e({initializeComponent:e=>{{let n=t(a,{label:`&City`,items:b,clearButton:!0,runover:{initializeComponent:e=>{e.bindings.model(()=>i.city,e=>{let t=i;t!=null&&typeof t.city!=`function`&&(t.city=e)})}},childs:[]});e.controls.add(n);let s=t(`output`,{initializeComponent:e=>{e.class.add(`cb-city`),e.bindings.method(()=>`city: ${i.city??`—`}`)}},1);e.controls.add(s);let u=t(r,{text:`Add a combo box programmatically`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,l)}},childs:[]});e.controls.add(u);let d=t(`output`,{initializeComponent:e=>{e.class.add(`cb-made`),e.bindings.method(()=>i.result)}},1);e.controls.add(d);let f=t(o,{orientation:`horizontal`,wrap:!0,align:`center`,ref:e=>c=e,runover:{},childs:[]});e.controls.add(f)}}})}var C=[`Beverages`,`Condiments`,`Dairy`,`Grains`,`Produce`,`Seafood`],w=Array.from({length:1e4},(e,t)=>({id:t+1,name:`${C[t%6]} item ${t+1}`,category:C[t%6]}));function T(){let r=n({product:2500}),o=new i.DataSource({adapter:new m({data:w,key:`id`},300),loadMode:`blocks`,pageSize:50,searchFields:[`name`]});return e({initializeComponent:e=>{{let n=t(a,{label:`Product`,dataSource:o,textField:`name`,valueField:`id`,stretch:!0,runover:{initializeComponent:e=>{e.bindings.model(()=>r.product,e=>{let t=r;t!=null&&typeof t.product!=`function`&&(t.product=e)})}},childs:[]});e.controls.add(n);let i=t(`output`,{initializeComponent:e=>{e.class.add(`cb-product`),e.bindings.method(()=>`product: ${r.product??`—`}`)}},1);e.controls.add(i)}}})}var E=f(Object.assign({"./examples/CustomValues.tsx":g,"./examples/Products.tsx":_,"./examples/Programmatic.tsx":v,"./examples/cities.ts":y})),D=[[`value`,"`Bind<V | null>`","`null`","The value of the selected item. `x-model` binds it."],[`items / dataSource`,"`Bind<readonly T[]>` / `Bind<DataSource | null>`",`—`,"An in-memory array, searched on the client, or a `@motifx-community/data` data source, searched on the server."],[`textField, valueField, iconField, groupField, enabledField`,"`Bind<ItemField<T>>`",`—`,`Same as DropDown. Groups apply to in-memory items.`],[`searchMode`,"`Bind<'contains' | 'startswith'>`","`'contains'`",`How in-memory items are matched.`],[`minSearchLength`,"`Bind<number>`","`0`",`The number of characters to type before the list opens.`],[`searchDelay`,"`Bind<number>`","`0` / `250`",`The delay, in milliseconds, between the last keystroke and the search (in memory / with a data source).`],[`acceptCustomValue`,"`Bind<boolean>`","`false`",`Text that matches no item becomes the value. Otherwise, the field reverts to the selected item.`],[`autoHighlight`,"`Bind<boolean>`","`true`",`Highlights the first match, so Enter accepts it.`],[`showDropDownButton, clearButton`,"`Bind<boolean>`","`true`, `false`",`The arrow that opens all items, and the button that clears the value.`],[`itemTemplate, matchWidth, placeholder`,``,``,`Same as DropDown.`]],O=[[`Typing`,`Searches and opens the list, highlighting the first match.`],[`Down / Up, Alt + Down`,`Opens the list with all items, or moves the highlight within it.`],[`Enter`,"Accepts the highlighted item, or the text (see `acceptCustomValue`), and closes the list."],[`Tab, leaving`,`If an item's text matches the input, it is selected. Otherwise, the custom value is used or the selected item is restored.`],[`Escape`,"Closes the list. When closed, it reverts the typing, and then clears the value with `clearButton`."]];function k(){return e({initializeComponent:e=>{{let n=t(`p`,{initializeComponent:e=>{e.class.add(`lead`);let n=t(u,{text:"A text input with a list that filters as the user types. Items can come from memory or from a data layer source that is searched on the server. `Autocomplete` is the free-text variant, where the value is the text itself.",runover:{},childs:[]});e.controls.add(n)}},1);e.controls.add(n);let r=t(c,{anchor:`import`,title:`Import`,runover:{},childs:[t(s,{code:`
import { ComboBox, Autocomplete } from '@motifx-community/ui';
import { data } from '@motifx-community/data';
`,runover:{},childs:[]})]});e.controls.add(r);let i=t(c,{anchor:`ways`,title:`Declarative and programmatic`,runover:{},childs:[t(l,{files:E(`Programmatic.tsx`,`cities.ts`),runover:{},childs:[t(S,{runover:{},childs:[]})]})]});e.controls.add(i);let a=t(c,{anchor:`data`,title:`From a data source`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(u,{text:"With `dataSource`, the search goes to the data source (using its `searchFields`) after `searchDelay`. In `'blocks'` mode, only the visible rows load, and a value that is not on a loaded page is looked up by key so the field can show its text immediately. This example has 10,000 products and responds after 300 ms.",runover:{},childs:[]});e.controls.add(n)}},1),t(l,{files:[...E(`Products.tsx`),p],runover:{},childs:[t(T,{runover:{},childs:[]})]})]});e.controls.add(a);let o=t(c,{anchor:`custom`,title:`Custom values and Autocomplete`,runover:{},childs:[t(l,{files:E(`CustomValues.tsx`,`cities.ts`),runover:{},childs:[t(x,{runover:{},childs:[]})]})]});e.controls.add(o);let f=t(c,{anchor:`keyboard`,title:`Keyboard`,runover:{},childs:[t(d,{head:[`Key`,`Description`],rows:O,runover:{},childs:[]})]});e.controls.add(f);let m=t(c,{anchor:`a11y`,title:`Accessibility`,runover:{},childs:[t(d,{head:[`Topic`,`Details`],rows:[[`Pattern`,'The APG combobox with list autocomplete. The input has `role="combobox"`, `aria-autocomplete="list"`, `aria-expanded` and `aria-controls`.'],[`Highlight`,"`aria-activedescendant` identifies the highlighted option while focus stays in the input."],[`Loading`,'Rows not loaded yet are options with `aria-busy`, which announce "Loading…" from `uiLocale`.']],runover:{},childs:[]})]});e.controls.add(m);let h=t(c,{anchor:`api`,title:`API reference`,runover:{},childs:[t(`h3`,{initializeComponent:e=>{let n=t(u,{text:`Props`,runover:{},childs:[]});e.controls.add(n)}},1),t(d,{head:[`Prop`,`Type`,`Default`,`Description`],rows:D,runover:{},childs:[]}),t(`h3`,{initializeComponent:e=>{let n=t(u,{text:`Properties, methods, events`,runover:{},childs:[]});e.controls.add(n)}},1),t(d,{head:[`Member`,`Description`],rows:[[`selectedItem`,`The item for the current value, when known.`],[`listItems`,"The `DataItems` shown in the list, which are the results of the last search."],[`opened, open(), close(), clear()`,`The list and the value.`],[`refresh()`,"Your items can be plain or reactive, and the box reads them as they are. After changing them in place, call `refresh()`. The open list and the value text update. Autocomplete has the same method."],[`onValueChanged, onOpened, onClosed, onValidated`,`Same as DropDown.`]],runover:{},childs:[]}),t(`p`,{initializeComponent:e=>{let n=t(u,{text:"The items logic is a shared part: `DataItems` supplies any list control from an array or a data source.",runover:{},childs:[]});e.controls.add(n)}},1)]});e.controls.add(h)}}})}export{k as default};