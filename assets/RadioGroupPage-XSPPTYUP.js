import{Qn as e,Zn as t,er as n,n as r}from"./next-id-CtzpBrBT.js";import{t as i}from"./RadioGroup-DbpJGVz-.js";import{t as a}from"./ValidationGroup-Cy7KxIFq.js";import{t as o}from"./Stack-wRt1e9tO.js";import{a as s,i as c,n as l,r as u,t as d}from"./docs-B_LZlyP5.js";import{t as f}from"./sources-BXVvOiIY.js";var p=`import { reactive } from '@motifx/core';\r
import { Button, RadioGroup, Stack } from '@motifx-community/ui';\r
\r
interface Plan {\r
  id: number;\r
  name: string;\r
  price: number;\r
}\r
\r
/** Options from a list of custom objects. After adding or changing some in place, \`refresh()\` shows them. */\r
export default function FromData() {\r
  const s = reactive({ plan: 2 as number | null });\r
  const plans = reactive<Plan[]>([\r
    { id: 1, name: 'Free', price: 0 },\r
    { id: 2, name: 'Pro', price: 12 },\r
    { id: 3, name: 'Team', price: 30 },\r
  ]);\r
\r
  let group!: RadioGroup<number>;\r
  const addPlan = () => {\r
    plans.push({ id: plans.length + 1, name: \`Plan \${plans.length + 1}\`, price: plans.length * 20 });\r
    group.refresh();\r
  };\r
  const raisePrices = () => {\r
    for (const p of plans) p.price += 1;\r
    group.refresh();\r
  };\r
\r
  return (\r
    <>\r
      <RadioGroup\r
        ref={(g: RadioGroup<number>) => (group = g)}\r
        label="&Plan"\r
        class="rg-plans"\r
        items={() => plans}\r
        itemText={(p) => \`\${(p as Plan).name} — \${(p as Plan).price} €\`}\r
        itemValue="id"\r
        x-model={() => s.plan}\r
      />\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Button text="Add a plan" variant="outline" enabled={() => plans.length < 6} onclick={addPlan} />\r
        <Button text="Raise prices" variant="outline" onclick={raisePrices} />\r
        <output class="rg-plan">{() => \`value: \${String(s.plan)}\`}</output>\r
      </Stack>\r
    </>\r
  );\r
}\r
`,m=`import { reactive } from '@motifx/core';\r
import { Button, RadioGroup, Stack, type RadioGroupOrientation } from '@motifx-community/ui';\r
\r
const ORIENTATIONS: RadioGroupOrientation[] = ['vertical', 'horizontal'];\r
const COLUMNS = [0, 2, 4];\r
const COLORS = ['red', 'orange', 'yellow', 'green', 'teal', 'blue', 'indigo', 'violet'];\r
\r
/** Options one under the other or side by side, and in columns. */\r
export default function Layout() {\r
  const s = reactive({ orientation: 'vertical' as RadioGroupOrientation, columns: 0, color: 'teal' as string | null });\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Layout">\r
        {ORIENTATIONS.map((o) => (\r
          <Button\r
            key={o}\r
            text={o}\r
            size="sm"\r
            variant={() => (s.orientation === o ? 'solid' : 'ghost')}\r
            aria-pressed={() => s.orientation === o}\r
            onclick={() => (s.orientation = o)}\r
          />\r
        ))}\r
        {COLUMNS.map((n) => (\r
          <Button\r
            key={\`c\${n}\`}\r
            text={n ? \`\${n} columns\` : 'no grid'}\r
            size="sm"\r
            variant={() => (s.columns === n ? 'solid' : 'ghost')}\r
            aria-pressed={() => s.columns === n}\r
            onclick={() => (s.columns = n)}\r
          />\r
        ))}\r
      </Stack>\r
      <RadioGroup label="&Color" class="rg-colors" items={COLORS} orientation={() => s.orientation} columns={() => s.columns} x-model={() => s.color} />\r
    </>\r
  );\r
}\r
`,h=`import { reactive } from '@motifx/core';\r
import { Button, RadioGroup, type RadioItem } from '@motifx-community/ui';\r
\r
/** Options with their own help line and hint, and one that is enabled only while state allows it. */\r
export default function OptionDetails() {\r
  const s = reactive({ shipping: 'std' as string | null, expressOpen: false });\r
  const shipping: RadioItem<string>[] = [\r
    { value: 'std', text: 'Standard', helpText: '3–5 working days', hint: 'Free over 50 €' },\r
    { value: 'exp', text: 'Express', helpText: () => (s.expressOpen ? 'Tomorrow' : 'Not before the weekend'), enabled: () => s.expressOpen },\r
    { value: 'pick', text: 'Pick up in store', helpText: 'Ready in 2 hours' },\r
  ];\r
\r
  return (\r
    <>\r
      <Button text={() => (s.expressOpen ? 'Close express' : 'Open express')} variant="outline" onclick={() => (s.expressOpen = !s.expressOpen)} />\r
      <RadioGroup label="S&hipping" class="rg-shipping" items={shipping} x-model={() => s.shipping} />\r
    </>\r
  );\r
}\r
`,g=`import { reactive } from '@motifx/core';\r
import { Button, RadioGroup, Stack } from '@motifx-community/ui';\r
\r
/** A group of plain values bound with x-model, and a group created with \`new\` and added programmatically. */\r
export default function Programmatic() {\r
  const s = reactive({ size: 'M' as string | null, result: '' });\r
  let host: Stack | null = null;\r
\r
  const addProgrammatic = () => {\r
    const wrap = new RadioGroup<string>({ label: 'Gift wrap', orientation: 'horizontal', items: ['None', 'Paper', 'Box'], value: 'None' });\r
    wrap.onValueChanged((e) => (s.result = \`Gift wrap: \${e.value}\`));\r
    host?.controls.add(wrap);\r
    wrap.focus();\r
  };\r
\r
  return (\r
    <>\r
      <RadioGroup label="&Size" items={['S', 'M', 'L', 'XL']} x-model={() => s.size} helpText={() => \`Chosen: \${s.size ?? 'nothing'}\`} />\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Button text="Add a group programmatically" variant="outline" onclick={addProgrammatic} />\r
        <output class="rg-result">{() => s.result}</output>\r
      </Stack>\r
      <Stack orientation="horizontal" wrap align="center" ref={(c: Stack) => (host = c)} />\r
    </>\r
  );\r
}\r
`,_=`import { RadioGroup, type ControlSize } from '@motifx-community/ui';\r
\r
const SIZES: ControlSize[] = ['sm', 'md', 'lg'];\r
\r
/** A group in each size. */\r
export default function Sizes() {\r
  return (\r
    <>\r
      {SIZES.map((size) => (\r
        <RadioGroup key={size} label={size} size={size} items={['One', 'Two']} value="Two" />\r
      ))}\r
    </>\r
  );\r
}\r
`,v=`import { reactive } from '@motifx/core';\r
import { Button, RadioGroup, Stack, ValidationGroup } from '@motifx-community/ui';\r
\r
/** A required choice validated with its group, and read-only and disabled groups that follow state. */\r
export default function States() {\r
  const s = reactive({ payment: null as string | null, editable: true, result: '' });\r
  const group = new ValidationGroup();\r
\r
  const pay = async () => {\r
    s.result = (await group.validate()).valid ? 'Paid.' : 'Choose a payment.';\r
  };\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center">\r
        <RadioGroup label="Pa&yment" orientation="horizontal" required validationGroup={group} items={['Card', 'Transfer', 'Cash']} x-model={() => s.payment} />\r
        <Button text="Pay" tone="accent" onclick={pay} />\r
        <output>{() => s.result}</output>\r
      </Stack>\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Button text="Toggle" variant="outline" onclick={() => (s.editable = !s.editable)} />\r
        <RadioGroup label="Read-only" readOnly={() => !s.editable} items={['Free', 'Pro']} value="Pro" />\r
        <RadioGroup label="Disabled" enabled={() => s.editable} items={['Free', 'Pro']} value="Pro" />\r
      </Stack>\r
    </>\r
  );\r
}\r
`;function y(){let a=n({size:`M`,result:``}),s=null,c=()=>{let e=new i({label:`Gift wrap`,orientation:`horizontal`,items:[`None`,`Paper`,`Box`],value:`None`});e.onValueChanged(e=>a.result=`Gift wrap: ${e.value}`),s?.controls.add(e),e.focus()};return e({initializeComponent:e=>{{let n=t(i,{label:`&Size`,items:[`S`,`M`,`L`,`XL`],helpText:()=>`Chosen: ${a.size??`nothing`}`,runover:{initializeComponent:e=>{e.bindings.model(()=>a.size,e=>{let t=a;t!=null&&typeof t.size!=`function`&&(t.size=e)})}},childs:[]});e.controls.add(n);let l=t(o,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[t(r,{text:`Add a group programmatically`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,c)}},childs:[]}),t(`output`,{initializeComponent:e=>{e.class.add(`rg-result`),e.bindings.method(()=>a.result)}},1)]});e.controls.add(l);let u=t(o,{orientation:`horizontal`,wrap:!0,align:`center`,ref:e=>s=e,runover:{},childs:[]});e.controls.add(u)}}})}function b(){let a=n({plan:2}),s=n([{id:1,name:`Free`,price:0},{id:2,name:`Pro`,price:12},{id:3,name:`Team`,price:30}]),c,l=()=>{s.push({id:s.length+1,name:`Plan ${s.length+1}`,price:s.length*20}),c.refresh()},u=()=>{for(let e of s)e.price+=1;c.refresh()};return e({initializeComponent:e=>{{let n=t(i,{label:`&Plan`,class:`rg-plans`,items:()=>s,itemText:e=>`${e.name} — ${e.price} €`,itemValue:`id`,ref:e=>c=e,runover:{initializeComponent:e=>{e.bindings.model(()=>a.plan,e=>{let t=a;t!=null&&typeof t.plan!=`function`&&(t.plan=e)})}},childs:[]});e.controls.add(n);let d=t(o,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[t(r,{text:`Add a plan`,variant:`outline`,enabled:()=>s.length<6,runover:{initializeComponent:e=>{e.motif.on(`click`,l)}},childs:[]}),t(r,{text:`Raise prices`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,u)}},childs:[]}),t(`output`,{initializeComponent:e=>{e.class.add(`rg-plan`),e.bindings.method(()=>`value: ${String(a.plan)}`)}},1)]});e.controls.add(d)}}})}var x=[`vertical`,`horizontal`],S=[0,2,4],C=[`red`,`orange`,`yellow`,`green`,`teal`,`blue`,`indigo`,`violet`];function w(){let a=n({orientation:`vertical`,columns:0,color:`teal`});return e({initializeComponent:e=>{{let n=t(o,{orientation:`horizontal`,wrap:!0,align:`center`,role:`group`,"aria-label":`Layout`,runover:{},childs:[t({initializeComponent:e=>{e.bindings.list(()=>x??[],e=>t(r,{indexkey:()=>e,text:e,size:`sm`,variant:()=>a.orientation===e?`solid`:`ghost`,"aria-pressed":()=>a.orientation===e,runover:{initializeComponent:t=>{t.motif.on(`click`,()=>a.orientation=e)}},childs:[]}))}}),t({initializeComponent:e=>{e.bindings.list(()=>S??[],e=>t(r,{indexkey:()=>`c${e}`,text:()=>e?`${e} columns`:`no grid`,size:`sm`,variant:()=>a.columns===e?`solid`:`ghost`,"aria-pressed":()=>a.columns===e,runover:{initializeComponent:t=>{t.motif.on(`click`,()=>a.columns=e)}},childs:[]}))}})]});e.controls.add(n);let s=t(i,{label:`&Color`,class:`rg-colors`,items:C,orientation:()=>a.orientation,columns:()=>a.columns,runover:{initializeComponent:e=>{e.bindings.model(()=>a.color,e=>{let t=a;t!=null&&typeof t.color!=`function`&&(t.color=e)})}},childs:[]});e.controls.add(s)}}})}function T(){let a=n({shipping:`std`,expressOpen:!1}),o=[{value:`std`,text:`Standard`,helpText:`3–5 working days`,hint:`Free over 50 €`},{value:`exp`,text:`Express`,helpText:()=>a.expressOpen?`Tomorrow`:`Not before the weekend`,enabled:()=>a.expressOpen},{value:`pick`,text:`Pick up in store`,helpText:`Ready in 2 hours`}];return e({initializeComponent:e=>{{let n=t(r,{text:()=>a.expressOpen?`Close express`:`Open express`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,()=>a.expressOpen=!a.expressOpen)}},childs:[]});e.controls.add(n);let s=t(i,{label:`S&hipping`,class:`rg-shipping`,items:o,runover:{initializeComponent:e=>{e.bindings.model(()=>a.shipping,e=>{let t=a;t!=null&&typeof t.shipping!=`function`&&(t.shipping=e)})}},childs:[]});e.controls.add(s)}}})}var E=[`sm`,`md`,`lg`];function D(){return e({initializeComponent:e=>{e.bindings.list(()=>E??[],e=>t(i,{indexkey:()=>e,label:e,size:e,items:[`One`,`Two`],value:`Two`,runover:{},childs:[]}))}})}function O(){let s=n({payment:null,editable:!0,result:``}),c=new a,l=async()=>{s.result=(await c.validate()).valid?`Paid.`:`Choose a payment.`};return e({initializeComponent:e=>{{let n=t(o,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[t(i,{label:`Pa&yment`,orientation:`horizontal`,required:!0,validationGroup:c,items:[`Card`,`Transfer`,`Cash`],runover:{initializeComponent:e=>{e.bindings.model(()=>s.payment,e=>{let t=s;t!=null&&typeof t.payment!=`function`&&(t.payment=e)})}},childs:[]}),t(r,{text:`Pay`,tone:`accent`,runover:{initializeComponent:e=>{e.motif.on(`click`,l)}},childs:[]}),t(`output`,{initializeComponent:e=>{e.bindings.method(()=>s.result)}},1)]});e.controls.add(n);let a=t(o,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[t(r,{text:`Toggle`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,()=>s.editable=!s.editable)}},childs:[]}),t(i,{label:`Read-only`,readOnly:()=>!s.editable,items:[`Free`,`Pro`],value:`Pro`,runover:{},childs:[]}),t(i,{label:`Disabled`,enabled:()=>s.editable,items:[`Free`,`Pro`],value:`Pro`,runover:{},childs:[]})]});e.controls.add(a)}}})}var k=f(Object.assign({"./examples/FromData.tsx":p,"./examples/Layout.tsx":m,"./examples/OptionDetails.tsx":h,"./examples/Programmatic.tsx":g,"./examples/Sizes.tsx":_,"./examples/States.tsx":v})),A=[[`value`,"`Bind<T | null>`","`null`","The value of the selected item, or `null` if none is selected. `x-model` provides two-way binding."],[`items`,"`Bind<readonly (RadioItem<T> | T)[]>`","`[]`","The options. A function is tracked, so a new list appears immediately. Items changed in place appear after `refresh()`."],[`itemText`,"`string | (item) => unknown`","`'text'`",`Where a custom object stores its text. This is a reader, not a binding.`],[`itemValue`,"`string | (item) => T`","`'value'`",`Where an item stores its value. An object without one serves as its own value.`],[`label`,"`Bind<string>`","`''`","The group label. Writing `&Name` makes Alt+N move focus to the group. This is the same property as `text`."],[`labelMode`,"`Bind<FieldLabelMode>`","`'top'`","`top`, `side` (next to the options) or `hidden` (for screen readers only)."],[`orientation`,"`Bind<RadioGroupOrientation>`","`'vertical'`","`vertical` stacks the options, and `horizontal` places them side by side and wraps."],[`columns`,"`Bind<number>`","`0`",`Arranges the options in a grid with this many columns (down the columns when vertical, across when horizontal).`],[`helpText`,"`Bind<string>`","`''`",`Help text shown below the group. An error message replaces it.`],[`hint`,"`Bind<string>`","`''`",`A tooltip on the group.`],[`readOnly`,"`Bind<boolean>`","`false`",`The arrow keys move between options, but nothing can be selected.`],[`required`,"`Bind<boolean>`","`false`",`An option must be selected.`],[`size`,"`Bind<ControlSize>`","`'md'`","`sm`, `md`, `lg`; the row height follows the density tokens."],[`name`,"`Bind<string>`",`Generated`,`The name the radios submit with the form.`],[`rules, error, validateOn, validationGroup`,`see Field`,``,`Validation works the same way as for all fields.`],[`enabled / disabled, visible, tabStop, tabIndex`,`see Control`,``,`Properties shared by all controls.`]],j=[[`value`,"`T`","The value of `value` when this option is selected."],[`text`,"`Bind<string>`",`Shown next to the circle. By default, this is the value as text.`],[`hint`,"`Bind<string>`",`The tooltip text.`],[`helpText`,"`Bind<string>`",`A smaller line below the text that describes the radio.`],[`enabled`,"`Bind<boolean>`","`false` dims the option, and the arrow keys skip it."],[`visible`,"`Bind<boolean>`","`false` removes the option."]],M=[[`every prop above`,`read/write, reactive`,`Accepts a value or a function, the same as the prop.`],[`isValid, validationMessage, validating`,`read-only, reactive`,`The result of the last validation.`],[`listPart`,`read-only`,'The part with `role="radiogroup"`.'],[`inputParts`,`read-only`,`The native radios as components, in item order.`]],N=[[`focus()`,"`boolean`",`Sets focus on the selected option, or on the first available one.`],[`validate()`,"`Promise<boolean>`",`Validates the value and displays the result.`],[`resetValidation()`,"`void`",`Clears the results of previous validation.`],[`refresh()`,"`void`","Your items can be plain or reactive, and the group reads them as they are. After changing them in place, call `refresh()`. Their text, values and states are read again, and focus stays where it is."]],P=[[`onValueChanged(e)`,"Occurs when the value changes. `e`: `{ value, previousValue, byUser, source, event? }`."],[`onValidated(e)`,"Occurs when validation finishes. `e`: `{ valid, message, source }`."],[`onchange, onkeydown, onfocusin, onfocusout`,`DOM events from the radios bubble up to the group.`]],F=[[`Tab`,`Moves focus into the group, on the selected option or the first available one. The next Tab leaves the group.`],[`↓ / →`,`Moves to the next option and selects it, wrapping from last to first and skipping disabled and hidden options.`],[`↑ / ←`,`Moves the same way, backward. On right-to-left pages, ← and → are swapped.`],[`Space`,`Selects the focused option.`],["Alt + key (`&Name`)",`Moves focus to the group (Control + Option + key on Apple platforms).`]],I=[[`Group`,'`role="radiogroup"` named by the field label (`aria-labelledby`), with `aria-orientation`, `aria-required`, `aria-readonly`, `aria-invalid`, and `aria-describedby` for the help text.'],[`Options`,'Native `<input type="radio">` elements sharing a name, each inside its own `<label>` and drawn with `appearance: none`.'],[`Help text`,"An option's `helpText` sits outside its label and is linked with `aria-describedby`, so it is not part of the option's name."],[`Disabled options`,"Native `disabled`: skipped by the keyboard and announced as unavailable."],[`Focus`,`One Tab stop, with the design system focus ring shown only during keyboard use.`]],L=[[`.mx-radio-group`,"The field. `data-orientation`, `data-columns`, `data-size`, `data-invalid`, `data-readonly`, `data-disabled`, `data-required`."],[`.mx-radio-group__list`,"The `radiogroup` element. `columns` sets `--_columns` and `--_rows` on it."],[`.mx-radio-group__item, .mx-radio-group__label`,`An option, and the label that holds its radio and text.`],[`.mx-radio-group__input, .mx-radio-group__text, .mx-radio-group__help`,`The radio, its text and its help text.`]],R=[[`radiogroup.circle, radiogroup.dot`,"Units: the circle in every state (`checked`, `invalid`, `hover`, `pressed`, `focus` and their combinations, `disabled`), and the dot of the selected option (`checked`, `pressed`, `disabled`)."],[`radiogroup.row, radiogroup.text, radiogroup.help`,"Units: an option's row (`hover`, `checked`, `disabled`), its text and its help text."],[`radiogroup.halo, radiogroup.ring`,`Units: a halo centered on the circle and a ring around an option during keyboard use, where the design language includes them.`],[`radiogroup.options, radiogroup.floating-label`,`Units: the options as a group, and the group label when it floats.`],[`radiogroup.size.*, radiogroup.dot-size.*, radiogroup.dot-size-hover.*, radiogroup.dot-size-pressed.*`,`The circle and the dot, per size and state.`],[`radiogroup.height.*, radiogroup.font-size.*`,`Row height (density tokens) and text size.`],[`radiogroup.gap, radiogroup.column-gap, radiogroup.help-gap`,`The space before the text, between side-by-side options, and above an option's help text.`],[`radiogroup.press-offset, radiogroup.focus-scope`,`The distance the circle moves when pressed, and what the keyboard ring surrounds.`]];function z(){return e({initializeComponent:e=>{{let n=t(`p`,{initializeComponent:e=>{e.class.add(`lead`);let n=t(u,{text:`A set of mutually exclusive options. Options can come from plain values, custom objects or a live list, and can be arranged vertically, horizontally or in columns. Individual options can be disabled, hidden or given help text. The group is a single Tab stop, and the arrow keys move between options.`,runover:{},childs:[]});e.controls.add(n)}},1);e.controls.add(n);let r=t(c,{anchor:`import`,title:`Import`,runover:{},childs:[t(s,{code:`
import { RadioGroup, type RadioItem } from '@motifx-community/ui';
`,runover:{},childs:[]})]});e.controls.add(r);let i=t(c,{anchor:`ways`,title:`Declarative and programmatic`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(u,{text:"A plain value serves as its own text. `x-model` provides two-way binding for the selected value. When you create the component with `new`, set the same properties programmatically.",runover:{},childs:[]});e.controls.add(n)}},1),t(l,{files:k(`Programmatic.tsx`),stack:!0,runover:{},childs:[t(y,{runover:{},childs:[]})]})]});e.controls.add(i);let a=t(c,{anchor:`data`,title:`Binding to data`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(u,{text:"Custom objects use `itemText` and `itemValue`, each a property name or a function. Items can be plain or reactive and are read as they are. After adding, removing or renaming items in place, call `refresh()` to update the display, which preserves focus and selection.",runover:{},childs:[]});e.controls.add(n)}},1),t(l,{files:k(`FromData.tsx`),stack:!0,runover:{},childs:[t(b,{runover:{},childs:[]})]})]});e.controls.add(a);let o=t(c,{anchor:`items`,title:`Disabled options, help text and hints`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(u,{text:"A `RadioItem` has its own `enabled`, `visible`, `hint` and `helpText`, each a value or a function. The arrow keys skip options that cannot be selected.",runover:{},childs:[]});e.controls.add(n)}},1),t(l,{files:k(`OptionDetails.tsx`),stack:!0,runover:{},childs:[t(T,{runover:{},childs:[]})]})]});e.controls.add(o);let f=t(c,{anchor:`layout`,title:`Orientation and columns`,runover:{},childs:[t(l,{files:k(`Layout.tsx`),stack:!0,runover:{},childs:[t(w,{runover:{},childs:[]})]})]});e.controls.add(f);let p=t(c,{anchor:`sizes`,title:`Sizes`,runover:{},childs:[t(l,{files:k(`Sizes.tsx`),runover:{},childs:[t(D,{runover:{},childs:[]})]})]});e.controls.add(p);let m=t(c,{anchor:`validation`,title:`Required, read-only, disabled`,runover:{},childs:[t(l,{files:k(`States.tsx`),stack:!0,runover:{},childs:[t(O,{runover:{},childs:[]})]})]});e.controls.add(m);let h=t(c,{anchor:`keyboard`,title:`Keyboard`,runover:{},childs:[t(d,{head:[`Key`,`Description`],rows:F,runover:{},childs:[]})]});e.controls.add(h);let g=t(c,{anchor:`a11y`,title:`Accessibility`,runover:{},childs:[t(d,{head:[`Topic`,`Details`],rows:I,runover:{},childs:[]})]});e.controls.add(g);let _=t(c,{anchor:`i18n`,title:`Localization`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(u,{text:"The group has no strings of its own. The option text is yours, and functions of your language state work. The `required` message comes from `uiLocale.strings`.",runover:{},childs:[]});e.controls.add(n)}},1)]});e.controls.add(_);let v=t(c,{anchor:`styling`,title:`Styling`,runover:{},childs:[t(d,{head:[`Hook`,`Description`],rows:L,runover:{},childs:[]}),t(`h3`,{initializeComponent:e=>{let n=t(u,{text:`Component tokens`,runover:{},childs:[]});e.controls.add(n)}},1),t(d,{head:[`Token`,`Description`],rows:R,runover:{},childs:[]})]});e.controls.add(v);let x=t(c,{anchor:`api`,title:`API reference`,runover:{},childs:[t(`h3`,{initializeComponent:e=>{let n=t(u,{text:`Props`,runover:{},childs:[]});e.controls.add(n)}},1),t(d,{head:[`Prop`,`Type`,`Default`,`Description`],rows:A,runover:{},childs:[]}),t(`h3`,{initializeComponent:e=>{let n=t(u,{text:`RadioItem`,runover:{},childs:[]});e.controls.add(n)}},1),t(d,{head:[`Field`,`Type`,`Description`],rows:j,runover:{},childs:[]}),t(`h3`,{initializeComponent:e=>{let n=t(u,{text:`Properties`,runover:{},childs:[]});e.controls.add(n)}},1),t(d,{head:[`Property`,`Access`,`Description`],rows:M,runover:{},childs:[]}),t(`h3`,{initializeComponent:e=>{let n=t(u,{text:`Methods`,runover:{},childs:[]});e.controls.add(n)}},1),t(d,{head:[`Method`,`Returns`,`Description`],rows:N,runover:{},childs:[]}),t(`h3`,{initializeComponent:e=>{let n=t(u,{text:`Events`,runover:{},childs:[]});e.controls.add(n)}},1),t(d,{head:[`Event`,`When`],rows:P,runover:{},childs:[]})]});e.controls.add(x)}}})}export{z as default};