import{St as e,a as t,an as n,h as r,i,n as a,nn as o,r as s,rn as c,t as l}from"./doc-B1CtlCkV.js";import{n as u,r as d,t as f}from"./Tooltip-Bkrhr0JL.js";import{t as p}from"./Stack-AS0iyAxC.js";import{t as m}from"./index-DVbtDn93.js";import{t as h}from"./sources-BXVvOiIY.js";function g(t,n){let r=e(t)?t:t.element,i=typeof n==`string`?{text:n}:n,a=null,o=!1,s=()=>a??=new f({...i,target:r});u(r,s);let c=()=>{if(o)return;o=!0,d(r,s);let e=a;e&&d(r,e),e?.close(),e?.dispose()};return e(t)||t.motif.setDisposable(c),c}var _=`import { Button, Tooltip } from '@motifx-community/ui';\r
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
`,v=`import { Button, Stack, Tooltip } from '@motifx-community/ui';\r
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
`,y=`import { addTooltip, Button, Stack } from '@motifx-community/ui';\r
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
`,b=`import { reactive } from '@motifx/core';\r
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
`,x=`import { reactive } from '@motifx/core';\r
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
`,S=`import { Button, Tooltip } from '@motifx-community/ui';\r
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
`,C=`import { Button, Tooltip } from '@motifx-community/ui';\r
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
`,w=`import { reactive } from '@motifx/core';\r
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
`,T=[0,500,1500];function E(){let e=[];return c({initializeComponent:t=>{t.bindings.list(()=>T??[],(t,n)=>o(`span`,{indexkey:()=>t,initializeComponent:i=>{let a=o(r,{text:`delay ${t}`,variant:`outline`,ref:t=>e[n]=t,runover:{},childs:[]});i.controls.add(a);let s=o(f,{target:()=>e[n],text:`Shown after ${t} ms`,delay:t,runover:{},childs:[]});i.controls.add(s)}}))}})}function D(){let e=null,t=null,n=null,i=0,a=()=>{t&&(n||(n=new f({target:t}),n.placement=`end`),n.text=`Made programmatically, opened ${++i} time(s)`,n.open())};return c({initializeComponent:n=>{{let i=o(r,{text:`Save`,tone:`accent`,ref:t=>e=t,runover:{},childs:[]});n.controls.add(i);let s=o(f,{target:()=>e,text:`Save the file (Ctrl+S)`,runover:{},childs:[]});n.controls.add(s);let c=o(r,{text:`Target`,variant:`outline`,ref:e=>t=e,runover:{},childs:[]});n.controls.add(c);let l=o(r,{text:`Open a tooltip programmatically`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,a)}},childs:[]});n.controls.add(l)}}})}var O=()=>o(`svg`,{__isSvgElement:!0,initializeComponent:e=>{e.attr.add({viewBox:`0 0 16 16`,"aria-hidden":`true`});let t=o(`path`,{__isSvgElement:!0,initializeComponent:e=>{e.attr.add({d:`M4.5 2.5h4.25a2.75 2.75 0 0 1 0 5.5H4.5zM4.5 8h5a2.75 2.75 0 0 1 0 5.5h-5z`,fill:`none`,stroke:`currentColor`,"stroke-width":`1.5`,"stroke-linejoin":`round`})}});e.controls.add(t)}}),k=()=>o(`svg`,{__isSvgElement:!0,initializeComponent:e=>{e.attr.add({viewBox:`0 0 16 16`,"aria-hidden":`true`});let t=o(`path`,{__isSvgElement:!0,initializeComponent:e=>{e.attr.add({d:`M7 2.5h5M4 13.5h5M9.5 2.5l-3 11`,fill:`none`,stroke:`currentColor`,"stroke-width":`1.5`,"stroke-linecap":`round`})}});e.controls.add(t)}}),A=()=>o(`svg`,{__isSvgElement:!0,initializeComponent:e=>{e.attr.add({viewBox:`0 0 16 16`,"aria-hidden":`true`});let t=o(`path`,{__isSvgElement:!0,initializeComponent:e=>{e.attr.add({d:`M6.5 9.5l3-3M7 4.5l1-1a2.83 2.83 0 0 1 4 4l-1 1M9 11.5l-1 1a2.83 2.83 0 0 1-4-4l1-1`,fill:`none`,stroke:`currentColor`,"stroke-width":`1.5`,"stroke-linecap":`round`})}});e.controls.add(t)}});function j(){let e=null,t=null,n=null;return o(p,{orientation:`horizontal`,wrap:!0,align:`center`,role:`toolbar`,"aria-label":`Text style`,runover:{},childs:[o(r,{icon:()=>o(O,{runover:{},childs:[]}),variant:`ghost`,"aria-label":`Bold`,ref:t=>e=t,runover:{},childs:[]}),o(r,{icon:()=>o(k,{runover:{},childs:[]}),variant:`ghost`,"aria-label":`Italic`,ref:e=>t=e,runover:{},childs:[]}),o(r,{icon:()=>o(A,{runover:{},childs:[]}),variant:`ghost`,"aria-label":`Link`,ref:e=>n=e,runover:{},childs:[]}),o(f,{target:()=>e,text:`Bold (Ctrl+B)`,runover:{},childs:[]}),o(f,{target:()=>t,text:`Italic (Ctrl+I)`,runover:{},childs:[]}),o(f,{target:()=>n,text:`Insert a link (Ctrl+K)`,runover:{},childs:[]})]})}var M=[`1`,`2`,`3`,`4`,`5`,`6`].flatMap(e=>[`A`,`B`,`C`,`D`].map(t=>({id:`${e}${t}`,note:`Row ${e}, seat ${t}: ${t===`A`||t===`D`?`window`:`aisle`}${e===`1`?`, extra legroom`:``}`})));function N(){let e=()=>{};return c({initializeComponent:t=>{{let n=o(p,{orientation:`horizontal`,wrap:!0,align:`center`,role:`group`,"aria-label":`Seats`,runover:{},childs:[o({initializeComponent:e=>{e.bindings.list(()=>M??[],e=>o(r,{indexkey:()=>e.id,text:e.id,size:`sm`,variant:`outline`,ref:t=>{g(t,e.note)},runover:{},childs:[]}))}})]});t.controls.add(n);let i=o(p,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[o(r,{text:`Guide`,variant:`outline`,ref:t=>e=g(t,{text:`Opens the guide`,placement:`end`}),runover:{},childs:[]}),o(r,{text:`Remove the guide's tooltip`,variant:`ghost`,runover:{initializeComponent:t=>{t.motif.on(`click`,()=>e())}},childs:[]})]});t.controls.add(i)}}})}function P(){let e=n({email:``}),t=null;return c({initializeComponent:n=>{{let r=o(m,{label:`Email`,type:`email`,ref:e=>t=e,runover:{initializeComponent:t=>{t.bindings.model(()=>e.email,t=>{let n=e;n!=null&&typeof n.email!=`function`&&(n.email=t)})}},childs:[]});n.controls.add(r);let i=o(f,{target:()=>t,text:`We send the receipt here.`,placement:`end`,runover:{},childs:[]});n.controls.add(i)}}})}var F=[`top`,`bottom`,`start`,`end`,`top-start`,`bottom-end`];function I(){let e=n({placement:`top`}),t=null;return c({initializeComponent:n=>{{let i=o(p,{orientation:`horizontal`,wrap:!0,align:`center`,role:`group`,"aria-label":`Placement`,runover:{},childs:[o({initializeComponent:t=>{t.bindings.list(()=>F??[],t=>o(r,{indexkey:()=>t,text:t,size:`sm`,variant:()=>e.placement===t?`solid`:`ghost`,"aria-pressed":()=>e.placement===t,runover:{initializeComponent:n=>{n.motif.on(`click`,()=>e.placement=t)}},childs:[]}))}})]});n.controls.add(i);let a=o(p,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[o(r,{text:`Hover or focus me`,variant:`outline`,ref:e=>t=e,runover:{},childs:[]}),o(f,{target:()=>t,text:()=>`Opens at ${e.placement}`,placement:()=>e.placement,runover:{},childs:[]})]});n.controls.add(a)}}})}function L(){let e=null;return c({initializeComponent:t=>{{let n=o(r,{text:`Rich tooltip`,variant:`outline`,ref:t=>e=t,runover:{},childs:[]});t.controls.add(n);let i=o(f,{target:()=>e,runover:{},childs:[o(`strong`,{initializeComponent:e=>{let t=o(`text`,{initializeComponent:e=>{e.setText(`Bold`)}},1);e.controls.add(t)}},1),o(`text`,{initializeComponent:e=>{e.setText(` makes the selection stand out. `)}},1),o(`kbd`,{initializeComponent:e=>{let t=o(`text`,{initializeComponent:e=>{e.setText(`Ctrl`)}},1);e.controls.add(t)}},1),o(`text`,{initializeComponent:e=>{e.setText(`+`)}},1),o(`kbd`,{initializeComponent:e=>{let t=o(`text`,{initializeComponent:e=>{e.setText(`B`)}},1);e.controls.add(t)}},1)]});t.controls.add(i)}}})}function R(){let e=n({on:!0}),t=null,i=null,a=null;return c({initializeComponent:n=>{{let s=o(r,{text:`Help`,variant:`outline`,ref:e=>t=e,runover:{},childs:[]});n.controls.add(s);let c=o(f,{target:()=>t,text:`Shown programmatically`,showOn:`manual`,placement:`bottom`,ref:e=>i=e,runover:{},childs:[]});n.controls.add(c);let l=o(r,{text:()=>i?.opened?`Hide it`:`Show it`,runover:{initializeComponent:e=>{e.motif.on(`click`,()=>i&&(i.opened=!i.opened))}},childs:[]});n.controls.add(l);let u=o(r,{text:()=>e.on?`Tooltips on`:`Tooltips off`,toggle:!0,variant:`ghost`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.on,t=>{let n=e;n!=null&&typeof n.on!=`function`&&(n.on=t)})}},childs:[]});n.controls.add(u);let d=o(r,{text:`Keyboard only`,variant:`outline`,ref:e=>a=e,runover:{},childs:[]});n.controls.add(d);let p=o(f,{target:()=>a,text:`Shown on keyboard focus, while the toggle is on`,enabled:()=>e.on,showOn:`focus`,runover:{},childs:[]});n.controls.add(p)}}})}var z=h(Object.assign({"./examples/Delay.tsx":_,"./examples/IconButtons.tsx":v,"./examples/ManyElements.tsx":y,"./examples/OnField.tsx":b,"./examples/Placement.tsx":x,"./examples/Programmatic.tsx":S,"./examples/RichContent.tsx":C,"./examples/ShowOn.tsx":w})),B=[[`target`,"`Bind<Element | ComponentBase | null>`",`—`,"The element it describes. A function works for a component that appears later in the view (`() => this.save`)."],[`text`,"`Bind<string>`","`''`",`The tooltip text.`],[`content`,"`Bind<ComponentBase | null>`",`—`,`Any content after the text, created the first time the tooltip appears. JSX children work too. Do not include interactive content.`],[`placement`,"`Bind<PopupPlacement>`","`'top'`","`top`, `bottom`, `start` or `end`, each with `-start` or `-end`. It opens on the opposite side if there is no room, and start and end follow the reading direction."],[`delay`,"`Bind<number>`","`500`",`The time in milliseconds the pointer must rest on the target before the tooltip appears. Keyboard focus shows it immediately.`],[`hideDelay`,"`Bind<number>`","`150`",`The time in milliseconds it stays after the pointer leaves, so the pointer can move onto it.`],[`showOn`,"`Bind<TooltipShowOn>`","`'hover-focus'`","`hover-focus`, `focus` (keyboard focus only) or `manual` (only `open()`)."],[`enabled`,"`Bind<boolean>`","`true`","`false` keeps the tooltip from appearing and closes it if it is open."],[`onOpened, onClosed`,"`() => void`",`—`,`See Events.`]],V=[[`every prop above`,`read/write, reactive`,`Accepts a value or a function, the same as the prop.`],[`opened`,`read/write, reactive`,`Indicates whether it is visible. Set it to open or close the tooltip.`],[`Tooltip.skipDelay`,`static, read/write`,"The time in milliseconds after a tooltip closes during which the next one appears immediately. The default is `300`, and `0` turns it off."]],H=[[`open()`,"`boolean`","Shows the tooltip now, regardless of `showOn`. Returns `false` if there is no target on the page or the tooltip is disabled."],[`close()`,"`void`",`Hides the tooltip.`],[`place()`,"`void`",`Repositions it relative to its target, for example after the target moves.`],[`addTooltip(target, text | options)`,"`() => void`",`Adds a tooltip to one element, created on first use, and returns a function that removes it. For a component, it is removed along with the component.`]],U=[[`onOpened`,`Occurs after it is shown.`],[`onClosed`,`Occurs after it is hidden.`]],W=[[`Tab (focus on the target)`,`Shows the tooltip immediately. Leaving the target hides it.`],[`Escape`,`Hides the tooltip while focus stays in place. Only the tooltip closes, not the surrounding window.`]],G=[[`Role`,'`role="tooltip"`, with one element per tooltip.'],[`Description`,"While it is visible, the target or its focusable part, such as the input of a TextBox, has `aria-describedby` pointing to the tooltip, along with its own descriptions."],[`Focus`,"A tooltip never receives focus and contains nothing interactive. For buttons or links next to an element, open a drop-down (Button `dropDown`)."],[`WCAG 1.4.13`,`Dismissible (Escape), hoverable (the pointer can move onto it) and persistent (it stays until the pointer or focus leaves).`],[`Pointer only?`,"Tooltip content must also be available another way. An icon-only button still needs its own name (`aria-label`)."],[`Touch`,`Touch does not show a tooltip, so provide the information another way for touch users.`]],K=[[`.mx-tooltip`,"The tooltip. `data-side` reports the side it opened on (`top`, `bottom`, `start`, `end`)."],[`.mx-tooltip__text`,`The text.`]],q=[[`tooltip.offset, tooltip.enter-offset`,`The gap to the target, and the distance it animates in from.`],[`tooltip.surface`,"Unit: the tooltip and its box (`max-width` sets the width before wrapping, and `rich` applies with custom content)."],[`tooltip.arrow, tooltip.text`,`Units: an optional arrow toward the target, and the text.`],[`tooltip.text-align`,`The text alignment.`]];function J(){return c({initializeComponent:e=>{{let n=o(`p`,{initializeComponent:e=>{e.class.add(`lead`);let t=o(s,{text:`A short description shown next to an element when the pointer rests on it, when it receives keyboard focus, or programmatically. Users can hover over the tooltip, Escape dismisses it, and only one is open at a time on the page.`,runover:{},childs:[]});e.controls.add(t)}},1);e.controls.add(n);let r=o(i,{anchor:`import`,title:`Import`,runover:{},childs:[o(t,{code:`
import { Tooltip, addTooltip, type TooltipShowOn } from '@motifx-community/ui';
`,runover:{},childs:[]})]});e.controls.add(r);let c=o(i,{anchor:`ways`,title:`Declarative and programmatic`,runover:{},childs:[o(`p`,{initializeComponent:e=>{let t=o(s,{text:"In JSX, place a tooltip anywhere and point it at its `target`. Its position in the markup does not matter. Programmatically, `new Tooltip({ target, text })` is all you need: it adds itself to the page the first time it appears and is removed along with its target component.",runover:{},childs:[]});e.controls.add(t)}},1),o(a,{files:z(`Programmatic.tsx`),runover:{},childs:[o(D,{runover:{},childs:[]})]})]});e.controls.add(c);let u=o(i,{anchor:`icon`,title:`Icon-only buttons`,runover:{},childs:[o(`p`,{initializeComponent:e=>{let t=o(s,{text:"A button with only an icon needs its own accessible name (`aria-label`). The tooltip displays that information and adds the shortcut as a description. Moving from one button to the next shows the next tooltip immediately.",runover:{},childs:[]});e.controls.add(t)}},1),o(a,{files:z(`IconButtons.tsx`),runover:{},childs:[o(j,{runover:{},childs:[]})]})]});e.controls.add(u);let d=o(i,{anchor:`field`,title:`Tooltips on fields`,runover:{},childs:[o(`p`,{initializeComponent:e=>{let t=o(s,{text:`On a TextBox, the whole field shows the tooltip on hover, and the input is described by it while it is visible, including on keyboard focus.`,runover:{},childs:[]});e.controls.add(t)}},1),o(a,{files:z(`OnField.tsx`),runover:{},childs:[o(P,{runover:{},childs:[]})]})]});e.controls.add(d);let f=o(i,{anchor:`placement`,title:`Placement`,runover:{},childs:[o(`p`,{initializeComponent:e=>{let t=o(s,{text:"The default is `top`. The tooltip opens on the opposite side if there is no room, and `start` and `end` follow the reading direction. Try the RTL switch at the top of the page.",runover:{},childs:[]});e.controls.add(t)}},1),o(a,{files:z(`Placement.tsx`),stack:!0,runover:{},childs:[o(I,{runover:{},childs:[]})]})]});e.controls.add(f);let p=o(i,{anchor:`delay`,title:`Delay`,runover:{},childs:[o(`p`,{initializeComponent:e=>{let t=o(s,{text:"The pointer must rest on the target for `delay` milliseconds (500 by default) before the tooltip appears, and `hideDelay` keeps it open briefly after the pointer leaves. Immediately after one closes, the next appears without a delay (`Tooltip.skipDelay`).",runover:{},childs:[]});e.controls.add(t)}},1),o(a,{files:z(`Delay.tsx`),runover:{},childs:[o(E,{runover:{},childs:[]})]})]});e.controls.add(p);let m=o(i,{anchor:`content`,title:`Rich content`,runover:{},childs:[o(`p`,{initializeComponent:e=>{let t=o(s,{text:"JSX children or `content` (any component) appear after the text. Keep it short and never include buttons or links, because a tooltip cannot receive focus.",runover:{},childs:[]});e.controls.add(t)}},1),o(a,{files:z(`RichContent.tsx`),runover:{},childs:[o(L,{runover:{},childs:[]})]})]});e.controls.add(m);let h=o(i,{anchor:`show-on`,title:`Display triggers`,runover:{},childs:[o(`p`,{initializeComponent:e=>{let t=o(s,{text:"`showOn` sets what displays the tooltip: `hover-focus` (the default), `focus` (keyboard focus only) or `manual` (only `open()` and `opened`). `enabled` turns a tooltip off.",runover:{},childs:[]});e.controls.add(t)}},1),o(a,{files:z(`ShowOn.tsx`),runover:{},childs:[o(R,{runover:{},childs:[]})]})]});e.controls.add(h);let g=o(i,{anchor:`many`,title:`Tooltips on many elements`,runover:{},childs:[o(`p`,{initializeComponent:e=>{let t=o(s,{text:"`addTooltip(target, text)` gives an element a tooltip that is created only when first needed. All tooltips on the page share one set of document listeners, so hundreds of them have almost no cost. The function returns a remover.",runover:{},childs:[]});e.controls.add(t)}},1),o(a,{files:z(`ManyElements.tsx`),stack:!0,runover:{},childs:[o(N,{runover:{},childs:[]})]})]});e.controls.add(g);let _=o(i,{anchor:`keyboard`,title:`Keyboard`,runover:{},childs:[o(l,{head:[`Key`,`Description`],rows:W,runover:{},childs:[]})]});e.controls.add(_);let v=o(i,{anchor:`a11y`,title:`Accessibility`,runover:{},childs:[o(l,{head:[`Topic`,`Details`],rows:G,runover:{},childs:[]})]});e.controls.add(v);let y=o(i,{anchor:`styling`,title:`Styling`,runover:{},childs:[o(l,{head:[`Hook`,`Description`],rows:K,runover:{},childs:[]}),o(`h3`,{initializeComponent:e=>{let t=o(s,{text:`Component tokens`,runover:{},childs:[]});e.controls.add(t)}},1),o(l,{head:[`Token`,`Description`],rows:q,runover:{},childs:[]})]});e.controls.add(y);let b=o(i,{anchor:`api`,title:`API reference`,runover:{},childs:[o(`h3`,{initializeComponent:e=>{let t=o(s,{text:`Props`,runover:{},childs:[]});e.controls.add(t)}},1),o(l,{head:[`Prop`,`Type`,`Default`,`Description`],rows:B,runover:{},childs:[]}),o(`h3`,{initializeComponent:e=>{let t=o(s,{text:`Properties`,runover:{},childs:[]});e.controls.add(t)}},1),o(l,{head:[`Property`,`Access`,`Description`],rows:V,runover:{},childs:[]}),o(`h3`,{initializeComponent:e=>{let t=o(s,{text:`Methods`,runover:{},childs:[]});e.controls.add(t)}},1),o(l,{head:[`Method`,`Returns`,`Description`],rows:H,runover:{},childs:[]}),o(`h3`,{initializeComponent:e=>{let t=o(s,{text:`Events`,runover:{},childs:[]});e.controls.add(t)}},1),o(l,{head:[`Event`,`When`],rows:U,runover:{},childs:[]})]});e.controls.add(b)}}})}export{J as default};