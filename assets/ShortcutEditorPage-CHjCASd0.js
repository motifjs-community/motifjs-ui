import{Qn as e,Un as t,Zn as n,er as r,g as i,n as a,w as o}from"./next-id-CtzpBrBT.js";import{t as s}from"./Switch-CESerSF7.js";import{t as c}from"./MxForm-BxjHcaYQ.js";import{t as l}from"./Stack-wRt1e9tO.js";import{t as u}from"./ShortcutEditor-DeC_H5aO.js";import{a as d,i as f,n as p,r as m,t as h}from"./docs-B_LZlyP5.js";import{t as g}from"./sources-BXVvOiIY.js";var _=`import { reactive } from '@motifx/core';\r
import { ShortcutEditor, Stack, commands, type Keymap } from '@motifx-community/ui';\r
\r
/**\r
 * The app's commands, limited to this example, and an editor for their keys. The keys the user gives arrive in\r
 * \`onKeysChanged\`, ready to save; giving them back to \`shortcuts.keymap\` restores them.\r
 */\r
export default function Basic() {\r
  const s = reactive({ told: 'Nothing yet.', keymap: {} as Keymap });\r
  const run = (what: string) => () => (s.told = what);\r
\r
  return (\r
    <Stack\r
      gap="md"\r
      ref={(host: Stack) => {\r
        commands.add({ key: 'demo.save', text: '&Save', shortcut: 'Mod+S', category: 'File', scope: host, run: run('Save') });\r
        commands.add({ key: 'demo.print', text: '&Print', shortcut: 'Mod+P', category: 'File', scope: host, run: run('Print') });\r
        commands.add({ key: 'demo.find', text: '&Find', shortcut: 'Mod+F', category: 'Edit', scope: host, run: run('Find') });\r
        commands.add({ key: 'demo.replace', text: '&Replace', category: 'Edit', scope: host, run: run('Replace') });\r
      }}\r
    >\r
      <ShortcutEditor height="22rem" filter={(info) => info.customizable && !!info.name?.startsWith('demo.')} onKeysChanged={(e) => (s.keymap = e.keymap)} />\r
      <p tabIndex={0} class="se-page">Click here, then press the keys: they work while focus is in this example.</p>\r
      <output class="se-told">{() => s.told}</output>\r
      <pre class="se-keymap">{() => JSON.stringify(s.keymap)}</pre>\r
    </Stack>\r
  );\r
}\r
`,v=`import { Button, MxForm, ShortcutEditor } from '@motifx-community/ui';\r
\r
/** The editor in a window of its own, as a settings dialog opens it. It lists every shortcut of this site. */\r
export default function InWindow() {\r
  const open = (button: Button) => {\r
    const form = new MxForm({ title: 'Keyboard shortcuts', width: '40rem', height: '30rem', resizable: true, modal: true });\r
    form.content = new ShortcutEditor();\r
    form.footer = <Button text="Close" tone="accent" onclick={() => form.close('ok')} />;\r
    void form.showDialog(button);\r
  };\r
  let button!: Button;\r
  return <Button text="Keyboard shortcuts…" variant="outline" ref={(b: Button) => (button = b)} onclick={() => open(button)} />;\r
}\r
`,y=`import { reactive } from '@motifx/core';\r
import { ShortcutEditor, Stack, Switch, addShortcut, type ShortcutInfo } from '@motifx-community/ui';\r
\r
/**\r
 * Shortcuts of the app's own (\`addShortcut\` with a name), one the user cannot change, and the switches of the editor:\r
 * the categories, the search field, the reset button, and every shortcut or only the ones the user can change.\r
 */\r
export default function Options() {\r
  const s = reactive({ grouped: true, search: true, resetAll: true, all: false });\r
  const ours = (info: ShortcutInfo) => !!info.name?.startsWith('options.');\r
  const changeable = (info: ShortcutInfo) => info.customizable && ours(info);\r
\r
  return (\r
    <Stack\r
      gap="md"\r
      ref={(host: Stack) => {\r
        const stops = [\r
          addShortcut(['F5', 'Mod+R'], () => {}, { scope: host, name: 'options.reload', text: 'Reload', category: 'View' }),\r
          addShortcut('Mod+=', () => {}, { scope: host, name: 'options.zoomIn', text: 'Zoom in', category: 'View' }),\r
          addShortcut('Mod+-', () => {}, { scope: host, name: 'options.zoomOut', text: 'Zoom out', category: 'View' }),\r
          addShortcut('F1', () => {}, { scope: host, name: 'options.help', text: 'Help', category: 'Help', customizable: false }),\r
        ];\r
        host.motif.setDisposable(() => stops.forEach((stop) => stop()));\r
      }}\r
    >\r
      <Stack orientation="horizontal" gap="lg" wrap>\r
        <Switch label="Categories" x-model={() => s.grouped} />\r
        <Switch label="Search" x-model={() => s.search} />\r
        <Switch label="Reset all keys" x-model={() => s.resetAll} />\r
        <Switch label="Fixed shortcuts too" x-model={() => s.all} />\r
      </Stack>\r
      <ShortcutEditor\r
        height="20rem"\r
        grouped={() => s.grouped}\r
        searchEnabled={() => s.search}\r
        resetAllEnabled={() => s.resetAll}\r
        filter={() => (s.all ? ours : changeable)}\r
      />\r
    </Stack>\r
  );\r
}\r
`,b=`import { Component } from '@motifx/core';\r
import { Button, ShortcutEditor, Stack, addShortcut } from '@motifx-community/ui';\r
\r
/** An editor created programmatically: a shortcut is selected and given other keys from code, then reset. */\r
export default class Programmatic extends Component<HTMLDivElement> {\r
    constructor() {\r
        super('div');\r
        const stack = new Stack({ gap: 'md' });\r
        const stop = addShortcut('Mod+K', () => {}, { scope: stack, name: 'code.palette', text: 'Command palette', category: 'Go' });\r
        stack.motif.setDisposable(stop);\r
        const editor = new ShortcutEditor({ height: '10rem', filter: (info) => info.name === 'code.palette' });\r
        const give = new Button({\r
            text: 'Give it Ctrl+Shift+P',\r
            variant: 'outline',\r
            onclick: () => {\r
                editor.selected = 'code.palette';\r
                editor.give(['Ctrl+Shift+P']);\r
            },\r
        });\r
        const reset = new Button({ text: 'Reset all keys', variant: 'outline', onclick: () => editor.resetAll() });\r
        const buttons = new Stack({ orientation: 'horizontal', gap: 'sm' });\r
        buttons.controls.add(give, reset);\r
        stack.controls.add(editor, buttons);\r
        this.controls.add(stack);\r
    }\r
}\r
`;function x(){let e=r({told:`Nothing yet.`,keymap:{}}),t=t=>()=>e.told=t;return n(l,{gap:`md`,ref:e=>{i.add({key:`demo.save`,text:`&Save`,shortcut:`Mod+S`,category:`File`,scope:e,run:t(`Save`)}),i.add({key:`demo.print`,text:`&Print`,shortcut:`Mod+P`,category:`File`,scope:e,run:t(`Print`)}),i.add({key:`demo.find`,text:`&Find`,shortcut:`Mod+F`,category:`Edit`,scope:e,run:t(`Find`)}),i.add({key:`demo.replace`,text:`&Replace`,category:`Edit`,scope:e,run:t(`Replace`)})},runover:{},childs:[n(u,{height:`22rem`,filter:e=>e.customizable&&!!e.name?.startsWith(`demo.`),onKeysChanged:t=>e.keymap=t.keymap,runover:{},childs:[]}),n(`p`,{initializeComponent:e=>{e.attr.add({tabIndex:0}),e.class.add(`se-page`);let t=n(`text`,{initializeComponent:e=>{e.setText(`Click here, then press the keys: they work while focus is in this example.`)}},1);e.controls.add(t)}},1),n(`output`,{initializeComponent:t=>{t.class.add(`se-told`),t.bindings.method(()=>e.told)}},1),n(`pre`,{initializeComponent:t=>{t.class.add(`se-keymap`),t.bindings.method(()=>JSON.stringify(e.keymap))}},1)]})}function S(){let e=e=>{let t=new c({title:`Keyboard shortcuts`,width:`40rem`,height:`30rem`,resizable:!0,modal:!0});t.content=new u,t.footer=n(a,{text:`Close`,tone:`accent`,runover:{initializeComponent:e=>{e.motif.on(`click`,()=>t.close(`ok`))}},childs:[]}),t.showDialog(e)},t;return n(a,{text:`Keyboard shortcuts…`,variant:`outline`,ref:e=>t=e,runover:{initializeComponent:n=>{n.motif.on(`click`,()=>e(t))}},childs:[]})}function C(){let e=r({grouped:!0,search:!0,resetAll:!0,all:!1}),t=e=>!!e.name?.startsWith(`options.`),i=e=>e.customizable&&t(e);return n(l,{gap:`md`,ref:e=>{let t=[o([`F5`,`Mod+R`],()=>{},{scope:e,name:`options.reload`,text:`Reload`,category:`View`}),o(`Mod+=`,()=>{},{scope:e,name:`options.zoomIn`,text:`Zoom in`,category:`View`}),o(`Mod+-`,()=>{},{scope:e,name:`options.zoomOut`,text:`Zoom out`,category:`View`}),o(`F1`,()=>{},{scope:e,name:`options.help`,text:`Help`,category:`Help`,customizable:!1})];e.motif.setDisposable(()=>t.forEach(e=>e()))},runover:{},childs:[n(l,{orientation:`horizontal`,gap:`lg`,wrap:!0,runover:{},childs:[n(s,{label:`Categories`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.grouped,t=>{let n=e;n!=null&&typeof n.grouped!=`function`&&(n.grouped=t)})}},childs:[]}),n(s,{label:`Search`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.search,t=>{let n=e;n!=null&&typeof n.search!=`function`&&(n.search=t)})}},childs:[]}),n(s,{label:`Reset all keys`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.resetAll,t=>{let n=e;n!=null&&typeof n.resetAll!=`function`&&(n.resetAll=t)})}},childs:[]}),n(s,{label:`Fixed shortcuts too`,runover:{initializeComponent:t=>{t.bindings.model(()=>e.all,t=>{let n=e;n!=null&&typeof n.all!=`function`&&(n.all=t)})}},childs:[]})]}),n(u,{height:`20rem`,grouped:()=>e.grouped,searchEnabled:()=>e.search,resetAllEnabled:()=>e.resetAll,filter:()=>e.all?t:i,runover:{},childs:[]})]})}var w=class extends t{constructor(){super(`div`);let e=new l({gap:`md`}),t=o(`Mod+K`,()=>{},{scope:e,name:`code.palette`,text:`Command palette`,category:`Go`});e.motif.setDisposable(t);let n=new u({height:`10rem`,filter:e=>e.name===`code.palette`}),r=new a({text:`Give it Ctrl+Shift+P`,variant:`outline`,onclick:()=>{n.selected=`code.palette`,n.give([`Ctrl+Shift+P`])}}),i=new a({text:`Reset all keys`,variant:`outline`,onclick:()=>n.resetAll()}),s=new l({orientation:`horizontal`,gap:`sm`});s.controls.add(r,i),e.controls.add(n,s),this.controls.add(e)}};w.elementTag=`div`;var T=g(Object.assign({"./examples/Basic.tsx":_,"./examples/InWindow.tsx":v,"./examples/Options.tsx":y,"./examples/Programmatic.tsx":b})),E=[[`filter`,"`Bind<((shortcut: ShortcutInfo) => boolean) | null>`",`The shortcuts the user can change`,`Which shortcuts are listed. A shortcut the user cannot change is listed with its row turned off.`],[`grouped`,"`Bind<boolean>`","`true`",`Lists the shortcuts under their categories. A shortcut without one is listed under “Other”.`],[`searchEnabled`,"`Bind<boolean>`","`true`",`Shows a search field above the list.`],[`resetAllEnabled`,"`Bind<boolean>`","`true`",`Shows the button that gives every shortcut its own keys again.`],[`height`,"`Bind<string | null>`",`The height of the parent`,`The height, as a CSS length.`],[`label`,"`Bind<string>`",`The kit string “Keyboard shortcuts”`,`The accessible name.`]],D=[[`selected`,"`string | null`",`The name of the selected shortcut. Settable.`],[`give(keys)`,"`boolean`","Gives the selected shortcut the keys (an empty list removes its keys), or its own keys again with `null`. Returns `false` when no shortcut the user can change is selected."],[`resetAll()`,"`void`",`Gives every shortcut its own keys again.`],[`refresh()`,"`void`",`Reads the shortcuts and their keys again. The editor does this when shortcuts are added or removed, and when the language changes.`]],O=[[`onKeysChanged`,"`{ name, keys, keymap }`","Occurs after the user changes the keys of a shortcut. `name` is `null` after a reset of all keys; `keymap` holds every key the user has given, to save."]],k=[[`name`,"`string`",`Names what the shortcut does. Shortcuts with the same name share the keys the user gives them. Without a name, a shortcut is not listed and cannot be changed.`],[`text`,"`string | (() => string)`",`How the shortcut reads in the list. A function is read again when the language changes.`],[`category`,"`string | (() => string)`",`The heading the list groups the shortcut under.`],[`customizable`,"`boolean`","`false` keeps the shortcut’s own keys. It is still listed when the filter allows it."]],A=[["Commands (`commands.add`)",`The key of the command`,`The text and the category of the command.`],[`TabDocumentManager`,"`tabDocuments.<action>`, such as `tabDocuments.closeTab`; `tabDocuments.focusGroup1` to `9`","Each action of `keys`. The keys of a mode, such as moving a window with the arrow keys, are read inside the mode and are not listed."],[`Toaster`,"`toaster.focus`",`The key that moves focus to the notifications.`],[`MenuBar`,"`menuBar.focus`","F10, with `focusOnF10`."]],j=[[`A row`,`The arrow keys, Home and End move through the list; typing in the search field filters it.`],[`The keys field`,`Takes the keys pressed instead of running them. Backspace clears it; Tab and Escape keep their usual meaning.`]],M=[[`Name`,"The editor is a group named by `label`; the list, the toolbar and the keys field have names of their own."],[`Status`,`The text that says who uses the keys pressed is a live region, read when it changes.`],[`Keys`,`Keys are written as the platform writes them: Ctrl+Shift+S, and ⇧⌘S on Apple platforms.`]],N=[[`.mx-shortcut-editor`,`The editor.`],[`.mx-shortcut-editor__tools, .mx-shortcut-editor__keys, .mx-shortcut-editor__capture`,`The toolbar, the keys row and its field.`],[`.mx-shortcut-editor__status`,`The text that says who uses the keys pressed.`],[`.mx-shortcut-editor__list`,`The list of shortcuts.`],[`.mx-shortcut-editor__text, .mx-shortcut-editor__changed, .mx-shortcut-editor__row-keys`,`A row: the name of the shortcut, the mark of keys the user changed, and its keys.`]],P=[[`shortcut-editor.editor, .keys`,"Units: the editor and the keys row, with the `gap` between their parts."],[`shortcut-editor.status, .row-keys, .changed`,`Units: the status text, the keys at the end of a row (read as in a menu), and the mark of changed keys.`]];function F(){return e({initializeComponent:e=>{{let t=n(`p`,{initializeComponent:e=>{e.class.add(`lead`);let t=n(m,{text:`A list of the app’s keyboard shortcuts in which the user assigns other keys. It shows the shortcuts of commands, of the app and of the kit’s components, and you can place it anywhere: a settings page, a dialog or a tab.`,runover:{},childs:[]});e.controls.add(t)}},1);e.controls.add(t);let r=n(f,{anchor:`import`,title:`Import`,runover:{},childs:[n(d,{code:`
import { ShortcutEditor } from '@motifx-community/ui';
`,runover:{},childs:[]})]});e.controls.add(r);let i=n(f,{anchor:`basic`,title:`Changing the keys of shortcuts`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(m,{text:"The editor lists the shortcuts in `shortcuts`, the registry that holds every keyboard shortcut of the app. Select a shortcut, press the new keys in the field, and choose Assign. The field says first whether the keys are free or which shortcut uses them. Remove keys leaves a shortcut without keys, and Reset gives it its own keys again.",runover:{},childs:[]});e.controls.add(t)}},1),n(p,{stack:!0,files:T(`Basic.tsx`),runover:{},childs:[n(x,{runover:{},childs:[]})]})]});e.controls.add(i);let a=n(f,{anchor:`saving`,title:`Saving the user’s keys`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(m,{text:"The keys the user assigns are kept in `shortcuts.keymap`, a plain object keyed by the shortcut’s name. `onKeysChanged`, or `shortcuts.onKeymapChanged`, reports it after each change; assigning a saved object to `shortcuts.keymap` restores the keys. Where the object is stored is up to the app.",runover:{},childs:[]});e.controls.add(t)}},1),n(d,{code:`
shortcuts.keymap = JSON.parse(localStorage.getItem('keys') ?? '{}');
shortcuts.onKeymapChanged((e) => localStorage.setItem('keys', JSON.stringify(e.keymap)));
`,runover:{},childs:[]}),n(`p`,{initializeComponent:e=>{let t=n(m,{text:`A shortcut added later, such as one of a component opened after the keymap was restored, takes the user’s keys for its name when it is added.`,runover:{},childs:[]});e.controls.add(t)}},1)]});e.controls.add(a);let o=n(f,{anchor:`window`,title:`In a dialog`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(m,{text:"The editor fills the height of its parent, so it can be the content of a window or a tab panel. Without a `filter`, it lists every shortcut of the page the user can change: here, the shortcuts of this documentation site.",runover:{},childs:[]});e.controls.add(t)}},1),n(p,{stack:!0,files:T(`InWindow.tsx`),runover:{},childs:[n(S,{runover:{},childs:[]})]}),n(`p`,{initializeComponent:e=>{let t=n(m,{text:"The customizer of a [MenuBar](/menus/customization) shows the same editor on its Keyboard page; `customizerKeyboard: false` leaves the page out.",runover:{},childs:[]});e.controls.add(t)}},1)]});e.controls.add(o);let s=n(f,{anchor:`listed`,title:`Which shortcuts are listed`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(m,{text:"A shortcut is listed when it has a name. `addShortcut` takes the name, the text the list shows and the category it is grouped under; `customizable: false` keeps its keys fixed. Several shortcuts with one name, such as the same action in two documents, are one row and take the same keys. `filter` chooses the rows, `grouped`, `searchEnabled` and `resetAllEnabled` turn the parts of the editor on and off.",runover:{},childs:[]});e.controls.add(t)}},1),n(p,{stack:!0,files:T(`Options.tsx`),runover:{},childs:[n(C,{runover:{},childs:[]})]}),n(d,{code:`
addShortcut(['F5', 'Mod+R'], () => view.reload(), { name: 'view.reload', text: () => t('Reload'), category: () => t('View') });
`,runover:{},childs:[]})]});e.controls.add(s);let c=n(f,{anchor:`kit`,title:`Shortcuts of the kit’s components`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(m,{text:`The kit’s components register their shortcuts under names of their own, with texts in the kit’s language. The user’s keys apply to them as to any other shortcut.`,runover:{},childs:[]});e.controls.add(t)}},1),n(h,{head:[`Component`,`Names`,`Shortcuts`],rows:A,runover:{},childs:[]})]});e.controls.add(c);let l=n(f,{anchor:`programmatic`,title:`Programmatic use`,runover:{},childs:[n(`p`,{initializeComponent:e=>{let t=n(m,{text:"`new ShortcutEditor(props)` creates the editor without JSX. Each prop is also a property; `selected`, `give()` and `resetAll()` do what the toolbar does.",runover:{},childs:[]});e.controls.add(t)}},1),n(p,{stack:!0,files:T(`Programmatic.tsx`),runover:{},childs:[n(w,{runover:{},childs:[]})]})]});e.controls.add(l);let u=n(f,{anchor:`api`,title:`API reference`,runover:{},childs:[n(`h3`,{initializeComponent:e=>{let t=n(m,{text:`Props`,runover:{},childs:[]});e.controls.add(t)}},1),n(h,{head:[`Prop`,`Type`,`Default`,`Description`],rows:E,runover:{},childs:[]}),n(`h3`,{initializeComponent:e=>{let t=n(m,{text:`Properties and methods`,runover:{},childs:[]});e.controls.add(t)}},1),n(h,{head:[`Member`,`Type`,`Description`],rows:D,runover:{},childs:[]}),n(`h3`,{initializeComponent:e=>{let t=n(m,{text:`Events`,runover:{},childs:[]});e.controls.add(t)}},1),n(h,{head:[`Event`,`Type`,`Description`],rows:O,runover:{},childs:[]}),n(`h3`,{initializeComponent:e=>{let t=n(m,{text:`Shortcut options for the list`,runover:{},childs:[]});e.controls.add(t)}},1),n(h,{head:[`Option of addShortcut`,`Type`,`Description`],rows:k,runover:{},childs:[]}),n(`h3`,{initializeComponent:e=>{let t=n(m,{text:`Keyboard`,runover:{},childs:[]});e.controls.add(t)}},1),n(h,{head:[`Where`,`Keys`],rows:j,runover:{},childs:[]}),n(`h3`,{initializeComponent:e=>{let t=n(m,{text:`Accessibility`,runover:{},childs:[]});e.controls.add(t)}},1),n(h,{head:[`Topic`,`Details`],rows:M,runover:{},childs:[]}),n(`h3`,{initializeComponent:e=>{let t=n(m,{text:`Styling hooks`,runover:{},childs:[]});e.controls.add(t)}},1),n(h,{head:[`Hook`,`Description`],rows:N,runover:{},childs:[]}),n(`h3`,{initializeComponent:e=>{let t=n(m,{text:`Design tokens`,runover:{},childs:[]});e.controls.add(t)}},1),n(h,{head:[`Token`,`Description`],rows:P,runover:{},childs:[]})]});e.controls.add(u)}}})}export{F as default};