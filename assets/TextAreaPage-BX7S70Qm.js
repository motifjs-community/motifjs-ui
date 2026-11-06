import{Mt as e,a as t,an as n,h as r,i,n as a,nn as o,r as s,rn as c,t as l}from"./doc-B1CtlCkV.js";import{t as u}from"./TextArea-yeGn-W9x.js";import{t as d}from"./Stack-AS0iyAxC.js";import{t as f}from"./sources-BXVvOiIY.js";import{t as p}from"./kit-texts-BRS-kYEc.js";var m=`import { reactive } from '@motifx/core';\r
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
`;function S(){let e=n({story:``});return o(u,{label:`Story`,autoGrow:!0,minRows:2,maxRows:6,placeholder:`Type a few lines…`,stretch:!0,runover:{initializeComponent:t=>{t.bindings.model(()=>e.story,t=>{let n=e;n!=null&&typeof n.story!=`function`&&(n.story=t)})}},childs:[]})}function C(){let e=n({bio:``});return o(u,{label:`Bio`,maxLength:160,minLength:10,showCounter:!0,clearButton:!0,stretch:!0,runover:{initializeComponent:t=>{t.bindings.model(()=>e.bio,t=>{let n=e;n!=null&&typeof n.bio!=`function`&&(n.bio=t)})}},childs:[]})}function w(){let e=n({message:``,sent:[]}),t=0,r=n=>{n.trim()&&(e.sent.push({id:++t,text:n}),e.message=``)};return c({initializeComponent:t=>{{let n=o(`ul`,{initializeComponent:t=>{t.class.add(`ta-sent`);let n=o({initializeComponent:t=>{t.bindings.list(()=>e&&e.sent!==null&&e.sent!==void 0?e.sent:[],e=>o(`li`,{indexkey:()=>e.id,initializeComponent:t=>{let n=o(`text`,{initializeComponent:t=>{t.bindings.add(`textContent`,e,`text`)},__childExpr:()=>e.text});t.controls.add(n)}}))}});t.controls.add(n)}},1);t.controls.add(n);let i=o(u,{label:`Message`,helpText:`Ctrl+Enter sends.`,autoGrow:!0,rows:1,maxRows:4,onEnter:e=>r(e.value),stretch:!0,runover:{initializeComponent:t=>{t.bindings.model(()=>e.message,t=>{let n=e;n!=null&&typeof n.message!=`function`&&(n.message=t)})}},childs:[]});t.controls.add(i)}}})}function T(){let e=n({comment:`MotifJS keeps the DOM it builds.`,log:``}),t=0,i=null,a=()=>{let n=new u({label:`Note ${++t}`,rows:2,autoGrow:!0,maxRows:5,clearButton:!0});n.onValueChanged(t=>e.log=`${n.label}: ${t.value.split(`
`).length} line(s)`),i?.controls.add(n),n.focus()};return c({initializeComponent:t=>{{let n=o(u,{label:`&Comment`,helpText:()=>`${e.comment.length} characters`,stretch:!0,runover:{initializeComponent:t=>{t.bindings.model(()=>e.comment,t=>{let n=e;n!=null&&typeof n.comment!=`function`&&(n.comment=t)})}},childs:[]});t.controls.add(n);let s=o(d,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[o(r,{text:`Add a note programmatically`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,a)}},childs:[]}),o(`output`,{initializeComponent:t=>{t.class.add(`ta-log`),t.bindings.method(()=>e.log)}},1)]});t.controls.add(s);let c=o(d,{orientation:`horizontal`,wrap:!0,align:`center`,ref:e=>i=e,runover:{},childs:[]});t.controls.add(c)}}})}var E=[`top`,`side`,`floating`,`hidden`];function D(){let e=n({labelMode:`top`});return c({initializeComponent:t=>{{let n=o(d,{orientation:`horizontal`,wrap:!0,align:`center`,role:`group`,"aria-label":`Label mode`,runover:{},childs:[o({initializeComponent:t=>{t.bindings.list(()=>E??[],t=>o(r,{indexkey:()=>t,text:t,size:`sm`,variant:()=>e.labelMode===t?`solid`:`ghost`,"aria-pressed":()=>e.labelMode===t,runover:{initializeComponent:n=>{n.motif.on(`click`,()=>e.labelMode=t)}},childs:[]}))}})]});t.controls.add(n);let i=o(u,{label:`Address`,labelMode:()=>e.labelMode,rows:2,runover:{},childs:[]});t.controls.add(i)}}})}function O(){let t=n({lang:`en`}),i=()=>{t.lang=t.lang===`en`?`tr`:`en`,e.use(t.lang)};return c({initializeComponent:e=>{{let n=o(r,{text:()=>t.lang===`en`?`Language: English`:`Dil: Türkçe`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,i)}},childs:[]});e.controls.add(n);let a=o(`span`,{initializeComponent:e=>{let t=o(`text`,{initializeComponent:e=>{e.setText(`The clear button reads `)}},1);e.controls.add(t);let n=o(`output`,{initializeComponent:e=>{e.bindings.method(()=>p.strings.clear)}},1);e.controls.add(n)}},1);e.controls.add(a)}}})}var k=[`none`,`vertical`,`both`];function A(){let e=n({resize:`vertical`});return c({initializeComponent:t=>{{let n=o(d,{orientation:`horizontal`,wrap:!0,align:`center`,role:`group`,"aria-label":`Resize`,runover:{},childs:[o({initializeComponent:t=>{t.bindings.list(()=>k??[],t=>o(r,{indexkey:()=>t,text:t,size:`sm`,variant:()=>e.resize===t?`solid`:`ghost`,"aria-pressed":()=>e.resize===t,runover:{initializeComponent:n=>{n.motif.on(`click`,()=>e.resize=t)}},childs:[]}))}})]});t.controls.add(n);let i=o(u,{label:`Notes`,resize:()=>e.resize,rows:4,runover:{},childs:[]});t.controls.add(i)}}})}var j=`Line one of the terms.
Line two of the terms.`;function M(){let e=n({editing:!0});return c({initializeComponent:t=>{{let n=o(r,{text:`Toggle`,variant:`outline`,runover:{initializeComponent:t=>{t.motif.on(`click`,()=>e.editing=!e.editing)}},childs:[]});t.controls.add(n);let i=o(u,{label:`Terms`,readOnly:()=>!e.editing,value:j,rows:2,runover:{},childs:[]});t.controls.add(i);let a=o(u,{label:`Reason`,required:!0,enabled:()=>e.editing,rows:2,runover:{},childs:[]});t.controls.add(a)}}})}var N=f(Object.assign({"./examples/AutoGrow.tsx":m,"./examples/CounterAndLimits.tsx":h,"./examples/CtrlEnter.tsx":g,"./examples/LabelModes.tsx":_,"./examples/Localization.tsx":v,"./examples/Programmatic.tsx":y,"./examples/Resize.tsx":b,"./examples/States.tsx":x})),P=[[`value`,"`Bind<string>`","`''`","The text, with lines separated by `\\n`. `x-model` provides two-way binding."],[`label`,"`Bind<string>`","`''`","The field label. Writing `&Name` assigns Alt+N as the access key. This is the same property as `text`."],[`labelMode`,"`Bind<FieldLabelMode>`","`'top'`","`top`, `side`, `floating`, `hidden`."],[`placeholder`,"`Bind<string>`","`''`",`Displayed when the field is empty.`],[`rows`,"`Bind<number>`","`3`",`The number of visible lines.`],[`autoGrow`,"`Bind<boolean>`","`false`","The box adjusts to its content, from `minRows` to `maxRows` lines, and then scrolls."],[`minRows`,"`Bind<number>`","`rows`","The minimum height with `autoGrow`."],[`maxRows`,"`Bind<number | null>`","`null`","The maximum height with `autoGrow`. Without it, the box grows without limit."],[`resize`,"`Bind<TextAreaResize>`","`'vertical'`","`none`, `vertical` or `both`: the directions the user can resize the box. This is `none` while `autoGrow` is on."],[`maxLength / minLength`,"`Bind<number>`",`—`,`Length limits. Both are enforced by validation.`],[`showCounter`,"`Bind<boolean>`","`false`","Shows `12/500` below the box (`12` without `maxLength`)."],[`clearButton`,"`Bind<boolean>`","`false`",`Shows a button that clears the field. Pressing Escape also clears it.`],[`updateOn`,"`Bind<'input' | 'change'>`","`'input'`","With `change`, the value updates when the field loses focus or the user presses Ctrl+Enter."],[`selectOnFocus`,"`Bind<boolean>`","`false`",`Selects all text when the field receives focus.`],[`wrap`,"`Bind<'soft' | 'hard' | 'off'>`","`'soft'`","`off` keeps long lines on one line and scrolls horizontally."],[`helpText, hint, prefix, suffix, icon, buttons`,`see TextBox`,``,`Parts common to all fields.`],[`readOnly, required, size, variant, stretch`,`see TextBox`,``,`States and appearance common to all fields.`],[`rules, error, validateOn, validationGroup`,`see TextBox`,``,`Validation works the same way as for all fields.`],[`spellcheck, name, autocomplete`,"`Bind<…>`",`—`,"Passed to the `<textarea>`."],[`enabled / disabled, visible, tabStop, tabIndex`,`see Control`,``,`Properties shared by all controls.`]],F=[[`every prop above`,`read/write, reactive`,`Accepts a value or a function, the same as the prop.`],[`isValid, validationMessage, validating`,`read-only, reactive`,`The validation result.`],[`textAreaElement`,`read-only`,"The native `<textarea>`."]],I=[[`validate()`,"`Promise<boolean>`",`Validates the value and displays the result.`],[`resetValidation()`,"`void`",`Clears the results of previous validation.`],[`focus()`,"`boolean`",`Sets focus on the textarea.`],[`select()`,"`void`",`Selects all text.`],[`clear()`,"`void`",`Clears the field, as the clear button does.`]],L=[[`onValueChanged(e)`,"Occurs when the value changes. `e`: `{ value, previousValue, byUser, source, event? }`."],[`onValidated(e)`,"Occurs when validation finishes. `e`: `{ valid, message, source }`."],[`onEnter(e)`,"Occurs when the user presses Ctrl+Enter (Cmd+Enter). `e`: `{ value, source, event }`."],[`oninput, onchange, onkeydown, onfocusin, onfocusout`,`DOM events from the textarea bubble up to the field.`]],R=[[`Enter`,`Inserts a new line.`],[`Ctrl + Enter, Cmd + Enter`,'Commits the value (with `updateOn="change"`) and raises `onEnter`.'],[`Escape`,"With `clearButton`, clears a field that has a value. Otherwise, the key passes to the containing window."],["Alt + key (`&Name`)",`Moves focus to the field (Control + Option + key on Apple platforms).`],[`Tab`,`Moves focus out of the field. The clear button is not a Tab stop, because Escape does the same thing.`]],z=[[`Element`,"A native `<textarea>` associated with its `<label>` through `for`."],[`Description`,"`aria-describedby` references the prefix, the suffix and the help text."],[`Errors`,'`aria-invalid="true"`. The message is a polite live region.'],[`Required check boxes`,'`aria-required="true"`. The indicator after the label is hidden from screen readers.'],[`Ctrl + Enter`,`If Ctrl+Enter sends something, mention it in the label or help text, as the example above does.`]],B=[[`.mx-field.mx-text-area`,"The field. `data-resize`, `data-auto-grow` and the field attributes (`data-size`, `data-variant`, `data-label-mode`, `data-invalid`, `data-readonly`, `data-disabled`, `data-filled`)."],[`.mx-field__box`,`The box, which carries the resize grip.`],[`.mx-field__input.mx-text-area__input`,`The textarea.`],[`.mx-text-area__clear`,`The clear button.`],[`.mx-field__message, .mx-field__counter`,`Help text below the box.`]];function V(){return c({initializeComponent:e=>{{let n=o(`p`,{initializeComponent:e=>{e.class.add(`lead`);let t=o(s,{text:`A multi-line text input. The box can grow with its content or be resized by the user, and it supports a character counter, a clear button and Ctrl+Enter to submit, along with the label, help text and validation common to all fields.`,runover:{},childs:[]});e.controls.add(t)}},1);e.controls.add(n);let r=o(i,{anchor:`import`,title:`Import`,runover:{},childs:[o(t,{code:`
import { TextArea, type TextAreaProps } from '@motifx-community/ui';
`,runover:{},childs:[]})]});e.controls.add(r);let c=o(i,{anchor:`ways`,title:`Declarative and programmatic`,runover:{},childs:[o(`p`,{initializeComponent:e=>{let t=o(s,{text:"Every prop accepts a value or a function, and `x-model` provides two-way binding for the text. When you create the component with `new`, set the same properties programmatically.",runover:{},childs:[]});e.controls.add(t)}},1),o(a,{files:N(`Programmatic.tsx`),stack:!0,runover:{},childs:[o(T,{runover:{},childs:[]})]})]});e.controls.add(c);let u=o(i,{anchor:`grow`,title:`Auto-grow`,runover:{},childs:[o(`p`,{initializeComponent:e=>{let t=o(s,{text:"With `autoGrow`, the box adjusts to its content. It stays between `minRows` and `maxRows` lines and scrolls beyond that. When the box gets narrower, text wraps onto more lines and the box grows accordingly.",runover:{},childs:[]});e.controls.add(t)}},1),o(a,{files:N(`AutoGrow.tsx`),runover:{},childs:[o(S,{runover:{},childs:[]})]})]});e.controls.add(u);let d=o(i,{anchor:`resize`,title:`Resizing`,runover:{},childs:[o(`p`,{initializeComponent:e=>{let t=o(s,{text:"The grip in the corner of the box lets the user resize it vertically (`vertical`, the default) or in both directions (`both`). Set `none` to disable resizing.",runover:{},childs:[]});e.controls.add(t)}},1),o(a,{files:N(`Resize.tsx`),stack:!0,runover:{},childs:[o(A,{runover:{},childs:[]})]})]});e.controls.add(d);let f=o(i,{anchor:`counter`,title:`Character counter and limits`,runover:{},childs:[o(`p`,{initializeComponent:e=>{let t=o(s,{text:"`maxLength` stops input at the limit, and `minLength` is checked when the field loses focus. `showCounter` displays the count below the box.",runover:{},childs:[]});e.controls.add(t)}},1),o(a,{files:N(`CounterAndLimits.tsx`),runover:{},childs:[o(C,{runover:{},childs:[]})]})]});e.controls.add(f);let p=o(i,{anchor:`enter`,title:`Ctrl+Enter`,runover:{},childs:[o(`p`,{initializeComponent:e=>{let t=o(s,{text:"Enter starts a new line. Ctrl+Enter (Cmd+Enter on a Mac) raises `onEnter` with the value, which is the usual way to send a message or save a note.",runover:{},childs:[]});e.controls.add(t)}},1),o(a,{files:N(`CtrlEnter.tsx`),stack:!0,runover:{},childs:[o(w,{runover:{},childs:[]})]})]});e.controls.add(p);let m=o(i,{anchor:`label`,title:`Label`,runover:{},childs:[o(a,{files:N(`LabelModes.tsx`),stack:!0,runover:{},childs:[o(D,{runover:{},childs:[]})]})]});e.controls.add(m);let h=o(i,{anchor:`states`,title:`Read-only, disabled and required`,runover:{},childs:[o(a,{files:N(`States.tsx`),runover:{},childs:[o(M,{runover:{},childs:[]})]})]});e.controls.add(h);let g=o(i,{anchor:`keyboard`,title:`Keyboard`,runover:{},childs:[o(l,{head:[`Key`,`Description`],rows:R,runover:{},childs:[]})]});e.controls.add(g);let _=o(i,{anchor:`a11y`,title:`Accessibility`,runover:{},childs:[o(l,{head:[`Topic`,`Details`],rows:z,runover:{},childs:[]})]});e.controls.add(_);let v=o(i,{anchor:`i18n`,title:`Localization`,runover:{},childs:[o(`p`,{initializeComponent:e=>{let t=o(s,{text:"The name of the clear button and the validation messages come from `uiLocale.strings`.",runover:{},childs:[]});e.controls.add(t)}},1),o(a,{files:N(`Localization.tsx`),runover:{},childs:[o(O,{runover:{},childs:[]})]})]});e.controls.add(v);let y=o(i,{anchor:`styling`,title:`Styling`,runover:{},childs:[o(`p`,{initializeComponent:e=>{let t=o(s,{text:"TextArea uses the field tokens (`field.*`, see TextBox) and has none of its own, so its first line aligns with a single-line field of the same size.",runover:{},childs:[]});e.controls.add(t)}},1),o(l,{head:[`Hook`,`Description`],rows:B,runover:{},childs:[]})]});e.controls.add(y);let b=o(i,{anchor:`api`,title:`API reference`,runover:{},childs:[o(`h3`,{initializeComponent:e=>{let t=o(s,{text:`Props`,runover:{},childs:[]});e.controls.add(t)}},1),o(l,{head:[`Prop`,`Type`,`Default`,`Description`],rows:P,runover:{},childs:[]}),o(`h3`,{initializeComponent:e=>{let t=o(s,{text:`Properties`,runover:{},childs:[]});e.controls.add(t)}},1),o(l,{head:[`Property`,`Access`,`Description`],rows:F,runover:{},childs:[]}),o(`h3`,{initializeComponent:e=>{let t=o(s,{text:`Methods`,runover:{},childs:[]});e.controls.add(t)}},1),o(l,{head:[`Method`,`Returns`,`Description`],rows:I,runover:{},childs:[]}),o(`h3`,{initializeComponent:e=>{let t=o(s,{text:`Events`,runover:{},childs:[]});e.controls.add(t)}},1),o(l,{head:[`Event`,`When`],rows:L,runover:{},childs:[]})]});e.controls.add(b)}}})}export{V as default};