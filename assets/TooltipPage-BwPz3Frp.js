import{Qn as e,Zn as t,er as n,n as r}from"./next-id-CtzpBrBT.js";import{t as i}from"./TextBox-iHQY3j6o.js";import{n as a,r as o,t as s}from"./Tooltip-Cbl7doBj.js";import{t as c}from"./Stack-wRt1e9tO.js";import{a as l,i as u,n as d,r as f,t as p}from"./docs-B_LZlyP5.js";import{t as m}from"./sources-BXVvOiIY.js";function h(e,t){let n=typeof t==`string`?{text:t}:t,r=null,i=!1,c=()=>r??=new s({...n,target:e});a(e,c);let l=()=>{if(i)return;i=!0,o(e,c);let t=r;t&&o(e,t),t?.close(),t?.dispose()};return e.motif.setDisposable(l),l}var g=`import { Button, Tooltip } from '@motifx-community/ui';\r
\r
const DELAYS = [0, 500, 1500];\r
\r
/** Three tooltips that wait a different time before they show. */\r
export default function Delay() {\r
  const targets: Button[] = [];\r
  return (\r
    <>\r
      {DELAYS.map((delay, i) => (\r
        <span key={delay}>\r
          <Button ref={(b: Button) => (targets[i] = b)} text={\`delay \${delay}\`} variant="outline" />\r
          <Tooltip target={() => targets[i]} text={\`Shown after \${delay} ms\`} delay={delay} />\r
        </span>\r
      ))}\r
    </>\r
  );\r
}\r
`,_=`import { Button, Stack, Tooltip } from '@motifx-community/ui';\r
\r
const BoldIcon = () => (\r
  <svg viewBox="0 0 16 16" aria-hidden="true">\r
    <path d="M4.5 2.5h4.25a2.75 2.75 0 0 1 0 5.5H4.5zM4.5 8h5a2.75 2.75 0 0 1 0 5.5h-5z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />\r
  </svg>\r
);\r
\r
const ItalicIcon = () => (\r
  <svg viewBox="0 0 16 16" aria-hidden="true">\r
    <path d="M7 2.5h5M4 13.5h5M9.5 2.5l-3 11" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />\r
  </svg>\r
);\r
\r
const LinkIcon = () => (\r
  <svg viewBox="0 0 16 16" aria-hidden="true">\r
    <path d="M6.5 9.5l3-3M7 4.5l1-1a2.83 2.83 0 0 1 4 4l-1 1M9 11.5l-1 1a2.83 2.83 0 0 1-4-4l1-1" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />\r
  </svg>\r
);\r
\r
/** Icon-only buttons named with aria-label; the tooltips show the name and the shortcut. */\r
export default function IconButtons() {\r
  let bold: Button | null = null;\r
  let italic: Button | null = null;\r
  let link: Button | null = null;\r
  return (\r
    <Stack orientation="horizontal" wrap align="center" role="toolbar" aria-label="Text style">\r
      <Button ref={(b: Button) => (bold = b)} icon={() => <BoldIcon />} variant="ghost" aria-label="Bold" />\r
      <Button ref={(b: Button) => (italic = b)} icon={() => <ItalicIcon />} variant="ghost" aria-label="Italic" />\r
      <Button ref={(b: Button) => (link = b)} icon={() => <LinkIcon />} variant="ghost" aria-label="Link" />\r
      <Tooltip target={() => bold} text="Bold (Ctrl+B)" />\r
      <Tooltip target={() => italic} text="Italic (Ctrl+I)" />\r
      <Tooltip target={() => link} text="Insert a link (Ctrl+K)" />\r
    </Stack>\r
  );\r
}\r
`,v=`import { addTooltip, Button, Stack } from '@motifx-community/ui';\r
\r
const SEATS = ['1', '2', '3', '4', '5', '6'].flatMap((row) =>\r
  ['A', 'B', 'C', 'D'].map((letter) => ({\r
    id: \`\${row}\${letter}\`,\r
    note: \`Row \${row}, seat \${letter}: \${letter === 'A' || letter === 'D' ? 'window' : 'aisle'}\${row === '1' ? ', extra legroom' : ''}\`,\r
  })),\r
);\r
\r
/** A tooltip on each of 24 seats, created only when first needed, and one that is removed programmatically. */\r
export default function ManyElements() {\r
  let removeGuideTip = () => {};\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Seats">\r
        {SEATS.map((seat) => (\r
          <Button\r
            key={seat.id}\r
            ref={(b: Button) => {\r
              addTooltip(b, seat.note);\r
            }}\r
            text={seat.id}\r
            size="sm"\r
            variant="outline"\r
          />\r
        ))}\r
      </Stack>\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Button\r
          ref={(b: Button) => (removeGuideTip = addTooltip(b, { text: 'Opens the guide', placement: 'end' }))}\r
          text="Guide"\r
          variant="outline"\r
        />\r
        <Button text="Remove the guide's tooltip" variant="ghost" onclick={() => removeGuideTip()} />\r
      </Stack>\r
    </>\r
  );\r
}\r
`,y=`import { reactive } from '@motifx/core';\r
import { TextBox, Tooltip } from '@motifx-community/ui';\r
\r
/** A tooltip on a TextBox: the field shows it on hover, its input is described by it. */\r
export default function OnField() {\r
  const s = reactive({ email: '' });\r
  let email: TextBox | null = null;\r
  return (\r
    <>\r
      <TextBox ref={(b: TextBox) => (email = b)} label="Email" type="email" x-model={() => s.email} />\r
      <Tooltip target={() => email} text="We send the receipt here." placement="end" />\r
    </>\r
  );\r
}\r
`,b=`import { reactive } from '@motifx/core';\r
import { Button, Stack, Tooltip, type PopupPlacement } from '@motifx-community/ui';\r
\r
const PLACEMENTS: PopupPlacement[] = ['top', 'bottom', 'start', 'end', 'top-start', 'bottom-end'];\r
\r
/** The side the tooltip opens on, picked from the buttons. */\r
export default function Placement() {\r
  const s = reactive({ placement: 'top' as PopupPlacement });\r
  let target: Button | null = null;\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Placement">\r
        {PLACEMENTS.map((placement) => (\r
          <Button\r
            key={placement}\r
            text={placement}\r
            size="sm"\r
            variant={() => (s.placement === placement ? 'solid' : 'ghost')}\r
            aria-pressed={() => s.placement === placement}\r
            onclick={() => (s.placement = placement)}\r
          />\r
        ))}\r
      </Stack>\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Button ref={(b: Button) => (target = b)} text="Hover or focus me" variant="outline" />\r
        <Tooltip target={() => target} text={() => \`Opens at \${s.placement}\`} placement={() => s.placement} />\r
      </Stack>\r
    </>\r
  );\r
}\r
`,x=`import { Button, Tooltip } from '@motifx-community/ui';\r
\r
/** A tooltip from JSX pointed at its target, and one created with \`new\` and opened programmatically. */\r
export default function Programmatic() {\r
  let save: Button | null = null;\r
  let target: Button | null = null;\r
  let tip: Tooltip | null = null;\r
  let opened = 0;\r
\r
  const openProgrammatic = () => {\r
    if (!target) return;\r
    if (!tip) {\r
      tip = new Tooltip({ target });\r
      tip.placement = 'end';\r
    }\r
    tip.text = \`Made programmatically, opened \${++opened} time(s)\`;\r
    tip.open();\r
  };\r
\r
  return (\r
    <>\r
      <Button ref={(b: Button) => (save = b)} text="Save" tone="accent" />\r
      <Tooltip target={() => save} text="Save the file (Ctrl+S)" />\r
      <Button ref={(b: Button) => (target = b)} text="Target" variant="outline" />\r
      <Button text="Open a tooltip programmatically" variant="outline" onclick={openProgrammatic} />\r
    </>\r
  );\r
}\r
`,S=`import { Button, Tooltip } from '@motifx-community/ui';\r
\r
/** A tooltip with markup after its text, given as JSX children. */\r
export default function RichContent() {\r
  let target: Button | null = null;\r
  return (\r
    <>\r
      <Button ref={(b: Button) => (target = b)} text="Rich tooltip" variant="outline" />\r
      <Tooltip target={() => target}>\r
        <strong>Bold</strong> makes the selection stand out. <kbd>Ctrl</kbd>+<kbd>B</kbd>\r
      </Tooltip>\r
    </>\r
  );\r
}\r
`,C=`import { reactive } from '@motifx/core';\r
import { Button, Tooltip } from '@motifx-community/ui';\r
\r
/** A tooltip opened only programmatically, and one shown on keyboard focus while a toggle allows it. */\r
export default function ShowOn() {\r
  const s = reactive({ on: true });\r
  let help: Button | null = null;\r
  let tip: Tooltip | null = null;\r
  let keyboardOnly: Button | null = null;\r
  return (\r
    <>\r
      <Button ref={(b: Button) => (help = b)} text="Help" variant="outline" />\r
      <Tooltip ref={(t: Tooltip) => (tip = t)} target={() => help} text="Shown programmatically" showOn="manual" placement="bottom" />\r
      <Button text={() => (tip?.opened ? 'Hide it' : 'Show it')} onclick={() => tip && (tip.opened = !tip.opened)} />\r
      <Button text={() => (s.on ? 'Tooltips on' : 'Tooltips off')} toggle x-model={() => s.on} variant="ghost" />\r
      <Button ref={(b: Button) => (keyboardOnly = b)} text="Keyboard only" variant="outline" />\r
      <Tooltip target={() => keyboardOnly} text="Shown on keyboard focus, while the toggle is on" enabled={() => s.on} showOn="focus" />\r
    </>\r
  );\r
}\r
`,w=[0,500,1500];function T(){let n=[];return e({initializeComponent:e=>{e.bindings.list(()=>w??[],(e,i)=>t(`span`,{indexkey:()=>e,initializeComponent:a=>{let o=t(r,{text:`delay ${e}`,variant:`outline`,ref:e=>n[i]=e,runover:{},childs:[]});a.controls.add(o);let c=t(s,{target:()=>n[i],text:`Shown after ${e} ms`,delay:e,runover:{},childs:[]});a.controls.add(c)}}))}})}function E(){let n=null,i=null,a=null,o=0,c=()=>{i&&(a||(a=new s({target:i}),a.placement=`end`),a.text=`Made programmatically, opened ${++o} time(s)`,a.open())};return e({initializeComponent:e=>{{let a=t(r,{text:`Save`,tone:`accent`,ref:e=>n=e,runover:{},childs:[]});e.controls.add(a);let o=t(s,{target:()=>n,text:`Save the file (Ctrl+S)`,runover:{},childs:[]});e.controls.add(o);let l=t(r,{text:`Target`,variant:`outline`,ref:e=>i=e,runover:{},childs:[]});e.controls.add(l);let u=t(r,{text:`Open a tooltip programmatically`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,c)}},childs:[]});e.controls.add(u)}}})}var D=()=>t(`svg`,{__isSvgElement:!0,initializeComponent:e=>{e.attr.add({viewBox:`0 0 16 16`,"aria-hidden":`true`});let n=t(`path`,{__isSvgElement:!0,initializeComponent:e=>{e.attr.add({d:`M4.5 2.5h4.25a2.75 2.75 0 0 1 0 5.5H4.5zM4.5 8h5a2.75 2.75 0 0 1 0 5.5h-5z`,fill:`none`,stroke:`currentColor`,"stroke-width":`1.5`,"stroke-linejoin":`round`})}});e.controls.add(n)}}),O=()=>t(`svg`,{__isSvgElement:!0,initializeComponent:e=>{e.attr.add({viewBox:`0 0 16 16`,"aria-hidden":`true`});let n=t(`path`,{__isSvgElement:!0,initializeComponent:e=>{e.attr.add({d:`M7 2.5h5M4 13.5h5M9.5 2.5l-3 11`,fill:`none`,stroke:`currentColor`,"stroke-width":`1.5`,"stroke-linecap":`round`})}});e.controls.add(n)}}),k=()=>t(`svg`,{__isSvgElement:!0,initializeComponent:e=>{e.attr.add({viewBox:`0 0 16 16`,"aria-hidden":`true`});let n=t(`path`,{__isSvgElement:!0,initializeComponent:e=>{e.attr.add({d:`M6.5 9.5l3-3M7 4.5l1-1a2.83 2.83 0 0 1 4 4l-1 1M9 11.5l-1 1a2.83 2.83 0 0 1-4-4l1-1`,fill:`none`,stroke:`currentColor`,"stroke-width":`1.5`,"stroke-linecap":`round`})}});e.controls.add(n)}});function A(){let e=null,n=null,i=null;return t(c,{orientation:`horizontal`,wrap:!0,align:`center`,role:`toolbar`,"aria-label":`Text style`,runover:{},childs:[t(r,{icon:()=>t(D,{runover:{},childs:[]}),variant:`ghost`,"aria-label":`Bold`,ref:t=>e=t,runover:{},childs:[]}),t(r,{icon:()=>t(O,{runover:{},childs:[]}),variant:`ghost`,"aria-label":`Italic`,ref:e=>n=e,runover:{},childs:[]}),t(r,{icon:()=>t(k,{runover:{},childs:[]}),variant:`ghost`,"aria-label":`Link`,ref:e=>i=e,runover:{},childs:[]}),t(s,{target:()=>e,text:`Bold (Ctrl+B)`,runover:{},childs:[]}),t(s,{target:()=>n,text:`Italic (Ctrl+I)`,runover:{},childs:[]}),t(s,{target:()=>i,text:`Insert a link (Ctrl+K)`,runover:{},childs:[]})]})}var j=[`1`,`2`,`3`,`4`,`5`,`6`].flatMap(e=>[`A`,`B`,`C`,`D`].map(t=>({id:`${e}${t}`,note:`Row ${e}, seat ${t}: ${t===`A`||t===`D`?`window`:`aisle`}${e===`1`?`, extra legroom`:``}`})));function M(){let n=()=>{};return e({initializeComponent:e=>{{let i=t(c,{orientation:`horizontal`,wrap:!0,align:`center`,role:`group`,"aria-label":`Seats`,runover:{},childs:[t({initializeComponent:e=>{e.bindings.list(()=>j??[],e=>t(r,{indexkey:()=>e.id,text:e.id,size:`sm`,variant:`outline`,ref:t=>{h(t,e.note)},runover:{},childs:[]}))}})]});e.controls.add(i);let a=t(c,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[t(r,{text:`Guide`,variant:`outline`,ref:e=>n=h(e,{text:`Opens the guide`,placement:`end`}),runover:{},childs:[]}),t(r,{text:`Remove the guide's tooltip`,variant:`ghost`,runover:{initializeComponent:e=>{e.motif.on(`click`,()=>n())}},childs:[]})]});e.controls.add(a)}}})}function N(){let r=n({email:``}),a=null;return e({initializeComponent:e=>{{let n=t(i,{label:`Email`,type:`email`,ref:e=>a=e,runover:{initializeComponent:e=>{e.bindings.model(()=>r.email,e=>{let t=r;t!=null&&typeof t.email!=`function`&&(t.email=e)})}},childs:[]});e.controls.add(n);let o=t(s,{target:()=>a,text:`We send the receipt here.`,placement:`end`,runover:{},childs:[]});e.controls.add(o)}}})}var P=[`top`,`bottom`,`start`,`end`,`top-start`,`bottom-end`];function F(){let i=n({placement:`top`}),a=null;return e({initializeComponent:e=>{{let n=t(c,{orientation:`horizontal`,wrap:!0,align:`center`,role:`group`,"aria-label":`Placement`,runover:{},childs:[t({initializeComponent:e=>{e.bindings.list(()=>P??[],e=>t(r,{indexkey:()=>e,text:e,size:`sm`,variant:()=>i.placement===e?`solid`:`ghost`,"aria-pressed":()=>i.placement===e,runover:{initializeComponent:t=>{t.motif.on(`click`,()=>i.placement=e)}},childs:[]}))}})]});e.controls.add(n);let o=t(c,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[t(r,{text:`Hover or focus me`,variant:`outline`,ref:e=>a=e,runover:{},childs:[]}),t(s,{target:()=>a,text:()=>`Opens at ${i.placement}`,placement:()=>i.placement,runover:{},childs:[]})]});e.controls.add(o)}}})}function I(){let n=null;return e({initializeComponent:e=>{{let i=t(r,{text:`Rich tooltip`,variant:`outline`,ref:e=>n=e,runover:{},childs:[]});e.controls.add(i);let a=t(s,{target:()=>n,runover:{},childs:[t(`strong`,{initializeComponent:e=>{let n=t(`text`,{initializeComponent:e=>{e.setText(`Bold`)}},1);e.controls.add(n)}},1),t(`text`,{initializeComponent:e=>{e.setText(` makes the selection stand out. `)}},1),t(`kbd`,{initializeComponent:e=>{let n=t(`text`,{initializeComponent:e=>{e.setText(`Ctrl`)}},1);e.controls.add(n)}},1),t(`text`,{initializeComponent:e=>{e.setText(`+`)}},1),t(`kbd`,{initializeComponent:e=>{let n=t(`text`,{initializeComponent:e=>{e.setText(`B`)}},1);e.controls.add(n)}},1)]});e.controls.add(a)}}})}function L(){let i=n({on:!0}),a=null,o=null,c=null;return e({initializeComponent:e=>{{let n=t(r,{text:`Help`,variant:`outline`,ref:e=>a=e,runover:{},childs:[]});e.controls.add(n);let l=t(s,{target:()=>a,text:`Shown programmatically`,showOn:`manual`,placement:`bottom`,ref:e=>o=e,runover:{},childs:[]});e.controls.add(l);let u=t(r,{text:()=>o?.opened?`Hide it`:`Show it`,runover:{initializeComponent:e=>{e.motif.on(`click`,()=>o&&(o.opened=!o.opened))}},childs:[]});e.controls.add(u);let d=t(r,{text:()=>i.on?`Tooltips on`:`Tooltips off`,toggle:!0,variant:`ghost`,runover:{initializeComponent:e=>{e.bindings.model(()=>i.on,e=>{let t=i;t!=null&&typeof t.on!=`function`&&(t.on=e)})}},childs:[]});e.controls.add(d);let f=t(r,{text:`Keyboard only`,variant:`outline`,ref:e=>c=e,runover:{},childs:[]});e.controls.add(f);let p=t(s,{target:()=>c,text:`Shown on keyboard focus, while the toggle is on`,enabled:()=>i.on,showOn:`focus`,runover:{},childs:[]});e.controls.add(p)}}})}var R=m(Object.assign({"./examples/Delay.tsx":g,"./examples/IconButtons.tsx":_,"./examples/ManyElements.tsx":v,"./examples/OnField.tsx":y,"./examples/Placement.tsx":b,"./examples/Programmatic.tsx":x,"./examples/RichContent.tsx":S,"./examples/ShowOn.tsx":C})),z=[[`target`,"`Bind<ComponentBase | null>`",`—`,"The component it describes. A function works for a component that appears later in the view (`() => this.save`)."],[`text`,"`Bind<string>`","`''`",`The tooltip text.`],[`content`,"`Bind<ComponentBase | null>`",`—`,`Any content after the text, created the first time the tooltip appears. JSX children work too. Do not include interactive content.`],[`placement`,"`Bind<PopupPlacement>`","`'top'`","`top`, `bottom`, `start` or `end`, each with `-start` or `-end`. It opens on the opposite side if there is no room, and start and end follow the reading direction."],[`delay`,"`Bind<number>`","`500`",`The time in milliseconds the pointer must rest on the target before the tooltip appears. Keyboard focus shows it immediately.`],[`hideDelay`,"`Bind<number>`","`150`",`The time in milliseconds it stays after the pointer leaves, so the pointer can move onto it.`],[`showOn`,"`Bind<TooltipShowOn>`","`'hover-focus'`","`hover-focus`, `focus` (keyboard focus only) or `manual` (only `open()`)."],[`enabled`,"`Bind<boolean>`","`true`","`false` keeps the tooltip from appearing and closes it if it is open."],[`onOpened, onClosed`,"`() => void`",`—`,`See Events.`]],B=[[`every prop above`,`read/write, reactive`,`Accepts a value or a function, the same as the prop.`],[`opened`,`read/write, reactive`,`Indicates whether it is visible. Set it to open or close the tooltip.`],[`Tooltip.skipDelay`,`static, read/write`,"The time in milliseconds after a tooltip closes during which the next one appears immediately. The default is `300`, and `0` turns it off."]],V=[[`open()`,"`boolean`","Shows the tooltip now, regardless of `showOn`. Returns `false` if there is no target on the page or the tooltip is disabled."],[`close()`,"`void`",`Hides the tooltip.`],[`place()`,"`void`",`Repositions it relative to its target, for example after the target moves.`],[`addTooltip(target, text | options)`,"`() => void`",`Adds a tooltip to one element, created on first use, and returns a function that removes it. For a component, it is removed along with the component.`]],H=[[`onOpened`,`Occurs after it is shown.`],[`onClosed`,`Occurs after it is hidden.`]],U=[[`Tab (focus on the target)`,`Shows the tooltip immediately. Leaving the target hides it.`],[`Escape`,`Hides the tooltip while focus stays in place. Only the tooltip closes, not the surrounding window.`]],W=[[`Role`,'`role="tooltip"`, with one element per tooltip.'],[`Description`,"While it is visible, the target or its focusable part, such as the input of a TextBox, has `aria-describedby` pointing to the tooltip, along with its own descriptions."],[`Focus`,"A tooltip never receives focus and contains nothing interactive. For buttons or links next to an element, open a drop-down (Button `dropDown`)."],[`WCAG 1.4.13`,`Dismissible (Escape), hoverable (the pointer can move onto it) and persistent (it stays until the pointer or focus leaves).`],[`Pointer only?`,"Tooltip content must also be available another way. An icon-only button still needs its own name (`aria-label`)."],[`Touch`,`Touch does not show a tooltip, so provide the information another way for touch users.`]],G=[[`.mx-tooltip`,"The tooltip. `data-side` reports the side it opened on (`top`, `bottom`, `start`, `end`)."],[`.mx-tooltip__text`,`The text.`]],K=[[`tooltip.offset, tooltip.enter-offset`,`The gap to the target, and the distance it animates in from.`],[`tooltip.surface`,"Unit: the tooltip and its box (`max-width` sets the width before wrapping, and `rich` applies with custom content)."],[`tooltip.arrow, tooltip.text`,`Units: an optional arrow toward the target, and the text.`],[`tooltip.text-align`,`The text alignment.`]];function q(){return e({initializeComponent:e=>{{let n=t(`p`,{initializeComponent:e=>{e.class.add(`lead`);let n=t(f,{text:`A short description shown next to an element when the pointer rests on it, when it receives keyboard focus, or programmatically. Users can hover over the tooltip, Escape dismisses it, and only one is open at a time on the page.`,runover:{},childs:[]});e.controls.add(n)}},1);e.controls.add(n);let r=t(u,{anchor:`import`,title:`Import`,runover:{},childs:[t(l,{code:`
import { Tooltip, addTooltip, type TooltipShowOn } from '@motifx-community/ui';
`,runover:{},childs:[]})]});e.controls.add(r);let i=t(u,{anchor:`ways`,title:`Declarative and programmatic`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(f,{text:"In JSX, place a tooltip anywhere and point it at its `target`. Its position in the markup does not matter. Programmatically, `new Tooltip({ target, text })` is all you need: it adds itself to the page the first time it appears and is removed along with its target component.",runover:{},childs:[]});e.controls.add(n)}},1),t(d,{files:R(`Programmatic.tsx`),runover:{},childs:[t(E,{runover:{},childs:[]})]})]});e.controls.add(i);let a=t(u,{anchor:`icon`,title:`Icon-only buttons`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(f,{text:"A button with only an icon needs its own accessible name (`aria-label`). The tooltip displays that information and adds the shortcut as a description. Moving from one button to the next shows the next tooltip immediately.",runover:{},childs:[]});e.controls.add(n)}},1),t(d,{files:R(`IconButtons.tsx`),runover:{},childs:[t(A,{runover:{},childs:[]})]})]});e.controls.add(a);let o=t(u,{anchor:`field`,title:`Tooltips on fields`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(f,{text:`On a TextBox, the whole field shows the tooltip on hover, and the input is described by it while it is visible, including on keyboard focus.`,runover:{},childs:[]});e.controls.add(n)}},1),t(d,{files:R(`OnField.tsx`),runover:{},childs:[t(N,{runover:{},childs:[]})]})]});e.controls.add(o);let s=t(u,{anchor:`placement`,title:`Placement`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(f,{text:"The default is `top`. The tooltip opens on the opposite side if there is no room, and `start` and `end` follow the reading direction. Try the RTL switch at the top of the page.",runover:{},childs:[]});e.controls.add(n)}},1),t(d,{files:R(`Placement.tsx`),stack:!0,runover:{},childs:[t(F,{runover:{},childs:[]})]})]});e.controls.add(s);let c=t(u,{anchor:`delay`,title:`Delay`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(f,{text:"The pointer must rest on the target for `delay` milliseconds (500 by default) before the tooltip appears, and `hideDelay` keeps it open briefly after the pointer leaves. Immediately after one closes, the next appears without a delay (`Tooltip.skipDelay`).",runover:{},childs:[]});e.controls.add(n)}},1),t(d,{files:R(`Delay.tsx`),runover:{},childs:[t(T,{runover:{},childs:[]})]})]});e.controls.add(c);let m=t(u,{anchor:`content`,title:`Rich content`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(f,{text:"JSX children or `content` (any component) appear after the text. Keep it short and never include buttons or links, because a tooltip cannot receive focus.",runover:{},childs:[]});e.controls.add(n)}},1),t(d,{files:R(`RichContent.tsx`),runover:{},childs:[t(I,{runover:{},childs:[]})]})]});e.controls.add(m);let h=t(u,{anchor:`show-on`,title:`Display triggers`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(f,{text:"`showOn` sets what displays the tooltip: `hover-focus` (the default), `focus` (keyboard focus only) or `manual` (only `open()` and `opened`). `enabled` turns a tooltip off.",runover:{},childs:[]});e.controls.add(n)}},1),t(d,{files:R(`ShowOn.tsx`),runover:{},childs:[t(L,{runover:{},childs:[]})]})]});e.controls.add(h);let g=t(u,{anchor:`many`,title:`Tooltips on many elements`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(f,{text:"`addTooltip(target, text)` gives a component a tooltip that is created only when first needed. All tooltips on the page share one set of document listeners, so hundreds of them have almost no cost. The function returns a remover.",runover:{},childs:[]});e.controls.add(n)}},1),t(d,{files:R(`ManyElements.tsx`),stack:!0,runover:{},childs:[t(M,{runover:{},childs:[]})]})]});e.controls.add(g);let _=t(u,{anchor:`keyboard`,title:`Keyboard`,runover:{},childs:[t(p,{head:[`Key`,`Description`],rows:U,runover:{},childs:[]})]});e.controls.add(_);let v=t(u,{anchor:`a11y`,title:`Accessibility`,runover:{},childs:[t(p,{head:[`Topic`,`Details`],rows:W,runover:{},childs:[]})]});e.controls.add(v);let y=t(u,{anchor:`styling`,title:`Styling`,runover:{},childs:[t(p,{head:[`Hook`,`Description`],rows:G,runover:{},childs:[]}),t(`h3`,{initializeComponent:e=>{let n=t(f,{text:`Component tokens`,runover:{},childs:[]});e.controls.add(n)}},1),t(p,{head:[`Token`,`Description`],rows:K,runover:{},childs:[]})]});e.controls.add(y);let b=t(u,{anchor:`api`,title:`API reference`,runover:{},childs:[t(`h3`,{initializeComponent:e=>{let n=t(f,{text:`Props`,runover:{},childs:[]});e.controls.add(n)}},1),t(p,{head:[`Prop`,`Type`,`Default`,`Description`],rows:z,runover:{},childs:[]}),t(`h3`,{initializeComponent:e=>{let n=t(f,{text:`Properties`,runover:{},childs:[]});e.controls.add(n)}},1),t(p,{head:[`Property`,`Access`,`Description`],rows:B,runover:{},childs:[]}),t(`h3`,{initializeComponent:e=>{let n=t(f,{text:`Methods`,runover:{},childs:[]});e.controls.add(n)}},1),t(p,{head:[`Method`,`Returns`,`Description`],rows:V,runover:{},childs:[]}),t(`h3`,{initializeComponent:e=>{let n=t(f,{text:`Events`,runover:{},childs:[]});e.controls.add(n)}},1),t(p,{head:[`Event`,`When`],rows:H,runover:{},childs:[]})]});e.controls.add(b)}}})}export{q as default};