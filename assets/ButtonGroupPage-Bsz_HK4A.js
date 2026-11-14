import{Qn as e,Zn as t,er as n}from"./next-id-CtzpBrBT.js";import{t as r}from"./ButtonGroup-D5Vn22Ds.js";import{t as i}from"./Stack-wRt1e9tO.js";import{a,i as o,n as s,r as c,t as l}from"./docs-B_LZlyP5.js";import{t as u}from"./sources-BXVvOiIY.js";var d=`import { ButtonGroup, Stack, type ButtonSize } from '@motifx-community/ui';\r
\r
const SIZES: ButtonSize[] = ['sm', 'md', 'lg'];\r
const ITEMS = ['One', 'Two', { value: 'Three', enabled: false }, 'Four'];\r
\r
/** Each size; apart instead of touching; filling the width; and one button disabled. */\r
export default function Looks() {\r
  return (\r
    <Stack gap="lg">\r
      {SIZES.map((size) => (\r
        <ButtonGroup key={size} label={\`Size \${size}\`} size={size} items={ITEMS} value="Two" />\r
      ))}\r
      <ButtonGroup label="Apart" attached={false} items={ITEMS} value="One" />\r
      <ButtonGroup label="Stretched" stretch items={['Left', 'Center', 'Right']} value="Center" />\r
    </Stack>\r
  );\r
}\r
`,f=`import { reactive } from '@motifx/core';\r
import { ButtonGroup, Stack } from '@motifx-community/ui';\r
\r
/** One choice bound with \`x-model\`, and a group created with \`new\` that accepts the same properties programmatically. */\r
export default function Programmatic() {\r
  const s = reactive({ view: 'Week' as unknown });\r
  const coded = new ButtonGroup({ label: 'Density', items: ['Compact', 'Comfortable'], value: 'Compact' });\r
\r
  return (\r
    <Stack gap="lg">\r
      <ButtonGroup label="View" items={['Day', 'Week', 'Month']} x-model={() => s.view} />\r
      <span>{() => \`View: \${s.view}\`}</span>\r
      <span onConfig={(c) => c.controls.add(coded)} />\r
    </Stack>\r
  );\r
}\r
`,p=`import { reactive } from '@motifx/core';\r
import { ButtonGroup, Stack } from '@motifx-community/ui';\r
\r
const MARKS = [\r
  { value: 'bold', text: 'Bold' },\r
  { value: 'italic', text: 'Italic' },\r
  { value: 'underline', text: 'Underline' },\r
];\r
\r
/** Several on and off (\`multiple\`), and plain actions (\`none\`, \`onItemClick\`). */\r
export default function Selections() {\r
  const s = reactive({ marks: ['bold'] as unknown, last: '' });\r
\r
  return (\r
    <Stack gap="lg">\r
      <ButtonGroup label="Text marks" selection="multiple" items={MARKS} x-model={() => s.marks} />\r
      <span>{() => \`Marks: \${(s.marks as string[]).join(', ') || 'none'}\`}</span>\r
      <ButtonGroup label="Clipboard" selection="none" items={['Cut', 'Copy', 'Paste']} onItemClick={(e) => (s.last = String(e.value))} />\r
      <span>{() => (s.last ? \`Pressed: \${s.last}\` : 'Nothing pressed yet')}</span>\r
    </Stack>\r
  );\r
}\r
`;function m(){let e=n({view:`Week`}),a=new r({label:`Density`,items:[`Compact`,`Comfortable`],value:`Compact`});return t(i,{gap:`lg`,runover:{},childs:[t(r,{label:`View`,items:[`Day`,`Week`,`Month`],runover:{initializeComponent:t=>{t.bindings.model(()=>e.view,t=>{let n=e;n!=null&&typeof n.view!=`function`&&(n.view=t)})}},childs:[]}),t(`span`,{initializeComponent:t=>{t.bindings.method(()=>`View: ${e.view}`)}},1),t(`span`,{onConfig:e=>e.controls.add(a)})]})}var h=[`sm`,`md`,`lg`],g=[`One`,`Two`,{value:`Three`,enabled:!1},`Four`];function _(){return t(i,{gap:`lg`,runover:{},childs:[t({initializeComponent:e=>{e.bindings.list(()=>h??[],e=>t(r,{indexkey:()=>e,label:`Size ${e}`,size:e,items:g,value:`Two`,runover:{},childs:[]}))}}),t(r,{label:`Apart`,attached:!1,items:g,value:`One`,runover:{},childs:[]}),t(r,{label:`Stretched`,stretch:!0,items:[`Left`,`Center`,`Right`],value:`Center`,runover:{},childs:[]})]})}var v=[{value:`bold`,text:`Bold`},{value:`italic`,text:`Italic`},{value:`underline`,text:`Underline`}];function y(){let e=n({marks:[`bold`],last:``});return t(i,{gap:`lg`,runover:{},childs:[t(r,{label:`Text marks`,selection:`multiple`,items:v,runover:{initializeComponent:t=>{t.bindings.model(()=>e.marks,t=>{let n=e;n!=null&&typeof n.marks!=`function`&&(n.marks=t)})}},childs:[]}),t(`span`,{initializeComponent:t=>{t.bindings.method(()=>`Marks: ${e.marks.join(`, `)||`none`}`)}},1),t(r,{label:`Clipboard`,selection:`none`,items:[`Cut`,`Copy`,`Paste`],onItemClick:t=>e.last=String(t.value),runover:{},childs:[]}),t(`span`,{initializeComponent:n=>{n.bindings.ternary(()=>e.last,n=>{n.navigate(t(`text`,{initializeComponent:t=>{t.bindings.add(`textContent`,()=>{if(`Pressed: ${e.last}`!==null&&`Pressed: ${e.last}`!==void 0)return typeof`Pressed: ${e.last}`==`function`?`Pressed: ${e.last}`():()=>`Pressed: ${e.last}`})}},1))},e=>{e.navigate(t(`text`,{initializeComponent:e=>{e.setText(`Nothing pressed yet`)}},1))})}},1)]})}var b=u(Object.assign({"./examples/Looks.tsx":d,"./examples/Programmatic.tsx":f,"./examples/Selections.tsx":p})),x=[[`items`,"`Bind<readonly (ButtonGroupItem<T> | T)[]>`","`[]`","The buttons: `ButtonGroupItem` objects (`value`, `text`, `icon`, `hint`, `enabled`, `visible`), plain values that serve as their own text, or objects of any shape."],[`itemText, itemValue`,"`ItemField`","`'text'`, `'value'`",`The location of the text and value in a custom object: a property name or a function.`],[`selection`,"`Bind<ButtonGroupSelection>`","`'single'`","`single` selects one button, `multiple` toggles each button, and `none` makes them actions only."],[`value`,"`Bind<T | readonly T[] | null>`","`null` / `[]`","The selected value, or an array of the values that are on. `x-model` provides two-way binding, and each change produces a new array."],[`allowEmpty`,"`Bind<boolean>`","`false`","With `single`, pressing the selected button again clears the selection."],[`attached`,"`Bind<boolean>`","Set by the design language (`true`)",`The buttons are attached and share their edges.`],[`variant`,"`Bind<ButtonVariant>`","Set by the design language (`outline`)",`The appearance of every button.`],[`size`,"`Bind<ButtonSize>`","`'md'`","`sm`, `md`, `lg`."],[`stretch`,"`Bind<boolean>`","`false`",`Stretches to the full width, with the buttons sharing it evenly.`],[`label`,"`Bind<string>`","`''`",`The accessible name of the group (“Text alignment”).`],[`enabled, visible`,`see Control`,``,`Properties shared by all controls.`]],S=[[`onValueChanged`,`event`,"Occurs when the value changes (`value`), either through user input or programmatically (`byUser`)."],[`onItemClick`,`event`,"Occurs when a button is pressed (`item`, `value`), with any selection mode."],[`buttons`,`read-only`,`The kit buttons in the group, in item order.`],[`isSelected(value)`,"`boolean`","Indicates whether the button for `value` is selected or on."],[`refresh()`,"`void`",`Re-reads the items after they have been changed in place.`]],C=[[`Tab`,`One Tab stop: the button focused last, otherwise the selected one, otherwise the first.`],[`Arrow keys, Home, End`,`Moves between the buttons, skipping disabled ones.`],[`Space, Enter`,`Presses the button, which selects it, toggles it or runs its action.`]],w=[[`Group`,'`role="group"` with its label.'],[`Buttons`,"Kit buttons. With a selection, each one reports whether it is on (`aria-pressed`). An icon-only button is named by its `hint`."]],T=[[`.mx-button-group`,"The group. `data-attached`, `data-stretch`."],[`.mx-button-group__item`,"Each button (a `.mx-button`)."]],E=[[`button-group.item.*`,"Place: the appearance of each button in a group (`variant`) and of the selected one (`face.*-toggled.*`)."],[`button-group.inner-start.*, button-group.inner-end.*`,`Places: the corners where two buttons meet.`],[`button-group.attached, button-group.gap`,`Whether buttons are attached by default, and the gap between them when they are not.`]];function D(){return e({initializeComponent:e=>{{let n=t(`p`,{initializeComponent:e=>{e.class.add(`lead`);let n=t(c,{text:`A set of related buttons, used as a segmented selection of one or more options or as a row of actions. The buttons are standard kit buttons and are attached by default.`,runover:{},childs:[]});e.controls.add(n)}},1);e.controls.add(n);let r=t(o,{anchor:`import`,title:`Import`,runover:{},childs:[t(a,{code:`
import { ButtonGroup } from '@motifx-community/ui';
`,runover:{},childs:[]})]});e.controls.add(r);let i=t(o,{anchor:`ways`,title:`Declarative and programmatic`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(c,{text:"Every prop accepts a value or a function, and `x-model` provides two-way binding for the value. When you create the component with `new`, set the same properties programmatically.",runover:{},childs:[]});e.controls.add(n)}},1),t(s,{files:b(`Programmatic.tsx`),runover:{},childs:[t(m,{runover:{},childs:[]})]})]});e.controls.add(i);let u=t(o,{anchor:`selections`,title:`Multiple selection and action groups`,runover:{},childs:[t(s,{files:b(`Selections.tsx`),runover:{},childs:[t(y,{runover:{},childs:[]})]})]});e.controls.add(u);let d=t(o,{anchor:`looks`,title:`Sizes and layout`,runover:{},childs:[t(s,{files:b(`Looks.tsx`),runover:{},childs:[t(_,{runover:{},childs:[]})]})]});e.controls.add(d);let f=t(o,{anchor:`keyboard`,title:`Keyboard`,runover:{},childs:[t(l,{head:[`Key`,`Description`],rows:C,runover:{},childs:[]})]});e.controls.add(f);let p=t(o,{anchor:`a11y`,title:`Accessibility`,runover:{},childs:[t(l,{head:[`Topic`,`Details`],rows:w,runover:{},childs:[]})]});e.controls.add(p);let h=t(o,{anchor:`styling`,title:`Styling`,runover:{},childs:[t(l,{head:[`Hook`,`Description`],rows:T,runover:{},childs:[]}),t(`h3`,{initializeComponent:e=>{let n=t(c,{text:`Component tokens`,runover:{},childs:[]});e.controls.add(n)}},1),t(l,{head:[`Token`,`Description`],rows:E,runover:{},childs:[]})]});e.controls.add(h);let g=t(o,{anchor:`api`,title:`API reference`,runover:{},childs:[t(`h3`,{initializeComponent:e=>{let n=t(c,{text:`Props`,runover:{},childs:[]});e.controls.add(n)}},1),t(l,{head:[`Prop`,`Type`,`Default`,`Description`],rows:x,runover:{},childs:[]}),t(`h3`,{initializeComponent:e=>{let n=t(c,{text:`Events, properties and methods`,runover:{},childs:[]});e.controls.add(n)}},1),t(l,{head:[`Member`,`Type`,`Description`],rows:S,runover:{},childs:[]})]});e.controls.add(g)}}})}export{D as default};