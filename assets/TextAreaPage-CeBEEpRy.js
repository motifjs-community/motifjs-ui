import{F as e,Qn as t,Zn as n,er as r,n as i}from"./next-id-CtzpBrBT.js";import{t as a}from"./TextArea-B9RnvadP.js";import{t as o}from"./Stack-wRt1e9tO.js";import{a as s,i as c,n as l,r as u,t as d}from"./docs-B_LZlyP5.js";import{t as f}from"./sources-BXVvOiIY.js";import{t as p}from"./kit-texts-BMQUznlf.js";var m=`import { reactive } from '@motifx/core';\r
import { TextArea } from '@motifx-community/ui';\r
\r
/** A box that grows with the text from two lines to six, then scrolls. */\r
export default function AutoGrow() {\r
  const s = reactive({ story: '' });\r
  return <TextArea label="Story" autoGrow minRows={2} maxRows={6} placeholder="Type a few lines…" x-model={() => s.story} stretch />;\r
}\r
`,h=`import { reactive } from '@motifx/core';\r
import { TextArea } from '@motifx-community/ui';\r
\r
/** A limit while typing, a minimum checked on leaving, a counter and a clear button. */\r
export default function CounterAndLimits() {\r
  const s = reactive({ bio: '' });\r
  return <TextArea label="Bio" maxLength={160} minLength={10} showCounter clearButton x-model={() => s.bio} stretch />;\r
}\r
`,g=`import { reactive } from '@motifx/core';\r
import { TextArea } from '@motifx-community/ui';\r
\r
/** A message box: Enter starts a new line, Ctrl+Enter sends. */\r
export default function CtrlEnter() {\r
  const s = reactive({ message: '', sent: [] as { id: number; text: string }[] });\r
  let sentCount = 0;\r
\r
  const send = (text: string) => {\r
    if (!text.trim()) return;\r
    s.sent.push({ id: ++sentCount, text });\r
    s.message = '';\r
  };\r
\r
  return (\r
    <>\r
      <ul class="ta-sent">\r
        {s.sent.map((m) => (\r
          <li key={m.id}>{m.text}</li>\r
        ))}\r
      </ul>\r
      <TextArea label="Message" helpText="Ctrl+Enter sends." autoGrow rows={1} maxRows={4} x-model={() => s.message} onEnter={(e) => send(e.value)} stretch />\r
    </>\r
  );\r
}\r
`,_=`import { reactive } from '@motifx/core';\r
import { Button, Stack, TextArea, type FieldLabelMode } from '@motifx-community/ui';\r
\r
const MODES: FieldLabelMode[] = ['top', 'side', 'floating', 'hidden'];\r
\r
/** The label above the box, next to it, floating inside it, or only for screen readers. */\r
export default function LabelModes() {\r
  const s = reactive({ labelMode: 'top' as FieldLabelMode });\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Label mode">\r
        {MODES.map((mode) => (\r
          <Button\r
            key={mode}\r
            text={mode}\r
            size="sm"\r
            variant={() => (s.labelMode === mode ? 'solid' : 'ghost')}\r
            aria-pressed={() => s.labelMode === mode}\r
            onclick={() => (s.labelMode = mode)}\r
          />\r
        ))}\r
      </Stack>\r
      <TextArea label="Address" labelMode={() => s.labelMode} rows={2} />\r
    </>\r
  );\r
}\r
`,v=`import { reactive } from '@motifx/core';\r
import { Button, uiLocale } from '@motifx-community/ui';\r
import { kitTexts } from '../../../shared/kit-texts';\r
\r
/** Switches the texts of every field on the page, the clear button's name included. */\r
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
        The clear button reads <output>{() => kitTexts.strings.clear}</output>\r
      </span>\r
    </>\r
  );\r
}\r
`,y=`import { reactive } from '@motifx/core';\r
import { Button, Stack, TextArea } from '@motifx-community/ui';\r
\r
/** A textarea bound with x-model, and notes created with \`new\` and added programmatically. */\r
export default function Programmatic() {\r
  const s = reactive({ comment: 'MotifJS keeps the DOM it builds.', log: '' });\r
  let added = 0;\r
  let host: Stack | null = null;\r
\r
  const addProgrammatic = () => {\r
    const note = new TextArea({ label: \`Note \${++added}\`, rows: 2, autoGrow: true, maxRows: 5, clearButton: true });\r
    note.onValueChanged((e) => (s.log = \`\${note.label}: \${e.value.split('\\n').length} line(s)\`));\r
    host?.controls.add(note);\r
    note.focus();\r
  };\r
\r
  return (\r
    <>\r
      <TextArea label="&Comment" x-model={() => s.comment} helpText={() => \`\${s.comment.length} characters\`} stretch />\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Button text="Add a note programmatically" variant="outline" onclick={addProgrammatic} />\r
        <output class="ta-log">{() => s.log}</output>\r
      </Stack>\r
      <Stack orientation="horizontal" wrap align="center" ref={(c: Stack) => (host = c)} />\r
    </>\r
  );\r
}\r
`,b=`import { reactive } from '@motifx/core';\r
import { Button, Stack, TextArea, type TextAreaResize } from '@motifx-community/ui';\r
\r
const RESIZES: TextAreaResize[] = ['none', 'vertical', 'both'];\r
\r
/** Which way the user can drag the box bigger. */\r
export default function Resize() {\r
  const s = reactive({ resize: 'vertical' as TextAreaResize });\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Resize">\r
        {RESIZES.map((resize) => (\r
          <Button\r
            key={resize}\r
            text={resize}\r
            size="sm"\r
            variant={() => (s.resize === resize ? 'solid' : 'ghost')}\r
            aria-pressed={() => s.resize === resize}\r
            onclick={() => (s.resize = resize)}\r
          />\r
        ))}\r
      </Stack>\r
      <TextArea label="Notes" resize={() => s.resize} rows={4} />\r
    </>\r
  );\r
}\r
`,x=`import { reactive } from '@motifx/core';\r
import { Button, TextArea } from '@motifx-community/ui';\r
\r
const TERMS = 'Line one of the terms.\\nLine two of the terms.';\r
\r
/** Read-only and disabled, both following state, and a required field. */\r
export default function States() {\r
  const s = reactive({ editing: true });\r
  return (\r
    <>\r
      <Button text="Toggle" variant="outline" onclick={() => (s.editing = !s.editing)} />\r
      <TextArea label="Terms" readOnly={() => !s.editing} value={TERMS} rows={2} />\r
      <TextArea label="Reason" required enabled={() => s.editing} rows={2} />\r
    </>\r
  );\r
}\r
`;function S(){let e=r({story:``});return n(a,{label:`Story`,autoGrow:!0,minRows:2,maxRows:6,placeholder:`Type a few lines…`,stretch:!0,runover:{initializeComponent:t=>{t.bindings.model(()=>e.story,t=>{let n=e;n!=null&&typeof n.story!=`function`&&(n.story=t)})}},childs:[]})}function C(){let e=r({bio:``});return n(a,{label:`Bio`,maxLength:160,minLength:10,showCounter:!0,clearButton:!0,stretch:!0,runover:{initializeComponent:t=>{t.bindings.model(()=>e.bio,t=>{let n=e;n!=null&&typeof n.bio!=`function`&&(n.bio=t)})}},childs:[]})}function w(){let e=r({message:``,sent:[]}),i=0,o=t=>{t.trim()&&(e.sent.push({id:++i,text:t}),e.message=``)};return t({initializeComponent:t=>{{let r=n(`ul`,{initializeComponent:t=>{t.class.add(`ta-sent`);let r=n({initializeComponent:t=>{t.bindings.list(()=>e&&e.sent!==null&&e.sent!==void 0?e.sent:[],e=>n(`li`,{indexkey:()=>e.id,initializeComponent:t=>{let r=n(`text`,{initializeComponent:t=>{t.bindings.add(`textContent`,e,`text`)},__childExpr:()=>e.text});t.controls.add(r)}}))}});t.controls.add(r)}},1);t.controls.add(r);let i=n(a,{label:`Message`,helpText:`Ctrl+Enter sends.`,autoGrow:!0,rows:1,maxRows:4,onEnter:e=>o(e.value),stretch:!0,runover:{initializeComponent:t=>{t.bindings.model(()=>e.message,t=>{let n=e;n!=null&&typeof n.message!=`function`&&(n.message=t)})}},childs:[]});t.controls.add(i)}}})}function T(){let e=r({comment:`MotifJS keeps the DOM it builds.`,log:``}),s=0,c=null,l=()=>{let t=new a({label:`Note ${++s}`,rows:2,autoGrow:!0,maxRows:5,clearButton:!0});t.onValueChanged(n=>e.log=`${t.label}: ${n.value.split(`
`).length} line(s)`),c?.controls.add(t),t.focus()};return t({initializeComponent:t=>{{let r=n(a,{label:`&Comment`,helpText:()=>`${e.comment.length} characters`,stretch:!0,runover:{initializeComponent:t=>{t.bindings.model(()=>e.comment,t=>{let n=e;n!=null&&typeof n.comment!=`function`&&(n.comment=t)})}},childs:[]});t.controls.add(r);let s=n(o,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[n(i,{text:`Add a note programmatically`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,l)}},childs:[]}),n(`output`,{initializeComponent:t=>{t.class.add(`ta-log`),t.bindings.method(()=>e.log)}},1)]});t.controls.add(s);let u=n(o,{orientation:`horizontal`,wrap:!0,align:`center`,ref:e=>c=e,runover:{},childs:[]});t.controls.add(u)}}})}var E=[`top`,`side`,`floating`,`hidden`];function D(){let e=r({labelMode:`top`});return t({initializeComponent:t=>{{let r=n(o,{orientation:`horizontal`,wrap:!0,align:`center`,role:`group`,"aria-label":`Label mode`,runover:{},childs:[n({initializeComponent:t=>{t.bindings.list(()=>E??[],t=>n(i,{indexkey:()=>t,text:t,size:`sm`,variant:()=>e.labelMode===t?`solid`:`ghost`,"aria-pressed":()=>e.labelMode===t,runover:{initializeComponent:n=>{n.motif.on(`click`,()=>e.labelMode=t)}},childs:[]}))}})]});t.controls.add(r);let s=n(a,{label:`Address`,labelMode:()=>e.labelMode,rows:2,runover:{},childs:[]});t.controls.add(s)}}})}function O(){let a=r({lang:`en`}),o=()=>{a.lang=a.lang===`en`?`tr`:`en`,e.use(a.lang)};return t({initializeComponent:e=>{{let t=n(i,{text:()=>a.lang===`en`?`Language: English`:`Dil: Türkçe`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,o)}},childs:[]});e.controls.add(t);let r=n(`span`,{initializeComponent:e=>{let t=n(`text`,{initializeComponent:e=>{e.setText(`The clear button reads `)}},1);e.controls.add(t);let r=n(`output`,{initializeComponent:e=>{e.bindings.method(()=>p.strings.clear)}},1);e.controls.add(r)}},1);e.controls.add(r)}}})}var k=[`none`,`vertical`,`both`];function A(){let e=r({resize:`vertical`});return t({initializeComponent:t=>{{let r=n(o,{orientation:`horizontal`,wrap:!0,align:`center`,role:`group`,"aria-label":`Resize`,runover:{},childs:[n({initializeComponent:t=>{t.bindings.list(()=>k??[],t=>n(i,{indexkey:()=>t,text:t,size:`sm`,variant:()=>e.resize===t?`solid`:`ghost`,"aria-pressed":()=>e.resize===t,runover:{initializeComponent:n=>{n.motif.on(`click`,()=>e.resize=t)}},childs:[]}))}})]});t.controls.add(r);let s=n(a,{label:`Notes`,resize:()=>e.resize,rows:4,runover:{},childs:[]});t.controls.add(s)}}})}var j=`Line one of the terms.
Line two of the terms.`;function M(){let e=r({editing:!0});return t({initializeComponent:t=>{{let r=n(i,{text:`Toggle`,variant:`outline`,runover:{initializeComponent:t=>{t.motif.on(`click`,()=>e.editing=!e.editing)}},childs:[]});t.controls.add(r);let o=n(a,{label:`Terms`,readOnly:()=>!e.editing,value:j,rows:2,runover:{},childs:[]});t.controls.add(o);let s=n(a,{label:`Reason`,required:!0,enabled:()=>e.editing,rows:2,runover:{},childs:[]});t.controls.add(s)}}})}var N=f(Object.assign({"./examples/AutoGrow.tsx":m,"./examples/CounterAndLimits.tsx":h,"./examples/CtrlEnter.tsx":g,"./examples/LabelModes.tsx":_,"./examples/Localization.tsx":v,"./examples/Programmatic.tsx":y,"./examples/Resize.tsx":b,"./examples/States.tsx":x})),P=[[`value`,"`Bind<string>`","`''`","The text, with lines separated by `\\n`. `x-model` provides two-way binding."],[`label`,"`Bind<string>`","`''`","The field label. Writing `&Name` assigns Alt+N as the access key. This is the same property as `text`."],[`labelMode`,"`Bind<FieldLabelMode>`","`'top'`","`top`, `side`, `floating`, `hidden`."],[`placeholder`,"`Bind<string>`","`''`",`Displayed when the field is empty.`],[`rows`,"`Bind<number>`","`3`",`The number of visible lines.`],[`autoGrow`,"`Bind<boolean>`","`false`","The box adjusts to its content, from `minRows` to `maxRows` lines, and then scrolls."],[`minRows`,"`Bind<number>`","`rows`","The minimum height with `autoGrow`."],[`maxRows`,"`Bind<number | null>`","`null`","The maximum height with `autoGrow`. Without it, the box grows without limit."],[`resize`,"`Bind<TextAreaResize>`","`'vertical'`","`none`, `vertical` or `both`: the directions the user can resize the box. This is `none` while `autoGrow` is on."],[`maxLength / minLength`,"`Bind<number>`",`—`,`Length limits. Both are enforced by validation.`],[`showCounter`,"`Bind<boolean>`","`false`","Shows `12/500` below the box (`12` without `maxLength`)."],[`clearButton`,"`Bind<boolean>`","`false`",`Shows a button that clears the field. Pressing Escape also clears it.`],[`updateOn`,"`Bind<'input' | 'change'>`","`'input'`","With `change`, the value updates when the field loses focus or the user presses Ctrl+Enter."],[`selectOnFocus`,"`Bind<boolean>`","`false`",`Selects all text when the field receives focus.`],[`wrap`,"`Bind<'soft' | 'hard' | 'off'>`","`'soft'`","`off` keeps long lines on one line and scrolls horizontally."],[`helpText, hint, prefix, suffix, icon, buttons`,`see TextBox`,``,`Parts common to all fields.`],[`readOnly, required, size, variant, stretch`,`see TextBox`,``,`States and appearance common to all fields.`],[`rules, error, validateOn, validationGroup`,`see TextBox`,``,`Validation works the same way as for all fields.`],[`spellcheck, name, autocomplete`,"`Bind<…>`",`—`,"Passed to the `<textarea>`."],[`enabled / disabled, visible, tabStop, tabIndex`,`see Control`,``,`Properties shared by all controls.`]],F=[[`every prop above`,`read/write, reactive`,`Accepts a value or a function, the same as the prop.`],[`isValid, validationMessage, validating`,`read-only, reactive`,`The validation result.`],[`textAreaPart`,`read-only`,"The native `<textarea>`."]],I=[[`validate()`,"`Promise<boolean>`",`Validates the value and displays the result.`],[`resetValidation()`,"`void`",`Clears the results of previous validation.`],[`focus()`,"`boolean`",`Sets focus on the textarea.`],[`select()`,"`void`",`Selects all text.`],[`clear()`,"`void`",`Clears the field, as the clear button does.`]],L=[[`onValueChanged(e)`,"Occurs when the value changes. `e`: `{ value, previousValue, byUser, source, event? }`."],[`onValidated(e)`,"Occurs when validation finishes. `e`: `{ valid, message, source }`."],[`onEnter(e)`,"Occurs when the user presses Ctrl+Enter (Cmd+Enter). `e`: `{ value, source, event }`."],[`oninput, onchange, onkeydown, onfocusin, onfocusout`,`DOM events from the textarea bubble up to the field.`]],R=[[`Enter`,`Inserts a new line.`],[`Ctrl + Enter, Cmd + Enter`,'Commits the value (with `updateOn="change"`) and raises `onEnter`.'],[`Escape`,"With `clearButton`, clears a field that has a value. Otherwise, the key passes to the containing window."],["Alt + key (`&Name`)",`Moves focus to the field (Control + Option + key on Apple platforms).`],[`Tab`,`Moves focus out of the field. The clear button is not a Tab stop, because Escape does the same thing.`]],z=[[`Element`,"A native `<textarea>` associated with its `<label>` through `for`."],[`Description`,"`aria-describedby` references the prefix, the suffix and the help text."],[`Errors`,'`aria-invalid="true"`. The message is a polite live region.'],[`Required check boxes`,'`aria-required="true"`. The indicator after the label is hidden from screen readers.'],[`Ctrl + Enter`,`If Ctrl+Enter sends something, mention it in the label or help text, as the example above does.`]],B=[[`.mx-field.mx-text-area`,"The field. `data-resize`, `data-auto-grow` and the field attributes (`data-size`, `data-variant`, `data-label-mode`, `data-invalid`, `data-readonly`, `data-disabled`, `data-filled`)."],[`.mx-field__box`,`The box, which carries the resize grip.`],[`.mx-field__input.mx-text-area__input`,`The textarea.`],[`.mx-text-area__clear`,`The clear button.`],[`.mx-field__message, .mx-field__counter`,`Help text below the box.`]];function V(){return t({initializeComponent:e=>{{let t=n(`p`,{initializeComponent:e=>{e.class.add(`lead`);let t=n(u,{text:`A multi-line text input. The box can grow with its content or be resized by the user, and it supports a character counter, a clear button and Ctrl+Enter to submit, along with the label, help text and validation common to all fields.`,runover:{},childs:[]});e.controls.add(t)}},1);e.controls.add(t);let r=n(c,{anchor:`import`,title:`Import`,runover:{},childs:[n(s,{code:`
import { TextArea, type TextAreaProps } from '@motifx-community/ui';
`,runover:{},childs:[]})]});e.controls.add(r);let i=n(c,{anchor:`ways`,title:`Declarative and programmatic`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(u,{text:"Every prop accepts a value or a function, and `x-model` provides two-way binding for the text. When you create the component with `new`, set the same properties programmatically.",runover:{},childs:[]});e.controls.add(t)}},1),n(l,{files:N(`Programmatic.tsx`),stack:!0,runover:{},childs:[n(T,{runover:{},childs:[]})]})]});e.controls.add(i);let a=n(c,{anchor:`grow`,title:`Auto-grow`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(u,{text:"With `autoGrow`, the box adjusts to its content. It stays between `minRows` and `maxRows` lines and scrolls beyond that. When the box gets narrower, text wraps onto more lines and the box grows accordingly.",runover:{},childs:[]});e.controls.add(t)}},1),n(l,{files:N(`AutoGrow.tsx`),runover:{},childs:[n(S,{runover:{},childs:[]})]})]});e.controls.add(a);let o=n(c,{anchor:`resize`,title:`Resizing`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(u,{text:"The grip in the corner of the box lets the user resize it vertically (`vertical`, the default) or in both directions (`both`). Set `none` to disable resizing.",runover:{},childs:[]});e.controls.add(t)}},1),n(l,{files:N(`Resize.tsx`),stack:!0,runover:{},childs:[n(A,{runover:{},childs:[]})]})]});e.controls.add(o);let f=n(c,{anchor:`counter`,title:`Character counter and limits`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(u,{text:"`maxLength` stops input at the limit, and `minLength` is checked when the field loses focus. `showCounter` displays the count below the box.",runover:{},childs:[]});e.controls.add(t)}},1),n(l,{files:N(`CounterAndLimits.tsx`),runover:{},childs:[n(C,{runover:{},childs:[]})]})]});e.controls.add(f);let p=n(c,{anchor:`enter`,title:`Ctrl+Enter`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(u,{text:"Enter starts a new line. Ctrl+Enter (Cmd+Enter on a Mac) raises `onEnter` with the value, which is the usual way to send a message or save a note.",runover:{},childs:[]});e.controls.add(t)}},1),n(l,{files:N(`CtrlEnter.tsx`),stack:!0,runover:{},childs:[n(w,{runover:{},childs:[]})]})]});e.controls.add(p);let m=n(c,{anchor:`label`,title:`Label`,runover:{},childs:[n(l,{files:N(`LabelModes.tsx`),stack:!0,runover:{},childs:[n(D,{runover:{},childs:[]})]})]});e.controls.add(m);let h=n(c,{anchor:`states`,title:`Read-only, disabled and required`,runover:{},childs:[n(l,{files:N(`States.tsx`),runover:{},childs:[n(M,{runover:{},childs:[]})]})]});e.controls.add(h);let g=n(c,{anchor:`keyboard`,title:`Keyboard`,runover:{},childs:[n(d,{head:[`Key`,`Description`],rows:R,runover:{},childs:[]})]});e.controls.add(g);let _=n(c,{anchor:`a11y`,title:`Accessibility`,runover:{},childs:[n(d,{head:[`Topic`,`Details`],rows:z,runover:{},childs:[]})]});e.controls.add(_);let v=n(c,{anchor:`i18n`,title:`Localization`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(u,{text:"The name of the clear button and the validation messages come from `uiLocale.strings`.",runover:{},childs:[]});e.controls.add(t)}},1),n(l,{files:N(`Localization.tsx`),runover:{},childs:[n(O,{runover:{},childs:[]})]})]});e.controls.add(v);let y=n(c,{anchor:`styling`,title:`Styling`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(u,{text:"TextArea uses the field tokens (`field.*`, see TextBox) and has none of its own, so its first line aligns with a single-line field of the same size.",runover:{},childs:[]});e.controls.add(t)}},1),n(d,{head:[`Hook`,`Description`],rows:B,runover:{},childs:[]})]});e.controls.add(y);let b=n(c,{anchor:`api`,title:`API reference`,runover:{},childs:[n(`h3`,{initializeComponent:e=>{let t=n(u,{text:`Props`,runover:{},childs:[]});e.controls.add(t)}},1),n(d,{head:[`Prop`,`Type`,`Default`,`Description`],rows:P,runover:{},childs:[]}),n(`h3`,{initializeComponent:e=>{let t=n(u,{text:`Properties`,runover:{},childs:[]});e.controls.add(t)}},1),n(d,{head:[`Property`,`Access`,`Description`],rows:F,runover:{},childs:[]}),n(`h3`,{initializeComponent:e=>{let t=n(u,{text:`Methods`,runover:{},childs:[]});e.controls.add(t)}},1),n(d,{head:[`Method`,`Returns`,`Description`],rows:I,runover:{},childs:[]}),n(`h3`,{initializeComponent:e=>{let t=n(u,{text:`Events`,runover:{},childs:[]});e.controls.add(t)}},1),n(d,{head:[`Event`,`When`],rows:L,runover:{},childs:[]})]});e.controls.add(b)}}})}export{V as default};