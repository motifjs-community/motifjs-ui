var e=`import { reactive, type Component } from '@motifx/core';\r
import { attachContextMenu } from '@motifx-community/ui';\r
\r
const START = 'Right-click here, or focus me and press the Menu key.';\r
const BOX = 'padding: var(--mx-space-4); background: var(--mx-color-bg-card); border: var(--mx-border-width-1) solid var(--mx-color-stroke-card); border-radius: var(--mx-radius-lg)';\r
\r
/** A menu given to a component with \`attachContextMenu\`, its items built from the opening. */\r
export default function AttachedMenu() {\r
  const s = reactive({ zone: START });\r
\r
  const attach = (c: Component<HTMLDivElement>) => {\r
    const remove = attachContextMenu(c, (e) => [\r
      { text: '&Say where', click: () => (s.zone = \`Opened \${e.byKeyboard ? 'from the keyboard' : 'with the pointer'} on \${e.part === c ? 'the zone' : 'its content'}.\`) },\r
      { text: '&Reset', click: () => (s.zone = START) },\r
    ]);\r
    c.motif.setDisposable(remove);\r
  };\r
\r
  return (\r
    <div class="cm-zone" tabindex="0" style={BOX} onBuilt={attach}>\r
      {() => s.zone}\r
    </div>\r
  );\r
}\r
`,t=`import { reactive } from '@motifx/core';\r
import { MenuBar, Stack, type MenuItem } from '@motifx-community/ui';\r
\r
const MENUS: MenuItem[] = [\r
  { key: 'file', text: '&File', items: [{ key: 'new', text: '&New' }, { key: 'open', text: '&Open…' }] },\r
  { key: 'edit', text: '&Edit', items: [{ key: 'undo', text: '&Undo' }, { key: 'redo', text: '&Redo' }] },\r
  { key: 'help', text: '&Help', items: [{ key: 'about', text: '&About' }] },\r
];\r
\r
/**\r
 * The menu a right-click opens on the bar, with commands of the app's own: the bar is not \`customizable\`, so they are\r
 * the only ones. Help opens no menu at all.\r
 */\r
export default function CustomMenuCommands() {\r
  const s = reactive({ told: 'Nothing yet.' });\r
\r
  return (\r
    <Stack gap="md">\r
      <MenuBar\r
        label="Own commands"\r
        items={MENUS}\r
        onCustomMenuOpening={(e) => {\r
          if (e.path === 'help') {\r
            e.cancel = true;\r
            return;\r
          }\r
          const name = e.item ? String(e.item.text).replace('&', '') : 'the bar';\r
          e.items.push(\r
            { text: \`Copy the path of \${name}\`, click: () => (s.told = \`Path: \${e.path ?? '(none)'}\`) },\r
            { text: 'Show all menus', beginGroup: true, click: () => (s.told = 'Every menu is shown.') },\r
          );\r
        }}\r
      />\r
      <output class="mb-own-told">{() => s.told}</output>\r
    </Stack>\r
  );\r
}\r
`,n=`import { reactive } from '@motifx/core';\r
import { Button, MenuBar, Stack, type MenuBarCustomization, type MenuItem } from '@motifx-community/ui';\r
\r
const MENUS: MenuItem[] = [\r
  {\r
    key: 'file',\r
    text: '&File',\r
    items: [\r
      { key: 'new', text: '&New', shortcut: 'Ctrl+N' },\r
      { key: 'open', text: '&Open…', shortcut: 'Ctrl+O' },\r
      { key: 'save', text: '&Save', shortcut: 'Ctrl+S', beginGroup: true },\r
      { key: 'export', text: '&Export', items: [{ key: 'pdf', text: 'PDF' }, { key: 'html', text: 'HTML' }] },\r
      { key: 'exit', text: 'E&xit', beginGroup: true, customizable: false },\r
    ],\r
  },\r
  { key: 'edit', text: '&Edit', items: [{ key: 'undo', text: '&Undo' }, { key: 'redo', text: '&Redo' }, { key: 'find', text: '&Find' }] },\r
  { key: 'view', text: '&View', items: [{ key: 'zoom', text: '&Zoom' }, { key: 'full', text: '&Full screen' }] },\r
  { key: 'help', text: '&Help', customizable: false, items: [{ key: 'about', text: '&About' }] },\r
];\r
\r
// Commands the user can add from the customizer.\r
const COMMANDS: MenuItem[] = [\r
  { key: 'print', text: '&Print', shortcut: 'Ctrl+P' },\r
  { key: 'share', text: 'S&hare' },\r
  { key: 'spelling', text: 'Check &spelling', shortcut: 'F7' },\r
];\r
\r
/** Right-click an item, or press Shift+F10 on it, to hide or move it; what the user changed is one object to save. */\r
export default function CustomizableMenu() {\r
  const s = reactive({ saved: null as MenuBarCustomization | null, told: 'Nothing yet.' });\r
  let bar!: MenuBar;\r
\r
  return (\r
    <Stack gap="md">\r
      <MenuBar\r
        ref={(b: MenuBar) => (bar = b)}\r
        label="Editor"\r
        items={MENUS}\r
        customizable\r
        commands={COMMANDS}\r
        onCustomized={(e) => (s.saved = e.customization)}\r
        onCustomMenuOpening={(e) => {\r
          if (e.path) e.items.push({ text: 'Show the path', beginGroup: true, click: () => (s.told = \`Path: \${e.path}\`) });\r
        }}\r
      />\r
      <output class="mb-custom-told">{() => s.told}</output>\r
      <pre class="mb-custom-saved">{() => JSON.stringify(s.saved ?? {}, null, 2)}</pre>\r
      <Stack orientation="horizontal" gap="sm" wrap>\r
        <Button text="Customize…" variant="outline" onclick={() => bar.openCustomizer()} />\r
        <Button text="Forget the changes" variant="outline" onclick={() => (bar.customization = null)} />\r
        <Button text="Restore the saved changes" variant="outline" onclick={() => (bar.customization = s.saved)} />\r
      </Stack>\r
    </Stack>\r
  );\r
}\r
`,r=`import { reactive, type Component, type ComponentBase } from '@motifx/core';\r
import { ContextMenu, type MenuItem } from '@motifx-community/ui';\r
\r
interface FileRow {\r
  id: number;\r
  name: string;\r
  locked: boolean;\r
  starred: boolean;\r
}\r
\r
const BOX = 'inline-size: 100%; margin: 0; list-style: none; padding: var(--mx-space-4); background: var(--mx-color-bg-card); border: var(--mx-border-width-1) solid var(--mx-color-stroke-card); border-radius: var(--mx-radius-lg)';\r
\r
/** A context menu whose items \`onOpening\` builds for the row of a list it opens on. */\r
export default function FileList() {\r
  const s = reactive({\r
    log: 'Nothing chosen yet.',\r
    files: [\r
      { id: 1, name: 'report.docx', locked: false, starred: true },\r
      { id: 2, name: 'budget.xlsx', locked: true, starred: false },\r
      { id: 3, name: 'photo.png', locked: false, starred: false },\r
    ] as FileRow[],\r
  });\r
  let renamed = 0;\r
  let list: Component<HTMLUListElement> | null = null;\r
\r
  const did = (what: string) => (s.log = what);\r
  const rename = (row: FileRow) => {\r
    row.name = \`copy-\${++renamed}-\${row.name}\`;\r
    did(\`Renamed to \${row.name}\`);\r
  };\r
\r
  const rowItems = (row: FileRow): MenuItem[] => [\r
    { text: '&Open', click: () => did(\`Open \${row.name}\`) },\r
    { text: '&Rename', enabled: !row.locked, click: () => rename(row) },\r
    { text: '&Star', checked: row.starred, click: () => (row.starred = !row.starred) },\r
    { text: '&Move to', items: ['Documents', 'Pictures', 'Archive'].map((folder) => ({ text: folder, click: () => did(\`Move \${row.name} to \${folder}\`) })) },\r
    { text: '&Delete', shortcut: 'Del', beginGroup: true, enabled: !row.locked, click: () => (s.files = s.files.filter((f) => f !== row)) },\r
  ];\r
\r
  const rowOf = (part: ComponentBase) => {\r
    let id: string | null = null;\r
    for (let at: ComponentBase | null = part; at && !id; at = at.parent) id = at.attr.get('data-id');\r
    return s.files.find((f) => f.id === Number(id));\r
  };\r
\r
  return (\r
    <>\r
      <ul class="cm-list" aria-label="Files" ref={(c: Component<HTMLUListElement>) => (list = c)} style={BOX}>\r
        {s.files.map((file) => (\r
          <li key={file.id} data-id={String(file.id)} tabindex="0" style="padding-block: var(--mx-space-2)">\r
            {() => \`\${file.starred ? '★ ' : ''}\${file.name}\${file.locked ? ' (locked)' : ''}\`}\r
          </li>\r
        ))}\r
      </ul>\r
      <ContextMenu\r
        target={() => list}\r
        label="File"\r
        onOpening={(e) => {\r
          const row = rowOf(e.part);\r
          if (row) e.items = rowItems(row);\r
          else e.cancel = true;\r
        }}\r
      />\r
      <output class="cm-log">{() => s.log}</output>\r
    </>\r
  );\r
}\r
`,i=`import { reactive, type Component } from '@motifx/core';\r
import { CheckBox, MenuBar, Stack, type MenuItem } from '@motifx-community/ui';\r
\r
/** An application menu bar created with \`new\`: submenus, check and radio items, shortcuts, access keys and \`onItemClick\`. */\r
export default function MainMenu() {\r
  const s = reactive({\r
    log: 'Nothing chosen yet.',\r
    chosen: 0,\r
    wrap: true,\r
    statusBar: false,\r
    zoom: '100%',\r
    theme: 'light',\r
    f10: false,\r
    canUndo: true,\r
  });\r
\r
  const did = (what: string) => (s.log = what);\r
  const undo = (back: boolean) => {\r
    s.canUndo = !back;\r
    did(back ? 'Undo' : 'Redo');\r
  };\r
  const zoom = (value: string): MenuItem => ({ text: value, group: 'zoom', checked: () => s.zoom === value, click: () => (s.zoom = value) });\r
  const theme = (value: string, text: string): MenuItem => ({ text, group: 'theme', checked: () => s.theme === value, click: () => (s.theme = value) });\r
\r
  const menus: MenuItem[] = [\r
    {\r
      text: '&File',\r
      items: [\r
        { text: '&New', shortcut: 'Ctrl+N', click: () => did('New') },\r
        { text: '&Open…', shortcut: 'Ctrl+O', click: () => did('Open…') },\r
        { text: 'Open &recent', items: ['report.docx', 'budget.xlsx', 'notes.md'].map((name) => ({ text: name, click: () => did(\`Open \${name}\`) })) },\r
        { text: '&Save', shortcut: 'Ctrl+S', beginGroup: true, click: () => did('Save') },\r
        { text: 'Save &as…', click: () => did('Save as…') },\r
        { text: 'E&xit', beginGroup: true, click: () => did('Exit') },\r
      ],\r
    },\r
    {\r
      text: '&Edit',\r
      items: [\r
        { text: '&Undo', shortcut: 'Ctrl+Z', enabled: () => s.canUndo, click: () => undo(true) },\r
        { text: '&Redo', shortcut: 'Ctrl+Y', click: () => undo(false) },\r
        { text: 'Cu&t', shortcut: 'Ctrl+X', beginGroup: true, click: () => did('Cut') },\r
        { text: '&Copy', shortcut: 'Ctrl+C', click: () => did('Copy') },\r
        { text: '&Paste', shortcut: 'Ctrl+V', click: () => did('Paste') },\r
        { text: 'Paste &special', enabled: false },\r
      ],\r
    },\r
    {\r
      text: '&View',\r
      items: [\r
        { text: '&Word wrap', checked: () => s.wrap, click: () => (s.wrap = !s.wrap) },\r
        { text: '&Status bar', checked: () => s.statusBar, click: () => (s.statusBar = !s.statusBar) },\r
        { ...zoom('100%'), beginGroup: true },\r
        zoom('125%'),\r
        zoom('150%'),\r
        { text: '&Theme', beginGroup: true, items: [theme('light', 'Light'), theme('dark', 'Dark'), theme('system', 'Same as the system')] },\r
      ],\r
    },\r
    { text: '&Help', items: [{ text: '&About', click: () => did('About') }] },\r
  ];\r
\r
  const bar = new MenuBar({ label: 'Main', items: menus, focusOnF10: () => s.f10 });\r
  bar.onItemClick(() => s.chosen++);\r
\r
  return (\r
    <>\r
      <div style="inline-size: 100%" ref={(c: Component<HTMLDivElement>) => c.controls.add(bar)} />\r
      <Stack orientation="horizontal" wrap align="center">\r
        <CheckBox label="F10 focuses the bar" x-model={() => s.f10} />\r
        <output class="mb-log">{() => s.log}</output>\r
        <output class="mb-count">{() => \`onItemClick ran \${s.chosen} times.\`}</output>\r
      </Stack>\r
      <span class="mb-view">{() => \`Word wrap \${s.wrap ? 'on' : 'off'} · status bar \${s.statusBar ? 'on' : 'off'} · zoom \${s.zoom} · theme \${s.theme}\`}</span>\r
    </>\r
  );\r
}\r
`,a=`import { reactive } from '@motifx/core';\r
import { Button, MenuBar, Stack, type MenuItem } from '@motifx-community/ui';\r
\r
const START: MenuItem[] = [\r
  { key: 'file', text: '&File', items: [{ key: 'new', text: '&New' }, { key: 'save', text: '&Save' }] },\r
  { key: 'edit', text: '&Edit', items: [{ key: 'undo', text: '&Undo' }, { key: 'paste', text: '&Paste' }] },\r
  { key: 'help', text: '&Help', items: [{ key: 'about', text: '&About' }] },\r
];\r
\r
/** Items added, removed, moved and changed by path; the list given is never changed. */\r
export default function MenuChanges() {\r
  const s = reactive({ changes: 0 });\r
  let bar!: MenuBar;\r
\r
  return (\r
    <Stack gap="md">\r
      <MenuBar ref={(b: MenuBar) => (bar = b)} class="mb-changes" label="Changes" items={START} onItemsChanged={() => s.changes++} />\r
      <Stack orientation="horizontal" gap="sm" wrap>\r
        <Button text="Add Print to File" variant="outline" onclick={() => bar.addItem('file', { key: 'print', text: '&Print', shortcut: 'Ctrl+P' })} />\r
        <Button text="Turn Save off" variant="outline" onclick={() => bar.updateItem('file/save', { enabled: false })} />\r
        <Button text="Move Paste to File" variant="outline" onclick={() => bar.moveItem('edit/paste', 0, 'file')} />\r
        <Button text="Move Help first" variant="outline" onclick={() => bar.moveItem('help', 0)} />\r
        <Button text="Remove Edit" variant="outline" onclick={() => bar.removeItem('edit')} />\r
        <Button text="Start again" variant="outline" onclick={() => (bar.items = START)} />\r
      </Stack>\r
      <output class="mb-changes-told">{() => \`\${s.changes} changes\`}</output>\r
    </Stack>\r
  );\r
}\r
`,o=`import { reactive } from '@motifx/core';\r
import { Button, MenuBar, Stack, Switch, TabDocument, TabDocumentManager, TextBox, type MenuItem, type MenuItemClickEventArgs } from '@motifx-community/ui';\r
\r
/**\r
 * Documents of a TabDocumentManager, each with its own bar: the menus of the active document are shown in the app's\r
 * bar, also while the document is in a browser window of its own. The switch merges a bar only while focus is in its\r
 * document.\r
 */\r
export default function MergedDocuments() {\r
  const s = reactive({ told: 'Nothing yet.', focus: false });\r
  const tell = (e: MenuItemClickEventArgs) => (s.told = \`\${String(e.item.text).replace('&', '')} in \${(e.source as MenuBar).label}\`);\r
\r
  const app: MenuItem[] = [\r
    { key: 'file', text: '&File', items: [{ key: 'new', text: '&New' }, { key: 'open', text: '&Open…' }, { key: 'close', text: '&Close', beginGroup: true }] },\r
    { key: 'view', text: '&View', items: [{ key: 'zoom', text: '&Zoom' }] },\r
    { key: 'help', text: '&Help', items: [{ key: 'about', text: '&About' }] },\r
  ];\r
  const documentOf = (title: string, items: MenuItem[], text: string) => () => (\r
    <div class="mb-doc">\r
      <MenuBar label={title} items={items} mergeInto="docs-documents" mergeWhen={() => (s.focus ? 'focus' : 'shown')} onItemClick={tell} />\r
      <p>{text}</p>\r
      <TextBox label={\`\${title} notes\`} />\r
    </div>\r
  );\r
\r
  const docs = new TabDocumentManager({ label: 'Documents with menus' });\r
  docs.element.style.cssText = 'block-size: 18rem; inline-size: 100%';\r
  docs.open(\r
    new TabDocument({\r
      id: 'letter',\r
      title: 'Letter',\r
      content: documentOf('Letter', [{ key: 'format', text: 'F&ormat', mergeAt: { before: 'help' }, items: [{ key: 'bold', text: '&Bold' }, { key: 'italic', text: '&Italic' }] }], 'The letter adds Format.'),\r
    }),\r
  );\r
  docs.open(\r
    new TabDocument({\r
      id: 'photo',\r
      title: 'Photo',\r
      content: documentOf(\r
        'Photo',\r
        [\r
          { key: 'image', text: '&Image', mergeAt: { before: 'help' }, items: [{ key: 'crop', text: '&Crop' }, { key: 'rotate', text: '&Rotate' }] },\r
          { key: 'view', text: '&View', items: [{ key: 'actual', text: '&Actual size' }] },\r
        ],\r
        'The photo adds Image and joins View.',\r
      ),\r
    }),\r
  );\r
\r
  return (\r
    <>\r
      <MenuBar label="Studio" items={app} mergeHost mergeName="docs-documents" onItemClick={tell} />\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Switch label="Merge only while focus is in the document" x-model={() => s.focus} />\r
        <Button\r
          text="Move the active document into a new window"\r
          variant="outline"\r
          enabled={() => !!docs.activeDocument && !docs.activeDocument.browserWindow}\r
          onclick={() => docs.moveToNewWindow(docs.activeDocument!)}\r
        />\r
        <Button text="Bring it back" variant="outline" enabled={() => docs.browserWindows.length > 0} onclick={() => docs.browserWindows.forEach((w) => w.moveToMainWindow())} />\r
      </Stack>\r
      {docs}\r
      <output class="mb-docs-told">{() => s.told}</output>\r
    </>\r
  );\r
}\r
`,s=`import { reactive } from '@motifx/core';\r
import { MenuBar, Stack, Tab, Tabs, type MenuItem, type MenuItemClickEventArgs } from '@motifx-community/ui';\r
\r
/** The app's bar, and a bar in each document: the bar of the document shown merges into the app's. */\r
export default function MergedMenus() {\r
  const s = reactive({ told: 'Nothing yet.' });\r
  const tell = (e: MenuItemClickEventArgs) => (s.told = \`\${String(e.item.text).replace('&', '')} in \${(e.source as MenuBar).label}\`);\r
\r
  const app: MenuItem[] = [\r
    { key: 'file', text: '&File', items: [{ key: 'new', text: '&New' }, { key: 'open', text: '&Open…' }, { key: 'exit', text: 'E&xit', beginGroup: true }] },\r
    { key: 'edit', text: '&Edit', items: [{ key: 'undo', text: '&Undo' }, { key: 'redo', text: '&Redo' }] },\r
    { key: 'window', text: '&Window', items: [{ key: 'split', text: '&Split' }] },\r
    { key: 'help', text: '&Help', items: [{ key: 'about', text: '&About' }] },\r
  ];\r
  const report: MenuItem[] = [\r
    { key: 'file', text: '&File', items: [{ key: 'export', text: 'Export as &PDF', mergeAt: { after: 'open' } }] },\r
    { key: 'format', text: 'F&ormat', mergeAt: { before: 'window' }, items: [{ key: 'bold', text: '&Bold' }, { key: 'italic', text: '&Italic' }] },\r
  ];\r
  const sheet: MenuItem[] = [\r
    { key: 'edit', text: '&Edit', items: [{ key: 'fill', text: '&Fill down', beginGroup: true }] },\r
    { key: 'data', text: '&Data', mergeAt: { before: 'window' }, items: [{ key: 'sort', text: '&Sort' }, { key: 'filter', text: 'F&ilter' }] },\r
    { key: 'window', merge: 'remove', text: 'Window' },\r
  ];\r
\r
  return (\r
    <Stack gap="md">\r
      <MenuBar label="App" items={app} mergeHost mergeName="docs-demo" onItemClick={tell} />\r
      <Tabs label="Documents">\r
        <Tab key="report" title="Report.docx">\r
          <MenuBar class="mb-merge-report" label="Report" items={report} mergeInto="docs-demo" onItemClick={tell} />\r
          <p>The report’s own commands are in the app’s bar while this document is shown.</p>\r
        </Tab>\r
        <Tab key="sheet" title="Budget.xlsx">\r
          <MenuBar class="mb-merge-sheet" label="Budget" items={sheet} mergeInto="docs-demo" onItemClick={tell} />\r
          <p>The budget adds Data, joins Edit and takes Window away.</p>\r
        </Tab>\r
      </Tabs>\r
      <output class="mb-merge-told">{() => s.told}</output>\r
    </Stack>\r
  );\r
}\r
`,c=`import type { Component } from '@motifx/core';\r
import { reactive } from '@motifx/core';\r
import { Button, MenuBar, MxForm, Stack, TextBox, type MenuItem, type MenuItemClickEventArgs } from '@motifx-community/ui';\r
\r
/** A window with its own bar that merges while focus is in the window (\`mergeWhen: 'focus'\`). */\r
export default function MergedWindow() {\r
  const s = reactive({ told: 'Nothing yet.' });\r
  const tell = (e: MenuItemClickEventArgs) => (s.told = \`\${String(e.item.text).replace('&', '')} in \${(e.source as MenuBar).label}\`);\r
  let host: Component<HTMLDivElement> | null = null;\r
  let form: MxForm | null = null;\r
\r
  const app: MenuItem[] = [\r
    { key: 'file', text: '&File', items: [{ key: 'new', text: '&New' }, { key: 'exit', text: 'E&xit', beginGroup: true }] },\r
    { key: 'help', text: '&Help', items: [{ key: 'about', text: '&About' }] },\r
  ];\r
  const notes: MenuItem[] = [\r
    { key: 'file', text: '&File', items: [{ key: 'save', text: '&Save note', mergeAt: { after: 'new' } }] },\r
    { key: 'insert', text: '&Insert', mergeAt: { before: 'help' }, items: [{ key: 'date', text: '&Date' }, { key: 'list', text: '&List' }] },\r
  ];\r
\r
  const open = () => {\r
    if (form && !form.isDisposed) {\r
      form.focus();\r
      return;\r
    }\r
    form = new MxForm({\r
      title: 'Note',\r
      startPosition: 'manual',\r
      left: 120,\r
      top: 160,\r
      width: '22rem',\r
      content: (\r
        <div class="mb-window-note">\r
          <MenuBar label="Note" items={notes} mergeInto="docs-window" mergeWhen="focus" onItemClick={tell} />\r
          <TextBox label="Title" />\r
        </div>\r
      ),\r
    });\r
    form.show(host!);\r
  };\r
\r
  return (\r
    <Stack gap="md" ref={(c: Stack) => (host = c)}>\r
      <MenuBar label="Desk" items={app} mergeHost mergeName="docs-window" onItemClick={tell} />\r
      <Button text="Open the note window" variant="outline" onclick={open} />\r
      <p tabIndex={0} class="mb-window-page">Focus in the window shows its menus in the bar above; click here and they go back.</p>\r
      <output class="mb-window-told">{() => s.told}</output>\r
    </Stack>\r
  );\r
}\r
`;export{i as a,t as c,a as i,e as l,s as n,r as o,o as r,n as s,c as t};