import{a as e,an as t,h as n,i as r,n as i,nn as a,r as o,rn as s,t as c}from"./doc-B1CtlCkV.js";import{i as l}from"./item-own-value-yYXkkdgf.js";import{t as u}from"./Lookup-ChsMlwhA.js";import{t as d}from"./sources-BXVvOiIY.js";import{t as f}from"./slow-adapter-file-BJ0xGM0X.js";import{t as p}from"./slow-adapter-Qu7CbQ8l.js";var m=`import { reactive } from '@motifx/core';\r
import { data } from '@motifx-community/data';\r
import { Button, Lookup } from '@motifx-community/ui';\r
import { SlowAdapter } from '../../../shared/slow-adapter';\r
\r
interface Customer {\r
  id: number;\r
  company: string;\r
  city: string;\r
}\r
\r
const companyOf = (id: number) => \`\${['Alfreds', 'Bon app', 'Ernst', 'Hanari', 'Island', 'Lehmanns'][id % 6]} \${['Trading', 'Handel', 'Markt', 'Foods'][id % 4]} \${id}\`;\r
const rows: Customer[] = Array.from({ length: 2000 }, (_, i) => ({ id: i + 1, company: companyOf(i + 1), city: ['Berlin', 'Paris', 'İstanbul', 'Madrid'][i % 4] }));\r
\r
/** Values on no loaded page of a server that answers after 1.2 s: one field waits for its row, one shows the name its record carries, one has a key the server does not have. */\r
export default function ByKey() {\r
  const customers = new data.DataSource<Customer, number>({\r
    adapter: new SlowAdapter<Customer, number>({ data: rows, key: 'id' }, 1200),\r
    loadMode: 'blocks',\r
    pageSize: 50,\r
    searchFields: ['company', 'city'],\r
  });\r
  const columns = [\r
    { field: 'company', caption: 'Company' },\r
    { field: 'city', caption: 'City', width: '7rem' },\r
  ];\r
  const waiting = reactive({ customer: 1500 as number | null });\r
  // A record as returned by the server: the customer's key and, beside it, the name.\r
  const order = reactive({ customer: 1500 as number | null, customerName: companyOf(1500) });\r
\r
  const another = () => {\r
    const id = 100 + Math.floor(Math.random() * 1900);\r
    waiting.customer = id;\r
    order.customer = id;\r
    order.customerName = companyOf(id);\r
  };\r
\r
  return (\r
    <>\r
      <Lookup class="lk-waits" label="Waits for its row" dataSource={customers} textField="company" valueField="id" columns={columns} x-model={() => waiting.customer} stretch />\r
      <Lookup\r
        class="lk-given"\r
        label="Shows the name it is given"\r
        dataSource={customers}\r
        textField="company"\r
        valueField="id"\r
        columns={columns}\r
        valueText={() => order.customerName}\r
        x-model={() => order.customer}\r
        stretch\r
      />\r
      <Lookup class="lk-missing" label="A key the server does not have" dataSource={customers} textField="company" valueField="id" columns={columns} value={9999} stretch />\r
      <Button class="lk-another" text="Another customer" variant="outline" onclick={another} />\r
    </>\r
  );\r
}\r
`,h=`import { reactive } from '@motifx/core';\r
import { data } from '@motifx-community/data';\r
import { Lookup } from '@motifx-community/ui';\r
import { SlowAdapter } from '../../../shared/slow-adapter';\r
\r
interface Customer {\r
  id: string;\r
  company: string;\r
  contact: string;\r
  city: string;\r
  phone: string;\r
}\r
\r
const cities = ['Berlin', 'London', 'Madrid', 'México D.F.', 'Paris', 'São Paulo', 'İstanbul', 'Seattle'];\r
const people = ['Maria Anders', 'Ana Trujillo', 'Antonio Moreno', 'Thomas Hardy', 'Christina Berglund', 'Hanna Moos', 'Frédérique Citeaux', 'Martín Sommer'];\r
const rows: Customer[] = Array.from({ length: 2000 }, (_, i) => ({\r
  id: \`C\${String(i + 1).padStart(4, '0')}\`,\r
  company: \`\${['Alfreds', 'Bon app', 'Ernst', 'Folk och fä', 'Hanari', 'Island', 'Lehmanns', 'Wartian'][i % 8]} \${['Futterkiste', 'Trading', 'Handel', 'HB', 'Carnes', 'Markt', 'Foods', 'Herkku'][(i >> 3) % 8]} \${i + 1}\`,\r
  contact: people[i % 8],\r
  city: cities[(i * 3) % 8],\r
  phone: \`0\${(212 + (i % 9)).toString()} \${String(1000000 + i * 37).slice(0, 7)}\`,\r
}));\r
\r
/** 2,000 customers behind a server that answers after 250 ms, picked from columns and searched by company, contact and city. */\r
export default function Customers() {\r
  const order = reactive({ customer: 'C0042' as string | null });\r
  const customers = new data.DataSource<Customer, string>({\r
    adapter: new SlowAdapter<Customer, string>({ data: rows, key: 'id' }, 250),\r
    loadMode: 'blocks',\r
    pageSize: 50,\r
    searchFields: ['company', 'contact', 'city'],\r
  });\r
\r
  return (\r
    <>\r
      <Lookup\r
        label="&Customer"\r
        dataSource={customers}\r
        textField="company"\r
        valueField="id"\r
        popupWidth="40rem"\r
        columns={[\r
          { field: 'company', caption: 'Company', width: '2fr' },\r
          { field: 'contact', caption: 'Contact' },\r
          { field: 'city', caption: 'City', width: '7rem' },\r
          { field: 'phone', caption: 'Phone', width: '8rem', align: 'end' },\r
        ]}\r
        clearButton\r
        x-model={() => order.customer}\r
        stretch\r
      />\r
      <output class="lk-customer">{() => \`customer: \${order.customer ?? '—'}\`}</output>\r
    </>\r
  );\r
}\r
`,g=e=>`${[`Alfreds`,`Bon app`,`Ernst`,`Hanari`,`Island`,`Lehmanns`][e%6]} ${[`Trading`,`Handel`,`Markt`,`Foods`][e%4]} ${e}`,_=Array.from({length:2e3},(e,t)=>({id:t+1,company:g(t+1),city:[`Berlin`,`Paris`,`İstanbul`,`Madrid`][t%4]}));function v(){let e=new l.DataSource({adapter:new p({data:_,key:`id`},1200),loadMode:`blocks`,pageSize:50,searchFields:[`company`,`city`]}),r=[{field:`company`,caption:`Company`},{field:`city`,caption:`City`,width:`7rem`}],i=t({customer:1500}),o=t({customer:1500,customerName:g(1500)}),c=()=>{let e=100+Math.floor(Math.random()*1900);i.customer=e,o.customer=e,o.customerName=g(e)};return s({initializeComponent:t=>{{let s=a(u,{class:`lk-waits`,label:`Waits for its row`,dataSource:e,textField:`company`,valueField:`id`,columns:r,stretch:!0,runover:{initializeComponent:e=>{e.bindings.model(()=>i.customer,e=>{let t=i;t!=null&&typeof t.customer!=`function`&&(t.customer=e)})}},childs:[]});t.controls.add(s);let l=a(u,{class:`lk-given`,label:`Shows the name it is given`,dataSource:e,textField:`company`,valueField:`id`,columns:r,valueText:()=>o.customerName,stretch:!0,runover:{initializeComponent:e=>{e.bindings.model(()=>o.customer,e=>{let t=o;t!=null&&typeof t.customer!=`function`&&(t.customer=e)})}},childs:[]});t.controls.add(l);let d=a(u,{class:`lk-missing`,label:`A key the server does not have`,dataSource:e,textField:`company`,valueField:`id`,columns:r,value:9999,stretch:!0,runover:{},childs:[]});t.controls.add(d);let f=a(n,{class:`lk-another`,text:`Another customer`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,c)}},childs:[]});t.controls.add(f)}}})}var y=[`Berlin`,`London`,`Madrid`,`México D.F.`,`Paris`,`São Paulo`,`İstanbul`,`Seattle`],b=[`Maria Anders`,`Ana Trujillo`,`Antonio Moreno`,`Thomas Hardy`,`Christina Berglund`,`Hanna Moos`,`Frédérique Citeaux`,`Martín Sommer`],x=Array.from({length:2e3},(e,t)=>({id:`C${String(t+1).padStart(4,`0`)}`,company:`${[`Alfreds`,`Bon app`,`Ernst`,`Folk och fä`,`Hanari`,`Island`,`Lehmanns`,`Wartian`][t%8]} ${[`Futterkiste`,`Trading`,`Handel`,`HB`,`Carnes`,`Markt`,`Foods`,`Herkku`][(t>>3)%8]} ${t+1}`,contact:b[t%8],city:y[t*3%8],phone:`0${(212+t%9).toString()} ${String(1e6+t*37).slice(0,7)}`}));function S(){let e=t({customer:`C0042`}),n=new l.DataSource({adapter:new p({data:x,key:`id`},250),loadMode:`blocks`,pageSize:50,searchFields:[`company`,`contact`,`city`]});return s({initializeComponent:t=>{{let r=a(u,{label:`&Customer`,dataSource:n,textField:`company`,valueField:`id`,popupWidth:`40rem`,columns:[{field:`company`,caption:`Company`,width:`2fr`},{field:`contact`,caption:`Contact`},{field:`city`,caption:`City`,width:`7rem`},{field:`phone`,caption:`Phone`,width:`8rem`,align:`end`}],clearButton:!0,stretch:!0,runover:{initializeComponent:t=>{t.bindings.model(()=>e.customer,t=>{let n=e;n!=null&&typeof n.customer!=`function`&&(n.customer=t)})}},childs:[]});t.controls.add(r);let i=a(`output`,{initializeComponent:t=>{t.class.add(`lk-customer`),t.bindings.method(()=>`customer: ${e.customer??`—`}`)}},1);t.controls.add(i)}}})}var C=d(Object.assign({"./examples/ByKey.tsx":m,"./examples/Customers.tsx":h}));function w(){return s({initializeComponent:t=>{{let n=a(`p`,{initializeComponent:e=>{e.class.add(`lead`);let t=a(o,{text:`Selects one row from a table-style list, typically from a data source searched on the server, such as a customer by company, contact and city. The field shows the text of the selected row, and everything else works as in DropDown.`,runover:{},childs:[]});e.controls.add(t)}},1);t.controls.add(n);let s=a(r,{anchor:`import`,title:`Import`,runover:{},childs:[a(e,{code:`
import { Lookup, type LookupColumn } from '@motifx-community/ui';
`,runover:{},childs:[]})]});t.controls.add(s);let l=a(r,{anchor:`columns`,title:`Columns from a data source`,runover:{},childs:[a(`p`,{initializeComponent:e=>{let t=a(o,{text:"`columns` arranges every row on one grid under a header, and the search box searches the data source's `searchFields`. Rows load as the list scrolls.",runover:{},childs:[]});e.controls.add(t)}},1),a(i,{files:[...C(`Customers.tsx`),f],runover:{},childs:[a(S,{runover:{},childs:[]})]})]});t.controls.add(l);let u=a(r,{anchor:`by-key`,title:`Values on unloaded pages`,runover:{},childs:[a(`p`,{initializeComponent:e=>{let t=a(o,{text:"A value whose row is not loaded is requested by key, in one request together with the keys other fields and grids on the same source need at that moment. In the meantime, the field shows a spinner in place of the arrow, the list stays closed, and the key is never shown as text. A record that already has the name can provide it through `valueText`, and the field shows it immediately. A key the server does not have appears muted and underlined, with the reason in its title. If the request failed, opening the list tries again.",runover:{},childs:[]});e.controls.add(t)}},1),a(i,{files:[...C(`ByKey.tsx`),f],runover:{},childs:[a(v,{runover:{},childs:[]})]})]});t.controls.add(u);let d=a(r,{anchor:`api`,title:`API reference`,runover:{},childs:[a(c,{head:[`Prop`,`Type`,`Default`,`Description`],rows:[[`columns`,"`Bind<readonly LookupColumn[]>`","`[]`","`{ field, caption?, width?, align? }`: a field name or function, a header text, a CSS grid track and the alignment."],[`showColumnHeaders`,"`Bind<boolean>`","`true`",`Shows a header above the rows.`],[`popupWidth`,"`Bind<string>`","`lookup.popup-width`",`The minimum width of the list.`],[`searchEnabled`,"`Bind<boolean>`","`true`",`Adds a search box above the list. DropDown has this off by default.`],[`everything of DropDown`,``,``,"`items`, `dataSource`, `valueText`, `textField`, `valueField`, `searchDelay`, `clearButton`, validation, keyboard support and more."],[`refresh()`,``,``,"Your items and columns can be plain or reactive, and the lookup reads them as they are. After changing them in place, call `refresh()`."]],runover:{},childs:[]})]});t.controls.add(d)}}})}export{w as default};