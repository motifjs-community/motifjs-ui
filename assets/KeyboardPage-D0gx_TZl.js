import{Jt as e,a as t,an as n,ct as r,h as i,i as a,n as o,nn as s,r as c,rn as l,t as u}from"./doc-B1CtlCkV.js";import{t as d}from"./Stack-AS0iyAxC.js";import{t as f}from"./Panel-psRyqKP0.js";import{t as p}from"./container-DnMm7ECX.js";import{t as m}from"./sources-BXVvOiIY.js";var h=`import { reactive } from '@motifx/core';\r
import { Button } from '@motifx-community/ui';\r
\r
/** \`&\` in a button text: Alt+S saves, Alt+O opens, Alt+P exports. */\r
export default function AccessKeys() {\r
  const s = reactive({ saves: 0, opens: 0, exports: 0 });\r
  return (\r
    <>\r
      <Button text="&Save" onclick={() => s.saves++} />\r
      <Button text="&Open" onclick={() => s.opens++} />\r
      <Button text="Ex&port" onclick={() => s.exports++} />\r
      <span>\r
        Saved <output class="saves">{() => s.saves}</output> · opened <output class="opens">{() => s.opens}</output> · exported{' '}\r
        <output>{() => s.exports}</output>\r
      </span>\r
    </>\r
  );\r
}\r
`,g=`import { reactive } from '@motifx/core';\r
import { Button, Stack } from '@motifx-community/ui';\r
\r
/** Removing the row that holds focus moves focus to the next row, not to \`<body>\`. */\r
export default function FocusGuard() {\r
  const s = reactive({ items: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }] });\r
  return (\r
    <>\r
      {s.items.map((item) => (\r
        <Stack key={item.id} orientation="horizontal" wrap align="center">\r
          <span>Row {item.id}</span>\r
          <Button text={\`Remove row \${item.id}\`} onclick={() => s.items.splice(s.items.indexOf(item), 1)} />\r
        </Stack>\r
      ))}\r
    </>\r
  );\r
}\r
`,_=`import { Component, reactive } from '@motifx/core';\r
import { addShortcut } from '@motifx-community/ui';\r
\r
/** An app-wide shortcut, Mod+K, registered for as long as this component lives. */\r
export default class Shortcut extends Component {\r
  private readonly s = reactive({ palette: 0 });\r
\r
  override onConfigured(): void {\r
    this.motif.setDisposable(addShortcut('Mod+K', () => void this.s.palette++));\r
  }\r
\r
  override view() {\r
    return (\r
      <span>\r
        This page registers <kbd>Mod+K</kbd> (Ctrl+K, Cmd+K on a Mac). Pressed <output class="palette">{() => this.s.palette}</output> times.\r
      </span>\r
    );\r
  }\r
}\r
`,v=`import { Button, FocusContainer, Panel, Stack } from '@motifx-community/ui';\r
\r
/** A custom container: it manages the Tab order of its controls and remembers the active one. */\r
class CustomerEditor extends FocusContainer<HTMLDivElement> {}\r
\r
/** Tab visits the buttons by \`tabIndex\`; the container reports its \`activeControl\` and puts focus back with \`restoreFocus()\`. */\r
export default function TabOrder() {\r
  let editor: CustomerEditor | null = null;\r
  return (\r
    <>\r
      <CustomerEditor ref={(c: CustomerEditor) => (editor = c)}>\r
        <Panel variant="outline" padding="md">\r
          <Stack orientation="horizontal" wrap align="center">\r
            <Button text="Third" tabIndex={3} />\r
            <Button text="First" tabIndex={1} />\r
            <Button text="Second" tabIndex={2} />\r
          </Stack>\r
        </Panel>\r
      </CustomerEditor>\r
      <span>\r
        activeControl: <output class="active-name">{() => editor?.activeControl?.text ?? '—'}</output>\r
      </span>\r
      <Button text="restoreFocus()" onclick={() => editor?.restoreFocus()} />\r
    </>\r
  );\r
}\r
`;function y(){let e=n({saves:0,opens:0,exports:0});return l({initializeComponent:t=>{{let n=s(i,{text:`&Save`,runover:{initializeComponent:t=>{t.motif.on(`click`,()=>e.saves++)}},childs:[]});t.controls.add(n);let r=s(i,{text:`&Open`,runover:{initializeComponent:t=>{t.motif.on(`click`,()=>e.opens++)}},childs:[]});t.controls.add(r);let a=s(i,{text:`Ex&port`,runover:{initializeComponent:t=>{t.motif.on(`click`,()=>e.exports++)}},childs:[]});t.controls.add(a);let o=s(`span`,{initializeComponent:t=>{let n=s(`text`,{initializeComponent:e=>{e.setText(`Saved `)}},1);t.controls.add(n);let r=s(`output`,{initializeComponent:t=>{t.class.add(`saves`),t.bindings.method(()=>e.saves)}},1);t.controls.add(r);let i=s(`text`,{initializeComponent:e=>{e.setText(` · opened `)}},1);t.controls.add(i);let a=s(`output`,{initializeComponent:t=>{t.class.add(`opens`),t.bindings.method(()=>e.opens)}},1);t.controls.add(a);let o=s(`text`,{initializeComponent:e=>{e.setText(` · exported`)}},1);t.controls.add(o);let c=s(`text`,{initializeComponent:e=>{e.setText(` `)}},1);t.controls.add(c);let l=s(`output`,{initializeComponent:t=>{t.bindings.method(()=>e.exports)}},1);t.controls.add(l)}},1);t.controls.add(o)}}})}function b(){let e=n({items:[{id:1},{id:2},{id:3},{id:4}]});return l({initializeComponent:t=>{t.bindings.list(()=>e&&e.items!==null&&e.items!==void 0?e.items:[],t=>s(d,{indexkey:()=>t.id,orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[s(`span`,{initializeComponent:e=>{let n=s(`text`,{initializeComponent:e=>{e.setText(`Row `)}},1);e.controls.add(n);let r=s(`text`,{initializeComponent:e=>{e.bindings.add(`textContent`,t,`id`)},__childExpr:()=>t.id});e.controls.add(r)}},1),s(i,{text:`Remove row ${t.id}`,runover:{initializeComponent:n=>{n.motif.on(`click`,()=>e.items.splice(e.items.indexOf(t),1))}},childs:[]})]}))}})}var x=class extends e{constructor(...e){super(...e),this.s=n({palette:0})}onConfigured(){this.motif.setDisposable(r(`Mod+K`,()=>void this.s.palette++))}view(){return s(`span`,{initializeComponent:e=>{let t=s(`text`,{initializeComponent:e=>{e.setText(`This page registers `)}},1);e.controls.add(t);let n=s(`kbd`,{initializeComponent:e=>{let t=s(`text`,{initializeComponent:e=>{e.setText(`Mod+K`)}},1);e.controls.add(t)}},1);e.controls.add(n);let r=s(`text`,{initializeComponent:e=>{e.setText(` (Ctrl+K, Cmd+K on a Mac). Pressed `)}},1);e.controls.add(r);let i=s(`output`,{initializeComponent:e=>{e.class.add(`palette`),e.bindings.method(()=>this.s.palette)}},1);e.controls.add(i);let a=s(`text`,{initializeComponent:e=>{e.setText(` times.`)}},1);e.controls.add(a)}},1)}},S=class extends p{};function C(){let e=null;return l({initializeComponent:t=>{{let n=s(S,{ref:t=>e=t,runover:{},childs:[s(f,{variant:`outline`,padding:`md`,runover:{},childs:[s(d,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[s(i,{text:`Third`,tabIndex:3,runover:{},childs:[]}),s(i,{text:`First`,tabIndex:1,runover:{},childs:[]}),s(i,{text:`Second`,tabIndex:2,runover:{},childs:[]})]})]})]});t.controls.add(n);let r=s(`span`,{initializeComponent:t=>{let n=s(`text`,{initializeComponent:e=>{e.setText(`activeControl: `)}},1);t.controls.add(n);let r=s(`output`,{initializeComponent:t=>{t.class.add(`active-name`),t.bindings.method(()=>e?.activeControl?.text??`—`)}},1);t.controls.add(r)}},1);t.controls.add(r);let a=s(i,{text:`restoreFocus()`,runover:{initializeComponent:t=>{t.motif.on(`click`,()=>e?.restoreFocus())}},childs:[]});t.controls.add(a)}}})}var w=m(Object.assign({"./examples/AccessKeys.tsx":h,"./examples/FocusGuard.tsx":g,"./examples/Shortcut.tsx":_,"./examples/TabOrder.tsx":v})),T=[[`Tab navigation`,"Every control is a Tab stop unless `tabStop = false`. `tabIndex` sets the order of the controls in a container."],[`Active control`,"Containers (`FocusContainer`) track `activeControl` and restore focus with `restoreFocus()` when they become active again."],[`Composite controls`,"One Tab stop with arrow keys inside, using a roving tabindex or `aria-activedescendant`. This arrives with the first composite control."],[`Focus never on <body>`,`When the focused part of a control is disabled, hidden, removed or disposed, focus moves to the next usable element.`],[`Focus ring`,"Shown only during keyboard use (`:focus-visible`), with the design system's double ring."],[`Access keys`,"`&Save` in a control's text assigns Alt+S. The letter is underlined while Alt is held."],[`Shortcuts`,"`addShortcut('Ctrl+S', …)` registers a shortcut for the whole application or for one control."]],E=[[`Ctrl / Control`,`The Ctrl key.`],[`Alt / Option`,`The Alt key (Option on a Mac).`],[`Shift`,`The Shift key.`],[`Meta / Cmd / Win`,`The Windows key, or Cmd on a Mac.`],[`Mod`,"Cmd on Apple platforms and Ctrl elsewhere, so `Mod+S` saves on every platform."],[`keys`,"A character (`S`, `1`, `/`) or a `KeyboardEvent.key` name: `Enter`, `Escape` (`Esc`), `Delete` (`Del`), `F2`, `ArrowUp` (`Up`), `Space`, `Plus`… Case does not matter. `Ctrl++` means Ctrl and plus."]],D=[[`Most specific first`,"Shortcuts scoped to the controls that hold focus run first, starting with the innermost. Application-wide shortcuts run last. A handler that returns `false` passes the key on."],[`Modal windows`,`While a modal window is open, only shortcuts scoped inside it run. Application-wide shortcuts are suppressed.`],[`Windows`,`Application-wide shortcuts without Ctrl, Alt or Meta (Delete, Escape, a letter) do not run while focus is in a window, because those keys belong to the window. Combinations with a modifier and function keys still run.`],[`Text fields`,"A combination without Ctrl, Alt or Meta does not fire in text fields, so that Delete deletes text, unless you set `inEditable: true`. Function keys and combinations with a modifier work everywhere."],[`Disabled scope`,`A shortcut scoped to a disabled control does not run.`],[`Handled`,"The key receives `preventDefault()` and goes no further. Shortcuts run before access keys, so an explicit combination takes priority over an implicit key."]],O=[[`Marker`,"Put `&` before a letter: `&Save`, `Save &as…`. `&&` produces a literal ampersand. Only the first marker counts."],[`Keys`,"Alt plus the key. On Apple platforms, use Control + Option plus the key, because Option alone types characters there. Browsers use the same keys for HTML `accesskey`."],[`Description`,"The key activates the control. A button receives focus and is clicked, as with HTML `accesskey`. Any other control receives focus (`onAccessKey()`)."],[`Several with the same key`,`Each press moves focus to the next match without activating it.`],[`Where`,`The modal window if one is open, otherwise the window that has focus, otherwise the page outside any window. Disabled and hidden controls are skipped.`],[`AltGr`,"AltGr (Ctrl+Alt on Windows) is ignored, because it types characters such as `@` on a Turkish keyboard."],[`Underline`,'Shown while Alt is held (Control + Option on Apple platforms). Tapping Alt keeps the underlines visible until Alt is tapped again, another key is pressed or the pointer is used. While the page has access keys, that tap is not passed to the browser, which would otherwise move keyboard focus to its menu bar. Set `data-mx-access-keys="always"` on `<html>` to show them all the time.'],[`Accessibility`,'The accessible name is the plain text, and the control receives `aria-keyshortcuts="Alt+S"` (`"Control+Alt+S"` on Apple platforms).'],[`Plain elements`,'Any element with `aria-keyshortcuts="Alt+N"` takes part. A button-like element is clicked, an input receives focus, and a `<label>` moves focus to its field.']],k=[[`addShortcut(chord, handler, options?)`,"`() => void`","Registers a shortcut and returns a function that removes it. `options.scope` limits it to a component, and `options.inEditable` also enables it in text fields."],[`control.addShortcut(chord, handler, options?)`,"`() => void`",`Registers a shortcut scoped to the control and removes it when the control is disposed.`],[`parseAccessKey(text)`,"`{ text, key, index }`","Parses `&Text` for your own controls. Render the result with the `mx-access-key` class and call `setAccessKey(key)`."],[`tabIndex`,`prop / property`,`The order inside the container. The default is 0.`],[`activeControl / restoreFocus()`,`FocusContainer`,`See the Control page.`]];function A(){return l({initializeComponent:e=>{{let n=s(`p`,{initializeComponent:e=>{e.class.add(`lead`);let t=s(c,{text:"Every control follows the same rules for Tab order, the active control of a container, focus handling, `&File` access keys and application-wide shortcuts.",runover:{},childs:[]});e.controls.add(t)}},1);e.controls.add(n);let r=s(a,{anchor:`rules`,title:`Validation rules`,runover:{},childs:[s(u,{head:[`Rule`,`Details`],rows:T,runover:{},childs:[]})]});e.controls.add(r);let i=s(a,{anchor:`tab`,title:`Tab order`,runover:{},childs:[s(`p`,{initializeComponent:e=>{let t=s(c,{text:"Give controls a `tabIndex`, and the outermost container of the page or window visits them in ascending order at each level of the control tree. Equal indexes and plain elements (index 0) follow document order. Until a control sets a `tabIndex`, Tab is handled by the browser. A modal window keeps Tab inside itself, and only one radio button per group is a Tab stop, as in browsers.",runover:{},childs:[]});e.controls.add(t)}},1),s(o,{files:w(`TabOrder.tsx`),runover:{},childs:[s(C,{runover:{},childs:[]})]})]});e.controls.add(i);let l=s(a,{anchor:`active`,title:`Active control`,runover:{},childs:[s(`p`,{initializeComponent:e=>{let t=s(c,{text:"A `FocusContainer` knows which child control holds focus (`activeControl`, reactive) and returns focus to it with `restoreFocus()`. For example, when a window comes to the front or the user returns to a tab page.",runover:{},childs:[]});e.controls.add(t)}},1)]});e.controls.add(l);let d=s(a,{anchor:`access`,title:`Access keys`,runover:{},childs:[s(t,{code:`
<Button text="&Save" onclick={save} />    // Alt+S
<Button text="Save &as…" onclick={saveAs} /> // Alt+A
<Button text="Tom && Jerry" />             // a literal &
<input aria-keyshortcuts="Alt+N" />        // plain elements too
`,runover:{},childs:[]}),s(u,{head:[`Topic`,`Behavior`],rows:O,runover:{},childs:[]}),s(o,{files:w(`AccessKeys.tsx`),runover:{},childs:[s(y,{runover:{},childs:[]})]}),s(`p`,{initializeComponent:e=>{e.class.add(`docs-note`);let t=s(c,{text:`Browsers reserve some Alt combinations for their own menus, and these vary by browser and language. Test the keys you choose.`,runover:{},childs:[]});e.controls.add(t)}},1)]});e.controls.add(d);let f=s(a,{anchor:`shortcuts`,title:`Shortcuts`,runover:{},childs:[s(t,{code:`
import { addShortcut } from '@motifx-community/ui';

const remove = addShortcut('Mod+S', () => model.save()); // app-wide
grid.addShortcut('Delete', () => grid.deleteSelected()); // while focus is in the grid
addShortcut('F2', () => rename(), { scope: tree });
`,runover:{},childs:[]}),s(`h3`,{initializeComponent:e=>{let t=s(c,{text:`Key combinations`,runover:{},childs:[]});e.controls.add(t)}},1),s(u,{head:[`Part`,`Meaning`],rows:E,runover:{},childs:[]}),s(`h3`,{initializeComponent:e=>{let t=s(c,{text:`Shortcut precedence`,runover:{},childs:[]});e.controls.add(t)}},1),s(u,{head:[`Rule`,`Behavior`],rows:D,runover:{},childs:[]}),s(o,{files:w(`Shortcut.tsx`),runover:{},childs:[s(x,{runover:{},childs:[]})]})]});e.controls.add(f);let p=s(a,{anchor:`guard`,title:`Focus never lands on &lt;body&gt;`,runover:{},childs:[s(`p`,{initializeComponent:e=>{let t=s(c,{text:`When the focused part of a control is disabled, hidden, removed (a list row, a tree branch) or disposed, focus moves to the next usable element from that position in the same window, or to the previous one. Clicking an empty area still clears focus as usual, and route changes are left to the router.`,runover:{},childs:[]});e.controls.add(t)}},1),s(o,{files:w(`FocusGuard.tsx`),stack:!0,runover:{},childs:[s(b,{runover:{},childs:[]})]})]});e.controls.add(p);let m=s(a,{anchor:`api`,title:`API reference`,runover:{},childs:[s(u,{head:[`Member`,`Return value / type`,`Description`],rows:k,runover:{},childs:[]}),s(`p`,{initializeComponent:e=>{let t=s(c,{text:"For `tabStop`, `tabIndex`, `focus()`, `onAccessKey()` and `FocusContainer`, see the `Control` page.",runover:{},childs:[]});e.controls.add(t)}},1)]});e.controls.add(m)}}})}export{A as default};