import{Qn as e,Zn as t,er as n}from"./next-id-CtzpBrBT.js";import{t as r}from"./FormLayout-5yqdxSP9.js";import{a as i,i as a,n as o,r as s,t as c}from"./docs-B_LZlyP5.js";import{t as l}from"./sources-BXVvOiIY.js";var u=`import { reactive } from '@motifx/core';\r
import { FormLayout, type FormItem } from '@motifx-community/ui';\r
\r
const countries = [\r
  { value: 'TR', text: 'Türkiye' },\r
  { value: 'DE', text: 'Germany' },\r
  { value: 'FR', text: 'France' },\r
];\r
\r
/** The fields of a customer on two columns: editors by name or by value, a group, a field shown on a condition, a Save button that checks first. */\r
export default function CustomerForm() {\r
  const customer = reactive({\r
    name: 'Ada Lovelace',\r
    email: '',\r
    phone: '',\r
    birthday: null as Date | null,\r
    country: 'TR' as string | null,\r
    city: 'İstanbul',\r
    vip: false,\r
    credit: 1000,\r
    note: '',\r
  });\r
  const s = reactive({ result: '' });\r
\r
  const items: FormItem[] = [\r
    { field: 'name', label: '&Name', required: true },\r
    { field: 'email', label: 'Email', editor: 'email', required: true },\r
    { field: 'phone', label: 'Phone', editorProps: { mask: '(000) 000 00 00', type: 'tel' } },\r
    { field: 'birthday', label: 'Birthday', editor: 'date', editorProps: { max: new Date() } },\r
    {\r
      group: 'Address',\r
      columns: 2,\r
      items: [\r
        { field: 'country', label: 'Country', editor: 'dropdown', editorProps: { items: countries } },\r
        { field: 'city', label: 'City' },\r
      ],\r
    },\r
    { field: 'vip', label: 'VIP customer', editor: 'switch' },\r
    { field: 'credit', label: 'Credit limit', editorProps: { format: { style: 'currency', currency: 'TRY' }, min: 0 }, visible: () => customer.vip },\r
    { field: 'note', label: 'Note', editor: 'textarea', colSpan: 'all' },\r
    { button: { text: 'Save', tone: 'accent', submit: true } },\r
  ];\r
\r
  return (\r
    <>\r
      <FormLayout\r
        data={customer}\r
        columns={2}\r
        items={items}\r
        onValidSubmit={() => (s.result = \`Saved \${customer.name}.\`)}\r
        onInvalidSubmit={(e) => (s.result = \`\${e.invalid.length} field(s) to fix.\`)}\r
      />\r
      <output class="fl-result">{() => s.result}</output>\r
      <output class="fl-data">{() => \`\${customer.name} · \${customer.email || '—'} · \${customer.city} · vip: \${customer.vip}\`}</output>\r
    </>\r
  );\r
}\r
`,d=[{value:`TR`,text:`Türkiye`},{value:`DE`,text:`Germany`},{value:`FR`,text:`France`}];function f(){let i=n({name:`Ada Lovelace`,email:``,phone:``,birthday:null,country:`TR`,city:`İstanbul`,vip:!1,credit:1e3,note:``}),a=n({result:``}),o=[{field:`name`,label:`&Name`,required:!0},{field:`email`,label:`Email`,editor:`email`,required:!0},{field:`phone`,label:`Phone`,editorProps:{mask:`(000) 000 00 00`,type:`tel`}},{field:`birthday`,label:`Birthday`,editor:`date`,editorProps:{max:new Date}},{group:`Address`,columns:2,items:[{field:`country`,label:`Country`,editor:`dropdown`,editorProps:{items:d}},{field:`city`,label:`City`}]},{field:`vip`,label:`VIP customer`,editor:`switch`},{field:`credit`,label:`Credit limit`,editorProps:{format:{style:`currency`,currency:`TRY`},min:0},visible:()=>i.vip},{field:`note`,label:`Note`,editor:`textarea`,colSpan:`all`},{button:{text:`Save`,tone:`accent`,submit:!0}}];return e({initializeComponent:e=>{{let n=t(r,{data:i,columns:2,items:o,onValidSubmit:()=>a.result=`Saved ${i.name}.`,onInvalidSubmit:e=>a.result=`${e.invalid.length} field(s) to fix.`,runover:{},childs:[]});e.controls.add(n);let s=t(`output`,{initializeComponent:e=>{e.class.add(`fl-result`),e.bindings.method(()=>a.result)}},1);e.controls.add(s);let c=t(`output`,{initializeComponent:e=>{e.class.add(`fl-data`),e.bindings.method(()=>`${i.name} · ${i.email||`—`} · ${i.city} · vip: ${i.vip}`)}},1);e.controls.add(c)}}})}var p=l(Object.assign({"./examples/CustomerForm.tsx":u}));function m(){return e({initializeComponent:e=>{{let n=t(`p`,{initializeComponent:e=>{e.class.add(`lead`);let n=t(s,{text:`Arranges the fields of a data object on a grid. Each field gets an editor, chosen by name or by the type of its value, with two-way binding to the object. Groups, column spans and buttons organize the layout, and submitting the form validates every field first.`,runover:{},childs:[]});e.controls.add(n)}},1);e.controls.add(n);let r=t(a,{anchor:`import`,title:`Import`,runover:{},childs:[t(i,{code:`
import { FormLayout, type FormItem } from '@motifx-community/ui';
`,runover:{},childs:[]})]});e.controls.add(r);let l=t(a,{anchor:`form`,title:`Form bound to an object`,runover:{},childs:[t(o,{files:p(`CustomerForm.tsx`),stack:!0,runover:{},childs:[t(f,{runover:{},childs:[]})]})]});e.controls.add(l);let u=t(a,{anchor:`editors`,title:`Editors`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(s,{text:"Editors by name: `text`, `password`, `email`, `textarea`, `number`, `date`, `datetime`, `time`, `checkbox`, `switch`, `dropdown`, `combobox`, `lookup`, `radio` and `slider`. If you omit the name, the value determines the editor: a number uses NumberBox, a boolean uses CheckBox, a Date uses DateBox, and anything else uses TextBox. `editorProps` are passed to the editor. Register custom editors once:",runover:{},childs:[]});e.controls.add(n)}},1),t(i,{code:`
FormLayout.editors.set('color', (props) => new ColorPicker(props));
{ field: 'tint', label: 'Tint', editor: 'color' }
`,runover:{},childs:[]})]});e.controls.add(u);let d=t(a,{anchor:`api`,title:`API reference`,runover:{},childs:[t(`h3`,{initializeComponent:e=>{let n=t(s,{text:`Props`,runover:{},childs:[]});e.controls.add(n)}},1),t(c,{head:[`Prop`,`Type`,`Default`,`Description`],rows:[[`data`,"`Bind<T | null>`",`—`,`The object the editors display and change.`],[`items`,"`Bind<readonly FormItem[]>`","`[]`",`The form items. A function is tracked.`],[`columns`,"`Bind<number>`","`1`",`The number of grid columns.`],[`minColumnWidth`,"`Bind<string>`",`—`,`As many columns as fit, each at least this wide.`],[`labelMode`,"`Bind<FieldLabelMode>`","`'top'`",`Passed to every editor.`],[`readOnly`,"`Bind<boolean>`","`false`",`Makes every editor read-only.`],[`onValidSubmit(e) / onInvalidSubmit(e)`,``,``,"Occurs when the form is submitted and valid (`{ data, event }`) or submitted and invalid (`{ valid, invalid }`)."]],runover:{},childs:[]}),t(`h3`,{initializeComponent:e=>{let n=t(s,{text:`FormItem`,runover:{},childs:[]});e.controls.add(n)}},1),t(c,{head:[`Field`,`Description`],rows:[[`field, label, editor, editorProps`,`The property, its label, its editor and the editor's props.`],[`required, rules, helpText, enabled, readOnly, visible`,"Passed to the editor, each as a value or a function. `visible` hides the item."],[`colSpan`,"The number of columns it spans. Use `'all'` for the whole row."],[`group, items, columns`,`A labeled group with its own columns.`],[`button`,"Button props. `submit: true` submits the form."],[`template`,`Any component created for this item.`]],runover:{},childs:[]}),t(`h3`,{initializeComponent:e=>{let n=t(s,{text:`Members`,runover:{},childs:[]});e.controls.add(n)}},1),t(c,{head:[`Member`,`Description`],rows:[[`validate(), resetValidation(), submit()`,`Validates every field, clears the results, and submits the form.`],[`editorOf(field)`,`The editor of a field.`],[`refresh()`,"Your data object and items can be plain or reactive, and the form reads them as they are. After changing them in place, call `refresh()`. Every editor re-reads its value, items re-read their text and states, and added or removed items redraw the form."],[`refreshField(field)`,`Re-reads one field of the data object after it has been changed in place.`],[`validationGroup, isValid`,`The validation group of the fields.`],[`FormLayout.editors`,`The editors registered by name.`]],runover:{},childs:[]})]});e.controls.add(d)}}})}export{m as default};