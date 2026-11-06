import{Mt as e,a as t,an as n,h as r,i,n as a,nn as o,r as s,rn as c,t as l}from"./doc-B1CtlCkV.js";import{t as u}from"./Stack-AS0iyAxC.js";import{t as d}from"./ValidationGroup-T1woV0-X.js";import{a as f,t as p}from"./index-DVbtDn93.js";import{t as m}from"./sources-BXVvOiIY.js";import{t as h}from"./kit-texts-BRS-kYEc.js";var g=`import { reactive } from '@motifx/core';\r
import { Button, Stack, TextBox, validateFields } from '@motifx-community/ui';\r
\r
/** Every field inside a panel checked at once, without a group. */\r
export default function CheckPanel() {\r
  const s = reactive({ result: '' });\r
  let panel: Stack | null = null;\r
\r
  const check = async () => {\r
    const result = await validateFields(panel!);\r
    s.result = result.valid ? 'All fields are fine.' : \`\${result.invalid.length} field(s) to fix.\`;\r
  };\r
\r
  return (\r
    <Stack orientation="horizontal" wrap align="center" ref={(c: Stack) => (panel = c)}>\r
      <TextBox label="First name" required />\r
      <TextBox label="Last name" required />\r
      <Button text="Check the panel" variant="outline" onclick={check} />\r
      <output>{() => s.result}</output>\r
    </Stack>\r
  );\r
}\r
`,_=`import { reactive } from '@motifx/core';\r
import { Button, Stack, TextBox, type FieldLabelMode } from '@motifx-community/ui';\r
\r
const MODES: FieldLabelMode[] = ['top', 'side', 'floating', 'hidden'];\r
\r
/** The label above the box, next to it, floating inside it, or only for screen readers. */\r
export default function LabelModes() {\r
  const s = reactive({ email: '', labelMode: 'top' as FieldLabelMode });\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Label mode">\r
        {MODES.map((mode) => (\r
          <Button\r
            key={mode}\r
            text={mode}\r
            size="sm"\r
            variant={() => (s.labelMode === mode ? 'solid' : 'ghost')}\r
            aria-pressed={() => s.labelMode === mode}\r
            onclick={() => (s.labelMode = mode)}\r
          />\r
        ))}\r
      </Stack>\r
      <TextBox label="&Email" labelMode={() => s.labelMode} type="email" x-model={() => s.email} helpText="We never share it." />\r
    </>\r
  );\r
}\r
`,v=`import { reactive } from '@motifx/core';\r
import { Button, uiLocale } from '@motifx-community/ui';\r
import { kitTexts } from '../../../shared/kit-texts';\r
\r
/** Switches the texts of every field on the page; errors already shown follow too. */\r
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
        Required reads <output class="tb-required">{() => kitTexts.strings.required}</output>\r
      </span>\r
    </>\r
  );\r
}\r
`,y=`import { reactive } from '@motifx/core';\r
import { Stack, TextBox } from '@motifx-community/ui';\r
\r
/** A phone number, an IBAN kept with its spaces, and a plate with a mask character of its own. */\r
export default function Masks() {\r
  const s = reactive({ phone: '', iban: '', plate: '' });\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center">\r
        <TextBox label="Phone" type="tel" mask="(000) 000 00 00" x-model={() => s.phone} />\r
        <output class="tb-phone">{() => \`value: "\${s.phone}"\`}</output>\r
      </Stack>\r
      <TextBox label="IBAN" mask="TR00 0000 0000 0000 0000 0000 00" maskValue="formatted" stretch x-model={() => s.iban} />\r
      <Stack orientation="horizontal" wrap align="center">\r
        <TextBox label="Plate" mask="00 LLL 099" maskChars={{ L: { test: /\\p{L}/u, transform: 'upper' } }} x-model={() => s.plate} />\r
        <output>{() => \`value: "\${s.plate}"\`}</output>\r
      </Stack>\r
    </>\r
  );\r
}\r
`,b=`import { reactive } from '@motifx/core';\r
import { Stack, TextBox } from '@motifx-community/ui';\r
\r
/** A password that can be shown, and a field that counts its characters; a password sits in a form. */\r
export default function PasswordCounter() {\r
  const s = reactive({ password: '', note: '' });\r
  return (\r
    <form onsubmit={(e: SubmitEvent) => e.preventDefault()}>\r
      <Stack>\r
        <TextBox label="Password" type="password" x-model={() => s.password} autocomplete="new-password" />\r
        <TextBox label="Note" maxLength={40} showCounter x-model={() => s.note} />\r
      </Stack>\r
    </form>\r
  );\r
}\r
`,x=`import { reactive } from '@motifx/core';\r
import { TextBox } from '@motifx-community/ui';\r
\r
const SearchIcon = () => (\r
  <svg viewBox="0 0 16 16" aria-hidden="true">\r
    <circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" stroke-width="1.5" />\r
    <path d="M10.5 10.5l3 3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />\r
  </svg>\r
);\r
\r
const CopyIcon = () => (\r
  <svg viewBox="0 0 16 16" aria-hidden="true">\r
    <path d="M5.5 5.5h8v8h-8zM3 10.5h-.5v-8h8v.5" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" />\r
  </svg>\r
);\r
\r
/** Fixed text around the value, an icon at the start, and a custom button in the box. */\r
export default function PrefixSuffix() {\r
  const s = reactive({ site: '', query: '' });\r
  const link = 'https://motifjs.com/invite/42';\r
  return (\r
    <>\r
      <TextBox label="Site" prefix="https://" suffix=".com" x-model={() => s.site} />\r
      <TextBox label="Search" type="search" icon={() => <SearchIcon />} clearButton x-model={() => s.query} />\r
      <TextBox\r
        label="Invite link"\r
        readOnly\r
        value={link}\r
        buttons={[{ icon: () => <CopyIcon />, hint: 'Copy', click: () => navigator.clipboard.writeText(link) }]}\r
      />\r
    </>\r
  );\r
}\r
`,S=`import { reactive } from '@motifx/core';\r
import { Button, Stack, TextBox } from '@motifx-community/ui';\r
\r
/** A field bound to state with x-model, and fields created with \`new\` and added programmatically. */\r
export default function Programmatic() {\r
  const form = reactive({ name: 'Ada', result: '' });\r
  let added = 0;\r
  let host: Stack | null = null;\r
\r
  const addProgrammatic = () => {\r
    const box = new TextBox({ label: \`Field \${++added}\`, clearButton: true, placeholder: 'Created with new' });\r
    box.onValueChanged((e) => (form.result = \`\${box.label}: \${e.value}\`));\r
    host?.controls.add(box);\r
    box.focus();\r
  };\r
\r
  return (\r
    <>\r
      <TextBox label="&Name" x-model={() => form.name} clearButton helpText={() => \`Hello, \${form.name || 'stranger'}.\`} />\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Button text="Add a field programmatically" variant="outline" onclick={addProgrammatic} />\r
        <output class="tb-result">{() => form.result}</output>\r
      </Stack>\r
      <Stack orientation="horizontal" wrap align="center" ref={(c: Stack) => (host = c)} />\r
    </>\r
  );\r
}\r
`,C=`import { reactive } from '@motifx/core';\r
import { Button, TextBox } from '@motifx-community/ui';\r
\r
/** Read-only and disabled, both following state. */\r
export default function ReadOnly() {\r
  const s = reactive({ editing: true });\r
  return (\r
    <>\r
      <Button text="Toggle" variant="outline" onclick={() => (s.editing = !s.editing)} />\r
      <TextBox label="Read-only" value="#1042" readOnly={() => !s.editing} clearButton />\r
      <TextBox label="Disabled" value="#1042" enabled={() => s.editing} />\r
    </>\r
  );\r
}\r
`,w=`import { reactive } from '@motifx/core';\r
import { Button, Stack, TextBox, ValidationGroup } from '@motifx-community/ui';\r
\r
/** Simulates a server call: "ada" is taken. */\r
const isFree = (value: string) =>\r
  new Promise<boolean | string>((done) => setTimeout(() => done(value.toLowerCase() === 'ada' ? \`“\${value}” is taken.\` : true), 600));\r
\r
/** Built-in rules, custom rules including an async one, an external error, and a group validated on Save. */\r
export default function Validation() {\r
  const s = reactive({ user: '', serverError: '' as string | null, result: '' });\r
  const group = new ValidationGroup();\r
\r
  const save = async () => {\r
    const result = await group.validate();\r
    s.result = result.valid ? 'Saved.' : \`\${result.invalid.length} field(s) to fix.\`;\r
  };\r
\r
  return (\r
    <>\r
      <TextBox label="Email" type="email" required validationGroup={group} />\r
      <TextBox\r
        label="User name"\r
        required\r
        helpText="Try “ada”: the server says it is taken."\r
        x-model={() => s.user}\r
        rules={[\r
          { type: 'length', min: 3 },\r
          { type: 'pattern', pattern: '[a-z0-9_]+', message: 'Lower case letters, digits and _ only.' },\r
          { type: 'custom', check: isFree },\r
        ]}\r
        validationGroup={group}\r
      />\r
      <TextBox label="Code" error={() => s.serverError} validationGroup={group} helpText="An error from outside shows until cleared." />\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Button text="Save" tone="accent" onclick={save} />\r
        <Button text="Server error" variant="outline" onclick={() => (s.serverError = s.serverError ? null : 'This code expired.')} />\r
        <Button text="Reset" variant="ghost" onclick={() => group.reset()} />\r
        <output class="tb-save">{() => s.result}</output>\r
      </Stack>\r
    </>\r
  );\r
}\r
`,T=`import { Stack, TextBox, type FieldVariant } from '@motifx-community/ui';\r
\r
const VARIANTS: FieldVariant[] = ['outline', 'filled', 'underline'];\r
\r
/** Every variant in the three sizes. */\r
export default function VariantsAndSizes() {\r
  return (\r
    <>\r
      {VARIANTS.map((variant) => (\r
        <Stack key={variant} orientation="horizontal" wrap align="center">\r
          <TextBox label={\`\${variant} sm\`} variant={variant} size="sm" placeholder="Small" />\r
          <TextBox label={\`\${variant} md\`} variant={variant} placeholder="Medium" />\r
          <TextBox label={\`\${variant} lg\`} variant={variant} size="lg" placeholder="Large" />\r
        </Stack>\r
      ))}\r
    </>\r
  );\r
}\r
`;function E(){let e=n({result:``}),t=null,i=async()=>{let n=await f(t);e.result=n.valid?`All fields are fine.`:`${n.invalid.length} field(s) to fix.`};return o(u,{orientation:`horizontal`,wrap:!0,align:`center`,ref:e=>t=e,runover:{},childs:[o(p,{label:`First name`,required:!0,runover:{},childs:[]}),o(p,{label:`Last name`,required:!0,runover:{},childs:[]}),o(r,{text:`Check the panel`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,i)}},childs:[]}),o(`output`,{initializeComponent:t=>{t.bindings.method(()=>e.result)}},1)]})}function D(){let e=n({name:`Ada`,result:``}),t=0,i=null,a=()=>{let n=new p({label:`Field ${++t}`,clearButton:!0,placeholder:`Created with new`});n.onValueChanged(t=>e.result=`${n.label}: ${t.value}`),i?.controls.add(n),n.focus()};return c({initializeComponent:t=>{{let n=o(p,{label:`&Name`,clearButton:!0,helpText:()=>`Hello, ${e.name||`stranger`}.`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.name,t=>{let n=e;n!=null&&typeof n.name!=`function`&&(n.name=t)})}},childs:[]});t.controls.add(n);let s=o(u,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[o(r,{text:`Add a field programmatically`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,a)}},childs:[]}),o(`output`,{initializeComponent:t=>{t.class.add(`tb-result`),t.bindings.method(()=>e.result)}},1)]});t.controls.add(s);let c=o(u,{orientation:`horizontal`,wrap:!0,align:`center`,ref:e=>i=e,runover:{},childs:[]});t.controls.add(c)}}})}var O=[`top`,`side`,`floating`,`hidden`];function k(){let e=n({email:``,labelMode:`top`});return c({initializeComponent:t=>{{let n=o(u,{orientation:`horizontal`,wrap:!0,align:`center`,role:`group`,"aria-label":`Label mode`,runover:{},childs:[o({initializeComponent:t=>{t.bindings.list(()=>O??[],t=>o(r,{indexkey:()=>t,text:t,size:`sm`,variant:()=>e.labelMode===t?`solid`:`ghost`,"aria-pressed":()=>e.labelMode===t,runover:{initializeComponent:n=>{n.motif.on(`click`,()=>e.labelMode=t)}},childs:[]}))}})]});t.controls.add(n);let i=o(p,{label:`&Email`,labelMode:()=>e.labelMode,type:`email`,helpText:`We never share it.`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.email,t=>{let n=e;n!=null&&typeof n.email!=`function`&&(n.email=t)})}},childs:[]});t.controls.add(i)}}})}function A(){let t=n({lang:`en`}),i=()=>{t.lang=t.lang===`en`?`tr`:`en`,e.use(t.lang)};return c({initializeComponent:e=>{{let n=o(r,{text:()=>t.lang===`en`?`Language: English`:`Dil: Türkçe`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,i)}},childs:[]});e.controls.add(n);let a=o(`span`,{initializeComponent:e=>{let t=o(`text`,{initializeComponent:e=>{e.setText(`Required reads `)}},1);e.controls.add(t);let n=o(`output`,{initializeComponent:e=>{e.class.add(`tb-required`),e.bindings.method(()=>h.strings.required)}},1);e.controls.add(n)}},1);e.controls.add(a)}}})}function j(){let e=n({phone:``,iban:``,plate:``});return c({initializeComponent:t=>{{let n=o(u,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[o(p,{label:`Phone`,type:`tel`,mask:`(000) 000 00 00`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.phone,t=>{let n=e;n!=null&&typeof n.phone!=`function`&&(n.phone=t)})}},childs:[]}),o(`output`,{initializeComponent:t=>{t.class.add(`tb-phone`),t.bindings.method(()=>`value: "${e.phone}"`)}},1)]});t.controls.add(n);let r=o(p,{label:`IBAN`,mask:`TR00 0000 0000 0000 0000 0000 00`,maskValue:`formatted`,stretch:!0,runover:{initializeComponent:t=>{t.bindings.model(()=>e.iban,t=>{let n=e;n!=null&&typeof n.iban!=`function`&&(n.iban=t)})}},childs:[]});t.controls.add(r);let i=o(u,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[o(p,{label:`Plate`,mask:`00 LLL 099`,maskChars:{L:{test:/\p{L}/u,transform:`upper`}},runover:{initializeComponent:t=>{t.bindings.model(()=>e.plate,t=>{let n=e;n!=null&&typeof n.plate!=`function`&&(n.plate=t)})}},childs:[]}),o(`output`,{initializeComponent:t=>{t.bindings.method(()=>`value: "${e.plate}"`)}},1)]});t.controls.add(i)}}})}function M(){let e=n({password:``,note:``});return o(`form`,{initializeComponent:t=>{t.motif.on(`submit`,e=>e.preventDefault());let n=o(u,{runover:{},childs:[o(p,{label:`Password`,type:`password`,autocomplete:`new-password`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.password,t=>{let n=e;n!=null&&typeof n.password!=`function`&&(n.password=t)})}},childs:[]}),o(p,{label:`Note`,maxLength:40,showCounter:!0,runover:{initializeComponent:t=>{t.bindings.model(()=>e.note,t=>{let n=e;n!=null&&typeof n.note!=`function`&&(n.note=t)})}},childs:[]})]});t.controls.add(n)}},1)}var N=()=>o(`svg`,{__isSvgElement:!0,initializeComponent:e=>{e.attr.add({viewBox:`0 0 16 16`,"aria-hidden":`true`});let t=o(`circle`,{__isSvgElement:!0,initializeComponent:e=>{e.attr.add({cx:`7`,cy:`7`,r:`4.5`,fill:`none`,stroke:`currentColor`,"stroke-width":`1.5`})}});e.controls.add(t);let n=o(`path`,{__isSvgElement:!0,initializeComponent:e=>{e.attr.add({d:`M10.5 10.5l3 3`,fill:`none`,stroke:`currentColor`,"stroke-width":`1.5`,"stroke-linecap":`round`})}});e.controls.add(n)}}),P=()=>o(`svg`,{__isSvgElement:!0,initializeComponent:e=>{e.attr.add({viewBox:`0 0 16 16`,"aria-hidden":`true`});let t=o(`path`,{__isSvgElement:!0,initializeComponent:e=>{e.attr.add({d:`M5.5 5.5h8v8h-8zM3 10.5h-.5v-8h8v.5`,fill:`none`,stroke:`currentColor`,"stroke-width":`1.3`,"stroke-linejoin":`round`})}});e.controls.add(t)}});function F(){let e=n({site:``,query:``}),t=`https://motifjs.com/invite/42`;return c({initializeComponent:n=>{{let r=o(p,{label:`Site`,prefix:`https://`,suffix:`.com`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.site,t=>{let n=e;n!=null&&typeof n.site!=`function`&&(n.site=t)})}},childs:[]});n.controls.add(r);let i=o(p,{label:`Search`,type:`search`,icon:()=>o(N,{runover:{},childs:[]}),clearButton:!0,runover:{initializeComponent:t=>{t.bindings.model(()=>e.query,t=>{let n=e;n!=null&&typeof n.query!=`function`&&(n.query=t)})}},childs:[]});n.controls.add(i);let a=o(p,{label:`Invite link`,readOnly:!0,value:t,buttons:[{icon:()=>o(P,{runover:{},childs:[]}),hint:`Copy`,click:()=>navigator.clipboard.writeText(t)}],runover:{},childs:[]});n.controls.add(a)}}})}function I(){let e=n({editing:!0});return c({initializeComponent:t=>{{let n=o(r,{text:`Toggle`,variant:`outline`,runover:{initializeComponent:t=>{t.motif.on(`click`,()=>e.editing=!e.editing)}},childs:[]});t.controls.add(n);let i=o(p,{label:`Read-only`,value:`#1042`,readOnly:()=>!e.editing,clearButton:!0,runover:{},childs:[]});t.controls.add(i);let a=o(p,{label:`Disabled`,value:`#1042`,enabled:()=>e.editing,runover:{},childs:[]});t.controls.add(a)}}})}var L=e=>new Promise(t=>setTimeout(()=>t(e.toLowerCase()!==`ada`||`“${e}” is taken.`),600));function R(){let e=n({user:``,serverError:``,result:``}),t=new d,i=async()=>{let n=await t.validate();e.result=n.valid?`Saved.`:`${n.invalid.length} field(s) to fix.`};return c({initializeComponent:n=>{{let a=o(p,{label:`Email`,type:`email`,required:!0,validationGroup:t,runover:{},childs:[]});n.controls.add(a);let s=o(p,{label:`User name`,required:!0,helpText:`Try “ada”: the server says it is taken.`,rules:[{type:`length`,min:3},{type:`pattern`,pattern:`[a-z0-9_]+`,message:`Lower case letters, digits and _ only.`},{type:`custom`,check:L}],validationGroup:t,runover:{initializeComponent:t=>{t.bindings.model(()=>e.user,t=>{let n=e;n!=null&&typeof n.user!=`function`&&(n.user=t)})}},childs:[]});n.controls.add(s);let c=o(p,{label:`Code`,error:()=>e.serverError,validationGroup:t,helpText:`An error from outside shows until cleared.`,runover:{},childs:[]});n.controls.add(c);let l=o(u,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[o(r,{text:`Save`,tone:`accent`,runover:{initializeComponent:e=>{e.motif.on(`click`,i)}},childs:[]}),o(r,{text:`Server error`,variant:`outline`,runover:{initializeComponent:t=>{t.motif.on(`click`,()=>e.serverError=e.serverError?null:`This code expired.`)}},childs:[]}),o(r,{text:`Reset`,variant:`ghost`,runover:{initializeComponent:e=>{e.motif.on(`click`,()=>t.reset())}},childs:[]}),o(`output`,{initializeComponent:t=>{t.class.add(`tb-save`),t.bindings.method(()=>e.result)}},1)]});n.controls.add(l)}}})}var z=[`outline`,`filled`,`underline`];function B(){return c({initializeComponent:e=>{e.bindings.list(()=>z??[],e=>o(u,{indexkey:()=>e,orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[o(p,{label:`${e} sm`,variant:e,size:`sm`,placeholder:`Small`,runover:{},childs:[]}),o(p,{label:`${e} md`,variant:e,placeholder:`Medium`,runover:{},childs:[]}),o(p,{label:`${e} lg`,variant:e,size:`lg`,placeholder:`Large`,runover:{},childs:[]})]}))}})}var V=m(Object.assign({"./examples/CheckPanel.tsx":g,"./examples/LabelModes.tsx":_,"./examples/Localization.tsx":v,"./examples/Masks.tsx":y,"./examples/PasswordCounter.tsx":b,"./examples/PrefixSuffix.tsx":x,"./examples/Programmatic.tsx":S,"./examples/ReadOnly.tsx":C,"./examples/Validation.tsx":w,"./examples/VariantsAndSizes.tsx":T})),H=[[`value`,"`Bind<string>`","`''`","The text. `x-model` provides two-way binding."],[`label`,"`Bind<string>`","`''`","The field label. Writing `&Name` assigns Alt+N as the access key. This is the same property as `text`."],[`labelMode`,"`Bind<FieldLabelMode>`","`'top'`","`top`, `side` (next to the box), `floating` (inside the box until there is a value) or `hidden` (for screen readers only)."],[`placeholder`,"`Bind<string>`","`''`",`Displayed when the field is empty.`],[`helpText`,"`Bind<string>`","`''`",`Help text shown below the box. An error message replaces it.`],[`hint`,"`Bind<string>`","`''`",`The tooltip text.`],[`type`,"`Bind<TextBoxType>`","`'text'`","`text`, `password`, `email`, `search`, `tel` or `url`. `email` and `url` also validate the format."],[`prefix / suffix`,"`Bind<string>`","`''`","Fixed text before or after the value inside the box (`https://`, `kg`)."],[`icon`,"`Bind<IconSource | null>`",`—`,`An icon at the start of the box.`],[`buttons`,"`Bind<readonly FieldButton[]>`","`[]`",`Custom buttons inside the box, at the start or end.`],[`clearButton`,"`Bind<boolean>`","`false`",`Shows a button that clears the field. Pressing Escape also clears it.`],[`passwordReveal`,"`Bind<boolean>`","`true`",'With `type="password"`, shows a button that reveals the password.'],[`maxLength / minLength`,"`Bind<number>`",`—`,"Length limits. `minLength` is enforced by validation."],[`showCounter`,"`Bind<boolean>`","`false`","Shows `12/50` below the box (`12` without `maxLength`)."],[`updateOn`,"`Bind<'input' | 'change'>`","`'input'`","With `change`, the value updates when the field loses focus or the user presses Enter."],[`selectOnFocus`,"`Bind<boolean>`","`false`",`Selects all text when the field receives focus.`],[`align`,"`Bind<'start' | 'center' | 'end'>`","`'start'`",`Text alignment.`],[`readOnly`,"`Bind<boolean>`","`false`",`The value can be read, selected and copied, but not changed.`],[`required`,"`Bind<boolean>`","`false`","Adds an indicator after the label, `aria-required` and a `required` rule."],[`size`,"`Bind<ControlSize>`","`'md'`","`sm`, `md`, `lg`, from the density tokens."],[`variant`,"`Bind<FieldVariant>`","`'outline'`","`outline`, `filled`, `underline`."],[`stretch`,"`Bind<boolean>`","`false`",`Stretches to the full width of its container.`],[`mask`,"`Bind<string>`","`''`",`See Input mask.`],[`maskChars`,"`Bind<Record<string, MaskChar>>`","`{}`",`Custom mask characters.`],[`maskPlaceholder`,"`Bind<string>`","`'_'`",`Shown in positions that are not filled yet.`],[`maskValue`,"`Bind<'raw' | 'formatted'>`","`'raw'`","`raw` returns only the typed characters, and `formatted` includes the fixed ones."],[`showMask`,"`Bind<'always' | 'focus'>`","`'focus'`","With `focus`, an empty mask appears only while the field has focus."],[`rules`,"`Bind<readonly ValidationRule[]>`","`[]`",`See Validation.`],[`error`,"`Bind<string | null>`",`—`,`An error from an external source, such as the server. It stays until cleared.`],[`validateOn`,"`Bind<ValidateOn>`","`'blur'`","`blur`, `input`, `manual`."],[`validationGroup`,"`Bind<ValidationGroup | null>`",`—`,`The group the field is validated with.`],[`inputMode, autocomplete, spellcheck, name`,"`Bind<…>`",`—`,"Passed to the `<input>`."],[`enabled / disabled, visible, tabStop, tabIndex`,`see Control`,``,`Properties shared by all controls.`]],U=[[`every prop above`,`read/write, reactive`,"Accepts a value or a function, the same as the prop: `box.error = () => this.model.nameError` is tracked."],[`isValid`,`read-only, reactive`,"`false` while an error is displayed."],[`validationMessage`,`read-only, reactive`,"The error being displayed, or `''` if there is none."],[`validating`,`read-only, reactive`,`Indicates that an asynchronous rule is running.`],[`maskComplete`,`read-only`,`Indicates that every position of the mask is filled.`],[`inputElement`,`read-only`,"The native `<input>`."]],W=[[`validate()`,"`Promise<boolean>`",`Validates the value and displays the result.`],[`resetValidation()`,"`void`",`Clears the results of previous validation.`],[`focus()`,"`boolean`",`Sets focus on the input.`],[`select()`,"`void`",`Selects all text.`],[`clear()`,"`void`",`Clears the field, as the clear button does.`],[`refresh()`,"`void`","Your `buttons` can be plain or reactive, and the field reads them as they are. After changing them in place, call `refresh()`. Every editor has this method, and list editors also re-read their items."]],G=[[`onValueChanged(e)`,"Occurs when the value changes. `e`: `{ value, previousValue, byUser, source, event? }`. `byUser` distinguishes user input from programmatic changes."],[`onValidated(e)`,"Occurs when validation finishes. `e`: `{ valid, message, source }`."],[`onEnter(e)`,"Occurs when the user presses Enter. `e`: `{ value, source, event }`."],[`oninput, onchange, onkeydown, onfocusin, onfocusout`,`DOM events from the input bubble up to the field.`]],K=[[`{ type: 'required' }`,`A value is required.`],[`{ type: 'email' } / { type: 'url' }`,`An email address or a web address.`],[`{ type: 'pattern', pattern }`,"A `RegExp`, or a string that must match the whole value, like the HTML `pattern` attribute."],[`{ type: 'length', min?, max? }`,`The number of characters.`],[`{ type: 'range', min?, max? }`,`A number or date within a range.`],[`{ type: 'compare', with, not? }`,"Equal to another value, such as a repeated password, or different from it with `not`."],[`{ type: 'custom', check, ignoreEmpty? }`,"`check(value)` returns `true`, `false`, a message, or a promise of one of these, such as a server call."],[`every rule`,"`message` (a value or a function) and `enabled`. Empty values pass every rule except `required` and `compare`."]],q=[[`0`,`A digit.`],[`9`,`An optional digit.`],[`a`,`A letter.`],[`*`,`A letter or a digit.`],[`\\\\`,"Treats the next character as fixed: `\\\\0` is a fixed zero."],[`anything else`,`A fixed character, skipped during typing.`]],J=[["Alt + key (`&Name`)",`Moves focus to the field (Control + Option + key on Apple platforms).`],[`Enter`,'Commits the value (with `updateOn="change"`) and raises `onEnter`.'],[`Escape`,"With `clearButton`, clears a field that has a value. Otherwise, the key passes to the containing window."],[`Tab`,`Custom buttons and the password button are Tab stops. The clear button is not, because Escape does the same thing.`]],Y=[[`Element`,"A native `<input>` associated with its `<label>` through `for`."],[`Description`,"`aria-describedby` references the prefix, the suffix and the help text."],[`Errors`,'`aria-invalid="true"`. The message is a polite live region, so new errors are announced.'],[`Required check boxes`,'`aria-required="true"`. The indicator after the label is hidden from screen readers.'],[`Buttons`,"The clear and password buttons get their names from `uiLocale`, and the password button has `aria-pressed`."]],X=[[`.mx-field`,"The field. `data-size`, `data-variant`, `data-label-mode`, `data-invalid`, `data-readonly`, `data-disabled`, `data-filled`, `data-required`, `data-stretch`."],[`.mx-text-box`,`Added by TextBox.`],[`.mx-field__label, .mx-field__box, .mx-field__input`,`The label, the box and the input.`],[`.mx-field__icon, .mx-field__prefix, .mx-field__suffix`,`The parts on either side of the input.`],[`.mx-field__button, .mx-text-box__clear, .mx-text-box__reveal`,`Buttons inside the box.`],[`.mx-field__message, .mx-field__counter`,`Help text below the box.`]],Z=[[`field.width`,`The width when the field is not stretched.`],[`field.height.*, field.padding.*, field.font-size.*`,`Sizes are defined by the density tokens.`],[`field.box, field.layer, field.frame, field.indicator, field.ring`,"Units: the box, a state layer over its fill, the frame (with `frame-start`, `frame-notch` and `frame-end` around a notch), the line along the bottom, and a ring for keyboard focus. Each has a box per state: by variant (`filled-…`, `underline-…`), by status (`invalid`, `readonly`, `disabled`), and for `hover`, `focus` and `pressed`."],[`field.label, field.required, field.icon, field.prefix, field.suffix, field.placeholder`,"Units: the label (`focus`, `invalid`, `disabled`, `floating-…`), the required indicator and the parts next to the text."],[`field.slot, field.button, field.glyph, field.button-icon`,"Units: button groups in the box, the buttons (`hover`, `pressed`, `focus`, `disabled`) and their contents."],[`field.foot, field.message, field.counter`,"Units: the line below the box (`shown`, `invalid`, `disabled`), the help or error text, and the counter."],[`field.border-width, field.gap, field.label-gap, field.label-width, field.label-font-weight, field.label-font-size`,`Frame width, spacing and the label.`],[`field.icon-size, field.button-inset`,`Icons, and the distance between the buttons and the edges of the box.`],[`field.floating-height, field.floating-font-size, field.floating-padding, field.notch-gap`,`The floating label and the notch cut for it.`]];function Q(){return c({initializeComponent:e=>{{let n=o(`p`,{initializeComponent:e=>{e.class.add(`lead`);let t=o(s,{text:`A single-line text input with a label, help text and error display. It supports a placeholder, a prefix and suffix, buttons inside the box, a clear button, a password reveal button, a character counter, an input mask and validation, either on its own, in a group, or across all fields in a panel.`,runover:{},childs:[]});e.controls.add(t)}},1);e.controls.add(n);let r=o(i,{anchor:`import`,title:`Import`,runover:{},childs:[o(t,{code:`
import { TextBox, ValidationGroup, validateFields, type ValidationRule } from '@motifx-community/ui';
`,runover:{},childs:[]})]});e.controls.add(r);let c=o(i,{anchor:`ways`,title:`Declarative and programmatic`,runover:{},childs:[o(`p`,{initializeComponent:e=>{let t=o(s,{text:"Every prop accepts a value or a function, and a function that reads a reactive object keeps the field in sync with it. `x-model` provides two-way binding for the value. When you create the component with `new`, set the same properties programmatically.",runover:{},childs:[]});e.controls.add(t)}},1),o(a,{files:V(`Programmatic.tsx`),stack:!0,runover:{},childs:[o(D,{runover:{},childs:[]})]})]});e.controls.add(c);let u=o(i,{anchor:`label`,title:`Label`,runover:{},childs:[o(`p`,{initializeComponent:e=>{let t=o(s,{text:"The label can appear above the box, next to it (`side`), inside it until there is a value (`floating`), or only for screen readers (`hidden`). `&` marks its access key.",runover:{},childs:[]});e.controls.add(t)}},1),o(a,{files:V(`LabelModes.tsx`),stack:!0,runover:{},childs:[o(k,{runover:{},childs:[]})]})]});e.controls.add(u);let d=o(i,{anchor:`look`,title:`Variants and sizes`,runover:{},childs:[o(a,{files:V(`VariantsAndSizes.tsx`),stack:!0,runover:{},childs:[o(B,{runover:{},childs:[]})]})]});e.controls.add(d);let f=o(i,{anchor:`content`,title:`Prefix, suffix, icon and buttons`,runover:{},childs:[o(`p`,{initializeComponent:e=>{let t=o(s,{text:"`prefix` and `suffix` add fixed text around the value, and `icon` appears at the start. `buttons` adds custom buttons, each with its own `enabled`, `visible` and `position`.",runover:{},childs:[]});e.controls.add(t)}},1),o(a,{files:V(`PrefixSuffix.tsx`),stack:!0,runover:{},childs:[o(F,{runover:{},childs:[]})]})]});e.controls.add(f);let p=o(i,{anchor:`password`,title:`Password and character counter`,runover:{},childs:[o(a,{files:V(`PasswordCounter.tsx`),stack:!0,runover:{},childs:[o(M,{runover:{},childs:[]})]})]});e.controls.add(p);let m=o(i,{anchor:`mask`,title:`Input mask`,runover:{},childs:[o(`p`,{initializeComponent:e=>{let t=o(s,{text:'A mask keeps the text in the required format as the user types, deletes or pastes, and the caret skips fixed characters. The value contains only the typed characters, or the displayed text with `maskValue="formatted"`. An incomplete mask fails validation.',runover:{},childs:[]});e.controls.add(t)}},1),o(l,{head:[`Character`,`Meaning`],rows:q,runover:{},childs:[]}),o(a,{files:V(`Masks.tsx`),stack:!0,runover:{},childs:[o(j,{runover:{},childs:[]})]})]});e.controls.add(m);let h=o(i,{anchor:`validation`,title:`Validation`,runover:{},childs:[o(`p`,{initializeComponent:e=>{let t=o(s,{text:'A field validates itself when it loses focus after a change, and then on every change until the value is valid. `required`, `minLength`, `type="email"` and a mask bring their own rules, and `rules` adds your own, including asynchronous ones. `error` displays a message from an external source, such as the server.',runover:{},childs:[]});e.controls.add(t)}},1),o(a,{files:V(`Validation.tsx`),stack:!0,runover:{},childs:[o(R,{runover:{},childs:[]})]}),o(`p`,{initializeComponent:e=>{let t=o(s,{text:"Without a group, `validateFields(panel)` validates every field inside a component or element, such as a panel, a dialog or a page.",runover:{},childs:[]});e.controls.add(t)}},1),o(a,{files:V(`CheckPanel.tsx`),runover:{},childs:[o(E,{runover:{},childs:[]})]})]});e.controls.add(h);let g=o(i,{anchor:`states`,title:`Read-only and disabled`,runover:{},childs:[o(a,{files:V(`ReadOnly.tsx`),runover:{},childs:[o(I,{runover:{},childs:[]})]})]});e.controls.add(g);let _=o(i,{anchor:`keyboard`,title:`Keyboard`,runover:{},childs:[o(l,{head:[`Key`,`Description`],rows:J,runover:{},childs:[]})]});e.controls.add(_);let v=o(i,{anchor:`a11y`,title:`Accessibility`,runover:{},childs:[o(l,{head:[`Topic`,`Details`],rows:Y,runover:{},childs:[]})]});e.controls.add(v);let y=o(i,{anchor:`i18n`,title:`Localization`,runover:{},childs:[o(`p`,{initializeComponent:e=>{let t=o(s,{text:"The names of the clear and password buttons and all validation messages come from `uiLocale.strings`. Every field updates immediately when they change, including errors already on screen.",runover:{},childs:[]});e.controls.add(t)}},1),o(a,{files:V(`Localization.tsx`),runover:{},childs:[o(A,{runover:{},childs:[]})]})]});e.controls.add(y);let b=o(i,{anchor:`styling`,title:`Styling`,runover:{},childs:[o(l,{head:[`Hook`,`Description`],rows:X,runover:{},childs:[]}),o(`h3`,{initializeComponent:e=>{let t=o(s,{text:`Component tokens`,runover:{},childs:[]});e.controls.add(t)}},1),o(l,{head:[`Token`,`Description`],rows:Z,runover:{},childs:[]})]});e.controls.add(b);let x=o(i,{anchor:`api`,title:`API reference`,runover:{},childs:[o(`h3`,{initializeComponent:e=>{let t=o(s,{text:`Props`,runover:{},childs:[]});e.controls.add(t)}},1),o(l,{head:[`Prop`,`Type`,`Default`,`Description`],rows:H,runover:{},childs:[]}),o(`h3`,{initializeComponent:e=>{let t=o(s,{text:`Properties`,runover:{},childs:[]});e.controls.add(t)}},1),o(l,{head:[`Property`,`Access`,`Description`],rows:U,runover:{},childs:[]}),o(`h3`,{initializeComponent:e=>{let t=o(s,{text:`Methods`,runover:{},childs:[]});e.controls.add(t)}},1),o(l,{head:[`Method`,`Returns`,`Description`],rows:W,runover:{},childs:[]}),o(`h3`,{initializeComponent:e=>{let t=o(s,{text:`Events`,runover:{},childs:[]});e.controls.add(t)}},1),o(l,{head:[`Event`,`When`],rows:G,runover:{},childs:[]}),o(`h3`,{initializeComponent:e=>{let t=o(s,{text:`Validation rules`,runover:{},childs:[]});e.controls.add(t)}},1),o(l,{head:[`Rule`,`Validators`],rows:K,runover:{},childs:[]}),o(`p`,{initializeComponent:e=>{let t=o(s,{text:"The frame (`Field`), the mask (`InputMask`, which works on any `<input>`) and validation (`ValidationGroup`, `validateFields`, `checkRules`) are shared parts, exported for use in other components and your own code.",runover:{},childs:[]});e.controls.add(t)}},1)]});e.controls.add(x)}}})}export{Q as default};