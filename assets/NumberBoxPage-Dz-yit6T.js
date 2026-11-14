import{F as e,Qn as t,Zn as n,er as r,n as i}from"./next-id-CtzpBrBT.js";import{t as a}from"./NumberBox-8iuCS9_o.js";import{t as o}from"./Stack-wRt1e9tO.js";import{a as s,i as c,n as l,r as u,t as d}from"./docs-B_LZlyP5.js";import{t as f}from"./sources-BXVvOiIY.js";import{t as p}from"./kit-texts-BMQUznlf.js";var m=`import { reactive } from '@motifx/core';\r
import { NumberBox, Stack } from '@motifx-community/ui';\r
\r
const show = (value: number | null) => (value === null ? 'null' : String(value));\r
\r
/** Rounding to one decimal, and a field that cannot stay empty. */\r
export default function DecimalsAndEmpty() {\r
  const s = reactive({ weight: 72.456 as number | null });\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center">\r
        <NumberBox label="Weight" decimals={1} step={0.1} suffix="kg" locale="en" x-model={() => s.weight} />\r
        <output class="nb-weight">{() => \`value: \${show(s.weight)}\`}</output>\r
      </Stack>\r
      <NumberBox label="Guests" min={1} allowEmpty={false} locale="en" value={2} />\r
    </>\r
  );\r
}\r
`,h=`import { reactive } from '@motifx/core';\r
import { NumberBox, Stack } from '@motifx-community/ui';\r
\r
const show = (value: number | null) => (value === null ? 'null' : String(value));\r
\r
/** A Turkish lira price, a percent edited as shown, and US dollars. */\r
export default function Format() {\r
  const s = reactive({ price: 1234.5 as number | null, share: 0.125 as number | null, dollars: 99.99 as number | null });\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center">\r
        <NumberBox label="Price" locale="tr-TR" min={0} format={{ style: 'currency', currency: 'TRY' }} x-model={() => s.price} />\r
        <output class="nb-price">{() => \`value: \${show(s.price)}\`}</output>\r
      </Stack>\r
      <Stack orientation="horizontal" wrap align="center">\r
        <NumberBox label="Share" locale="en" min={0} max={1} step={0.01} format={{ style: 'percent', maximumFractionDigits: 1 }} x-model={() => s.share} />\r
        <output class="nb-share">{() => \`value: \${show(s.share)}\`}</output>\r
      </Stack>\r
      <Stack orientation="horizontal" wrap align="center">\r
        <NumberBox label="Amount" locale="en-US" format={{ style: 'currency', currency: 'USD' }} x-model={() => s.dollars} />\r
        <output>{() => \`value: \${show(s.dollars)}\`}</output>\r
      </Stack>\r
    </>\r
  );\r
}\r
`,g=`import { reactive } from '@motifx/core';\r
import { Button, uiLocale } from '@motifx-community/ui';\r
import { kitTexts } from '../../../shared/kit-texts';\r
\r
/** Switches the names of the spin buttons and the range messages. */\r
export default function Localization() {\r
  const s = reactive({ lang: 'en' });\r
\r
  const toggle = () => {\r
    s.lang = s.lang === 'en' ? 'tr' : 'en';\r
    void uiLocale.use(s.lang);\r
  };\r
\r
  return (\r
    <>\r
      <Button text={() => (s.lang === 'en' ? 'Language: English' : 'Dil: Türkçe')} variant="outline" onclick={toggle} />\r
      <span>\r
        The up button reads <output class="nb-increase">{() => kitTexts.strings.increase}</output>\r
      </span>\r
    </>\r
  );\r
}\r
`,_=`import { reactive } from '@motifx/core';\r
import { NumberBox } from '@motifx-community/ui';\r
\r
/** A value brought inside its bounds, and one left as typed for the range check to report. */\r
export default function MinMaxClamp() {\r
  const s = reactive({ score: 50 as number | null, age: null as number | null });\r
  return (\r
    <>\r
      <NumberBox label="Score" min={0} max={100} locale="en" x-model={() => s.score} helpText="Try 250." />\r
      <NumberBox label="Age" min={18} max={120} clamp={false} locale="en" x-model={() => s.age} helpText="Try 12." />\r
    </>\r
  );\r
}\r
`,v=`import { reactive } from '@motifx/core';\r
import { Button, NumberBox, Stack } from '@motifx-community/ui';\r
\r
const show = (value: number | null) => (value === null ? 'null' : String(value));\r
\r
/** A field bound to a number with x-model, and fields created with \`new\` and stepped programmatically. */\r
export default function Programmatic() {\r
  const s = reactive({ quantity: 3 as number | null, log: '' });\r
  let added = 0;\r
  let host: Stack | null = null;\r
\r
  const addProgrammatic = () => {\r
    const box = new NumberBox({ label: \`Count \${++added}\`, min: 0, max: 10, value: 5, locale: 'en' });\r
    box.onValueChanged((e) => (s.log = \`\${box.label}: \${show(e.value)}\`));\r
    host?.controls.add(box);\r
    box.stepUp();\r
    box.focus();\r
  };\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center">\r
        <NumberBox label="&Quantity" min={1} max={99} locale="en" x-model={() => s.quantity} />\r
        <output class="nb-quantity">{() => \`value: \${show(s.quantity)}\`}</output>\r
      </Stack>\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Button text="Add a field programmatically" variant="outline" onclick={addProgrammatic} />\r
        <output class="nb-log">{() => s.log}</output>\r
      </Stack>\r
      <Stack orientation="horizontal" wrap align="center" ref={(c: Stack) => (host = c)} />\r
    </>\r
  );\r
}\r
`,y=`import { reactive } from '@motifx/core';\r
import { Button, NumberBox, Stack, type SpinLayout } from '@motifx-community/ui';\r
\r
const LAYOUTS: SpinLayout[] = ['stacked', 'inline'];\r
\r
/** Spin buttons on top of each other, side by side, or none. */\r
export default function SpinButtons() {\r
  const s = reactive({ seats: 2 as number | null, layout: 'stacked' as SpinLayout, spin: true });\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Spin buttons">\r
        {LAYOUTS.map((layout) => (\r
          <Button\r
            key={layout}\r
            text={layout}\r
            size="sm"\r
            variant={() => (s.spin && s.layout === layout ? 'solid' : 'ghost')}\r
            aria-pressed={() => s.spin && s.layout === layout}\r
            onclick={() => {\r
              s.layout = layout;\r
              s.spin = true;\r
            }}\r
          />\r
        ))}\r
        <Button text="none" size="sm" variant={() => (s.spin ? 'ghost' : 'solid')} aria-pressed={() => !s.spin} onclick={() => (s.spin = false)} />\r
      </Stack>\r
      <NumberBox label="Seats" min={1} max={9} locale="en" spinLayout={() => s.layout} showSpinButtons={() => s.spin} x-model={() => s.seats} />\r
    </>\r
  );\r
}\r
`,b=`import { reactive } from '@motifx/core';\r
import { NumberBox } from '@motifx-community/ui';\r
\r
const show = (value: number | null) => (value === null ? 'null' : String(value));\r
\r
/** A step of 0.1 without float noise, and the mouse wheel stepping while the field has focus. */\r
export default function Steps() {\r
  const s = reactive({ rate: 0.1 as number | null });\r
  return (\r
    <>\r
      <NumberBox label="Rate" step={0.1} min={0} max={5} wheel locale="en" x-model={() => s.rate} />\r
      <output class="nb-rate">{() => \`value: \${show(s.rate)}\`}</output>\r
    </>\r
  );\r
}\r
`,x=e=>e===null?`null`:String(e);function S(){let e=r({weight:72.456});return t({initializeComponent:t=>{{let r=n(o,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[n(a,{label:`Weight`,decimals:1,step:.1,suffix:`kg`,locale:`en`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.weight,t=>{let n=e;n!=null&&typeof n.weight!=`function`&&(n.weight=t)})}},childs:[]}),n(`output`,{initializeComponent:t=>{t.class.add(`nb-weight`),t.bindings.method(()=>`value: ${x(e.weight)}`)}},1)]});t.controls.add(r);let i=n(a,{label:`Guests`,min:1,allowEmpty:!1,locale:`en`,value:2,runover:{},childs:[]});t.controls.add(i)}}})}var C=e=>e===null?`null`:String(e);function w(){let e=r({price:1234.5,share:.125,dollars:99.99});return t({initializeComponent:t=>{{let r=n(o,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[n(a,{label:`Price`,locale:`tr-TR`,min:0,format:{style:`currency`,currency:`TRY`},runover:{initializeComponent:t=>{t.bindings.model(()=>e.price,t=>{let n=e;n!=null&&typeof n.price!=`function`&&(n.price=t)})}},childs:[]}),n(`output`,{initializeComponent:t=>{t.class.add(`nb-price`),t.bindings.method(()=>`value: ${C(e.price)}`)}},1)]});t.controls.add(r);let i=n(o,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[n(a,{label:`Share`,locale:`en`,min:0,max:1,step:.01,format:{style:`percent`,maximumFractionDigits:1},runover:{initializeComponent:t=>{t.bindings.model(()=>e.share,t=>{let n=e;n!=null&&typeof n.share!=`function`&&(n.share=t)})}},childs:[]}),n(`output`,{initializeComponent:t=>{t.class.add(`nb-share`),t.bindings.method(()=>`value: ${C(e.share)}`)}},1)]});t.controls.add(i);let s=n(o,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[n(a,{label:`Amount`,locale:`en-US`,format:{style:`currency`,currency:`USD`},runover:{initializeComponent:t=>{t.bindings.model(()=>e.dollars,t=>{let n=e;n!=null&&typeof n.dollars!=`function`&&(n.dollars=t)})}},childs:[]}),n(`output`,{initializeComponent:t=>{t.bindings.method(()=>`value: ${C(e.dollars)}`)}},1)]});t.controls.add(s)}}})}var T=e=>e===null?`null`:String(e);function E(){let e=r({quantity:3,log:``}),s=0,c=null,l=()=>{let t=new a({label:`Count ${++s}`,min:0,max:10,value:5,locale:`en`});t.onValueChanged(n=>e.log=`${t.label}: ${T(n.value)}`),c?.controls.add(t),t.stepUp(),t.focus()};return t({initializeComponent:t=>{{let r=n(o,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[n(a,{label:`&Quantity`,min:1,max:99,locale:`en`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.quantity,t=>{let n=e;n!=null&&typeof n.quantity!=`function`&&(n.quantity=t)})}},childs:[]}),n(`output`,{initializeComponent:t=>{t.class.add(`nb-quantity`),t.bindings.method(()=>`value: ${T(e.quantity)}`)}},1)]});t.controls.add(r);let s=n(o,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[n(i,{text:`Add a field programmatically`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,l)}},childs:[]}),n(`output`,{initializeComponent:t=>{t.class.add(`nb-log`),t.bindings.method(()=>e.log)}},1)]});t.controls.add(s);let u=n(o,{orientation:`horizontal`,wrap:!0,align:`center`,ref:e=>c=e,runover:{},childs:[]});t.controls.add(u)}}})}function D(){let a=r({lang:`en`}),o=()=>{a.lang=a.lang===`en`?`tr`:`en`,e.use(a.lang)};return t({initializeComponent:e=>{{let t=n(i,{text:()=>a.lang===`en`?`Language: English`:`Dil: Türkçe`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,o)}},childs:[]});e.controls.add(t);let r=n(`span`,{initializeComponent:e=>{let t=n(`text`,{initializeComponent:e=>{e.setText(`The up button reads `)}},1);e.controls.add(t);let r=n(`output`,{initializeComponent:e=>{e.class.add(`nb-increase`),e.bindings.method(()=>p.strings.increase)}},1);e.controls.add(r)}},1);e.controls.add(r)}}})}function O(){let e=r({score:50,age:null});return t({initializeComponent:t=>{{let r=n(a,{label:`Score`,min:0,max:100,locale:`en`,helpText:`Try 250.`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.score,t=>{let n=e;n!=null&&typeof n.score!=`function`&&(n.score=t)})}},childs:[]});t.controls.add(r);let i=n(a,{label:`Age`,min:18,max:120,clamp:!1,locale:`en`,helpText:`Try 12.`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.age,t=>{let n=e;n!=null&&typeof n.age!=`function`&&(n.age=t)})}},childs:[]});t.controls.add(i)}}})}var k=[`stacked`,`inline`];function A(){let e=r({seats:2,layout:`stacked`,spin:!0});return t({initializeComponent:t=>{{let r=n(o,{orientation:`horizontal`,wrap:!0,align:`center`,role:`group`,"aria-label":`Spin buttons`,runover:{},childs:[n({initializeComponent:t=>{t.bindings.list(()=>k??[],t=>n(i,{indexkey:()=>t,text:t,size:`sm`,variant:()=>e.spin&&e.layout===t?`solid`:`ghost`,"aria-pressed":()=>e.spin&&e.layout===t,runover:{initializeComponent:n=>{n.motif.on(`click`,()=>{e.layout=t,e.spin=!0})}},childs:[]}))}}),n(i,{text:`none`,size:`sm`,variant:()=>e.spin?`ghost`:`solid`,"aria-pressed":()=>!e.spin,runover:{initializeComponent:t=>{t.motif.on(`click`,()=>e.spin=!1)}},childs:[]})]});t.controls.add(r);let s=n(a,{label:`Seats`,min:1,max:9,locale:`en`,spinLayout:()=>e.layout,showSpinButtons:()=>e.spin,runover:{initializeComponent:t=>{t.bindings.model(()=>e.seats,t=>{let n=e;n!=null&&typeof n.seats!=`function`&&(n.seats=t)})}},childs:[]});t.controls.add(s)}}})}var j=e=>e===null?`null`:String(e);function M(){let e=r({rate:.1});return t({initializeComponent:t=>{{let r=n(a,{label:`Rate`,step:.1,min:0,max:5,wheel:!0,locale:`en`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.rate,t=>{let n=e;n!=null&&typeof n.rate!=`function`&&(n.rate=t)})}},childs:[]});t.controls.add(r);let i=n(`output`,{initializeComponent:t=>{t.class.add(`nb-rate`),t.bindings.method(()=>`value: ${j(e.rate)}`)}},1);t.controls.add(i)}}})}var N=f(Object.assign({"./examples/DecimalsAndEmpty.tsx":m,"./examples/Format.tsx":h,"./examples/Localization.tsx":g,"./examples/MinMaxClamp.tsx":_,"./examples/Programmatic.tsx":v,"./examples/SpinButtons.tsx":y,"./examples/Steps.tsx":b})),P=[[`value`,"`Bind<number | null>`","`null`","The number, or `null` when empty. `x-model` provides two-way binding."],[`min / max`,"`Bind<number | null>`","`null`","The limits. Steps stop there, Home and End go there, entered values are kept inside (see `clamp`), and the range is validated."],[`step`,"`Bind<number>`","`1`",`The amount added by the arrow keys, the spin buttons and the wheel.`],[`largeStep`,"`Bind<number>`","10 × `step`",`The amount added by PageUp and PageDown.`],[`showSpinButtons`,"`Bind<boolean>`","`true`",`Shows up and down buttons in the box.`],[`spinLayout`,"`Bind<SpinLayout>`","`'stacked'`","`stacked` shows arrows on top of each other, and `inline` shows − and + side by side."],[`wheel`,"`Bind<boolean>`","`false`",`The mouse wheel changes the value while the field has focus.`],[`format`,"`Bind<Intl.NumberFormatOptions>`","`{}`","The display format without focus: `{ style: 'currency', currency: 'TRY' }`, `{ style: 'percent' }`, `{ minimumFractionDigits: 2 }`…"],[`locale`,"`Bind<string>`","The page `lang`",`The locale of the format and of the input.`],[`decimals`,"`Bind<number | null>`","`null`",`The number of digits after the decimal point. Every value is rounded to this precision (half away from zero) regardless of its source, and displayed with exactly that many digits while the field is not being edited.`],[`clamp`,"`Bind<boolean>`","`true`","Brings a value outside `min` and `max` into range when entered. `false` leaves it to the range validation."],[`allowEmpty`,"`Bind<boolean>`","`true`","An empty field is `null`. `false` replaces it with `min` (or 0) when the field loses focus."],[`updateOn`,"`Bind<'input' | 'change'>`","`'input'`","With `input`, the value updates as soon as the text is a complete number in range. With `change`, it updates when the field loses focus or the user presses Enter."],[`placeholder`,"`Bind<string>`","`''`",`Displayed when the field is empty.`],[`selectOnFocus`,"`Bind<boolean>`","`false`",`Selects all text when the field receives focus.`],[`align`,"`Bind<'start' | 'center' | 'end'>`","`'start'`",`Text alignment.`],[`label, labelMode, helpText, hint, prefix, suffix, icon, buttons`,`see TextBox`,``,`Parts common to all fields.`],[`readOnly, required, size, variant, stretch`,`see TextBox`,``,`States and appearance common to all fields.`],[`rules, error, validateOn, validationGroup`,`see TextBox`,``,`Validation works the same way as for all fields.`],[`name, autocomplete`,"`Bind<string>`","—, `'off'`","Passed to the `<input>`."],[`enabled / disabled, visible, tabStop, tabIndex`,`see Control`,``,`Properties shared by all controls.`]],F=[[`every prop above`,`read/write, reactive`,"Accepts a value or a function, the same as the prop. `locale` returns the locale in use."],[`formattedValue`,`read-only, reactive`,"The value as displayed without focus, or `''` when empty."],[`isValid, validationMessage, validating`,`read-only, reactive`,`The validation result.`],[`inputPart`,`read-only`,"The native `<input>`."]],I=[[`stepUp(times = 1)`,"`void`","Adds `step` × `times`, kept within `min` and `max`."],[`stepDown(times = 1)`,"`void`","Subtracts `step` × `times`."],[`validate()`,"`Promise<boolean>`",`Validates the value and displays the result.`],[`resetValidation()`,"`void`",`Clears the results of previous validation.`],[`focus()`,"`boolean`",`Sets focus on the input.`],[`select()`,"`void`",`Selects all text.`],[`typeText(text)`,"`void`","Puts `text` in the field as if the user typed it; characters a number is not written with are not taken."]],L=[[`onValueChanged(e)`,"Occurs when the value changes. `e`: `{ value, previousValue, byUser, source, event? }`. A held spin button reports every step."],[`onValidated(e)`,"Occurs when validation finishes. `e`: `{ valid, message, source }`."],[`onEnter(e)`,"Occurs when the user presses Enter. `e`: `{ value, source, event }`."]],R=[[`Up / Down arrow`,"Adds or subtracts `step`."],[`PageUp / PageDown`,"Adds or subtracts `largeStep`."],[`Home / End`,"Goes to `min` or `max` when set. Otherwise, moves the caret."],[`Enter`,"Commits the typed text, rounded and within range, and raises `onEnter`."],[`Mouse wheel`,"With `wheel`, changes the value by one step while the field has focus."],["Alt + key (`&Name`)",`Moves focus to the field (Control + Option + key on Apple platforms).`]],z=[[`Role`,'`spinbutton` on a text `<input inputmode="decimal">`, so phones show a numeric keyboard and any locale can be typed.'],[`Value`,"`aria-valuenow`, `aria-valuemin`, `aria-valuemax`, and `aria-valuetext` with the formatted value (`₺1.234,50`)."],[`Spin buttons`,"Named “Increase” and “Decrease” from `uiLocale`. They are not Tab stops, because the arrow keys do the same thing."],[`Errors`,'`aria-invalid="true"`. The message is a polite live region.']],B=[[`.mx-field.mx-number-box`,"The field. `data-spin` while spin buttons are shown, plus the field attributes."],[`.mx-number-box__spin`,'The spin buttons; `data-layout="stacked" | "inline"`.'],[`.mx-number-box__step`,'One spin button; `data-step="up" | "down"`.']],V=[[`number-box.spin, number-box.step, number-box.glyph`,"Units: the spin button group (`stacked`, `inline`, `disabled`), each step (`up`, `down`, `next`, `hover`, `pressed`, `disabled`) and its glyph."],[`number-box.spin-layout, number-box.spin-order`,`Where the steps are placed (stacked at the end, or one on each side) and their order.`],[`number-box.spin-inset`,`The space around stacked spin buttons.`],[`field.*`,`Everything else works as in TextBox.`]];function H(){return t({initializeComponent:e=>{{let t=n(`p`,{initializeComponent:e=>{e.class.add(`lead`);let t=n(u,{text:`A numeric input with arrow key support, PageUp and PageDown, spin buttons that repeat while held, min and max limits, exact decimal stepping, display formats such as currency and percent, and locale-aware input.`,runover:{},childs:[]});e.controls.add(t)}},1);e.controls.add(t);let r=n(c,{anchor:`import`,title:`Import`,runover:{},childs:[n(s,{code:`
import { NumberBox, type NumberBoxProps } from '@motifx-community/ui';
`,runover:{},childs:[]})]});e.controls.add(r);let i=n(c,{anchor:`ways`,title:`Declarative and programmatic`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(u,{text:"`x-model` binds a number (`null` when empty). When you create the component with `new`, set the same properties programmatically.",runover:{},childs:[]});e.controls.add(t)}},1),n(l,{files:N(`Programmatic.tsx`),stack:!0,runover:{},childs:[n(E,{runover:{},childs:[]})]})]});e.controls.add(i);let a=n(c,{anchor:`steps`,title:`Steps and keyboard input`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(u,{text:"Up and Down add `step`, PageUp and PageDown add `largeStep` (10 × `step` by default), and Home and End go to `min` and `max`. Steps are calculated on the decimal digits, so 0.1 + 0.2 equals 0.3. With `wheel`, the mouse wheel changes the value while the field has focus.",runover:{},childs:[]});e.controls.add(t)}},1),n(l,{files:N(`Steps.tsx`),runover:{},childs:[n(M,{runover:{},childs:[]})]})]});e.controls.add(a);let o=n(c,{anchor:`spin`,title:`Spin buttons`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(u,{text:"Clicking a spin button changes the value by one step. Holding it repeats until the button is released or a limit is reached. The buttons can be `stacked`, `inline` or hidden.",runover:{},childs:[]});e.controls.add(t)}},1),n(l,{files:N(`SpinButtons.tsx`),stack:!0,runover:{},childs:[n(A,{runover:{},childs:[]})]})]});e.controls.add(o);let f=n(c,{anchor:`format`,title:`Format and locale`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(u,{text:"Without focus, the value is displayed through `Intl.NumberFormat` using `format` and `locale` (the page `lang` by default). With focus, it switches to a plain number for editing. Input is parsed in the same locale: `1.234,5` in Turkish and `1,234.5` in English. A `.` also works as the decimal point where it cannot be a group separator. A percent is edited as displayed, so 0.125 is entered as 12.5.",runover:{},childs:[]});e.controls.add(t)}},1),n(l,{files:N(`Format.tsx`),stack:!0,runover:{},childs:[n(w,{runover:{},childs:[]})]})]});e.controls.add(f);let p=n(c,{anchor:`range`,title:`Min, max and clamping`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(u,{text:"A value outside `min` and `max` is brought into range when the field loses focus. With `clamp={false}`, it stays as typed and the range validation reports it.",runover:{},childs:[]});e.controls.add(t)}},1),n(l,{files:N(`MinMaxClamp.tsx`),runover:{},childs:[n(O,{runover:{},childs:[]})]})]});e.controls.add(p);let m=n(c,{anchor:`decimals`,title:`Decimals and empty values`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(u,{text:"`decimals` rounds every value, whether set in code or entered by the user, and displays exactly that many digits while the field is not being edited (`72.50`). `format` can override how they are displayed. An empty field is `null`. With `allowEmpty={false}`, it receives `min` (or 0) when it loses focus.",runover:{},childs:[]});e.controls.add(t)}},1),n(l,{files:N(`DecimalsAndEmpty.tsx`),runover:{},childs:[n(S,{runover:{},childs:[]})]})]});e.controls.add(m);let h=n(c,{anchor:`keyboard`,title:`Keyboard`,runover:{},childs:[n(d,{head:[`Key`,`Description`],rows:R,runover:{},childs:[]})]});e.controls.add(h);let g=n(c,{anchor:`a11y`,title:`Accessibility`,runover:{},childs:[n(d,{head:[`Topic`,`Details`],rows:z,runover:{},childs:[]})]});e.controls.add(g);let _=n(c,{anchor:`i18n`,title:`Localization`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(u,{text:"The spin button names and range messages come from `uiLocale.strings`. Numbers follow `locale`.",runover:{},childs:[]});e.controls.add(t)}},1),n(l,{files:N(`Localization.tsx`),runover:{},childs:[n(D,{runover:{},childs:[]})]})]});e.controls.add(_);let v=n(c,{anchor:`styling`,title:`Styling`,runover:{},childs:[n(d,{head:[`Hook`,`Description`],rows:B,runover:{},childs:[]}),n(`h3`,{initializeComponent:e=>{let t=n(u,{text:`Component tokens`,runover:{},childs:[]});e.controls.add(t)}},1),n(d,{head:[`Token`,`Description`],rows:V,runover:{},childs:[]})]});e.controls.add(v);let y=n(c,{anchor:`api`,title:`API reference`,runover:{},childs:[n(`h3`,{initializeComponent:e=>{let t=n(u,{text:`Props`,runover:{},childs:[]});e.controls.add(t)}},1),n(d,{head:[`Prop`,`Type`,`Default`,`Description`],rows:P,runover:{},childs:[]}),n(`h3`,{initializeComponent:e=>{let t=n(u,{text:`Properties`,runover:{},childs:[]});e.controls.add(t)}},1),n(d,{head:[`Property`,`Access`,`Description`],rows:F,runover:{},childs:[]}),n(`h3`,{initializeComponent:e=>{let t=n(u,{text:`Methods`,runover:{},childs:[]});e.controls.add(t)}},1),n(d,{head:[`Method`,`Returns`,`Description`],rows:I,runover:{},childs:[]}),n(`h3`,{initializeComponent:e=>{let t=n(u,{text:`Events`,runover:{},childs:[]});e.controls.add(t)}},1),n(d,{head:[`Event`,`When`],rows:L,runover:{},childs:[]})]});e.controls.add(y)}}})}export{H as default};