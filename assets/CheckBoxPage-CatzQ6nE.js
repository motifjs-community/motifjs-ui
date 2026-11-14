import{$n as e,F as t,Qn as n,n as r,tr as i}from"./next-id-IxLtiCRk.js";import{t as a}from"./CheckBox-BCOrAKJE.js";import{t as o}from"./ValidationGroup-nqszqpD0.js";import{t as s}from"./Stack-DTHjt5Ku.js";import{a as c,i as l,n as u,r as d,t as f}from"./docs-DpibOHDk.js";import{t as p}from"./sources-BXVvOiIY.js";import{t as m}from"./kit-texts-Bu8dobFa.js";var h=`import { reactive } from '@motifx/core';\r
import { Button, CheckBox, Stack, type LabelPosition } from '@motifx-community/ui';\r
\r
const POSITIONS: LabelPosition[] = ['end', 'start'];\r
\r
/** The caption after or before the box, stretched to the far end, or kept for screen readers only. */\r
export default function Caption() {\r
  const s = reactive({ position: 'end' as LabelPosition });\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Caption position">\r
        {POSITIONS.map((position) => (\r
          <Button\r
            key={position}\r
            text={position}\r
            size="sm"\r
            variant={() => (s.position === position ? 'solid' : 'ghost')}\r
            aria-pressed={() => s.position === position}\r
            onclick={() => (s.position = position)}\r
          />\r
        ))}\r
      </Stack>\r
      <CheckBox label="Show hidden files" labelPosition={() => s.position} />\r
      <div style="inline-size: 20rem">\r
        <CheckBox label="Wrap long lines" labelPosition={() => s.position} stretch value={true} />\r
      </div>\r
      <CheckBox label="Select row 3" labelMode="hidden" />\r
    </>\r
  );\r
}\r
`,g=`import { reactive } from '@motifx/core';\r
import { Button, uiLocale } from '@motifx-community/ui';\r
import { kitTexts } from '../../../shared/kit-texts';\r
\r
/** Switches the texts of every field on the page; a required message already shown follows too. */\r
export default function Localization() {\r
  const s = reactive({ lang: 'en' });\r
  const toggle = () => {\r
    s.lang = s.lang === 'en' ? 'tr' : 'en';\r
    void uiLocale.use(s.lang);\r
  };\r
  return (\r
    <>\r
      <Button text={() => (s.lang === 'en' ? 'Language: English' : 'Dil: Türkçe')} variant="outline" onclick={toggle} />\r
      <span>\r
        Required reads <output>{() => kitTexts.strings.required}</output>\r
      </span>\r
    </>\r
  );\r
}\r
`,_=`import { reactive } from '@motifx/core';\r
import { Button, CheckBox, Stack } from '@motifx-community/ui';\r
\r
/** A checkbox bound to state with x-model, and checkboxes created with \`new\` and added programmatically. */\r
export default function Programmatic() {\r
  const s = reactive({ remember: true, result: '' });\r
  let added = 0;\r
  let host: Stack | null = null;\r
\r
  const addProgrammatic = () => {\r
    const box = new CheckBox({ label: \`Option \${++added}\`, threeState: true });\r
    box.onValueChanged((e) => (s.result = \`\${box.label}: \${String(e.value)}\`));\r
    host?.controls.add(box);\r
    box.focus();\r
  };\r
\r
  return (\r
    <>\r
      <CheckBox label="&Remember me" x-model={() => s.remember} helpText={() => (s.remember ? 'You stay signed in.' : 'You sign in every time.')} />\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Button text="Add a checkbox programmatically" variant="outline" onclick={addProgrammatic} />\r
        <output class="cb-result">{() => s.result}</output>\r
      </Stack>\r
      <Stack orientation="horizontal" wrap align="center" ref={(c: Stack) => (host = c)} />\r
    </>\r
  );\r
}\r
`,v=`import { reactive } from '@motifx/core';\r
import { Button, CheckBox } from '@motifx-community/ui';\r
\r
/** Read-only and disabled, both following state. */\r
export default function ReadOnly() {\r
  const s = reactive({ editable: true, paid: true });\r
  return (\r
    <>\r
      <Button text="Toggle" variant="outline" onclick={() => (s.editable = !s.editable)} />\r
      <CheckBox label="Read-only" readOnly={() => !s.editable} x-model={() => s.paid} />\r
      <CheckBox label="Disabled" enabled={() => s.editable} x-model={() => s.paid} />\r
      <CheckBox label="Disabled, unchecked" enabled={() => s.editable} value={false} />\r
    </>\r
  );\r
}\r
`,y=`import { reactive } from '@motifx/core';\r
import { Button, CheckBox, Stack, ValidationGroup } from '@motifx-community/ui';\r
\r
/** Boxes that must be checked, checked with their group; the first one left unchecked gets focus. */\r
export default function Required() {\r
  const s = reactive({ terms: false, privacy: false, result: '' });\r
  const group = new ValidationGroup();\r
\r
  const signUp = async () => {\r
    const result = await group.validate();\r
    s.result = result.valid ? 'Signed up.' : \`\${result.invalid.length} box(es) to check.\`;\r
  };\r
\r
  return (\r
    <>\r
      <CheckBox label="I accept the &terms" required validationGroup={group} x-model={() => s.terms} />\r
      <CheckBox label="I read the privacy notice" required validationGroup={group} x-model={() => s.privacy} />\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Button text="Sign up" tone="accent" onclick={signUp} />\r
        <Button text="Reset" variant="ghost" onclick={() => group.reset()} />\r
        <output class="cb-save">{() => s.result}</output>\r
      </Stack>\r
    </>\r
  );\r
}\r
`,b=`import { reactive } from '@motifx/core';\r
import { CheckBox, Stack } from '@motifx-community/ui';\r
\r
interface Topping {\r
  id: number;\r
  name: string;\r
  on: boolean;\r
}\r
\r
/** A box over a list: indeterminate while only some are checked, and a click checks or unchecks them all. */\r
export default function SelectAll() {\r
  const toppings = reactive<Topping[]>([\r
    { id: 1, name: 'Cheese', on: true },\r
    { id: 2, name: 'Olives', on: false },\r
    { id: 3, name: 'Peppers', on: true },\r
  ]);\r
\r
  const allToppings = (): boolean | null => {\r
    const on = toppings.filter((t) => t.on).length;\r
    return on === 0 ? false : on === toppings.length ? true : null;\r
  };\r
\r
  return (\r
    <>\r
      <CheckBox\r
        label="All toppings"\r
        class="cb-all"\r
        value={allToppings}\r
        onValueChanged={(e) => {\r
          if (e.byUser) for (const t of toppings) t.on = e.value === true;\r
        }}\r
      />\r
      <Stack orientation="horizontal" wrap align="center" style="padding-inline-start: var(--mx-space-6)">\r
        {toppings.map((t) => (\r
          <CheckBox key={t.id} label={t.name} x-model={() => t.on} />\r
        ))}\r
      </Stack>\r
    </>\r
  );\r
}\r
`,x=`import { CheckBox, type ControlSize } from '@motifx-community/ui';\r
\r
const SIZES: ControlSize[] = ['sm', 'md', 'lg'];\r
\r
/** A checkbox in each size. */\r
export default function Sizes() {\r
  return (\r
    <>\r
      {SIZES.map((size) => (\r
        <CheckBox key={size} label={size} size={size} value={size !== 'sm'} />\r
      ))}\r
    </>\r
  );\r
}\r
`,S=`import { reactive } from '@motifx/core';\r
import { CheckBox } from '@motifx-community/ui';\r
\r
/** Unchecked, checked and indeterminate, and a box the user takes through all three. */\r
export default function States() {\r
  const s = reactive({ mixed: null as boolean | null, three: false as boolean | null });\r
  return (\r
    <>\r
      <CheckBox label="Unchecked" value={false} />\r
      <CheckBox label="Checked" value={true} />\r
      <CheckBox label="Indeterminate" x-model={() => s.mixed} />\r
      <CheckBox label="Three st&ates" threeState x-model={() => s.three} />\r
      <output class="cb-three">{() => \`value: \${String(s.three)}\`}</output>\r
    </>\r
  );\r
}\r
`,C=[`end`,`start`];function w(){let t=i({position:`end`});return e({initializeComponent:e=>{{let i=n(s,{orientation:`horizontal`,wrap:!0,align:`center`,role:`group`,"aria-label":`Caption position`,runover:{},childs:[n({initializeComponent:e=>{e.bindings.list(()=>C??[],e=>n(r,{indexkey:()=>e,text:e,size:`sm`,variant:()=>t.position===e?`solid`:`ghost`,"aria-pressed":()=>t.position===e,runover:{initializeComponent:n=>{n.motif.on(`click`,()=>t.position=e)}},childs:[]}))}})]});e.controls.add(i);let o=n(a,{label:`Show hidden files`,labelPosition:()=>t.position,runover:{},childs:[]});e.controls.add(o);let c=n(`div`,{initializeComponent:e=>{e.style(`inline-size: 20rem`);let r=n(a,{label:`Wrap long lines`,labelPosition:()=>t.position,stretch:!0,value:!0,runover:{},childs:[]});e.controls.add(r)}},1);e.controls.add(c);let l=n(a,{label:`Select row 3`,labelMode:`hidden`,runover:{},childs:[]});e.controls.add(l)}}})}function T(){let t=i({remember:!0,result:``}),o=0,c=null,l=()=>{let e=new a({label:`Option ${++o}`,threeState:!0});e.onValueChanged(n=>t.result=`${e.label}: ${String(n.value)}`),c?.controls.add(e),e.focus()};return e({initializeComponent:e=>{{let i=n(a,{label:`&Remember me`,helpText:()=>t.remember?`You stay signed in.`:`You sign in every time.`,runover:{initializeComponent:e=>{e.bindings.model(()=>t.remember,e=>{let n=t;n!=null&&typeof n.remember!=`function`&&(n.remember=e)})}},childs:[]});e.controls.add(i);let o=n(s,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[n(r,{text:`Add a checkbox programmatically`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,l)}},childs:[]}),n(`output`,{initializeComponent:e=>{e.class.add(`cb-result`),e.bindings.method(()=>t.result)}},1)]});e.controls.add(o);let u=n(s,{orientation:`horizontal`,wrap:!0,align:`center`,ref:e=>c=e,runover:{},childs:[]});e.controls.add(u)}}})}function E(){let a=i({lang:`en`}),o=()=>{a.lang=a.lang===`en`?`tr`:`en`,t.use(a.lang)};return e({initializeComponent:e=>{{let t=n(r,{text:()=>a.lang===`en`?`Language: English`:`Dil: Türkçe`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,o)}},childs:[]});e.controls.add(t);let i=n(`span`,{initializeComponent:e=>{let t=n(`text`,{initializeComponent:e=>{e.setText(`Required reads `)}},1);e.controls.add(t);let r=n(`output`,{initializeComponent:e=>{e.bindings.method(()=>m.strings.required)}},1);e.controls.add(r)}},1);e.controls.add(i)}}})}function D(){let t=i({editable:!0,paid:!0});return e({initializeComponent:e=>{{let i=n(r,{text:`Toggle`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,()=>t.editable=!t.editable)}},childs:[]});e.controls.add(i);let o=n(a,{label:`Read-only`,readOnly:()=>!t.editable,runover:{initializeComponent:e=>{e.bindings.model(()=>t.paid,e=>{let n=t;n!=null&&typeof n.paid!=`function`&&(n.paid=e)})}},childs:[]});e.controls.add(o);let s=n(a,{label:`Disabled`,enabled:()=>t.editable,runover:{initializeComponent:e=>{e.bindings.model(()=>t.paid,e=>{let n=t;n!=null&&typeof n.paid!=`function`&&(n.paid=e)})}},childs:[]});e.controls.add(s);let c=n(a,{label:`Disabled, unchecked`,enabled:()=>t.editable,value:!1,runover:{},childs:[]});e.controls.add(c)}}})}function O(){let t=i({terms:!1,privacy:!1,result:``}),c=new o,l=async()=>{let e=await c.validate();t.result=e.valid?`Signed up.`:`${e.invalid.length} box(es) to check.`};return e({initializeComponent:e=>{{let i=n(a,{label:`I accept the &terms`,required:!0,validationGroup:c,runover:{initializeComponent:e=>{e.bindings.model(()=>t.terms,e=>{let n=t;n!=null&&typeof n.terms!=`function`&&(n.terms=e)})}},childs:[]});e.controls.add(i);let o=n(a,{label:`I read the privacy notice`,required:!0,validationGroup:c,runover:{initializeComponent:e=>{e.bindings.model(()=>t.privacy,e=>{let n=t;n!=null&&typeof n.privacy!=`function`&&(n.privacy=e)})}},childs:[]});e.controls.add(o);let u=n(s,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[n(r,{text:`Sign up`,tone:`accent`,runover:{initializeComponent:e=>{e.motif.on(`click`,l)}},childs:[]}),n(r,{text:`Reset`,variant:`ghost`,runover:{initializeComponent:e=>{e.motif.on(`click`,()=>c.reset())}},childs:[]}),n(`output`,{initializeComponent:e=>{e.class.add(`cb-save`),e.bindings.method(()=>t.result)}},1)]});e.controls.add(u)}}})}function k(){let t=i([{id:1,name:`Cheese`,on:!0},{id:2,name:`Olives`,on:!1},{id:3,name:`Peppers`,on:!0}]),r=()=>{let e=t.filter(e=>e.on).length;return e===0?!1:e===t.length||null};return e({initializeComponent:e=>{{let i=n(a,{label:`All toppings`,class:`cb-all`,value:r,onValueChanged:e=>{if(e.byUser)for(let n of t)n.on=e.value===!0},runover:{},childs:[]});e.controls.add(i);let o=n(s,{orientation:`horizontal`,wrap:!0,align:`center`,style:`padding-inline-start: var(--mx-space-6)`,runover:{},childs:[n({initializeComponent:e=>{e.bindings.list(()=>t??[],e=>n(a,{indexkey:()=>e.id,label:e.name,runover:{initializeComponent:t=>{t.bindings.model(()=>e.on,t=>{let n=e;n!=null&&typeof n.on!=`function`&&(n.on=t)})}},childs:[]}))}})]});e.controls.add(o)}}})}var A=[`sm`,`md`,`lg`];function j(){return e({initializeComponent:e=>{e.bindings.list(()=>A??[],e=>n(a,{indexkey:()=>e,label:e,size:e,value:e!==`sm`,runover:{},childs:[]}))}})}function M(){let t=i({mixed:null,three:!1});return e({initializeComponent:e=>{{let r=n(a,{label:`Unchecked`,value:!1,runover:{},childs:[]});e.controls.add(r);let i=n(a,{label:`Checked`,value:!0,runover:{},childs:[]});e.controls.add(i);let o=n(a,{label:`Indeterminate`,runover:{initializeComponent:e=>{e.bindings.model(()=>t.mixed,e=>{let n=t;n!=null&&typeof n.mixed!=`function`&&(n.mixed=e)})}},childs:[]});e.controls.add(o);let s=n(a,{label:`Three st&ates`,threeState:!0,runover:{initializeComponent:e=>{e.bindings.model(()=>t.three,e=>{let n=t;n!=null&&typeof n.three!=`function`&&(n.three=e)})}},childs:[]});e.controls.add(s);let c=n(`output`,{initializeComponent:e=>{e.class.add(`cb-three`),e.bindings.method(()=>`value: ${String(t.three)}`)}},1);e.controls.add(c)}}})}var N=p(Object.assign({"./examples/Caption.tsx":h,"./examples/Localization.tsx":g,"./examples/Programmatic.tsx":_,"./examples/ReadOnly.tsx":v,"./examples/Required.tsx":y,"./examples/SelectAll.tsx":b,"./examples/Sizes.tsx":x,"./examples/States.tsx":S})),P=[[`value`,"`Bind<boolean | null>`","`false`","`true` is checked, `false` is unchecked, and `null` is indeterminate. `x-model` provides two-way binding."],[`label`,"`Bind<string>`","`''`","The label next to the box. Writing `&Name` makes Alt+N toggle it. This is the same property as `text`."],[`labelPosition`,"`Bind<'start' | 'end'>`","`'end'`","Places the label after the box (`end`) or before it (`start`), following the reading direction."],[`labelMode`,"`Bind<FieldLabelMode>`","`'top'`","`hidden` keeps the label for screen readers only. Every other mode shows it next to the box."],[`threeState`,"`Bind<boolean>`","`false`","A click cycles through unchecked, checked and indeterminate. Without this prop, a click only checks and unchecks, although code can still set `null`."],[`helpText`,"`Bind<string>`","`''`",`Help text shown below the label. An error message replaces it.`],[`hint`,"`Bind<string>`","`''`",`The tooltip text.`],[`readOnly`,"`Bind<boolean>`","`false`",`The box can receive focus and is announced, but a click or Space changes nothing.`],[`required`,"`Bind<boolean>`","`false`","The box must be checked. Adds an indicator after the label, `aria-required` and a `required` rule."],[`size`,"`Bind<ControlSize>`","`'md'`","`sm`, `md`, `lg`; the row height follows the density tokens."],[`stretch`,"`Bind<boolean>`","`false`",'Stretches to the full width of its container. With `labelPosition="start"`, the box moves to the far end.'],[`name`,"`Bind<string>`","`''`",`The name submitted with the form.`],[`rules, error, validateOn, validationGroup`,`see Field`,``,`Validation works the same way as for all fields.`],[`enabled / disabled, visible, tabStop, tabIndex`,`see Control`,``,`Properties shared by all controls.`]],F=[[`every prop above`,`read/write, reactive`,`Accepts a value or a function, the same as the prop.`],[`isValid, validationMessage, validating`,`read-only, reactive`,`The result of the last validation.`],[`inputPart`,`read-only`,'The native `<input type="checkbox">`.']],I=[[`toggle()`,"`void`","Changes the value as a click does (with `threeState`, to the next of the three states)."],[`validate()`,"`Promise<boolean>`",`Validates the value and displays the result.`],[`resetValidation()`,"`void`",`Clears the results of previous validation.`],[`focus()`,"`boolean`",`Sets focus on the box.`]],L=[[`onValueChanged(e)`,"Occurs when the value changes. `e`: `{ value, previousValue, byUser, source, event? }`. `null` stays `null`."],[`onValidated(e)`,"Occurs when validation finishes. `e`: `{ valid, message, source }`."],[`onclick, onchange, onfocusin, onfocusout`,`DOM events from the input bubble up to the field.`]],R=[[`Space`,`Toggles the check box, using the native key.`],["Alt + key (`&Name`)",`Moves focus to the check box and toggles it (Control + Option + key on Apple platforms).`],[`Tab`,`Each check box is one Tab stop.`]],z=[[`Element`,'A native `<input type="checkbox">` drawn with `appearance: none`. Its label is a `<label for>`, so clicking the label toggles the box.'],[`Indeterminate`,'The native `indeterminate` state, announced as "mixed".'],[`Read-only`,'`aria-readonly="true"`. The field stays in the Tab order.'],[`Errors`,'`aria-invalid="true"`. The text below the label is a polite live region and describes the box.'],[`Focus`,`The design system focus ring, shown only during keyboard use.`]],B=[[`.mx-check-box`,"The field. `data-state` (`checked`, `unchecked`, `mixed`), `data-label-position`, `data-size`, `data-invalid`, `data-readonly`, `data-disabled`, `data-required`."],[`.mx-toggle-field`,`The layout shared by CheckBox and Switch: the box and its label side by side.`],[`.mx-check-box__input`,`The native check box, which is the box itself.`],[`.mx-check-box__mark, .mx-check-box__check, .mx-check-box__dash`,`The mark drawn over the box.`],[`.mx-field__label, .mx-field__message`,`The label and the text below it.`]],V=[[`checkbox.box`,"Unit: the box, with every state (`checked`, `mixed` and `invalid`, each with `-hover`, `-pressed` and `-focus`, plus `disabled` and `checked-disabled`)."],[`checkbox.mark, checkbox.dash, checkbox.overlay`,"Units: the check mark, the dash of a mixed box, and a layer over the box (`pressed`, `disabled`)."],[`checkbox.halo, checkbox.ring`,"Units: a halo centered on the box (`checked`, `hover`, `focus`, `pressed`) and a ring around the box and label during keyboard use, where the design language includes them."],[`checkbox.label, checkbox.control`,"Units: the label (`disabled`) and the row it sits in."],[`checkbox.size.*, checkbox.mark-size.*`,`The box and its mark, per size.`],[`checkbox.height.*, checkbox.font-size.*`,`Row height (density tokens) and label size.`],[`checkbox.gap, checkbox.press-offset, checkbox.focus-scope`,"The space before the label, the distance the box moves when pressed, and what the keyboard ring surrounds (`box` or `item`)."]];function H(){return e({initializeComponent:e=>{{let t=n(`p`,{initializeComponent:e=>{e.class.add(`lead`);let t=n(d,{text:`A check box with a label that can be checked, unchecked or indeterminate. It supports an optional three-state cycle, read-only and required states, and validation with its group. It is a native check box styled with design tokens.`,runover:{},childs:[]});e.controls.add(t)}},1);e.controls.add(t);let r=n(l,{anchor:`import`,title:`Import`,runover:{},childs:[n(c,{code:`
import { CheckBox } from '@motifx-community/ui';
`,runover:{},childs:[]})]});e.controls.add(r);let i=n(l,{anchor:`ways`,title:`Declarative and programmatic`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(d,{text:"Every prop accepts a value or a function, and `x-model` provides two-way binding for the value. When you create the component with `new`, set the same properties programmatically.",runover:{},childs:[]});e.controls.add(t)}},1),n(u,{files:N(`Programmatic.tsx`),stack:!0,runover:{},childs:[n(T,{runover:{},childs:[]})]})]});e.controls.add(i);let a=n(l,{anchor:`states`,title:`Checked, unchecked and indeterminate`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(d,{text:"`null` shows the indeterminate dash. Clicking it checks the box. With `threeState`, the user cycles through all three states: unchecked, checked and indeterminate.",runover:{},childs:[]});e.controls.add(t)}},1),n(u,{files:N(`States.tsx`),runover:{},childs:[n(M,{runover:{},childs:[]})]}),n(`p`,{initializeComponent:e=>{let t=n(d,{text:`A box above a list is indeterminate while only some items are checked. Its value is a function of the list, and clicking it checks or unchecks all items.`,runover:{},childs:[]});e.controls.add(t)}},1),n(u,{files:N(`SelectAll.tsx`),stack:!0,runover:{},childs:[n(k,{runover:{},childs:[]})]})]});e.controls.add(a);let o=n(l,{anchor:`caption`,title:`Caption`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(d,{text:'The label appears after the box, or before it with `labelPosition="start"`. With `stretch`, the field takes the full width, so a box after its label moves to the far end, as in a settings list. `labelMode="hidden"` keeps the label for screen readers only.',runover:{},childs:[]});e.controls.add(t)}},1),n(u,{files:N(`Caption.tsx`),stack:!0,runover:{},childs:[n(w,{runover:{},childs:[]})]})]});e.controls.add(o);let s=n(l,{anchor:`sizes`,title:`Sizes`,runover:{},childs:[n(u,{files:N(`Sizes.tsx`),runover:{},childs:[n(j,{runover:{},childs:[]})]})]});e.controls.add(s);let p=n(l,{anchor:`validation`,title:`Required check boxes`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(d,{text:"`required` means the box must be checked. It is validated with its group like any other field, and the first unchecked box receives focus.",runover:{},childs:[]});e.controls.add(t)}},1),n(u,{files:N(`Required.tsx`),stack:!0,runover:{},childs:[n(O,{runover:{},childs:[]})]})]});e.controls.add(p);let m=n(l,{anchor:`states-ro`,title:`Read-only and disabled`,runover:{},childs:[n(u,{files:N(`ReadOnly.tsx`),runover:{},childs:[n(D,{runover:{},childs:[]})]})]});e.controls.add(m);let h=n(l,{anchor:`keyboard`,title:`Keyboard`,runover:{},childs:[n(f,{head:[`Key`,`Description`],rows:R,runover:{},childs:[]})]});e.controls.add(h);let g=n(l,{anchor:`a11y`,title:`Accessibility`,runover:{},childs:[n(f,{head:[`Topic`,`Details`],rows:z,runover:{},childs:[]})]});e.controls.add(g);let _=n(l,{anchor:`i18n`,title:`Localization`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(d,{text:"A check box has no strings of its own. The `required` message comes from `uiLocale.strings`, and a message already on screen updates immediately.",runover:{},childs:[]});e.controls.add(t)}},1),n(u,{files:N(`Localization.tsx`),runover:{},childs:[n(E,{runover:{},childs:[]})]})]});e.controls.add(_);let v=n(l,{anchor:`styling`,title:`Styling`,runover:{},childs:[n(f,{head:[`Hook`,`Description`],rows:B,runover:{},childs:[]}),n(`h3`,{initializeComponent:e=>{let t=n(d,{text:`Component tokens`,runover:{},childs:[]});e.controls.add(t)}},1),n(f,{head:[`Token`,`Description`],rows:V,runover:{},childs:[]})]});e.controls.add(v);let y=n(l,{anchor:`api`,title:`API reference`,runover:{},childs:[n(`h3`,{initializeComponent:e=>{let t=n(d,{text:`Props`,runover:{},childs:[]});e.controls.add(t)}},1),n(f,{head:[`Prop`,`Type`,`Default`,`Description`],rows:P,runover:{},childs:[]}),n(`h3`,{initializeComponent:e=>{let t=n(d,{text:`Properties`,runover:{},childs:[]});e.controls.add(t)}},1),n(f,{head:[`Property`,`Access`,`Description`],rows:F,runover:{},childs:[]}),n(`h3`,{initializeComponent:e=>{let t=n(d,{text:`Methods`,runover:{},childs:[]});e.controls.add(t)}},1),n(f,{head:[`Method`,`Returns`,`Description`],rows:I,runover:{},childs:[]}),n(`h3`,{initializeComponent:e=>{let t=n(d,{text:`Events`,runover:{},childs:[]});e.controls.add(t)}},1),n(f,{head:[`Event`,`When`],rows:L,runover:{},childs:[]}),n(`p`,{initializeComponent:e=>{let t=n(d,{text:"`ToggleField`, the base class shared by CheckBox and Switch, provides a label next to a native check box, read-only behavior and the access key. It is exported for use in your own controls.",runover:{},childs:[]});e.controls.add(t)}},1)]});e.controls.add(y)}}})}export{H as default};