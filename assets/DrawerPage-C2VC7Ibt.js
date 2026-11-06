import{a as e,an as t,h as n,i as r,n as i,nn as a,r as o,rn as s,t as c}from"./doc-B1CtlCkV.js";import{t as l}from"./Switch-B8uj57cD.js";import{t as u}from"./RadioGroup-BPy730Z_.js";import{t as d}from"./Stack-AS0iyAxC.js";import{t as f}from"./Drawer-CdNSFLQj.js";import{t as p}from"./ListBox-C5RriEsd.js";import{t as m}from"./sources-BXVvOiIY.js";var h=`import { reactive } from '@motifx/core';\r
import { Button, Drawer, Stack, Switch } from '@motifx-community/ui';\r
\r
/** The events of a drawer in order; "Keep it open" refuses every closing but by code. */\r
export default function Events() {\r
  const s = reactive({ open: false, keep: false, log: [] as string[] });\r
\r
  const log = (line: string) => {\r
    s.log.push(line);\r
    if (s.log.length > 6) s.log.shift();\r
  };\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center" gap="lg">\r
        <Button text="Open" variant="outline" onclick={() => (s.open = true)} />\r
        <Switch label="Keep it open" x-model={() => s.keep} />\r
      </Stack>\r
      <output>{() => s.log.join(' · ') || 'No events yet.'}</output>\r
      <Drawer\r
        side="end"\r
        title="Events"\r
        showClose\r
        x-model={() => s.open}\r
        onOpening={() => log('opening')}\r
        onOpened={() => log('opened')}\r
        onClosing={(e) => {\r
          log(\`closing (\${e.reason})\`);\r
          if (s.keep && e.reason !== 'code') e.cancel = true;\r
        }}\r
        onClosed={(e) => log(\`closed (\${e.reason})\`)}\r
      >\r
        <Button text="Close by code" variant="outline" onclick={() => (s.open = false)} />\r
      </Drawer>\r
    </>\r
  );\r
}\r
`,g=`import { reactive } from '@motifx/core';\r
import { Button, Drawer, ListBox } from '@motifx-community/ui';\r
\r
const PLACES = [\r
  { id: 'inbox', text: 'Inbox' },\r
  { id: 'starred', text: 'Starred' },\r
  { id: 'sent', text: 'Sent' },\r
  { id: 'drafts', text: 'Drafts' },\r
];\r
\r
/** A drawer over the whole page from the start edge, bound with x-model; a finger can swipe it back to close it. */\r
export default function Navigation() {\r
  const s = reactive({ open: false, place: 'inbox' });\r
\r
  return (\r
    <>\r
      <Button text="Menu" variant="outline" onclick={() => (s.open = true)} />\r
      <output>{() => \`Showing: \${PLACES.find((p) => p.id === s.place)?.text}\`}</output>\r
      <Drawer title="Mail" showClose x-model={() => s.open}>\r
        <ListBox label="Folders" items={PLACES} itemText="text" itemValue="id" x-model={() => s.place} onclick={() => (s.open = false)} />\r
      </Drawer>\r
    </>\r
  );\r
}\r
`,_=`import { reactive, type Component } from '@motifx/core';\r
import { Button, Drawer, RadioGroup, Stack, Switch, type DrawerMode, type DrawerSide } from '@motifx-community/ui';\r
\r
/** A drawer over a frame: its edge, over or pushing the content, a swipe in from the edge, modal or not. Every option is live. */\r
export default function Options() {\r
  const s = reactive({ open: false, side: 'start' as DrawerSide, mode: 'over' as DrawerMode, edge: true, modal: true, swipe: true, back: true });\r
  let frame!: Component<HTMLDivElement>;\r
  let content!: Component<HTMLDivElement>;\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center" gap="lg">\r
        <Switch label="Swipe in from the edge" x-model={() => s.edge} />\r
        <Switch label="Modal" x-model={() => s.modal} />\r
        <Switch label="Swipe back closes" x-model={() => s.swipe} />\r
        <Switch label="Back button closes" x-model={() => s.back} />\r
      </Stack>\r
      <Stack orientation="horizontal" wrap align="center" gap="lg">\r
        <RadioGroup\r
          label="Edge"\r
          orientation="horizontal"\r
          items={[\r
            { value: 'start', text: 'Start' },\r
            { value: 'end', text: 'End' },\r
            { value: 'top', text: 'Top' },\r
            { value: 'bottom', text: 'Bottom' },\r
          ]}\r
          itemText="text"\r
          itemValue="value"\r
          x-model={() => s.side}\r
        />\r
        <RadioGroup\r
          label="Mode"\r
          orientation="horizontal"\r
          items={[\r
            { value: 'over', text: 'Over' },\r
            { value: 'push', text: 'Push' },\r
          ]}\r
          itemText="text"\r
          itemValue="value"\r
          x-model={() => s.mode}\r
        />\r
        <Button text="Open" variant="outline" onclick={() => (s.open = true)} />\r
      </Stack>\r
      <div ref={(c: Component<HTMLDivElement>) => (frame = c)} style="position: relative; block-size: 28rem; overflow: hidden; border: var(--mx-border-width-1) solid var(--mx-color-stroke-card); border-radius: var(--mx-radius-lg); background: var(--mx-color-bg-layer)">\r
        <div ref={(c: Component<HTMLDivElement>) => (content = c)} style="block-size: 100%; padding: var(--mx-space-4); box-sizing: border-box">\r
          <p>The content of the frame. On a touch screen, swipe in from its edge.</p>\r
        </div>\r
      </div>\r
      <Drawer\r
        title="Filters"\r
        showClose\r
        container={() => frame}\r
        side={() => s.side}\r
        mode={() => s.mode}\r
        pushTarget={() => content}\r
        edgeSwipe={() => s.edge}\r
        modal={() => s.modal}\r
        swipeToClose={() => s.swipe}\r
        closeOnBack={() => s.back}\r
        size={() => (s.side === 'top' || s.side === 'bottom' ? '12rem' : null)}\r
        x-model={() => s.open}\r
      >\r
        <Stack gap="sm">\r
          <Switch label="Only unread" />\r
          <Switch label="With attachments" />\r
          <Button text="Apply" onclick={() => (s.open = false)} />\r
        </Stack>\r
      </Drawer>\r
    </>\r
  );\r
}\r
`;function v(){let e=t({open:!1,keep:!1,log:[]}),r=t=>{e.log.push(t),e.log.length>6&&e.log.shift()};return s({initializeComponent:t=>{{let i=a(d,{orientation:`horizontal`,wrap:!0,align:`center`,gap:`lg`,runover:{},childs:[a(n,{text:`Open`,variant:`outline`,runover:{initializeComponent:t=>{t.motif.on(`click`,()=>e.open=!0)}},childs:[]}),a(l,{label:`Keep it open`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.keep,t=>{let n=e;n!=null&&typeof n.keep!=`function`&&(n.keep=t)})}},childs:[]})]});t.controls.add(i);let o=a(`output`,{initializeComponent:t=>{t.bindings.method(()=>e.log.join(` · `)||`No events yet.`)}},1);t.controls.add(o);let s=a(f,{side:`end`,title:`Events`,showClose:!0,onOpening:()=>r(`opening`),onOpened:()=>r(`opened`),onClosing:t=>{r(`closing (${t.reason})`),e.keep&&t.reason!==`code`&&(t.cancel=!0)},onClosed:e=>r(`closed (${e.reason})`),runover:{initializeComponent:t=>{t.bindings.model(()=>e.open,t=>{let n=e;n!=null&&typeof n.open!=`function`&&(n.open=t)})}},childs:[a(n,{text:`Close by code`,variant:`outline`,runover:{initializeComponent:t=>{t.motif.on(`click`,()=>e.open=!1)}},childs:[]})]});t.controls.add(s)}}})}var y=[{id:`inbox`,text:`Inbox`},{id:`starred`,text:`Starred`},{id:`sent`,text:`Sent`},{id:`drafts`,text:`Drafts`}];function b(){let e=t({open:!1,place:`inbox`});return s({initializeComponent:t=>{{let r=a(n,{text:`Menu`,variant:`outline`,runover:{initializeComponent:t=>{t.motif.on(`click`,()=>e.open=!0)}},childs:[]});t.controls.add(r);let i=a(`output`,{initializeComponent:t=>{t.bindings.method(()=>`Showing: ${y.find(t=>t.id===e.place)?.text}`)}},1);t.controls.add(i);let o=a(f,{title:`Mail`,showClose:!0,runover:{initializeComponent:t=>{t.bindings.model(()=>e.open,t=>{let n=e;n!=null&&typeof n.open!=`function`&&(n.open=t)})}},childs:[a(p,{label:`Folders`,items:y,itemText:`text`,itemValue:`id`,runover:{initializeComponent:t=>{t.motif.on(`click`,()=>e.open=!1),t.bindings.model(()=>e.place,t=>{let n=e;n!=null&&typeof n.place!=`function`&&(n.place=t)})}},childs:[]})]});t.controls.add(o)}}})}function x(){let e=t({open:!1,side:`start`,mode:`over`,edge:!0,modal:!0,swipe:!0,back:!0}),r,i;return s({initializeComponent:t=>{{let o=a(d,{orientation:`horizontal`,wrap:!0,align:`center`,gap:`lg`,runover:{},childs:[a(l,{label:`Swipe in from the edge`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.edge,t=>{let n=e;n!=null&&typeof n.edge!=`function`&&(n.edge=t)})}},childs:[]}),a(l,{label:`Modal`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.modal,t=>{let n=e;n!=null&&typeof n.modal!=`function`&&(n.modal=t)})}},childs:[]}),a(l,{label:`Swipe back closes`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.swipe,t=>{let n=e;n!=null&&typeof n.swipe!=`function`&&(n.swipe=t)})}},childs:[]}),a(l,{label:`Back button closes`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.back,t=>{let n=e;n!=null&&typeof n.back!=`function`&&(n.back=t)})}},childs:[]})]});t.controls.add(o);let s=a(d,{orientation:`horizontal`,wrap:!0,align:`center`,gap:`lg`,runover:{},childs:[a(u,{label:`Edge`,orientation:`horizontal`,items:[{value:`start`,text:`Start`},{value:`end`,text:`End`},{value:`top`,text:`Top`},{value:`bottom`,text:`Bottom`}],itemText:`text`,itemValue:`value`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.side,t=>{let n=e;n!=null&&typeof n.side!=`function`&&(n.side=t)})}},childs:[]}),a(u,{label:`Mode`,orientation:`horizontal`,items:[{value:`over`,text:`Over`},{value:`push`,text:`Push`}],itemText:`text`,itemValue:`value`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.mode,t=>{let n=e;n!=null&&typeof n.mode!=`function`&&(n.mode=t)})}},childs:[]}),a(n,{text:`Open`,variant:`outline`,runover:{initializeComponent:t=>{t.motif.on(`click`,()=>e.open=!0)}},childs:[]})]});t.controls.add(s);let c=a(`div`,{ref:e=>r=e,initializeComponent:e=>{e.style(`position: relative; block-size: 28rem; overflow: hidden; border: var(--mx-border-width-1) solid var(--mx-color-stroke-card); border-radius: var(--mx-radius-lg); background: var(--mx-color-bg-layer)`);let t=a(`div`,{ref:e=>i=e,initializeComponent:e=>{e.style(`block-size: 100%; padding: var(--mx-space-4); box-sizing: border-box`);let t=a(`p`,{initializeComponent:e=>{let t=a(`text`,{initializeComponent:e=>{e.setText(`The content of the frame. On a touch screen, swipe in from its edge.`)}},1);e.controls.add(t)}},1);e.controls.add(t)}});e.controls.add(t)}});t.controls.add(c);let p=a(f,{title:`Filters`,showClose:!0,container:()=>r,side:()=>e.side,mode:()=>e.mode,pushTarget:()=>i,edgeSwipe:()=>e.edge,modal:()=>e.modal,swipeToClose:()=>e.swipe,closeOnBack:()=>e.back,size:()=>e.side===`top`||e.side===`bottom`?`12rem`:null,runover:{initializeComponent:t=>{t.bindings.model(()=>e.open,t=>{let n=e;n!=null&&typeof n.open!=`function`&&(n.open=t)})}},childs:[a(d,{gap:`sm`,runover:{},childs:[a(l,{label:`Only unread`,runover:{},childs:[]}),a(l,{label:`With attachments`,runover:{},childs:[]}),a(n,{text:`Apply`,runover:{initializeComponent:t=>{t.motif.on(`click`,()=>e.open=!1)}},childs:[]})]})]});t.controls.add(p)}}})}var S=m(Object.assign({"./examples/Events.tsx":h,"./examples/Navigation.tsx":g,"./examples/Options.tsx":_})),C=[[`value`,"`Bind<boolean>`","`false`","Indicates whether it is open. `x-model` provides two-way binding."],[`side`,"`Bind<'start' | 'end' | 'left' | 'right' | 'top' | 'bottom'>`","`'start'`","The edge it slides in from. `start` and `end` follow the reading direction, and `left` and `right` do not."],[`mode`,"`Bind<'over' | 'push'>`","`'over'`","Over the content, or pushing `pushTarget` aside by its size."],[`pushTarget`,"`Bind<HTMLElement | ComponentBase | null>`",`—`,"The element `push` moves aside. Without it, `push` behaves like `over`."],[`size`,"`Bind<number | string | null>`","`null`","Its width, or its height from the top or bottom, in pixels or as a CSS length. `null` uses `drawer.size`. It never exceeds 85% of the available space."],[`edgeSwipe`,"`Bind<boolean>`","`false`",`A finger swiping in from the edge of the container or page opens it, and it follows the finger.`],[`edgeSize`,"`Bind<number>`","`24`",`The distance from the edge, in pixels, where that swipe can start.`],[`swipeToClose`,"`Bind<boolean>`","`true`",`A finger swiping it back toward its edge closes it.`],[`flickSpeed`,"`Bind<number>`","`0.4`",`A flick faster than this, in pixels per millisecond, opens or closes it regardless of distance.`],[`modal`,"`Bind<boolean>`","`true` for over, `false` for push",`Blocks everything around it, and Tab stays inside.`],[`title, label, container, content, footer, showClose, scrim, closeOnEscape, closeOnScrim, closeOnBack, focusOnOpen, returnFocus, disposeOnClose`,`see BottomSheet`,``,`Props shared by all overlay panels, as listed on the [BottomSheet page](/bottomsheet#api).`]],w=[[`open(), close(reason?), toggle(), show(host)`,"`boolean`",`Same as on a bottom sheet.`],[`isOpen`,`read-only, reactive`,`Indicates whether it is open.`],[`onOpening / onOpened / onClosing / onClosed`,`events`,"Same as on a bottom sheet. A swipe back closes it with `reason: 'swipe'`, and an edge swipe canceled by `onOpening` does not move it."]],T=[["Swipe in from the edge (`edgeSwipe`)",`The drawer follows the finger. Releasing past half its size, or flicking it, leaves it open. Otherwise, it slides back.`],[`Swipe it back towards its edge`,`It follows the finger. Releasing past halfway, or flicking it, closes it. A swipe on content that scrolls horizontally goes to that content.`],[`A press on the scrim, Escape, the back button`,`It closes, and each of these has an option.`]],E=[[`Dialog`,'The panel has `role="dialog"` and is named by its title, `label` or "Side panel". It has `aria-modal` when modal, and the surrounding content is `inert`.'],[`Focus`,`Moves in when it opens as a modal, and returns to where it was when it closes.`],[`Reading direction`,"`start` is the left edge in left-to-right pages and the right edge in right-to-left pages, and the animation follows."],[`Motion`,`Slides in using the motion tokens. When the user prefers reduced motion, it appears without animation.`]],D=[[`.mx-drawer`,"The layer. `data-side` (`start`, `end`, `top`, `bottom`), `data-mode`, `data-open`, `data-modal`, `data-scrim`, `data-contained`, `data-dragging`."],[`.mx-drawer__panel`,"The dialog. `--_size`, plus `--_shift-x` and `--_shift-y` during a drag."],[`.mx-drawer__scrim, __header, __title, __tools, __close, __body, __footer`,`The parts of the component.`],[`[data-mx-drawer-push]`,"The element a push drawer moves aside, using `--_mx-push`."]],O=[[`drawer.scrim, drawer.panel`,"Units: the dimmed layer, the surface at each edge (`start`, `end`, `top`, `bottom`, which differ in the sides facing the content and the available space), and the surface when pushing content (`push`)."],[`drawer.header, drawer.title, drawer.tools, drawer.body, drawer.footer`,"Units: the content area (`body.focus`: a focus ring inside the content)."],[`drawer.size, drawer.max-size, drawer.inset, drawer.font-family`,`The opening size, the maximum share of the available space, the margin around it, and the font family.`]];function k(){return s({initializeComponent:t=>{{let n=a(`p`,{initializeComponent:e=>{e.class.add(`lead`);let t=a(o,{text:`A panel that slides in from an edge of the page or a container, either over the content or pushing it aside. Users can swipe it in from the edge and back out, and Escape, the scrim and the browser's back action close it.`,runover:{},childs:[]});e.controls.add(t)}},1);t.controls.add(n);let s=a(r,{anchor:`import`,title:`Import`,runover:{},childs:[a(e,{code:`
import { Drawer, type DrawerSide, type DrawerMode } from '@motifx-community/ui';
`,runover:{},childs:[]})]});t.controls.add(s);let l=a(r,{anchor:`ways`,title:`Page-level drawer`,runover:{},childs:[a(`p`,{initializeComponent:e=>{let t=a(o,{text:"Bind it with `x-model`, or open it with `open()` and `show(host)` as with a bottom sheet. Over the page, it opens in the top layer as a modal with a scrim.",runover:{},childs:[]});e.controls.add(t)}},1),a(i,{files:S(`Navigation.tsx`),runover:{},childs:[a(b,{runover:{},childs:[]})]})]});t.controls.add(l);let u=a(r,{anchor:`options`,title:`Edges, push mode and swipe gestures`,runover:{},childs:[a(`p`,{initializeComponent:e=>{let t=a(o,{text:"This example opens over a frame (`container`) from any edge. `push` moves the frame's content aside (`pushTarget`) and is not modal unless requested. With `edgeSwipe`, a finger on a touch screen opens it from the edge. Every option can be changed live.",runover:{},childs:[]});e.controls.add(t)}},1),a(i,{files:S(`Options.tsx`),runover:{},childs:[a(x,{runover:{},childs:[]})]})]});t.controls.add(u);let d=a(r,{anchor:`events`,title:`Events`,runover:{},childs:[a(i,{files:S(`Events.tsx`),runover:{},childs:[a(v,{runover:{},childs:[]})]})]});t.controls.add(d);let f=a(r,{anchor:`touch`,title:`Touch and keyboard`,runover:{},childs:[a(c,{head:[`Gesture or key`,`Description`],rows:[...T,[`Escape`,`Closes it.`],[`Tab, Shift+Tab`,`Moves through its controls. In a modal, focus cycles within it.`]],runover:{},childs:[]})]});t.controls.add(f);let p=a(r,{anchor:`a11y`,title:`Accessibility`,runover:{},childs:[a(c,{head:[`Topic`,`Details`],rows:E,runover:{},childs:[]})]});t.controls.add(p);let m=a(r,{anchor:`i18n`,title:`Localization`,runover:{},childs:[a(`p`,{initializeComponent:e=>{let t=a(o,{text:"Its default name and the close button come from `uiLocale.strings` (`drawerLabel`, `close`).",runover:{},childs:[]});e.controls.add(t)}},1)]});t.controls.add(m);let h=a(r,{anchor:`styling`,title:`Styling`,runover:{},childs:[a(c,{head:[`Hook`,`Description`],rows:D,runover:{},childs:[]}),a(`h3`,{initializeComponent:e=>{let t=a(o,{text:`Component tokens`,runover:{},childs:[]});e.controls.add(t)}},1),a(c,{head:[`Token`,`Description`],rows:O,runover:{},childs:[]})]});t.controls.add(h);let g=a(r,{anchor:`api`,title:`API reference`,runover:{},childs:[a(`h3`,{initializeComponent:e=>{let t=a(o,{text:`Props`,runover:{},childs:[]});e.controls.add(t)}},1),a(c,{head:[`Prop`,`Type`,`Default`,`Description`],rows:C,runover:{},childs:[]}),a(`h3`,{initializeComponent:e=>{let t=a(o,{text:`Members and events`,runover:{},childs:[]});e.controls.add(t)}},1),a(c,{head:[`Member`,`Returns`,`Description`],rows:w,runover:{},childs:[]})]});t.controls.add(g)}}})}export{k as default};