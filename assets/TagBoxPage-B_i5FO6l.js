import{Mt as e,a as t,an as n,h as r,i,n as a,nn as o,r as s,rn as c,t as l}from"./doc-B1CtlCkV.js";import{t as u}from"./Switch-B8uj57cD.js";import{i as d}from"./item-own-value-yYXkkdgf.js";import{t as f}from"./Stack-AS0iyAxC.js";import{t as p}from"./ValidationGroup-T1woV0-X.js";import{t as m}from"./TagBox-djKbzVGS.js";import{t as h}from"./sources-BXVvOiIY.js";var g=`import { reactive } from '@motifx/core';\r
import { TagBox } from '@motifx-community/ui';\r
\r
/** Typed text that matches no item becomes a tag; \`customValue\` shapes it or turns it down. */\r
export default function CustomTags() {\r
  const issue = reactive({ labels: ['bug'] as string[] });\r
  return (\r
    <>\r
      <TagBox\r
        label="Labels"\r
        items={['bug', 'docs', 'feature', 'question']}\r
        acceptCustomValue\r
        customValue={(text: string) => (text.length > 1 ? text.toLowerCase() : null)}\r
        helpText="Type a new label and press Enter."\r
        x-model={() => issue.labels}\r
      />\r
      <output class="tg-labels">{() => \`labels: \${JSON.stringify(issue.labels)}\`}</output>\r
    </>\r
  );\r
}\r
`,_=`import { reactive } from '@motifx/core';\r
import { data } from '@motifx-community/data';\r
import { TagBox } from '@motifx-community/ui';\r
\r
interface Customer {\r
  id: number;\r
  name: string;\r
}\r
\r
const rows: Customer[] = Array.from({ length: 5000 }, (_, i) => ({ id: i + 1, name: \`Customer \${String(i + 1).padStart(4, '0')}\` }));\r
\r
/** 5,000 customers from a data source, loaded in blocks while the list scrolls; the tags of values not loaded yet are found by key. */\r
export default function Customers() {\r
  const mail = reactive({ to: [12, 4321] as number[] });\r
  const customers = new data.DataSource<Customer, number>({\r
    adapter: new data.ArrayAdapter({ data: rows, key: 'id' }),\r
    loadMode: 'blocks',\r
    pageSize: 50,\r
    searchFields: ['name'],\r
  });\r
\r
  return (\r
    <>\r
      <TagBox label="Customers" dataSource={customers} textField="name" valueField="id" maxTags={3} selectAll clearButton stretch x-model={() => mail.to} />\r
      <output class="tg-customers">{() => \`\${mail.to.length} chosen\${mail.to.length && mail.to.length < 6 ? \`: \${mail.to.join(', ')}\` : ''}\`}</output>\r
    </>\r
  );\r
}\r
`,v=`import { reactive } from '@motifx/core';\r
import { Button, TagBox, uiLocale } from '@motifx-community/ui';\r
import { skills } from './skills';\r
\r
/** Switches the texts of every tag box on the page: remove buttons, “+3”, “Select all”. */\r
export default function Localization() {\r
  const s = reactive({ lang: 'en' });\r
  const toggle = () => {\r
    s.lang = s.lang === 'en' ? 'tr' : 'en';\r
    void uiLocale.use(s.lang);\r
  };\r
  return (\r
    <>\r
      <Button text={() => (s.lang === 'en' ? 'Language: English' : 'Dil: Türkçe')} variant="outline" onclick={toggle} />\r
      <TagBox label="Skills" items={skills} value={['CSS', 'Go', 'HTML', 'Rust']} maxTags={2} selectAll clearButton />\r
    </>\r
  );\r
}\r
`,y=`import { reactive } from '@motifx/core';\r
import { Button, Stack, TagBox } from '@motifx-community/ui';\r
import { skills } from './skills';\r
\r
/** A tag box bound to an array with x-model, and tag boxes created with \`new\` and added programmatically. */\r
export default function Programmatic() {\r
  const form = reactive({ skills: ['TypeScript', 'CSS'] as string[], result: '' });\r
  let added = 0;\r
  let host: Stack | null = null;\r
\r
  const addProgrammatic = () => {\r
    const tags = new TagBox<string, string>({ label: \`Skills \${++added}\`, items: skills, placeholder: 'Pick some' });\r
    tags.onValueChanged((e) => (form.result = \`\${tags.label}: \${e.value.join(', ')}\`));\r
    host?.controls.add(tags);\r
    tags.focus();\r
  };\r
\r
  return (\r
    <>\r
      <TagBox label="&Skills" items={skills} x-model={() => form.skills} stretch />\r
      <Stack orientation="horizontal" wrap align="center">\r
        <output class="tg-skills">{() => \`skills: \${JSON.stringify(form.skills)}\`}</output>\r
        <Button text="Add a tag box programmatically" variant="outline" onclick={addProgrammatic} />\r
        <output class="tg-made">{() => form.result}</output>\r
      </Stack>\r
      <Stack orientation="horizontal" wrap align="center" ref={(c: Stack) => (host = c)} />\r
    </>\r
  );\r
}\r
`,b=`import { reactive } from '@motifx/core';\r
import { Stack, Switch, TagBox } from '@motifx-community/ui';\r
\r
interface Person {\r
  id: number;\r
  name: string;\r
  team: string;\r
  initials: string;\r
  away?: boolean;\r
}\r
\r
const people: Person[] = [\r
  { id: 1, name: 'Ada Lovelace', team: 'Design', initials: 'AL' },\r
  { id: 2, name: 'Grace Hopper', team: 'Design', initials: 'GH' },\r
  { id: 3, name: 'Alan Turing', team: 'Engineering', initials: 'AT' },\r
  { id: 4, name: 'Barbara Liskov', team: 'Engineering', initials: 'BL', away: true },\r
  { id: 5, name: 'Edsger Dijkstra', team: 'Engineering', initials: 'ED' },\r
  { id: 6, name: 'Margaret Hamilton', team: 'Research', initials: 'MH' },\r
  { id: 7, name: 'Donald Knuth', team: 'Research', initials: 'DK' },\r
];\r
\r
/** Draws a person as initials and a name. */\r
const drawPerson = (p: Person, el: HTMLElement) => {\r
  const badge = el.appendChild(document.createElement('span'));\r
  badge.style.color = 'var(--mx-color-accent-fg)';\r
  badge.style.fontWeight = 'var(--mx-font-weight-semibold)';\r
  badge.textContent = p.initials;\r
  el.append(\` \${p.name}\`);\r
};\r
\r
/** Objects in groups, items that cannot be chosen, a template, and the switches of the list. */\r
export default function TeamList() {\r
  const s = reactive({ team: [1, 3] as number[], closeOnSelect: false, hideSelected: false, selectAll: false, limit: false });\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Switch label="Close on select" x-model={() => s.closeOnSelect} />\r
        <Switch label="Hide chosen" x-model={() => s.hideSelected} />\r
        <Switch label="Select all" x-model={() => s.selectAll} />\r
        <Switch label="At most 3" x-model={() => s.limit} />\r
      </Stack>\r
      <TagBox\r
        label="Team"\r
        items={people}\r
        textField="name"\r
        valueField="id"\r
        groupField="team"\r
        enabledField={(p: Person) => !p.away}\r
        itemTemplate={drawPerson}\r
        closeOnSelect={() => s.closeOnSelect}\r
        hideSelected={() => s.hideSelected}\r
        selectAll={() => s.selectAll}\r
        maxSelected={() => (s.limit ? 3 : 0)}\r
        placeholder="Add people"\r
        stretch\r
        x-model={() => s.team}\r
      />\r
      <output class="tg-team">{() => \`ids: \${JSON.stringify(s.team)}\`}</output>\r
    </>\r
  );\r
}\r
`,x=`import { reactive } from '@motifx/core';\r
import { Button, Stack, TagBox, ValidationGroup } from '@motifx-community/ui';\r
import { skills } from './skills';\r
\r
/** A required tag box checked in a group, and the read-only and disabled states. */\r
export default function Validation() {\r
  const s = reactive({ reviewers: [] as string[], result: '' });\r
  const group = new ValidationGroup();\r
\r
  const check = async () => {\r
    const result = await group.validate();\r
    s.result = result.valid ? 'Fine.' : 'Pick a reviewer.';\r
  };\r
\r
  return (\r
    <>\r
      <TagBox label="Reviewers" items={skills} required validationGroup={group} x-model={() => s.reviewers} />\r
      <TagBox label="Read-only" items={skills} value={['Go', 'Rust']} readOnly />\r
      <TagBox label="Disabled" items={skills} value={['Go', 'Rust']} enabled={false} />\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Button text="Check" variant="outline" onclick={check} />\r
        <output class="tg-check">{() => s.result}</output>\r
      </Stack>\r
    </>\r
  );\r
}\r
`,S=`/** The skills the tag boxes of the examples pick from. */\r
export const skills = ['CSS', 'Go', 'HTML', 'Java', 'JavaScript', 'Kotlin', 'Python', 'Rust', 'SQL', 'Swift', 'TypeScript'];\r
`,C=Array.from({length:5e3},(e,t)=>({id:t+1,name:`Customer ${String(t+1).padStart(4,`0`)}`}));function w(){let e=n({to:[12,4321]}),t=new d.DataSource({adapter:new d.ArrayAdapter({data:C,key:`id`}),loadMode:`blocks`,pageSize:50,searchFields:[`name`]});return c({initializeComponent:n=>{{let r=o(m,{label:`Customers`,dataSource:t,textField:`name`,valueField:`id`,maxTags:3,selectAll:!0,clearButton:!0,stretch:!0,runover:{initializeComponent:t=>{t.bindings.model(()=>e.to,t=>{let n=e;n!=null&&typeof n.to!=`function`&&(n.to=t)})}},childs:[]});n.controls.add(r);let i=o(`output`,{initializeComponent:t=>{t.class.add(`tg-customers`),t.bindings.method(()=>`${e.to.length} chosen${e.to.length&&e.to.length<6?`: ${e.to.join(`, `)}`:``}`)}},1);n.controls.add(i)}}})}function T(){let e=n({labels:[`bug`]});return c({initializeComponent:t=>{{let n=o(m,{label:`Labels`,items:[`bug`,`docs`,`feature`,`question`],acceptCustomValue:!0,customValue:e=>e.length>1?e.toLowerCase():null,helpText:`Type a new label and press Enter.`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.labels,t=>{let n=e;n!=null&&typeof n.labels!=`function`&&(n.labels=t)})}},childs:[]});t.controls.add(n);let r=o(`output`,{initializeComponent:t=>{t.class.add(`tg-labels`),t.bindings.method(()=>`labels: ${JSON.stringify(e.labels)}`)}},1);t.controls.add(r)}}})}var E=[`CSS`,`Go`,`HTML`,`Java`,`JavaScript`,`Kotlin`,`Python`,`Rust`,`SQL`,`Swift`,`TypeScript`];function D(){let e=n({skills:[`TypeScript`,`CSS`],result:``}),t=0,i=null,a=()=>{let n=new m({label:`Skills ${++t}`,items:E,placeholder:`Pick some`});n.onValueChanged(t=>e.result=`${n.label}: ${t.value.join(`, `)}`),i?.controls.add(n),n.focus()};return c({initializeComponent:t=>{{let n=o(m,{label:`&Skills`,items:E,stretch:!0,runover:{initializeComponent:t=>{t.bindings.model(()=>e.skills,t=>{let n=e;n!=null&&typeof n.skills!=`function`&&(n.skills=t)})}},childs:[]});t.controls.add(n);let s=o(f,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[o(`output`,{initializeComponent:t=>{t.class.add(`tg-skills`),t.bindings.method(()=>`skills: ${JSON.stringify(e.skills)}`)}},1),o(r,{text:`Add a tag box programmatically`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,a)}},childs:[]}),o(`output`,{initializeComponent:t=>{t.class.add(`tg-made`),t.bindings.method(()=>e.result)}},1)]});t.controls.add(s);let c=o(f,{orientation:`horizontal`,wrap:!0,align:`center`,ref:e=>i=e,runover:{},childs:[]});t.controls.add(c)}}})}function O(){let t=n({lang:`en`}),i=()=>{t.lang=t.lang===`en`?`tr`:`en`,e.use(t.lang)};return c({initializeComponent:e=>{{let n=o(r,{text:()=>t.lang===`en`?`Language: English`:`Dil: Türkçe`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,i)}},childs:[]});e.controls.add(n);let a=o(m,{label:`Skills`,items:E,value:[`CSS`,`Go`,`HTML`,`Rust`],maxTags:2,selectAll:!0,clearButton:!0,runover:{},childs:[]});e.controls.add(a)}}})}var k=[{id:1,name:`Ada Lovelace`,team:`Design`,initials:`AL`},{id:2,name:`Grace Hopper`,team:`Design`,initials:`GH`},{id:3,name:`Alan Turing`,team:`Engineering`,initials:`AT`},{id:4,name:`Barbara Liskov`,team:`Engineering`,initials:`BL`,away:!0},{id:5,name:`Edsger Dijkstra`,team:`Engineering`,initials:`ED`},{id:6,name:`Margaret Hamilton`,team:`Research`,initials:`MH`},{id:7,name:`Donald Knuth`,team:`Research`,initials:`DK`}],A=(e,t)=>{let n=t.appendChild(document.createElement(`span`));n.style.color=`var(--mx-color-accent-fg)`,n.style.fontWeight=`var(--mx-font-weight-semibold)`,n.textContent=e.initials,t.append(` ${e.name}`)};function j(){let e=n({team:[1,3],closeOnSelect:!1,hideSelected:!1,selectAll:!1,limit:!1});return c({initializeComponent:t=>{{let n=o(f,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[o(u,{label:`Close on select`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.closeOnSelect,t=>{let n=e;n!=null&&typeof n.closeOnSelect!=`function`&&(n.closeOnSelect=t)})}},childs:[]}),o(u,{label:`Hide chosen`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.hideSelected,t=>{let n=e;n!=null&&typeof n.hideSelected!=`function`&&(n.hideSelected=t)})}},childs:[]}),o(u,{label:`Select all`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.selectAll,t=>{let n=e;n!=null&&typeof n.selectAll!=`function`&&(n.selectAll=t)})}},childs:[]}),o(u,{label:`At most 3`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.limit,t=>{let n=e;n!=null&&typeof n.limit!=`function`&&(n.limit=t)})}},childs:[]})]});t.controls.add(n);let r=o(m,{label:`Team`,items:k,textField:`name`,valueField:`id`,groupField:`team`,enabledField:e=>!e.away,itemTemplate:A,closeOnSelect:()=>e.closeOnSelect,hideSelected:()=>e.hideSelected,selectAll:()=>e.selectAll,maxSelected:()=>e.limit?3:0,placeholder:`Add people`,stretch:!0,runover:{initializeComponent:t=>{t.bindings.model(()=>e.team,t=>{let n=e;n!=null&&typeof n.team!=`function`&&(n.team=t)})}},childs:[]});t.controls.add(r);let i=o(`output`,{initializeComponent:t=>{t.class.add(`tg-team`),t.bindings.method(()=>`ids: ${JSON.stringify(e.team)}`)}},1);t.controls.add(i)}}})}function M(){let e=n({reviewers:[],result:``}),t=new p,i=async()=>{let n=await t.validate();e.result=n.valid?`Fine.`:`Pick a reviewer.`};return c({initializeComponent:n=>{{let a=o(m,{label:`Reviewers`,items:E,required:!0,validationGroup:t,runover:{initializeComponent:t=>{t.bindings.model(()=>e.reviewers,t=>{let n=e;n!=null&&typeof n.reviewers!=`function`&&(n.reviewers=t)})}},childs:[]});n.controls.add(a);let s=o(m,{label:`Read-only`,items:E,value:[`Go`,`Rust`],readOnly:!0,runover:{},childs:[]});n.controls.add(s);let c=o(m,{label:`Disabled`,items:E,value:[`Go`,`Rust`],enabled:!1,runover:{},childs:[]});n.controls.add(c);let l=o(f,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[o(r,{text:`Check`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,i)}},childs:[]}),o(`output`,{initializeComponent:t=>{t.class.add(`tg-check`),t.bindings.method(()=>e.result)}},1)]});n.controls.add(l)}}})}var N=h(Object.assign({"./examples/CustomTags.tsx":g,"./examples/Customers.tsx":_,"./examples/Localization.tsx":v,"./examples/Programmatic.tsx":y,"./examples/TeamList.tsx":b,"./examples/Validation.tsx":x,"./examples/skills.ts":S})),P=[[`value`,"`Bind<V[]>`","`[]`","The values of the selected items. `x-model` binds them, and every change writes a new array."],[`items / dataSource`,"`Bind<readonly T[]>` / `Bind<DataSource | null>`",`—`,"An in-memory array, searched on the client, or a `@motifx-community/data` data source, searched on the server."],[`textField, valueField, iconField, groupField, enabledField`,"`Bind<ItemField<T>>`",`—`,`Same as ListBox. Groups apply to in-memory items.`],[`placeholder`,"`Bind<string>`","`''`",`Displayed when no item is selected.`],[`searchMode, minSearchLength, searchDelay`,``,"`'contains'`, `0`, `0` / `250`",`How and when typed text searches, as in ComboBox.`],[`acceptCustomValue`,"`Bind<boolean>`","`false`",`Pressing Enter adds text that matches no item as a custom tag.`],[`customValue`,"`Bind<(text) => V | null>`",`The text`,"Creates the value for typed text. Returning `null` rejects it."],[`autoHighlight`,"`Bind<boolean>`","`true` (`false` with `acceptCustomValue`)",`Highlights the first match while typing, so Enter accepts it.`],[`closeOnSelect`,"`Bind<boolean>`","`false`",`Closes the list when an item is selected.`],[`maxTags`,"`Bind<number>`","`0`","The number of tags shown. The rest are counted in a “+3” tag. `0` shows all."],[`maxSelected`,"`Bind<number>`","`0`","The maximum number of selectable items. At the limit, the others cannot be selected. `0` means no limit."],[`selectAll`,"`Bind<boolean>`","`false`",`Adds a "Select all" row before the items.`],[`hideSelected`,"`Bind<boolean>`","`false`",`Removes selected items from the list (in-memory items only).`],[`openOnFieldClick`,"`Bind<boolean>`","`true`",`Clicking the field opens the list.`],[`showDropDownButton, clearButton`,"`Bind<boolean>`","`true`, `false`",`The arrow that opens all items, and the button that removes all tags.`],[`itemTemplate, tagTemplate`,"`Bind<(item, host) => cleanup | void>`",`—`,`Customizes how a list item or a tag is drawn.`],[`matchWidth`,"`Bind<boolean>`","`true`",`The list is at least as wide as the field.`],[`label, labelMode, helpText, hint, prefix, icon, readOnly, required, size, variant, stretch, rules, error, validateOn, validationGroup`,`see TextBox`,``,`Field props shared by all editors.`]],F=[[`every prop above`,`read/write, reactive`,`Accepts a value or a function, the same as the prop.`],[`selectedItems`,`read-only, reactive`,`The known items for the selected values. With a data source, the others are looked up by key.`],[`listItems`,`read-only`,"The `DataItems` shown in the list, which are the results of the last search."],[`opened`,`read/write, reactive`,`Indicates whether the list is open. Set it to open or close the list.`],[`inputElement`,`read-only`,`The text input.`]],I=[[`open(), close()`,"`boolean`, `void`","Opens the list (returns `false` when disabled or read-only), or closes it."],[`clear()`,"`void`",`Removes all tags.`],[`selectAllItems()`,"`Promise<void>`","Selects every item the list shows, up to `maxSelected` (with a data source, after their values load)."],[`refresh()`,"`void`","Your items can be plain or reactive, and the box reads them as they are. After changing them in place, call `refresh()`. The tags, the open list and `selectedItems` update."],[`validate(), resetValidation(), focus()`,``,`See TextBox.`]],L=[[`onValueChanged(e)`,"`{ value, previousValue, byUser, source, event? }`"],[`onOpened()`,`Occurs when the list opens.`],[`onClosed(reason)`,"Occurs when the list closes. The reason is `'escape'`, `'outside'`, `'focus'` or `'code'`."],[`onValidated(e)`,`See TextBox.`]],R=[[`Typing`,`Searches and opens the list, highlighting the first match.`],[`Down / Up, Alt + Down`,`Opens the list with all items, or moves the highlight within it.`],[`Enter`,"Selects or deselects the highlighted item and keeps the list open. With `acceptCustomValue`, text that matches no item becomes a tag."],[`Backspace in an empty input`,`Removes the last tag.`],[`Left at the start of the input`,`Moves to the last tag.`],[`On a tag: Left, Right, Home, End`,`Moves between the tags. Right on the last tag, or End, returns to the input.`],[`On a tag: Delete, Backspace`,`Removes the tag.`],[`Escape`,"Closes the list. When closed, it clears the text, and then removes all tags with `clearButton`."],[`Alt + Up, Tab`,`Closes the list.`]],z=[[`Pattern`,'The APG combobox with a multi-select listbox. The input has `role="combobox"`, `aria-autocomplete="list"`, `aria-expanded` and `aria-controls`, and the list has `aria-multiselectable`.'],[`Highlight`,"`aria-activedescendant` identifies the highlighted option while focus stays in the input."],[`Tags`,'A `role="list"` of `role="listitem"` elements. Each has a remove button named “Remove …” from `uiLocale`, and the “+3” tag lists the rest in its title.'],[`Name`,`The label names the input, and help and error text describe it.`]],B=[[`.mx-tag-box`,"Added to the field. `data-open`, and `data-text` while text is typed, plus the TextBox field attributes."],[`.mx-tag-box__tags, .mx-tag-box__tag, .mx-tag-box__tag-text, .mx-tag-box__remove`,"The tags, a tag (`data-loading` while its item is requested), its text and its remove button."],[`.mx-tag-box__more`,`The “+3” tag.`],[`.mx-tag-box__input, .mx-tag-box__arrow, .mx-tag-box__clear`,`The text input and the buttons.`],[`.mx-tag-box__popup, .mx-list…`,`The popup and the shared list.`]],V=[[`tagbox.tag, tagbox.tag-text`,'Units: a tag (`more`: the "+N" tag, `loading`, `focus`, `hover`, `fixed`, `disabled`) and its text.'],[`tagbox.remove, tagbox.remove-glyph`,"Units: a tag's remove button (`hover`, `pressed`) and its glyph."],[`tagbox.box, tagbox.tags, tagbox.arrow, tagbox.arrow-glyph`,"Units: the spacing around the tags in the box, the tag group, and the arrow that opens the list (`open`)."],[`tagbox.inset, tagbox.input-min-width`,`The space between the tags and the field edge, and the minimum width of the input before it wraps to the next line.`],[`list.*, listbox.*, field.*`,`The list, the list box and the field.`]];function H(){return c({initializeComponent:e=>{{let n=o(`p`,{initializeComponent:e=>{e.class.add(`lead`);let t=o(s,{text:`Selects multiple items. Selected items appear as tags in the field, followed by a text input that searches the list. Items can come from memory or from a data source, and typed text can become a custom tag.`,runover:{},childs:[]});e.controls.add(t)}},1);e.controls.add(n);let r=o(i,{anchor:`import`,title:`Import`,runover:{},childs:[o(t,{code:`
import { TagBox } from '@motifx-community/ui';
import { data } from '@motifx-community/data';
`,runover:{},childs:[]})]});e.controls.add(r);let c=o(i,{anchor:`ways`,title:`Declarative and programmatic`,runover:{},childs:[o(`p`,{initializeComponent:e=>{let t=o(s,{text:"`x-model` binds an array, and every change writes a new one. When you create the component with `new`, set the same properties programmatically.",runover:{},childs:[]});e.controls.add(t)}},1),o(a,{files:N(`Programmatic.tsx`,`skills.ts`),stack:!0,runover:{},childs:[o(D,{runover:{},childs:[]})]})]});e.controls.add(c);let u=o(i,{anchor:`options`,title:`List options`,runover:{},childs:[o(`p`,{initializeComponent:e=>{let t=o(s,{text:`The list stays open during selection, shows selected items as checked, and can include a “Select all” row. Each option is a prop you can bind.`,runover:{},childs:[]});e.controls.add(t)}},1),o(a,{files:N(`TeamList.tsx`),stack:!0,runover:{},childs:[o(j,{runover:{},childs:[]})]})]});e.controls.add(u);let d=o(i,{anchor:`data`,title:`From a data source`,runover:{},childs:[o(`p`,{initializeComponent:e=>{let t=o(s,{text:"With `dataSource`, typed text searches the data source (using its `searchFields`). In `'blocks'` mode, only the visible rows load, and tags for values on unloaded pages are looked up by key. `maxTags` keeps the field compact. This example has 5,000 customers.",runover:{},childs:[]});e.controls.add(t)}},1),o(a,{files:N(`Customers.tsx`),stack:!0,runover:{},childs:[o(w,{runover:{},childs:[]})]})]});e.controls.add(d);let f=o(i,{anchor:`custom`,title:`Custom tags`,runover:{},childs:[o(`p`,{initializeComponent:e=>{let t=o(s,{text:"With `acceptCustomValue`, pressing Enter adds text that matches no item as a tag. `customValue` transforms or rejects it, and `tagTemplate` customizes how a tag is drawn.",runover:{},childs:[]});e.controls.add(t)}},1),o(a,{files:N(`CustomTags.tsx`),runover:{},childs:[o(T,{runover:{},childs:[]})]})]});e.controls.add(f);let p=o(i,{anchor:`validation`,title:`Validation and states`,runover:{},childs:[o(a,{files:N(`Validation.tsx`,`skills.ts`),runover:{},childs:[o(M,{runover:{},childs:[]})]})]});e.controls.add(p);let m=o(i,{anchor:`keyboard`,title:`Keyboard`,runover:{},childs:[o(l,{head:[`Key`,`Description`],rows:R,runover:{},childs:[]})]});e.controls.add(m);let h=o(i,{anchor:`a11y`,title:`Accessibility`,runover:{},childs:[o(l,{head:[`Topic`,`Details`],rows:z,runover:{},childs:[]})]});e.controls.add(h);let g=o(i,{anchor:`i18n`,title:`Localization`,runover:{},childs:[o(`p`,{initializeComponent:e=>{let t=o(s,{text:"The remove buttons (`removeItem`, “Remove {text}”), the “+3” tag (`moreItems`), “Select all”, the buttons and the list text come from `uiLocale.strings`.",runover:{},childs:[]});e.controls.add(t)}},1),o(a,{files:N(`Localization.tsx`,`skills.ts`),runover:{},childs:[o(O,{runover:{},childs:[]})]})]});e.controls.add(g);let _=o(i,{anchor:`styling`,title:`Styling`,runover:{},childs:[o(l,{head:[`Hook`,`Description`],rows:B,runover:{},childs:[]}),o(`h3`,{initializeComponent:e=>{let t=o(s,{text:`Component tokens`,runover:{},childs:[]});e.controls.add(t)}},1),o(l,{head:[`Token`,`Description`],rows:V,runover:{},childs:[]})]});e.controls.add(_);let v=o(i,{anchor:`api`,title:`API reference`,runover:{},childs:[o(`h3`,{initializeComponent:e=>{let t=o(s,{text:`Props`,runover:{},childs:[]});e.controls.add(t)}},1),o(l,{head:[`Prop`,`Type`,`Default`,`Description`],rows:P,runover:{},childs:[]}),o(`h3`,{initializeComponent:e=>{let t=o(s,{text:`Properties`,runover:{},childs:[]});e.controls.add(t)}},1),o(l,{head:[`Property`,`Access`,`Description`],rows:F,runover:{},childs:[]}),o(`h3`,{initializeComponent:e=>{let t=o(s,{text:`Methods`,runover:{},childs:[]});e.controls.add(t)}},1),o(l,{head:[`Method`,`Returns`,`Description`],rows:I,runover:{},childs:[]}),o(`h3`,{initializeComponent:e=>{let t=o(s,{text:`Events`,runover:{},childs:[]});e.controls.add(t)}},1),o(l,{head:[`Event`,`When`],rows:L,runover:{},childs:[]})]});e.controls.add(v)}}})}export{H as default};