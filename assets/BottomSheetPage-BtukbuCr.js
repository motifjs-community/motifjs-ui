import{Mt as e,a as t,an as n,h as r,i,n as a,nn as o,r as s,rn as c,t as l}from"./doc-B1CtlCkV.js";import{t as u}from"./Switch-B8uj57cD.js";import{t as d}from"./RadioGroup-BPy730Z_.js";import{t as f}from"./Stack-AS0iyAxC.js";import{t as p}from"./BottomSheet-korXUQGi.js";import{t as m}from"./index-DVbtDn93.js";import{t as h}from"./sources-BXVvOiIY.js";var g=`import { reactive, type Component } from '@motifx/core';\r
import { BottomSheet, Button, RadioGroup, Stack, Switch, type BottomSheetDetent } from '@motifx-community/ui';\r
\r
const ROWS = Array.from({ length: 30 }, (_, i) => ({ id: i + 1, text: \`Place \${i + 1}\` }));\r
\r
/** A sheet over a frame, at peek, half or full height. Drag the handle or title, flick, or use the arrow keys on the handle. Every behavior is a setting. */\r
export default function Detents() {\r
  const s = reactive({\r
    open: true,\r
    detent: 'peek' as BottomSheetDetent,\r
    modal: false,\r
    handle: true,\r
    draggable: true,\r
    content: true,\r
    swipe: true,\r
    back: true,\r
  });\r
  let frame!: Component<HTMLDivElement>;\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center" gap="lg">\r
        <Switch label="Modal" x-model={() => s.modal} />\r
        <Switch label="Handle" x-model={() => s.handle} />\r
        <Switch label="Draggable" x-model={() => s.draggable} />\r
        <Switch label="Content drags it" x-model={() => s.content} />\r
        <Switch label="Swipe down closes" x-model={() => s.swipe} />\r
        <Switch label="Back button closes" x-model={() => s.back} />\r
      </Stack>\r
      <Stack orientation="horizontal" wrap align="center">\r
        <RadioGroup\r
          label="Height"\r
          orientation="horizontal"\r
          items={[\r
            { value: 'peek', text: 'Peek' },\r
            { value: 'half', text: 'Half' },\r
            { value: 'full', text: 'Full' },\r
          ]}\r
          itemText="text"\r
          itemValue="value"\r
          x-model={() => s.detent}\r
        />\r
        <Button text="Open" variant="outline" enabled={() => !s.open} onclick={() => (s.open = true)} />\r
      </Stack>\r
      <div ref={(c: Component<HTMLDivElement>) => (frame = c)} class="sheet-frame" style="position: relative; block-size: 28rem; overflow: hidden; border: var(--mx-border-width-1) solid var(--mx-color-stroke-card); border-radius: var(--mx-radius-lg); background: var(--mx-color-bg-layer)">\r
        <p style="padding: var(--mx-space-4)">The page under the sheet. Non-modal, it stays usable.</p>\r
      </div>\r
      <BottomSheet\r
        title="Nearby"\r
        label="Nearby places"\r
        container={() => frame}\r
        detents={['peek', 'half', 'full']}\r
        x-model={() => s.open}\r
        detent={() => s.detent}\r
        onDetentChanged={(e) => (s.detent = e.to)}\r
        modal={() => s.modal}\r
        showHandle={() => s.handle}\r
        draggable={() => s.draggable}\r
        dragContent={() => s.content}\r
        swipeToClose={() => s.swipe}\r
        closeOnBack={() => s.back}\r
      >\r
        <ul style="margin: 0; padding: 0; list-style: none">\r
          {ROWS.map((row) => (\r
            <li key={row.id} style="padding-block: var(--mx-space-2); border-block-end: var(--mx-border-width-1) solid var(--mx-color-stroke-divider)">\r
              {row.text}\r
            </li>\r
          ))}\r
        </ul>\r
      </BottomSheet>\r
    </>\r
  );\r
}\r
`,_=`import { reactive, type Component } from '@motifx/core';\r
import { BottomSheet, Button, Stack, Switch } from '@motifx-community/ui';\r
\r
/** The events in order. While "Keep it open" is on, onClosing refuses every closing but by code; "Not full" refuses the tallest height. */\r
export default function Events() {\r
  const s = reactive({ open: false, keep: false, notFull: false, log: [] as string[] });\r
  let frame!: Component<HTMLDivElement>;\r
\r
  const log = (line: string) => {\r
    s.log.push(line);\r
    if (s.log.length > 6) s.log.shift();\r
  };\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center" gap="lg">\r
        <Button text="Open" variant="outline" enabled={() => !s.open} onclick={() => (s.open = true)} />\r
        <Switch label="Keep it open" x-model={() => s.keep} />\r
        <Switch label="Not full" x-model={() => s.notFull} />\r
      </Stack>\r
      <output>{() => s.log.join(' · ') || 'No events yet.'}</output>\r
      <div ref={(c: Component<HTMLDivElement>) => (frame = c)} style="position: relative; block-size: 28rem; overflow: hidden; border: var(--mx-border-width-1) solid var(--mx-color-stroke-card); border-radius: var(--mx-radius-lg); background: var(--mx-color-bg-layer)" />\r
      <BottomSheet\r
        title="Events"\r
        showClose\r
        container={() => frame}\r
        detents={['half', 'full']}\r
        x-model={() => s.open}\r
        onOpening={() => log('opening')}\r
        onOpened={() => log('opened')}\r
        onDetentChanging={(e) => {\r
          log(\`detentChanging \${e.from} → \${e.to}\`);\r
          if (s.notFull && e.to === 'full') e.cancel = true;\r
        }}\r
        onDetentChanged={(e) => log(\`detentChanged \${e.to}\`)}\r
        onClosing={(e) => {\r
          log(\`closing (\${e.reason})\`);\r
          if (s.keep && e.reason !== 'code') e.cancel = true;\r
        }}\r
        onClosed={(e) => log(\`closed (\${e.reason})\`)}\r
      >\r
        <p>Drag it, press Escape, the scrim, its close button or the browser's back.</p>\r
        <Button text="Close by code" variant="outline" onclick={() => (s.open = false)} />\r
      </BottomSheet>\r
    </>\r
  );\r
}\r
`,v=`import { reactive } from '@motifx/core';\r
import { BottomSheet, Button, Stack, TextBox } from '@motifx-community/ui';\r
\r
/** A sheet declared in JSX and bound to state, and one created programmatically, both over the whole page. */\r
export default function JsxAndCode() {\r
  const s = reactive({ open: false, name: 'Ada', said: '' });\r
\r
  const share = () => {\r
    const sheet = new BottomSheet({\r
      title: 'Share',\r
      detent: 'fit',\r
      detents: ['fit', 'full'],\r
      content: (\r
        <Stack gap="sm">\r
          <p>Anyone with the link can see the report.</p>\r
          <Button text="Copy the link" variant="outline" onclick={() => sheet.close()} />\r
        </Stack>\r
      ),\r
      onClosed: (e) => (s.said = \`The code sheet closed (\${e.reason}).\`),\r
    });\r
    // show() puts it in the page and disposes it when it closes.\r
    sheet.show(host);\r
  };\r
  let host!: Stack;\r
\r
  return (\r
    <Stack ref={(c: Stack) => (host = c)} gap="sm">\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Button text="Edit the name" variant="outline" onclick={() => (s.open = true)} />\r
        <Button text="Share (programmatically)" variant="outline" onclick={share} />\r
        <output>{() => s.said || \`Name: \${s.name}\`}</output>\r
      </Stack>\r
      <BottomSheet title="Your name" showClose detents={['half', 'full']} x-model={() => s.open}>\r
        <TextBox label="Name" x-model={() => s.name} />\r
      </BottomSheet>\r
    </Stack>\r
  );\r
}\r
`,y=`import { reactive } from '@motifx/core';\r
import { BottomSheet, Button, uiLocale } from '@motifx-community/ui';\r
\r
/** The handle name, height names and close button name come from uiLocale. */\r
export default function Localization() {\r
  const s = reactive({ open: false, lang: 'en' });\r
\r
  const toggle = () => {\r
    s.lang = s.lang === 'en' ? 'tr' : 'en';\r
    void uiLocale.use(s.lang);\r
  };\r
\r
  return (\r
    <>\r
      <Button text={() => (s.lang === 'en' ? 'Language: English' : 'Dil: Türkçe')} variant="outline" onclick={toggle} />\r
      <Button text="Open" variant="outline" onclick={() => (s.open = true)} />\r
      <BottomSheet showClose detents={['peek', 'half', 'full']} detent="half" x-model={() => s.open}>\r
        <p>Focus the handle: a screen reader reads its name and the height it is at.</p>\r
      </BottomSheet>\r
    </>\r
  );\r
}\r
`,b=Array.from({length:30},(e,t)=>({id:t+1,text:`Place ${t+1}`}));function x(){let e=n({open:!0,detent:`peek`,modal:!1,handle:!0,draggable:!0,content:!0,swipe:!0,back:!0}),t;return c({initializeComponent:n=>{{let i=o(f,{orientation:`horizontal`,wrap:!0,align:`center`,gap:`lg`,runover:{},childs:[o(u,{label:`Modal`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.modal,t=>{let n=e;n!=null&&typeof n.modal!=`function`&&(n.modal=t)})}},childs:[]}),o(u,{label:`Handle`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.handle,t=>{let n=e;n!=null&&typeof n.handle!=`function`&&(n.handle=t)})}},childs:[]}),o(u,{label:`Draggable`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.draggable,t=>{let n=e;n!=null&&typeof n.draggable!=`function`&&(n.draggable=t)})}},childs:[]}),o(u,{label:`Content drags it`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.content,t=>{let n=e;n!=null&&typeof n.content!=`function`&&(n.content=t)})}},childs:[]}),o(u,{label:`Swipe down closes`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.swipe,t=>{let n=e;n!=null&&typeof n.swipe!=`function`&&(n.swipe=t)})}},childs:[]}),o(u,{label:`Back button closes`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.back,t=>{let n=e;n!=null&&typeof n.back!=`function`&&(n.back=t)})}},childs:[]})]});n.controls.add(i);let a=o(f,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[o(d,{label:`Height`,orientation:`horizontal`,items:[{value:`peek`,text:`Peek`},{value:`half`,text:`Half`},{value:`full`,text:`Full`}],itemText:`text`,itemValue:`value`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.detent,t=>{let n=e;n!=null&&typeof n.detent!=`function`&&(n.detent=t)})}},childs:[]}),o(r,{text:`Open`,variant:`outline`,enabled:()=>!e.open,runover:{initializeComponent:t=>{t.motif.on(`click`,()=>e.open=!0)}},childs:[]})]});n.controls.add(a);let s=o(`div`,{ref:e=>t=e,initializeComponent:e=>{e.style(`position: relative; block-size: 28rem; overflow: hidden; border: var(--mx-border-width-1) solid var(--mx-color-stroke-card); border-radius: var(--mx-radius-lg); background: var(--mx-color-bg-layer)`),e.class.add(`sheet-frame`);let t=o(`p`,{initializeComponent:e=>{e.style(`padding: var(--mx-space-4)`);let t=o(`text`,{initializeComponent:e=>{e.setText(`The page under the sheet. Non-modal, it stays usable.`)}},1);e.controls.add(t)}},1);e.controls.add(t)}});n.controls.add(s);let c=o(p,{title:`Nearby`,label:`Nearby places`,container:()=>t,detents:[`peek`,`half`,`full`],detent:()=>e.detent,onDetentChanged:t=>e.detent=t.to,modal:()=>e.modal,showHandle:()=>e.handle,draggable:()=>e.draggable,dragContent:()=>e.content,swipeToClose:()=>e.swipe,closeOnBack:()=>e.back,runover:{initializeComponent:t=>{t.bindings.model(()=>e.open,t=>{let n=e;n!=null&&typeof n.open!=`function`&&(n.open=t)})}},childs:[o(`ul`,{initializeComponent:e=>{e.style(`margin: 0; padding: 0; list-style: none`);let t=o({initializeComponent:e=>{e.bindings.list(()=>b??[],e=>o(`li`,{indexkey:()=>e.id,initializeComponent:t=>{t.style(`padding-block: var(--mx-space-2); border-block-end: var(--mx-border-width-1) solid var(--mx-color-stroke-divider)`);let n=o(`text`,{initializeComponent:t=>{t.bindings.add(`textContent`,e,`text`)},__childExpr:()=>e.text});t.controls.add(n)}}))}});e.controls.add(t)}},1)]});n.controls.add(c)}}})}function S(){let e=n({open:!1,keep:!1,notFull:!1,log:[]}),t,i=t=>{e.log.push(t),e.log.length>6&&e.log.shift()};return c({initializeComponent:n=>{{let a=o(f,{orientation:`horizontal`,wrap:!0,align:`center`,gap:`lg`,runover:{},childs:[o(r,{text:`Open`,variant:`outline`,enabled:()=>!e.open,runover:{initializeComponent:t=>{t.motif.on(`click`,()=>e.open=!0)}},childs:[]}),o(u,{label:`Keep it open`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.keep,t=>{let n=e;n!=null&&typeof n.keep!=`function`&&(n.keep=t)})}},childs:[]}),o(u,{label:`Not full`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.notFull,t=>{let n=e;n!=null&&typeof n.notFull!=`function`&&(n.notFull=t)})}},childs:[]})]});n.controls.add(a);let s=o(`output`,{initializeComponent:t=>{t.bindings.method(()=>e.log.join(` · `)||`No events yet.`)}},1);n.controls.add(s);let c=o(`div`,{ref:e=>t=e,initializeComponent:e=>{e.style(`position: relative; block-size: 28rem; overflow: hidden; border: var(--mx-border-width-1) solid var(--mx-color-stroke-card); border-radius: var(--mx-radius-lg); background: var(--mx-color-bg-layer)`)}});n.controls.add(c);let l=o(p,{title:`Events`,showClose:!0,container:()=>t,detents:[`half`,`full`],onOpening:()=>i(`opening`),onOpened:()=>i(`opened`),onDetentChanging:t=>{i(`detentChanging ${t.from} → ${t.to}`),e.notFull&&t.to===`full`&&(t.cancel=!0)},onDetentChanged:e=>i(`detentChanged ${e.to}`),onClosing:t=>{i(`closing (${t.reason})`),e.keep&&t.reason!==`code`&&(t.cancel=!0)},onClosed:e=>i(`closed (${e.reason})`),runover:{initializeComponent:t=>{t.bindings.model(()=>e.open,t=>{let n=e;n!=null&&typeof n.open!=`function`&&(n.open=t)})}},childs:[o(`p`,{initializeComponent:e=>{let t=o(`text`,{initializeComponent:e=>{e.setText(`Drag it, press Escape, the scrim, its close button or the browser's back.`)}},1);e.controls.add(t)}},1),o(r,{text:`Close by code`,variant:`outline`,runover:{initializeComponent:t=>{t.motif.on(`click`,()=>e.open=!1)}},childs:[]})]});n.controls.add(l)}}})}function C(){let e=n({open:!1,name:`Ada`,said:``}),t=()=>{let t=new p({title:`Share`,detent:`fit`,detents:[`fit`,`full`],content:o(f,{gap:`sm`,runover:{},childs:[o(`p`,{initializeComponent:e=>{let t=o(`text`,{initializeComponent:e=>{e.setText(`Anyone with the link can see the report.`)}},1);e.controls.add(t)}},1),o(r,{text:`Copy the link`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,()=>t.close())}},childs:[]})]}),onClosed:t=>e.said=`The code sheet closed (${t.reason}).`});t.show(i)},i;return o(f,{gap:`sm`,ref:e=>i=e,runover:{},childs:[o(f,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[o(r,{text:`Edit the name`,variant:`outline`,runover:{initializeComponent:t=>{t.motif.on(`click`,()=>e.open=!0)}},childs:[]}),o(r,{text:`Share (programmatically)`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,t)}},childs:[]}),o(`output`,{initializeComponent:t=>{t.bindings.method(()=>e.said||`Name: ${e.name}`)}},1)]}),o(p,{title:`Your name`,showClose:!0,detents:[`half`,`full`],runover:{initializeComponent:t=>{t.bindings.model(()=>e.open,t=>{let n=e;n!=null&&typeof n.open!=`function`&&(n.open=t)})}},childs:[o(m,{label:`Name`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.name,t=>{let n=e;n!=null&&typeof n.name!=`function`&&(n.name=t)})}},childs:[]})]})]})}function w(){let t=n({open:!1,lang:`en`}),i=()=>{t.lang=t.lang===`en`?`tr`:`en`,e.use(t.lang)};return c({initializeComponent:e=>{{let n=o(r,{text:()=>t.lang===`en`?`Language: English`:`Dil: Türkçe`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,i)}},childs:[]});e.controls.add(n);let a=o(r,{text:`Open`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,()=>t.open=!0)}},childs:[]});e.controls.add(a);let s=o(p,{showClose:!0,detents:[`peek`,`half`,`full`],detent:`half`,runover:{initializeComponent:e=>{e.bindings.model(()=>t.open,e=>{let n=t;n!=null&&typeof n.open!=`function`&&(n.open=e)})}},childs:[o(`p`,{initializeComponent:e=>{let t=o(`text`,{initializeComponent:e=>{e.setText(`Focus the handle: a screen reader reads its name and the height it is at.`)}},1);e.controls.add(t)}},1)]});e.controls.add(s)}}})}var T=h(Object.assign({"./examples/Detents.tsx":g,"./examples/Events.tsx":_,"./examples/JsxAndCode.tsx":v,"./examples/Localization.tsx":y})),E=[[`value`,"`Bind<boolean>`","`false`","Indicates whether it is open. `x-model` provides two-way binding, so `false` is written when the user closes it."],[`title`,"`Bind<string>`","`''`","A title at the top, which also names the dialog. This is the same property as `text`."],[`label`,"`Bind<string>`","`''`",'The accessible name when there is no title. The default is "Sheet", from `uiLocale`.'],[`detents`,"`Bind<readonly BottomSheetDetent[]>`","`['half', 'full']`","The heights it stops at: `'peek'` (`sheet.peek-height`), `'half'`, `'full'` (the available space minus `sheet.top-gap`), `'fit'` (the height of its content), pixels, or a percentage such as `'40%'`."],[`detent`,"`Bind<BottomSheetDetent>`","The first of `detents`",`The height it opens at and its current height. User changes write to it, and setting it moves the sheet.`],[`modal`,"`Bind<boolean>`","`true`",`Blocks everything around it, within its container or on the whole page. Tab stays inside.`],[`scrim`,"`Bind<boolean>`",`When modal`,`Shows a dimmed layer behind it.`],[`container`,"`Bind<HTMLElement | ComponentBase | null>`","`null`","Opens over this element, which is made `relative` while open if it is static. `null` opens over the page, in the top layer."],[`content, footer`,"`Bind<ComponentBase | null>`",`—`,`Content in addition to JSX children, and a non-scrolling row below it.`],[`showClose`,"`Bind<boolean>`","`false`",`Shows a close button next to the title.`],[`showHandle`,"`Bind<boolean>`","`true`",`Shows the handle at the top, which is a grip for touch and mouse, and a slider for the keyboard.`],[`draggable`,"`Bind<boolean>`","`true`",`Lets touch and mouse move the sheet between heights using the handle and title.`],[`dragContent`,"`Bind<boolean>`","`true`",`Lets a finger on the content drag the sheet when the content cannot scroll in that direction: down from its top, or up while the sheet is not at its tallest.`],[`swipeToClose`,"`Bind<boolean>`","`true`",`Closes the sheet when it is dragged or flicked below its lowest height.`],[`flickSpeed`,"`Bind<number>`","`0.4`",`The speed at which a flick moves to the next height, in pixels per millisecond.`],[`closeOnEscape, closeOnScrim`,"`Bind<boolean>`","`true`",`Closes the sheet on Escape and on a click on the scrim.`],[`closeOnBack`,"`Bind<boolean>`","`true`",`Closes the sheet with the browser's back action (the Android back button or back gesture). It adds one history entry while open and removes it when closed another way, so no entry is left behind.`],[`focusOnOpen`,"`Bind<boolean>`",`When modal`,"Moves focus in on open: to `[autofocus]`, the first field, the first control, or the panel."],[`returnFocus`,"`Bind<boolean>`","`true`",`Returns focus to where it was on close.`],[`disposeOnClose`,"`Bind<boolean>`",`see text`,"Disposes the sheet on close. By default, this applies when `show` added it to its host."],[`enabled, visible`,`see Control`,``,`Properties shared by all controls.`]],D=[[`open()`,"`boolean`","Opens at `detent`. Returns `false` if `onOpening` canceled it. If it is not in the page, it opens from the end of the page or in its container."],[`close(reason?)`,"`boolean`","Closes it. Returns `false` if `onClosing` canceled the close."],[`toggle()`,"`boolean`",`Opens or closes the sheet.`],[`show(host, disposeRef?)`,"`boolean`","Adds it to `host` (a component or the application) if needed and opens it. It is disposed on close."],[`snapTo(detent)`,"`boolean`",`Moves it to a height, and opens it there if closed.`],[`expand(), collapse()`,"`boolean`","Moves to the next taller or shorter height. Returns `false` at the end."],[`isOpen, height`,`read-only`,`Indicates whether it is open (reactive), and its current height in pixels.`],[`panelElement, contentElement`,`read-only`,'The surface with `role="dialog"`, and the scrolling area.'],[`onOpening / onOpened`,`events`,"`{ cancel, source }` and `{ source }`. `opened` occurs after the slide-in animation."],[`onClosing / onClosed`,`events`,"`{ cancel, reason, source }` and `{ reason, source }`, with `'code'`, `'escape'`, `'scrim'`, `'swipe'`, `'back'`, `'button'` or `'owner'`. A close caused by the owner being disposed cannot be canceled."],[`onDetentChanging / onDetentChanged`,`events`,"`{ from, to, byUser, cancel, source }`. `to` can be changed, and if canceled the sheet returns to where it was."]],O=[[`Escape`,"Closes the sheet (`closeOnEscape`)."],[`Tab, Shift+Tab`,`Moves through its controls. In a modal, focus cycles within it.`],[`Up, Right, Page Up (on the handle)`,`Moves to the next taller height.`],[`Down, Left, Page Down (on the handle)`,`Moves to the next shorter height without closing the sheet.`],[`Home, End (on the handle)`,`Moves to the lowest or tallest height.`]],k=[[`Drag the handle or the title`,`The sheet follows the finger or mouse and settles at the nearest height on release. It stretches slightly beyond the tallest height.`],[`Flick`,"Moving faster than `flickSpeed` jumps to the next height in that direction, regardless of distance."],[`Drag or flick down past the lowest height`,"The sheet closes (`swipeToClose`), with `reason: 'swipe'`."],[`Drag the content`,`Dragging down from the top, or up while the sheet is not at its tallest, moves the sheet. Otherwise, the content scrolls. A horizontal swipe goes to the content.`],[`Tap the handle`,`Moves to the next height, wrapping to the lowest.`]],A=[[`Dialog`,'The panel has `role="dialog"`, is named by its title, `label` or "Sheet", and has `aria-modal` when modal. The surrounding content is `inert`, so screen readers and the keyboard stay inside.'],[`Handle`,'A vertical `role="slider"` named "Sheet height". Its value is the share of the full height, announced as the name of the height ("Half height").'],[`Focus`,`Moves in when the sheet opens (modal by default) and returns to where it was when the sheet closes.`],[`Motion`,`Slides in using the motion tokens. When the user prefers reduced motion, it appears without animation.`],[`Safe areas`,"The panel stays clear of rounded screen corners and system bars (`env(safe-area-inset-*)`)."]],j=[[`.mx-bottom-sheet`,"The layer over the page or container. `data-open`, `data-modal`, `data-scrim`, `data-contained`, `data-dragging`."],[`.mx-bottom-sheet__scrim`,`The dimmed layer.`],[`.mx-bottom-sheet__panel`,"The dialog. `--_size` is its height, and `--_drop` is how far it is pulled below its lowest height."],[`.mx-bottom-sheet__handle, .mx-bottom-sheet__grip`,`The handle (the slider) and the line drawn in it.`],[`.mx-bottom-sheet__header, __title, __tools, __close`,`The title row and its close button.`],[`.mx-bottom-sheet__body, .mx-bottom-sheet__footer`,`The scrolling content and the row below it.`]],M=[[`sheet.scrim, sheet.panel`,"Units: the dimmed layer, and the surface (`max-width` limits its width on large screens, and `full` sets its top corners when it reaches the top)."],[`sheet.handle, sheet.grip`,"Units: the handle (`focus` for keyboard use) and its grip."],[`sheet.header, sheet.title, sheet.tools, sheet.body, sheet.footer`,"Units: the content area (`body.focus`: a focus ring inside the content)."],[`sheet.top-gap, sheet.peek-height, sheet.inset`,`The gap at the top at full height, the peek height, and the margin around the panel.`],[`sheet.handle-area, sheet.font-family`,`The grab area of the handle, and the font family.`]];function N(){return c({initializeComponent:e=>{{let n=o(`p`,{initializeComponent:e=>{e.class.add(`lead`);let t=o(s,{text:`A panel that slides up from the bottom of the page or a container and stops at set heights: peek, half, full, the height of its content, or custom values. Users can drag it by its handle and title, flick it, and swipe down to close it. It can be modal or non-modal, and the back button closes it on phones.`,runover:{},childs:[]});e.controls.add(t)}},1);e.controls.add(n);let r=o(i,{anchor:`import`,title:`Import`,runover:{},childs:[o(t,{code:`
import { BottomSheet, type BottomSheetDetent } from '@motifx-community/ui';
`,runover:{},childs:[]})]});e.controls.add(r);let c=o(i,{anchor:`ways`,title:`Declarative and programmatic`,runover:{},childs:[o(`p`,{initializeComponent:e=>{let t=o(s,{text:"In JSX, `x-model` opens and closes it based on state. Programmatically, `show(host)` adds it to a component and disposes it on close, and `open()` and `close()` work on a sheet that stays in place. Without a `container`, it opens over the whole page in the browser's top layer.",runover:{},childs:[]});e.controls.add(t)}},1),o(a,{files:T(`JsxAndCode.tsx`),runover:{},childs:[o(C,{runover:{},childs:[]})]})]});e.controls.add(c);let u=o(i,{anchor:`detents`,title:`Heights, dragging and options`,runover:{},childs:[o(`p`,{initializeComponent:e=>{let t=o(s,{text:"`detents` lists the heights it stops at, and `detent` is the current one. The handle and title follow the finger or mouse, and scrolling content can drag the sheet from its top. This example opens over a frame (`container`) and is not modal, so the page underneath stays usable. Every behavior is a setting that can be changed live.",runover:{},childs:[]});e.controls.add(t)}},1),o(a,{files:T(`Detents.tsx`),runover:{},childs:[o(x,{runover:{},childs:[]})]})]});e.controls.add(u);let d=o(i,{anchor:`events`,title:`Events`,runover:{},childs:[o(`p`,{initializeComponent:e=>{let t=o(s,{text:"Each open, close and height change raises an event before and after. `onClosing` provides the reason (`reason`) and can keep the sheet open, and `onDetentChanging` can reject a height or choose another one.",runover:{},childs:[]});e.controls.add(t)}},1),o(a,{files:T(`Events.tsx`),runover:{},childs:[o(S,{runover:{},childs:[]})]})]});e.controls.add(d);let f=o(i,{anchor:`keyboard`,title:`Keyboard`,runover:{},childs:[o(l,{head:[`Key`,`Description`],rows:O,runover:{},childs:[]})]});e.controls.add(f);let p=o(i,{anchor:`touch`,title:`Touch and mouse`,runover:{},childs:[o(l,{head:[`Gesture`,`Description`],rows:k,runover:{},childs:[]})]});e.controls.add(p);let m=o(i,{anchor:`a11y`,title:`Accessibility`,runover:{},childs:[o(l,{head:[`Topic`,`Details`],rows:A,runover:{},childs:[]})]});e.controls.add(m);let h=o(i,{anchor:`i18n`,title:`Localization`,runover:{},childs:[o(`p`,{initializeComponent:e=>{let t=o(s,{text:"The handle and height names, the default name and the close button come from `uiLocale.strings` (`sheetHandle`, `sheetPeek`, `sheetHalf`, `sheetFull`, `sheetFit`, `sheetHeight`, `sheetLabel`, `close`).",runover:{},childs:[]});e.controls.add(t)}},1),o(a,{files:T(`Localization.tsx`),runover:{},childs:[o(w,{runover:{},childs:[]})]})]});e.controls.add(h);let g=o(i,{anchor:`styling`,title:`Styling`,runover:{},childs:[o(l,{head:[`Hook`,`Description`],rows:j,runover:{},childs:[]}),o(`h3`,{initializeComponent:e=>{let t=o(s,{text:`Component tokens`,runover:{},childs:[]});e.controls.add(t)}},1),o(l,{head:[`Token`,`Description`],rows:M,runover:{},childs:[]})]});e.controls.add(g);let _=o(i,{anchor:`api`,title:`API reference`,runover:{},childs:[o(`h3`,{initializeComponent:e=>{let t=o(s,{text:`Props`,runover:{},childs:[]});e.controls.add(t)}},1),o(l,{head:[`Prop`,`Type`,`Default`,`Description`],rows:E,runover:{},childs:[]}),o(`h3`,{initializeComponent:e=>{let t=o(s,{text:`Members and events`,runover:{},childs:[]});e.controls.add(t)}},1),o(l,{head:[`Member`,`Returns`,`Description`],rows:D,runover:{},childs:[]}),o(`p`,{initializeComponent:e=>{let t=o(s,{text:"Every prop is also a property that accepts a value or a function. The shared parts (the panel, scrim, modality, focus handling and back button) come from `OverlayPanel`, which `Drawer` and `ActionSheet` also use.",runover:{},childs:[]});e.controls.add(t)}},1)]});e.controls.add(_)}}})}export{N as default};