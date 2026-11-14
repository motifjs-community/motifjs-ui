import{$n as e,F as t,Qn as n,n as r,tr as i}from"./next-id-IxLtiCRk.js";import{n as a,t as o}from"./show-toast-CWIfvM3f.js";import{t as s}from"./Stack-DTHjt5Ku.js";import{a as c,i as l,n as u,r as d,t as f}from"./docs-DpibOHDk.js";import{t as p}from"./sources-BXVvOiIY.js";var m=`import { reactive } from '@motifx/core';\r
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
`;function x(){let t=i({progress:0,uploading:!1}),a=()=>{if(t.uploading)return;t.uploading=!0,t.progress=0;let e=o.show({title:`report.pdf`,text:()=>`Uploading… ${t.progress}%`,duration:0,closeButton:!1}),n=setInterval(()=>{t.progress=Math.min(100,t.progress+10),!(t.progress<100)&&(clearInterval(n),t.uploading=!1,e.update({text:`Uploaded.`,tone:`success`,duration:4e3,closeButton:!0}))},300);e.closed.then(()=>clearInterval(n))};return e({initializeComponent:e=>{{let i=n(r,{text:`Upload a file`,variant:`outline`,enabled:()=>!t.uploading,runover:{initializeComponent:e=>{e.motif.on(`click`,a)}},childs:[]});e.controls.add(i);let s=n(r,{text:`A toast that stays`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,()=>o.caution(`This one stays until you close it.`,{duration:0}))}},childs:[]});e.controls.add(s);let c=n(r,{text:`Close all`,variant:`ghost`,runover:{initializeComponent:e=>{e.motif.on(`click`,()=>o.closeAll())}},childs:[]});e.controls.add(c)}}})}function S(){let t=i({reason:``}),a=()=>{let e=o.show({title:`Export`,text:`Preparing the file…`,duration:0});setTimeout(()=>e.close(),2e3)},s=async()=>{t.reason=`waiting…`;let e=o.show({text:`Close me any way you like.`,duration:3e3,action:{text:`Done`}});t.reason=`closed by: ${await e.closed}`};return e({initializeComponent:e=>{{let i=n(r,{text:`Show a toast`,tone:`accent`,runover:{initializeComponent:e=>{e.motif.on(`click`,()=>o.success(`Your changes are saved.`,{title:`Saved`}))}},childs:[]});e.controls.add(i);let c=n(r,{text:`Export`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,a)}},childs:[]});e.controls.add(c);let l=n(r,{text:`Watch how it closes`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,s)}},childs:[]});e.controls.add(l);let u=n(`output`,{initializeComponent:e=>{e.class.add(`toast-reason`),e.bindings.method(()=>t.reason)}},1);e.controls.add(u)}}})}function C(){let a=i({lang:`en`}),s=()=>{a.lang=a.lang===`en`?`tr`:`en`,t.use(a.lang)};return e({initializeComponent:e=>{{let t=n(r,{text:()=>a.lang===`en`?`Language: English`:`Dil: Türkçe`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,s)}},childs:[]});e.controls.add(t);let i=n(r,{text:`Show a toast`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,()=>o.info(a.lang===`en`?`Hello.`:`Merhaba.`))}},childs:[]});e.controls.add(i)}}})}function w(){let t=i({max:2,count:0}),o=null,c=()=>{for(let e=0;e<5;e++)o?.success(`photo-${++t.count}.jpg is uploaded.`,{duration:3e3})};return e({initializeComponent:e=>{{let i=n(a,{ref:e=>o=e,position:`top-start`,max:()=>t.max,text:`Demo notifications`,runover:{},childs:[]});e.controls.add(i);let l=n(s,{orientation:`horizontal`,wrap:!0,align:`center`,role:`group`,"aria-label":`Max`,runover:{},childs:[n({initializeComponent:e=>{e.bindings.list(()=>[1,2,3],e=>n(r,{indexkey:()=>e,text:`max ${e}`,size:`sm`,variant:()=>t.max===e?`solid`:`ghost`,"aria-pressed":()=>t.max===e,runover:{initializeComponent:n=>{n.motif.on(`click`,()=>t.max=e)}},childs:[]}))}})]});e.controls.add(l);let u=n(r,{text:`Add five`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,c)}},childs:[]});e.controls.add(u)}}})}var T=[`top-start`,`top`,`top-end`,`bottom-start`,`bottom`,`bottom-end`];function E(){return e({initializeComponent:e=>{e.bindings.list(()=>T??[],e=>n(r,{indexkey:()=>e,text:e,size:`sm`,variant:`outline`,runover:{initializeComponent:t=>{t.motif.on(`click`,()=>o.info(`At ${e}.`,{position:e}))}},childs:[]}))}})}var D=[{tone:`info`,text:`A new version is ready.`},{tone:`success`,text:`Your changes are saved.`},{tone:`caution`,text:`Your session ends in 5 minutes.`},{tone:`danger`,text:`The server did not answer.`}];function O(){return e({initializeComponent:e=>{e.bindings.list(()=>D??[],({tone:e,text:t})=>n(r,{indexkey:()=>e,text:e,variant:`outline`,runover:{initializeComponent:n=>{n.motif.on(`click`,()=>o.show({tone:e,text:t}))}},childs:[]}))}})}function k(){let t=i({mails:[`Invoice #1042`,`Team lunch on Friday`,`Your order shipped`]}),a=()=>{let e=t.mails.shift();e&&o.info(`“${e}” archived.`,{action:{text:`Undo`,click:()=>t.mails.unshift(e)}})};return e({initializeComponent:e=>{{let i=n(`p`,{initializeComponent:e=>{e.class.add(`toast-mails`),e.bindings.ternary(()=>t.mails.length,e=>{e.navigate(n(`text`,{initializeComponent:e=>{e.bindings.add(`textContent`,()=>{if(`Inbox: ${t.mails.join(` · `)}`!==null&&`Inbox: ${t.mails.join(` · `)}`!==void 0)return typeof`Inbox: ${t.mails.join(` · `)}`==`function`?`Inbox: ${t.mails.join(` · `)}`():()=>`Inbox: ${t.mails.join(` · `)}`})}},1))},e=>{e.navigate(n(`text`,{initializeComponent:e=>{e.setText(`The inbox is empty.`)}},1))})}},1);e.controls.add(i);let o=n(s,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[n(r,{text:`Archive the first`,variant:`outline`,enabled:()=>t.mails.length>0,runover:{initializeComponent:e=>{e.motif.on(`click`,a)}},childs:[]})]});e.controls.add(o)}}})}var A=p(Object.assign({"./examples/DurationAndUpdate.tsx":m,"./examples/Localization.tsx":h,"./examples/OwnToaster.tsx":g,"./examples/Positions.tsx":_,"./examples/Programmatic.tsx":v,"./examples/Tones.tsx":y,"./examples/Undo.tsx":b})),j=[[`text`,"`Bind<string>`","`''`",`The message.`],[`title`,"`Bind<string>`","`''`",`A bold line above the message.`],[`tone`,"`Bind<ToastTone>`","`'info'`","`info`, `success`, `caution` or `danger`, which set the glyph, its color and how screen readers announce the toast."],[`icon`,"`Bind<IconSource | null>`",`The tone glyph`,"A custom icon, or `null` for none."],[`duration`,"`Bind<number>`","`5000`","The time it stays, in milliseconds. `0` keeps it open until it is closed."],[`action`,"`Bind<ToastAction | null>`",`—`,"`{ text, click }` adds a button to the toast, such as Undo. It runs `click(toast)` and then closes the toast."],[`closeButton`,"`Bind<boolean>`","`true`","Shows a close button named from `uiLocale`."],[`position`,"`Bind<ToastPosition>`",`From the toaster`,"The stacking position: `top-start`, `top`, `top-end`, `bottom-start`, `bottom` or `bottom-end`."],[`onClosed`,"`(reason) => void`",`—`,`See Events.`]],M=[[`toast.show(options | Toast)`,"`Toast`","Shows a toast on `Toaster.default`."],[`toast.info / success / caution / danger(text, options?)`,"`Toast`","Same as `show`, with the tone already set."],[`toast.closeAll()`,"`void`","Closes every toast on `Toaster.default`."],[`t.close(reason?)`,"`void`",`Closes the toast. A closed toast is disposed.`],[`t.update(options)`,"`void`",`Changes any options, restarts the timer and announces the toast again.`],[`t.closed`,"`Promise<ToastCloseReason>`","Resolves when the toast closes, with `timeout`, `button`, `escape`, `action` or `code`."],[`t.onClosed(fn)`,`event`,`The same information as an event.`],[`t.text, t.tone, …`,`read/write, reactive`,`Every option is also a property that accepts a value or a function.`]],N=[[`position`,"`Bind<ToastPosition>`","`'bottom-end'`",`The stacking position, unless a toast specifies its own.`],[`max`,"`Bind<number>`","`3`",`The number of toasts shown at once in one position. The rest wait their turn.`],[`hotkey`,"`Bind<string>`","`'F8'`","Moves focus to the newest toast and back again. Use `''` for none."],[`pauseOnHover`,"`Bind<boolean>`","`true`",`Pauses timers while the pointer is over the toasts. Timers always stop while focus is inside them or the page is hidden.`],[`text`,"`Bind<string>`","`uiLocale` strings",`The name of the region.`]],P=[[`Toaster.default`,`static, read/write`,"The toaster used by `toast`, created in `document.body` on first use, or the one you assign."],[`show, info, success, caution, danger, closeAll`,`methods`,"Same as on `toast`, for this toaster."],[`focusNewest()`,"`boolean`",`Moves focus to the newest toast.`],[`toasts`,`read-only`,`The toasts on screen, followed by the waiting ones.`],[`paused`,`read-only`,`Indicates whether the timers are currently paused.`]],F=[["F8 (`hotkey`)",`From anywhere on the page, moves focus to the newest toast. Inside a toast, returns focus to where it was.`],[`Tab`,`Moves through the toasts and their buttons. The default toaster is the last element on the page, so Tab reaches it after the page content.`],[`Escape`,`With focus in a toast, closes it. Focus moves to the next toast, or back to where it came from.`]],I=[[`Region`,'`<section role="region">` named "Notifications" (`uiLocale`), with `aria-keyshortcuts` for the hotkey.'],[`Read out`,'Info and success toasts are announced politely (`role="status"`), and caution and danger toasts immediately (`role="alert"`). `update()` announces the toast again. A live `text` function does not, so a progress number is not read on every change.'],[`Focus`,`A toast never takes focus. Each one is a group named by its title and text, and has its own Tab stop, so toasts without buttons can also be reached.`],[`Time`,"Timers stop while the pointer or focus is on the toasts and while the page is hidden (WCAG 2.2.1). Use `duration: 0` for anything the user must act on."],[`Motion`,`It slides in and fades out using the motion tokens. When the user prefers reduced motion, it appears without animation.`]],L=[[`.mx-toaster`,`The region.`],[`.mx-toaster__stack`,"A stack at one position. `data-position`."],[`.mx-toast`,"A toast. `data-tone`, `data-state` (`entering`, `shown`, `leaving`)."],[`.mx-toast__icon, .mx-toast__body, .mx-toast__title, .mx-toast__text`,`The parts of the component.`],[`.mx-toast__action, .mx-toast__close`,"Its buttons (Button, `sm`)."]],R=[[`toast.width`,`The width of a toast, which never exceeds the window.`],[`toast.inset, toast.slide, toast.slide-inline`,`The distance to the window edge, and how far the toast slides in from it (at a corner, also from the side).`],[`toast.buttons-align`,`The alignment of the action and close buttons.`],[`toast.stack, toast.surface`,"Units: the space between toasts, and the toast with its box per tone (`success`, `caution`, `danger`) and for keyboard focus (`focus`)."],[`toast.stripe, toast.timer`,`Optional units: a stripe along the start edge, and a line that shrinks with the remaining time, per tone.`],[`toast.icon, toast.plate, toast.mark`,`Units: the tone glyph and a plate behind it, per tone, and the tone's own mark.`],[`toast.title, toast.message, toast.action-room, toast.close-room`,"Units: the title, the message and the spacing around the buttons. Their appearance comes from the `action` and `close` places."]];function z(){return e({initializeComponent:e=>{{let t=n(`p`,{initializeComponent:e=>{e.class.add(`lead`);let t=n(d,{text:`Brief notifications at the edge of the window, with four tones, an optional action such as Undo, a custom duration or none, six positions and a limit on how many appear at once. Show them programmatically, or place a custom region in JSX.`,runover:{},childs:[]});e.controls.add(t)}},1);e.controls.add(t);let r=n(l,{anchor:`import`,title:`Import`,runover:{},childs:[n(c,{code:`
import { toast, Toast, Toaster, type ToastTone, type ToastPosition } from '@motifx-community/ui';
`,runover:{},childs:[]})]});e.controls.add(r);let i=n(l,{anchor:`ways`,title:`Programmatic and declarative use`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(d,{text:"`toast.show()` and its tone shortcuts return a `Toast` object that you can `close()`, `update()` or await. They use `Toaster.default`, which is created in `document.body` on first use. An application can place its own `Toaster` anywhere in JSX and make it the default.",runover:{},childs:[]});e.controls.add(t)}},1),n(u,{files:A(`Programmatic.tsx`),runover:{},childs:[n(S,{runover:{},childs:[]})]})]});e.controls.add(i);let a=n(l,{anchor:`tones`,title:`Tones`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(d,{text:"`tone` sets the glyph, its color, and how screen readers announce the toast: politely for `info` and `success`, and immediately for `caution` and `danger`.",runover:{},childs:[]});e.controls.add(t)}},1),n(u,{files:A(`Tones.tsx`),runover:{},childs:[n(O,{runover:{},childs:[]})]})]});e.controls.add(a);let o=n(l,{anchor:`action`,title:`Action and Undo`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(d,{text:"`action` adds a button that runs `click` and then closes the toast. Offering Undo is usually better than asking for confirmation first.",runover:{},childs:[]});e.controls.add(t)}},1),n(u,{files:A(`Undo.tsx`),stack:!0,runover:{},childs:[n(k,{runover:{},childs:[]})]})]});e.controls.add(o);let s=n(l,{anchor:`duration`,title:`Duration and updates`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(d,{text:"`duration` is 5 seconds by default, and `0` keeps the toast open until it is closed. Every option also accepts a function, and `update()` changes a visible toast and restarts its timer.",runover:{},childs:[]});e.controls.add(t)}},1),n(u,{files:A(`DurationAndUpdate.tsx`),runover:{},childs:[n(x,{runover:{},childs:[]})]})]});e.controls.add(s);let p=n(l,{anchor:`positions`,title:`Positions`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(d,{text:"There are six positions, and start and end follow the reading direction. The newest toast is closest to the edge. A toast's `position` takes precedence over the toaster's.",runover:{},childs:[]});e.controls.add(t)}},1),n(u,{files:A(`Positions.tsx`),runover:{},childs:[n(E,{runover:{},childs:[]})]})]});e.controls.add(p);let m=n(l,{anchor:`toaster`,title:`Custom toaster and max`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(d,{text:"A `Toaster` is the region toasts appear in. `max` limits how many appear at once in one position, and the rest wait until others close. This one is placed directly in the page, so Tab reaches its toasts after these buttons.",runover:{},childs:[]});e.controls.add(t)}},1),n(u,{files:A(`OwnToaster.tsx`),runover:{},childs:[n(w,{runover:{},childs:[]})]})]});e.controls.add(m);let h=n(l,{anchor:`keyboard`,title:`Keyboard`,runover:{},childs:[n(f,{head:[`Key`,`Description`],rows:F,runover:{},childs:[]})]});e.controls.add(h);let g=n(l,{anchor:`a11y`,title:`Accessibility`,runover:{},childs:[n(f,{head:[`Topic`,`Details`],rows:I,runover:{},childs:[]})]});e.controls.add(g);let _=n(l,{anchor:`i18n`,title:`Localization`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(d,{text:"The names of the region and the close button come from `uiLocale.strings` (`notifications`, `close`) and update immediately.",runover:{},childs:[]});e.controls.add(t)}},1),n(u,{files:A(`Localization.tsx`),runover:{},childs:[n(C,{runover:{},childs:[]})]})]});e.controls.add(_);let v=n(l,{anchor:`styling`,title:`Styling`,runover:{},childs:[n(f,{head:[`Hook`,`Description`],rows:L,runover:{},childs:[]}),n(`h3`,{initializeComponent:e=>{let t=n(d,{text:`Component tokens`,runover:{},childs:[]});e.controls.add(t)}},1),n(f,{head:[`Token`,`Description`],rows:R,runover:{},childs:[]})]});e.controls.add(v);let y=n(l,{anchor:`api`,title:`API reference`,runover:{},childs:[n(`h3`,{initializeComponent:e=>{let t=n(d,{text:`Toast options and props`,runover:{},childs:[]});e.controls.add(t)}},1),n(f,{head:[`Option`,`Type`,`Default`,`Description`],rows:j,runover:{},childs:[]}),n(`h3`,{initializeComponent:e=>{let t=n(d,{text:`toast and Toast`,runover:{},childs:[]});e.controls.add(t)}},1),n(f,{head:[`Member`,`Returns`,`Description`],rows:M,runover:{},childs:[]}),n(`h3`,{initializeComponent:e=>{let t=n(d,{text:`Toaster props`,runover:{},childs:[]});e.controls.add(t)}},1),n(f,{head:[`Prop`,`Type`,`Default`,`Description`],rows:N,runover:{},childs:[]}),n(`h3`,{initializeComponent:e=>{let t=n(d,{text:`Toaster members`,runover:{},childs:[]});e.controls.add(t)}},1),n(f,{head:[`Member`,`Returns`,`Description`],rows:P,runover:{},childs:[]}),n(`p`,{initializeComponent:e=>{let t=n(d,{text:"`enabled`, `visible` and the other shared control properties work on both.",runover:{},childs:[]});e.controls.add(t)}},1)]});e.controls.add(y)}}})}export{z as default};