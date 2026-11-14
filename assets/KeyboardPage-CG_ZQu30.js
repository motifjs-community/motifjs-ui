import{$n as e,Qn as t,Wn as n,n as r,tr as i,w as a}from"./next-id-IxLtiCRk.js";import{t as o}from"./Panel-DS23XSxX.js";import{t as s}from"./container-DLkO525e.js";import{t as c}from"./Stack-DTHjt5Ku.js";import{a as l,i as u,n as d,r as f,t as p}from"./docs-DpibOHDk.js";import{t as m}from"./sources-BXVvOiIY.js";var h=`import { reactive } from '@motifx/core';\r
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
`;function y(){let n=i({saves:0,opens:0,exports:0});return e({initializeComponent:e=>{{let i=t(r,{text:`&Save`,runover:{initializeComponent:e=>{e.motif.on(`click`,()=>n.saves++)}},childs:[]});e.controls.add(i);let a=t(r,{text:`&Open`,runover:{initializeComponent:e=>{e.motif.on(`click`,()=>n.opens++)}},childs:[]});e.controls.add(a);let o=t(r,{text:`Ex&port`,runover:{initializeComponent:e=>{e.motif.on(`click`,()=>n.exports++)}},childs:[]});e.controls.add(o);let s=t(`span`,{initializeComponent:e=>{let r=t(`text`,{initializeComponent:e=>{e.setText(`Saved `)}},1);e.controls.add(r);let i=t(`output`,{initializeComponent:e=>{e.class.add(`saves`),e.bindings.method(()=>n.saves)}},1);e.controls.add(i);let a=t(`text`,{initializeComponent:e=>{e.setText(` · opened `)}},1);e.controls.add(a);let o=t(`output`,{initializeComponent:e=>{e.class.add(`opens`),e.bindings.method(()=>n.opens)}},1);e.controls.add(o);let s=t(`text`,{initializeComponent:e=>{e.setText(` · exported`)}},1);e.controls.add(s);let c=t(`text`,{initializeComponent:e=>{e.setText(` `)}},1);e.controls.add(c);let l=t(`output`,{initializeComponent:e=>{e.bindings.method(()=>n.exports)}},1);e.controls.add(l)}},1);e.controls.add(s)}}})}function b(){let n=i({items:[{id:1},{id:2},{id:3},{id:4}]});return e({initializeComponent:e=>{e.bindings.list(()=>n&&n.items!==null&&n.items!==void 0?n.items:[],e=>t(c,{indexkey:()=>e.id,orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[t(`span`,{initializeComponent:n=>{let r=t(`text`,{initializeComponent:e=>{e.setText(`Row `)}},1);n.controls.add(r);let i=t(`text`,{initializeComponent:t=>{t.bindings.add(`textContent`,e,`id`)},__childExpr:()=>e.id});n.controls.add(i)}},1),t(r,{text:`Remove row ${e.id}`,runover:{initializeComponent:t=>{t.motif.on(`click`,()=>n.items.splice(n.items.indexOf(e),1))}},childs:[]})]}))}})}var x=class extends n{constructor(...e){super(...e),this.s=i({palette:0})}onConfigured(){this.motif.setDisposable(a(`Mod+K`,()=>void this.s.palette++))}view(){return t(`span`,{initializeComponent:e=>{let n=t(`text`,{initializeComponent:e=>{e.setText(`This page registers `)}},1);e.controls.add(n);let r=t(`kbd`,{initializeComponent:e=>{let n=t(`text`,{initializeComponent:e=>{e.setText(`Mod+K`)}},1);e.controls.add(n)}},1);e.controls.add(r);let i=t(`text`,{initializeComponent:e=>{e.setText(` (Ctrl+K, Cmd+K on a Mac). Pressed `)}},1);e.controls.add(i);let a=t(`output`,{initializeComponent:e=>{e.class.add(`palette`),e.bindings.method(()=>this.s.palette)}},1);e.controls.add(a);let o=t(`text`,{initializeComponent:e=>{e.setText(` times.`)}},1);e.controls.add(o)}},1)}},S=class extends s{};function C(){let n=null;return e({initializeComponent:e=>{{let i=t(S,{ref:e=>n=e,runover:{},childs:[t(o,{variant:`outline`,padding:`md`,runover:{},childs:[t(c,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[t(r,{text:`Third`,tabIndex:3,runover:{},childs:[]}),t(r,{text:`First`,tabIndex:1,runover:{},childs:[]}),t(r,{text:`Second`,tabIndex:2,runover:{},childs:[]})]})]})]});e.controls.add(i);let a=t(`span`,{initializeComponent:e=>{let r=t(`text`,{initializeComponent:e=>{e.setText(`activeControl: `)}},1);e.controls.add(r);let i=t(`output`,{initializeComponent:e=>{e.class.add(`active-name`),e.bindings.method(()=>n?.activeControl?.text??`—`)}},1);e.controls.add(i)}},1);e.controls.add(a);let s=t(r,{text:`restoreFocus()`,runover:{initializeComponent:e=>{e.motif.on(`click`,()=>n?.restoreFocus())}},childs:[]});e.controls.add(s)}}})}var w=m(Object.assign({"./examples/AccessKeys.tsx":h,"./examples/FocusGuard.tsx":g,"./examples/Shortcut.tsx":_,"./examples/TabOrder.tsx":v})),T=[[`Tab navigation`,"Every control is a Tab stop unless `tabStop = false`. `tabIndex` sets the order of the controls in a container."],[`Active control`,"Containers (`FocusContainer`) track `activeControl` and restore focus with `restoreFocus()` when they become active again."],[`Composite controls`,"One Tab stop with arrow keys inside, using a roving tabindex or `aria-activedescendant`. This arrives with the first composite control."],[`Focus never on <body>`,`When the focused part of a control is disabled, hidden, removed or disposed, focus moves to the next usable element.`],[`Focus ring`,"Shown only during keyboard use (`:focus-visible`), with the design system's double ring."],[`Access keys`,"`&Save` in a control's text assigns Alt+S. The letter is underlined while Alt is held."],[`Shortcuts`,"`addShortcut('Ctrl+S', …)` registers a shortcut for the whole application or for one control."]],E=[[`Ctrl / Control`,`The Ctrl key.`],[`Alt / Option`,`The Alt key (Option on a Mac).`],[`Shift`,`The Shift key.`],[`Meta / Cmd / Win`,`The Windows key, or Cmd on a Mac.`],[`Mod`,"Cmd on Apple platforms and Ctrl elsewhere, so `Mod+S` saves on every platform."],[`keys`,"A character (`S`, `1`, `/`) or a `KeyboardEvent.key` name: `Enter`, `Escape` (`Esc`), `Delete` (`Del`), `F2`, `ArrowUp` (`Up`), `Space`, `Plus`… Case does not matter. `Ctrl++` means Ctrl and plus."]],D=[[`Most specific first`,"Shortcuts scoped to the controls that hold focus run first, starting with the innermost. Application-wide shortcuts run last. A handler that returns `false` passes the key on."],[`Modal windows`,`While a modal window is open, only shortcuts scoped inside it run. Application-wide shortcuts are suppressed.`],[`Windows`,`Application-wide shortcuts without Ctrl, Alt or Meta (Delete, Escape, a letter) do not run while focus is in a window, because those keys belong to the window. Combinations with a modifier and function keys still run.`],[`Text fields`,"A combination without Ctrl, Alt or Meta does not fire in text fields, so that Delete deletes text, unless you set `inEditable: true`. Function keys and combinations with a modifier work everywhere."],[`Disabled scope`,`A shortcut scoped to a disabled control does not run.`],[`Handled`,"The key receives `preventDefault()` and goes no further. Shortcuts run before access keys, so an explicit combination takes priority over an implicit key."]],O=[[`Marker`,"Put `&` before a letter: `&Save`, `Save &as…`. `&&` produces a literal ampersand. Only the first marker counts."],[`Keys`,"Alt plus the key. On Apple platforms, use Control + Option plus the key, because Option alone types characters there. Browsers use the same keys for HTML `accesskey`."],[`Description`,"The key activates the control. A button receives focus and is clicked, as with HTML `accesskey`. Any other control receives focus (`onAccessKey()`)."],[`Several with the same key`,`Each press moves focus to the next match without activating it.`],[`Where`,`The modal window if one is open, otherwise the window that has focus, otherwise the page outside any window. Disabled and hidden controls are skipped.`],[`AltGr`,"AltGr (Ctrl+Alt on Windows) is ignored, because it types characters such as `@` on a Turkish keyboard."],[`Underline`,'Shown while Alt is held (Control + Option on Apple platforms). Tapping Alt keeps the underlines visible until Alt is tapped again, another key is pressed or the pointer is used. While the page has access keys, that tap is not passed to the browser, which would otherwise move keyboard focus to its menu bar. Set `data-mx-access-keys="always"` on `<html>` to show them all the time.'],[`Accessibility`,'The accessible name is the plain text, and the control receives `aria-keyshortcuts="Alt+S"` (`"Control+Alt+S"` on Apple platforms).']],k=[[`addShortcut(keys, handler, options?)`,"`() => void`","Registers a shortcut and returns a function that removes it. `keys` is one set of keys or a list of them. `options.scope` limits it to a component, `options.within` further to parts of it (a component, a list of components, or a function that returns them, such as the tabs of a strip: shortcuts of different parts may share keys), `options.inEditable` also enables it in text fields, and `options.name` lets the user assign other keys ([ShortcutEditor](/shortcuteditor))."],[`control.addShortcut(keys, handler, options?)`,"`() => void`",`Registers a shortcut scoped to the control and removes it when the control is disposed.`],[`parseAccessKey(text)`,"`{ text, key, index }`","Parses `&Text` for your own controls. Render the result with the `mx-access-key` class and call `setAccessKey(key)`."],[`tabIndex`,`prop / property`,`The order inside the container. The default is 0.`],[`activeControl / restoreFocus()`,`FocusContainer`,`See the Control page.`]];function A(){return e({initializeComponent:e=>{{let n=t(`p`,{initializeComponent:e=>{e.class.add(`lead`);let n=t(f,{text:"Every control follows the same rules for Tab order, the active control of a container, focus handling, `&File` access keys and application-wide shortcuts.",runover:{},childs:[]});e.controls.add(n)}},1);e.controls.add(n);let r=t(u,{anchor:`rules`,title:`Validation rules`,runover:{},childs:[t(p,{head:[`Rule`,`Details`],rows:T,runover:{},childs:[]})]});e.controls.add(r);let i=t(u,{anchor:`tab`,title:`Tab order`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(f,{text:"Give controls a `tabIndex`, and the outermost container of the page or window visits them in ascending order at each level of the control tree. Equal indexes and plain elements (index 0) follow document order. Until a control sets a `tabIndex`, Tab is handled by the browser. A modal window keeps Tab inside itself, and only one radio button per group is a Tab stop, as in browsers.",runover:{},childs:[]});e.controls.add(n)}},1),t(d,{files:w(`TabOrder.tsx`),runover:{},childs:[t(C,{runover:{},childs:[]})]})]});e.controls.add(i);let a=t(u,{anchor:`active`,title:`Active control`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(f,{text:"A `FocusContainer` knows which child control holds focus (`activeControl`, reactive) and returns focus to it with `restoreFocus()`. For example, when a window comes to the front or the user returns to a tab page.",runover:{},childs:[]});e.controls.add(n)}},1)]});e.controls.add(a);let o=t(u,{anchor:`access`,title:`Access keys`,runover:{},childs:[t(l,{code:`
<Button text="&Save" onclick={save} />    // Alt+S
<Button text="Save &as…" onclick={saveAs} /> // Alt+A
<Button text="Tom && Jerry" />             // a literal &
`,runover:{},childs:[]}),t(p,{head:[`Topic`,`Behavior`],rows:O,runover:{},childs:[]}),t(d,{files:w(`AccessKeys.tsx`),runover:{},childs:[t(y,{runover:{},childs:[]})]}),t(`p`,{initializeComponent:e=>{e.class.add(`docs-note`);let n=t(f,{text:`Browsers reserve some Alt combinations for their own menus, and these vary by browser and language. Test the keys you choose.`,runover:{},childs:[]});e.controls.add(n)}},1)]});e.controls.add(o);let s=t(u,{anchor:`shortcuts`,title:`Shortcuts`,runover:{},childs:[t(l,{code:`
import { addShortcut } from '@motifx-community/ui';

const remove = addShortcut('Mod+S', () => model.save()); // app-wide
grid.addShortcut('Delete', () => grid.deleteSelected()); // while focus is in the grid
addShortcut('F2', () => rename(), { scope: tree });
`,runover:{},childs:[]}),t(`h3`,{initializeComponent:e=>{let n=t(f,{text:`Key combinations`,runover:{},childs:[]});e.controls.add(n)}},1),t(p,{head:[`Part`,`Meaning`],rows:E,runover:{},childs:[]}),t(`h3`,{initializeComponent:e=>{let n=t(f,{text:`Shortcut precedence`,runover:{},childs:[]});e.controls.add(n)}},1),t(p,{head:[`Rule`,`Behavior`],rows:D,runover:{},childs:[]}),t(d,{files:w(`Shortcut.tsx`),runover:{},childs:[t(x,{runover:{},childs:[]})]}),t(`p`,{initializeComponent:e=>{let n=t(f,{text:`Commands defined once, with their keys, for menus, toolbars and ribbons, the list of every shortcut with its conflicts, and the keys the user gives are on [Commands and shortcuts](/commands). [ShortcutEditor](/shortcuteditor) lets the user assign other keys to any shortcut with a name.`,runover:{},childs:[]});e.controls.add(n)}},1)]});e.controls.add(s);let c=t(u,{anchor:`guard`,title:`Focus never lands on &lt;body&gt;`,runover:{},childs:[t(`p`,{initializeComponent:e=>{let n=t(f,{text:`When the focused part of a control is disabled, hidden, removed (a list row, a tree branch) or disposed, focus moves to the next usable element from that position in the same window, or to the previous one. Clicking an empty area still clears focus as usual, and route changes are left to the router.`,runover:{},childs:[]});e.controls.add(n)}},1),t(d,{files:w(`FocusGuard.tsx`),stack:!0,runover:{},childs:[t(b,{runover:{},childs:[]})]})]});e.controls.add(c);let m=t(u,{anchor:`api`,title:`API reference`,runover:{},childs:[t(p,{head:[`Member`,`Return value / type`,`Description`],rows:k,runover:{},childs:[]}),t(`p`,{initializeComponent:e=>{let n=t(f,{text:"For `tabStop`, `tabIndex`, `focus()`, `onAccessKey()` and `FocusContainer`, see the `Control` page.",runover:{},childs:[]});e.controls.add(n)}},1)]});e.controls.add(m)}}})}export{A as default};