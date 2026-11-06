import{Mt as e,a as t,an as n,h as r,i,n as a,nn as o,r as s,rn as c,t as l}from"./doc-B1CtlCkV.js";import{t as u}from"./Stack-AS0iyAxC.js";import{n as d,t as f}from"./show-toast-rsPklR7w.js";import{t as p}from"./sources-BXVvOiIY.js";var m=`import { reactive } from '@motifx/core';\r
import { Button, toast } from '@motifx-community/ui';\r
\r
/** A toast with a live text that stays until the upload ends, then turns into a success; one that stays. */\r
export default function DurationAndUpdate() {\r
  const s = reactive({ progress: 0, uploading: false });\r
\r
  const upload = () => {\r
    if (s.uploading) return;\r
    s.uploading = true;\r
    s.progress = 0;\r
    const t = toast.show({ title: 'report.pdf', text: () => \`Uploading… \${s.progress}%\`, duration: 0, closeButton: false });\r
    const timer = setInterval(() => {\r
      s.progress = Math.min(100, s.progress + 10);\r
      if (s.progress < 100) return;\r
      clearInterval(timer);\r
      s.uploading = false;\r
      t.update({ text: 'Uploaded.', tone: 'success', duration: 4000, closeButton: true });\r
    }, 300);\r
    void t.closed.then(() => clearInterval(timer));\r
  };\r
\r
  return (\r
    <>\r
      <Button text="Upload a file" variant="outline" enabled={() => !s.uploading} onclick={upload} />\r
      <Button text="A toast that stays" variant="outline" onclick={() => toast.caution('This one stays until you close it.', { duration: 0 })} />\r
      <Button text="Close all" variant="ghost" onclick={() => toast.closeAll()} />\r
    </>\r
  );\r
}\r
`,h=`import { reactive } from '@motifx/core';\r
import { Button, toast, uiLocale } from '@motifx-community/ui';\r
\r
/** Switches the names of the region and the close button. */\r
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
      <Button text="Show a toast" variant="outline" onclick={() => toast.info(s.lang === 'en' ? 'Hello.' : 'Merhaba.')} />\r
    </>\r
  );\r
}\r
`,g=`import { reactive } from '@motifx/core';\r
import { Button, Stack, Toaster } from '@motifx-community/ui';\r
\r
/** A toaster placed in the page, showing at most \`max\` toasts at once. */\r
export default function OwnToaster() {\r
  const s = reactive({ max: 2, count: 0 });\r
  let uploads: Toaster | null = null;\r
\r
  const addFive = () => {\r
    for (let i = 0; i < 5; i++) uploads?.success(\`photo-\${++s.count}.jpg is uploaded.\`, { duration: 3000 });\r
  };\r
\r
  return (\r
    <>\r
      <Toaster ref={(t: Toaster) => (uploads = t)} position="top-start" max={() => s.max} text="Demo notifications" />\r
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Max">\r
        {[1, 2, 3].map((max) => (\r
          <Button\r
            key={max}\r
            text={\`max \${max}\`}\r
            size="sm"\r
            variant={() => (s.max === max ? 'solid' : 'ghost')}\r
            aria-pressed={() => s.max === max}\r
            onclick={() => (s.max = max)}\r
          />\r
        ))}\r
      </Stack>\r
      <Button text="Add five" variant="outline" onclick={addFive} />\r
    </>\r
  );\r
}\r
`,_=`import { Button, toast, type ToastPosition } from '@motifx-community/ui';\r
\r
const POSITIONS: ToastPosition[] = ['top-start', 'top', 'top-end', 'bottom-start', 'bottom', 'bottom-end'];\r
\r
/** A toast at each of the six positions. */\r
export default function Positions() {\r
  return (\r
    <>\r
      {POSITIONS.map((position) => (\r
        <Button key={position} text={position} size="sm" variant="outline" onclick={() => toast.info(\`At \${position}.\`, { position })} />\r
      ))}\r
    </>\r
  );\r
}\r
`,v=`import { reactive } from '@motifx/core';\r
import { Button, toast, type Toast } from '@motifx-community/ui';\r
\r
/** Toasts shown programmatically. The returned Toast can be closed and awaited. */\r
export default function Programmatic() {\r
  const s = reactive({ reason: '' });\r
\r
  const exportFile = () => {\r
    const t = toast.show({ title: 'Export', text: 'Preparing the file…', duration: 0 });\r
    setTimeout(() => t.close(), 2000);\r
  };\r
\r
  const watch = async () => {\r
    s.reason = 'waiting…';\r
    const t: Toast = toast.show({ text: 'Close me any way you like.', duration: 3000, action: { text: 'Done' } });\r
    s.reason = \`closed by: \${await t.closed}\`;\r
  };\r
\r
  return (\r
    <>\r
      <Button text="Show a toast" tone="accent" onclick={() => toast.success('Your changes are saved.', { title: 'Saved' })} />\r
      <Button text="Export" variant="outline" onclick={exportFile} />\r
      <Button text="Watch how it closes" variant="outline" onclick={watch} />\r
      <output class="toast-reason">{() => s.reason}</output>\r
    </>\r
  );\r
}\r
`,y=`import { Button, toast, type ToastTone } from '@motifx-community/ui';\r
\r
const TONES: { tone: ToastTone; text: string }[] = [\r
  { tone: 'info', text: 'A new version is ready.' },\r
  { tone: 'success', text: 'Your changes are saved.' },\r
  { tone: 'caution', text: 'Your session ends in 5 minutes.' },\r
  { tone: 'danger', text: 'The server did not answer.' },\r
];\r
\r
/** A toast in each of the four tones. */\r
export default function Tones() {\r
  return (\r
    <>\r
      {TONES.map(({ tone, text }) => (\r
        <Button key={tone} text={tone} variant="outline" onclick={() => toast.show({ tone, text })} />\r
      ))}\r
    </>\r
  );\r
}\r
`,b=`import { reactive } from '@motifx/core';\r
import { Button, Stack, toast } from '@motifx-community/ui';\r
\r
/** Archiving a mail at once, with an Undo button in the toast that brings it back. */\r
export default function Undo() {\r
  const s = reactive({ mails: ['Invoice #1042', 'Team lunch on Friday', 'Your order shipped'] });\r
\r
  const archive = () => {\r
    const mail = s.mails.shift();\r
    if (!mail) return;\r
    toast.info(\`“\${mail}” archived.\`, { action: { text: 'Undo', click: () => s.mails.unshift(mail) } });\r
  };\r
\r
  return (\r
    <>\r
      <p class="toast-mails">{() => (s.mails.length ? \`Inbox: \${s.mails.join(' · ')}\` : 'The inbox is empty.')}</p>\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Button text="Archive the first" variant="outline" enabled={() => s.mails.length > 0} onclick={archive} />\r
      </Stack>\r
    </>\r
  );\r
}\r
`;function x(){let e=n({progress:0,uploading:!1}),t=()=>{if(e.uploading)return;e.uploading=!0,e.progress=0;let t=f.show({title:`report.pdf`,text:()=>`Uploading… ${e.progress}%`,duration:0,closeButton:!1}),n=setInterval(()=>{e.progress=Math.min(100,e.progress+10),!(e.progress<100)&&(clearInterval(n),e.uploading=!1,t.update({text:`Uploaded.`,tone:`success`,duration:4e3,closeButton:!0}))},300);t.closed.then(()=>clearInterval(n))};return c({initializeComponent:n=>{{let i=o(r,{text:`Upload a file`,variant:`outline`,enabled:()=>!e.uploading,runover:{initializeComponent:e=>{e.motif.on(`click`,t)}},childs:[]});n.controls.add(i);let a=o(r,{text:`A toast that stays`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,()=>f.caution(`This one stays until you close it.`,{duration:0}))}},childs:[]});n.controls.add(a);let s=o(r,{text:`Close all`,variant:`ghost`,runover:{initializeComponent:e=>{e.motif.on(`click`,()=>f.closeAll())}},childs:[]});n.controls.add(s)}}})}function S(){let e=n({reason:``}),t=()=>{let e=f.show({title:`Export`,text:`Preparing the file…`,duration:0});setTimeout(()=>e.close(),2e3)},i=async()=>{e.reason=`waiting…`;let t=f.show({text:`Close me any way you like.`,duration:3e3,action:{text:`Done`}});e.reason=`closed by: ${await t.closed}`};return c({initializeComponent:n=>{{let a=o(r,{text:`Show a toast`,tone:`accent`,runover:{initializeComponent:e=>{e.motif.on(`click`,()=>f.success(`Your changes are saved.`,{title:`Saved`}))}},childs:[]});n.controls.add(a);let s=o(r,{text:`Export`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,t)}},childs:[]});n.controls.add(s);let c=o(r,{text:`Watch how it closes`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,i)}},childs:[]});n.controls.add(c);let l=o(`output`,{initializeComponent:t=>{t.class.add(`toast-reason`),t.bindings.method(()=>e.reason)}},1);n.controls.add(l)}}})}function C(){let t=n({lang:`en`}),i=()=>{t.lang=t.lang===`en`?`tr`:`en`,e.use(t.lang)};return c({initializeComponent:e=>{{let n=o(r,{text:()=>t.lang===`en`?`Language: English`:`Dil: Türkçe`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,i)}},childs:[]});e.controls.add(n);let a=o(r,{text:`Show a toast`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,()=>f.info(t.lang===`en`?`Hello.`:`Merhaba.`))}},childs:[]});e.controls.add(a)}}})}function w(){let e=n({max:2,count:0}),t=null,i=()=>{for(let n=0;n<5;n++)t?.success(`photo-${++e.count}.jpg is uploaded.`,{duration:3e3})};return c({initializeComponent:n=>{{let a=o(d,{position:`top-start`,max:()=>e.max,text:`Demo notifications`,ref:e=>t=e,runover:{},childs:[]});n.controls.add(a);let s=o(u,{orientation:`horizontal`,wrap:!0,align:`center`,role:`group`,"aria-label":`Max`,runover:{},childs:[o({initializeComponent:t=>{t.bindings.list(()=>[1,2,3],t=>o(r,{indexkey:()=>t,text:`max ${t}`,size:`sm`,variant:()=>e.max===t?`solid`:`ghost`,"aria-pressed":()=>e.max===t,runover:{initializeComponent:n=>{n.motif.on(`click`,()=>e.max=t)}},childs:[]}))}})]});n.controls.add(s);let c=o(r,{text:`Add five`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,i)}},childs:[]});n.controls.add(c)}}})}var T=[`top-start`,`top`,`top-end`,`bottom-start`,`bottom`,`bottom-end`];function E(){return c({initializeComponent:e=>{e.bindings.list(()=>T??[],e=>o(r,{indexkey:()=>e,text:e,size:`sm`,variant:`outline`,runover:{initializeComponent:t=>{t.motif.on(`click`,()=>f.info(`At ${e}.`,{position:e}))}},childs:[]}))}})}var D=[{tone:`info`,text:`A new version is ready.`},{tone:`success`,text:`Your changes are saved.`},{tone:`caution`,text:`Your session ends in 5 minutes.`},{tone:`danger`,text:`The server did not answer.`}];function O(){return c({initializeComponent:e=>{e.bindings.list(()=>D??[],({tone:e,text:t})=>o(r,{indexkey:()=>e,text:e,variant:`outline`,runover:{initializeComponent:n=>{n.motif.on(`click`,()=>f.show({tone:e,text:t}))}},childs:[]}))}})}function k(){let e=n({mails:[`Invoice #1042`,`Team lunch on Friday`,`Your order shipped`]}),t=()=>{let t=e.mails.shift();t&&f.info(`“${t}” archived.`,{action:{text:`Undo`,click:()=>e.mails.unshift(t)}})};return c({initializeComponent:n=>{{let i=o(`p`,{initializeComponent:t=>{t.class.add(`toast-mails`),t.bindings.ternary(()=>e.mails.length,t=>{t.navigate(o(`text`,{initializeComponent:t=>{t.bindings.add(`textContent`,()=>{if(`Inbox: ${e.mails.join(` · `)}`!==null&&`Inbox: ${e.mails.join(` · `)}`!==void 0)return typeof`Inbox: ${e.mails.join(` · `)}`==`function`?`Inbox: ${e.mails.join(` · `)}`():()=>`Inbox: ${e.mails.join(` · `)}`})}},1))},e=>{e.navigate(o(`text`,{initializeComponent:e=>{e.setText(`The inbox is empty.`)}},1))})}},1);n.controls.add(i);let a=o(u,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[o(r,{text:`Archive the first`,variant:`outline`,enabled:()=>e.mails.length>0,runover:{initializeComponent:e=>{e.motif.on(`click`,t)}},childs:[]})]});n.controls.add(a)}}})}var A=p(Object.assign({"./examples/DurationAndUpdate.tsx":m,"./examples/Localization.tsx":h,"./examples/OwnToaster.tsx":g,"./examples/Positions.tsx":_,"./examples/Programmatic.tsx":v,"./examples/Tones.tsx":y,"./examples/Undo.tsx":b})),j=[[`text`,"`Bind<string>`","`''`",`The message.`],[`title`,"`Bind<string>`","`''`",`A bold line above the message.`],[`tone`,"`Bind<ToastTone>`","`'info'`","`info`, `success`, `caution` or `danger`, which set the glyph, its color and how screen readers announce the toast."],[`icon`,"`Bind<IconSource | null>`",`The tone glyph`,"A custom icon, or `null` for none."],[`duration`,"`Bind<number>`","`5000`","The time it stays, in milliseconds. `0` keeps it open until it is closed."],[`action`,"`Bind<ToastAction | null>`",`—`,"`{ text, click }` adds a button to the toast, such as Undo. It runs `click(toast)` and then closes the toast."],[`closeButton`,"`Bind<boolean>`","`true`","Shows a close button named from `uiLocale`."],[`position`,"`Bind<ToastPosition>`",`From the toaster`,"The stacking position: `top-start`, `top`, `top-end`, `bottom-start`, `bottom` or `bottom-end`."],[`onClosed`,"`(reason) => void`",`—`,`See Events.`]],M=[[`toast.show(options | Toast)`,"`Toast`","Shows a toast on `Toaster.default`."],[`toast.info / success / caution / danger(text, options?)`,"`Toast`","Same as `show`, with the tone already set."],[`toast.closeAll()`,"`void`","Closes every toast on `Toaster.default`."],[`t.close(reason?)`,"`void`",`Closes the toast. A closed toast is disposed.`],[`t.update(options)`,"`void`",`Changes any options, restarts the timer and announces the toast again.`],[`t.closed`,"`Promise<ToastCloseReason>`","Resolves when the toast closes, with `timeout`, `button`, `escape`, `action` or `code`."],[`t.onClosed(fn)`,`event`,`The same information as an event.`],[`t.text, t.tone, …`,`read/write, reactive`,`Every option is also a property that accepts a value or a function.`]],N=[[`position`,"`Bind<ToastPosition>`","`'bottom-end'`",`The stacking position, unless a toast specifies its own.`],[`max`,"`Bind<number>`","`3`",`The number of toasts shown at once in one position. The rest wait their turn.`],[`hotkey`,"`Bind<string>`","`'F8'`","Moves focus to the newest toast and back again. Use `''` for none."],[`pauseOnHover`,"`Bind<boolean>`","`true`",`Pauses timers while the pointer is over the toasts. Timers always stop while focus is inside them or the page is hidden.`],[`text`,"`Bind<string>`","`uiLocale` strings",`The name of the region.`]],P=[[`Toaster.default`,`static, read/write`,"The toaster used by `toast`, created in `document.body` on first use, or the one you assign."],[`show, info, success, caution, danger, closeAll`,`methods`,"Same as on `toast`, for this toaster."],[`focusNewest()`,"`boolean`",`Moves focus to the newest toast.`],[`toasts`,`read-only`,`The toasts on screen, followed by the waiting ones.`],[`paused`,`read-only`,`Indicates whether the timers are currently paused.`]],F=[["F8 (`hotkey`)",`From anywhere on the page, moves focus to the newest toast. Inside a toast, returns focus to where it was.`],[`Tab`,`Moves through the toasts and their buttons. The default toaster is the last element on the page, so Tab reaches it after the page content.`],[`Escape`,`With focus in a toast, closes it. Focus moves to the next toast, or back to where it came from.`]],I=[[`Region`,'`<section role="region">` named "Notifications" (`uiLocale`), with `aria-keyshortcuts` for the hotkey.'],[`Read out`,'Info and success toasts are announced politely (`role="status"`), and caution and danger toasts immediately (`role="alert"`). `update()` announces the toast again. A live `text` function does not, so a progress number is not read on every change.'],[`Focus`,`A toast never takes focus. Each one is a group named by its title and text, and has its own Tab stop, so toasts without buttons can also be reached.`],[`Time`,"Timers stop while the pointer or focus is on the toasts and while the page is hidden (WCAG 2.2.1). Use `duration: 0` for anything the user must act on."],[`Motion`,`It slides in and fades out using the motion tokens. When the user prefers reduced motion, it appears without animation.`]],L=[[`.mx-toaster`,`The region.`],[`.mx-toaster__stack`,"A stack at one position. `data-position`."],[`.mx-toast`,"A toast. `data-tone`, `data-state` (`entering`, `shown`, `leaving`)."],[`.mx-toast__icon, .mx-toast__body, .mx-toast__title, .mx-toast__text`,`The parts of the component.`],[`.mx-toast__action, .mx-toast__close`,"Its buttons (Button, `sm`)."]],R=[[`toast.width`,`The width of a toast, which never exceeds the window.`],[`toast.inset, toast.slide, toast.slide-inline`,`The distance to the window edge, and how far the toast slides in from it (at a corner, also from the side).`],[`toast.buttons-align`,`The alignment of the action and close buttons.`],[`toast.stack, toast.surface`,"Units: the space between toasts, and the toast with its box per tone (`success`, `caution`, `danger`) and for keyboard focus (`focus`)."],[`toast.stripe, toast.timer`,`Optional units: a stripe along the start edge, and a line that shrinks with the remaining time, per tone.`],[`toast.icon, toast.plate, toast.mark`,`Units: the tone glyph and a plate behind it, per tone, and the tone's own mark.`],[`toast.title, toast.message, toast.action-room, toast.close-room`,"Units: the title, the message and the spacing around the buttons. Their appearance comes from the `action` and `close` places."]];function z(){return c({initializeComponent:e=>{{let n=o(`p`,{initializeComponent:e=>{e.class.add(`lead`);let t=o(s,{text:`Brief notifications at the edge of the window, with four tones, an optional action such as Undo, a custom duration or none, six positions and a limit on how many appear at once. Show them programmatically, or place a custom region in JSX.`,runover:{},childs:[]});e.controls.add(t)}},1);e.controls.add(n);let r=o(i,{anchor:`import`,title:`Import`,runover:{},childs:[o(t,{code:`
import { toast, Toast, Toaster, type ToastTone, type ToastPosition } from '@motifx-community/ui';
`,runover:{},childs:[]})]});e.controls.add(r);let c=o(i,{anchor:`ways`,title:`Programmatic and declarative use`,runover:{},childs:[o(`p`,{initializeComponent:e=>{let t=o(s,{text:"`toast.show()` and its tone shortcuts return a `Toast` object that you can `close()`, `update()` or await. They use `Toaster.default`, which is created in `document.body` on first use. An application can place its own `Toaster` anywhere in JSX and make it the default.",runover:{},childs:[]});e.controls.add(t)}},1),o(a,{files:A(`Programmatic.tsx`),runover:{},childs:[o(S,{runover:{},childs:[]})]})]});e.controls.add(c);let u=o(i,{anchor:`tones`,title:`Tones`,runover:{},childs:[o(`p`,{initializeComponent:e=>{let t=o(s,{text:"`tone` sets the glyph, its color, and how screen readers announce the toast: politely for `info` and `success`, and immediately for `caution` and `danger`.",runover:{},childs:[]});e.controls.add(t)}},1),o(a,{files:A(`Tones.tsx`),runover:{},childs:[o(O,{runover:{},childs:[]})]})]});e.controls.add(u);let d=o(i,{anchor:`action`,title:`Action and Undo`,runover:{},childs:[o(`p`,{initializeComponent:e=>{let t=o(s,{text:"`action` adds a button that runs `click` and then closes the toast. Offering Undo is usually better than asking for confirmation first.",runover:{},childs:[]});e.controls.add(t)}},1),o(a,{files:A(`Undo.tsx`),stack:!0,runover:{},childs:[o(k,{runover:{},childs:[]})]})]});e.controls.add(d);let f=o(i,{anchor:`duration`,title:`Duration and updates`,runover:{},childs:[o(`p`,{initializeComponent:e=>{let t=o(s,{text:"`duration` is 5 seconds by default, and `0` keeps the toast open until it is closed. Every option also accepts a function, and `update()` changes a visible toast and restarts its timer.",runover:{},childs:[]});e.controls.add(t)}},1),o(a,{files:A(`DurationAndUpdate.tsx`),runover:{},childs:[o(x,{runover:{},childs:[]})]})]});e.controls.add(f);let p=o(i,{anchor:`positions`,title:`Positions`,runover:{},childs:[o(`p`,{initializeComponent:e=>{let t=o(s,{text:"There are six positions, and start and end follow the reading direction. The newest toast is closest to the edge. A toast's `position` takes precedence over the toaster's.",runover:{},childs:[]});e.controls.add(t)}},1),o(a,{files:A(`Positions.tsx`),runover:{},childs:[o(E,{runover:{},childs:[]})]})]});e.controls.add(p);let m=o(i,{anchor:`toaster`,title:`Custom toaster and max`,runover:{},childs:[o(`p`,{initializeComponent:e=>{let t=o(s,{text:"A `Toaster` is the region toasts appear in. `max` limits how many appear at once in one position, and the rest wait until others close. This one is placed directly in the page, so Tab reaches its toasts after these buttons.",runover:{},childs:[]});e.controls.add(t)}},1),o(a,{files:A(`OwnToaster.tsx`),runover:{},childs:[o(w,{runover:{},childs:[]})]})]});e.controls.add(m);let h=o(i,{anchor:`keyboard`,title:`Keyboard`,runover:{},childs:[o(l,{head:[`Key`,`Description`],rows:F,runover:{},childs:[]})]});e.controls.add(h);let g=o(i,{anchor:`a11y`,title:`Accessibility`,runover:{},childs:[o(l,{head:[`Topic`,`Details`],rows:I,runover:{},childs:[]})]});e.controls.add(g);let _=o(i,{anchor:`i18n`,title:`Localization`,runover:{},childs:[o(`p`,{initializeComponent:e=>{let t=o(s,{text:"The names of the region and the close button come from `uiLocale.strings` (`notifications`, `close`) and update immediately.",runover:{},childs:[]});e.controls.add(t)}},1),o(a,{files:A(`Localization.tsx`),runover:{},childs:[o(C,{runover:{},childs:[]})]})]});e.controls.add(_);let v=o(i,{anchor:`styling`,title:`Styling`,runover:{},childs:[o(l,{head:[`Hook`,`Description`],rows:L,runover:{},childs:[]}),o(`h3`,{initializeComponent:e=>{let t=o(s,{text:`Component tokens`,runover:{},childs:[]});e.controls.add(t)}},1),o(l,{head:[`Token`,`Description`],rows:R,runover:{},childs:[]})]});e.controls.add(v);let y=o(i,{anchor:`api`,title:`API reference`,runover:{},childs:[o(`h3`,{initializeComponent:e=>{let t=o(s,{text:`Toast options and props`,runover:{},childs:[]});e.controls.add(t)}},1),o(l,{head:[`Option`,`Type`,`Default`,`Description`],rows:j,runover:{},childs:[]}),o(`h3`,{initializeComponent:e=>{let t=o(s,{text:`toast and Toast`,runover:{},childs:[]});e.controls.add(t)}},1),o(l,{head:[`Member`,`Returns`,`Description`],rows:M,runover:{},childs:[]}),o(`h3`,{initializeComponent:e=>{let t=o(s,{text:`Toaster props`,runover:{},childs:[]});e.controls.add(t)}},1),o(l,{head:[`Prop`,`Type`,`Default`,`Description`],rows:N,runover:{},childs:[]}),o(`h3`,{initializeComponent:e=>{let t=o(s,{text:`Toaster members`,runover:{},childs:[]});e.controls.add(t)}},1),o(l,{head:[`Member`,`Returns`,`Description`],rows:P,runover:{},childs:[]}),o(`p`,{initializeComponent:e=>{let t=o(s,{text:"`enabled`, `visible` and the other shared control properties work on both.",runover:{},childs:[]});e.controls.add(t)}},1)]});e.controls.add(y)}}})}export{z as default};