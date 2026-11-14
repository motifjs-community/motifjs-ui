var e=`import { reactive } from '@motifx/core';\r
import { TabDocumentManager } from '@motifx-community/ui';\r
import { FILES, fileDocument } from './files';\r
\r
/**\r
 * Two managers with the same \`dragGroup\` take each other's tabs and groups. The content moves with\r
 * its tab, it is not recreated, so an edit in a moved tab is preserved.\r
 */\r
export default function BetweenManagers() {\r
  const s = reactive({ last: 'Drag a tab from one manager to the other.' });\r
  const style = 'block-size: 28rem; flex: 1 1 0px; min-inline-size: 0';\r
  // Narrow side by side, they still show as on a desktop (see the Tablet and phone page).\r
  const left = new TabDocumentManager({ label: 'Project files', dragGroup: 'files', presentation: 'desktop' });\r
  const right = new TabDocumentManager({ label: 'Pinned files', dragGroup: 'files', presentation: 'desktop' });\r
  left.element.style.cssText = style;\r
  right.element.style.cssText = style;\r
  for (const file of FILES.slice(0, 5)) left.open(fileDocument(file.path), { index: 99 });\r
  for (const file of FILES.slice(5)) right.open(fileDocument(file.path), { index: 99 });\r
  for (const docs of [left, right]) {\r
    docs.onOpened((e) => {\r
      if (e.byUser) s.last = \`\${e.document.title} came into \${docs.label}\`;\r
    });\r
  }\r
\r
  return (\r
    <>\r
      <div style="display: flex; gap: var(--mx-space-3); inline-size: 100%">\r
        {left}\r
        {right}\r
      </div>\r
      <output class="td-state">{() => s.last}</output>\r
    </>\r
  );\r
}\r
`,t=`import { reactive } from '@motifx/core';\r
import { Button, Stack, Switch, TabDocumentManager } from '@motifx-community/ui';\r
import { FILES, fileDocument } from './files';\r
import { explorer, outline, output, problems, toolDocument } from './tools';\r
\r
/**\r
 * The bars of dock areas and floating windows are compact: tabs shrink before the strip scrolls, a\r
 * single document shows as a title, and only the pin and the close button (a window's own close\r
 * button) stay beside one "…" menu. Each part is a setting for every area and window, and an area\r
 * may have its own.\r
 */\r
export default function CompactBars() {\r
  const s = reactive({ compact: true, small: true, scroll: false, title: true, shrink: true, leftScroll: false });\r
  const docs = new TabDocumentManager({\r
    label: 'Files with compact tool bars',\r
    minGroupWidth: 120,\r
    dockAreaSize: { left: 230, bottom: 130 },\r
    compactBarButtons: () => (s.compact ? 'auto' : 'all'),\r
    compactBarButtonSize: () => (s.small ? 'small' : 'normal'),\r
    compactScrollButtons: () => s.scroll,\r
    compactSingleTabTitle: () => s.title,\r
    compactTabSize: () => (s.shrink ? 'shrink' : 'fit'),\r
  });\r
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';\r
  const open = (path: string) => docs.open(docs.findDocument(path) ?? fileDocument(path), { focus: true });\r
  for (const file of FILES.slice(0, 3)) docs.open(fileDocument(file.path), { index: 99 });\r
  docs.dock(\r
    toolDocument('explorer', 'Explorer', () => explorer(open)),\r
    'left',\r
  );\r
  docs.dock(toolDocument('outline', 'Outline', outline), 'left');\r
  docs.dock(toolDocument('problems', 'Problems', problems), 'left');\r
  docs.dock(toolDocument('output', 'Output', output), 'bottom');\r
  // This area's own setting takes precedence over the manager's (null returns to the manager's).\r
  docs.dockArea('left')!.scrollButtons = () => (s.leftScroll ? true : null);\r
  const float = () => {\r
    const doc = docs.findDocument('README.md') ?? docs.open(fileDocument('README.md'))!;\r
    const box = docs.element.getBoundingClientRect();\r
    docs.float(doc, { x: box.right - 340, y: box.top + 60, width: 300, height: 200 });\r
  };\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center" gap="lg">\r
        <Switch label="Compact bars" x-model={() => s.compact} />\r
        <Switch label="Small buttons" x-model={() => s.small} />\r
        <Switch label="Scroll buttons" x-model={() => s.scroll} />\r
        <Switch label="One document as a title" x-model={() => s.title} />\r
        <Switch label="Tabs shrink" x-model={() => s.shrink} />\r
        <Switch label="Left area: scroll buttons" x-model={() => s.leftScroll} />\r
        <Button text="Float README.md" variant="outline" onclick={float} />\r
      </Stack>\r
      {docs}\r
    </>\r
  );\r
}\r
`,n=`import { reactive } from '@motifx/core';\r
import { Stack, Switch, TabDocumentManager } from '@motifx-community/ui';\r
import { FILES, fileDocument, source } from './files';\r
\r
/**\r
 * Right-click a tab (or press Shift+F10 on it) for its menu, and the empty strip for the group's.\r
 * \`onContextMenuOpening\` adds an item for files, and a double-click on the empty strip creates a new file.\r
 */\r
export default function ContextMenus() {\r
  const s = reactive({ menus: true, copy: true, split: true, made: 0, said: '' });\r
  const docs = new TabDocumentManager({\r
    label: 'Files with menus',\r
    contextMenu: () => s.menus,\r
    menuItems: () => ({ copyTitle: s.copy, splitUp: s.split, splitDown: s.split, splitLeft: s.split, splitRight: s.split }),\r
    newDocument: () => {\r
      const n = ++s.made;\r
      return { id: \`untitled-\${n}\`, title: \`Untitled-\${n}\`, content: () => source('') };\r
    },\r
  });\r
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';\r
  docs.onContextMenuOpening((e) => {\r
    const doc = e.document;\r
    if (doc?.type !== 'file') return;\r
    e.items.push({ text: 'Show the path', beginGroup: true, click: () => (s.said = String(doc.id)) });\r
  });\r
  for (const file of FILES.slice(0, 4)) docs.open(fileDocument(file.path), { index: 99 });\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center" gap="lg">\r
        <Switch label="Context menus" x-model={() => s.menus} />\r
        <Switch label="Copy the title" x-model={() => s.copy} />\r
        <Switch label="Split items" x-model={() => s.split} />\r
        <output class="td-state">{() => (s.said ? \`path: \${s.said}\` : 'Right-click a tab, or the strip after the tabs')}</output>\r
      </Stack>\r
      {docs}\r
    </>\r
  );\r
}\r
`,r=`import { reactive } from '@motifx/core';\r
import { TabDocumentManager } from '@motifx-community/ui';\r
import { FILES, fileDocument } from './files';\r
import { explorer, outline, output, problems, toolDocument } from './tools';\r
\r
/**\r
 * A code editor's layout: the files in the middle, the explorer and the outline folded at the left\r
 * edge (point at a title, or click it), problems and output docked at the bottom. Drag a tab or a\r
 * group: guides show over the group under the pointer and at the edges; let go away from them to\r
 * float it in a window of its own. The close button of an area hides its tool (a tool cannot\r
 * close): "Show hidden" in the strip's menu or the "…" menu brings it back where it was.\r
 */\r
export default function DockIde() {\r
  const s = reactive({ last: 'Drag a tab: the guides show where it can go.' });\r
  const docs = new TabDocumentManager({ label: 'Editor with tool areas', dockGuides: true, minGroupWidth: 120, dockAreaSize: { left: 220, bottom: 150 } });\r
  docs.element.style.cssText = 'block-size: 30rem; inline-size: 100%';\r
  const open = (path: string) => docs.open(docs.findDocument(path) ?? fileDocument(path), { focus: true });\r
  for (const file of FILES.slice(0, 3)) docs.open(fileDocument(file.path), { index: 99 });\r
  docs.dock(\r
    toolDocument('explorer', 'Explorer', () => explorer(open)),\r
    'left',\r
  );\r
  docs.dock(toolDocument('outline', 'Outline', outline), 'left');\r
  docs.dock(toolDocument('problems', 'Problems', problems), 'bottom');\r
  docs.dock(toolDocument('output', 'Output', output), 'bottom');\r
  docs.autoHide(docs.dockArea('left')!);\r
  docs.onFloated((e) => (s.last = \`\${e.document?.title ?? 'A group'} floats in a window.\`));\r
  docs.onDocked((e) => (s.last = \`\${e.document?.title ?? 'A group'} docked \${e.side ? \`on the \${e.side}\` : 'among the documents'}.\`));\r
  docs.onAutoHidden((e) => (s.last = \`The \${e.area.side} area \${e.on ? 'is folded to its edge' : 'is shown'}.\`));\r
  docs.onHidden((e) => (s.last = \`\${e.document.title} is hidden: "Show hidden" in the "…" menu brings it back.\`));\r
  docs.onShown((e) => (s.last = \`\${e.document.title} is back\${e.group.dockArea ? \` on the \${e.group.dockArea.side}\` : ''}.\`));\r
\r
  return (\r
    <>\r
      {docs}\r
      <output class="td-state">{() => s.last}</output>\r
    </>\r
  );\r
}\r
`,i=`import { reactive } from '@motifx/core';\r
import { RadioGroup, Stack, Switch, TabDocumentManager, type TabDockSide } from '@motifx-community/ui';\r
import { FILES, fileDocument } from './files';\r
import { problems, toolDocument } from './tools';\r
\r
const SIDES: Record<string, readonly TabDockSide[]> = {\r
  all: ['left', 'right', 'top', 'bottom'],\r
  sides: ['left', 'right'],\r
  bottom: ['bottom'],\r
};\r
\r
/** Every part of docking and floating is a setting, live; package.json may not float, README.md docks only at the bottom. */\r
export default function DockOptions() {\r
  const s = reactive({ guides: true, float: true, dock: true, autoHide: true, inView: true, emptyWindows: true, hover: true, sides: 'all' });\r
  const docs = new TabDocumentManager({\r
    label: 'Files with dock settings',\r
    dockGuides: () => s.guides,\r
    allowFloat: () => s.float,\r
    allowDock: () => s.dock,\r
    allowAutoHide: () => s.autoHide,\r
    keepFloatingInView: () => s.inView,\r
    closeEmptyWindows: () => s.emptyWindows,\r
    autoHideHover: () => s.hover,\r
    dockSides: () => SIDES[s.sides],\r
  });\r
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';\r
  for (const file of FILES.slice(4)) {\r
    const extra = file.path === 'package.json' ? { allowFloat: false } : file.path === 'README.md' ? { dockSides: ['bottom'] as TabDockSide[] } : {};\r
    docs.open(fileDocument(file.path, extra), { index: 99 });\r
  }\r
  docs.dock(toolDocument('problems', 'Problems', problems), 'right', 200);\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center" gap="lg">\r
        <Switch label="Dock guides" x-model={() => s.guides} />\r
        <Switch label="Float" x-model={() => s.float} />\r
        <Switch label="Dock" x-model={() => s.dock} />\r
        <Switch label="Auto hide" x-model={() => s.autoHide} />\r
        <Switch label="Windows stay in view" x-model={() => s.inView} />\r
        <Switch label="Close empty windows" x-model={() => s.emptyWindows} />\r
        <Switch label="Slide out on hover" x-model={() => s.hover} />\r
      </Stack>\r
      <RadioGroup\r
        label="Dock areas"\r
        orientation="horizontal"\r
        items={[\r
          { value: 'all', text: 'All four sides' },\r
          { value: 'sides', text: 'Left and right' },\r
          { value: 'bottom', text: 'Bottom only' },\r
        ]}\r
        itemText="text"\r
        itemValue="value"\r
        x-model={() => s.sides}\r
      />\r
      {docs}\r
    </>\r
  );\r
}\r
`,a=`import { reactive } from '@motifx/core';\r
import { Button, Stack, TabDocument, TabDocumentManager, type TabLayout, type TabLayoutDocument } from '@motifx-community/ui';\r
import { notes } from './contents';\r
import { fileDocument } from './files';\r
import { output, problems, toolDocument } from './tools';\r
\r
/** Recreates a saved document by its type. */\r
function restore(saved: TabLayoutDocument): TabDocument {\r
  if (saved.type === 'file') return fileDocument(saved.id);\r
  if (saved.type === 'tool') return toolDocument(saved.id, saved.title, saved.id === 'output' ? output : problems);\r
  return new TabDocument({ ...saved, content: () => notes(saved.title) });\r
}\r
\r
/** The whole layout as JSON: the documents, the dock areas (size, order, folded) and the floating windows (place, order, inside). */\r
export default function DockSaveRestore() {\r
  const s = reactive({ json: '', saved: null as TabLayout | null });\r
  const docs = new TabDocumentManager({ label: 'Saved layout with windows and areas', dockGuides: true });\r
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';\r
  docs.open(restore({ id: 'src/app.ts', type: 'file', title: 'app.ts' }));\r
  docs.open(restore({ id: 'notes', type: 'notes', title: 'Notes' }));\r
  docs.dock(restore({ id: 'problems', type: 'tool', title: 'Problems' }), 'bottom', 140);\r
  docs.dock(restore({ id: 'output', type: 'tool', title: 'Output' }), 'right', '30%');\r
\r
  const save = () => {\r
    s.saved = docs.saveLayout();\r
    s.json = JSON.stringify(s.saved, null, 2);\r
  };\r
  const load = () => {\r
    if (s.saved) docs.loadLayout(s.saved, restore);\r
  };\r
  save();\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Button text="Save layout" variant="outline" onclick={save} />\r
        <Button text="Restore layout" variant="outline" enabled={() => !!s.saved} onclick={load} />\r
        <Button text="Float Notes" variant="outline" onclick={() => docs.float(docs.findDocument('notes')!, { x: 120, y: 140, width: 380, height: 260 })} />\r
      </Stack>\r
      {docs}\r
      <pre class="td-json" tabindex="0" aria-label="The saved layout" style="max-block-size: 14rem; overflow: auto; inline-size: 100%">\r
        {() => s.json}\r
      </pre>\r
    </>\r
  );\r
}\r
`,o=`import { reactive } from '@motifx/core';\r
import { TabDocumentManager, type TabDroppedEventArgs } from '@motifx-community/ui';\r
import { FILES, fileDocument } from './files';\r
\r
/** What a drop did, in a few words. */\r
function describe(e: TabDroppedEventArgs): string {\r
  const what = e.document?.title ?? 'a group';\r
  const where = e.target === 'strip' ? \`place \${e.index + 1} of a strip\` : e.target === 'edge' ? \`the \${e.side} edge\` : e.side === 'center' ? 'a group' : \`the \${e.side} of a group\`;\r
  return \`\${what} \${e.copy ? 'copied' : 'moved'} to \${where}\`;\r
}\r
\r
/**\r
 * Drag a tab along its strip, onto another strip, into a group (the middle of its content) or\r
 * beside it (an edge), or along an edge of the whole layout. Drag a group by the empty part of its\r
 * bar or by its handle. Hold Ctrl (Option on a Mac) while dropping for a copy; Escape puts everything back.\r
 */\r
export default function DragDrop() {\r
  const s = reactive({ last: 'Drag a tab, or a group by its handle.' });\r
  // Narrow groups, for the narrow column of this page; a handle drags a group whose tabs fill its bar.\r
  const docs = new TabDocumentManager({ label: 'Files to drag', allowDuplicate: true, minGroupWidth: 100, groupDragHandle: true });\r
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';\r
  for (const file of FILES.slice(0, 4)) docs.open(fileDocument(file.path), { index: 99 });\r
  const right = docs.split(docs.activeGroup!, 'right')!;\r
  for (const file of FILES.slice(4, 6)) right.open(fileDocument(file.path), { index: 99 });\r
  const below = docs.split(right, 'down')!;\r
  for (const file of FILES.slice(6)) below.open(fileDocument(file.path), { index: 99 });\r
  docs.onDropped((e) => (s.last = describe(e)));\r
  docs.onDragEnded((e) => {\r
    if (!e.dropped) s.last = 'Nothing moved.';\r
  });\r
\r
  return (\r
    <>\r
      {docs}\r
      <output class="td-state">{() => s.last}</output>\r
    </>\r
  );\r
}\r
`,s=`import { reactive } from '@motifx/core';\r
import { RadioGroup, Stack, Switch, TabDocumentManager, type TabDropSide } from '@motifx-community/ui';\r
import { FILES, fileDocument } from './files';\r
\r
const SIDES: Record<string, readonly TabDropSide[]> = {\r
  all: ['center', 'left', 'right', 'up', 'down'],\r
  sides: ['left', 'right'],\r
  center: ['center'],\r
};\r
\r
/** Every part of drag and drop is a setting, live; a group can take no drops at all. */\r
export default function DragOptions() {\r
  const s = reactive({ allowDrag: true, allowDragGroups: true, pinOnDrag: true, layoutEdgeDrop: true, hover: true, ghost: true, sides: 'all', closed: false });\r
  const docs = new TabDocumentManager({\r
    label: 'Files with drag settings',\r
    allowDrag: () => s.allowDrag,\r
    allowDragGroups: () => s.allowDragGroups,\r
    pinOnDrag: () => s.pinOnDrag,\r
    layoutEdgeDrop: () => s.layoutEdgeDrop,\r
    dragHoverActivate: () => s.hover,\r
    dragGhost: () => s.ghost,\r
    dropSides: () => SIDES[s.sides],\r
  });\r
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';\r
  FILES.slice(0, 5).forEach((file, i) => docs.open(fileDocument(file.path), { index: 99, pinned: i < 2 }));\r
  const second = docs.split(docs.activeGroup!, 'right')!;\r
  for (const file of FILES.slice(5)) second.open(fileDocument(file.path), { index: 99 });\r
  second.allowDrop = () => !s.closed;\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center" gap="lg">\r
        <Switch label="Drag tabs" x-model={() => s.allowDrag} />\r
        <Switch label="Drag groups" x-model={() => s.allowDragGroups} />\r
        <Switch label="Pin across the border" x-model={() => s.pinOnDrag} />\r
        <Switch label="Layout edges" x-model={() => s.layoutEdgeDrop} />\r
        <Switch label="Activate on hover" x-model={() => s.hover} />\r
        <Switch label="Copy under the pointer" x-model={() => s.ghost} />\r
        <Switch label="Group 2 takes nothing" x-model={() => s.closed} />\r
      </Stack>\r
      <RadioGroup\r
        label="Drops on a group"\r
        orientation="horizontal"\r
        items={[\r
          { value: 'all', text: 'Centre and edges' },\r
          { value: 'sides', text: 'Left and right only' },\r
          { value: 'center', text: 'Centre only' },\r
        ]}\r
        itemText="text"\r
        itemValue="value"\r
        x-model={() => s.sides}\r
      />\r
      {docs}\r
    </>\r
  );\r
}\r
`,c=`import { reactive } from '@motifx/core';\r
import { Button, Stack, Switch, TabDocument, TabDocumentManager } from '@motifx-community/ui';\r
import { customerForm } from './contents';\r
\r
/**\r
 * One customer open in two groups: each copy has a form of its own over the same data, and both\r
 * tabs follow the title and the unsaved changes. Splitting copies the document; turned off, it moves.\r
 */\r
export default function Duplicates() {\r
  const s = reactive({ allow: true });\r
  const saved = reactive({ name: 'Ada Lovelace', email: 'ada@example.com', city: 'London' });\r
  const ada = reactive({ ...saved });\r
  const docs = new TabDocumentManager({ label: 'Two copies', allowDuplicate: () => s.allow });\r
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';\r
  const doc = docs.open(\r
    new TabDocument({\r
      id: 'ada',\r
      type: 'customer',\r
      title: () => ada.name || 'New customer',\r
      dirty: () => ada.name !== saved.name || ada.email !== saved.email || ada.city !== saved.city,\r
      content: () => customerForm(ada),\r
    }),\r
  )!;\r
  docs.split(docs.groups[0], 'right', doc);\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Switch label="Allow two copies" x-model={() => s.allow} />\r
        <Button text="Split the active group" variant="outline" onclick={() => docs.activeGroup && docs.split(docs.activeGroup, 'down', docs.activeDocument ?? undefined)} />\r
        <Button text="Save" variant="outline" enabled={() => doc.dirty} onclick={() => Object.assign(saved, { ...ada })} />\r
        <output class="td-state">{() => \`\${docs.documents.length} tab(s) for \${new Set(docs.documents.map((d) => d.id)).size} document(s)\`}</output>\r
      </Stack>\r
      {docs}\r
    </>\r
  );\r
}\r
`,l=`import { Button, Stack, TabDocumentManager } from '@motifx-community/ui';\r
import { FILES, fileDocument } from './files';\r
\r
/** Floating windows by code: float a document, move, resize and maximize its window, dock it back or to a side, close it. */\r
export default function FloatProgrammatically() {\r
  const docs = new TabDocumentManager({ label: 'Files to float' });\r
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';\r
  for (const file of FILES.slice(0, 5)) docs.open(fileDocument(file.path), { index: 99 });\r
  const readme = () => docs.findDocument('README.md') ?? docs.open(fileDocument('README.md'))!;\r
  // The manager's own lists are reactive: the window shown is the one in front.\r
  const front = () => docs.floatingWindows.at(-1) ?? null;\r
  const rect = () => {\r
    const w = front();\r
    if (!w) return 'No floating window.';\r
    const r = w.rect;\r
    return \`Window at \${r.x}, \${r.y}, \${r.width} × \${r.height}\${w.isMaximized ? ', maximized' : ''}.\`;\r
  };\r
  const on = () => !!front();\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Button text="Float README.md" variant="outline" enabled={() => !front()} onclick={() => docs.float(readme(), { x: 80, y: 120, width: 420, height: 280 })} />\r
        <Button text="Move" variant="outline" enabled={on} onclick={() => front()?.move(front()!.rect.x + 40, front()!.rect.y + 20)} />\r
        <Button text="Wider" variant="outline" enabled={on} onclick={() => front()?.resize(front()!.rect.width + 60, front()!.rect.height)} />\r
        <Button text="Maximize or restore" variant="outline" enabled={on} onclick={() => (front()?.isMaximized ? front()?.restore() : front()?.maximize())} />\r
        <Button text="Dock back" variant="outline" enabled={on} onclick={() => front()?.dock()} />\r
        <Button text="Dock right" variant="outline" enabled={on} onclick={() => front()?.dock('right', '35%')} />\r
        <Button text="Close window" variant="outline" enabled={on} onclick={() => void front()?.close()} />\r
      </Stack>\r
      {docs}\r
      <output class="td-state">{() => rect()}</output>\r
    </>\r
  );\r
}\r
`,u=`import { reactive, type Component } from '@motifx/core';\r
import { Button, Stack, TabDocumentManager } from '@motifx-community/ui';\r
import { FILES, fileDocument, source } from './files';\r
import { problems, toolDocument } from './tools';\r
\r
/**\r
 * A manager that follows its own width (\`presentation: 'auto'\`): drag the frame's corner, or pick a\r
 * width. Under 560 pixels it shows as on a phone; under 1024 as on a tablet when the screen is a touch\r
 * screen (with a mouse it stays a desktop). A text and a scroll position are kept across every change:\r
 * the content moves and is never recreated.\r
 */\r
export default function FollowsWidth() {\r
  const s = reactive({ shown: '', typed: '' });\r
  let frame!: Component<HTMLDivElement>;\r
  const docs = new TabDocumentManager({ label: 'Editor that follows its width' });\r
  docs.element.style.cssText = 'block-size: 100%; inline-size: 100%';\r
  docs.open(\r
    { id: 'note', title: 'Note', content: () => <textarea aria-label="Note" style="display: block; box-sizing: border-box; inline-size: 100%; block-size: 100%; padding: var(--mx-space-3); font: inherit; border: 0; resize: none" x-model={() => s.typed} /> },\r
    { index: 99 },\r
  );\r
  for (const file of FILES.slice(0, 4)) docs.open(fileDocument(file.path), { index: 99 });\r
  // A long one: a plain swipe over it scrolls it, on a phone too.\r
  docs.open({ id: 'log', title: 'Build log', content: () => source(Array.from({ length: 80 }, (_, i) => \`\${String(i + 1).padStart(3, ' ')}  step \${i + 1} done\`).join('\\n')) }, { index: 99 });\r
  docs.split(docs.activeGroup!, 'right', docs.findDocument('src/orders/index.ts')!);\r
  docs.dock(toolDocument('problems', 'Problems', problems), 'bottom');\r
  docs.activate(docs.findDocument('note')!);\r
  docs.onPresentationChanged((e) => (s.shown = \`\${e.to} at \${e.width} px\`));\r
  const width = (px: string) => (frame.element.style.inlineSize = px);\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Button text="390 px" variant="outline" onclick={() => width('390px')} />\r
        <Button text="720 px" variant="outline" onclick={() => width('720px')} />\r
        <Button text="Full width" variant="outline" onclick={() => width('100%')} />\r
        <output class="td-state">{() => s.shown || \`Shown as: \${docs.currentPresentation}\`}</output>\r
      </Stack>\r
      <div\r
        ref={(c: Component<HTMLDivElement>) => (frame = c)}\r
        class="td-frame"\r
        style="box-sizing: border-box; inline-size: 100%; max-inline-size: 100%; min-inline-size: 18rem; block-size: 30rem; overflow: hidden; resize: horizontal; border: var(--mx-border-width-1) solid var(--mx-color-stroke-card); border-radius: var(--mx-radius-lg)"\r
      >\r
        {docs}\r
      </div>\r
    </>\r
  );\r
}\r
`,d=`import { reactive } from '@motifx/core';\r
import { Button, Stack, TabDocumentManager } from '@motifx-community/ui';\r
import { notes } from './contents';\r
\r
/** A locked group keeps what it has: documents opened without naming a group go elsewhere, into a new group when every one is locked. */\r
export default function Locked() {\r
  const s = reactive({ opened: 0, log: [] as { id: number; text: string }[] });\r
  const docs = new TabDocumentManager({ label: 'Notes and a terminal' });\r
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';\r
  const write = (text: string) => s.log.unshift({ id: s.log.length, text });\r
  docs.onLocked((e) => write(\`group \${e.group.index + 1} locked\`));\r
  docs.onUnlocked((e) => write(\`group \${e.group.index + 1} unlocked\`));\r
  docs.onOpened((e) => write(\`\${e.document.title} opened in group \${e.group.index + 1}\`));\r
  docs.open({ id: 'terminal', title: 'Terminal', content: () => notes('Terminal') });\r
  docs.lock(docs.groups[0]);\r
  docs.split(docs.groups[0], 'right');\r
\r
  const open = () => {\r
    const n = ++s.opened;\r
    docs.open({ id: \`note-\${n}\`, title: \`Note \${n}\`, content: () => notes(\`Note \${n}\`) });\r
  };\r
  const toggle = (index: number) => {\r
    const group = docs.groups[index];\r
    if (group) (group.locked ? docs.unlock(group) : docs.lock(group));\r
  };\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Button text="Open a note" variant="outline" onclick={open} />\r
        <Button text={() => (docs.groups[0]?.locked ? 'Unlock group 1' : 'Lock group 1')} variant="outline" onclick={() => toggle(0)} />\r
        <Button text={() => (docs.groups[1]?.locked ? 'Unlock group 2' : 'Lock group 2')} variant="outline" enabled={() => docs.groups.length > 1} onclick={() => toggle(1)} />\r
        <output class="td-state">{() => s.log.slice(0, 3).map((l) => l.text).join('; ')}</output>\r
      </Stack>\r
      {docs}\r
    </>\r
  );\r
}\r
`,f=`import { reactive } from '@motifx/core';\r
import { Button, RadioGroup, Stack, TabDocument, TabDocumentManager, type TabShowDescription } from '@motifx-community/ui';\r
import { notes } from './contents';\r
import { fileDocument } from './files';\r
\r
/** A count or a dot on the tab, a color for what the document needs, and a description only where two titles are the same. */\r
export default function Look() {\r
  const s = reactive({ unread: 3, errors: 1, description: 'duplicates' as TabShowDescription });\r
  const docs = new TabDocumentManager({ label: 'Badges and tones', showDescription: () => s.description });\r
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';\r
  docs.open(new TabDocument({ id: 'inbox', title: 'Inbox', badge: () => s.unread || null, tone: () => (s.unread ? 'accent' : null), content: () => notes('Inbox') }));\r
  docs.open(new TabDocument({ id: 'build', title: 'Build', badge: () => s.errors || null, tone: () => (s.errors ? 'danger' : 'success'), content: () => notes('Build') }), { index: 99 });\r
  docs.open(new TabDocument({ id: 'quota', title: 'Quota', badge: true, tone: 'warning', content: () => notes('Quota') }), { index: 99 });\r
  docs.open(fileDocument('src/index.ts'), { index: 99 });\r
  docs.open(fileDocument('src/orders/index.ts'), { index: 99 });\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center" gap="lg">\r
        <Button text="New mail" variant="outline" onclick={() => s.unread++} />\r
        <Button text="Read all" variant="outline" onclick={() => (s.unread = 0)} />\r
        <Button text={() => (s.errors ? 'Fix the build' : 'Break the build')} variant="outline" onclick={() => (s.errors = s.errors ? 0 : 2)} />\r
        <RadioGroup\r
          label="Description"\r
          orientation="horizontal"\r
          items={[\r
            { value: 'duplicates', text: 'Same titles' },\r
            { value: 'always', text: 'Always' },\r
            { value: 'never', text: 'Never' },\r
          ]}\r
          itemText="text"\r
          itemValue="value"\r
          x-model={() => s.description}\r
        />\r
      </Stack>\r
      {docs}\r
    </>\r
  );\r
}\r
`,p=`import { reactive } from '@motifx/core';\r
import { Button, Stack, TabDocumentManager } from '@motifx-community/ui';\r
import { FILES, fileDocument } from './files';\r
\r
/**\r
 * "Move to…" (the tab's menu, Ctrl+K M, or these buttons): the arrow keys choose a side of a group,\r
 * an arrow towards it again goes on to the next group, Tab picks the next group, Enter moves,\r
 * Escape leaves it. The same areas as a drag show where it goes.\r
 */\r
export default function MoveWithKeys() {\r
  const s = reactive({ place: 'Press a button, or Ctrl+K M on a tab.' });\r
  const docs = new TabDocumentManager({ label: 'Files to move with keys' });\r
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';\r
  for (const file of FILES.slice(0, 4)) docs.open(fileDocument(file.path), { index: 99 });\r
  const right = docs.split(docs.activeGroup!, 'right')!;\r
  for (const file of FILES.slice(4)) right.open(fileDocument(file.path), { index: 99 });\r
  docs.onDragOver((e) => {\r
    if (e.byKeyboard) s.place = e.target === 'edge' ? \`the \${e.side} edge of the layout\` : \`group \${(e.group?.index ?? 0) + 1}, \${e.side}\`;\r
  });\r
  docs.onDragEnded((e) => (s.place = e.dropped ? 'Moved.' : 'Left where it was.'));\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Button text="Move to…" variant="outline" enabled={() => !!docs.activeDocument} onclick={() => docs.showMoveTo(docs.activeDocument!)} />\r
        <Button text="Move group to…" variant="outline" enabled={() => docs.groups.length > 1} onclick={() => docs.showMoveTo(docs.activeGroup!)} />\r
        <output class="td-state">{() => s.place}</output>\r
      </Stack>\r
      {docs}\r
    </>\r
  );\r
}\r
`,m=`import { reactive } from '@motifx/core';\r
import { Button, Stack, TabDocument, TabDocumentManager } from '@motifx-community/ui';\r
import { customerCard, notes, ordersGrid } from './contents';\r
\r
/** A document moves into a browser window of its own and back; what was typed, chosen and scrolled stays as it was. */\r
export default function NewWindow() {\r
  const customer = reactive({ name: 'Ada Lovelace', email: 'ada@example.com', city: 'London' });\r
  const docs = new TabDocumentManager({ label: 'Documents in new windows' });\r
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';\r
  docs.open(new TabDocument({ id: 'customer', title: 'Customer', tooltip: () => \`Customer: \${customer.name}\`, content: () => customerCard(customer) }));\r
  docs.open(new TabDocument({ id: 'orders', title: 'Orders', content: () => ordersGrid(60) }));\r
  docs.open(new TabDocument({ id: 'notes', title: 'Notes', content: () => notes('Notes') }));\r
\r
  const active = () => docs.activeDocument;\r
  const windows = () => {\r
    const list = docs.browserWindows;\r
    if (!list.length) return 'Every document is in this window.';\r
    return list.map((w, i) => \`Window \${i + 1}: \${w.documents.map((d) => d.title).join(', ')}\`).join('. ') + '.';\r
  };\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Button text="Move the active document into a new window" variant="outline" enabled={() => !!active() && !active()!.browserWindow} onclick={() => docs.moveToNewWindow(active()!)} />\r
        <Button text="Move its group" variant="outline" enabled={() => !!docs.activeGroup && !docs.activeGroup.browserWindow} onclick={() => docs.moveToNewWindow(docs.activeGroup!)} />\r
        <Button text="Bring everything back" variant="outline" enabled={() => docs.browserWindows.length > 0} onclick={() => docs.browserWindows.forEach((w) => w.moveToMainWindow())} />\r
      </Stack>\r
      {docs}\r
      <output class="td-state">{() => \`\${windows()} Customer: \${customer.name}, \${customer.city}.\`}</output>\r
    </>\r
  );\r
}\r
`,h=`import { reactive } from '@motifx/core';\r
import { RadioGroup, Stack, TabDocumentManager, type TabListScope } from '@motifx-community/ui';\r
import { FILES, fileDocument } from './files';\r
\r
const FormatIcon = () => (\r
  <svg viewBox="0 0 16 16" aria-hidden="true">\r
    <path d="M3 4h10M3 8h6M3 12h8" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />\r
  </svg>\r
);\r
\r
const RunIcon = () => (\r
  <svg viewBox="0 0 16 16" aria-hidden="true">\r
    <path d="M5 3.5v9l7-4.5z" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" />\r
  </svg>\r
);\r
\r
/**\r
 * The "…" button lists the group's documents to search and open, with close all, close saved and\r
 * lock under them. The app adds its own buttons: "Run" for every group, "Format" while a file of code is active.\r
 */\r
export default function OpenList() {\r
  const s = reactive({ scope: 'group' as TabListScope, runs: 0, formatted: '' });\r
  const docs = new TabDocumentManager({\r
    label: 'Open documents',\r
    openListScope: () => s.scope,\r
    toolbarItems: (group) => [{ icon: () => <RunIcon />, hint: () => \`Run group \${group.index + 1}\`, tone: 'accent', click: () => s.runs++ }],\r
  });\r
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';\r
  for (const file of FILES) {\r
    const code = file.path.endsWith('.ts');\r
    const doc = fileDocument(file.path, code ? { actions: [{ icon: () => <FormatIcon />, hint: 'Format', click: () => (s.formatted = file.path) }] } : {});\r
    docs.open(doc, { index: 99, group: file.path.startsWith('src/') ? docs.groups[0] : (docs.groups[1] ?? docs.split(docs.groups[0], 'right')!) });\r
  }\r
  docs.findDocument('src/app.ts')!.dirty = true;\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center" gap="lg">\r
        <RadioGroup\r
          label="The list shows"\r
          orientation="horizontal"\r
          items={[\r
            { value: 'group', text: "The group's documents" },\r
            { value: 'all', text: 'Every group' },\r
          ]}\r
          itemText="text"\r
          itemValue="value"\r
          x-model={() => s.scope}\r
        />\r
        <output class="td-state">{() => \`runs: \${s.runs}\${s.formatted ? \`; formatted \${s.formatted}\` : ''}\`}</output>\r
      </Stack>\r
      {docs}\r
    </>\r
  );\r
}\r
`,g=`import { reactive } from '@motifx/core';\r
import { RadioGroup, Stack, Switch, TabDocument, TabDocumentManager, type ContentLifetime, type TabCloseButton } from '@motifx-community/ui';\r
import { notes } from './contents';\r
\r
/** Every behavior is a prop tracked at runtime, bound here to the switches above the manager. */\r
export default function Options() {\r
  const s = reactive({\r
    closeButton: 'always' as TabCloseButton,\r
    lifetime: 'keep' as ContentLifetime,\r
    closeEmptyGroups: true,\r
    groupActions: true,\r
    manual: false,\r
    built: 0,\r
  });\r
\r
  const docs = new TabDocumentManager({\r
    label: 'Live options',\r
    closeButton: () => s.closeButton,\r
    contentLifetime: () => s.lifetime,\r
    closeEmptyGroups: () => s.closeEmptyGroups,\r
    groupActions: () => s.groupActions,\r
    activation: () => (s.manual ? 'manual' : 'auto'),\r
  });\r
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';\r
  for (const name of ['Alpha', 'Beta', 'Gamma', 'Delta']) {\r
    docs.open(\r
      new TabDocument({\r
        id: name.toLowerCase(),\r
        title: name,\r
        dirty: name === 'Gamma',\r
        closable: name !== 'Alpha',\r
        content: () => {\r
          s.built++;\r
          return notes(name);\r
        },\r
      }),\r
    );\r
  }\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center" gap="lg">\r
        <RadioGroup\r
          label="Close button"\r
          orientation="horizontal"\r
          items={[\r
            { value: 'always', text: 'Always' },\r
            { value: 'active', text: 'Active and hover' },\r
            { value: 'never', text: 'Never' },\r
          ]}\r
          itemText="text"\r
          itemValue="value"\r
          x-model={() => s.closeButton}\r
        />\r
        <RadioGroup\r
          label="Content lifetime"\r
          orientation="horizontal"\r
          items={[\r
            { value: 'keep', text: 'Keep' },\r
            { value: 'lazy', text: 'Lazy' },\r
            { value: 'dispose', text: 'Dispose' },\r
          ]}\r
          itemText="text"\r
          itemValue="value"\r
          x-model={() => s.lifetime}\r
        />\r
      </Stack>\r
      <Stack orientation="horizontal" wrap align="center" gap="lg">\r
        <Switch label="Close empty groups" x-model={() => s.closeEmptyGroups} />\r
        <Switch label="Group buttons" x-model={() => s.groupActions} />\r
        <Switch label="Manual activation" x-model={() => s.manual} />\r
        <output class="td-built">{() => \`contents built: \${s.built}\`}</output>\r
      </Stack>\r
      {docs}\r
    </>\r
  );\r
}\r
`,_=`import { reactive } from '@motifx/core';\r
import { TabDocument, TabDocumentManager } from '@motifx-community/ui';\r
import { customerForm, notes, ordersGrid } from './contents';\r
\r
/** Three kinds of content in two groups: a form, a grid and plain text. */\r
export default function Overview() {\r
  const docs = new TabDocumentManager({ label: 'Workspace' });\r
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';\r
\r
  const ada = reactive({ name: 'Ada Lovelace', email: 'ada@example.com', city: 'London' });\r
  docs.open(new TabDocument({ id: 'ada', type: 'customer', title: () => ada.name || 'New customer', description: 'Customers', content: () => customerForm(ada) }));\r
  docs.open(new TabDocument({ id: 'orders', type: 'orders', title: 'Orders', badge: 60, content: () => ordersGrid() }));\r
  const readme = docs.open(new TabDocument({ id: 'readme', type: 'notes', title: 'Read me', content: () => notes('Read me') }))!;\r
  docs.split(docs.groups[0], 'right', readme);\r
  docs.activate(docs.findDocument('orders')!);\r
\r
  return <>{docs}</>;\r
}\r
`,v=`import { reactive } from '@motifx/core';\r
import { Button, RadioGroup, Stack, Switch, TabDocumentManager, type PinnedTabSize } from '@motifx-community/ui';\r
import { FILES, fileDocument } from './files';\r
\r
/** Pinned tabs stay first, in the order they were pinned. Their pin mark unpins them; the menu and Ctrl+K Shift+Enter do too. */\r
export default function Pinning() {\r
  const s = reactive({ size: 'normal' as PinnedTabSize, separateRow: false, closeButton: false, keepPinned: true });\r
  const docs = new TabDocumentManager({\r
    label: 'Files with pinned tabs',\r
    pinnedTabSize: () => s.size,\r
    pinnedTabsOnSeparateRow: () => s.separateRow,\r
    closeButtonOnPinned: () => s.closeButton,\r
    keepPinned: () => s.keepPinned,\r
  });\r
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';\r
  for (const file of FILES) docs.open(fileDocument(file.path), { index: 99, pinned: file.path === 'README.md' || file.path === 'package.json' });\r
\r
  const toggle = () => {\r
    const doc = docs.activeDocument;\r
    if (doc) (doc.pinned ? docs.unpin(doc) : docs.pin(doc));\r
  };\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center" gap="lg">\r
        <RadioGroup\r
          label="Pinned tab size"\r
          orientation="horizontal"\r
          items={[\r
            { value: 'normal', text: 'Normal' },\r
            { value: 'compact', text: 'Compact' },\r
            { value: 'shrink', text: 'Shrink' },\r
          ]}\r
          itemText="text"\r
          itemValue="value"\r
          x-model={() => s.size}\r
        />\r
        <Switch label="Row of their own" x-model={() => s.separateRow} />\r
        <Switch label="Close button" x-model={() => s.closeButton} />\r
        <Switch label="Close all keeps them" x-model={() => s.keepPinned} />\r
      </Stack>\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Button text={() => (docs.activeDocument?.pinned ? 'Unpin active' : 'Pin active')} variant="outline" onclick={toggle} />\r
        <Button text="Close all" variant="outline" onclick={() => docs.closeAll()} />\r
        <Button text="Open the files again" variant="ghost" onclick={() => FILES.forEach((f) => docs.findDocument(f.path) || docs.open(fileDocument(f.path), { index: 99 }))} />\r
      </Stack>\r
      {docs}\r
    </>\r
  );\r
}\r
`,y=`import { reactive } from '@motifx/core';\r
import { RadioGroup, Stack, Switch, TabDocumentManager, type TabDockPresentation, type TabPresentation } from '@motifx-community/ui';\r
import { FILES, fileDocument } from './files';\r
import { outline, problems, toolDocument } from './tools';\r
\r
/**\r
 * Every part is a setting: how dock areas show on a phone and a tablet (the outline area says its\r
 * own), the swipe from an edge, the back button. onPresentationChanging can refuse a change: with\r
 * "Stay a phone" on, the phone does not go back to a tablet.\r
 */\r
export default function PresentationEvents() {\r
  const s = reactive({\r
    presentation: 'phone' as TabPresentation,\r
    phoneDock: 'sheet' as TabDockPresentation,\r
    tabletDock: 'auto' as TabDockPresentation,\r
    edge: true,\r
    back: true,\r
    stay: false,\r
    log: [] as string[],\r
  });\r
  const log = (line: string) => {\r
    s.log.push(line);\r
    if (s.log.length > 5) s.log.shift();\r
  };\r
  const docs = new TabDocumentManager({\r
    label: 'Editor with presentation settings',\r
    presentation: () => s.presentation,\r
    phoneDockMode: () => s.phoneDock,\r
    tabletDockMode: () => s.tabletDock,\r
    edgeSwipe: () => s.edge,\r
    backButton: () => s.back,\r
    onPresentationChanging: (e) => {\r
      log(\`changing \${e.from} → \${e.to}\`);\r
      if (s.stay && e.from === 'phone') e.cancel = true;\r
    },\r
    onPresentationChanged: (e) => log(\`changed to \${e.to}\`),\r
  });\r
  docs.element.style.cssText = 'block-size: 30rem; inline-size: 100%';\r
  for (const file of FILES.slice(0, 3)) docs.open(fileDocument(file.path), { index: 99 });\r
  docs.dock(toolDocument('problems', 'Problems', problems), 'bottom');\r
  docs.dock(toolDocument('outline', 'Outline', outline), 'right');\r
  // The outline's area chooses a drawer for itself on a phone.\r
  docs.dockArea('right')!.phoneDockMode = 'drawer';\r
  const modes = [\r
    { value: 'auto', text: 'Auto' },\r
    { value: 'sheet', text: 'Sheet' },\r
    { value: 'drawer', text: 'Drawer' },\r
    { value: 'hidden', text: 'Hidden' },\r
  ];\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center" gap="lg">\r
        <RadioGroup\r
          label="Presentation"\r
          orientation="horizontal"\r
          items={[\r
            { value: 'tablet', text: 'Tablet' },\r
            { value: 'phone', text: 'Phone' },\r
          ]}\r
          itemText="text"\r
          itemValue="value"\r
          x-model={() => s.presentation}\r
        />\r
        <Switch label="Stay a phone" x-model={() => s.stay} />\r
        <Switch label="Swipe from an edge" x-model={() => s.edge} />\r
        <Switch label="Back goes back" x-model={() => s.back} />\r
      </Stack>\r
      <Stack orientation="horizontal" wrap align="center" gap="lg">\r
        <RadioGroup label="Dock areas on a phone" orientation="horizontal" items={modes} itemText="text" itemValue="value" x-model={() => s.phoneDock} />\r
        <RadioGroup label="On a tablet" orientation="horizontal" items={modes} itemText="text" itemValue="value" x-model={() => s.tabletDock} />\r
      </Stack>\r
      <output class="td-state">{() => s.log.join(' · ') || 'No changes yet.'}</output>\r
      {docs}\r
    </>\r
  );\r
}\r
`,b=`import { reactive } from '@motifx/core';\r
import { Button, RadioGroup, Stack, TabDocumentManager, type TabPresentation } from '@motifx-community/ui';\r
import { FILES, fileDocument } from './files';\r
import { explorer, outline, output, problems, toolDocument } from './tools';\r
\r
/**\r
 * One layout shown four ways: two groups (the second split again), the explorer and the outline on\r
 * the left, problems and output at the bottom, a floating window. Pick a presentation: the layout\r
 * stays the same (Save shows its JSON does not change), only where things show changes.\r
 */\r
export default function Presentations() {\r
  const s = reactive({ presentation: 'tablet' as TabPresentation, shown: '', saved: '' });\r
  const docs = new TabDocumentManager({ label: 'Editor shown as on a desktop, a tablet or a phone', presentation: () => s.presentation, minGroupWidth: 120 });\r
  docs.element.style.cssText = 'block-size: 32rem; inline-size: 100%; max-inline-size: 100%';\r
  const open = (path: string) => docs.open(docs.findDocument(path) ?? fileDocument(path), { focus: true });\r
  for (const file of FILES.slice(0, 3)) docs.open(fileDocument(file.path), { index: 99 });\r
  const right = docs.split(docs.activeGroup!, 'right', docs.findDocument('src/router.ts')!)!;\r
  right.open(fileDocument('README.md'));\r
  docs.split(right, 'down', docs.findDocument('README.md')!);\r
  docs.dock(\r
    toolDocument('explorer', 'Explorer', () => explorer(open)),\r
    'left',\r
  );\r
  docs.dock(toolDocument('outline', 'Outline', outline), 'left');\r
  docs.dock(toolDocument('problems', 'Problems', problems), 'bottom');\r
  docs.dock(toolDocument('output', 'Output', output), 'bottom');\r
  docs.float(docs.open(fileDocument('package.json'))!, { x: 80, y: 80, width: 360, height: 220 });\r
  docs.activate(docs.findDocument('src/index.ts')!);\r
  docs.onPresentationChanged((e) => (s.shown = \`\${e.from} → \${e.to} (\${e.width} px wide)\`));\r
  let first = '';\r
  const save = () => {\r
    const json = JSON.stringify(docs.saveLayout());\r
    first ||= json;\r
    s.saved = \`Saved as \${docs.currentPresentation}: \${json.length} characters, \${json === first ? 'the same as the first save' : 'not the same as the first save'}.\`;\r
  };\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center" gap="lg">\r
        <RadioGroup\r
          label="Presentation"\r
          orientation="horizontal"\r
          items={[\r
            { value: 'auto', text: 'By its width' },\r
            { value: 'desktop', text: 'Desktop' },\r
            { value: 'tablet', text: 'Tablet' },\r
            { value: 'phone', text: 'Phone' },\r
          ]}\r
          itemText="text"\r
          itemValue="value"\r
          x-model={() => s.presentation}\r
        />\r
        <output class="td-state">{() => (s.shown ? \`Shown: \${s.shown}\` : \`Shown as: \${docs.currentPresentation}\`)}</output>\r
      </Stack>\r
      {docs}\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Button text="Save the layout" variant="outline" onclick={save} />\r
        <output class="td-state">{() => s.saved || 'The layout saves the same in every presentation.'}</output>\r
      </Stack>\r
    </>\r
  );\r
}\r
`,x=`import { reactive } from '@motifx/core';\r
import { Button, ListBox, Stack, Switch, TabDocumentManager } from '@motifx-community/ui';\r
import { FILES, fileDocument } from './files';\r
\r
/**\r
 * Choosing a file opens it as a preview (in italics): the next one chosen takes its place. A double\r
 * click on the tab, an edit, "Keep open" or moving it makes it stay.\r
 */\r
export default function Preview() {\r
  const s = reactive({ previewTabs: true, kept: [] as string[] });\r
  // Narrow beside its log, it still shows as on a desktop (see the Tablet and phone page).\r
  const docs = new TabDocumentManager({ label: 'Files in preview', previewTabs: () => s.previewTabs, presentation: 'desktop' });\r
  docs.element.style.cssText = 'block-size: 28rem; flex: 1 1 0px; min-inline-size: 0';\r
  docs.onKept((e) => s.kept.unshift(e.document.title));\r
\r
  const show = (path: string | null) => {\r
    if (path) docs.open(docs.findDocument(path) ?? fileDocument(path), { preview: true });\r
  };\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Switch label="Preview tabs" x-model={() => s.previewTabs} />\r
        <Button text="Keep open" variant="outline" enabled={() => !!docs.activeDocument?.preview} onclick={() => docs.keep(docs.activeDocument!)} />\r
        <output class="td-state">{() => \`preview: \${docs.activeGroup?.previewDocument?.title ?? 'none'}; kept: \${s.kept.join(', ') || 'none'}\`}</output>\r
      </Stack>\r
      <div style="display: flex; gap: var(--mx-space-3); inline-size: 100%">\r
        <ListBox\r
          label="Files"\r
          items={FILES}\r
          textField="path"\r
          valueField="path"\r
          height="28rem"\r
          style="inline-size: 14rem; flex: none"\r
          onValueChanged={(e) => show(e.value as string | null)}\r
        />\r
        {docs}\r
      </div>\r
    </>\r
  );\r
}\r
`,S=`import { reactive } from '@motifx/core';\r
import { Button, Stack, TabDocumentManager, type SplitDirection } from '@motifx-community/ui';\r
import { notes } from './contents';\r
\r
/** Everything the user does is a method too; the events report each change, by the user or by code. */\r
export default function Programmatic() {\r
  const log = reactive({ lines: [] as { id: number; text: string }[], next: 0, opened: 0 });\r
  const write = (text: string) => {\r
    log.lines.unshift({ id: log.next++, text });\r
    if (log.lines.length > 6) log.lines.pop();\r
  };\r
\r
  const docs = new TabDocumentManager({ label: 'Driven programmatically' });\r
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';\r
  docs.onOpened((e) => write(\`opened \${e.document.title} in group \${e.group.index + 1}\`));\r
  docs.onClosed((e) => write(\`closed \${e.document.title}\${e.byUser ? ' (user)' : ''}\`));\r
  docs.onDocumentActivated((e) => write(\`active: \${e.document?.title ?? 'none'}\${e.byUser ? ' (user)' : ''}\`));\r
  docs.onMoved((e) => write(\`moved \${e.document.title} to group \${e.to.index + 1}\`));\r
  docs.onLayoutChanged((e) => write(\`layout: \${e.change}\${e.byUser ? ' (user)' : ''}\`));\r
\r
  const open = () => {\r
    const n = ++log.opened;\r
    docs.open({ id: \`page-\${n}\`, type: 'page', title: \`Page \${n}\`, content: () => notes(\`Page \${n}\`) });\r
  };\r
  const split = (direction: SplitDirection) => {\r
    const group = docs.activeGroup;\r
    if (group) docs.split(group, direction, group.documents.length > 1 ? (group.activeDocument ?? undefined) : undefined);\r
  };\r
  const moveOn = () => {\r
    const doc = docs.activeDocument;\r
    const groups = docs.groups;\r
    if (doc?.group && groups.length > 1) docs.move(doc, groups[(groups.indexOf(doc.group) + 1) % groups.length]);\r
  };\r
  const toggleMaximize = () => {\r
    const group = docs.activeGroup;\r
    if (docs.maximizedGroup) docs.restoreGroups();\r
    else if (group) docs.maximizeGroup(group);\r
  };\r
\r
  open();\r
  open();\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Button text="Open" variant="outline" onclick={open} />\r
        <Button text="Close active" variant="outline" onclick={() => docs.activeDocument && docs.close(docs.activeDocument)} />\r
        <Button text="Split right" variant="outline" onclick={() => split('right')} />\r
        <Button text="Split down" variant="outline" onclick={() => split('down')} />\r
        <Button text="Move to next group" variant="outline" onclick={moveOn} />\r
        <Button text={() => (docs.maximizedGroup ? 'Restore groups' : 'Maximize group')} variant="outline" onclick={toggleMaximize} />\r
        <Button text="Even sizes" variant="outline" onclick={() => docs.evenSizes()} />\r
        <Button text="Next tab" variant="ghost" onclick={() => docs.activateNext(null, true)} />\r
        <Button text="Focus group 1" variant="ghost" onclick={() => docs.focusGroup(0)} />\r
      </Stack>\r
      {docs}\r
      <output class="td-state">{() => \`\${docs.groups.length} group(s), \${docs.documents.length} document(s), active: \${docs.activeDocument?.title ?? 'none'}\`}</output>\r
      <ul class="td-log">\r
        {log.lines.map((line) => (\r
          <li key={line.id}>{line.text}</li>\r
        ))}\r
      </ul>\r
    </>\r
  );\r
}\r
`,C=`import { reactive } from '@motifx/core';\r
import { Button, RadioGroup, Stack, TabDocumentManager, type TabKeyPreset, type TabListScope } from '@motifx-community/ui';\r
import { FILES, fileDocument } from './files';\r
\r
/**\r
 * Hold Ctrl and press E (Ctrl+Tab in an installed app) for the documents used last: E again walks\r
 * the list, Shift walks back, letting go of Ctrl opens one. Back and forward go over the documents\r
 * activated in every group; a closed document opens again where it was.\r
 */\r
export default function Recent() {\r
  const s = reactive({ scope: 'group' as TabListScope, preset: 'auto' as TabKeyPreset });\r
  const docs = new TabDocumentManager({ label: 'Recently used', recentListScope: () => s.scope, keyPreset: () => s.preset });\r
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';\r
  for (const file of FILES.slice(0, 5)) docs.open(fileDocument(file.path), { index: 99 });\r
  docs.split(docs.groups[0], 'right', docs.findDocument('README.md') ?? undefined);\r
  docs.open(fileDocument('package.json'), { group: docs.groups[1] });\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center" gap="lg">\r
        <RadioGroup\r
          label="Recent list"\r
          orientation="horizontal"\r
          items={[\r
            { value: 'group', text: 'This group' },\r
            { value: 'all', text: 'Every group' },\r
          ]}\r
          itemText="text"\r
          itemValue="value"\r
          x-model={() => s.scope}\r
        />\r
        <RadioGroup\r
          label="Keys"\r
          orientation="horizontal"\r
          items={[\r
            { value: 'auto', text: 'Auto' },\r
            { value: 'browser', text: 'Browser tab' },\r
            { value: 'desktop', text: 'Installed app' },\r
          ]}\r
          itemText="text"\r
          itemValue="value"\r
          x-model={() => s.preset}\r
        />\r
      </Stack>\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Button text="Recent list" variant="outline" onclick={() => docs.showRecentList()} />\r
        <Button text="Back" variant="outline" enabled={() => docs.canGoBack} onclick={() => docs.goBack()} />\r
        <Button text="Forward" variant="outline" enabled={() => docs.canGoForward} onclick={() => docs.goForward()} />\r
        <Button text="Reopen closed" variant="outline" enabled={() => docs.closedDocuments.length > 0} onclick={() => docs.reopenClosed()} />\r
        <output class="td-state">{() => \`keys: \${docs.keys.recentNext.join(' or ')}, \${docs.keys.goBack[0]}, \${docs.keys.reopenClosed[0]}\`}</output>\r
      </Stack>\r
      {docs}\r
    </>\r
  );\r
}\r
`,w=`import { reactive } from '@motifx/core';\r
import { Button, Stack, TabDocument, TabDocumentManager, type TabLayout, type TabLayoutDocument } from '@motifx-community/ui';\r
import { notes, ordersGrid } from './contents';\r
\r
/** Recreates a saved document by its type, with its \`state\` providing what it needs. */\r
function restore(saved: TabLayoutDocument): TabDocument {\r
  if (saved.type === 'orders') return new TabDocument({ ...saved, content: () => ordersGrid((saved.state as { count: number }).count) });\r
  return new TabDocument({ ...saved, content: () => notes(saved.title) });\r
}\r
\r
/** The layout as JSON: change it (split, move, resize, close), save, change it again, restore. */\r
export default function SaveRestore() {\r
  const s = reactive({ json: '', saved: null as TabLayout | null });\r
  const docs = new TabDocumentManager({ label: 'Saved layout' });\r
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';\r
  docs.open(restore({ id: 'orders', type: 'orders', title: 'Orders', state: { count: 40 } }));\r
  docs.open(restore({ id: 'notes', type: 'notes', title: 'Notes' }));\r
  docs.open(restore({ id: 'todo', type: 'notes', title: 'To do' }));\r
  docs.split(docs.groups[0], 'down', docs.findDocument('todo')!);\r
\r
  const save = () => {\r
    s.saved = docs.saveLayout();\r
    s.json = JSON.stringify(s.saved, null, 2);\r
  };\r
  const load = () => {\r
    if (s.saved) docs.loadLayout(s.saved, restore);\r
  };\r
  save();\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Button text="Save layout" variant="outline" onclick={save} />\r
        <Button text="Restore layout" variant="outline" enabled={() => !!s.saved} onclick={load} />\r
      </Stack>\r
      {docs}\r
      <pre class="td-json" tabindex="0" style="max-block-size: 14rem; overflow: auto; inline-size: 100%">\r
        {() => s.json}\r
      </pre>\r
    </>\r
  );\r
}\r
`,T=`import { reactive } from '@motifx/core';\r
import { RadioGroup, Stack, Switch, TabDocumentManager, type TabSize } from '@motifx-community/ui';\r
import { notes } from './contents';\r
\r
/** More tabs than fit: they scroll (wheel or buttons), shrink, take one width, or go on to more rows. */\r
export default function Sizing() {\r
  const s = reactive({ size: 'fit' as TabSize, wrap: false, buttons: true });\r
  const docs = new TabDocumentManager({\r
    label: 'Tab sizes',\r
    tabSize: () => s.size,\r
    wrapTabs: () => s.wrap,\r
    scrollButtons: () => s.buttons,\r
    tabMinWidth: 72,\r
    tabFixedWidth: 140,\r
  });\r
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';\r
  const names = ['Overview', 'Customers', 'Orders', 'Invoices', 'Payments', 'Shipping', 'Returns', 'Products', 'Stock', 'Suppliers', 'Reports', 'Settings'];\r
  for (const name of names) docs.open({ id: name, title: name, content: () => notes(name) }, { index: 99 });\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center" gap="lg">\r
        <RadioGroup\r
          label="Tab size"\r
          orientation="horizontal"\r
          items={[\r
            { value: 'fit', text: 'Fit' },\r
            { value: 'shrink', text: 'Shrink' },\r
            { value: 'fixed', text: 'Fixed' },\r
          ]}\r
          itemText="text"\r
          itemValue="value"\r
          x-model={() => s.size}\r
        />\r
        <Switch label="More rows" x-model={() => s.wrap} />\r
        <Switch label="Scroll buttons" x-model={() => s.buttons} />\r
      </Stack>\r
      {docs}\r
    </>\r
  );\r
}\r
`,E=`import { reactive } from '@motifx/core';\r
import { confirm, TabDocument, TabDocumentManager } from '@motifx-community/ui';\r
import { customerForm, type Customer } from './contents';\r
\r
const people: Customer[] = [\r
  { name: 'Grace Hopper', email: 'grace@example.com', city: 'New York' },\r
  { name: 'Alan Turing', email: 'alan@example.com', city: 'London' },\r
];\r
\r
/** Edit a field: the tab shows a dot in place of its close button, and closing it prompts first (\`e.promise\`). */\r
export default function UnsavedChanges() {\r
  const docs = new TabDocumentManager({ label: 'Customers' });\r
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';\r
\r
  for (const person of people) {\r
    const saved = { ...person };\r
    const customer = reactive({ ...person });\r
    docs.open(\r
      new TabDocument({\r
        id: person.email,\r
        type: 'customer',\r
        title: () => customer.name || 'New customer',\r
        dirty: () => customer.name !== saved.name || customer.email !== saved.email || customer.city !== saved.city,\r
        content: () => customerForm(customer),\r
      }),\r
    );\r
  }\r
\r
  docs.onClosing((e) => {\r
    if (e.document.dirty) e.promise = confirm(\`\${e.document.title} has unsaved changes. Close it anyway?\`, { title: 'Close', tone: 'caution' });\r
  });\r
\r
  return <>{docs}</>;\r
}\r
`,D=`import { reactive } from '@motifx/core';\r
import { Button, RadioGroup, Stack, TabDocument, TabDocumentManager, type TabLayout, type TabLayoutDocument, type TabRestoreWindows } from '@motifx-community/ui';\r
import { notes, ordersGrid } from './contents';\r
\r
/** Recreates a saved document by its type. */\r
function restore(saved: TabLayoutDocument): TabDocument {\r
  if (saved.type === 'orders') return new TabDocument({ ...saved, content: () => ordersGrid(40) });\r
  return new TabDocument({ ...saved, content: () => notes(saved.title) });\r
}\r
\r
/**\r
 * The layout saves its new windows too (place on the screen, layout). Loading puts them back as\r
 * floating windows, among the documents, or as windows again: a browser opens windows only on a\r
 * click, so the restore button, a click, may open them, and "Reopen windows" opens what was blocked.\r
 */\r
export default function WindowLayout() {\r
  const s = reactive({ json: '', saved: null as TabLayout | null, mode: 'float' as TabRestoreWindows });\r
  const docs = new TabDocumentManager({ label: 'Saved layout with new windows', restoreWindows: () => s.mode });\r
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';\r
  docs.open(restore({ id: 'orders', type: 'orders', title: 'Orders' }));\r
  docs.open(restore({ id: 'notes', type: 'notes', title: 'Notes' }));\r
  docs.open(restore({ id: 'todo', type: 'notes', title: 'To do' }));\r
\r
  const save = () => {\r
    s.saved = docs.saveLayout();\r
    s.json = JSON.stringify(s.saved, null, 2);\r
  };\r
  save();\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Button text="Move To do into a new window" variant="outline" onclick={() => docs.moveToNewWindow(docs.findDocument('todo')!)} />\r
        <Button text="Save layout" variant="outline" onclick={save} />\r
        <Button text="Restore layout" variant="outline" enabled={() => !!s.saved} onclick={() => s.saved && docs.loadLayout(s.saved, restore)} />\r
        <Button text="Reopen windows" variant="outline" onclick={() => docs.reopenWindows()} />\r
      </Stack>\r
      <RadioGroup\r
        label="Saved windows come back"\r
        orientation="horizontal"\r
        items={[\r
          { value: 'float', text: 'As floating windows' },\r
          { value: 'reopen', text: 'As windows again' },\r
          { value: 'main', text: 'In this window' },\r
        ]}\r
        itemText="text"\r
        itemValue="value"\r
        x-model={() => s.mode}\r
      />\r
      {docs}\r
      <pre class="td-json" tabindex="0" aria-label="The saved layout" style="max-block-size: 14rem; overflow: auto; inline-size: 100%">\r
        {() => s.json}\r
      </pre>\r
    </>\r
  );\r
}\r
`,O=`import { reactive } from '@motifx/core';\r
import { confirm, Stack, Switch, TabDocument, TabDocumentManager } from '@motifx-community/ui';\r
import { customerForm, notes } from './contents';\r
\r
/** Closing a new window brings its documents back or closes them; a browser that blocks the window gets a floating one. Every event is logged. */\r
export default function WindowOptions() {\r
  const s = reactive({ back: true, blocked: false, fallback: true, log: [] as { id: number; text: string }[] });\r
  let next = 0;\r
  const note = (text: string) => {\r
    s.log.unshift({ id: ++next, text });\r
    if (s.log.length > 6) s.log.pop();\r
  };\r
  const draft = reactive({ name: 'Draft customer', email: '', city: '' });\r
  const docs = new TabDocumentManager({\r
    label: 'New window settings',\r
    newWindowCloseAction: () => (s.back ? 'back' : 'close'),\r
    newWindowFallback: () => (s.fallback ? 'float' : 'none'),\r
    // A browser that blocks windows hands back none: here a switch plays that browser.\r
    openWindow: (r) => (s.blocked ? null : window.open(r.url, r.name, r.features)),\r
    onWindowOpening: (e) => note(\`windowOpening: \${e.document?.title ?? 'a group'}\`),\r
    onWindowOpened: (e) => note(\`windowOpened: window \${e.window.index + 1}\`),\r
    onWindowClosing: (e) => note(\`windowClosing (\${e.kind}): then \${e.then}\`),\r
    onWindowClosed: (e) => note(\`windowClosed (\${e.kind}): \${e.reason}\`),\r
    onError: (e) => note(\`error: \${e.error}, fallback \${e.fallback}\`),\r
  });\r
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';\r
  docs.open(new TabDocument({ id: 'draft', title: 'Draft', dirty: () => draft.email === '', content: () => customerForm(draft) }));\r
  docs.open(new TabDocument({ id: 'notes', title: 'Notes', content: () => notes('Notes') }));\r
  // A document with unsaved changes prompts before closing, in the main window.\r
  docs.onClosing((e) => {\r
    if (e.document.dirty) e.promise = confirm(\`\${e.document.title} has unsaved changes. Close it anyway?\`, { title: 'Close', tone: 'caution' });\r
  });\r
\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center" gap="lg">\r
        <Switch label="Documents come back when the window closes" x-model={() => s.back} />\r
        <Switch label="The browser blocks new windows" x-model={() => s.blocked} />\r
        <Switch label="Float when blocked" x-model={() => s.fallback} />\r
      </Stack>\r
      {docs}\r
      <ol class="td-log" aria-label="Events">\r
        {s.log.map((entry) => (\r
          <li key={entry.id}>{entry.text}</li>\r
        ))}\r
      </ol>\r
    </>\r
  );\r
}\r
`,k=`import { reactive, type ComponentBase } from '@motifx/core';\r
import { DataGrid, MenuBar, TabDocument, TabDocumentManager, type GridAction, type GridColumn, type GridSummary, type MenuItem } from '@motifx-community/ui';\r
import type { Order } from '../../datagrid/examples/order';\r
import { columns, makeOrders } from '../../datagrid/examples/orders';\r
import { customerCard, type Customer } from './contents';\r
\r
// Narrow, the grid moves columns into the row's details, the lowest number first; the customer always stays.\r
const PRIORITY: Partial<Record<keyof Order, number>> = { note: 0, paid: 1, date: 2, city: 3, status: 4, id: 5, amount: 6 };\r
const deskColumns: GridColumn<Order>[] = columns.map((c) => ({\r
  ...c,\r
  sticky: undefined,\r
  hidingPriority: PRIORITY[c.field as keyof Order],\r
  width: c.field === 'customer' ? 150 : c.field === 'amount' ? 100 : c.width,\r
}));\r
\r
const summary: GridSummary<Order> = {\r
  totalItems: [\r
    { column: 'id', summaryType: 'count', showInColumn: 'customer' },\r
    { column: 'amount', summaryType: 'sum' },\r
  ],\r
  groupItems: [{ column: 'amount', summaryType: 'sum', alignByColumn: true }],\r
};\r
\r
/**\r
 * An order desk: a menu bar over the manager, the orders in a full grid (filters, grouping, search,\r
 * summaries, batch editing, row actions and their context menu, export), a customer card that opens\r
 * in a tab from a row, and an activity log docked at the bottom.\r
 */\r
export default function Workspace() {\r
  const s = reactive({ orders: makeOrders(500), selected: 0, log: [] as { id: number; text: string }[], gridReady: 0 });\r
  let grid: DataGrid<Order> | null = null;\r
  let logId = 0;\r
  const write = (text: string) => {\r
    s.log.unshift({ id: ++logId, text });\r
    s.log.splice(40);\r
  };\r
\r
  const docs = new TabDocumentManager({ label: 'Order desk', dockGuides: true, dockAreaSize: { bottom: 160 } });\r
  docs.element.style.cssText = 'block-size: 36rem; inline-size: 100%';\r
\r
  const customers = new Map<string, Customer>();\r
  const openCustomer = (name: string) => {\r
    const id = \`customer:\${name}\`;\r
    const open = docs.findDocument(id);\r
    if (open) return void docs.activate(open, true);\r
    let customer = customers.get(name);\r
    if (!customer) {\r
      customer = reactive({ name, email: \`\${name.split(' ')[0].toLowerCase()}@example.com\`, city: '' });\r
      customers.set(name, customer);\r
    }\r
    const card = customer;\r
    const doc = new TabDocument({ id, type: 'customer', title: () => card.name || 'New customer', description: 'Customer', content: () => customerCard(card) });\r
    // Customers open beside the orders: in the group on the right, or in a new one there.\r
    const side = docs.groups.find((g) => g !== orders.group && !g.dockArea && !g.window && !g.browserWindow);\r
    if (side) docs.open(doc, { group: side, focus: true });\r
    else {\r
      const opened = docs.open(doc, { group: orders.group ?? undefined, focus: true });\r
      if (opened && orders.group) docs.split(orders.group, 'right', opened);\r
    }\r
  };\r
\r
  const openOrder: GridAction<Order> = { id: 'customer', text: 'Open the customer', onclick: (row) => openCustomer(row.customer) };\r
  const approve: GridAction<Order> = {\r
    id: 'approve',\r
    text: 'Approve',\r
    tone: 'accent',\r
    visible: (row) => row.status === 'Draft',\r
    onclickMany: (rows) => {\r
      for (const row of rows) row.status = 'Approved';\r
      write(\`\${rows.length} orders approved\`);\r
    },\r
    onclick: (row) => {\r
      row.status = 'Approved';\r
      write(\`order \${row.id} approved\`);\r
    },\r
  };\r
\r
  const ordersGrid = (): ComponentBase => (\r
    <DataGrid\r
      style="block-size: 100%"\r
      rows={() => s.orders}\r
      rowKey="id"\r
      columns={deskColumns}\r
      label="Orders"\r
      locale="en"\r
      saveMode="batch"\r
      summary={summary}\r
      export={{ formats: ['csv'] }}\r
      actions={(_row: Order, state) => (state.isRemoved ? ['restore'] : [openOrder, approve, 'edit', 'remove'])}\r
      settings={{\r
        editable: true,\r
        selection: 'multiple',\r
        filterRow: true,\r
        headerFilter: true,\r
        groupPanel: true,\r
        searchPanel: true,\r
        columnChooserButton: true,\r
        exportButton: true,\r
        totalSummary: true,\r
        groupSummary: true,\r
        rowStatus: true,\r
        striped: true,\r
        actionsContextMenu: true,\r
        // Narrow beside a customer: the actions stay one "…" button, and columns that do not fit go into the row's details.\r
        actionsDisplay: 'menu',\r
        actionsWidth: 48,\r
        columnHidingEnabled: true,\r
      }}\r
      onSelectionChanged={(e) => (s.selected = e.selection.all ? s.orders.length - e.selection.except.length : e.selection.keys.length)}\r
      onSaved={() => write('changes saved')}\r
      ref={(g: DataGrid<Order>) => {\r
        grid = g;\r
        s.gridReady++;\r
      }}\r
    />\r
  );\r
  // The tab shows the unsaved mark while the grid has edits that are not saved.\r
  const orders = new TabDocument({\r
    id: 'orders',\r
    type: 'orders',\r
    title: 'Orders',\r
    pinned: true,\r
    closable: false,\r
    badge: () => s.orders.length,\r
    dirty: () => s.gridReady > 0 && !!grid?.hasChanges,\r
    content: ordersGrid,\r
  });\r
  const activity = new TabDocument({\r
    id: 'activity',\r
    type: 'tool',\r
    title: 'Activity',\r
    closable: false,\r
    content: () => (\r
      <ol style="margin: 0; padding: var(--mx-space-2) var(--mx-space-4); font-size: var(--mx-font-size-caption)" aria-label="Activity">\r
        {s.log.map((line) => (\r
          <li key={line.id}>{line.text}</li>\r
        ))}\r
      </ol>\r
    ),\r
  });\r
\r
  docs.open(orders);\r
  // The log waits folded at the bottom edge: a click on its title slides it out.\r
  docs.dock(activity, 'bottom');\r
  docs.autoHide(docs.dockArea('bottom')!);\r
  docs.activate(orders);\r
\r
  docs.onOpened((e) => write(\`opened \${e.document.title}\`));\r
  docs.onClosed((e) => write(\`closed \${e.document.title}\`));\r
  docs.onMoved((e) => write(\`moved \${e.document.title}\`));\r
  docs.onFloated((e) => write(\`\${e.document?.title ?? 'a group'} floats\`));\r
  docs.onDocked((e) => write(\`\${e.document?.title ?? 'a group'} docked\${e.side ? \` on the \${e.side}\` : ''}\`));\r
  docs.onHidden((e) => write(\`\${e.document.title} hidden\`));\r
\r
  const active = () => docs.activeDocument;\r
  const menu: MenuItem[] = [\r
    {\r
      text: '&File',\r
      items: [\r
        { text: 'New customer', click: () => openCustomer(\`Customer \${customers.size + 1}\`) },\r
        { text: 'Reopen closed', enabled: () => docs.documents.length > 0, click: () => docs.reopenClosed() },\r
        { text: 'Close', shortcut: 'Ctrl+Alt+W', beginGroup: true, enabled: () => !!active()?.closable, click: () => active() && docs.close(active()!) },\r
        { text: 'Close all', click: () => docs.closeAll() },\r
      ],\r
    },\r
    {\r
      text: '&Orders',\r
      items: [\r
        { text: 'Save changes', enabled: () => s.gridReady > 0 && !!grid?.hasChanges, click: () => grid?.saveEditData() },\r
        { text: 'Undo changes', enabled: () => s.gridReady > 0 && !!grid?.hasChanges, click: () => grid?.cancelEditData() },\r
        { text: 'Group by city', beginGroup: true, click: () => grid?.groupBy('city') },\r
        { text: 'Clear grouping', click: () => grid?.clearGrouping() },\r
        { text: 'Clear filters', click: () => grid?.clearFilters() },\r
        { text: 'Choose columns…', beginGroup: true, click: () => grid?.showColumnChooser() },\r
        { text: 'Export to CSV', click: () => grid?.exportCsv({ fileName: 'orders' }) },\r
      ],\r
    },\r
    {\r
      text: '&View',\r
      items: [\r
        { text: 'Split right', click: () => docs.activeGroup && docs.split(docs.activeGroup, 'right') },\r
        { text: 'Split down', click: () => docs.activeGroup && docs.split(docs.activeGroup, 'down') },\r
        { text: 'Maximize the group', beginGroup: true, click: () => docs.activeGroup && docs.maximizeGroup(docs.activeGroup) },\r
        { text: 'Restore the groups', click: () => docs.restoreGroups() },\r
        { text: 'Same sizes', click: () => docs.evenSizes() },\r
      ],\r
    },\r
    {\r
      text: '&Window',\r
      items: [\r
        { text: 'Float the active tab', enabled: () => !!active() && !active()!.window, click: () => active() && docs.float(active()!) },\r
        { text: 'Move into a new window', enabled: () => !!active() && !active()!.browserWindow, click: () => active() && docs.moveToNewWindow(active()!) },\r
        { text: 'Dock back', enabled: () => !!active()?.window, click: () => active() && docs.dock(active()!) },\r
        {\r
          text: 'Show the activity',\r
          beginGroup: true,\r
          // Its area's close button hides it because it cannot close. When shown again, it returns to its previous place.\r
          click: () => (activity.isHidden ? docs.show(activity, { focus: true }) : activity.dockArea?.autoHidden ? docs.showAutoHidden(activity) : docs.activate(activity, true)),\r
        },\r
      ],\r
    },\r
  ];\r
\r
  return (\r
    <>\r
      <MenuBar items={menu} label="Order desk" />\r
      {docs}\r
      <output class="td-state">{() => \`\${s.orders.length} orders · \${s.selected} selected\${s.gridReady > 0 && grid?.hasChanges ? ' · unsaved changes' : ''}\`}</output>\r
    </>\r
  );\r
}\r
`,A=`import type { ComponentBase } from '@motifx/core';\r
import { Button, confirm, DataGrid, FormLayout, type FormItem, type GridColumn } from '@motifx-community/ui';\r
import { makeOrders, type Order } from './orders';\r
\r
const columns: GridColumn<Order>[] = [\r
  { field: 'id', title: 'No', type: 'number', width: 70 },\r
  { field: 'customer', title: 'Customer', width: 160 },\r
  { field: 'city', title: 'City', width: 110 },\r
  { field: 'amount', title: 'Amount', type: 'number', width: 100 },\r
];\r
\r
/** A grid of orders that fills its tab. */\r
export function ordersGrid(count = 60): ComponentBase {\r
  return <DataGrid rows={makeOrders(count)} rowKey="id" columns={columns} label="Orders" style="block-size: 100%" />;\r
}\r
\r
/** The fields a customer is edited with. */\r
export interface Customer {\r
  name: string;\r
  email: string;\r
  city: string;\r
}\r
\r
/** The forms open over each customer: a copy of a document has a form of its own over the same object. */\r
const formsOf = new WeakMap<Customer, Set<FormLayout<Customer>>>();\r
\r
/**\r
 * A form over a customer: what is typed goes straight into it. The form reads the object as it is, so the other forms\r
 * over the same customer are told to read the field again.\r
 */\r
export function customerForm(customer: Customer): ComponentBase {\r
  const items: FormItem[] = [\r
    { field: 'name', label: 'Name', required: true },\r
    { field: 'email', label: 'Email', editor: 'email' },\r
    { field: 'city', label: 'City' },\r
  ];\r
  const forms = formsOf.get(customer) ?? new Set<FormLayout<Customer>>();\r
  formsOf.set(customer, forms);\r
  return (\r
    <div style="padding: var(--mx-space-4); max-inline-size: 32rem">\r
      <FormLayout<Customer>\r
        data={customer}\r
        items={items}\r
        ref={(form: FormLayout<Customer>) => {\r
          forms.add(form);\r
          form.motif.setDisposable(() => forms.delete(form));\r
        }}\r
        onFieldChanged={(e) => {\r
          for (const other of forms) if (other.data === e.data && !other.isDisposed) other.refreshField(e.field);\r
        }}\r
      />\r
    </div>\r
  );\r
}\r
\r
/** A few paragraphs of plain text. */\r
export function notes(title: string): ComponentBase {\r
  return (\r
    <div style="padding: var(--mx-space-4); max-inline-size: 40rem">\r
      <h3 style="margin-block-start: 0">{title}</h3>\r
      <p>Any component can be a document: a form, a grid, a chart or plain text like this.</p>\r
      <p>Drag the line between two groups, or focus it with Tab and use the arrow keys. A double click on it gives the groups the same size.</p>\r
    </div>\r
  );\r
}\r
\r
const CITIES = ['İstanbul', 'Ankara', 'İzmir', 'London', 'New York'];\r
\r
/** A customer card: text fields and a city drop-down over a reactive customer, and a button that opens a dialog. */\r
export function customerCard(customer: Customer): ComponentBase {\r
  const items: FormItem[] = [\r
    { field: 'name', label: 'Name', required: true },\r
    { field: 'email', label: 'Email', editor: 'email' },\r
    { field: 'city', label: 'City', editor: 'dropdown', editorProps: { items: CITIES } },\r
  ];\r
  let card: ComponentBase | null = null;\r
  // The dialog opens where the card is: in a new window, there.\r
  const clear = async () => {\r
    if (await confirm('Clear the customer card?', { title: 'Clear', host: card! })) Object.assign(customer, { name: '', email: '', city: '' });\r
  };\r
  return (\r
    <div ref={(c: ComponentBase) => (card = c)} style="padding: var(--mx-space-4); max-inline-size: 32rem">\r
      <FormLayout data={customer} items={items} />\r
      <Button text="Clear…" variant="outline" onclick={clear} />\r
    </div>\r
  );\r
}\r
`,j=`import type { ComponentBase } from '@motifx/core';\r
import { TabDocument, type TabDocumentOptions } from '@motifx-community/ui';\r
\r
/** A page with a folded corner: a file. */\r
export const FileIcon = () => (\r
  <svg viewBox="0 0 16 16" aria-hidden="true">\r
    <path d="M4 1.75h5l3 3v9.5H4zM9 1.75v3h3" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" />\r
  </svg>\r
);\r
\r
/** A few files of a sample project. */\r
export const FILES = [\r
  { path: 'src/index.ts', text: "export { App } from './app';\\nexport { router } from './router';" },\r
  { path: 'src/app.ts', text: "import { Application } from '@motifx/core';\\n\\nexport const App = Application.CreateBuilder().build();" },\r
  { path: 'src/router.ts', text: "export const router = { mode: 'history', routes: [] };" },\r
  { path: 'src/orders/index.ts', text: "export * from './orders';" },\r
  { path: 'src/orders/orders.ts', text: 'export interface Order {\\n  id: number;\\n  amount: number;\\n}' },\r
  { path: 'README.md', text: '# Shop\\n\\nA small shop written with MotifJS.' },\r
  { path: 'package.json', text: '{\\n  "name": "shop",\\n  "private": true\\n}' },\r
  { path: 'vite.config.ts', text: "import { defineConfig } from 'vite';\\n\\nexport default defineConfig({});" },\r
];\r
\r
/** A file's text, as a document's content. */\r
export function source(text: string): ComponentBase {\r
  // The panel scrolls (and takes focus for it): the text itself does not.\r
  return <pre style="margin: 0; padding: var(--mx-space-4); overflow: visible; font: var(--mx-font-size-body) / var(--mx-font-line-body) var(--mx-font-family-mono)">{text}</pre>;\r
}\r
\r
/** A document for a file: its name as the title, its folder as the description. */\r
export function fileDocument(path: string, extra: TabDocumentOptions = {}): TabDocument {\r
  const file = FILES.find((f) => f.path === path);\r
  const at = path.lastIndexOf('/');\r
  return new TabDocument({\r
    id: path,\r
    type: 'file',\r
    title: path.slice(at + 1),\r
    description: at > 0 ? path.slice(0, at) : '',\r
    icon: () => <FileIcon />,\r
    content: () => source(file?.text ?? ''),\r
    ...extra,\r
  });\r
}\r
`,M=`/** An order of the examples. */\r
export interface Order {\r
  id: number;\r
  customer: string;\r
  city: string;\r
  amount: number;\r
}\r
\r
const customers = ['Ada Lovelace', 'Alan Turing', 'Grace Hopper', 'Edsger Dijkstra', 'Barbara Liskov', 'Donald Knuth'];\r
const cities = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya'];\r
\r
/** \`count\` sample orders, the same every time. */\r
export function makeOrders(count: number): Order[] {\r
  return Array.from({ length: count }, (_, i) => ({\r
    id: 1001 + i,\r
    customer: customers[i % customers.length],\r
    city: cities[(i * 7) % cities.length],\r
    amount: Math.round(((i * 37) % 900) + 100),\r
  }));\r
}\r
`,N=`import type { ComponentBase } from '@motifx/core';\r
import { Button, TabDocument } from '@motifx-community/ui';\r
import { FILES } from './files';\r
\r
const PROBLEMS = [\r
  { file: 'src/app.ts', line: 3, text: "'App' is declared but never read." },\r
  { file: 'src/router.ts', line: 1, text: 'The routes list is empty.' },\r
  { file: 'README.md', line: 3, text: 'A line longer than 80 characters.' },\r
];\r
\r
/** A plain list inside a tool. */\r
const LIST = 'margin: 0; padding: var(--mx-space-2); list-style: none';\r
const ITEM = 'padding: var(--mx-space-1) var(--mx-space-2); white-space: nowrap';\r
\r
const LOG = ['> shop@0.0.0 dev', '> vite', '', '  VITE ready in 312 ms', '  ➜  Local:   http://localhost:5173/', '  page reload src/app.ts', '  hmr update /src/router.ts'];\r
\r
/** The project's files; choosing one opens it among the documents. */\r
export function explorer(open: (path: string) => void): ComponentBase {\r
  return (\r
    <ul style={LIST} aria-label="Project files">\r
      {FILES.map((file) => (\r
        <li key={file.path}>\r
          <Button text={file.path} variant="ghost" size="sm" onclick={() => open(file.path)} />\r
        </li>\r
      ))}\r
    </ul>\r
  );\r
}\r
\r
/** The outline of a file: what it declares. */\r
export function outline(): ComponentBase {\r
  return (\r
    <ul style={LIST} aria-label="Outline">\r
      {['App', 'router', 'Order', 'routes'].map((name) => (\r
        <li key={name} style={ITEM}>\r
          {name}\r
        </li>\r
      ))}\r
    </ul>\r
  );\r
}\r
\r
/** A list of problems found in the files. */\r
export function problems(): ComponentBase {\r
  return (\r
    <ul style={LIST} aria-label="Problems">\r
      {PROBLEMS.map((p) => (\r
        <li key={\`\${p.file}:\${p.line}\`} style={ITEM}>\r
          {\`\${p.file}:\${p.line}  \${p.text}\`}\r
        </li>\r
      ))}\r
    </ul>\r
  );\r
}\r
\r
/** What the dev server wrote. */\r
export function output(): ComponentBase {\r
  return <pre style="margin: 0; padding: var(--mx-space-3); overflow: visible; font: var(--mx-font-size-caption) / var(--mx-font-line-caption) var(--mx-font-family-mono)">{LOG.join('\\n')}</pre>;\r
}\r
\r
/** A tool's document: it cannot be closed, only moved, docked, floated or folded away. */\r
export function toolDocument(id: string, title: string, content: () => ComponentBase): TabDocument {\r
  return new TabDocument({ id, type: 'tool', title, closable: false, content });\r
}\r
`;export{i as A,d as C,s as D,c as E,n as M,t as N,o as O,e as P,f as S,l as T,_,k as a,m as b,E as c,C as d,S as f,v as g,y as h,A as i,r as j,a as k,T as l,b as m,M as n,O as o,x as p,j as r,D as s,N as t,w as u,g as v,u as w,p as x,h as y};