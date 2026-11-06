import{Mt as e,a as t,an as n,h as r,i,n as a,nn as o,r as s,rn as c,t as l}from"./doc-B1CtlCkV.js";import{t as u}from"./Stack-AS0iyAxC.js";import{n as d,t as f}from"./Toolbar-DdyzpIo5.js";import{t as p}from"./index-DVbtDn93.js";import{t as m}from"./sources-BXVvOiIY.js";import{t as h}from"./kit-texts-BRS-kYEc.js";var g=`import { Toolbar } from '@motifx-community/ui';\r
import { draft } from './draft';\r
import { editorItems } from './editor-items';\r
\r
/** An editor toolbar from \`items\`: buttons, toggles, an alignment group, a menu, and a button kept out of the “more” menu. */\r
export default function Editor() {\r
  const preview = () =>\r
    \`font-weight: \${draft.bold ? 600 : 400}; font-style: \${draft.italic ? 'italic' : 'normal'}; text-decoration: \${draft.underline ? 'underline' : 'none'}; text-align: \${draft.align}; inline-size: 100%; margin: 0\`;\r
  return (\r
    <>\r
      <Toolbar label="Format" items={editorItems()} style="inline-size: 100%" />\r
      <p style={preview}>The quick brown fox jumps over the lazy dog.</p>\r
      <output class="tb-log">{() => draft.log}</output>\r
    </>\r
  );\r
}\r
`,_=`import { reactive } from '@motifx/core';\r
import { Button, uiLocale } from '@motifx-community/ui';\r
import { kitTexts } from '../../../shared/kit-texts';\r
\r
/** Switches the texts of the kit; the “more” buttons take the new name at once. */\r
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
        The “more” button is named <output class="tb-more-name">{() => kitTexts.strings.moreOptions}</output>\r
      </span>\r
    </>\r
  );\r
}\r
`,v=`import { reactive } from '@motifx/core';\r
import { Button, Stack, Toolbar, type ToolbarOverflow } from '@motifx-community/ui';\r
import { editorItems } from './editor-items';\r
\r
const OVERFLOWS: ToolbarOverflow[] = ['menu', 'wrap', 'scroll'];\r
\r
/** The editor toolbar in less room: a “more” menu, a second row, or a bar that scrolls. */\r
export default function Overflow() {\r
  const s = reactive({ width: 100, overflow: 'menu' as ToolbarOverflow });\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Width">\r
        {[100, 70, 45, 25].map((width) => (\r
          <Button key={width} text={\`\${width}%\`} size="sm" variant={() => (s.width === width ? 'solid' : 'ghost')} aria-pressed={() => s.width === width} onclick={() => (s.width = width)} />\r
        ))}\r
      </Stack>\r
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Overflow">\r
        {OVERFLOWS.map((mode) => (\r
          <Button key={mode} text={mode} size="sm" variant={() => (s.overflow === mode ? 'solid' : 'ghost')} aria-pressed={() => s.overflow === mode} onclick={() => (s.overflow = mode)} />\r
        ))}\r
      </Stack>\r
      <div class="tb-frame" style={() => \`inline-size: \${s.width}%\`}>\r
        <Toolbar label="Format (narrow)" items={editorItems()} overflow={() => s.overflow} />\r
      </div>\r
    </>\r
  );\r
}\r
`,y=`import { reactive, type Component } from '@motifx/core';\r
import { Button, Toolbar } from '@motifx-community/ui';\r
\r
/** A toolbar created with \`new\` and filled with \`controls.add\`. */\r
export default function Programmatic() {\r
  const s = reactive({ log: '' });\r
  let added = 0;\r
\r
  const bar = new Toolbar({ label: 'Actions', size: 'sm' });\r
  bar.controls.add(new Button({ text: 'First', onclick: () => (s.log = 'First pressed') }));\r
\r
  const addProgrammatic = () => {\r
    const n = ++added;\r
    bar.controls.add(new Button({ text: \`Button \${n}\`, onclick: () => (s.log = \`Button \${n} pressed\`) }));\r
  };\r
\r
  return (\r
    <>\r
      <Button text="Add a button programmatically" variant="outline" onclick={addProgrammatic} />\r
      <div style="inline-size: 100%" ref={(c: Component<HTMLDivElement>) => c.controls.add(bar)} />\r
      <output>{() => s.log}</output>\r
    </>\r
  );\r
}\r
`,b=`import { reactive } from '@motifx/core';\r
import { Button, Stack, TextBox, Toolbar, type ControlSize } from '@motifx-community/ui';\r
import { ImageIcon, LinkIcon, RedoIcon, UndoIcon } from './icons';\r
\r
const SIZES: ControlSize[] = ['sm', 'md', 'lg'];\r
\r
/** A size given to the controls inside, a text field in a toolbar, and a toolbar that turns vertical. */\r
export default function SizeAndOrientation() {\r
  const s = reactive({ size: 'md' as ControlSize, vertical: false, log: '' });\r
  const did = (what: string) => (s.log = what);\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Size">\r
        {SIZES.map((size) => (\r
          <Button key={size} text={size} size="sm" variant={() => (s.size === size ? 'solid' : 'ghost')} aria-pressed={() => s.size === size} onclick={() => (s.size = size)} />\r
        ))}\r
        <Button text="Vertical" size="sm" toggle x-model={() => s.vertical} />\r
      </Stack>\r
      <Toolbar label="Find" size={() => s.size}>\r
        <Button text="Previous" onclick={() => did('Previous')} />\r
        <TextBox label="Find" labelMode="hidden" placeholder="Find" />\r
        <Button text="Next" onclick={() => did('Next')} />\r
      </Toolbar>\r
      <Toolbar\r
        label="Tools"\r
        size={() => s.size}\r
        orientation={() => (s.vertical ? 'vertical' : 'horizontal')}\r
        items={[\r
          { icon: () => <UndoIcon />, hint: 'Undo', click: () => did('Undo') },\r
          { icon: () => <RedoIcon />, hint: 'Redo', click: () => did('Redo') },\r
          { type: 'separator' },\r
          { icon: () => <LinkIcon />, hint: 'Link', click: () => did('Link') },\r
          { icon: () => <ImageIcon />, hint: 'Image', enabled: false },\r
        ]}\r
      />\r
      <output>{() => s.log}</output>\r
    </>\r
  );\r
}\r
`,x=`import { Button, Toolbar, ToolbarSeparator } from '@motifx-community/ui';\r
import { draft } from './draft';\r
import { BoldIcon, ItalicIcon } from './icons';\r
\r
/** Toggle buttons as JSX children, bound with x-model, and a separator before a plain button. */\r
export default function ToggleGroups() {\r
  return (\r
    <Toolbar label="Text">\r
      <Button icon={() => <BoldIcon />} aria-label="Bold" toggle x-model={() => draft.bold} />\r
      <Button icon={() => <ItalicIcon />} aria-label="Italic" toggle x-model={() => draft.italic} />\r
      <ToolbarSeparator />\r
      <Button\r
        text="Clear"\r
        onclick={() => {\r
          draft.bold = draft.italic = draft.underline = false;\r
        }}\r
      />\r
    </Toolbar>\r
  );\r
}\r
`,S=`import { reactive } from '@motifx/core';\r
\r
/** The text the toolbars on this page format: one state, so every toolbar shows the same. */\r
export const draft = reactive({\r
  bold: true,\r
  italic: false,\r
  underline: false,\r
  align: 'left' as 'left' | 'center' | 'right',\r
  log: 'Nothing yet.',\r
});\r
`,C=`import type { ToolbarItem } from '@motifx-community/ui';\r
import { draft } from './draft';\r
import { AlignCenterIcon, AlignLeftIcon, AlignRightIcon, BoldIcon, ImageIcon, ItalicIcon, LinkIcon, RedoIcon, UnderlineIcon, UndoIcon } from './icons';\r
\r
const did = (what: string) => (draft.log = what);\r
\r
const align = (value: 'left' | 'center' | 'right', hint: string, Icon: typeof BoldIcon): ToolbarItem => ({\r
  type: 'toggle',\r
  icon: () => <Icon />,\r
  hint,\r
  pressed: () => draft.align === value,\r
  click: () => (draft.align = value),\r
});\r
\r
/** The items of the editor toolbar, bound to the draft. */\r
export function editorItems(): ToolbarItem[] {\r
  return [\r
    { icon: () => <UndoIcon />, hint: 'Undo', click: () => did('Undo') },\r
    { icon: () => <RedoIcon />, hint: 'Redo', click: () => did('Redo') },\r
    { type: 'separator' },\r
    { type: 'toggle', icon: () => <BoldIcon />, hint: 'Bold', pressed: () => draft.bold, click: () => (draft.bold = !draft.bold) },\r
    { type: 'toggle', icon: () => <ItalicIcon />, hint: 'Italic', pressed: () => draft.italic, click: () => (draft.italic = !draft.italic) },\r
    { type: 'toggle', icon: () => <UnderlineIcon />, hint: 'Underline', pressed: () => draft.underline, click: () => (draft.underline = !draft.underline) },\r
    { type: 'separator' },\r
    align('left', 'Align left', AlignLeftIcon),\r
    align('center', 'Center', AlignCenterIcon),\r
    align('right', 'Align right', AlignRightIcon),\r
    { type: 'separator' },\r
    {\r
      type: 'menu',\r
      text: 'Insert',\r
      menu: [\r
        { text: '&Link', icon: () => <LinkIcon />, shortcut: 'Ctrl+K', click: () => did('Insert link') },\r
        { text: '&Image', icon: () => <ImageIcon />, click: () => did('Insert image') },\r
        { text: '&Table', items: [2, 3, 4].map((n) => ({ text: \`\${n} × \${n}\`, click: () => did(\`Insert a \${n} × \${n} table\`) })) },\r
      ],\r
    },\r
    { text: '&Publish', click: () => did('Publish'), overflow: 'never' },\r
  ];\r
}\r
`,w=`/** A small outline icon drawn from one path. */\r
function icon(d: string) {\r
  return () => (\r
    <svg viewBox="0 0 16 16" aria-hidden="true">\r
      <path d={d} fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />\r
    </svg>\r
  );\r
}\r
\r
export const BoldIcon = icon('M4.5 3h4.25a2.5 2.5 0 0 1 0 5H4.5zM4.5 8h5a2.5 2.5 0 0 1 0 5h-5z');\r
export const ItalicIcon = icon('M7 3h5M4 13h5M10 3L6 13');\r
export const UnderlineIcon = icon('M4.5 2.5v5a3.5 3.5 0 0 0 7 0v-5M3.5 14h9');\r
export const AlignLeftIcon = icon('M2.5 4h11M2.5 8h7M2.5 12h9');\r
export const AlignCenterIcon = icon('M2.5 4h11M4.5 8h7M3.5 12h9');\r
export const AlignRightIcon = icon('M2.5 4h11M6.5 8h7M4.5 12h9');\r
export const UndoIcon = icon('M5.5 3.5L2.5 6.5l3 3M2.5 6.5h7a3.5 3.5 0 0 1 0 7h-2');\r
export const RedoIcon = icon('M10.5 3.5l3 3-3 3M13.5 6.5h-7a3.5 3.5 0 0 0 0 7h2');\r
export const LinkIcon = icon('M7 9a2.5 2.5 0 0 0 3.5 0l2-2a2.5 2.5 0 0 0-3.5-3.5l-.75.75M9 7a2.5 2.5 0 0 0-3.5 0l-2 2A2.5 2.5 0 0 0 7 12.5l.75-.75');\r
export const ImageIcon = icon('M2.5 3.5h11v9h-11zM2.5 10.5l3-3 3 3 2-2 3 3M10 6.25v.1');\r
`,T=n({bold:!0,italic:!1,underline:!1,align:`left`,log:`Nothing yet.`});function E(e){return()=>o(`svg`,{__isSvgElement:!0,initializeComponent:t=>{t.attr.add({viewBox:`0 0 16 16`,"aria-hidden":`true`});let n=o(`path`,{__isSvgElement:!0,initializeComponent:t=>{t.attr.add({d:e,fill:`none`,stroke:`currentColor`,"stroke-width":`1.5`,"stroke-linecap":`round`,"stroke-linejoin":`round`})}});t.controls.add(n)}})}var D=E(`M4.5 3h4.25a2.5 2.5 0 0 1 0 5H4.5zM4.5 8h5a2.5 2.5 0 0 1 0 5h-5z`),O=E(`M7 3h5M4 13h5M10 3L6 13`),k=E(`M4.5 2.5v5a3.5 3.5 0 0 0 7 0v-5M3.5 14h9`),A=E(`M2.5 4h11M2.5 8h7M2.5 12h9`),j=E(`M2.5 4h11M4.5 8h7M3.5 12h9`),M=E(`M2.5 4h11M6.5 8h7M4.5 12h9`),N=E(`M5.5 3.5L2.5 6.5l3 3M2.5 6.5h7a3.5 3.5 0 0 1 0 7h-2`),P=E(`M10.5 3.5l3 3-3 3M13.5 6.5h-7a3.5 3.5 0 0 0 0 7h2`),F=E(`M7 9a2.5 2.5 0 0 0 3.5 0l2-2a2.5 2.5 0 0 0-3.5-3.5l-.75.75M9 7a2.5 2.5 0 0 0-3.5 0l-2 2A2.5 2.5 0 0 0 7 12.5l.75-.75`),I=E(`M2.5 3.5h11v9h-11zM2.5 10.5l3-3 3 3 2-2 3 3M10 6.25v.1`),L=e=>T.log=e,R=(e,t,n)=>({type:`toggle`,icon:()=>o(n,{runover:{},childs:[]}),hint:t,pressed:()=>T.align===e,click:()=>T.align=e});function z(){return[{icon:()=>o(N,{runover:{},childs:[]}),hint:`Undo`,click:()=>L(`Undo`)},{icon:()=>o(P,{runover:{},childs:[]}),hint:`Redo`,click:()=>L(`Redo`)},{type:`separator`},{type:`toggle`,icon:()=>o(D,{runover:{},childs:[]}),hint:`Bold`,pressed:()=>T.bold,click:()=>T.bold=!T.bold},{type:`toggle`,icon:()=>o(O,{runover:{},childs:[]}),hint:`Italic`,pressed:()=>T.italic,click:()=>T.italic=!T.italic},{type:`toggle`,icon:()=>o(k,{runover:{},childs:[]}),hint:`Underline`,pressed:()=>T.underline,click:()=>T.underline=!T.underline},{type:`separator`},R(`left`,`Align left`,A),R(`center`,`Center`,j),R(`right`,`Align right`,M),{type:`separator`},{type:`menu`,text:`Insert`,menu:[{text:`&Link`,icon:()=>o(F,{runover:{},childs:[]}),shortcut:`Ctrl+K`,click:()=>L(`Insert link`)},{text:`&Image`,icon:()=>o(I,{runover:{},childs:[]}),click:()=>L(`Insert image`)},{text:`&Table`,items:[2,3,4].map(e=>({text:`${e} × ${e}`,click:()=>L(`Insert a ${e} × ${e} table`)}))}]},{text:`&Publish`,click:()=>L(`Publish`),overflow:`never`}]}function B(){let e=()=>`font-weight: ${T.bold?600:400}; font-style: ${T.italic?`italic`:`normal`}; text-decoration: ${T.underline?`underline`:`none`}; text-align: ${T.align}; inline-size: 100%; margin: 0`;return c({initializeComponent:t=>{{let n=o(f,{label:`Format`,items:z(),style:`inline-size: 100%`,runover:{},childs:[]});t.controls.add(n);let r=o(`p`,{initializeComponent:t=>{t.style(e);let n=o(`text`,{initializeComponent:e=>{e.setText(`The quick brown fox jumps over the lazy dog.`)}},1);t.controls.add(n)}},1);t.controls.add(r);let i=o(`output`,{initializeComponent:e=>{e.class.add(`tb-log`),e.bindings.method(()=>T.log)}},1);t.controls.add(i)}}})}function V(){let e=n({log:``}),t=0,i=new f({label:`Actions`,size:`sm`});i.controls.add(new r({text:`First`,onclick:()=>e.log=`First pressed`}));let a=()=>{let n=++t;i.controls.add(new r({text:`Button ${n}`,onclick:()=>e.log=`Button ${n} pressed`}))};return c({initializeComponent:t=>{{let n=o(r,{text:`Add a button programmatically`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,a)}},childs:[]});t.controls.add(n);let s=o(`div`,{ref:e=>e.controls.add(i),initializeComponent:e=>{e.style(`inline-size: 100%`)}});t.controls.add(s);let c=o(`output`,{initializeComponent:t=>{t.bindings.method(()=>e.log)}},1);t.controls.add(c)}}})}function H(){let t=n({lang:`en`}),i=()=>{t.lang=t.lang===`en`?`tr`:`en`,e.use(t.lang)};return c({initializeComponent:e=>{{let n=o(r,{text:()=>t.lang===`en`?`Language: English`:`Dil: Türkçe`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,i)}},childs:[]});e.controls.add(n);let a=o(`span`,{initializeComponent:e=>{let t=o(`text`,{initializeComponent:e=>{e.setText(`The “more” button is named `)}},1);e.controls.add(t);let n=o(`output`,{initializeComponent:e=>{e.class.add(`tb-more-name`),e.bindings.method(()=>h.strings.moreOptions)}},1);e.controls.add(n)}},1);e.controls.add(a)}}})}var U=[`menu`,`wrap`,`scroll`];function W(){let e=n({width:100,overflow:`menu`});return c({initializeComponent:t=>{{let n=o(u,{orientation:`horizontal`,wrap:!0,align:`center`,role:`group`,"aria-label":`Width`,runover:{},childs:[o({initializeComponent:t=>{t.bindings.list(()=>[100,70,45,25],t=>o(r,{indexkey:()=>t,text:`${t}%`,size:`sm`,variant:()=>e.width===t?`solid`:`ghost`,"aria-pressed":()=>e.width===t,runover:{initializeComponent:n=>{n.motif.on(`click`,()=>e.width=t)}},childs:[]}))}})]});t.controls.add(n);let i=o(u,{orientation:`horizontal`,wrap:!0,align:`center`,role:`group`,"aria-label":`Overflow`,runover:{},childs:[o({initializeComponent:t=>{t.bindings.list(()=>U??[],t=>o(r,{indexkey:()=>t,text:t,size:`sm`,variant:()=>e.overflow===t?`solid`:`ghost`,"aria-pressed":()=>e.overflow===t,runover:{initializeComponent:n=>{n.motif.on(`click`,()=>e.overflow=t)}},childs:[]}))}})]});t.controls.add(i);let a=o(`div`,{initializeComponent:t=>{t.style(()=>`inline-size: ${e.width}%`),t.class.add(`tb-frame`);let n=o(f,{label:`Format (narrow)`,items:z(),overflow:()=>e.overflow,runover:{},childs:[]});t.controls.add(n)}},1);t.controls.add(a)}}})}var G=[`sm`,`md`,`lg`];function K(){let e=n({size:`md`,vertical:!1,log:``}),t=t=>e.log=t;return c({initializeComponent:n=>{{let i=o(u,{orientation:`horizontal`,wrap:!0,align:`center`,role:`group`,"aria-label":`Size`,runover:{},childs:[o({initializeComponent:t=>{t.bindings.list(()=>G??[],t=>o(r,{indexkey:()=>t,text:t,size:`sm`,variant:()=>e.size===t?`solid`:`ghost`,"aria-pressed":()=>e.size===t,runover:{initializeComponent:n=>{n.motif.on(`click`,()=>e.size=t)}},childs:[]}))}}),o(r,{text:`Vertical`,size:`sm`,toggle:!0,runover:{initializeComponent:t=>{t.bindings.model(()=>e.vertical,t=>{let n=e;n!=null&&typeof n.vertical!=`function`&&(n.vertical=t)})}},childs:[]})]});n.controls.add(i);let a=o(f,{label:`Find`,size:()=>e.size,runover:{},childs:[o(r,{text:`Previous`,runover:{initializeComponent:e=>{e.motif.on(`click`,()=>t(`Previous`))}},childs:[]}),o(p,{label:`Find`,labelMode:`hidden`,placeholder:`Find`,runover:{},childs:[]}),o(r,{text:`Next`,runover:{initializeComponent:e=>{e.motif.on(`click`,()=>t(`Next`))}},childs:[]})]});n.controls.add(a);let s=o(f,{label:`Tools`,size:()=>e.size,orientation:()=>e.vertical?`vertical`:`horizontal`,items:[{icon:()=>o(N,{runover:{},childs:[]}),hint:`Undo`,click:()=>t(`Undo`)},{icon:()=>o(P,{runover:{},childs:[]}),hint:`Redo`,click:()=>t(`Redo`)},{type:`separator`},{icon:()=>o(F,{runover:{},childs:[]}),hint:`Link`,click:()=>t(`Link`)},{icon:()=>o(I,{runover:{},childs:[]}),hint:`Image`,enabled:!1}],runover:{},childs:[]});n.controls.add(s);let c=o(`output`,{initializeComponent:t=>{t.bindings.method(()=>e.log)}},1);n.controls.add(c)}}})}function q(){return o(f,{label:`Text`,runover:{},childs:[o(r,{icon:()=>o(D,{runover:{},childs:[]}),"aria-label":`Bold`,toggle:!0,runover:{initializeComponent:e=>{e.bindings.model(()=>T.bold,e=>{let t=T;t!=null&&typeof t.bold!=`function`&&(t.bold=e)})}},childs:[]}),o(r,{icon:()=>o(O,{runover:{},childs:[]}),"aria-label":`Italic`,toggle:!0,runover:{initializeComponent:e=>{e.bindings.model(()=>T.italic,e=>{let t=T;t!=null&&typeof t.italic!=`function`&&(t.italic=e)})}},childs:[]}),o(d,{runover:{},childs:[]}),o(r,{text:`Clear`,runover:{initializeComponent:e=>{e.motif.on(`click`,()=>{T.bold=T.italic=T.underline=!1})}},childs:[]})]})}var J=m(Object.assign({"./examples/Editor.tsx":g,"./examples/Localization.tsx":_,"./examples/Overflow.tsx":v,"./examples/Programmatic.tsx":y,"./examples/SizeAndOrientation.tsx":b,"./examples/ToggleGroups.tsx":x,"./examples/draft.ts":S,"./examples/editor-items.tsx":C,"./examples/icons.tsx":w})),Y=[[`items`,"`Bind<readonly ToolbarItem[]>`","`[]`",`Items defined as data, drawn before the JSX children (see Items).`],[`label`,"`Bind<string>`","`''`","The accessible name of the toolbar (`aria-label`). This is the same property as `text`."],[`orientation`,"`Bind<'horizontal' | 'vertical'>`","`'horizontal'`",`The direction of the toolbar. The arrow keys follow it.`],[`size`,"`Bind<ControlSize>`","`'md'`","Applied to child controls that do not set their own `size`."],[`buttonVariant`,"`Bind<ButtonVariant>`","`'ghost'`","Applied to child buttons that do not set their own `variant`."],[`overflow`,"`Bind<'menu' | 'wrap' | 'scroll'>`","`'menu'`","`menu` moves items that do not fit into an overflow menu, `wrap` adds a second row, and `scroll` makes the bar scroll."],[`enabled / disabled, visible, tabStop, tabIndex`,`see Control`,``,"`enabled={false}` disables every control inside."]],X=[[`type`,"`Bind<'button' | 'toggle' | 'separator' | 'menu'>`","The default is `'button'`."],[`text, icon, hint`,"`Bind<…>`","The caption (`&Bold` assigns an access key), an icon and a tooltip. An icon-only button is named by its `hint`."],[`pressed`,"`Bind<boolean>`","The state of a toggle. As a function, the item tracks application state, and `click` changes the value it reads."],[`enabled, visible`,"`Bind<boolean>`",`Dims the item or removes it.`],[`menu`,"`Bind<readonly MenuItem[]>`","The commands of a `menu` item, including submenus, check and radio items, and shortcuts."],[`overflow`,"`Bind<'auto' | 'always' | 'never'>`","Controls whether the item can move into the overflow menu, and takes precedence over the toolbar. A JSX child sets it with `data-overflow`."],[`click`,"`(e) => void`","Occurs when the item is pressed, in the bar or in the overflow menu. `e`: `{ item, source, event }`."],[`data`,"`unknown`",`A custom value.`]],Z=[[`every prop above`,`read/write, reactive`,`Accepts a value or a function, the same as the prop.`],[`overflowed`,`read-only, reactive`,`The controls currently in the overflow menu.`]],Q=[[`controlOf(item)`,"`Control | null`","The control created for an item in `items`."],[`updateOverflow()`,"`void`",`Recalculates what fits, for example after a control changes width.`],[`refresh()`,"`void`","Your items can be plain or reactive, and the toolbar reads them as they are. After changing them in place, call `refresh()`. The list and each item's fields are read again, and controls for items that remain are kept."],[`focus()`,"`boolean`",`Sets focus on the control that Tab reaches.`]],$=[[`onItemClick(e)`,"Occurs when an item in `items` is pressed, after its own `click`. `e`: `{ item, source, event }`."]],ee=[[`Tab`,`Moves focus into the toolbar, to the control used last. Pressing Tab again leaves it.`],[`Right / Left`,`Moves to the next or previous control, wrapping at the ends (Left and Right are reversed on right-to-left pages). In a vertical toolbar, use Down and Up.`],[`Home / End`,`Moves to the first or last control.`],[`In a text field`,`The arrow keys, Home and End move within the text, and Tab leaves the field.`],[`Down on a menu button`,`Opens the menu (horizontal toolbar).`]],te=[[`Role`,'`role="toolbar"` with `aria-orientation`, named by `label`.'],[`Focus`,'One Tab stop. The control used last has `tabindex="0"`, and the others have `-1` (roving tabindex).'],[`Separators`,'`role="separator"`, oriented across the toolbar.'],[`Toggles`,"Toggle items are buttons with `aria-pressed`."],[`“More” menu`,"A menu button named from `uiLocale` (“More options”). Items keep their names (an icon-only button uses its `hint` or `aria-label`), toggles become check items, and menu buttons become submenus."]],ne=[[`.mx-toolbar`,"The toolbar. `data-orientation`, `data-size`, `data-overflow`, `data-disabled`."],[`.mx-toolbar__separator`,`A separator.`],[`.mx-toolbar__more`,"The overflow button, a `Button` with a menu."],[`[data-overflowed]`,`Set on a control that is currently in the overflow menu.`]],re=[[`toolbar.height`,`The minimum height of the bar, which uses the density-aware bar height.`],[`toolbar.bar, toolbar.separator`,"Units: the bar (`vertical`: a column of controls) and the separators."]];function ie(){return c({initializeComponent:e=>{{let n=o(`p`,{initializeComponent:e=>{e.class.add(`lead`);let t=o(s,{text:`A command bar that holds buttons, toggle buttons, menus and fields, organized in groups with separators. The toolbar is a single Tab stop, and the arrow keys move between its controls. Items that do not fit move into an overflow menu at the end. You can define items as data, as JSX children, or both.`,runover:{},childs:[]});e.controls.add(t)}},1);e.controls.add(n);let r=o(i,{anchor:`import`,title:`Import`,runover:{},childs:[o(t,{code:`
import { Toolbar, ToolbarSeparator, type ToolbarItem } from '@motifx-community/ui';
`,runover:{},childs:[]})]});e.controls.add(r);let c=o(i,{anchor:`ways`,title:`Declarative and programmatic`,runover:{},childs:[o(`p`,{initializeComponent:e=>{let t=o(s,{text:"`items` defines commands as data, where each field is a value or a function. JSX children of any control type follow them. Programmatically, fill a toolbar as you would any control: `toolbar.controls.add(button)`. Every prop is also a property.",runover:{},childs:[]});e.controls.add(t)}},1),o(a,{title:`Editor toolbar`,files:J(`Editor.tsx`,`editor-items.tsx`,`draft.ts`,`icons.tsx`),stack:!0,runover:{},childs:[o(B,{runover:{},childs:[]})]}),o(a,{title:`Building a toolbar programmatically`,files:J(`Programmatic.tsx`),stack:!0,runover:{},childs:[o(V,{runover:{},childs:[]})]})]});e.controls.add(c);let u=o(i,{anchor:`groups`,title:`Toggle groups and separators`,runover:{},childs:[o(`p`,{initializeComponent:e=>{let t=o(s,{text:"A `toggle` item is a toggle button (`aria-pressed`). When bound to the application with a function, it reflects application state. In the example above, Bold, Italic and Underline are independent toggles, and the alignment buttons form a group where one is pressed. `separator` items, or `<ToolbarSeparator />`, draw the lines between groups.",runover:{},childs:[]});e.controls.add(t)}},1),o(a,{files:J(`ToggleGroups.tsx`,`draft.ts`,`icons.tsx`),runover:{},childs:[o(q,{runover:{},childs:[]})]})]});e.controls.add(u);let d=o(i,{anchor:`overflow`,title:`Overflow`,runover:{},childs:[o(`p`,{initializeComponent:e=>{let t=o(s,{text:"When `overflow` is `menu` (the default), items that do not fit move into an overflow menu at the end, starting from the last item. The toolbar monitors its own size. Items keep their names in the menu (an icon-only button uses its `hint` or `aria-label`), a toggle becomes a check item, and a menu button becomes a submenu. An item's `overflow` can be `always` or `never`, and fields stay in the bar. `wrap` adds a second row, and `scroll` lets the bar scroll.",runover:{},childs:[]});e.controls.add(t)}},1),o(a,{files:J(`Overflow.tsx`,`editor-items.tsx`,`draft.ts`,`icons.tsx`),stack:!0,runover:{},childs:[o(W,{runover:{},childs:[]})]})]});e.controls.add(d);let f=o(i,{anchor:`look`,title:`Orientation, size and fields`,runover:{},childs:[o(`p`,{initializeComponent:e=>{let t=o(s,{text:"`size` and `buttonVariant` apply to child controls that do not set their own. A vertical toolbar uses Up and Down for navigation. A text field inside the toolbar keeps the arrow keys for its text.",runover:{},childs:[]});e.controls.add(t)}},1),o(a,{files:J(`SizeAndOrientation.tsx`,`icons.tsx`),stack:!0,runover:{},childs:[o(K,{runover:{},childs:[]})]})]});e.controls.add(f);let p=o(i,{anchor:`keyboard`,title:`Keyboard`,runover:{},childs:[o(l,{head:[`Key`,`Description`],rows:ee,runover:{},childs:[]})]});e.controls.add(p);let m=o(i,{anchor:`a11y`,title:`Accessibility`,runover:{},childs:[o(l,{head:[`Topic`,`Details`],rows:te,runover:{},childs:[]})]});e.controls.add(m);let h=o(i,{anchor:`i18n`,title:`Localization`,runover:{},childs:[o(`p`,{initializeComponent:e=>{let t=o(s,{text:"The only string a toolbar displays on its own is the name of its overflow button, from `uiLocale.strings.moreOptions`.",runover:{},childs:[]});e.controls.add(t)}},1),o(a,{files:J(`Localization.tsx`),runover:{},childs:[o(H,{runover:{},childs:[]})]})]});e.controls.add(h);let g=o(i,{anchor:`styling`,title:`Styling`,runover:{},childs:[o(l,{head:[`Hook`,`Description`],rows:ne,runover:{},childs:[]}),o(`h3`,{initializeComponent:e=>{let t=o(s,{text:`Component tokens`,runover:{},childs:[]});e.controls.add(t)}},1),o(l,{head:[`Token`,`Description`],rows:re,runover:{},childs:[]})]});e.controls.add(g);let _=o(i,{anchor:`api`,title:`API reference`,runover:{},childs:[o(`h3`,{initializeComponent:e=>{let t=o(s,{text:`Props`,runover:{},childs:[]});e.controls.add(t)}},1),o(l,{head:[`Prop`,`Type`,`Default`,`Description`],rows:Y,runover:{},childs:[]}),o(`h3`,{initializeComponent:e=>{let t=o(s,{text:`ToolbarItem`,runover:{},childs:[]});e.controls.add(t)}},1),o(l,{head:[`Field`,`Type`,`Description`],rows:X,runover:{},childs:[]}),o(`h3`,{initializeComponent:e=>{let t=o(s,{text:`Properties`,runover:{},childs:[]});e.controls.add(t)}},1),o(l,{head:[`Property`,`Access`,`Description`],rows:Z,runover:{},childs:[]}),o(`h3`,{initializeComponent:e=>{let t=o(s,{text:`Methods`,runover:{},childs:[]});e.controls.add(t)}},1),o(l,{head:[`Method`,`Returns`,`Description`],rows:Q,runover:{},childs:[]}),o(`h3`,{initializeComponent:e=>{let t=o(s,{text:`Events`,runover:{},childs:[]});e.controls.add(t)}},1),o(l,{head:[`Event`,`When`],rows:$,runover:{},childs:[]})]});e.controls.add(_)}}})}export{ie as default};