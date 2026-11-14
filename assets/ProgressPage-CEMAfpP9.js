import{F as e,Qn as t,Zn as n,er as r,n as i}from"./next-id-CtzpBrBT.js";import{t as a}from"./TextBox-iHQY3j6o.js";import{t as o}from"./ProgressBar-CQQpuXpf.js";import{t as s}from"./Spinner-Dz-aVxJr.js";import{t as c}from"./Panel-D_MXZsSp.js";import{t as l}from"./Stack-wRt1e9tO.js";import{a as u,i as d,n as f,r as p,t as m}from"./docs-B_LZlyP5.js";import{t as h}from"./sources-BXVvOiIY.js";import{t as g}from"./kit-texts-BMQUznlf.js";var _=`import { reactive } from '@motifx/core';\r
import { Button, Panel, Spinner, Stack, TextBox } from '@motifx-community/ui';\r
\r
/** A spinner over a panel while its orders load. Focus waits on it and then returns. */\r
export default function Cover() {\r
  const s = reactive({ result: '' });\r
  let panel: Panel | null = null;\r
\r
  // Simulates a server call.\r
  const loadOrders = () => new Promise((resolve) => setTimeout(resolve, 1500));\r
\r
  const load = async () => {\r
    if (!panel) return;\r
    const done = Spinner.cover(panel, { label: 'Loading orders' });\r
    try {\r
      await loadOrders();\r
    } finally {\r
      done();\r
    }\r
    s.result = 'Orders loaded.';\r
  };\r
\r
  return (\r
    <>\r
      <Panel class="pr-panel" variant="outline" padding="md" ref={(c: Panel) => (panel = c)}>\r
        <Stack orientation="horizontal" wrap align="center">\r
          <TextBox label="Customer" value="Ada" />\r
          <Button text="Load orders" tone="accent" onclick={load} />\r
        </Stack>\r
      </Panel>\r
      <output>{() => s.result}</output>\r
    </>\r
  );\r
}\r
`,v=`import { reactive } from '@motifx/core';\r
import { Button, Spinner, Stack } from '@motifx-community/ui';\r
\r
/** A spinner with a delay: quick work shows nothing, slow work shows it. */\r
export default function Delay() {\r
  const s = reactive({ busy: false, result: '' });\r
\r
  const work = (ms: number) => {\r
    s.busy = true;\r
    s.result = '';\r
    setTimeout(() => {\r
      s.busy = false;\r
      s.result = \`Done after \${ms} ms.\`;\r
    }, ms);\r
  };\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Button text="Quick work (200 ms)" variant="outline" onclick={() => work(200)} />\r
        <Button text="Slow work (2 s)" variant="outline" onclick={() => work(2000)} />\r
        <Spinner label="Working" delay={400} visible={() => s.busy} />\r
      </Stack>\r
      <output class="pr-result">{() => s.result}</output>\r
    </>\r
  );\r
}\r
`,y=`import { reactive } from '@motifx/core';\r
import { Button, ProgressBar, uiLocale } from '@motifx-community/ui';\r
import { kitTexts } from '../../../shared/kit-texts';\r
\r
/** Switches the name of unlabelled bars and spinners, and the language the percent is written in. */\r
export default function Localization() {\r
  const s = reactive({ lang: 'en' });\r
  const toggle = () => {\r
    s.lang = s.lang === 'en' ? 'tr' : 'en';\r
    void uiLocale.use(s.lang);\r
  };\r
  return (\r
    <>\r
      <Button text={() => (s.lang === 'en' ? 'Language: English' : 'Dil: Türkçe')} variant="outline" onclick={toggle} />\r
      <ProgressBar value={40} showValue locale={() => s.lang} />\r
      <span>\r
        Unlabelled ones are named <output class="pr-loading">{() => kitTexts.strings.loading}</output>\r
      </span>\r
    </>\r
  );\r
}\r
`,b=`import { reactive } from '@motifx/core';\r
import { Button, ProgressBar } from '@motifx-community/ui';\r
\r
/** A bar without a value, and one that runs until the work knows how much there is to do. */\r
export default function NotKnown() {\r
  const copy = reactive({ done: 0, total: 12, running: false });\r
\r
  const start = () => {\r
    copy.running = true;\r
    copy.done = 0;\r
    copy.total = 0;\r
    // The files are counted first; until then there is no total.\r
    setTimeout(() => {\r
      copy.total = 12;\r
      const timer = setInterval(() => {\r
        copy.done++;\r
        if (copy.done < copy.total) return;\r
        clearInterval(timer);\r
        copy.running = false;\r
      }, 150);\r
    }, 1000);\r
  };\r
\r
  return (\r
    <>\r
      <ProgressBar label="Preparing" value={null} />\r
      <ProgressBar label="Copying" value={() => (copy.total ? copy.done : null)} max={() => copy.total} />\r
      <Button text="Copy" variant="outline" enabled={() => !copy.running} onclick={start} />\r
    </>\r
  );\r
}\r
`,x=`import { reactive } from '@motifx/core';\r
import { Button, ProgressBar, Stack } from '@motifx-community/ui';\r
\r
/** A bar that follows an upload, and bars created with \`new\` and added programmatically. */\r
export default function Programmatic() {\r
  const s = reactive({ upload: 0, uploading: false });\r
  let added = 0;\r
  let host: Stack | null = null;\r
\r
  const upload = () => {\r
    if (s.uploading) return;\r
    s.uploading = true;\r
    s.upload = 0;\r
    const timer = setInterval(() => {\r
      s.upload = Math.min(100, s.upload + 7);\r
      if (s.upload < 100) return;\r
      clearInterval(timer);\r
      s.uploading = false;\r
    }, 120);\r
  };\r
\r
  const addProgrammatic = () => {\r
    const bar = new ProgressBar({ label: \`Task \${++added}\`, showValue: true, tone: 'success' });\r
    bar.value = 25 * added;\r
    host?.controls.add(bar);\r
  };\r
\r
  return (\r
    <>\r
      <ProgressBar label="Uploading" value={() => s.upload} showValue stretch />\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Button text="Upload" tone="accent" enabled={() => !s.uploading} onclick={upload} />\r
        <Button text="Add a bar programmatically" variant="outline" onclick={addProgrammatic} />\r
      </Stack>\r
      <Stack orientation="horizontal" wrap align="center" ref={(c: Stack) => (host = c)} />\r
    </>\r
  );\r
}\r
`,S=`import { reactive } from '@motifx/core';\r
import { Button, ProgressBar, Stack, type ControlSize } from '@motifx-community/ui';\r
\r
const VALUES = [5, 30, 70, 100, null];\r
\r
const SIZES: ControlSize[] = ['sm', 'md', 'lg'];\r
\r
/** The same values as a line and as a circle, a circle in each size, and one of each that follows some work. */\r
export default function Shapes() {\r
  const s = reactive({ done: 0, running: false });\r
\r
  const run = () => {\r
    if (s.running) return;\r
    s.running = true;\r
    s.done = 0;\r
    const timer = setInterval(() => {\r
      s.done = Math.min(100, s.done + 4);\r
      if (s.done < 100) return;\r
      clearInterval(timer);\r
      s.running = false;\r
    }, 160);\r
  };\r
\r
  return (\r
    <>\r
      {VALUES.map((value) => (\r
        <ProgressBar key={String(value)} label={value === null ? 'Not known' : 'Line'} value={value} showValue stretch />\r
      ))}\r
      <Stack orientation="horizontal" wrap align="start">\r
        {VALUES.map((value) => (\r
          <ProgressBar key={String(value)} shape="circle" label={value === null ? 'Not known' : 'Circle'} value={value} showValue />\r
        ))}\r
      </Stack>\r
      <Stack orientation="horizontal" wrap align="center">\r
        {SIZES.map((size) => (\r
          <ProgressBar key={size} shape="circle" size={size} label={\`Size \${size}\`} labelPosition="side" value={60} />\r
        ))}\r
      </Stack>\r
      <ProgressBar label="Importing" value={() => s.done} showValue stretch />\r
      <Stack orientation="horizontal" wrap align="center">\r
        <ProgressBar shape="circle" label="Importing" labelPosition="side" value={() => s.done} showValue />\r
        <Button text="Import" variant="outline" enabled={() => !s.running} onclick={run} />\r
      </Stack>\r
    </>\r
  );\r
}\r
`,C=`import { reactive } from '@motifx/core';\r
import { Button, ProgressBar, type ControlSize } from '@motifx-community/ui';\r
\r
const SIZES: ControlSize[] = ['sm', 'md', 'lg'];\r
\r
/** The three thicknesses, and a bar with its label beside it and the value in its own words. */\r
export default function Sizes() {\r
  const s = reactive({ files: 3 });\r
  return (\r
    <>\r
      {SIZES.map((size) => (\r
        <ProgressBar key={size} label={\`Size \${size}\`} size={size} value={60} />\r
      ))}\r
      <ProgressBar label="Files" labelPosition="side" max={12} value={() => s.files} showValue valueText={(v) => \`\${v} of 12\`} stretch />\r
      <Button text="One more file" size="sm" variant="outline" onclick={() => (s.files = s.files >= 12 ? 0 : s.files + 1)} />\r
    </>\r
  );\r
}\r
`,w=`import { Spinner, type ControlSize, type ProgressTone } from '@motifx-community/ui';\r
\r
const SIZES: ControlSize[] = ['sm', 'md', 'lg'];\r
const TONES: ProgressTone[] = ['neutral', 'success', 'caution', 'danger'];\r
\r
/** Spinners in every size, with a label beside or under them, in a container of their own, and in the tones. */\r
export default function Spinners() {\r
  return (\r
    <>\r
      {SIZES.map((size) => (\r
        <Spinner key={size} size={size} />\r
      ))}\r
      <Spinner label="Loading orders" />\r
      <Spinner label="Saving" labelPosition="bottom" size="lg" />\r
      <Spinner label="Syncing" labelPosition="bottom" size="lg" contained />\r
      {TONES.map((tone) => (\r
        <Spinner key={tone} tone={tone} size="sm" label={tone} />\r
      ))}\r
    </>\r
  );\r
}\r
`,T=`import { ProgressBar, type ProgressTone } from '@motifx-community/ui';\r
\r
const TONES: ProgressTone[] = ['accent', 'neutral', 'success', 'caution', 'danger'];\r
\r
/** A bar in every tone. */\r
export default function Tones() {\r
  return (\r
    <>\r
      {TONES.map((tone, i) => (\r
        <ProgressBar key={tone} label={tone} value={20 + i * 18} tone={tone} showValue />\r
      ))}\r
    </>\r
  );\r
}\r
`;function E(){let e=r({result:``}),o=null,u=()=>new Promise(e=>setTimeout(e,1500)),d=async()=>{if(!o)return;let t=s.cover(o,{label:`Loading orders`});try{await u()}finally{t()}e.result=`Orders loaded.`};return t({initializeComponent:t=>{{let r=n(c,{class:`pr-panel`,variant:`outline`,padding:`md`,ref:e=>o=e,runover:{},childs:[n(l,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[n(a,{label:`Customer`,value:`Ada`,runover:{},childs:[]}),n(i,{text:`Load orders`,tone:`accent`,runover:{initializeComponent:e=>{e.motif.on(`click`,d)}},childs:[]})]})]});t.controls.add(r);let s=n(`output`,{initializeComponent:t=>{t.bindings.method(()=>e.result)}},1);t.controls.add(s)}}})}function D(){let e=r({busy:!1,result:``}),a=t=>{e.busy=!0,e.result=``,setTimeout(()=>{e.busy=!1,e.result=`Done after ${t} ms.`},t)};return t({initializeComponent:t=>{{let r=n(l,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[n(i,{text:`Quick work (200 ms)`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,()=>a(200))}},childs:[]}),n(i,{text:`Slow work (2 s)`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,()=>a(2e3))}},childs:[]}),n(s,{label:`Working`,delay:400,visible:()=>e.busy,runover:{},childs:[]})]});t.controls.add(r);let o=n(`output`,{initializeComponent:t=>{t.class.add(`pr-result`),t.bindings.method(()=>e.result)}},1);t.controls.add(o)}}})}function O(){let e=r({upload:0,uploading:!1}),a=0,s=null,c=()=>{if(e.uploading)return;e.uploading=!0,e.upload=0;let t=setInterval(()=>{e.upload=Math.min(100,e.upload+7),!(e.upload<100)&&(clearInterval(t),e.uploading=!1)},120)},u=()=>{let e=new o({label:`Task ${++a}`,showValue:!0,tone:`success`});e.value=25*a,s?.controls.add(e)};return t({initializeComponent:t=>{{let r=n(o,{label:`Uploading`,value:()=>e.upload,showValue:!0,stretch:!0,runover:{},childs:[]});t.controls.add(r);let a=n(l,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[n(i,{text:`Upload`,tone:`accent`,enabled:()=>!e.uploading,runover:{initializeComponent:e=>{e.motif.on(`click`,c)}},childs:[]}),n(i,{text:`Add a bar programmatically`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,u)}},childs:[]})]});t.controls.add(a);let d=n(l,{orientation:`horizontal`,wrap:!0,align:`center`,ref:e=>s=e,runover:{},childs:[]});t.controls.add(d)}}})}function k(){let a=r({lang:`en`}),s=()=>{a.lang=a.lang===`en`?`tr`:`en`,e.use(a.lang)};return t({initializeComponent:e=>{{let t=n(i,{text:()=>a.lang===`en`?`Language: English`:`Dil: Türkçe`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,s)}},childs:[]});e.controls.add(t);let r=n(o,{value:40,showValue:!0,locale:()=>a.lang,runover:{},childs:[]});e.controls.add(r);let c=n(`span`,{initializeComponent:e=>{let t=n(`text`,{initializeComponent:e=>{e.setText(`Unlabelled ones are named `)}},1);e.controls.add(t);let r=n(`output`,{initializeComponent:e=>{e.class.add(`pr-loading`),e.bindings.method(()=>g.strings.loading)}},1);e.controls.add(r)}},1);e.controls.add(c)}}})}function A(){let e=r({done:0,total:12,running:!1}),a=()=>{e.running=!0,e.done=0,e.total=0,setTimeout(()=>{e.total=12;let t=setInterval(()=>{e.done++,!(e.done<e.total)&&(clearInterval(t),e.running=!1)},150)},1e3)};return t({initializeComponent:t=>{{let r=n(o,{label:`Preparing`,value:null,runover:{},childs:[]});t.controls.add(r);let s=n(o,{label:`Copying`,value:()=>e.total?e.done:null,max:()=>e.total,runover:{},childs:[]});t.controls.add(s);let c=n(i,{text:`Copy`,variant:`outline`,enabled:()=>!e.running,runover:{initializeComponent:e=>{e.motif.on(`click`,a)}},childs:[]});t.controls.add(c)}}})}var j=[5,30,70,100,null],M=[`sm`,`md`,`lg`];function N(){let e=r({done:0,running:!1}),a=()=>{if(e.running)return;e.running=!0,e.done=0;let t=setInterval(()=>{e.done=Math.min(100,e.done+4),!(e.done<100)&&(clearInterval(t),e.running=!1)},160)};return t({initializeComponent:t=>{{t.bindings.list(()=>j??[],e=>n(o,{indexkey:()=>String(e),label:()=>e===null?`Not known`:`Line`,value:e,showValue:!0,stretch:!0,runover:{},childs:[]}));let r=n(l,{orientation:`horizontal`,wrap:!0,align:`start`,runover:{},childs:[n({initializeComponent:e=>{e.bindings.list(()=>j??[],e=>n(o,{indexkey:()=>String(e),shape:`circle`,label:()=>e===null?`Not known`:`Circle`,value:e,showValue:!0,runover:{},childs:[]}))}})]});t.controls.add(r);let s=n(l,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[n({initializeComponent:e=>{e.bindings.list(()=>M??[],e=>n(o,{indexkey:()=>e,shape:`circle`,size:e,label:`Size ${e}`,labelPosition:`side`,value:60,runover:{},childs:[]}))}})]});t.controls.add(s);let c=n(o,{label:`Importing`,value:()=>e.done,showValue:!0,stretch:!0,runover:{},childs:[]});t.controls.add(c);let u=n(l,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[n(o,{shape:`circle`,label:`Importing`,labelPosition:`side`,value:()=>e.done,showValue:!0,runover:{},childs:[]}),n(i,{text:`Import`,variant:`outline`,enabled:()=>!e.running,runover:{initializeComponent:e=>{e.motif.on(`click`,a)}},childs:[]})]});t.controls.add(u)}}})}var P=[`sm`,`md`,`lg`];function F(){let e=r({files:3});return t({initializeComponent:t=>{{t.bindings.list(()=>P??[],e=>n(o,{indexkey:()=>e,label:`Size ${e}`,size:e,value:60,runover:{},childs:[]}));let r=n(o,{label:`Files`,labelPosition:`side`,max:12,value:()=>e.files,showValue:!0,valueText:e=>`${e} of 12`,stretch:!0,runover:{},childs:[]});t.controls.add(r);let a=n(i,{text:`One more file`,size:`sm`,variant:`outline`,runover:{initializeComponent:t=>{t.motif.on(`click`,()=>e.files=e.files>=12?0:e.files+1)}},childs:[]});t.controls.add(a)}}})}var I=[`sm`,`md`,`lg`],L=[`neutral`,`success`,`caution`,`danger`];function R(){return t({initializeComponent:e=>{{e.bindings.list(()=>I??[],e=>n(s,{indexkey:()=>e,size:e,runover:{},childs:[]}));let t=n(s,{label:`Loading orders`,runover:{},childs:[]});e.controls.add(t);let r=n(s,{label:`Saving`,labelPosition:`bottom`,size:`lg`,runover:{},childs:[]});e.controls.add(r);let i=n(s,{label:`Syncing`,labelPosition:`bottom`,size:`lg`,contained:!0,runover:{},childs:[]});e.controls.add(i),e.bindings.list(()=>L??[],e=>n(s,{indexkey:()=>e,tone:e,size:`sm`,label:e,runover:{},childs:[]}))}}})}var z=[`accent`,`neutral`,`success`,`caution`,`danger`];function B(){return t({initializeComponent:e=>{e.bindings.list(()=>z??[],(e,t)=>n(o,{indexkey:()=>e,label:e,value:20+t*18,tone:e,showValue:!0,runover:{},childs:[]}))}})}var V=h(Object.assign({"./examples/Cover.tsx":_,"./examples/Delay.tsx":v,"./examples/Localization.tsx":y,"./examples/NotKnown.tsx":b,"./examples/Programmatic.tsx":x,"./examples/Shapes.tsx":S,"./examples/Sizes.tsx":C,"./examples/Spinners.tsx":w,"./examples/Tones.tsx":T})),H=[[`value`,"`Bind<number | null>`","`null`","The progress. Use `null` or omit it when the progress is unknown: the bar shows continuous motion and a circle rotates."],[`min / max`,"`Bind<number>`","`0` / `100`","The limits of `value`."],[`label`,"`Bind<string>`","`''`","A label that names the bar. This is the same property as `text`."],[`shape`,"`Bind<'line' | 'circle'>`","`'line'`","`line` shows a bar along a track, and `circle` shows an arc around a ring from the top."],[`labelPosition`,"`Bind<'top' | 'bottom' | 'side'>`","`'top'` (`'bottom'` for a circle)","`top` places the label and value above the bar, `bottom` places them below it, and `side` places the label before it and the value after it."],[`showValue`,"`Bind<boolean>`","`false`","Shows the percentage, rounded down to a whole number, or `valueText`."],[`valueText`,"`(value, fraction) => string`",`—`,"The text shown and announced for a value (`3 of 12 files`). Because it is a function, it is stored as is and not bound."],[`locale`,"`Bind<string>`","The page `lang`",`The locale of the percentage.`],[`tone`,"`Bind<ProgressTone>`","`'accent'`","`accent`, `neutral`, `success`, `caution`, `danger`."],[`size`,"`Bind<ControlSize>`","`'md'`","The thickness, and the size of a circle: `sm`, `md` or `lg`."],[`stretch`,"`Bind<boolean>`","`false`",`Stretches to the full width of its container.`],[`visible, enabled, …`,`see Control`,``,`Properties shared by all controls.`]],U=[[`label`,"`Bind<string>`","`''`","Text next to the ring. This is the same property as `text`."],[`labelPosition`,"`Bind<'side' | 'bottom'>`","`'side'`",`Places the label after the ring or below it.`],[`size`,"`Bind<ControlSize>`","`'md'`","`sm`, `md`, `lg`."],[`tone`,"`Bind<ProgressTone>`","`'accent'`",`The color of the rotating part.`],[`contained`,"`Bind<boolean>`","`false`",`Places the spinner in its own container (a disc behind it), where the design language includes one.`],[`delay`,"`Bind<number>`","`0`",`The delay in milliseconds before it appears, counted from when it is created or shown again. Quick operations then show nothing.`],[`visible, …`,`see Control`,``,"Showing it again with `visible` restarts the delay."]],W=[[`ProgressBar: every prop`,`read/write, reactive`,`Accepts a value or a function, the same as the prop.`],[`ProgressBar: fraction`,`read-only, reactive`,"The completed share from 0 to 1, or `null` while the progress is unknown."],[`Spinner: every prop`,`read/write, reactive`,`Accepts a value or a function, the same as the prop.`],[`Spinner: waiting`,`read-only`,`Indicates that it is still within its delay.`],[`Spinner.cover(target, props?)`,"`() => void`",`Covers a component with a spinner. Call the returned function to remove it. See Covering a panel.`]],G=[[`ProgressBar`,'`role="progressbar"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax` and `aria-valuetext` (the percentage or `valueText`). None of these are set while the progress is unknown.'],[`Spinner`,'`role="progressbar"` without a value, which indicates unknown progress. It is not a `status` live region, because those interrupt the screen reader each time one appears, and a page with several would be noisy.'],[`Name`,"Named by the label (`aria-labelledby`), or by `uiLocale.strings.loading` if there is none."],[`Cover`,'The container gets `aria-busy="true"`, and the content under the spinner is `inert`. Focus inside it moves to the spinner and returns when the spinner is removed.'],[`Motion`,`With reduced motion, the bar rests as a tinted track, new values appear immediately, the wave stops, and the arcs, ring and shape are static. A wave is drawn only while the bar is visible.`]],K=[[`.mx-progress`,'The bar. `data-state="determinate | indeterminate"`, `data-complete`, `data-shape`, `data-wave` (a wave is drawn), `data-tone`, `data-size`, `data-label-position`, `data-stretch`, and `--_fraction` for the completed share from 0 to 1.'],[`.mx-progress__head, .mx-progress__label, .mx-progress__value`,`The label row.`],[`.mx-progress__track, .mx-progress__bar`,"The line: the track (`::before` for the remainder and `::after` for the stop dot) and the completed part (`::after` for the indeterminate runner)."],[`.mx-progress__wave`,`The wave drawn over the track in place of the bar.`],[`.mx-progress__circle, .mx-progress__ring, .mx-progress__arc`,`The circle: its drawing, the ring and the arc.`],[`.mx-spinner`,"The spinner. `data-size`, `data-tone`, `data-label-position`, `data-contained`, `data-waiting`, `data-cover`."],[`.mx-spinner__box`,`The container of the rotating part.`],[`.mx-spinner__ring, .mx-spinner__shape, .mx-spinner__label`,`The ring, the shape (the design language shows one of them) and the label.`],[`[data-mx-covered]`,"A container under `Spinner.cover`."]],q=[[`progress.track, progress.bar, progress.rest, progress.stop, progress.runner, progress.wave`,"Units of the line, each with its box: the band, the completed part, the remainder of the track, the stop dot, the runner and the wave color. States: `indeterminate`, `complete` and the tones."],[`progress.ring, progress.arc, progress.label, progress.value`,`Units of the circle and the label.`],[`progress.thickness.*, progress.rest-thickness.*, progress.active-gap, progress.dot-size, progress.stop-inset`,`The line per size, the gap after the completed part, and the dot.`],[`progress.wave-amplitude, wave-length, wave-speed, wave-direction, wave-start, wave-end, wave-grow-duration`,`The wave: its amplitude (0 for none), wavelength, speed and direction, the progress range where it animates, and how long it takes to appear.`],[`progress.ring-size.*, ring-thickness.*, ring-active-gap, ring-runner-length, ring-turn-duration, ring-wave-*`,`The circle per size, its gaps, its rotating arc and its wave.`],[`progress.width, progress.gap, progress.head-gap, progress.accent … danger-subtle`,`The width when not stretched, the label and the tones.`],[`spinner.size.*, spinner.ring-width.*, spinner.shape-size.*`,`The ring and the shape, per size.`],[`spinner.box, spinner.ring, spinner.shape`,"Units: the container (`contained`), the ring and the shape, each with its box."],[`spinner.shape-1 … spinner.shape-7, spinner.morph-duration, spinner.morph-easing, spinner.spin-duration`,`The sequence of shapes (names from the kit shapes), the cycle duration, the transition to each shape, and one rotation.`],[`spinner.gap`,`The space between the ring and the label.`],[`spinner.cover-padding, spinner.cover-background`,`The layer over a covered container.`]];function J(){return t({initializeComponent:e=>{{let t=n(`p`,{initializeComponent:e=>{e.class.add(`lead`);let t=n(p,{text:`ProgressBar shows how far an operation has progressed, as a line or a circle, or indicates activity when the progress is unknown. Spinner shows that the system is busy. It is a rotating ring that can stand alone or cover a panel while it loads, and it can wait for a delay so that quick operations do not cause a flash.`,runover:{},childs:[]});e.controls.add(t)}},1);e.controls.add(t);let r=n(d,{anchor:`import`,title:`Import`,runover:{},childs:[n(u,{code:`
import { ProgressBar, Spinner, type ProgressTone } from '@motifx-community/ui';
`,runover:{},childs:[]})]});e.controls.add(r);let i=n(d,{anchor:`ways`,title:`Declarative and programmatic`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(p,{text:"Every prop accepts a value or a function, and a function that reads a reactive object keeps the bar in sync with the operation. When you create the component with `new`, set the same properties programmatically.",runover:{},childs:[]});e.controls.add(t)}},1),n(f,{files:V(`Programmatic.tsx`),stack:!0,runover:{},childs:[n(O,{runover:{},childs:[]})]})]});e.controls.add(i);let a=n(d,{anchor:`indeterminate`,title:`Indeterminate progress`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(p,{text:"Without a value (`null`), the bar shows continuous motion. Set a number once the operation can report its progress.",runover:{},childs:[]});e.controls.add(t)}},1),n(f,{files:V(`NotKnown.tsx`),stack:!0,runover:{},childs:[n(A,{runover:{},childs:[]})]})]});e.controls.add(a);let o=n(d,{anchor:`shapes`,title:`Linear and circular`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(p,{text:'`shape="circle"` draws the progress as an arc that runs around a ring from the top, and without a value the arc rotates. The label can appear below it (`labelPosition="bottom"`, the default), above it or next to it, and `size` sets the size of the circle and its stroke. Where the design language includes a wave (Material), the line and arc animate as they grow, and they stay straight at the very beginning and end.',runover:{},childs:[]});e.controls.add(t)}},1),n(f,{files:V(`Shapes.tsx`),stack:!0,runover:{},childs:[n(N,{runover:{},childs:[]})]})]});e.controls.add(o);let s=n(d,{anchor:`tones`,title:`Tones`,runover:{},childs:[n(f,{files:V(`Tones.tsx`),stack:!0,runover:{},childs:[n(B,{runover:{},childs:[]})]})]});e.controls.add(s);let c=n(d,{anchor:`sizes`,title:`Sizes, side labels and custom text`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(p,{text:'`size` sets the thickness. `labelPosition="side"` places the label before the bar and the value after it. `valueText` provides a custom value format.',runover:{},childs:[]});e.controls.add(t)}},1),n(f,{files:V(`Sizes.tsx`),stack:!0,runover:{},childs:[n(F,{runover:{},childs:[]})]})]});e.controls.add(c);let l=n(d,{anchor:`spinner`,title:`Spinner`,runover:{},childs:[n(f,{files:V(`Spinners.tsx`),runover:{},childs:[n(R,{runover:{},childs:[]})]})]});e.controls.add(l);let h=n(d,{anchor:`delay`,title:`Delay`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(p,{text:"A spinner with `delay` stays hidden for that long after it is created or shown again. Quick operations show nothing, and slow ones show the spinner.",runover:{},childs:[]});e.controls.add(t)}},1),n(f,{files:V(`Delay.tsx`),stack:!0,runover:{},childs:[n(D,{runover:{},childs:[]})]})]});e.controls.add(h);let g=n(d,{anchor:`cover`,title:`Covering a panel while it loads`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(p,{text:"`Spinner.cover(target)` places a spinner over a component and returns a function that removes it. The content underneath cannot be clicked or focused. If focus was inside, it moves to the spinner and returns afterward.",runover:{},childs:[]});e.controls.add(t)}},1),n(f,{files:V(`Cover.tsx`),stack:!0,runover:{},childs:[n(E,{runover:{},childs:[]})]})]});e.controls.add(g);let _=n(d,{anchor:`a11y`,title:`Accessibility`,runover:{},childs:[n(m,{head:[`Topic`,`Details`],rows:G,runover:{},childs:[]})]});e.controls.add(_);let v=n(d,{anchor:`i18n`,title:`Localization`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(p,{text:"A bar or spinner without a label is named `uiLocale.strings.loading`. The percentage uses `locale`, which defaults to the page `lang`.",runover:{},childs:[]});e.controls.add(t)}},1),n(f,{files:V(`Localization.tsx`),runover:{},childs:[n(k,{runover:{},childs:[]})]})]});e.controls.add(v);let y=n(d,{anchor:`styling`,title:`Styling`,runover:{},childs:[n(m,{head:[`Hook`,`Description`],rows:K,runover:{},childs:[]}),n(`h3`,{initializeComponent:e=>{let t=n(p,{text:`Component tokens`,runover:{},childs:[]});e.controls.add(t)}},1),n(m,{head:[`Token`,`Description`],rows:q,runover:{},childs:[]})]});e.controls.add(y);let b=n(d,{anchor:`api`,title:`API reference`,runover:{},childs:[n(`h3`,{initializeComponent:e=>{let t=n(p,{text:`ProgressBar props`,runover:{},childs:[]});e.controls.add(t)}},1),n(m,{head:[`Prop`,`Type`,`Default`,`Description`],rows:H,runover:{},childs:[]}),n(`h3`,{initializeComponent:e=>{let t=n(p,{text:`Spinner props`,runover:{},childs:[]});e.controls.add(t)}},1),n(m,{head:[`Prop`,`Type`,`Default`,`Description`],rows:U,runover:{},childs:[]}),n(`h3`,{initializeComponent:e=>{let t=n(p,{text:`Properties and methods`,runover:{},childs:[]});e.controls.add(t)}},1),n(m,{head:[`Member`,`Access / return value`,`Description`],rows:W,runover:{},childs:[]})]});e.controls.add(b)}}})}export{J as default};