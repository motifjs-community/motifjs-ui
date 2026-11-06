import{a as e,an as t,h as n,i as r,n as i,nn as a,r as o,rn as s,t as c}from"./doc-B1CtlCkV.js";import{t as l}from"./RadioGroup-BPy730Z_.js";import{t as u}from"./Stack-AS0iyAxC.js";import{t as d}from"./ValidationGroup-T1woV0-X.js";import{t as f}from"./sources-BXVvOiIY.js";var p=`import { reactive } from '@motifx/core';\r
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
`;function y(){let e=t({size:`M`,result:``}),r=null,i=()=>{let t=new l({label:`Gift wrap`,orientation:`horizontal`,items:[`None`,`Paper`,`Box`],value:`None`});t.onValueChanged(t=>e.result=`Gift wrap: ${t.value}`),r?.controls.add(t),t.focus()};return s({initializeComponent:t=>{{let o=a(l,{label:`&Size`,items:[`S`,`M`,`L`,`XL`],helpText:()=>`Chosen: ${e.size??`nothing`}`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.size,t=>{let n=e;n!=null&&typeof n.size!=`function`&&(n.size=t)})}},childs:[]});t.controls.add(o);let s=a(u,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[a(n,{text:`Add a group programmatically`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,i)}},childs:[]}),a(`output`,{initializeComponent:t=>{t.class.add(`rg-result`),t.bindings.method(()=>e.result)}},1)]});t.controls.add(s);let c=a(u,{orientation:`horizontal`,wrap:!0,align:`center`,ref:e=>r=e,runover:{},childs:[]});t.controls.add(c)}}})}function b(){let e=t({plan:2}),r=t([{id:1,name:`Free`,price:0},{id:2,name:`Pro`,price:12},{id:3,name:`Team`,price:30}]),i,o=()=>{r.push({id:r.length+1,name:`Plan ${r.length+1}`,price:r.length*20}),i.refresh()},c=()=>{for(let e of r)e.price+=1;i.refresh()};return s({initializeComponent:t=>{{let s=a(l,{label:`&Plan`,class:`rg-plans`,items:()=>r,itemText:e=>`${e.name} — ${e.price} €`,itemValue:`id`,ref:e=>i=e,runover:{initializeComponent:t=>{t.bindings.model(()=>e.plan,t=>{let n=e;n!=null&&typeof n.plan!=`function`&&(n.plan=t)})}},childs:[]});t.controls.add(s);let d=a(u,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[a(n,{text:`Add a plan`,variant:`outline`,enabled:()=>r.length<6,runover:{initializeComponent:e=>{e.motif.on(`click`,o)}},childs:[]}),a(n,{text:`Raise prices`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,c)}},childs:[]}),a(`output`,{initializeComponent:t=>{t.class.add(`rg-plan`),t.bindings.method(()=>`value: ${String(e.plan)}`)}},1)]});t.controls.add(d)}}})}var x=[`vertical`,`horizontal`],S=[0,2,4],C=[`red`,`orange`,`yellow`,`green`,`teal`,`blue`,`indigo`,`violet`];function w(){let e=t({orientation:`vertical`,columns:0,color:`teal`});return s({initializeComponent:t=>{{let r=a(u,{orientation:`horizontal`,wrap:!0,align:`center`,role:`group`,"aria-label":`Layout`,runover:{},childs:[a({initializeComponent:t=>{t.bindings.list(()=>x??[],t=>a(n,{indexkey:()=>t,text:t,size:`sm`,variant:()=>e.orientation===t?`solid`:`ghost`,"aria-pressed":()=>e.orientation===t,runover:{initializeComponent:n=>{n.motif.on(`click`,()=>e.orientation=t)}},childs:[]}))}}),a({initializeComponent:t=>{t.bindings.list(()=>S??[],t=>a(n,{indexkey:()=>`c${t}`,text:()=>t?`${t} columns`:`no grid`,size:`sm`,variant:()=>e.columns===t?`solid`:`ghost`,"aria-pressed":()=>e.columns===t,runover:{initializeComponent:n=>{n.motif.on(`click`,()=>e.columns=t)}},childs:[]}))}})]});t.controls.add(r);let i=a(l,{label:`&Color`,class:`rg-colors`,items:C,orientation:()=>e.orientation,columns:()=>e.columns,runover:{initializeComponent:t=>{t.bindings.model(()=>e.color,t=>{let n=e;n!=null&&typeof n.color!=`function`&&(n.color=t)})}},childs:[]});t.controls.add(i)}}})}function T(){let e=t({shipping:`std`,expressOpen:!1}),r=[{value:`std`,text:`Standard`,helpText:`3–5 working days`,hint:`Free over 50 €`},{value:`exp`,text:`Express`,helpText:()=>e.expressOpen?`Tomorrow`:`Not before the weekend`,enabled:()=>e.expressOpen},{value:`pick`,text:`Pick up in store`,helpText:`Ready in 2 hours`}];return s({initializeComponent:t=>{{let i=a(n,{text:()=>e.expressOpen?`Close express`:`Open express`,variant:`outline`,runover:{initializeComponent:t=>{t.motif.on(`click`,()=>e.expressOpen=!e.expressOpen)}},childs:[]});t.controls.add(i);let o=a(l,{label:`S&hipping`,class:`rg-shipping`,items:r,runover:{initializeComponent:t=>{t.bindings.model(()=>e.shipping,t=>{let n=e;n!=null&&typeof n.shipping!=`function`&&(n.shipping=t)})}},childs:[]});t.controls.add(o)}}})}var E=[`sm`,`md`,`lg`];function D(){return s({initializeComponent:e=>{e.bindings.list(()=>E??[],e=>a(l,{indexkey:()=>e,label:e,size:e,items:[`One`,`Two`],value:`Two`,runover:{},childs:[]}))}})}function O(){let e=t({payment:null,editable:!0,result:``}),r=new d,i=async()=>{e.result=(await r.validate()).valid?`Paid.`:`Choose a payment.`};return s({initializeComponent:t=>{{let o=a(u,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[a(l,{label:`Pa&yment`,orientation:`horizontal`,required:!0,validationGroup:r,items:[`Card`,`Transfer`,`Cash`],runover:{initializeComponent:t=>{t.bindings.model(()=>e.payment,t=>{let n=e;n!=null&&typeof n.payment!=`function`&&(n.payment=t)})}},childs:[]}),a(n,{text:`Pay`,tone:`accent`,runover:{initializeComponent:e=>{e.motif.on(`click`,i)}},childs:[]}),a(`output`,{initializeComponent:t=>{t.bindings.method(()=>e.result)}},1)]});t.controls.add(o);let s=a(u,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[a(n,{text:`Toggle`,variant:`outline`,runover:{initializeComponent:t=>{t.motif.on(`click`,()=>e.editable=!e.editable)}},childs:[]}),a(l,{label:`Read-only`,readOnly:()=>!e.editable,items:[`Free`,`Pro`],value:`Pro`,runover:{},childs:[]}),a(l,{label:`Disabled`,enabled:()=>e.editable,items:[`Free`,`Pro`],value:`Pro`,runover:{},childs:[]})]});t.controls.add(s)}}})}var k=f(Object.assign({"./examples/FromData.tsx":p,"./examples/Layout.tsx":m,"./examples/OptionDetails.tsx":h,"./examples/Programmatic.tsx":g,"./examples/Sizes.tsx":_,"./examples/States.tsx":v})),A=[[`value`,"`Bind<T | null>`","`null`","The value of the selected item, or `null` if none is selected. `x-model` provides two-way binding."],[`items`,"`Bind<readonly (RadioItem<T> | T)[]>`","`[]`","The options. A function is tracked, so a new list appears immediately. Items changed in place appear after `refresh()`."],[`itemText`,"`string | (item) => unknown`","`'text'`",`Where a custom object stores its text. This is a reader, not a binding.`],[`itemValue`,"`string | (item) => T`","`'value'`",`Where an item stores its value. An object without one serves as its own value.`],[`label`,"`Bind<string>`","`''`","The group label. Writing `&Name` makes Alt+N move focus to the group. This is the same property as `text`."],[`labelMode`,"`Bind<FieldLabelMode>`","`'top'`","`top`, `side` (next to the options) or `hidden` (for screen readers only)."],[`orientation`,"`Bind<RadioGroupOrientation>`","`'vertical'`","`vertical` stacks the options, and `horizontal` places them side by side and wraps."],[`columns`,"`Bind<number>`","`0`",`Arranges the options in a grid with this many columns (down the columns when vertical, across when horizontal).`],[`helpText`,"`Bind<string>`","`''`",`Help text shown below the group. An error message replaces it.`],[`hint`,"`Bind<string>`","`''`",`A tooltip on the group.`],[`readOnly`,"`Bind<boolean>`","`false`",`The arrow keys move between options, but nothing can be selected.`],[`required`,"`Bind<boolean>`","`false`",`An option must be selected.`],[`size`,"`Bind<ControlSize>`","`'md'`","`sm`, `md`, `lg`; the row height follows the density tokens."],[`name`,"`Bind<string>`",`Generated`,`The name the radios submit with the form.`],[`rules, error, validateOn, validationGroup`,`see Field`,``,`Validation works the same way as for all fields.`],[`enabled / disabled, visible, tabStop, tabIndex`,`see Control`,``,`Properties shared by all controls.`]],j=[[`value`,"`T`","The value of `value` when this option is selected."],[`text`,"`Bind<string>`",`Shown next to the circle. By default, this is the value as text.`],[`hint`,"`Bind<string>`",`The tooltip text.`],[`helpText`,"`Bind<string>`",`A smaller line below the text that describes the radio.`],[`enabled`,"`Bind<boolean>`","`false` dims the option, and the arrow keys skip it."],[`visible`,"`Bind<boolean>`","`false` removes the option."]],M=[[`every prop above`,`read/write, reactive`,`Accepts a value or a function, the same as the prop.`],[`isValid, validationMessage, validating`,`read-only, reactive`,`The result of the last validation.`],[`listElement`,`read-only`,'The element with `role="radiogroup"`.'],[`inputs`,`read-only`,`The native radios, in item order.`]],N=[[`focus()`,"`boolean`",`Sets focus on the selected option, or on the first available one.`],[`validate()`,"`Promise<boolean>`",`Validates the value and displays the result.`],[`resetValidation()`,"`void`",`Clears the results of previous validation.`],[`refresh()`,"`void`","Your items can be plain or reactive, and the group reads them as they are. After changing them in place, call `refresh()`. Their text, values and states are read again, and focus stays where it is."]],P=[[`onValueChanged(e)`,"Occurs when the value changes. `e`: `{ value, previousValue, byUser, source, event? }`."],[`onValidated(e)`,"Occurs when validation finishes. `e`: `{ valid, message, source }`."],[`onchange, onkeydown, onfocusin, onfocusout`,`DOM events from the radios bubble up to the group.`]],F=[[`Tab`,`Moves focus into the group, on the selected option or the first available one. The next Tab leaves the group.`],[`↓ / →`,`Moves to the next option and selects it, wrapping from last to first and skipping disabled and hidden options.`],[`↑ / ←`,`Moves the same way, backward. On right-to-left pages, ← and → are swapped.`],[`Space`,`Selects the focused option.`],["Alt + key (`&Name`)",`Moves focus to the group (Control + Option + key on Apple platforms).`]],I=[[`Group`,'`role="radiogroup"` named by the field label (`aria-labelledby`), with `aria-orientation`, `aria-required`, `aria-readonly`, `aria-invalid`, and `aria-describedby` for the help text.'],[`Options`,'Native `<input type="radio">` elements sharing a name, each inside its own `<label>` and drawn with `appearance: none`.'],[`Help text`,"An option's `helpText` sits outside its label and is linked with `aria-describedby`, so it is not part of the option's name."],[`Disabled options`,"Native `disabled`: skipped by the keyboard and announced as unavailable."],[`Focus`,`One Tab stop, with the design system focus ring shown only during keyboard use.`]],L=[[`.mx-radio-group`,"The field. `data-orientation`, `data-columns`, `data-size`, `data-invalid`, `data-readonly`, `data-disabled`, `data-required`."],[`.mx-radio-group__list`,"The `radiogroup` element. `columns` sets `--_columns` and `--_rows` on it."],[`.mx-radio-group__item, .mx-radio-group__label`,`An option, and the label that holds its radio and text.`],[`.mx-radio-group__input, .mx-radio-group__text, .mx-radio-group__help`,`The radio, its text and its help text.`]],R=[[`radiogroup.circle, radiogroup.dot`,"Units: the circle in every state (`checked`, `invalid`, `hover`, `pressed`, `focus` and their combinations, `disabled`), and the dot of the selected option (`checked`, `pressed`, `disabled`)."],[`radiogroup.row, radiogroup.text, radiogroup.help`,"Units: an option's row (`hover`, `checked`, `disabled`), its text and its help text."],[`radiogroup.halo, radiogroup.ring`,`Units: a halo centered on the circle and a ring around an option during keyboard use, where the design language includes them.`],[`radiogroup.options, radiogroup.floating-label`,`Units: the options as a group, and the group label when it floats.`],[`radiogroup.size.*, radiogroup.dot-size.*, radiogroup.dot-size-hover.*, radiogroup.dot-size-pressed.*`,`The circle and the dot, per size and state.`],[`radiogroup.height.*, radiogroup.font-size.*`,`Row height (density tokens) and text size.`],[`radiogroup.gap, radiogroup.column-gap, radiogroup.help-gap`,`The space before the text, between side-by-side options, and above an option's help text.`],[`radiogroup.press-offset, radiogroup.focus-scope`,`The distance the circle moves when pressed, and what the keyboard ring surrounds.`]];function z(){return s({initializeComponent:t=>{{let n=a(`p`,{initializeComponent:e=>{e.class.add(`lead`);let t=a(o,{text:`A set of mutually exclusive options. Options can come from plain values, custom objects or a live list, and can be arranged vertically, horizontally or in columns. Individual options can be disabled, hidden or given help text. The group is a single Tab stop, and the arrow keys move between options.`,runover:{},childs:[]});e.controls.add(t)}},1);t.controls.add(n);let s=a(r,{anchor:`import`,title:`Import`,runover:{},childs:[a(e,{code:`
import { RadioGroup, type RadioItem } from '@motifx-community/ui';
`,runover:{},childs:[]})]});t.controls.add(s);let l=a(r,{anchor:`ways`,title:`Declarative and programmatic`,runover:{},childs:[a(`p`,{initializeComponent:e=>{let t=a(o,{text:"A plain value serves as its own text. `x-model` provides two-way binding for the selected value. When you create the component with `new`, set the same properties programmatically.",runover:{},childs:[]});e.controls.add(t)}},1),a(i,{files:k(`Programmatic.tsx`),stack:!0,runover:{},childs:[a(y,{runover:{},childs:[]})]})]});t.controls.add(l);let u=a(r,{anchor:`data`,title:`Binding to data`,runover:{},childs:[a(`p`,{initializeComponent:e=>{let t=a(o,{text:"Custom objects use `itemText` and `itemValue`, each a property name or a function. Items can be plain or reactive and are read as they are. After adding, removing or renaming items in place, call `refresh()` to update the display, which preserves focus and selection.",runover:{},childs:[]});e.controls.add(t)}},1),a(i,{files:k(`FromData.tsx`),stack:!0,runover:{},childs:[a(b,{runover:{},childs:[]})]})]});t.controls.add(u);let d=a(r,{anchor:`items`,title:`Disabled options, help text and hints`,runover:{},childs:[a(`p`,{initializeComponent:e=>{let t=a(o,{text:"A `RadioItem` has its own `enabled`, `visible`, `hint` and `helpText`, each a value or a function. The arrow keys skip options that cannot be selected.",runover:{},childs:[]});e.controls.add(t)}},1),a(i,{files:k(`OptionDetails.tsx`),stack:!0,runover:{},childs:[a(T,{runover:{},childs:[]})]})]});t.controls.add(d);let f=a(r,{anchor:`layout`,title:`Orientation and columns`,runover:{},childs:[a(i,{files:k(`Layout.tsx`),stack:!0,runover:{},childs:[a(w,{runover:{},childs:[]})]})]});t.controls.add(f);let p=a(r,{anchor:`sizes`,title:`Sizes`,runover:{},childs:[a(i,{files:k(`Sizes.tsx`),runover:{},childs:[a(D,{runover:{},childs:[]})]})]});t.controls.add(p);let m=a(r,{anchor:`validation`,title:`Required, read-only, disabled`,runover:{},childs:[a(i,{files:k(`States.tsx`),stack:!0,runover:{},childs:[a(O,{runover:{},childs:[]})]})]});t.controls.add(m);let h=a(r,{anchor:`keyboard`,title:`Keyboard`,runover:{},childs:[a(c,{head:[`Key`,`Description`],rows:F,runover:{},childs:[]})]});t.controls.add(h);let g=a(r,{anchor:`a11y`,title:`Accessibility`,runover:{},childs:[a(c,{head:[`Topic`,`Details`],rows:I,runover:{},childs:[]})]});t.controls.add(g);let _=a(r,{anchor:`i18n`,title:`Localization`,runover:{},childs:[a(`p`,{initializeComponent:e=>{let t=a(o,{text:"The group has no strings of its own. The option text is yours, and functions of your language state work. The `required` message comes from `uiLocale.strings`.",runover:{},childs:[]});e.controls.add(t)}},1)]});t.controls.add(_);let v=a(r,{anchor:`styling`,title:`Styling`,runover:{},childs:[a(c,{head:[`Hook`,`Description`],rows:L,runover:{},childs:[]}),a(`h3`,{initializeComponent:e=>{let t=a(o,{text:`Component tokens`,runover:{},childs:[]});e.controls.add(t)}},1),a(c,{head:[`Token`,`Description`],rows:R,runover:{},childs:[]})]});t.controls.add(v);let x=a(r,{anchor:`api`,title:`API reference`,runover:{},childs:[a(`h3`,{initializeComponent:e=>{let t=a(o,{text:`Props`,runover:{},childs:[]});e.controls.add(t)}},1),a(c,{head:[`Prop`,`Type`,`Default`,`Description`],rows:A,runover:{},childs:[]}),a(`h3`,{initializeComponent:e=>{let t=a(o,{text:`RadioItem`,runover:{},childs:[]});e.controls.add(t)}},1),a(c,{head:[`Field`,`Type`,`Description`],rows:j,runover:{},childs:[]}),a(`h3`,{initializeComponent:e=>{let t=a(o,{text:`Properties`,runover:{},childs:[]});e.controls.add(t)}},1),a(c,{head:[`Property`,`Access`,`Description`],rows:M,runover:{},childs:[]}),a(`h3`,{initializeComponent:e=>{let t=a(o,{text:`Methods`,runover:{},childs:[]});e.controls.add(t)}},1),a(c,{head:[`Method`,`Returns`,`Description`],rows:N,runover:{},childs:[]}),a(`h3`,{initializeComponent:e=>{let t=a(o,{text:`Events`,runover:{},childs:[]});e.controls.add(t)}},1),a(c,{head:[`Event`,`When`],rows:P,runover:{},childs:[]})]});t.controls.add(x)}}})}export{z as default};