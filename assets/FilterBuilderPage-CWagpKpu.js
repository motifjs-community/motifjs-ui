import{F as e,Qn as t,Zn as n,er as r,n as i}from"./next-id-CtzpBrBT.js";import{t as a}from"./NumberBox-8iuCS9_o.js";import{t as o}from"./Switch-CESerSF7.js";import{t as s}from"./RadioGroup-DbpJGVz-.js";import{i as c}from"./item-own-value-BI1Pj7jY.js";import{n as l,t as u}from"./filter-text-DE0-ONXB.js";import{t as d}from"./Stack-wRt1e9tO.js";import{a as f,i as p,n as m,r as h,t as g}from"./docs-B_LZlyP5.js";import{t as _}from"./sources-BXVvOiIY.js";var v=`import { reactive } from '@motifx/core';\r
import { data } from '@motifx-community/data';\r
import { FilterBuilder, filterText } from '@motifx-community/ui';\r
import { saleFields, sales } from './sales';\r
\r
/** The value is the data layer's filter, bound both ways; here it filters sales in memory. */\r
export default function Basic() {\r
  const s = reactive({\r
    filter: data.and(data.where('city', 'in', ['Ankara', 'İzmir']), data.or(data.where('amount', '>', 500), data.where('paid', '=', false))) as data.FilterExpression | null,\r
  });\r
  const matches = () => sales.filter(data.createRowFilter(s.filter, { fields: { date: 'date' } })).length;\r
  return (\r
    <>\r
      <FilterBuilder class="fb-basic" label="Sales filter" fields={saleFields} locale="en" x-model={() => s.filter} />\r
      <output class="fb-basic-text">{() => filterText(s.filter, { fields: saleFields, locale: 'en' }) || 'No filter'}</output>\r
      <output class="fb-basic-count">{() => \`\${matches()} of \${sales.length} sales\`}</output>\r
      <pre class="fb-basic-value">{() => JSON.stringify(s.filter, null, 2)}</pre>\r
    </>\r
  );\r
}\r
`,y=`import { reactive } from '@motifx/core';\r
import { data } from '@motifx-community/data';\r
import { FilterBuilder, NumberBox, filterText, type FilterBuilderCustomOperation } from '@motifx-community/ui';\r
import { saleFields } from './sales';\r
\r
const DAY = 24 * 60 * 60 * 1000;\r
/** The demo's "today", so the example reads the same every day. */\r
const today = new Date(2026, 5, 30);\r
\r
/** "Is in the last … days" on dates, with a NumberBox of its own; "Is a round amount" without a value. */\r
const lastDays: FilterBuilderCustomOperation = {\r
  name: 'lastDays',\r
  caption: 'Is in the last days',\r
  dataTypes: ['date'],\r
  customizeText: (info) => \`\${info.value} days\`,\r
  editor: (ctx) => {\r
    const box = new NumberBox({ label: 'Days', labelMode: 'hidden', size: 'sm', min: 1, value: typeof ctx.value === 'number' ? ctx.value : null });\r
    box.onValueChanged((e) => ctx.setValue(e.value));\r
    return box;\r
  },\r
  calculateFilterExpression: (days, field) => data.where(field.dataField, 'between', [new Date(today.getTime() - (days as number) * DAY), today]),\r
};\r
\r
const round: FilterBuilderCustomOperation = {\r
  name: 'round',\r
  caption: 'Is a round amount',\r
  dataTypes: ['number'],\r
  hasValue: false,\r
  calculateFilterExpression: (_value, field) => data.where(field.dataField, 'in', [100, 200, 300, 400, 500, 600, 700, 800, 900]),\r
  // Known again from any expression of that shape, also one read back from storage.\r
  readFilterExpression: (e) => (data.isCondition(e) && e.op === 'in' && Array.isArray(e.value) && e.value.length === 9 && e.value[0] === 100 ? { field: e.field, value: undefined } : null),\r
};\r
\r
export default function CustomOperations() {\r
  const s = reactive({ filter: null as data.FilterExpression | null });\r
  return (\r
    <>\r
      <FilterBuilder class="fb-custom" label="Filter with custom operations" fields={saleFields} customOperations={[lastDays, round]} locale="en" x-model={() => s.filter} />\r
      <output class="fb-custom-text">{() => filterText(s.filter, { fields: saleFields, customOperations: [lastDays, round], locale: 'en' }) || 'No filter'}</output>\r
      <pre class="fb-custom-value">{() => JSON.stringify(s.filter)}</pre>\r
    </>\r
  );\r
}\r
`,b=`import { reactive } from '@motifx/core';\r
import { data } from '@motifx-community/data';\r
import { FilterBuilder, RadioGroup, Stack, Switch, type FilterBuilderField } from '@motifx-community/ui';\r
\r
const fields: FilterBuilderField[] = [\r
  { dataField: 'customer.name', caption: 'Customer.Name' },\r
  { dataField: 'customer.address.city' },\r
  { dataField: 'customer.address.country' },\r
  { dataField: 'total', dataType: 'number' },\r
];\r
\r
/** How deep groups go, which group operations there are, and dotted fields as submenus. */\r
export default function Limits() {\r
  const s = reactive({ max: '1', notOps: true, nested: true });\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center">\r
        <RadioGroup\r
          label="maxGroupLevel"\r
          orientation="horizontal"\r
          items={[\r
            { value: '0', text: '0' },\r
            { value: '1', text: '1' },\r
            { value: '2', text: '2' },\r
            { value: 'none', text: 'No limit' },\r
          ]}\r
          x-model={() => s.max}\r
        />\r
        <Switch label="Not And, Not Or" x-model={() => s.notOps} />\r
        <Switch label="allowHierarchicalFields" x-model={() => s.nested} />\r
      </Stack>\r
      <FilterBuilder\r
        class="fb-limits"\r
        label="Customers filter"\r
        fields={fields}\r
        value={data.and(data.where('customer.address.city', '=', 'Ankara'), data.where('total', '>=', 1000))}\r
        maxGroupLevel={() => (s.max === 'none' ? null : Number(s.max))}\r
        groupOperations={() => (s.notOps ? ['and', 'or', 'notAnd', 'notOr'] : ['and', 'or'])}\r
        allowHierarchicalFields={() => s.nested}\r
      />\r
    </>\r
  );\r
}\r
`,x=`import { reactive } from '@motifx/core';\r
import { data } from '@motifx-community/data';\r
import { Button, FilterBuilder, uiLocale } from '@motifx-community/ui';\r
import { saleFields } from './sales';\r
\r
/** The builder's strings come from \`uiLocale\`, and \`texts\` overrides some for one builder. */\r
export default function Localization() {\r
  const s = reactive({ lang: 'en' });\r
  const toggle = () => {\r
    s.lang = s.lang === 'en' ? 'tr' : 'en';\r
    void uiLocale.use(s.lang);\r
  };\r
  return (\r
    <>\r
      <Button text={() => (s.lang === 'en' ? 'Language: English' : 'Dil: Türkçe')} variant="outline" onclick={toggle} />\r
      <FilterBuilder\r
        class="fb-i18n"\r
        fields={saleFields}\r
        locale={() => s.lang}\r
        value={data.or(data.where('city', 'contains', 'an'), data.not(data.where('paid', '=', true)))}\r
        texts={{ filterBuilderEnterValue: '…' }}\r
        label={() => (s.lang === 'en' ? 'Localized filter' : 'Yerelleştirilmiş filtre')}\r
      />\r
    </>\r
  );\r
}\r
`,S=`import { reactive } from '@motifx/core';\r
import { data } from '@motifx-community/data';\r
import { Button, FilterBuilder, Stack } from '@motifx-community/ui';\r
import { saleFields } from './sales';\r
\r
/** Created with \`new\` and controlled programmatically. Every change raises an event first, and a handler can cancel it. */\r
export default function Programmatic() {\r
  const log = reactive({ lines: [] as { id: number; text: string }[], next: 0 });\r
  const write = (text: string) => {\r
    log.lines.unshift({ id: log.next++, text });\r
    if (log.lines.length > 6) log.lines.pop();\r
  };\r
  const builder = new FilterBuilder({ fields: saleFields, locale: 'en', label: 'Built programmatically' });\r
  builder.element.classList.add('fb-code');\r
  builder.onItemAdding((e) => write(\`adding a \${e.item.kind}\${e.byUser ? ' (user)' : ''}\`));\r
  builder.onItemRemoving((e) => {\r
    // The last condition stays.\r
    if (e.group === builder.root && builder.root.items.length === 1) {\r
      e.cancel = true;\r
      write('removing the last condition: cancelled');\r
    }\r
  });\r
  builder.onItemChanged((e) => write(\`\${e.change} → \${JSON.stringify(e.value)}\`));\r
  builder.onValueChanged((e) => write(\`value: \${JSON.stringify(e.value)}\`));\r
\r
  const addPaid = () => {\r
    const c = builder.addCondition(builder.root, 'paid');\r
    if (c) builder.setConditionValue(c, true);\r
  };\r
  const addRange = () => {\r
    const g = builder.addGroup();\r
    const c = g?.items[0];\r
    if (!g || !c || c.kind !== 'condition') return;\r
    builder.setField(c, 'amount');\r
    builder.setOperation(c, 'between');\r
    builder.setConditionValue(c, [100, 400]);\r
    builder.setGroupOperation(g, 'or');\r
  };\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Button text="Add “Paid”" variant="outline" onclick={addPaid} />\r
        <Button text="Add a range group" variant="outline" onclick={addRange} />\r
        <Button text="Set a value" variant="outline" onclick={() => (builder.value = data.where('product', 'startswith', 'Ch'))} />\r
        <Button text="Clear" variant="ghost" onclick={() => builder.clear()} />\r
      </Stack>\r
      {builder}\r
      <ul class="fb-code-log">\r
        {log.lines.map((line) => (\r
          <li key={line.id}>{line.text}</li>\r
        ))}\r
      </ul>\r
    </>\r
  );\r
}\r
`,C=`import type { FilterBuilderField } from '@motifx-community/ui';\r
\r
export interface Sale {\r
  id: number;\r
  product: string;\r
  city: string;\r
  amount: number;\r
  date: Date;\r
  paid: boolean;\r
  stateId: number;\r
}\r
\r
export const states = [\r
  { id: 1, name: 'Ordered' },\r
  { id: 2, name: 'Shipped' },\r
  { id: 3, name: 'Delivered' },\r
  { id: 4, name: 'Returned' },\r
];\r
\r
const products = ['Desk', 'Chair', 'Lamp', 'Shelf', 'Monitor', 'Keyboard'];\r
const cities = ['Ankara', 'İstanbul', 'İzmir', 'Bursa', 'Antalya'];\r
\r
export const sales: Sale[] = Array.from({ length: 60 }, (_, i) => ({\r
  id: i + 1,\r
  product: products[i % products.length],\r
  city: cities[(i * 7) % cities.length],\r
  amount: 40 + ((i * 37) % 900),\r
  date: new Date(2026, i % 6, 1 + ((i * 5) % 27)),\r
  paid: i % 3 !== 0,\r
  stateId: 1 + (i % states.length),\r
}));\r
\r
export const saleFields: FilterBuilderField[] = [\r
  { dataField: 'product', caption: 'Product' },\r
  { dataField: 'city', caption: 'City', filterOperations: ['contains', 'startswith', '=', '<>', 'anyof', 'noneof', 'isblank', 'isnotblank'] },\r
  { dataField: 'amount', caption: 'Amount', dataType: 'number', format: { style: 'currency', currency: 'EUR' } },\r
  { dataField: 'date', caption: 'Date', dataType: 'date', format: { dateStyle: 'medium' } },\r
  { dataField: 'paid', caption: 'Paid', dataType: 'boolean', trueText: 'Paid', falseText: 'Not paid' },\r
  { dataField: 'stateId', caption: 'State', lookup: { dataSource: states, valueField: 'id', textField: 'name' } },\r
];\r
`,w=[{id:1,name:`Ordered`},{id:2,name:`Shipped`},{id:3,name:`Delivered`},{id:4,name:`Returned`}],T=[`Desk`,`Chair`,`Lamp`,`Shelf`,`Monitor`,`Keyboard`],E=[`Ankara`,`İstanbul`,`İzmir`,`Bursa`,`Antalya`],D=Array.from({length:60},(e,t)=>({id:t+1,product:T[t%T.length],city:E[t*7%E.length],amount:40+t*37%900,date:new Date(2026,t%6,1+t*5%27),paid:t%3!=0,stateId:1+t%w.length})),O=[{dataField:`product`,caption:`Product`},{dataField:`city`,caption:`City`,filterOperations:[`contains`,`startswith`,`=`,`<>`,`anyof`,`noneof`,`isblank`,`isnotblank`]},{dataField:`amount`,caption:`Amount`,dataType:`number`,format:{style:`currency`,currency:`EUR`}},{dataField:`date`,caption:`Date`,dataType:`date`,format:{dateStyle:`medium`}},{dataField:`paid`,caption:`Paid`,dataType:`boolean`,trueText:`Paid`,falseText:`Not paid`},{dataField:`stateId`,caption:`State`,lookup:{dataSource:w,valueField:`id`,textField:`name`}}];function k(){let e=r({filter:c.and(c.where(`city`,`in`,[`Ankara`,`İzmir`]),c.or(c.where(`amount`,`>`,500),c.where(`paid`,`=`,!1)))}),i=()=>D.filter(c.createRowFilter(e.filter,{fields:{date:`date`}})).length;return t({initializeComponent:t=>{{let r=n(l,{class:`fb-basic`,label:`Sales filter`,fields:O,locale:`en`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.filter,t=>{let n=e;n!=null&&typeof n.filter!=`function`&&(n.filter=t)})}},childs:[]});t.controls.add(r);let a=n(`output`,{initializeComponent:t=>{t.class.add(`fb-basic-text`),t.bindings.method(()=>u(e.filter,{fields:O,locale:`en`})||`No filter`)}},1);t.controls.add(a);let o=n(`output`,{initializeComponent:e=>{e.class.add(`fb-basic-count`),e.bindings.method(()=>`${i()} of ${D.length} sales`)}},1);t.controls.add(o);let s=n(`pre`,{initializeComponent:t=>{t.class.add(`fb-basic-value`),t.bindings.method(()=>JSON.stringify(e.filter,null,2))}},1);t.controls.add(s)}}})}var A=864e5,j=new Date(2026,5,30),M={name:`lastDays`,caption:`Is in the last days`,dataTypes:[`date`],customizeText:e=>`${e.value} days`,editor:e=>{let t=new a({label:`Days`,labelMode:`hidden`,size:`sm`,min:1,value:typeof e.value==`number`?e.value:null});return t.onValueChanged(t=>e.setValue(t.value)),t},calculateFilterExpression:(e,t)=>c.where(t.dataField,`between`,[new Date(j.getTime()-e*A),j])},N={name:`round`,caption:`Is a round amount`,dataTypes:[`number`],hasValue:!1,calculateFilterExpression:(e,t)=>c.where(t.dataField,`in`,[100,200,300,400,500,600,700,800,900]),readFilterExpression:e=>c.isCondition(e)&&e.op===`in`&&Array.isArray(e.value)&&e.value.length===9&&e.value[0]===100?{field:e.field,value:void 0}:null};function P(){let e=r({filter:null});return t({initializeComponent:t=>{{let r=n(l,{class:`fb-custom`,label:`Filter with custom operations`,fields:O,customOperations:[M,N],locale:`en`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.filter,t=>{let n=e;n!=null&&typeof n.filter!=`function`&&(n.filter=t)})}},childs:[]});t.controls.add(r);let i=n(`output`,{initializeComponent:t=>{t.class.add(`fb-custom-text`),t.bindings.method(()=>u(e.filter,{fields:O,customOperations:[M,N],locale:`en`})||`No filter`)}},1);t.controls.add(i);let a=n(`pre`,{initializeComponent:t=>{t.class.add(`fb-custom-value`),t.bindings.method(()=>JSON.stringify(e.filter))}},1);t.controls.add(a)}}})}function F(){let e=r({lines:[],next:0}),a=t=>{e.lines.unshift({id:e.next++,text:t}),e.lines.length>6&&e.lines.pop()},o=new l({fields:O,locale:`en`,label:`Built programmatically`});o.element.classList.add(`fb-code`),o.onItemAdding(e=>a(`adding a ${e.item.kind}${e.byUser?` (user)`:``}`)),o.onItemRemoving(e=>{e.group===o.root&&o.root.items.length===1&&(e.cancel=!0,a(`removing the last condition: cancelled`))}),o.onItemChanged(e=>a(`${e.change} → ${JSON.stringify(e.value)}`)),o.onValueChanged(e=>a(`value: ${JSON.stringify(e.value)}`));let s=()=>{let e=o.addCondition(o.root,`paid`);e&&o.setConditionValue(e,!0)},u=()=>{let e=o.addGroup(),t=e?.items[0];e&&t&&t.kind===`condition`&&(o.setField(t,`amount`),o.setOperation(t,`between`),o.setConditionValue(t,[100,400]),o.setGroupOperation(e,`or`))};return t({initializeComponent:t=>{{let r=n(d,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[n(i,{text:`Add “Paid”`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,s)}},childs:[]}),n(i,{text:`Add a range group`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,u)}},childs:[]}),n(i,{text:`Set a value`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,()=>o.value=c.where(`product`,`startswith`,`Ch`))}},childs:[]}),n(i,{text:`Clear`,variant:`ghost`,runover:{initializeComponent:e=>{e.motif.on(`click`,()=>o.clear())}},childs:[]})]});t.controls.add(r);let a=n(`text`,{initializeComponent:e=>{e.bindings.add(`textContent`,()=>{if(o!=null)return typeof o==`function`?o():()=>o})},__childExpr:()=>o});t.controls.add(a);let l=n(`ul`,{initializeComponent:t=>{t.class.add(`fb-code-log`);let r=n({initializeComponent:t=>{t.bindings.list(()=>e&&e.lines!==null&&e.lines!==void 0?e.lines:[],e=>n(`li`,{indexkey:()=>e.id,initializeComponent:t=>{let r=n(`text`,{initializeComponent:t=>{t.bindings.add(`textContent`,e,`text`)},__childExpr:()=>e.text});t.controls.add(r)}}))}});t.controls.add(r)}},1);t.controls.add(l)}}})}var I=[{dataField:`customer.name`,caption:`Customer.Name`},{dataField:`customer.address.city`},{dataField:`customer.address.country`},{dataField:`total`,dataType:`number`}];function L(){let e=r({max:`1`,notOps:!0,nested:!0});return t({initializeComponent:t=>{{let r=n(d,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[n(s,{label:`maxGroupLevel`,orientation:`horizontal`,items:[{value:`0`,text:`0`},{value:`1`,text:`1`},{value:`2`,text:`2`},{value:`none`,text:`No limit`}],runover:{initializeComponent:t=>{t.bindings.model(()=>e.max,t=>{let n=e;n!=null&&typeof n.max!=`function`&&(n.max=t)})}},childs:[]}),n(o,{label:`Not And, Not Or`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.notOps,t=>{let n=e;n!=null&&typeof n.notOps!=`function`&&(n.notOps=t)})}},childs:[]}),n(o,{label:`allowHierarchicalFields`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.nested,t=>{let n=e;n!=null&&typeof n.nested!=`function`&&(n.nested=t)})}},childs:[]})]});t.controls.add(r);let i=n(l,{class:`fb-limits`,label:`Customers filter`,fields:I,value:c.and(c.where(`customer.address.city`,`=`,`Ankara`),c.where(`total`,`>=`,1e3)),maxGroupLevel:()=>e.max===`none`?null:Number(e.max),groupOperations:()=>e.notOps?[`and`,`or`,`notAnd`,`notOr`]:[`and`,`or`],allowHierarchicalFields:()=>e.nested,runover:{},childs:[]});t.controls.add(i)}}})}function R(){let a=r({lang:`en`}),o=()=>{a.lang=a.lang===`en`?`tr`:`en`,e.use(a.lang)};return t({initializeComponent:e=>{{let t=n(i,{text:()=>a.lang===`en`?`Language: English`:`Dil: Türkçe`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,o)}},childs:[]});e.controls.add(t);let r=n(l,{class:`fb-i18n`,fields:O,locale:()=>a.lang,value:c.or(c.where(`city`,`contains`,`an`),c.not(c.where(`paid`,`=`,!0))),texts:{filterBuilderEnterValue:`…`},label:()=>a.lang===`en`?`Localized filter`:`Yerelleştirilmiş filtre`,runover:{},childs:[]});e.controls.add(r)}}})}var z=_(Object.assign({"./examples/Basic.tsx":v,"./examples/CustomOperations.tsx":y,"./examples/Limits.tsx":b,"./examples/Localization.tsx":x,"./examples/Programmatic.tsx":S,"./examples/sales.ts":C})),B=[[`string (default)`,"`contains`, `notcontains`, `startswith`, `endswith`, `=`, `<>`, `isblank`, `isnotblank`",`TextBox`],[`number`,"`=`, `<>`, `<`, `>`, `<=`, `>=`, `between`, `isblank`, `isnotblank`","NumberBox (two for `between`)"],[`date, datetime`,`As number`,"DateBox (two for `between`)"],[`boolean`,"`=`, `<>`, `isblank`, `isnotblank`","DropDown of `trueText` and `falseText`"],[`object`,"`isblank`, `isnotblank`",`—`],["a `lookup` field","`=`, `<>`, `isblank` and `isnotblank`, regardless of type",`DropDown of the lookup items, with search`],["`in`, `notin` (`anyof`, `noneof`)","Set in `filterOperations`",`TagBox with the lookup items or typed values`]],V=[[`value`,"`Bind<data.FilterExpression | null>`","`null`","The filter, in data layer format. `x-model` provides two-way binding. Conditions without a value are left out."],[`fields`,"`Bind<FilterBuilderField[]>`","`[]`",`The fields conditions are built on (see below).`],[`customOperations`,"`Bind<FilterBuilderCustomOperation[]>`","`[]`",`Custom operations (see below).`],[`groupOperations`,"`Bind<('and' | 'or' | 'notAnd' | 'notOr')[]>`",`all four`,`The available group joins. The first is the default for a new group.`],[`maxGroupLevel`,"`Bind<number | null>`","`null`","`0` allows no groups, `1` allows groups in the root only, and so on. `null` means no limit."],[`allowHierarchicalFields`,"`Bind<boolean>`","`false`","Shows fields with a dotted `dataField` as submenus of their parts."],[`label`,"`Bind<string>`","The `filterBuilderLabel` string","The accessible name of the tree. `aria-label` and `aria-labelledby` on the tag also work."],[`texts`,"`Bind<Partial<UiStrings>>`","`{}`","Strings for this builder only, which override `uiLocale.strings`."],[`locale`,"`Bind<string>`",`From the page`,`The locale of numbers and dates.`],[`size`,"`Bind<ControlSize>`","`'sm'`",`The size of the buttons and editors.`],[`addKeys, removeKeys`,"`Bind<string[]>`","`['Insert']`, `['Delete']`",`Keys that add a condition to the focused row's group and remove the focused row.`],[`enabled / disabled, visible, tabStop, tabIndex`,`see Control`,``,`Properties shared by all controls.`]],H=[[`dataField`,"`string`",`The field the condition filters. Use a dotted path for a nested field.`],[`caption`,"`Bind<string>`","The default is the data field in words (`orderDate` → “Order Date”)."],[`dataType`,"`Bind<'string' | 'number' | 'date' | 'datetime' | 'boolean' | 'object'>`","The default is `'string'`. It determines the operations, the editor and how a value is displayed."],[`format`,"`Intl` options or `(value) => string`",`How a value is displayed. Number and date editors also accept the options.`],[`lookup`,"`{ dataSource, valueField?, textField?, allowClearing? }`",`The values come from a list: an array, or a data source from any adapter.`],[`filterOperations`,"`Bind<string[]>`","The available operations in order, with custom operations by name. The default depends on `dataType`."],[`defaultOperation`,"`Bind<string>`","The operation for a new condition. The default is the first of `filterOperations`."],[`editor`,"`(ctx) => component`","A custom editor. `ctx` provides `value`, `setValue`, `close`, `field`, `operation`, `condition` and `builder`."],[`editorOptions`,"`Bind<Record<string, unknown>>`",`Props passed to the kit editor the builder creates.`],[`customizeText`,"`({ value, valueText, field }) => string`","The display text of a value, in the builder and in `filterText`."],[`trueText, falseText`,"`Bind<string>`","The text for a yes/no field. The defaults are the `filterBuilderTrue` and `filterBuilderFalse` strings."]],U=[[`name, caption`,"`string`, `Bind<string>`","The name used in `filterOperations`, and the text in the menu and in `filterText`."],[`dataTypes`,"`FilterBuilderDataType[]`","The data types whose fields offer it automatically, for fields without their own `filterOperations`."],[`hasValue`,"`boolean`","The default is `true`. `false` shows no value."],[`editor, customizeText`,`Same as on a field`,`The value editor and text for this operation.`],[`calculateFilterExpression`,"`(value, field) => data.FilterExpression | null`",`Defines the condition in the value, as any data layer expression, so every adapter can run it.`],[`readFilterExpression`,"`(expression) => { field, value } | null`",`Recognizes an expression as this operation, including one read back from storage. Without it, the builder only recognizes expressions it wrote itself.`]],W=[[`every prop above`,`read/write, reactive`,`Accepts a value or a function, the same as the prop.`],[`root`,`read-only`,"The tree: `{ kind: 'group', operation, items, parent }` containing `{ kind: 'condition', field, operation, value, parent }` items. Change it through the methods."],[`filterText`,`read-only, reactive`,"The filter as a single line: `[City] Equals 'Ankara' And [Amount] Is greater than '100'`."],[`model`,`read-only`,"The `FilterBuilderModel`, which provides field operations, text, and conversion between expressions and the tree."],[`treePart, editingCondition`,`read-only`,'The `role="treegrid"` part, and the condition whose editor is open.']],G=[[`addCondition(group?, dataField?)`,"`FilterBuilderCondition | null`",`Adds at the end of a group (the root by default), on a field (the first by default). The events run.`],[`addGroup(group?)`,"`FilterBuilderGroup | null`","Adds a group with one condition. Returns `null` past `maxGroupLevel`."],[`removeItem(item)`,"`boolean`",`Removes a condition, or a group with its contents.`],[`setField(condition, dataField), setOperation(condition, op), setConditionValue(condition, value)`,"`boolean`",`An operation or value that no longer fits the new field is reset.`],[`setGroupOperation(group, op)`,"`boolean`",``],[`clear()`,"`void`",`Clears the tree.`],[`openEditor(condition), closeEditor(keep?)`,"`boolean`, `void`",`Controls the value editor programmatically.`],[`focusItem(item, part?), focus()`,"`boolean`","Sets focus on a row's button (`'remove'`, `'group'`, `'add'`, `'field'`, `'operation'`, `'value'`), or on the tree's Tab stop."],[`getFilterExpression()`,"`data.FilterExpression | null`",`The value.`],[`refresh()`,"`void`","Your fields and value can be plain or reactive, and the builder reads them as they are. After changing them in place, call `refresh()`. The rows redraw, and a value changed in place is read into the tree."]],K=[[`onValueChanged(e)`,"`{ value, previousValue, byUser, source }`"],[`onItemAdding(e), onItemAdded(e)`,"Occur before and after a condition or group is added: `{ item, group, byUser, source }`. Change `e.item` before it is added, or set `e.cancel = true`."],[`onItemRemoving(e), onItemRemoved(e)`,"`{ item, group, byUser, source }`. Set `e.cancel = true` to keep it."],[`onItemChanging(e), onItemChanged(e)`,"`{ item, change: 'field' | 'operation' | 'value' | 'groupOperation', value, previousValue, byUser, source }`. Change `e.value`, or set `e.cancel = true`."],[`onEditorPreparing(e)`,"Occurs before a value editor is created: `{ field, operation, value, condition, part: 'value' | 'from' | 'to', options, editor, setValue }`. Change `e.options` (the kit editor props), set `e.editor` to a custom component that calls `e.setValue`, or set `e.cancel = true` for no editor."],[`onEditorPrepared(e)`,"`{ field, operation, condition, part, editor }`"]],q=[[`Tab`,`Moves focus into the tree, to the button focused last, and out again. The tree is one Tab stop.`],[`Right / Left`,`Moves to the next or previous button in the row, reversed on right-to-left pages.`],[`Down / Up`,`Moves to the row below or above, on the same button where possible.`],[`Home / End; Ctrl + Home / End`,`Moves to the first or last button of the row, or of the tree.`],[`Enter, Space`,`Presses the button, which opens its menu or the value editor, adds or removes.`],[`Alt + Down`,`Opens the menu of a field, operation, group or add button.`],[`F2`,`Opens the value editor.`],[`Insert`,"Adds a condition to the row's group (`addKeys`)."],[`Delete`,"Removes the row's condition or group (`removeKeys`)."],[`In the editor: Enter, Escape, Tab`,`Accepts the value, discards it, or accepts it and moves on (from “from” to “to” in a range).`]],J=[[`Tree`,'`role="treegrid"`, named by `label`. Each group and condition is a `row` with `aria-level`, `aria-posinset` and `aria-setsize`, and each button is in a `gridcell`.'],[`Buttons`,'Named by their function: “Field: City”, “Operation: Equals”, “Value: Ankara”, “Group operation: And”, “Add” and “Remove condition”. Menu buttons have `aria-haspopup="menu"` and `aria-expanded`, and the choices are `menuitemradio` elements.'],[`Editors`,`Kit fields named “City value”, “Amount, from” and “Amount, to”.`],[`Focus`,"Roving `tabindex`, so one button is in the Tab order. The focus ring appears only during keyboard use."]],Y=[[`.mx-filter-builder`,`The root.`],[`.mx-filter-builder__tree`,"The `treegrid`, with `data-size`."],[`.mx-filter-builder__row`,"A group or a condition: `data-kind` (`'group'`, `'condition'`) and `--_level`."],[`.mx-filter-builder__cell`,"A `gridcell`; `data-part` (`'remove'`, `'group'`, `'add'`, `'field'`, `'operation'`, `'value'`)."],[`.mx-filter-builder__remove, __group, __add, __field, __operation, __value`,"The kit buttons. The value button has `data-empty` while it has no value."],[`.mx-filter-builder__editor`,`The open value editor or editors.`]],X=[[`filterbuilder.container, filterbuilder.tree, filterbuilder.row, filterbuilder.cell, filterbuilder.editor`,"Units: the text, the rows (`group`, `hover`) and the space between them, a button's place, and a value editor."],[`filterbuilder.indent`,`The indent of each level.`],[`filterbuilder.line-width, line-color, line-offset, elbow-length, elbow-color`,`The line along each group, and the connector to each row.`],[`filterbuilder.value-width`,`The minimum width of a value editor field.`]];function Z(){return t({initializeComponent:e=>{{let t=n(`p`,{initializeComponent:e=>{e.class.add(`lead`);let t=n(h,{text:`Lets users build a filter visually, using groups joined by And, Or, Not And or Not Or, and conditions made of a field, an operation and a value. Its value is a data layer filter expression, so it works directly with in-memory rows and every adapter. DataGrid opens it from the filter panel, and you can also use it on its own for reports or saved searches.`,runover:{},childs:[]});e.controls.add(t)}},1);e.controls.add(t);let r=n(p,{anchor:`import`,title:`Import`,runover:{},childs:[n(f,{code:`
import { FilterBuilder, filterText } from '@motifx-community/ui';
`,runover:{},childs:[]})]});e.controls.add(r);let i=n(p,{anchor:`value`,title:`The value`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(h,{text:"`value` is a `data.FilterExpression` (`data.where`, `data.and`, `data.or`, `data.not`), and `x-model` provides two-way binding. A condition without a value stays in the tree but is left out of the expression. Each value is edited in place with the kit editor for the field's type, and `filterText` renders any filter as a single line using the field captions, formats and lookup text.",runover:{},childs:[]});e.controls.add(t)}},1),n(m,{files:z(`Basic.tsx`,`sales.ts`),stack:!0,runover:{},childs:[n(k,{runover:{},childs:[]})]})]});e.controls.add(i);let a=n(p,{anchor:`code`,title:`Programmatic use, and the events`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(h,{text:"Every user action is also a method (`addCondition`, `addGroup`, `removeItem`, `setField`, `setOperation`, `setConditionValue`, `setGroupOperation`, `clear`), and every change raises an event first. `onItemAdding`, `onItemRemoving` and `onItemChanging` can modify or cancel it, followed by the `…ed` events and `onValueChanged`. In this example, the last condition at the root cannot be removed.",runover:{},childs:[]});e.controls.add(t)}},1),n(m,{files:z(`Programmatic.tsx`,`sales.ts`),stack:!0,runover:{},childs:[n(F,{runover:{},childs:[]})]})]});e.controls.add(a);let o=n(p,{anchor:`operations`,title:`Fields and operations`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(h,{text:"A field's `dataType` determines the available operations, where the first is the default for a new condition, and its editor. `filterOperations` sets a custom list for a field. Operation names come from the data layer: “Is any of” is `in` and “Is none of” is `notin` (`anyof` and `noneof` are read as these).",runover:{},childs:[]});e.controls.add(t)}},1),n(g,{head:[`Field`,`Operations`,`Editor`],rows:B,runover:{},childs:[]})]});e.controls.add(o);let s=n(p,{anchor:`custom`,title:`Custom operations`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(h,{text:"A custom operation has a name, a caption, the data types that offer it, its own editor and text, and `calculateFilterExpression`, which defines the condition in the value. The value remains an expression that every adapter can run. The builder recognizes its own conditions while it holds that value, and recognizes any expression when `readFilterExpression` is set.",runover:{},childs:[]});e.controls.add(t)}},1),n(m,{files:z(`CustomOperations.tsx`,`sales.ts`),stack:!0,runover:{},childs:[n(P,{runover:{},childs:[]})]})]});e.controls.add(s);let c=n(p,{anchor:`groups`,title:`Groups, limits and nested fields`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(h,{text:"`maxGroupLevel` limits nesting depth, and at the limit the add button adds a condition immediately. `groupOperations` sets the available joins, and `allowHierarchicalFields` turns dotted fields (`customer.address.city`) into submenus.",runover:{},childs:[]});e.controls.add(t)}},1),n(m,{files:z(`Limits.tsx`),stack:!0,runover:{},childs:[n(L,{runover:{},childs:[]})]})]});e.controls.add(c);let l=n(p,{anchor:`keyboard`,title:`Keyboard`,runover:{},childs:[n(g,{head:[`Key`,`Description`],rows:q,runover:{},childs:[]})]});e.controls.add(l);let u=n(p,{anchor:`a11y`,title:`Accessibility`,runover:{},childs:[n(g,{head:[`Topic`,`Details`],rows:J,runover:{},childs:[]})]});e.controls.add(u);let d=n(p,{anchor:`i18n`,title:`Localization`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(h,{text:"All strings come from `uiLocale.strings` (`filterBuilder…` and `filterOp…`: group and operation names, “Add Condition”, “<enter a value>” and button names). `texts` overrides some for one builder, and `locale` formats its numbers and dates.",runover:{},childs:[]});e.controls.add(t)}},1),n(m,{files:z(`Localization.tsx`,`sales.ts`),stack:!0,runover:{},childs:[n(R,{runover:{},childs:[]})]})]});e.controls.add(d);let _=n(p,{anchor:`styling`,title:`Styling`,runover:{},childs:[n(g,{head:[`Hook`,`Description`],rows:Y,runover:{},childs:[]}),n(`h3`,{initializeComponent:e=>{let t=n(h,{text:`Component tokens`,runover:{},childs:[]});e.controls.add(t)}},1),n(g,{head:[`Token`,`Description`],rows:X,runover:{},childs:[]})]});e.controls.add(_);let v=n(p,{anchor:`api`,title:`API reference`,runover:{},childs:[n(`h3`,{initializeComponent:e=>{let t=n(h,{text:`Props`,runover:{},childs:[]});e.controls.add(t)}},1),n(g,{head:[`Prop`,`Type`,`Default`,`Description`],rows:V,runover:{},childs:[]}),n(`h3`,{initializeComponent:e=>{let t=n(h,{text:`FilterBuilderField`,runover:{},childs:[]});e.controls.add(t)}},1),n(g,{head:[`Field`,`Type`,`Description`],rows:H,runover:{},childs:[]}),n(`h3`,{initializeComponent:e=>{let t=n(h,{text:`FilterBuilderCustomOperation`,runover:{},childs:[]});e.controls.add(t)}},1),n(g,{head:[`Field`,`Type`,`Description`],rows:U,runover:{},childs:[]}),n(`h3`,{initializeComponent:e=>{let t=n(h,{text:`Properties`,runover:{},childs:[]});e.controls.add(t)}},1),n(g,{head:[`Property`,`Access`,`Description`],rows:W,runover:{},childs:[]}),n(`h3`,{initializeComponent:e=>{let t=n(h,{text:`Methods`,runover:{},childs:[]});e.controls.add(t)}},1),n(g,{head:[`Method`,`Returns`,`Description`],rows:G,runover:{},childs:[]}),n(`h3`,{initializeComponent:e=>{let t=n(h,{text:`Events`,runover:{},childs:[]});e.controls.add(t)}},1),n(g,{head:[`Event`,`When`],rows:K,runover:{},childs:[]})]});e.controls.add(v)}}})}export{Z as default};