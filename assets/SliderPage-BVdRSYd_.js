import{Mt as e,a as t,an as n,h as r,i,n as a,nn as o,r as s,rn as c,t as l}from"./doc-B1CtlCkV.js";import{t as u}from"./Slider-D6UsQ1ml.js";import{t as d}from"./Stack-AS0iyAxC.js";import{t as f}from"./sources-BXVvOiIY.js";import{t as p}from"./kit-texts-BRS-kYEc.js";var m=`import { reactive } from '@motifx/core';\r
import { Slider } from '@motifx-community/ui';\r
\r
/** A value on either side of a middle: the active part runs from the origin to the thumb. */\r
export default function Centred() {\r
  const s = reactive({ balance: -30 });\r
  return (\r
    <>\r
      <Slider label="Balance" min={-100} max={100} origin={0} showValue="drag" x-model={() => s.balance} />\r
      <output class="sl-balance">{() => \`balance: \${s.balance}\`}</output>\r
    </>\r
  );\r
}\r
`,h=`import { reactive } from '@motifx/core';\r
import { Button, Slider, uiLocale } from '@motifx-community/ui';\r
import { kitTexts } from '../../../shared/kit-texts';\r
\r
/** Switches the names of the thumbs; the price slider writes its numbers in the chosen language. */\r
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
        The start thumb is named <output class="sl-minimum">{() => kitTexts.strings.minimum}</output>\r
      </span>\r
      <Slider\r
        label={() => (s.lang === 'en' ? 'Price' : 'Fiyat')}\r
        range\r
        max={1000}\r
        step={50}\r
        value={[200, 800]}\r
        showValue="drag"\r
        locale={() => s.lang}\r
        format={{ style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }}\r
      />\r
    </>\r
  );\r
}\r
`,g=`import { reactive } from '@motifx/core';\r
import { Button, Slider, Stack } from '@motifx-community/ui';\r
\r
/** A slider bound to state with x-model, and sliders created with \`new\` and added programmatically. */\r
export default function Programmatic() {\r
  const s = reactive({ volume: 40, result: '' });\r
  let added = 0;\r
  let host: Stack | null = null;\r
\r
  const addProgrammatic = () => {\r
    const slider = new Slider({ label: \`Slider \${++added}\`, showValue: 'drag' });\r
    slider.value = 50;\r
    slider.onValueChanged((e) => (s.result = \`\${slider.label}: \${String(e.value)}\`));\r
    host?.controls.add(slider);\r
    slider.focus();\r
  };\r
\r
  return (\r
    <>\r
      <Slider label="&Volume" x-model={() => s.volume} helpText={() => \`Volume: \${s.volume}\`} />\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Button text="Add a slider programmatically" variant="outline" onclick={addProgrammatic} />\r
        <output class="sl-result">{() => s.result}</output>\r
      </Stack>\r
      <Stack orientation="horizontal" wrap align="center" ref={(c: Stack) => (host = c)} />\r
    </>\r
  );\r
}\r
`,_=`import { reactive } from '@motifx/core';\r
import { Slider, type SliderValue } from '@motifx-community/ui';\r
\r
const EURO: Intl.NumberFormatOptions = { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 };\r
\r
/** Two thumbs that cannot cross, kept apart by minDistance. */\r
export default function Range() {\r
  const s = reactive({ price: [120, 380] as SliderValue });\r
  return (\r
    <>\r
      <Slider label="Price" range max={500} step={10} minDistance={50} format={EURO} showValue="drag" x-model={() => s.price} />\r
      <output class="sl-price">{() => \`value: [\${(s.price as number[]).join(', ')}]\`}</output>\r
    </>\r
  );\r
}\r
`,v=`import { reactive } from '@motifx/core';\r
import { Button, Slider, Stack } from '@motifx-community/ui';\r
\r
/** The three sizes, read-only and disabled following state, and a range rule checked while it moves. */\r
export default function States() {\r
  const s = reactive({ editable: true, age: 16 });\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Slider label="Small" size="sm" value={30} />\r
        <Slider label="Medium" value={50} />\r
        <Slider label="Large" size="lg" value={70} />\r
      </Stack>\r
      <Button text="Toggle" variant="outline" onclick={() => (s.editable = !s.editable)} />\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Slider label="Read-only" value={30} readOnly={() => !s.editable} />\r
        <Slider label="Disabled" range value={[20, 60]} enabled={() => s.editable} />\r
      </Stack>\r
      <Slider label="Age" max={99} validateOn="input" rules={[{ type: 'range', min: 18, message: 'You must be 18 or older.' }]} x-model={() => s.age} />\r
    </>\r
  );\r
}\r
`,y=`import { reactive } from '@motifx/core';\r
import { Slider } from '@motifx-community/ui';\r
\r
/** Steps, a mark at every step or in equal parts, and formatted labels under them. */\r
export default function StepsAndMarks() {\r
  const s = reactive({ zoom: 100, rating: 6 });\r
  return (\r
    <>\r
      <Slider label="Zoom" min={25} max={200} step={25} ticks tickLabels format={{ style: 'unit', unit: 'percent' }} x-model={() => s.zoom} />\r
      <Slider label="Rating" max={10} ticks={5} tickLabels x-model={() => s.rating} />\r
      <Slider label="Opacity" max={1} step={0} value={0.5} tickLabels showValue="drag" format={{ style: 'percent' }} />\r
    </>\r
  );\r
}\r
`,b=`import { reactive } from '@motifx/core';\r
import { Slider } from '@motifx-community/ui';\r
\r
/** A value that follows the thumb, next to one that changes only when the thumb is let go. */\r
export default function UpdateOn() {\r
  const s = reactive({ live: 50, committed: 50 });\r
  return (\r
    <>\r
      <Slider label="Live" showValue="drag" x-model={() => s.live} />\r
      <output class="sl-live">{() => \`live: \${s.live}\`}</output>\r
      <Slider label="On release" updateOn="change" showValue="drag" x-model={() => s.committed} />\r
      <output class="sl-committed">{() => \`on release: \${s.committed}\`}</output>\r
    </>\r
  );\r
}\r
`,x=`import { reactive } from '@motifx/core';\r
import { Button, Slider, Stack, type SliderShowValue } from '@motifx-community/ui';\r
\r
const SHOW: SliderShowValue[] = ['never', 'drag', 'always'];\r
\r
/** The value bubble shown never, while moved or always, written with a format and read out with valueText. */\r
export default function ValueBubble() {\r
  const s = reactive({ show: 'drag' as SliderShowValue, temp: 21 });\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Show value">\r
        {SHOW.map((show) => (\r
          <Button\r
            key={show}\r
            text={show}\r
            size="sm"\r
            variant={() => (s.show === show ? 'solid' : 'ghost')}\r
            aria-pressed={() => s.show === show}\r
            onclick={() => (s.show = show)}\r
          />\r
        ))}\r
      </Stack>\r
      <Slider\r
        label="Temperature"\r
        min={16}\r
        max={28}\r
        step={0.5}\r
        showValue={() => s.show}\r
        format={{ style: 'unit', unit: 'celsius' }}\r
        valueText={(v) => \`\${v} degrees\`}\r
        x-model={() => s.temp}\r
      />\r
    </>\r
  );\r
}\r
`,S=`import { reactive } from '@motifx/core';\r
import { Slider } from '@motifx-community/ui';\r
\r
/** Three vertical sliders, as in an equalizer: up is more. */\r
export default function Vertical() {\r
  const s = reactive({ bass: 4, mid: 0, treble: -2 });\r
  return (\r
    <>\r
      <Slider label="Bass" orientation="vertical" min={-12} max={12} ticks={4} tickLabels showValue="drag" x-model={() => s.bass} />\r
      <Slider label="Mid" orientation="vertical" min={-12} max={12} ticks={4} tickLabels showValue="drag" x-model={() => s.mid} />\r
      <Slider label="Treble" orientation="vertical" min={-12} max={12} ticks={4} tickLabels showValue="drag" x-model={() => s.treble} />\r
    </>\r
  );\r
}\r
`;function C(){let e=n({balance:-30});return c({initializeComponent:t=>{{let n=o(u,{label:`Balance`,min:-100,max:100,origin:0,showValue:`drag`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.balance,t=>{let n=e;n!=null&&typeof n.balance!=`function`&&(n.balance=t)})}},childs:[]});t.controls.add(n);let r=o(`output`,{initializeComponent:t=>{t.class.add(`sl-balance`),t.bindings.method(()=>`balance: ${e.balance}`)}},1);t.controls.add(r)}}})}function w(){let e=n({volume:40,result:``}),t=0,i=null,a=()=>{let n=new u({label:`Slider ${++t}`,showValue:`drag`});n.value=50,n.onValueChanged(t=>e.result=`${n.label}: ${String(t.value)}`),i?.controls.add(n),n.focus()};return c({initializeComponent:t=>{{let n=o(u,{label:`&Volume`,helpText:()=>`Volume: ${e.volume}`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.volume,t=>{let n=e;n!=null&&typeof n.volume!=`function`&&(n.volume=t)})}},childs:[]});t.controls.add(n);let s=o(d,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[o(r,{text:`Add a slider programmatically`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,a)}},childs:[]}),o(`output`,{initializeComponent:t=>{t.class.add(`sl-result`),t.bindings.method(()=>e.result)}},1)]});t.controls.add(s);let c=o(d,{orientation:`horizontal`,wrap:!0,align:`center`,ref:e=>i=e,runover:{},childs:[]});t.controls.add(c)}}})}function T(){let t=n({lang:`en`}),i=()=>{t.lang=t.lang===`en`?`tr`:`en`,e.use(t.lang)};return c({initializeComponent:e=>{{let n=o(r,{text:()=>t.lang===`en`?`Language: English`:`Dil: Türkçe`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,i)}},childs:[]});e.controls.add(n);let a=o(`span`,{initializeComponent:e=>{let t=o(`text`,{initializeComponent:e=>{e.setText(`The start thumb is named `)}},1);e.controls.add(t);let n=o(`output`,{initializeComponent:e=>{e.class.add(`sl-minimum`),e.bindings.method(()=>p.strings.minimum)}},1);e.controls.add(n)}},1);e.controls.add(a);let s=o(u,{label:()=>t.lang===`en`?`Price`:`Fiyat`,range:!0,max:1e3,step:50,value:[200,800],showValue:`drag`,locale:()=>t.lang,format:{style:`currency`,currency:`TRY`,maximumFractionDigits:0},runover:{},childs:[]});e.controls.add(s)}}})}var E={style:`currency`,currency:`EUR`,maximumFractionDigits:0};function D(){let e=n({price:[120,380]});return c({initializeComponent:t=>{{let n=o(u,{label:`Price`,range:!0,max:500,step:10,minDistance:50,format:E,showValue:`drag`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.price,t=>{let n=e;n!=null&&typeof n.price!=`function`&&(n.price=t)})}},childs:[]});t.controls.add(n);let r=o(`output`,{initializeComponent:t=>{t.class.add(`sl-price`),t.bindings.method(()=>`value: [${e.price.join(`, `)}]`)}},1);t.controls.add(r)}}})}function O(){let e=n({editable:!0,age:16});return c({initializeComponent:t=>{{let n=o(d,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[o(u,{label:`Small`,size:`sm`,value:30,runover:{},childs:[]}),o(u,{label:`Medium`,value:50,runover:{},childs:[]}),o(u,{label:`Large`,size:`lg`,value:70,runover:{},childs:[]})]});t.controls.add(n);let i=o(r,{text:`Toggle`,variant:`outline`,runover:{initializeComponent:t=>{t.motif.on(`click`,()=>e.editable=!e.editable)}},childs:[]});t.controls.add(i);let a=o(d,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[o(u,{label:`Read-only`,value:30,readOnly:()=>!e.editable,runover:{},childs:[]}),o(u,{label:`Disabled`,range:!0,value:[20,60],enabled:()=>e.editable,runover:{},childs:[]})]});t.controls.add(a);let s=o(u,{label:`Age`,max:99,validateOn:`input`,rules:[{type:`range`,min:18,message:`You must be 18 or older.`}],runover:{initializeComponent:t=>{t.bindings.model(()=>e.age,t=>{let n=e;n!=null&&typeof n.age!=`function`&&(n.age=t)})}},childs:[]});t.controls.add(s)}}})}function k(){let e=n({zoom:100,rating:6});return c({initializeComponent:t=>{{let n=o(u,{label:`Zoom`,min:25,max:200,step:25,ticks:!0,tickLabels:!0,format:{style:`unit`,unit:`percent`},runover:{initializeComponent:t=>{t.bindings.model(()=>e.zoom,t=>{let n=e;n!=null&&typeof n.zoom!=`function`&&(n.zoom=t)})}},childs:[]});t.controls.add(n);let r=o(u,{label:`Rating`,max:10,ticks:5,tickLabels:!0,runover:{initializeComponent:t=>{t.bindings.model(()=>e.rating,t=>{let n=e;n!=null&&typeof n.rating!=`function`&&(n.rating=t)})}},childs:[]});t.controls.add(r);let i=o(u,{label:`Opacity`,max:1,step:0,value:.5,tickLabels:!0,showValue:`drag`,format:{style:`percent`},runover:{},childs:[]});t.controls.add(i)}}})}function A(){let e=n({live:50,committed:50});return c({initializeComponent:t=>{{let n=o(u,{label:`Live`,showValue:`drag`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.live,t=>{let n=e;n!=null&&typeof n.live!=`function`&&(n.live=t)})}},childs:[]});t.controls.add(n);let r=o(`output`,{initializeComponent:t=>{t.class.add(`sl-live`),t.bindings.method(()=>`live: ${e.live}`)}},1);t.controls.add(r);let i=o(u,{label:`On release`,updateOn:`change`,showValue:`drag`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.committed,t=>{let n=e;n!=null&&typeof n.committed!=`function`&&(n.committed=t)})}},childs:[]});t.controls.add(i);let a=o(`output`,{initializeComponent:t=>{t.class.add(`sl-committed`),t.bindings.method(()=>`on release: ${e.committed}`)}},1);t.controls.add(a)}}})}var j=[`never`,`drag`,`always`];function M(){let e=n({show:`drag`,temp:21});return c({initializeComponent:t=>{{let n=o(d,{orientation:`horizontal`,wrap:!0,align:`center`,role:`group`,"aria-label":`Show value`,runover:{},childs:[o({initializeComponent:t=>{t.bindings.list(()=>j??[],t=>o(r,{indexkey:()=>t,text:t,size:`sm`,variant:()=>e.show===t?`solid`:`ghost`,"aria-pressed":()=>e.show===t,runover:{initializeComponent:n=>{n.motif.on(`click`,()=>e.show=t)}},childs:[]}))}})]});t.controls.add(n);let i=o(u,{label:`Temperature`,min:16,max:28,step:.5,showValue:()=>e.show,format:{style:`unit`,unit:`celsius`},valueText:e=>`${e} degrees`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.temp,t=>{let n=e;n!=null&&typeof n.temp!=`function`&&(n.temp=t)})}},childs:[]});t.controls.add(i)}}})}function N(){let e=n({bass:4,mid:0,treble:-2});return c({initializeComponent:t=>{{let n=o(u,{label:`Bass`,orientation:`vertical`,min:-12,max:12,ticks:4,tickLabels:!0,showValue:`drag`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.bass,t=>{let n=e;n!=null&&typeof n.bass!=`function`&&(n.bass=t)})}},childs:[]});t.controls.add(n);let r=o(u,{label:`Mid`,orientation:`vertical`,min:-12,max:12,ticks:4,tickLabels:!0,showValue:`drag`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.mid,t=>{let n=e;n!=null&&typeof n.mid!=`function`&&(n.mid=t)})}},childs:[]});t.controls.add(r);let i=o(u,{label:`Treble`,orientation:`vertical`,min:-12,max:12,ticks:4,tickLabels:!0,showValue:`drag`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.treble,t=>{let n=e;n!=null&&typeof n.treble!=`function`&&(n.treble=t)})}},childs:[]});t.controls.add(i)}}})}var P=f(Object.assign({"./examples/Centred.tsx":m,"./examples/Localization.tsx":h,"./examples/Programmatic.tsx":g,"./examples/Range.tsx":_,"./examples/States.tsx":v,"./examples/StepsAndMarks.tsx":y,"./examples/UpdateOn.tsx":b,"./examples/ValueBubble.tsx":x,"./examples/Vertical.tsx":S})),F=[[`value`,"`Bind<number | [number, number]>`","`min` / `[min, max]`","The value, or `[start, end]` with `range`. `x-model` provides two-way binding. The value is kept on a step and within the limits."],[`label`,"`Bind<string>`","`''`","The label. Writing `&Name` makes Alt+N move focus to the thumb. This is the same property as `text`."],[`min / max`,"`Bind<number>`","`0` / `100`",`The limits. When they change, the value is adjusted and written back.`],[`step`,"`Bind<number>`","`1`","The values a thumb stops at, counted from `min`. Use `0` for continuous values."],[`largeStep`,"`Bind<number>`","`10 × step`",`The amount Page Up and Page Down move the thumb.`],[`range`,"`Bind<boolean>`","`false`","Shows two thumbs, and the value is `[start, end]`. The thumbs cannot cross."],[`minDistance`,"`Bind<number>`","`0`",`The minimum distance between the two thumbs.`],[`origin`,"`Bind<number | undefined>`","`undefined`","Creates a centered slider, where the active part of the track runs from this value to the thumb in either direction. It cannot be used with `range`."],[`orientation`,"`Bind<'horizontal' | 'vertical'>`","`'horizontal'`",`Makes the slider vertical, with higher values at the top.`],[`ticks`,"`Bind<boolean | number>`","`false`","`true` adds a mark at every step (up to 1000), and a number adds that many equal parts."],[`tickLabels`,"`Bind<boolean>`","`false`",`Shows values under the marks, or at the two ends if there are no marks.`],[`showValue`,"`Bind<'never' | 'drag' | 'always'>`","`'never'`",`Shows a value tooltip above the thumb: never, while it moves (with the pointer or keyboard), or always.`],[`format`,"`Bind<Intl.NumberFormatOptions | null>`","`null`",`The format used by the tooltip, the tick labels and screen readers.`],[`locale`,"`Bind<string>`","The page `lang`","The locale of `format`."],[`valueText`,"`(value: number) => string`",`—`,`The text screen readers announce for a value. Because it is a function, it is stored as is and not bound.`],[`updateOn`,"`Bind<'input' | 'change'>`","`'input'`","With `change`, the value updates when the thumb is released. The thumb still moves during the drag."],[`name`,"`Bind<string>`","`''`",`The name submitted with the form. A range submits two values.`],[`helpText, hint, prefix, suffix, icon`,`see TextBox`,``,"Parts common to all fields. `prefix` and `suffix` appear at the two ends of the track."],[`readOnly`,"`Bind<boolean>`","`false`",`The slider can receive focus and be read, but not moved.`],[`size`,"`Bind<ControlSize>`","`'md'`","`sm`, `md` or `lg`, which set the size of the rail and the thumbs."],[`stretch`,"`Bind<boolean>`","`false`",`Stretches to the full width of its container.`],[`rules, error, validateOn, validationGroup`,`see TextBox`,``,`Validation works the same way as for all fields.`],[`enabled / disabled, visible, tabStop, tabIndex`,`see Control`,``,`Properties shared by all controls.`]],I=[[`every prop above`,`read/write, reactive`,`Accepts a value or a function, the same as the prop.`],[`thumbElements`,`read-only`,"The thumb elements, `[start, end]`. The end thumb is hidden without `range`."],[`isValid, validationMessage, validating`,`read-only, reactive`,`These work the same way as on all fields.`]],L=[[`formatValue(value)`,"`string`",`Formats a value the same way as the tooltip.`],[`focus()`,"`boolean`",`Sets focus on the first thumb.`],[`validate() / resetValidation()`,"`Promise<boolean>` / `void`",`These work the same way as on all fields.`]],R=[[`onValueChanged(e)`,"Occurs when the value changes. `e`: `{ value, previousValue, byUser, source, event? }`."],[`onValidated(e)`,`Occurs when validation finishes.`]],z=[[`Right / Up arrow`,`Increases the value by one step. On right-to-left pages, Left increases the value on a horizontal slider.`],[`Left / Down arrow`,`Decreases the value by one step.`],[`Page Up / Page Down`,"Increases or decreases the value by `largeStep`."],[`Home / End`,`Moves to the minimum or maximum. With two thumbs, the other thumb sets the limit.`],[`Tab`,`Each thumb is a Tab stop.`],["Alt + key (`&Name`)",`Sets focus on the first thumb.`]],B=[[`Thumb`,'`role="slider"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax` and `aria-orientation`, and `aria-valuetext` when `format` or `valueText` is set.'],[`Name`,'A single thumb is named by the label. Two thumbs sit in a `role="group"` named by the label, and each thumb is named by the label and its end ("Minimum", "Maximum").'],[`Two thumbs`,"The `aria-valuemax` of the start thumb is the value of the end thumb, and vice versa, as the APG multi-thumb slider pattern specifies."],[`States`,"`aria-readonly`, `aria-invalid` and `aria-disabled` on the thumbs. The help text describes them."],[`Pointer`,`The pointer is captured during a drag, and clicking the track moves the nearest thumb. The track is as tall as a touch target.`]],V=[[`.mx-slider`,"The field. `data-size`, `data-orientation`, `data-range`, `data-show-value`, `data-ticks`, `data-tick-labels`, `data-dragging`, `data-readonly`, `data-disabled`, `data-invalid`, `data-split`."],[`.mx-slider__control`,`The pointer target: the track and the tick marks.`],[`.mx-slider__track, .mx-slider__rail`,'The track and the rail that holds its segments (`--_from`, `--_to`; `data-from="start | thumb | origin"`, `data-to="thumb | origin | end"`, `data-start-active`, `data-end-active`).'],[`.mx-slider__fill, .mx-slider__segment`,"The active segment and the inactive segments before and after it (`data-side`)."],[`.mx-slider__thumb`,'A thumb\'s pressable area (`data-thumb="start | end"`, `data-dragging`, `--_at`).'],[`.mx-slider__halo, .mx-slider__knob, .mx-slider__core`,`The visual parts of a thumb, centered on it: a halo, the knob and the inner part of the knob.`],[`.mx-slider__bubble`,`The value tooltip above a thumb.`],[`.mx-slider__ticks, .mx-slider__tick, .mx-slider__tick-label`,"The tick marks (`data-mark`, `data-active`, `--_at`) and their labels."]],H=[[`slider.track, slider.active, slider.stop`,"Units: the inactive segments (`before`, `after`), the active segment (`from-start`, `to-end`) and the end dots (`active`), each with a box per state (`hover`, `focus`, `pressed`, `readonly`, `disabled`)."],[`slider.halo, slider.knob, slider.core`,"Units: the visual parts of a thumb, with a box per state (`hover`, `focus`, `pressed`, `readonly`, `disabled`)."],[`slider.bubble, slider.bubble-arrow, slider.tick, slider.tick-label, slider.ring`,`Units: the value tooltip and its arrow, the tick marks and labels, and a ring around the whole control during keyboard use.`],[`slider.track-thickness.*, slider.active-thickness.*`,`The inactive and active segments, per size.`],[`slider.thumb-width.*, slider.thumb-height.*, slider.thumb-core-size.*`,`The knob along and across the track, and its inner part, per size.`],[`slider.track-gap, slider.origin-gap, slider.stop-inset`,`A track split around the thumbs and the origin, and the position of its end dots.`],[`slider.hit-size`,`The height of the track for the pointer, and the touch target of a thumb.`],[`slider.vertical-length`,`The length of a vertical slider.`],[`slider.tick-length, slider.tick-width, slider.tick-offset, slider.tick-gap, slider.tick-line-height, slider.tick-label-width`,`The position of the tick marks and their labels.`],[`slider.bubble-gap, slider.bubble-arrow-size`,`The distance between the tooltip and its thumb, and the tooltip arrow.`],[`field.width`,`The width of a horizontal slider, the same as all fields.`]];function U(){return c({initializeComponent:e=>{{let n=o(`p`,{initializeComponent:e=>{e.class.add(`lead`);let t=o(s,{text:`Selects a value on a track by dragging a thumb or using the keyboard. It supports a single number or a range with two thumbs, steps, labeled tick marks, a value tooltip, a vertical orientation and number formatting, along with the label, help text and validation common to all fields.`,runover:{},childs:[]});e.controls.add(t)}},1);e.controls.add(n);let r=o(i,{anchor:`import`,title:`Import`,runover:{},childs:[o(t,{code:`
import { Slider, type SliderValue } from '@motifx-community/ui';
`,runover:{},childs:[]})]});e.controls.add(r);let c=o(i,{anchor:`ways`,title:`Declarative and programmatic`,runover:{},childs:[o(`p`,{initializeComponent:e=>{let t=o(s,{text:"Every prop accepts a value or a function, and `x-model` provides two-way binding for the value. When you create the component with `new`, set the same properties programmatically.",runover:{},childs:[]});e.controls.add(t)}},1),o(a,{files:P(`Programmatic.tsx`),stack:!0,runover:{},childs:[o(w,{runover:{},childs:[]})]})]});e.controls.add(c);let u=o(i,{anchor:`range`,title:`Range slider`,runover:{},childs:[o(`p`,{initializeComponent:e=>{let t=o(s,{text:"With `range`, there are two thumbs and the value is `[start, end]`. The thumbs cannot cross, and `minDistance` keeps them apart. Clicking the track moves the nearest thumb.",runover:{},childs:[]});e.controls.add(t)}},1),o(a,{files:P(`Range.tsx`),stack:!0,runover:{},childs:[o(D,{runover:{},childs:[]})]})]});e.controls.add(u);let d=o(i,{anchor:`centred`,title:`Centered slider`,runover:{},childs:[o(`p`,{initializeComponent:e=>{let t=o(s,{text:"With `origin`, the active part of the track runs from that value to the thumb in either direction. Use it for values such as balance, offset or correction.",runover:{},childs:[]});e.controls.add(t)}},1),o(a,{files:P(`Centred.tsx`),stack:!0,runover:{},childs:[o(C,{runover:{},childs:[]})]})]});e.controls.add(d);let f=o(i,{anchor:`ticks`,title:`Steps and tick marks`,runover:{},childs:[o(`p`,{initializeComponent:e=>{let t=o(s,{text:"`step` sets the values a thumb stops at. `ticks` draws a mark at every step, or divides the track into that many equal parts when set to a number. `tickLabels` shows the values under the marks.",runover:{},childs:[]});e.controls.add(t)}},1),o(a,{files:P(`StepsAndMarks.tsx`),stack:!0,runover:{},childs:[o(k,{runover:{},childs:[]})]})]});e.controls.add(f);let p=o(i,{anchor:`bubble`,title:`Value tooltip and format`,runover:{},childs:[o(`p`,{initializeComponent:e=>{let t=o(s,{text:"`showValue` displays the value in a tooltip above the thumb, either while it moves (`drag`, which includes keyboard changes) or `always`. `format` formats it with `Intl.NumberFormat`, and `valueText` provides custom text for screen readers.",runover:{},childs:[]});e.controls.add(t)}},1),o(a,{files:P(`ValueBubble.tsx`),stack:!0,runover:{},childs:[o(M,{runover:{},childs:[]})]})]});e.controls.add(p);let m=o(i,{anchor:`vertical`,title:`Vertical orientation`,runover:{},childs:[o(`p`,{initializeComponent:e=>{let t=o(s,{text:'`orientation="vertical"` makes the track vertical. Up is greater, and the Up arrow moves the thumb up.',runover:{},childs:[]});e.controls.add(t)}},1),o(a,{files:P(`Vertical.tsx`),runover:{},childs:[o(N,{runover:{},childs:[]})]})]});e.controls.add(m);let h=o(i,{anchor:`update-on`,title:`Update timing`,runover:{},childs:[o(`p`,{initializeComponent:e=>{let t=o(s,{text:'By default, the value updates as the thumb is dragged. With `updateOn="change"`, it updates once when the thumb is released, which is useful for work that should not run on every movement, such as a search. Keyboard changes apply immediately in both cases.',runover:{},childs:[]});e.controls.add(t)}},1),o(a,{files:P(`UpdateOn.tsx`),stack:!0,runover:{},childs:[o(A,{runover:{},childs:[]})]})]});e.controls.add(h);let g=o(i,{anchor:`states`,title:`Sizes, read-only, disabled and validation`,runover:{},childs:[o(a,{files:P(`States.tsx`),stack:!0,runover:{},childs:[o(O,{runover:{},childs:[]})]})]});e.controls.add(g);let _=o(i,{anchor:`keyboard`,title:`Keyboard`,runover:{},childs:[o(l,{head:[`Key`,`Description`],rows:z,runover:{},childs:[]})]});e.controls.add(_);let v=o(i,{anchor:`a11y`,title:`Accessibility`,runover:{},childs:[o(l,{head:[`Topic`,`Details`],rows:B,runover:{},childs:[]})]});e.controls.add(v);let y=o(i,{anchor:`i18n`,title:`Localization`,runover:{},childs:[o(`p`,{initializeComponent:e=>{let t=o(s,{text:"The names of the two thumbs in a range come from `uiLocale.strings` (`minimum`, `maximum`). Numbers use `locale`, which defaults to the page `lang`.",runover:{},childs:[]});e.controls.add(t)}},1),o(a,{files:P(`Localization.tsx`),runover:{},childs:[o(T,{runover:{},childs:[]})]})]});e.controls.add(y);let b=o(i,{anchor:`styling`,title:`Styling`,runover:{},childs:[o(l,{head:[`Hook`,`Description`],rows:V,runover:{},childs:[]}),o(`h3`,{initializeComponent:e=>{let t=o(s,{text:`Component tokens`,runover:{},childs:[]});e.controls.add(t)}},1),o(l,{head:[`Token`,`Description`],rows:H,runover:{},childs:[]})]});e.controls.add(b);let x=o(i,{anchor:`api`,title:`API reference`,runover:{},childs:[o(`h3`,{initializeComponent:e=>{let t=o(s,{text:`Props`,runover:{},childs:[]});e.controls.add(t)}},1),o(l,{head:[`Prop`,`Type`,`Default`,`Description`],rows:F,runover:{},childs:[]}),o(`h3`,{initializeComponent:e=>{let t=o(s,{text:`Properties`,runover:{},childs:[]});e.controls.add(t)}},1),o(l,{head:[`Property`,`Access`,`Description`],rows:I,runover:{},childs:[]}),o(`h3`,{initializeComponent:e=>{let t=o(s,{text:`Methods`,runover:{},childs:[]});e.controls.add(t)}},1),o(l,{head:[`Method`,`Returns`,`Description`],rows:L,runover:{},childs:[]}),o(`h3`,{initializeComponent:e=>{let t=o(s,{text:`Events`,runover:{},childs:[]});e.controls.add(t)}},1),o(l,{head:[`Event`,`When`],rows:R,runover:{},childs:[]})]});e.controls.add(x)}}})}export{U as default};