import{F as e,Qn as t,Zn as n,er as r,n as i}from"./next-id-CtzpBrBT.js";import{t as a}from"./TextBox-iHQY3j6o.js";import{t as o}from"./MxForm-BxjHcaYQ.js";import{n as s,t as c}from"./confirm-Bg9Si4ST.js";import{t as l}from"./Stack-wRt1e9tO.js";import{a as u,i as d,n as f,r as p,t as m}from"./docs-B_LZlyP5.js";import{t as h}from"./sources-BXVvOiIY.js";var g=`import { reactive, type Component } from '@motifx/core';\r
import { Button } from '@motifx-community/ui';\r
import { RenameForm } from './RenameForm';\r
\r
/** Enter clicks the form's accept button, Escape its cancel button; see RenameForm.tsx. */\r
export default function DefaultButtons() {\r
  const s = reactive({ renamed: '' });\r
  let host: Component<HTMLDivElement> | null = null;\r
\r
  const rename = async () => {\r
    const form = new RenameForm();\r
    const result = await form.showDialog(host!);\r
    s.renamed = result === 'ok' ? \`Renamed to “\${form.name}”.\` : 'Kept the old name.';\r
  };\r
\r
  return (\r
    <>\r
      <Button text="Rename…" variant="outline" onclick={rename} />\r
      <output>{() => s.renamed}</output>\r
      <div ref={(c: Component<HTMLDivElement>) => (host = c)} />\r
    </>\r
  );\r
}\r
`,_=`import { reactive } from '@motifx/core';\r
import { Button, MxForm, Stack } from '@motifx-community/ui';\r
\r
/** The events of a form in order; onClosing keeps it open while it has changes. */\r
export default function Events() {\r
  const s = reactive({ open: false, dirty: false, log: [] as string[] });\r
\r
  const log = (line: string) => {\r
    s.log.push(line);\r
    if (s.log.length > 6) s.log.shift();\r
  };\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Button text="Open" variant="outline" onclick={() => (s.open = true)} />\r
        <output class="win-log">{() => s.log.join(' · ')}</output>\r
      </Stack>\r
      <MxForm\r
        class="win-events"\r
        title="Events"\r
        x-model={() => s.open}\r
        onLoaded={() => log('loaded')}\r
        onShown={() => log('shown')}\r
        onActivate={() => log('activate')}\r
        onDeactivate={() => log('deactivate')}\r
        onClosing={(e) => {\r
          log(\`closing (\${e.reason})\`);\r
          if (s.dirty && e.reason === 'user') e.cancel = true;\r
        }}\r
        onClosed={(e) => log(\`closed: \${e.result}\`)}\r
      >\r
        <Button text={() => (s.dirty ? 'Has changes: close is kept' : 'No changes')} toggle x-model={() => s.dirty} />\r
      </MxForm>\r
    </>\r
  );\r
}\r
`,v=`import { reactive } from '@motifx/core';\r
import { Button, MxForm, Stack } from '@motifx-community/ui';\r
\r
const NoteIcon = () => (\r
  <svg viewBox="0 0 16 16" aria-hidden="true">\r
    <path d="M3.5 2.5h9v11h-9zM5.5 5.5h5M5.5 8h5M5.5 10.5h3" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" />\r
  </svg>\r
);\r
\r
const SWITCHES = ['showMinimize', 'showMaximize', 'resizable', 'movable', 'useDock'] as const;\r
\r
/** A form with an icon, minimize and maximize, that moves and resizes; every part has its switch. */\r
export default function Frame() {\r
  const s = reactive({ notes: false, showMinimize: true, showMaximize: true, resizable: true, movable: true, useDock: true });\r
  let dock: Stack | null = null;\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Frame switches">\r
        {SWITCHES.map((key) => (\r
          <Button key={key} text={key === 'useDock' ? 'minimize to the strip' : key} size="sm" toggle x-model={() => s[key]} />\r
        ))}\r
      </Stack>\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Button text="Open notes" variant="outline" onclick={() => (s.notes = true)} />\r
      </Stack>\r
      <Stack\r
        class="win-dock"\r
        orientation="horizontal"\r
        wrap\r
        align="center"\r
        ref={(c: Stack) => (dock = c)}\r
        aria-label="Minimized windows"\r
        role="group"\r
        style="inline-size: 100%; min-block-size: var(--mx-control-height-md); padding: var(--mx-space-2); border: var(--mx-border-width-1) dashed var(--mx-color-stroke-card); border-radius: var(--mx-radius-md)"\r
      />\r
      <MxForm\r
        class="win-notes"\r
        title="Notes"\r
        icon={() => <NoteIcon />}\r
        width="22rem"\r
        showMinimize={() => s.showMinimize}\r
        showMaximize={() => s.showMaximize}\r
        resizable={() => s.resizable}\r
        movable={() => s.movable}\r
        x-model={() => s.notes}\r
        onLoaded={(e) => (e.source.minimizeTarget = () => (s.useDock ? dock : null))}\r
      >\r
        <p>Drag the title bar, pull an edge, double-click the title bar.</p>\r
      </MxForm>\r
    </>\r
  );\r
}\r
`,y=`import { reactive, type Component } from '@motifx/core';\r
import { Button, MxForm, Stack, TextBox, type FormResult } from '@motifx-community/ui';\r
import { RenameForm } from './RenameForm';\r
\r
/** A modeless form in JSX shown through x-model, and a form class shown modal programmatically. */\r
export default function JsxAndCode() {\r
  const s = reactive({ find: false, query: '', found: '', renamed: '' });\r
  let host: Component<HTMLDivElement> | null = null;\r
  let findForm: MxForm | null = null;\r
\r
  const findOk = new Button({ text: 'Find', tone: 'accent' });\r
  findOk.element.addEventListener('click', () => findForm?.close('ok'));\r
  const findClose = new Button({ text: 'Close' });\r
  findClose.element.addEventListener('click', () => (s.find = false));\r
  const findButtons = new Stack({ orientation: 'horizontal', wrap: true, justify: 'end' });\r
  findButtons.controls.add(findOk, findClose);\r
\r
  const rename = async () => {\r
    const form = new RenameForm();\r
    const result: FormResult = await form.showDialog(host!);\r
    s.renamed = result === 'ok' ? \`Renamed to “\${form.name}”.\` : 'Kept the old name.';\r
  };\r
\r
  return (\r
    <>\r
      <Button text="Find…" variant="outline" onclick={() => (s.find = true)} />\r
      <MxForm\r
        class="win-find"\r
        title="Find"\r
        x-model={() => s.find}\r
        footer={findButtons}\r
        acceptButton={findOk}\r
        cancelButton={findClose}\r
        ref={(f: MxForm) => (findForm = f)}\r
        onClosed={(e) => e.result === 'ok' && (s.found = \`Searched for “\${s.query}”.\`)}\r
      >\r
        <TextBox label="&Find what" x-model={() => s.query} />\r
      </MxForm>\r
      <output class="win-found">{() => s.found}</output>\r
      <Button text="Rename… (class, modal)" variant="outline" onclick={rename} />\r
      <output class="win-renamed">{() => s.renamed}</output>\r
      <div ref={(c: Component<HTMLDivElement>) => (host = c)} />\r
    </>\r
  );\r
}\r
`,b=`import { reactive } from '@motifx/core';\r
import { Button, messageBox, uiLocale } from '@motifx-community/ui';\r
\r
/** Switches the names of the title bar buttons and of the message box buttons. */\r
export default function Localization() {\r
  const s = reactive({ lang: 'en' });\r
\r
  const toggle = () => {\r
    s.lang = s.lang === 'en' ? 'tr' : 'en';\r
    void uiLocale.use(s.lang);\r
  };\r
\r
  const ask = () =>\r
    messageBox({ title: 'Unsaved changes', text: 'Save the changes before closing?', buttons: ['yes', 'no', 'cancel'], tone: 'caution' });\r
\r
  return (\r
    <>\r
      <Button text={() => (s.lang === 'en' ? 'Language: English' : 'Dil: Türkçe')} variant="outline" onclick={toggle} />\r
      <Button text="Ask" variant="outline" onclick={ask} />\r
    </>\r
  );\r
}\r
`,x=`import { reactive } from '@motifx/core';\r
import { Button, confirm, messageBox } from '@motifx-community/ui';\r
\r
/** A message, a question with three answers, a confirmation, and custom buttons. */\r
export default function MessageBoxes() {\r
  const answer = reactive({ text: '' });\r
\r
  const info = async () => {\r
    const result = await messageBox({ title: 'Saved', text: 'The file was saved.', tone: 'success' });\r
    answer.text = \`Answer: \${result}\`;\r
  };\r
\r
  const yesNoCancel = async () => {\r
    const result = await messageBox({ title: 'Unsaved changes', text: 'Save the changes before closing?', buttons: ['yes', 'no', 'cancel'], tone: 'caution' });\r
    answer.text = \`Answer: \${result}\`;\r
  };\r
\r
  const confirmDelete = async () => {\r
    const ok = await confirm('Delete “Report.docx”? This cannot be undone.', { title: 'Delete file', tone: 'danger' });\r
    answer.text = \`Answer: \${ok}\`;\r
  };\r
\r
  const ownButtons = async () => {\r
    const result = await messageBox({\r
      title: 'Update',\r
      text: 'A new version is ready.',\r
      buttons: [\r
        { text: 'Restart now', result: 'restart' },\r
        { text: 'Later', result: 'later' },\r
      ],\r
      tone: 'info',\r
    });\r
    answer.text = \`Answer: \${result}\`;\r
  };\r
\r
  return (\r
    <>\r
      <Button text="Info" variant="outline" onclick={info} />\r
      <Button text="Yes / No / Cancel" variant="outline" onclick={yesNoCancel} />\r
      <Button text="Confirm delete" variant="outline" onclick={confirmDelete} />\r
      <Button text="Own buttons" variant="outline" onclick={ownButtons} />\r
      <output class="win-answer">{() => answer.text}</output>\r
    </>\r
  );\r
}\r
`,S=`import type { Component } from '@motifx/core';\r
import { Button, MxForm, Stack } from '@motifx-community/ui';\r
\r
/** Modeless windows that stack and minimize to a strip, and a modal form that opens another. */\r
export default function ModalAndModeless() {\r
  let host: Component<HTMLDivElement> | null = null;\r
  let dock: Stack | null = null;\r
  let windows = 0;\r
\r
  const openWindow = () => {\r
    const n = ++windows;\r
    const form = new MxForm({\r
      title: \`Window \${n}\`,\r
      showMinimize: true,\r
      showMaximize: true,\r
      startPosition: 'manual',\r
      left: 80 + n * 28,\r
      top: 120 + n * 28,\r
      width: '18rem',\r
      minimizeTarget: dock,\r
      content: <p>{\`A modeless window, number \${n}.\`}</p>,\r
    });\r
    form.show(host!);\r
  };\r
\r
  const openNested = () => {\r
    const outer = new MxForm({ title: 'Level 1', width: '22rem' });\r
    const openInner = () => {\r
      const inner = new MxForm({ title: 'Level 2', content: <p>The form below is blocked until this one closes.</p> });\r
      void inner.showDialog(outer);\r
    };\r
    outer.content = (\r
      <Stack orientation="horizontal" wrap align="center">\r
        <p>A modal form.</p>\r
        <Button text="Open level 2" onclick={openInner} />\r
      </Stack>\r
    );\r
    void outer.showDialog(host!);\r
  };\r
\r
  return (\r
    <>\r
      <Button text="Open a window" variant="outline" onclick={openWindow} />\r
      <Button text="Open nested modal forms" variant="outline" onclick={openNested} />\r
      <Stack\r
        orientation="horizontal"\r
        wrap\r
        align="center"\r
        ref={(c: Stack) => (dock = c)}\r
        aria-label="Minimized windows"\r
        role="group"\r
        style="inline-size: 100%; min-block-size: var(--mx-control-height-md); padding: var(--mx-space-2); border: var(--mx-border-width-1) dashed var(--mx-color-stroke-card); border-radius: var(--mx-radius-md)"\r
      />\r
      <div ref={(c: Component<HTMLDivElement>) => (host = c)} />\r
    </>\r
  );\r
}\r
`,C=`import { reactive } from '@motifx/core';\r
import { Button, MxForm, Stack, TextBox } from '@motifx-community/ui';\r
\r
/** A form written as a class: its content comes from \`view()\`, and its buttons from the footer. */\r
export class RenameForm extends MxForm {\r
  private readonly data = reactive({ name: 'Report.docx' });\r
\r
  constructor() {\r
    super({ title: 'Rename', width: '24rem' });\r
    const ok = new Button({ text: 'Rename', tone: 'accent' });\r
    ok.element.addEventListener('click', () => this.close('ok'));\r
    const cancel = new Button({ text: 'Cancel' });\r
    cancel.element.addEventListener('click', () => this.close('cancel'));\r
    const buttons = new Stack({ orientation: 'horizontal', wrap: true, justify: 'end' });\r
    buttons.controls.add(ok, cancel);\r
    this.footer = buttons;\r
    this.acceptButton = ok;\r
    this.cancelButton = cancel;\r
  }\r
\r
  get name(): string {\r
    return this.data.name;\r
  }\r
\r
  override view() {\r
    return <TextBox label="&New name" x-model={() => this.data.name} stretch />;\r
  }\r
}\r
`,w=class extends o{constructor(){super({title:`Rename`,width:`24rem`}),this.data=r({name:`Report.docx`});let e=new i({text:`Rename`,tone:`accent`});e.element.addEventListener(`click`,()=>this.close(`ok`));let t=new i({text:`Cancel`});t.element.addEventListener(`click`,()=>this.close(`cancel`));let n=new l({orientation:`horizontal`,wrap:!0,justify:`end`});n.controls.add(e,t),this.footer=n,this.acceptButton=e,this.cancelButton=t}get name(){return this.data.name}view(){return n(a,{label:`&New name`,stretch:!0,runover:{initializeComponent:e=>{e.bindings.model(()=>this.data.name,e=>{let t=this.data;t!=null&&typeof t.name!=`function`&&(t.name=e)})}},childs:[]})}};function T(){let e=r({renamed:``}),a=null,o=async()=>{let t=new w,n=await t.showDialog(a);e.renamed=n===`ok`?`Renamed to “${t.name}”.`:`Kept the old name.`};return t({initializeComponent:t=>{{let r=n(i,{text:`Rename…`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,o)}},childs:[]});t.controls.add(r);let s=n(`output`,{initializeComponent:t=>{t.bindings.method(()=>e.renamed)}},1);t.controls.add(s);let c=n(`div`,{ref:e=>a=e});t.controls.add(c)}}})}function E(){let e=r({open:!1,dirty:!1,log:[]}),a=t=>{e.log.push(t),e.log.length>6&&e.log.shift()};return t({initializeComponent:t=>{{let r=n(l,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[n(i,{text:`Open`,variant:`outline`,runover:{initializeComponent:t=>{t.motif.on(`click`,()=>e.open=!0)}},childs:[]}),n(`output`,{initializeComponent:t=>{t.class.add(`win-log`),t.bindings.method(()=>e.log.join(` · `))}},1)]});t.controls.add(r);let s=n(o,{class:`win-events`,title:`Events`,onLoaded:()=>a(`loaded`),onShown:()=>a(`shown`),onActivate:()=>a(`activate`),onDeactivate:()=>a(`deactivate`),onClosing:t=>{a(`closing (${t.reason})`),e.dirty&&t.reason===`user`&&(t.cancel=!0)},onClosed:e=>a(`closed: ${e.result}`),runover:{initializeComponent:t=>{t.bindings.model(()=>e.open,t=>{let n=e;n!=null&&typeof n.open!=`function`&&(n.open=t)})}},childs:[n(i,{text:()=>e.dirty?`Has changes: close is kept`:`No changes`,toggle:!0,runover:{initializeComponent:t=>{t.bindings.model(()=>e.dirty,t=>{let n=e;n!=null&&typeof n.dirty!=`function`&&(n.dirty=t)})}},childs:[]})]});t.controls.add(s)}}})}var D=()=>n(`svg`,{__isSvgElement:!0,initializeComponent:e=>{e.attr.add({viewBox:`0 0 16 16`,"aria-hidden":`true`});let t=n(`path`,{__isSvgElement:!0,initializeComponent:e=>{e.attr.add({d:`M3.5 2.5h9v11h-9zM5.5 5.5h5M5.5 8h5M5.5 10.5h3`,fill:`none`,stroke:`currentColor`,"stroke-width":`1.3`,"stroke-linejoin":`round`})}});e.controls.add(t)}}),O=[`showMinimize`,`showMaximize`,`resizable`,`movable`,`useDock`];function k(){let e=r({notes:!1,showMinimize:!0,showMaximize:!0,resizable:!0,movable:!0,useDock:!0}),a=null;return t({initializeComponent:t=>{{let r=n(l,{orientation:`horizontal`,wrap:!0,align:`center`,role:`group`,"aria-label":`Frame switches`,runover:{},childs:[n({initializeComponent:t=>{t.bindings.list(()=>O??[],t=>n(i,{indexkey:()=>t,text:()=>t===`useDock`?`minimize to the strip`:t,size:`sm`,toggle:!0,runover:{initializeComponent:n=>{n.bindings.model(()=>e[t],n=>{let r=e;r!=null&&typeof r[t]!=`function`&&(r[t]=n)})}},childs:[]}))}})]});t.controls.add(r);let s=n(l,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[n(i,{text:`Open notes`,variant:`outline`,runover:{initializeComponent:t=>{t.motif.on(`click`,()=>e.notes=!0)}},childs:[]})]});t.controls.add(s);let c=n(l,{class:`win-dock`,orientation:`horizontal`,wrap:!0,align:`center`,"aria-label":`Minimized windows`,role:`group`,style:`inline-size: 100%; min-block-size: var(--mx-control-height-md); padding: var(--mx-space-2); border: var(--mx-border-width-1) dashed var(--mx-color-stroke-card); border-radius: var(--mx-radius-md)`,ref:e=>a=e,runover:{},childs:[]});t.controls.add(c);let u=n(o,{class:`win-notes`,title:`Notes`,icon:()=>n(D,{runover:{},childs:[]}),width:`22rem`,showMinimize:()=>e.showMinimize,showMaximize:()=>e.showMaximize,resizable:()=>e.resizable,movable:()=>e.movable,onLoaded:t=>t.source.minimizeTarget=()=>e.useDock?a:null,runover:{initializeComponent:t=>{t.bindings.model(()=>e.notes,t=>{let n=e;n!=null&&typeof n.notes!=`function`&&(n.notes=t)})}},childs:[n(`p`,{initializeComponent:e=>{let t=n(`text`,{initializeComponent:e=>{e.setText(`Drag the title bar, pull an edge, double-click the title bar.`)}},1);e.controls.add(t)}},1)]});t.controls.add(u)}}})}function A(){let e=r({find:!1,query:``,found:``,renamed:``}),s=null,c=null,u=new i({text:`Find`,tone:`accent`});u.element.addEventListener(`click`,()=>c?.close(`ok`));let d=new i({text:`Close`});d.element.addEventListener(`click`,()=>e.find=!1);let f=new l({orientation:`horizontal`,wrap:!0,justify:`end`});f.controls.add(u,d);let p=async()=>{let t=new w,n=await t.showDialog(s);e.renamed=n===`ok`?`Renamed to “${t.name}”.`:`Kept the old name.`};return t({initializeComponent:t=>{{let r=n(i,{text:`Find…`,variant:`outline`,runover:{initializeComponent:t=>{t.motif.on(`click`,()=>e.find=!0)}},childs:[]});t.controls.add(r);let l=n(o,{class:`win-find`,title:`Find`,footer:f,acceptButton:u,cancelButton:d,onClosed:t=>t.result===`ok`&&(e.found=`Searched for “${e.query}”.`),ref:e=>c=e,runover:{initializeComponent:t=>{t.bindings.model(()=>e.find,t=>{let n=e;n!=null&&typeof n.find!=`function`&&(n.find=t)})}},childs:[n(a,{label:`&Find what`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.query,t=>{let n=e;n!=null&&typeof n.query!=`function`&&(n.query=t)})}},childs:[]})]});t.controls.add(l);let m=n(`output`,{initializeComponent:t=>{t.class.add(`win-found`),t.bindings.method(()=>e.found)}},1);t.controls.add(m);let h=n(i,{text:`Rename… (class, modal)`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,p)}},childs:[]});t.controls.add(h);let g=n(`output`,{initializeComponent:t=>{t.class.add(`win-renamed`),t.bindings.method(()=>e.renamed)}},1);t.controls.add(g);let _=n(`div`,{ref:e=>s=e});t.controls.add(_)}}})}function j(){let a=r({lang:`en`}),o=()=>{a.lang=a.lang===`en`?`tr`:`en`,e.use(a.lang)},c=()=>s({title:`Unsaved changes`,text:`Save the changes before closing?`,buttons:[`yes`,`no`,`cancel`],tone:`caution`});return t({initializeComponent:e=>{{let t=n(i,{text:()=>a.lang===`en`?`Language: English`:`Dil: Türkçe`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,o)}},childs:[]});e.controls.add(t);let r=n(i,{text:`Ask`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,c)}},childs:[]});e.controls.add(r)}}})}function M(){let e=r({text:``}),a=async()=>{let t=await s({title:`Saved`,text:`The file was saved.`,tone:`success`});e.text=`Answer: ${t}`},o=async()=>{let t=await s({title:`Unsaved changes`,text:`Save the changes before closing?`,buttons:[`yes`,`no`,`cancel`],tone:`caution`});e.text=`Answer: ${t}`},l=async()=>{let t=await c(`Delete “Report.docx”? This cannot be undone.`,{title:`Delete file`,tone:`danger`});e.text=`Answer: ${t}`},u=async()=>{let t=await s({title:`Update`,text:`A new version is ready.`,buttons:[{text:`Restart now`,result:`restart`},{text:`Later`,result:`later`}],tone:`info`});e.text=`Answer: ${t}`};return t({initializeComponent:t=>{{let r=n(i,{text:`Info`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,a)}},childs:[]});t.controls.add(r);let s=n(i,{text:`Yes / No / Cancel`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,o)}},childs:[]});t.controls.add(s);let c=n(i,{text:`Confirm delete`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,l)}},childs:[]});t.controls.add(c);let d=n(i,{text:`Own buttons`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,u)}},childs:[]});t.controls.add(d);let f=n(`output`,{initializeComponent:t=>{t.class.add(`win-answer`),t.bindings.method(()=>e.text)}},1);t.controls.add(f)}}})}function N(){let e=null,r=null,a=0,s=()=>{let t=++a;new o({title:`Window ${t}`,showMinimize:!0,showMaximize:!0,startPosition:`manual`,left:80+t*28,top:120+t*28,width:`18rem`,minimizeTarget:r,content:n(`p`,{initializeComponent:e=>{e.bindings.method(()=>`A modeless window, number ${t}.`)}},1)}).show(e)},c=()=>{let t=new o({title:`Level 1`,width:`22rem`}),r=()=>{new o({title:`Level 2`,content:n(`p`,{initializeComponent:e=>{let t=n(`text`,{initializeComponent:e=>{e.setText(`The form below is blocked until this one closes.`)}},1);e.controls.add(t)}},1)}).showDialog(t)};t.content=n(l,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(`text`,{initializeComponent:e=>{e.setText(`A modal form.`)}},1);e.controls.add(t)}},1),n(i,{text:`Open level 2`,runover:{initializeComponent:e=>{e.motif.on(`click`,r)}},childs:[]})]}),t.showDialog(e)};return t({initializeComponent:t=>{{let a=n(i,{text:`Open a window`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,s)}},childs:[]});t.controls.add(a);let o=n(i,{text:`Open nested modal forms`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,c)}},childs:[]});t.controls.add(o);let u=n(l,{orientation:`horizontal`,wrap:!0,align:`center`,"aria-label":`Minimized windows`,role:`group`,style:`inline-size: 100%; min-block-size: var(--mx-control-height-md); padding: var(--mx-space-2); border: var(--mx-border-width-1) dashed var(--mx-color-stroke-card); border-radius: var(--mx-radius-md)`,ref:e=>r=e,runover:{},childs:[]});t.controls.add(u);let d=n(`div`,{ref:t=>e=t});t.controls.add(d)}}})}var P=h(Object.assign({"./examples/DefaultButtons.tsx":g,"./examples/Events.tsx":_,"./examples/Frame.tsx":v,"./examples/JsxAndCode.tsx":y,"./examples/Localization.tsx":b,"./examples/MessageBoxes.tsx":x,"./examples/ModalAndModeless.tsx":S,"./examples/RenameForm.tsx":C})),F=[[`value`,"`Bind<boolean>`","`false`","Indicates whether it is open. `x-model` provides two-way binding, so `false` is written when the user closes it."],[`modal`,"`Bind<boolean>`","`false`","Opened through `value`, the form is modal."],[`title`,"`Bind<string>`","`''`","The title in the title bar, which also names the form. This is the same property as `text`."],[`content`,"`Bind<ComponentBase | null>`",`—`,"Content for the content area, in addition to JSX children and `view()`."],[`footer`,"`Bind<ComponentBase | null>`",`—`,`A non-scrolling row below the content, for buttons.`],[`icon`,"`Bind<IconSource | null>`",`—`,`An icon at the start of the title bar.`],[`showClose`,"`Bind<boolean>`","`true`",`Shows the close button.`],[`showMinimize`,"`Bind<boolean>`","`false`",`Shows the minimize button, on modeless forms only.`],[`showMaximize`,"`Bind<boolean>`","`false`",`Shows the maximize button. Double-clicking the title bar does the same.`],[`resizable`,"`Bind<boolean>`","`true`",`Allows resizing from the edges and corners.`],[`movable`,"`Bind<boolean>`","`true`",`Allows moving by dragging the title bar, within the viewport.`],[`closeOnEscape`,"`Bind<boolean>`","`true` for modal forms, `false` for modeless forms","Closes the form with `cancel` on Escape when there is no `cancelButton`."],[`acceptButton`,"`Bind<Control | null>`",`—`,`The button Enter clicks from a single-line field.`],[`cancelButton`,"`Bind<Control | null>`",`—`,`The button Escape clicks.`],[`minimizeTarget`,"`Bind<ComponentBase | null>`",`—`,`Where a minimized form leaves a chip that restores it. Without it, the form collapses to its title bar.`],[`windowState`,"`Bind<FormWindowState>`","`'normal'`","`normal`, `minimized`, `maximized`."],[`startPosition`,"`Bind<FormStartPosition>`","`'center'`","`center`, or `manual` at `left` and `top`."],[`left / top`,"`Bind<number | string>`",`—`,"With `manual`, the position from the start edge (the right edge in RTL) and the top. A number is in pixels."],[`width / height`,"`Bind<number | string>`",`Content size`,`A CSS length. A number is in pixels.`],[`alert`,"`Bind<boolean>`","`false`",'`role="alertdialog"`, for urgent content.'],[`disposeOnClose`,"`Bind<boolean>`",`see text`,"By default, a form added to the host by `show` or `showDialog` is disposed, and a JSX form is hidden."],[`enabled / disabled, visible`,`see Control`,``,`Properties shared by all controls.`]],I=[[`every prop above`,`read/write, reactive`,"Accepts a value or a function, the same as the prop. `left`, `top`, `width` and `height` track moving and resizing by the user."],[`result`,`read/write, reactive`,"How the form closed, or will close. `close()` without an argument uses this value. It is `cancel` on open."],[`isOpen, isModal, isActive`,`read-only, reactive`,`Indicate whether the form is open, whether it is modal, and whether it is the front window of the page.`],[`activeControl`,`read-only, reactive`,`The child control that has focus, or last had it.`],[`contentPart`,`read-only`,`The content area.`]],L=[[`show(host, disposeRef?)`,"`void`","Shows the form as modeless in `host` (a component or the application). It is disposed with `disposeRef`, or with the host."],[`showDialog(host, disposeRef?)`,"`Promise<FormResult>`",`Shows the form as modal and resolves with the result when it closes.`],[`close(result?)`,"`boolean`","Closes it. Returns `false` if `onClosing` canceled the close."],[`activate()`,"`void`",`Brings it to the front with focus on its last active control.`],[`minimize(), maximize(), restore()`,"`void`","These set `windowState`."],[`center()`,"`void`",`Centers it in the viewport.`],[`restoreFocus()`,"`boolean`",`Returns focus to its last active control.`]],R=[[`onLoaded(e)`,`Runs before the first show, and is where to populate the form.`],[`onShown(e)`,`Occurs after it is shown.`],[`onActivate(e) / onDeactivate(e)`,`Occur when it becomes the front window and when another window takes over.`],[`onClosing(e)`,"Occurs before it closes. `e`: `{ result, reason, source, cancel }`. Set `cancel = true` to keep it open, unless its owner is being disposed."],[`onClosed(e)`,"Occurs after it closes. `e`: `{ result, reason, source }`, where `reason` is `user` (close button, Escape), `code` or `owner`."]],z=[[`messageBox(options)`,"`Promise<FormResult>`","Shows a modal message: `title`, `text`, `buttons` (`ok`, `cancel`, `yes`, `no` or `{ text, result, tone }`), `tone` (`info`, `success`, `caution`, `danger`), `defaultButton` and `host`."],[`confirm(text, options?)`,"`Promise<boolean>`","Shows OK and Cancel, and resolves to `true` for OK."]],B=[[`Tab / Shift + Tab`,`Inside a modal form, Tab cycles within it. From a modeless form, it continues to the page.`],[`Escape`,"Clicks `cancelButton`. Otherwise, it closes the form when `closeOnEscape` is on, which is the default for modal forms."],[`Enter`,"In a single-line field, clicks `acceptButton`. This does not apply in a text area or on a button."],["Alt + key (`&Name`)",`Access keys work inside the front window. While a modal form is open, they work only inside it.`],[`Moving, resizing`,"Moved and resized with the pointer. There are no built-in keys, but an application can add them with `form.addShortcut(...)` and the `left`, `top`, `width` and `height` properties."]],V=[[`Element`,"A native `<dialog>`, using `showModal()` for a modal form, which makes the page inert, and `show()` for a modeless one."],[`Role and name`,'`role="dialog"` (`alertdialog` with `alert`), `aria-modal="true"` when modal, and named by its title through `aria-labelledby`.'],[`Description`,"A message box is described by its text (`aria-describedby`)."],[`Focus`,"On open, focus goes to `[autofocus]`, the first field, the accept button or the first control. On close, it returns to where it was. It never falls to `<body>`."],[`Title bar buttons`,"Named from `uiLocale` (Minimize, Maximize, Restore, Close)."],[`Motion`,`A short fade using the motion tokens, removed when the user prefers reduced motion.`]],H=[[`.mx-form`,"The `<dialog>`. `data-state` (`normal`, `minimized`, `maximized`), `data-modal`, `data-active`, `data-placed`, `data-docked`, `data-resizable`, `data-movable`, `data-dragging`."],[`.mx-form__bar, .mx-form__icon, .mx-form__title, .mx-form__tools`,`The title bar and its parts.`],[`.mx-form__content, .mx-form__footer`,`The content area and the button row.`],[`.mx-form__frame, .mx-form__resize[data-edge]`,`The resize handles.`],[`.mx-form-chip`,"The chip a minimized form leaves in its `minimizeTarget`."],[`.mx-message-box, .mx-message-box__icon, .mx-message-box__text`,"The content of a message box, with `data-tone`."],[`--_mx-w, --_mx-h, --_mx-x, --_mx-y`,`The size and position the form sets on itself.`]],U=[[`window.scrim, window.surface`,"Units: the backdrop of a modal form, and the surface (`active`, `dialog` for a modal form, `maximized`)."],[`window.bar, window.icon, window.title, window.tools`,"Units: the title bar (`active`, `dialog`), its icon, the title (`dialog`) and its buttons."],[`window.body, window.footer, window.grip`,"Units: the content area, the button row and the resize grips (`corner`)."],[`window.bar-height, window.title-align, window.tools-order`,"The title bar height (from the design system `bar.*` tokens), and the position of the title and its buttons."],[`window.min-width, window.min-height, window.viewport-margin`,`The minimum size and the margin kept around the form.`],[`window.resize-edge, window.enter-offset`,`The resize handles, and the distance it animates in from.`],[`window.message, window.message-icon, window.message-width`,`Message boxes: units for the content and its tone glyph (per tone), and their width.`]];function W(){return t({initializeComponent:e=>{{let t=n(`p`,{initializeComponent:e=>{e.class.add(`lead`);let t=n(p,{text:"A window or dialog built on the native `<dialog>` element. A single form can be shown as modeless or modal, depending on how you open it. It has a title bar, can be moved, resized, minimized and maximized, and Enter and Escape activate its buttons. Forms can open other forms, and `messageBox` and `confirm` cover common prompts.",runover:{},childs:[]});e.controls.add(t)}},1);e.controls.add(t);let r=n(d,{anchor:`import`,title:`Import`,runover:{},childs:[n(u,{code:`
import { MxForm, messageBox, confirm, type FormResult } from '@motifx-community/ui';
`,runover:{},childs:[]})]});e.controls.add(r);let i=n(d,{anchor:`ways`,title:`Declarative and programmatic`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(p,{text:"In JSX, `x-model` shows the form while the value is true and writes `false` when the user closes it. The form is hidden rather than disposed, and it lives with its parent. Programmatically, a form, usually a class with a `view()` method, opens with `show(host)` or `showDialog(host)`. It is added to the host and disposed when it closes.",runover:{},childs:[]});e.controls.add(t)}},1),n(f,{files:P(`JsxAndCode.tsx`,`RenameForm.tsx`),runover:{},childs:[n(A,{runover:{},childs:[]})]})]});e.controls.add(i);let a=n(d,{anchor:`modal`,title:`Modal and modeless`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(p,{text:"`show()` keeps the page usable. Several modeless windows can stack, and clicking one brings it to the front. `showDialog()` blocks everything else until it closes, and a modal form opened from another modal form blocks that form too.",runover:{},childs:[]});e.controls.add(t)}},1),n(f,{files:P(`ModalAndModeless.tsx`),runover:{},childs:[n(N,{runover:{},childs:[]})]})]});e.controls.add(a);let o=n(d,{anchor:`frame`,title:`Title bar and frame`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(p,{text:"The title bar shows the icon, the title and the buttons you enable. The form moves by its title bar and stays inside the viewport. It resizes from its edges and corners, down to the `window.min-*` tokens. Each of these features has its own setting.",runover:{},childs:[]});e.controls.add(t)}},1),n(f,{files:P(`Frame.tsx`),stack:!0,runover:{},childs:[n(k,{runover:{},childs:[]})]})]});e.controls.add(o);let s=n(d,{anchor:`buttons`,title:`Default and cancel buttons`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(p,{text:"Enter in a single-line field clicks `acceptButton`, and Escape clicks `cancelButton`. Without a cancel button, `closeOnEscape` decides. It is on for modal forms and off for modeless ones.",runover:{},childs:[]});e.controls.add(t)}},1),n(f,{files:P(`DefaultButtons.tsx`,`RenameForm.tsx`),runover:{},childs:[n(T,{runover:{},childs:[]})]})]});e.controls.add(s);let c=n(d,{anchor:`events`,title:`Events`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(p,{text:"`onClosing` can keep the form open, in this case while it has unsaved changes. `reason` distinguishes a user action (close button, Escape) from a programmatic close and from the owner being disposed.",runover:{},childs:[]});e.controls.add(t)}},1),n(f,{files:P(`Events.tsx`),stack:!0,runover:{},childs:[n(E,{runover:{},childs:[]})]})]});e.controls.add(c);let l=n(d,{anchor:`message`,title:`Message boxes`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(p,{text:"`messageBox` shows a modal message with buttons and resolves with the result of the button pressed. `confirm` asks OK or Cancel and resolves to `true` or `false`. Caution and danger boxes are alert dialogs, and a danger box starts on its safe button.",runover:{},childs:[]});e.controls.add(t)}},1),n(f,{files:P(`MessageBoxes.tsx`),runover:{},childs:[n(M,{runover:{},childs:[]})]})]});e.controls.add(l);let h=n(d,{anchor:`keyboard`,title:`Keyboard`,runover:{},childs:[n(m,{head:[`Key`,`Description`],rows:B,runover:{},childs:[]})]});e.controls.add(h);let g=n(d,{anchor:`a11y`,title:`Accessibility`,runover:{},childs:[n(m,{head:[`Topic`,`Details`],rows:V,runover:{},childs:[]})]});e.controls.add(g);let _=n(d,{anchor:`i18n`,title:`Localization`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(p,{text:"The title bar buttons and the `ok`, `cancel`, `yes` and `no` buttons of a message box get their names from `uiLocale.strings`.",runover:{},childs:[]});e.controls.add(t)}},1),n(f,{files:P(`Localization.tsx`),runover:{},childs:[n(j,{runover:{},childs:[]})]})]});e.controls.add(_);let v=n(d,{anchor:`styling`,title:`Styling`,runover:{},childs:[n(m,{head:[`Hook`,`Description`],rows:H,runover:{},childs:[]}),n(`h3`,{initializeComponent:e=>{let t=n(p,{text:`Component tokens`,runover:{},childs:[]});e.controls.add(t)}},1),n(m,{head:[`Token`,`Description`],rows:U,runover:{},childs:[]})]});e.controls.add(v);let y=n(d,{anchor:`api`,title:`API reference`,runover:{},childs:[n(`h3`,{initializeComponent:e=>{let t=n(p,{text:`Props`,runover:{},childs:[]});e.controls.add(t)}},1),n(m,{head:[`Prop`,`Type`,`Default`,`Description`],rows:F,runover:{},childs:[]}),n(`h3`,{initializeComponent:e=>{let t=n(p,{text:`Properties`,runover:{},childs:[]});e.controls.add(t)}},1),n(m,{head:[`Property`,`Access`,`Description`],rows:I,runover:{},childs:[]}),n(`h3`,{initializeComponent:e=>{let t=n(p,{text:`Methods`,runover:{},childs:[]});e.controls.add(t)}},1),n(m,{head:[`Method`,`Returns`,`Description`],rows:L,runover:{},childs:[]}),n(`h3`,{initializeComponent:e=>{let t=n(p,{text:`Events`,runover:{},childs:[]});e.controls.add(t)}},1),n(m,{head:[`Event`,`When`],rows:R,runover:{},childs:[]}),n(`h3`,{initializeComponent:e=>{let t=n(p,{text:`Helper functions`,runover:{},childs:[]});e.controls.add(t)}},1),n(m,{head:[`Function`,`Returns`,`Description`],rows:z,runover:{},childs:[]})]});e.controls.add(y)}}})}export{W as default};