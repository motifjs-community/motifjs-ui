import{Mt as e,a as t,an as n,h as r,i,n as a,nn as o,r as s,rn as c,t as l}from"./doc-B1CtlCkV.js";import{t as u}from"./Stack-AS0iyAxC.js";import{t as d}from"./Panel-psRyqKP0.js";import{t as f}from"./TreeView-R1dIc2PC.js";import{t as p}from"./index-DVbtDn93.js";import{t as m}from"./sources-BXVvOiIY.js";import{t as h}from"./kit-texts-BRS-kYEc.js";var g=`import { reactive } from '@motifx/core';\r
import { Panel, TreeView } from '@motifx-community/ui';\r
import type { Entry } from './entry';\r
import { FILE, FOLDER, icon } from './icon';\r
\r
const BOX = 'inline-size: 100%; max-inline-size: 26rem; background: var(--mx-color-bg-card)';\r
\r
/** A sample disk: the entries of each folder. */\r
const DISK: Record<string, string[]> = {\r
  '/': ['Documents/', 'Pictures/', 'Shared/', 'notes.txt'],\r
  '/Documents/': ['Invoices/', 'Letters/', 'plan.docx'],\r
  '/Documents/Invoices/': ['2025/', '2026/'],\r
  '/Documents/Invoices/2025/': ['january.pdf', 'february.pdf'],\r
  '/Documents/Invoices/2026/': ['march.pdf'],\r
  '/Documents/Letters/': [],\r
  '/Pictures/': ['holiday.jpg', 'cat.png'],\r
  '/Shared/': ['team.xlsx'],\r
};\r
\r
function entriesOf(path: string): Entry[] {\r
  return (DISK[path] ?? []).map((name) => {\r
    const folder = name.endsWith('/');\r
    return { id: path + name, text: folder ? name.slice(0, -1) : name, folder, hasChildren: folder };\r
  });\r
}\r
\r
/** Children loaded when a folder first opens, with a load that fails once (Shared) and a retry. */\r
export default function FileExplorer() {\r
  const s = reactive({ opened: '', loads: 0 });\r
  let failed = false;\r
\r
  const loadChildren = (entry: Entry) =>\r
    new Promise<Entry[]>((resolve, reject) => {\r
      s.loads++;\r
      setTimeout(() => {\r
        if (entry.id === '/Shared/' && !failed) {\r
          failed = true;\r
          reject(new Error('The share is offline.'));\r
        } else {\r
          resolve(entriesOf(entry.id));\r
        }\r
      }, 500);\r
    });\r
\r
  return (\r
    <>\r
      <Panel variant="outline" padding="xxs" style={BOX}>\r
        <TreeView\r
          class="tv-lazy"\r
          label="Disk"\r
          items={[{ id: '/', text: 'My disk', folder: true }]}\r
          loadChildren={loadChildren}\r
          iconField={(entry: Entry) => icon(entry.folder ? FOLDER : FILE)}\r
          expandOn="dblclick"\r
          onExpanded={(e) => (s.opened = \`Opened \${e.item.text}.\`)}\r
        />\r
      </Panel>\r
      <output class="tv-loads">{() => \`Loads: \${s.loads}. \${s.opened}\`}</output>\r
    </>\r
  );\r
}\r
`,_=`import { Panel, TreeView } from '@motifx-community/ui';\r
import type { Entry } from './entry';\r
\r
const BOX = 'inline-size: 100%; max-inline-size: 26rem; background: var(--mx-color-bg-card)';\r
\r
const FLAT = [\r
  { id: 1, name: 'Company', parent: null },\r
  { id: 2, name: 'Sales', parent: 1 },\r
  { id: 3, name: 'Engineering', parent: 1 },\r
  { id: 4, name: 'Web', parent: 3 },\r
  { id: 5, name: 'Mobile', parent: 3 },\r
];\r
\r
const MAIL: Entry[] = [\r
  { id: 'inbox', text: 'Inbox', count: 12, expanded: true, children: [{ id: 'work', text: 'Work', count: 3 }, { id: 'family', text: 'Family' }] },\r
  { id: 'sent', text: 'Sent' },\r
  { id: 'spam', text: 'Spam', count: 99, enabled: false },\r
];\r
\r
/** Flat rows that name their parent, a text field given as a function, and rows drawn by a template. */\r
export default function FlatData() {\r
  const withCount = (item: Entry, host: HTMLElement) => {\r
    host.append(item.text);\r
    if (item.count) {\r
      const badge = document.createElement('strong');\r
      badge.textContent = \` · \${item.count}\`;\r
      host.append(badge);\r
    }\r
  };\r
  return (\r
    <>\r
      <Panel variant="outline" padding="xxs" style={BOX}>\r
        <TreeView class="tv-flat" label="Company" items={FLAT} parentField="parent" textField={(row: (typeof FLAT)[number]) => row.name} expandedKeys={[1, 3]} />\r
      </Panel>\r
      <Panel variant="outline" padding="xxs" style={BOX}>\r
        <TreeView class="tv-template" label="Mail" items={MAIL} itemTemplate={withCount} />\r
      </Panel>\r
    </>\r
  );\r
}\r
`,v=`import { Button, Panel, Stack, TreeView } from '@motifx-community/ui';\r
import type { Entry } from './entry';\r
\r
const BOX = 'inline-size: 100%; max-inline-size: 26rem; background: var(--mx-color-bg-card)';\r
\r
const DEPARTMENTS: Entry[] = Array.from({ length: 50 }, (_, d) => ({\r
  id: \`d\${d}\`,\r
  text: \`Department \${d + 1}\`,\r
  children: Array.from({ length: 200 }, (_, p) => ({ id: \`d\${d}p\${p}\`, text: \`Person \${d + 1}.\${p + 1}\` })),\r
}));\r
\r
/** 50 departments of 200 people, created with \`new\`. Only the visible rows are rendered. */\r
export default function LargeTree() {\r
  const people = new TreeView<Entry>({ items: DEPARTMENTS, label: 'People', showLines: true });\r
  people.element.style.blockSize = '20rem';\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Button text="Expand all" variant="outline" onclick={() => people.expandAll()} />\r
        <Button text="Collapse all" variant="ghost" onclick={() => people.collapseAll()} />\r
        <Button text="Go to Person 37.150" variant="ghost" onclick={() => people.focusNode('d36p149')} />\r
      </Stack>\r
      <Panel class="tv-large" variant="outline" padding="xxs" style={BOX} ref={(p: Panel) => p.controls.add(people)} />\r
    </>\r
  );\r
}\r
`,y=`import { reactive } from '@motifx/core';\r
import { Button, uiLocale } from '@motifx-community/ui';\r
import { kitTexts } from '../../../shared/kit-texts';\r
\r
/** Switches the texts of the kit; the trees on the page follow at once. */\r
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
        A failed load reads <output class="tv-failed">{() => \`\${kitTexts.strings.loadFailed} \${kitTexts.strings.retry}\`}</output>\r
      </span>\r
    </>\r
  );\r
}\r
`,b=`import { reactive } from '@motifx/core';\r
import { Button, Panel, Stack, TreeView } from '@motifx-community/ui';\r
import type { Entry } from './entry';\r
\r
const BOX = 'inline-size: 100%; max-inline-size: 26rem; background: var(--mx-color-bg-card)';\r
\r
const PERMISSIONS = (): Entry[] => [\r
  {\r
    id: 'admin',\r
    text: 'Administration',\r
    expanded: true,\r
    children: [\r
      { id: 'users', text: 'Users', children: [{ id: 'users.view', text: 'View' }, { id: 'users.edit', text: 'Edit' }, { id: 'users.delete', text: 'Delete' }] },\r
      { id: 'roles', text: 'Roles', children: [{ id: 'roles.view', text: 'View' }, { id: 'roles.edit', text: 'Edit' }] },\r
    ],\r
  },\r
  {\r
    id: 'content',\r
    text: 'Content',\r
    expanded: true,\r
    children: [\r
      { id: 'articles', text: 'Articles', children: [{ id: 'articles.read', text: 'Read' }, { id: 'articles.write', text: 'Write' }, { id: 'articles.publish', text: 'Publish' }] },\r
      { id: 'media', text: 'Media', children: [{ id: 'media.upload', text: 'Upload' }, { id: 'media.delete', text: 'Delete' }] },\r
    ],\r
  },\r
  { id: 'billing', text: 'Billing', children: [{ id: 'invoices', text: 'Invoices' }, { id: 'cards', text: 'Payment methods', enabled: false }] },\r
];\r
\r
/** A permissions tree with check boxes that add up to their parents, the checked keys bound both ways. */\r
export default function Permissions() {\r
  const s = reactive({ checked: ['users.view', 'articles.read'] as unknown[], recursive: true });\r
  let tree!: TreeView<Entry>;\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Button text="Recursive" size="sm" variant="outline" toggle x-model={() => s.recursive} />\r
        <Button text="Check all" size="sm" variant="ghost" onclick={() => tree.checkAll()} />\r
        <Button text="Uncheck all" size="sm" variant="ghost" onclick={() => tree.uncheckAll()} />\r
      </Stack>\r
      <Panel variant="outline" padding="xxs" style={BOX}>\r
        <TreeView\r
          ref={(t: TreeView<Entry>) => (tree = t)}\r
          class="tv-checks"\r
          label="Permissions"\r
          items={PERMISSIONS()}\r
          showCheckBoxes\r
          selectionMode="none"\r
          checkRecursive={() => s.recursive}\r
          checkedKeys={() => s.checked}\r
          onCheckChanged={(e) => (s.checked = e.keys)}\r
        />\r
      </Panel>\r
      <output class="tv-checked">{() => \`checkedKeys: \${JSON.stringify(s.checked)}\`}</output>\r
    </>\r
  );\r
}\r
`,x=`import { reactive } from '@motifx/core';\r
import { Button, Panel, Stack, TreeView } from '@motifx-community/ui';\r
import type { Entry } from './entry';\r
import { project } from './project';\r
\r
const BOX = 'inline-size: 100%; max-inline-size: 26rem; background: var(--mx-color-bg-card)';\r
\r
/** A tree bound with x-model, and a tree created with \`new\` whose items change in place and are re-read on \`refresh()\`. */\r
export default function Programmatic() {\r
  const s = reactive({ file: 'tree' as unknown, clicked: '' });\r
  const menu = reactive<Entry[]>([\r
    { id: 'home', text: 'Home' },\r
    { id: 'products', text: 'Products', children: [{ id: 'new', text: 'New' }] },\r
  ]);\r
  let added = 0;\r
\r
  const tree = new TreeView<Entry>({ items: menu, label: 'Menu', selectionMode: 'none' });\r
  tree.onItemClick((e) => (s.clicked = \`Pressed “\${e.item.text}”.\`));\r
\r
  const addProduct = () => {\r
    added++;\r
    menu[1].children!.push({ id: \`p\${added}\`, text: \`Product \${added}\` });\r
    tree.refresh();\r
    tree.expand('products');\r
  };\r
\r
  return (\r
    <>\r
      <Panel variant="outline" padding="xxs" style={BOX}>\r
        <TreeView class="tv-ways" label="Project files" items={project()} expandedKeys={['src', 'components']} x-model={() => s.file} />\r
      </Panel>\r
      <output class="tv-value">{() => \`value: \${JSON.stringify(s.file)}\`}</output>\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Button text="Add a product programmatically" variant="outline" onclick={addProduct} />\r
        <Button text="Expand all" variant="ghost" onclick={() => tree.expandAll()} />\r
        <Button text="Collapse all" variant="ghost" onclick={() => tree.collapseAll()} />\r
        <output class="tv-clicked">{() => s.clicked}</output>\r
      </Stack>\r
      <Panel variant="outline" padding="xxs" style={BOX} ref={(p: Panel) => p.controls.add(tree)} />\r
    </>\r
  );\r
}\r
`,S=`import { reactive } from '@motifx/core';\r
import { Button, Panel, Stack, TextBox, TreeView } from '@motifx-community/ui';\r
import { world } from './world';\r
\r
const BOX = 'inline-size: 100%; max-inline-size: 26rem; background: var(--mx-color-bg-card)';\r
\r
/** A tree with its own search box, and a tree filtered from a field outside it. */\r
export default function Search() {\r
  const s = reactive({ search: '', startsWith: false });\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center">\r
        <Button text="Starts with" size="sm" variant="outline" toggle x-model={() => s.startsWith} />\r
      </Stack>\r
      <Panel variant="outline" padding="xxs" style={BOX}>\r
        <TreeView class="tv-search" label="Cities" items={world()} searchEnabled searchMode={() => (s.startsWith ? 'startswith' : 'contains')} />\r
      </Panel>\r
      <TextBox label="Filter from outside" x-model={() => s.search} clearButton />\r
      <Panel variant="outline" padding="xxs" style={BOX}>\r
        <TreeView class="tv-filter" label="Filtered cities" items={world()} searchValue={() => s.search} />\r
      </Panel>\r
    </>\r
  );\r
}\r
`,C=`import { reactive } from '@motifx/core';\r
import { Button, Panel, Stack, TreeView, type TreeViewSelectionMode } from '@motifx-community/ui';\r
import { world } from './world';\r
\r
const BOX = 'inline-size: 100%; max-inline-size: 26rem; background: var(--mx-color-bg-card)';\r
\r
/** Single, multiple or no selection, the selected keys bound with x-model. */\r
export default function Selection() {\r
  const s = reactive({ mode: 'multiple' as TreeViewSelectionMode, picked: [] as unknown[] });\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Selection mode">\r
        {(['single', 'multiple', 'none'] as const).map((mode) => (\r
          <Button\r
            key={mode}\r
            text={mode}\r
            size="sm"\r
            variant={() => (s.mode === mode ? 'solid' : 'ghost')}\r
            aria-pressed={() => s.mode === mode}\r
            onclick={() => (s.mode = mode)}\r
          />\r
        ))}\r
      </Stack>\r
      <Panel variant="outline" padding="xxs" style={BOX}>\r
        <TreeView class="tv-select" label="Places" items={world()} expandedKeys={['europe', 'tr']} selectionMode={() => s.mode} x-model={() => s.picked} />\r
      </Panel>\r
      <output class="tv-picked">{() => \`value: \${JSON.stringify(s.picked)}\`}</output>\r
    </>\r
  );\r
}\r
`,ee=`import { reactive } from '@motifx/core';\r
import { Button, Panel, Stack, TreeView } from '@motifx-community/ui';\r
import type { Entry } from './entry';\r
import { FILE, FOLDER, icon } from './icon';\r
import { project } from './project';\r
\r
const BOX = 'inline-size: 100%; max-inline-size: 26rem; background: var(--mx-color-bg-card)';\r
\r
/** Row sizes, lines under the parents, and what opens a row. */\r
export default function SizesAndLines() {\r
  const s = reactive({ size: 'md' as 'sm' | 'md' | 'lg', lines: true, expandOn: 'expander' as 'expander' | 'click' | 'dblclick' });\r
  return (\r
    <>\r
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Size">\r
        {(['sm', 'md', 'lg'] as const).map((size) => (\r
          <Button\r
            key={size}\r
            text={size}\r
            size="sm"\r
            variant={() => (s.size === size ? 'solid' : 'ghost')}\r
            aria-pressed={() => s.size === size}\r
            onclick={() => (s.size = size)}\r
          />\r
        ))}\r
        <Button text="Lines" size="sm" variant="outline" toggle x-model={() => s.lines} />\r
      </Stack>\r
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Opens on">\r
        {(['expander', 'click', 'dblclick'] as const).map((how) => (\r
          <Button\r
            key={how}\r
            text={\`expandOn \${how}\`}\r
            size="sm"\r
            variant={() => (s.expandOn === how ? 'solid' : 'ghost')}\r
            aria-pressed={() => s.expandOn === how}\r
            onclick={() => (s.expandOn = how)}\r
          />\r
        ))}\r
      </Stack>\r
      <Panel variant="outline" padding="xxs" style={BOX}>\r
        <TreeView\r
          class="tv-look"\r
          label="Look"\r
          items={project()}\r
          expandedKeys={['src', 'components', 'docs']}\r
          size={() => s.size}\r
          showLines={() => s.lines}\r
          expandOn={() => s.expandOn}\r
          iconField={(entry: Entry) => icon(entry.folder ? FOLDER : FILE)}\r
        />\r
      </Panel>\r
    </>\r
  );\r
}\r
`,te=`/** A row of the trees on this page. */\r
export interface Entry {\r
  id: string;\r
  text: string;\r
  folder?: boolean;\r
  hasChildren?: boolean;\r
  children?: Entry[];\r
  enabled?: boolean;\r
  expanded?: boolean;\r
  count?: number;\r
}\r
`,w=`const SVG = 'http://www.w3.org/2000/svg';\r
\r
export const FOLDER = 'M1.5 3.5h5l1.5 1.5h6.5v8h-13z';\r
export const FILE = 'M3.5 1.5h6l3 3v10h-9zM9.5 1.5v3h3';\r
\r
/** A small outline icon, a new element for each row. */\r
export function icon(path: string): SVGSVGElement {\r
  const svg = document.createElementNS(SVG, 'svg');\r
  svg.setAttribute('viewBox', '0 0 16 16');\r
  const line = svg.appendChild(document.createElementNS(SVG, 'path'));\r
  line.setAttribute('d', path);\r
  line.setAttribute('fill', 'none');\r
  line.setAttribute('stroke', 'currentColor');\r
  line.setAttribute('stroke-width', '1.2');\r
  line.setAttribute('stroke-linejoin', 'round');\r
  return svg;\r
}\r
`,T=`import type { Entry } from './entry';\r
\r
/** The files of a small project, nested. */\r
export function project(): Entry[] {\r
  return [\r
    {\r
      id: 'src',\r
      text: 'src',\r
      folder: true,\r
      children: [\r
        { id: 'main', text: 'main.ts' },\r
        {\r
          id: 'components',\r
          text: 'components',\r
          folder: true,\r
          children: [\r
            { id: 'button', text: 'Button.ts' },\r
            { id: 'tree', text: 'TreeView.ts' },\r
          ],\r
        },\r
      ],\r
    },\r
    { id: 'docs', text: 'docs', folder: true, children: [{ id: 'guide', text: 'guide.md' }] },\r
    { id: 'package', text: 'package.json' },\r
  ];\r
}\r
`,E=`import type { Entry } from './entry';\r
\r
/** Continents, countries and cities. */\r
export function world(): Entry[] {\r
  return [\r
    {\r
      id: 'europe',\r
      text: 'Europe',\r
      children: [\r
        { id: 'tr', text: 'Türkiye', children: [{ id: 'ankara', text: 'Ankara' }, { id: 'istanbul', text: 'İstanbul' }, { id: 'izmir', text: 'İzmir' }] },\r
        { id: 'de', text: 'Germany', children: [{ id: 'berlin', text: 'Berlin' }, { id: 'hamburg', text: 'Hamburg' }] },\r
        { id: 'it', text: 'Italy', children: [{ id: 'rome', text: 'Rome' }, { id: 'milan', text: 'Milan' }] },\r
      ],\r
    },\r
    {\r
      id: 'asia',\r
      text: 'Asia',\r
      children: [\r
        { id: 'jp', text: 'Japan', children: [{ id: 'tokyo', text: 'Tokyo' }, { id: 'osaka', text: 'Osaka' }] },\r
        { id: 'kr', text: 'Korea', children: [{ id: 'seoul', text: 'Seoul' }, { id: 'busan', text: 'Busan' }] },\r
      ],\r
    },\r
    { id: 'americas', text: 'Americas', children: [{ id: 'ca', text: 'Canada', children: [{ id: 'toronto', text: 'Toronto' }, { id: 'montreal', text: 'Montreal' }] }] },\r
  ];\r
}\r
`,D=`http://www.w3.org/2000/svg`,O=`M1.5 3.5h5l1.5 1.5h6.5v8h-13z`,k=`M3.5 1.5h6l3 3v10h-9zM9.5 1.5v3h3`;function A(e){let t=document.createElementNS(D,`svg`);t.setAttribute(`viewBox`,`0 0 16 16`);let n=t.appendChild(document.createElementNS(D,`path`));return n.setAttribute(`d`,e),n.setAttribute(`fill`,`none`),n.setAttribute(`stroke`,`currentColor`),n.setAttribute(`stroke-width`,`1.2`),n.setAttribute(`stroke-linejoin`,`round`),t}var j=`inline-size: 100%; max-inline-size: 26rem; background: var(--mx-color-bg-card)`,M={"/":[`Documents/`,`Pictures/`,`Shared/`,`notes.txt`],"/Documents/":[`Invoices/`,`Letters/`,`plan.docx`],"/Documents/Invoices/":[`2025/`,`2026/`],"/Documents/Invoices/2025/":[`january.pdf`,`february.pdf`],"/Documents/Invoices/2026/":[`march.pdf`],"/Documents/Letters/":[],"/Pictures/":[`holiday.jpg`,`cat.png`],"/Shared/":[`team.xlsx`]};function N(e){return(M[e]??[]).map(t=>{let n=t.endsWith(`/`);return{id:e+t,text:n?t.slice(0,-1):t,folder:n,hasChildren:n}})}function P(){let e=n({opened:``,loads:0}),t=!1,r=n=>new Promise((r,i)=>{e.loads++,setTimeout(()=>{n.id===`/Shared/`&&!t?(t=!0,i(Error(`The share is offline.`))):r(N(n.id))},500)});return c({initializeComponent:t=>{{let n=o(d,{variant:`outline`,padding:`xxs`,style:j,runover:{},childs:[o(f,{class:`tv-lazy`,label:`Disk`,items:[{id:`/`,text:`My disk`,folder:!0}],loadChildren:r,iconField:e=>A(e.folder?O:k),expandOn:`dblclick`,onExpanded:t=>e.opened=`Opened ${t.item.text}.`,runover:{},childs:[]})]});t.controls.add(n);let i=o(`output`,{initializeComponent:t=>{t.class.add(`tv-loads`),t.bindings.method(()=>`Loads: ${e.loads}. ${e.opened}`)}},1);t.controls.add(i)}}})}var F=`inline-size: 100%; max-inline-size: 26rem; background: var(--mx-color-bg-card)`,I=[{id:1,name:`Company`,parent:null},{id:2,name:`Sales`,parent:1},{id:3,name:`Engineering`,parent:1},{id:4,name:`Web`,parent:3},{id:5,name:`Mobile`,parent:3}],L=[{id:`inbox`,text:`Inbox`,count:12,expanded:!0,children:[{id:`work`,text:`Work`,count:3},{id:`family`,text:`Family`}]},{id:`sent`,text:`Sent`},{id:`spam`,text:`Spam`,count:99,enabled:!1}];function R(){let e=(e,t)=>{if(t.append(e.text),e.count){let n=document.createElement(`strong`);n.textContent=` · ${e.count}`,t.append(n)}};return c({initializeComponent:t=>{{let n=o(d,{variant:`outline`,padding:`xxs`,style:F,runover:{},childs:[o(f,{class:`tv-flat`,label:`Company`,items:I,parentField:`parent`,textField:e=>e.name,expandedKeys:[1,3],runover:{},childs:[]})]});t.controls.add(n);let r=o(d,{variant:`outline`,padding:`xxs`,style:F,runover:{},childs:[o(f,{class:`tv-template`,label:`Mail`,items:L,itemTemplate:e,runover:{},childs:[]})]});t.controls.add(r)}}})}function z(){return[{id:`src`,text:`src`,folder:!0,children:[{id:`main`,text:`main.ts`},{id:`components`,text:`components`,folder:!0,children:[{id:`button`,text:`Button.ts`},{id:`tree`,text:`TreeView.ts`}]}]},{id:`docs`,text:`docs`,folder:!0,children:[{id:`guide`,text:`guide.md`}]},{id:`package`,text:`package.json`}]}var B=`inline-size: 100%; max-inline-size: 26rem; background: var(--mx-color-bg-card)`;function V(){let e=n({file:`tree`,clicked:``}),t=n([{id:`home`,text:`Home`},{id:`products`,text:`Products`,children:[{id:`new`,text:`New`}]}]),i=0,a=new f({items:t,label:`Menu`,selectionMode:`none`});a.onItemClick(t=>e.clicked=`Pressed “${t.item.text}”.`);let s=()=>{i++,t[1].children.push({id:`p${i}`,text:`Product ${i}`}),a.refresh(),a.expand(`products`)};return c({initializeComponent:t=>{{let n=o(d,{variant:`outline`,padding:`xxs`,style:B,runover:{},childs:[o(f,{class:`tv-ways`,label:`Project files`,items:z(),expandedKeys:[`src`,`components`],runover:{initializeComponent:t=>{t.bindings.model(()=>e.file,t=>{let n=e;n!=null&&typeof n.file!=`function`&&(n.file=t)})}},childs:[]})]});t.controls.add(n);let i=o(`output`,{initializeComponent:t=>{t.class.add(`tv-value`),t.bindings.method(()=>`value: ${JSON.stringify(e.file)}`)}},1);t.controls.add(i);let c=o(u,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[o(r,{text:`Add a product programmatically`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,s)}},childs:[]}),o(r,{text:`Expand all`,variant:`ghost`,runover:{initializeComponent:e=>{e.motif.on(`click`,()=>a.expandAll())}},childs:[]}),o(r,{text:`Collapse all`,variant:`ghost`,runover:{initializeComponent:e=>{e.motif.on(`click`,()=>a.collapseAll())}},childs:[]}),o(`output`,{initializeComponent:t=>{t.class.add(`tv-clicked`),t.bindings.method(()=>e.clicked)}},1)]});t.controls.add(c);let l=o(d,{variant:`outline`,padding:`xxs`,style:B,ref:e=>e.controls.add(a),runover:{},childs:[]});t.controls.add(l)}}})}var H=`inline-size: 100%; max-inline-size: 26rem; background: var(--mx-color-bg-card)`,U=Array.from({length:50},(e,t)=>({id:`d${t}`,text:`Department ${t+1}`,children:Array.from({length:200},(e,n)=>({id:`d${t}p${n}`,text:`Person ${t+1}.${n+1}`}))}));function W(){let e=new f({items:U,label:`People`,showLines:!0});return e.element.style.blockSize=`20rem`,c({initializeComponent:t=>{{let n=o(u,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[o(r,{text:`Expand all`,variant:`outline`,runover:{initializeComponent:t=>{t.motif.on(`click`,()=>e.expandAll())}},childs:[]}),o(r,{text:`Collapse all`,variant:`ghost`,runover:{initializeComponent:t=>{t.motif.on(`click`,()=>e.collapseAll())}},childs:[]}),o(r,{text:`Go to Person 37.150`,variant:`ghost`,runover:{initializeComponent:t=>{t.motif.on(`click`,()=>e.focusNode(`d36p149`))}},childs:[]})]});t.controls.add(n);let i=o(d,{class:`tv-large`,variant:`outline`,padding:`xxs`,style:H,ref:t=>t.controls.add(e),runover:{},childs:[]});t.controls.add(i)}}})}function G(){let t=n({lang:`en`}),i=()=>{t.lang=t.lang===`en`?`tr`:`en`,e.use(t.lang)};return c({initializeComponent:e=>{{let n=o(r,{text:()=>t.lang===`en`?`Language: English`:`Dil: Türkçe`,variant:`outline`,runover:{initializeComponent:e=>{e.motif.on(`click`,i)}},childs:[]});e.controls.add(n);let a=o(`span`,{initializeComponent:e=>{let t=o(`text`,{initializeComponent:e=>{e.setText(`A failed load reads `)}},1);e.controls.add(t);let n=o(`output`,{initializeComponent:e=>{e.class.add(`tv-failed`),e.bindings.method(()=>`${h.strings.loadFailed} ${h.strings.retry}`)}},1);e.controls.add(n)}},1);e.controls.add(a)}}})}var K=`inline-size: 100%; max-inline-size: 26rem; background: var(--mx-color-bg-card)`,ne=()=>[{id:`admin`,text:`Administration`,expanded:!0,children:[{id:`users`,text:`Users`,children:[{id:`users.view`,text:`View`},{id:`users.edit`,text:`Edit`},{id:`users.delete`,text:`Delete`}]},{id:`roles`,text:`Roles`,children:[{id:`roles.view`,text:`View`},{id:`roles.edit`,text:`Edit`}]}]},{id:`content`,text:`Content`,expanded:!0,children:[{id:`articles`,text:`Articles`,children:[{id:`articles.read`,text:`Read`},{id:`articles.write`,text:`Write`},{id:`articles.publish`,text:`Publish`}]},{id:`media`,text:`Media`,children:[{id:`media.upload`,text:`Upload`},{id:`media.delete`,text:`Delete`}]}]},{id:`billing`,text:`Billing`,children:[{id:`invoices`,text:`Invoices`},{id:`cards`,text:`Payment methods`,enabled:!1}]}];function q(){let e=n({checked:[`users.view`,`articles.read`],recursive:!0}),t;return c({initializeComponent:n=>{{let i=o(u,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[o(r,{text:`Recursive`,size:`sm`,variant:`outline`,toggle:!0,runover:{initializeComponent:t=>{t.bindings.model(()=>e.recursive,t=>{let n=e;n!=null&&typeof n.recursive!=`function`&&(n.recursive=t)})}},childs:[]}),o(r,{text:`Check all`,size:`sm`,variant:`ghost`,runover:{initializeComponent:e=>{e.motif.on(`click`,()=>t.checkAll())}},childs:[]}),o(r,{text:`Uncheck all`,size:`sm`,variant:`ghost`,runover:{initializeComponent:e=>{e.motif.on(`click`,()=>t.uncheckAll())}},childs:[]})]});n.controls.add(i);let a=o(d,{variant:`outline`,padding:`xxs`,style:K,runover:{},childs:[o(f,{class:`tv-checks`,label:`Permissions`,items:ne(),showCheckBoxes:!0,selectionMode:`none`,checkRecursive:()=>e.recursive,checkedKeys:()=>e.checked,onCheckChanged:t=>e.checked=t.keys,ref:e=>t=e,runover:{},childs:[]})]});n.controls.add(a);let s=o(`output`,{initializeComponent:t=>{t.class.add(`tv-checked`),t.bindings.method(()=>`checkedKeys: ${JSON.stringify(e.checked)}`)}},1);n.controls.add(s)}}})}function J(){return[{id:`europe`,text:`Europe`,children:[{id:`tr`,text:`Türkiye`,children:[{id:`ankara`,text:`Ankara`},{id:`istanbul`,text:`İstanbul`},{id:`izmir`,text:`İzmir`}]},{id:`de`,text:`Germany`,children:[{id:`berlin`,text:`Berlin`},{id:`hamburg`,text:`Hamburg`}]},{id:`it`,text:`Italy`,children:[{id:`rome`,text:`Rome`},{id:`milan`,text:`Milan`}]}]},{id:`asia`,text:`Asia`,children:[{id:`jp`,text:`Japan`,children:[{id:`tokyo`,text:`Tokyo`},{id:`osaka`,text:`Osaka`}]},{id:`kr`,text:`Korea`,children:[{id:`seoul`,text:`Seoul`},{id:`busan`,text:`Busan`}]}]},{id:`americas`,text:`Americas`,children:[{id:`ca`,text:`Canada`,children:[{id:`toronto`,text:`Toronto`},{id:`montreal`,text:`Montreal`}]}]}]}var Y=`inline-size: 100%; max-inline-size: 26rem; background: var(--mx-color-bg-card)`;function X(){let e=n({search:``,startsWith:!1});return c({initializeComponent:t=>{{let n=o(u,{orientation:`horizontal`,wrap:!0,align:`center`,runover:{},childs:[o(r,{text:`Starts with`,size:`sm`,variant:`outline`,toggle:!0,runover:{initializeComponent:t=>{t.bindings.model(()=>e.startsWith,t=>{let n=e;n!=null&&typeof n.startsWith!=`function`&&(n.startsWith=t)})}},childs:[]})]});t.controls.add(n);let i=o(d,{variant:`outline`,padding:`xxs`,style:Y,runover:{},childs:[o(f,{class:`tv-search`,label:`Cities`,items:J(),searchEnabled:!0,searchMode:()=>e.startsWith?`startswith`:`contains`,runover:{},childs:[]})]});t.controls.add(i);let a=o(p,{label:`Filter from outside`,clearButton:!0,runover:{initializeComponent:t=>{t.bindings.model(()=>e.search,t=>{let n=e;n!=null&&typeof n.search!=`function`&&(n.search=t)})}},childs:[]});t.controls.add(a);let s=o(d,{variant:`outline`,padding:`xxs`,style:Y,runover:{},childs:[o(f,{class:`tv-filter`,label:`Filtered cities`,items:J(),searchValue:()=>e.search,runover:{},childs:[]})]});t.controls.add(s)}}})}var Z=`inline-size: 100%; max-inline-size: 26rem; background: var(--mx-color-bg-card)`;function re(){let e=n({mode:`multiple`,picked:[]});return c({initializeComponent:t=>{{let n=o(u,{orientation:`horizontal`,wrap:!0,align:`center`,role:`group`,"aria-label":`Selection mode`,runover:{},childs:[o({initializeComponent:t=>{t.bindings.list(()=>[`single`,`multiple`,`none`],t=>o(r,{indexkey:()=>t,text:t,size:`sm`,variant:()=>e.mode===t?`solid`:`ghost`,"aria-pressed":()=>e.mode===t,runover:{initializeComponent:n=>{n.motif.on(`click`,()=>e.mode=t)}},childs:[]}))}})]});t.controls.add(n);let i=o(d,{variant:`outline`,padding:`xxs`,style:Z,runover:{},childs:[o(f,{class:`tv-select`,label:`Places`,items:J(),expandedKeys:[`europe`,`tr`],selectionMode:()=>e.mode,runover:{initializeComponent:t=>{t.bindings.model(()=>e.picked,t=>{let n=e;n!=null&&typeof n.picked!=`function`&&(n.picked=t)})}},childs:[]})]});t.controls.add(i);let a=o(`output`,{initializeComponent:t=>{t.class.add(`tv-picked`),t.bindings.method(()=>`value: ${JSON.stringify(e.picked)}`)}},1);t.controls.add(a)}}})}var ie=`inline-size: 100%; max-inline-size: 26rem; background: var(--mx-color-bg-card)`;function ae(){let e=n({size:`md`,lines:!0,expandOn:`expander`});return c({initializeComponent:t=>{{let n=o(u,{orientation:`horizontal`,wrap:!0,align:`center`,role:`group`,"aria-label":`Size`,runover:{},childs:[o({initializeComponent:t=>{t.bindings.list(()=>[`sm`,`md`,`lg`],t=>o(r,{indexkey:()=>t,text:t,size:`sm`,variant:()=>e.size===t?`solid`:`ghost`,"aria-pressed":()=>e.size===t,runover:{initializeComponent:n=>{n.motif.on(`click`,()=>e.size=t)}},childs:[]}))}}),o(r,{text:`Lines`,size:`sm`,variant:`outline`,toggle:!0,runover:{initializeComponent:t=>{t.bindings.model(()=>e.lines,t=>{let n=e;n!=null&&typeof n.lines!=`function`&&(n.lines=t)})}},childs:[]})]});t.controls.add(n);let i=o(u,{orientation:`horizontal`,wrap:!0,align:`center`,role:`group`,"aria-label":`Opens on`,runover:{},childs:[o({initializeComponent:t=>{t.bindings.list(()=>[`expander`,`click`,`dblclick`],t=>o(r,{indexkey:()=>t,text:`expandOn ${t}`,size:`sm`,variant:()=>e.expandOn===t?`solid`:`ghost`,"aria-pressed":()=>e.expandOn===t,runover:{initializeComponent:n=>{n.motif.on(`click`,()=>e.expandOn=t)}},childs:[]}))}})]});t.controls.add(i);let a=o(d,{variant:`outline`,padding:`xxs`,style:ie,runover:{},childs:[o(f,{class:`tv-look`,label:`Look`,items:z(),expandedKeys:[`src`,`components`,`docs`],size:()=>e.size,showLines:()=>e.lines,expandOn:()=>e.expandOn,iconField:e=>A(e.folder?O:k),runover:{},childs:[]})]});t.controls.add(a)}}})}var Q=m(Object.assign({"./examples/FileExplorer.tsx":g,"./examples/FlatData.tsx":_,"./examples/LargeTree.tsx":v,"./examples/Localization.tsx":y,"./examples/Permissions.tsx":b,"./examples/Programmatic.tsx":x,"./examples/Search.tsx":S,"./examples/Selection.tsx":C,"./examples/SizesAndLines.tsx":ee,"./examples/entry.ts":te,"./examples/icon.ts":w,"./examples/project.ts":T,"./examples/world.ts":E})),oe=[[`items`,"`Bind<readonly T[]>`","`[]`","Nested items with a `children` array, or flat items with a `parentId`. A function is tracked, and items changed in place appear after `refresh()`."],[`textField, keyField, childrenField, parentField`,"`Bind<ItemField<T>>`","`'text'`, `'id'`, `'children'`, `'parentId'`","A property name or a function `(item) => …`. An item without a key serves as its own key. `parentField`, or items with a `parentId`, makes the list flat."],[`iconField, enabledField, expandedField, hasChildrenField`,"`Bind<ItemField<T>>`","`'icon'`, `'enabled'`, `'expanded'`, `'hasChildren'`",`Per item: an icon, whether the row can be selected or checked, whether it starts expanded (changing this expands or collapses it), and whether it has children to load.`],[`loadChildren`,"`Bind<(item) => Promise<T[]>>`",`—`,`Loads the children of a row when it is first expanded. The row shows a busy state meanwhile, and offers a retry if loading fails.`],[`selectionMode`,"`Bind<'none' | 'single' | 'multiple'>`","`'single'`",`How many rows can be selected.`],[`value`,"`Bind<unknown>`","`null`","The selected key (`single`) or keys (`multiple`). `x-model` provides two-way binding."],[`expandedKeys`,"`Bind<unknown[]>`","`[]`","The expanded rows. `onExpanded` and `onCollapsed` report changes made by the user."],[`showCheckBoxes`,"`Bind<boolean>`","`false`",`Adds a check box to every row.`],[`checkRecursive`,"`Bind<boolean>`","`true`",`Checking a parent checks its children, and a parent is indeterminate when only some are checked.`],[`checkedKeys`,"`Bind<unknown[]>`","`[]`","The checked rows. A parent is included when all its children are checked. `onCheckChanged` reports changes."],[`searchEnabled`,"`Bind<boolean>`","`false`",`Adds a search box at the top.`],[`searchMode`,"`Bind<'contains' | 'startswith'>`","`'contains'`",`How the search matches row text.`],[`searchValue`,"`Bind<string>`","`''`",`The text used to filter rows. Matches appear with their parents expanded.`],[`expandOn`,"`Bind<'expander' | 'click' | 'dblclick'>`","`'expander'`",`What expands a branch, in addition to its expander and the keyboard.`],[`showLines`,"`Bind<boolean>`","`false`",`Draws connector lines from each parent to its children.`],[`size`,"`Bind<ControlSize>`","`'md'`","`sm`, `md`, `lg`, from the density tokens."],[`label`,"`Bind<string>`","`''`","The accessible name of the tree. `aria-label` and `aria-labelledby` on the tag also work."],[`virtualFrom`,"`Bind<number>`","`500`",`When more rows than this are on screen, only the visible rows are rendered.`],[`itemTemplate`,"`Bind<(item, host) => cleanup | void>`",`—`,`Customizes the content of a row.`],[`enabled / disabled, visible, tabStop, tabIndex`,`see Control`,``,`Properties shared by all controls.`]],$=[[`every prop above`,`read/write, reactive`,`Accepts a value or a function, the same as the prop.`],[`selectedItems, checkedItems`,`read-only, reactive`,`The selected or checked items, in tree order.`],[`treeElement`,`read-only`,'The element with `role="tree"`.']],se=[[`expand(key), collapse(key)`,"`boolean`",`Expands or collapses a row, loading its children first if needed. The cancelable events run.`],[`expandAll(), collapseAll()`,"`void`",`Applies to every row whose children are known, with no event per row.`],[`select(key), unselect(key), selectAll(), clearSelection()`,"`void`","Programmatic control. `select` adds to the selection with `multiple`."],[`check(key, checked?), uncheck(key), checkAll(), uncheckAll()`,"`void`",`Programmatic control.`],[`filter(text)`,"`void`","Sets `searchValue`."],[`scrollTo(key), focusNode(key)`,"`boolean`",`Expands the row's parents, scrolls it into view and sets focus on it.`],[`reload(key?)`,"`void`",`Reloads a row's children, or all loaded children when no key is given.`],[`refresh()`,"`void`","Your items can be plain or reactive, and the tree reads them as they are. After changing them in place, call `refresh()`. The items, their children, text and states are read again, and loaded children are kept."],[`refreshItem(key)`,"`void`","Redraws one row after its item changes in place, including its text, icon and state. Use `refresh()` for its children."],[`itemOf(key)`,"`T | undefined`",`The item with that key.`],[`focus()`,"`boolean`",`Sets focus on the row that Tab reaches.`]],ce=[[`onExpanding(e), onCollapsing(e)`,"Occurs before a row expands or collapses. `e`: `{ item, key, byUser, cancel, source, event? }`. Set `e.cancel = true` to keep the current state."],[`onExpanded(e), onCollapsed(e)`,"Occurs after a row expands or collapses. `e`: `{ item, key, byUser, source }`."],[`onSelectionChanged(e)`,"`{ value, items, byUser, source, event? }`"],[`onCheckChanged(e)`,"`{ item, key, state, keys, byUser, source }`. `item` is `null` when several rows changed at once."],[`onItemClick(e)`,"Occurs when a row is clicked, or when Enter is pressed on it. `{ item, key, source, event }`"]],le=[[`Tab`,`Moves focus into the tree, to the focused row, the selected row or the first row, and out again. The tree is one Tab stop.`],[`Down / Up`,`Moves to the next or previous visible row.`],[`Right`,`Expands a collapsed row, or moves to the first child of an expanded row. On right-to-left pages, use Left.`],[`Left`,`Collapses an expanded row, or moves to the parent of a collapsed row. On right-to-left pages, use Right.`],[`Home / End, Page Up / Page Down`,`Moves to the first or last row, or up or down by one page.`],[`*`,`Expands all siblings of the row.`],[`A letter`,`Moves to the next row whose text starts with that character. Type quickly to match a longer prefix.`],[`Enter`,"Selects the row, and with `multiple` selects only that row."],[`Space`,"Toggles the check box if shown. Otherwise, it selects the row, or toggles it with `multiple`."],[`Shift + Down / Up`,"With `multiple`, moves and toggles the next row."],[`Shift + Space, Ctrl + Shift + Home / End, Ctrl + A`,"With `multiple`, selects from the last selected row to the current row, up to the first or last row, or everything."],[`Down in the search box`,`Moves focus into the tree.`]],ue=[[`Tree`,'`role="tree"`, named by `label`, or by `aria-label` or `aria-labelledby` on the tag, with `aria-multiselectable` for `multiple`.'],[`Rows`,'`role="treeitem"` with `aria-level`, `aria-setsize`, `aria-posinset`, `aria-expanded` on parents, `aria-selected` (unless `none`), `aria-checked` (`true`, `false`, `mixed`) with check boxes, and `aria-disabled`.'],[`Children`,'An expanded row contains a `role="group"` with its children. A large tree renders its rows flat, with the same levels and positions.'],[`Loading`,'A row loading its children has `aria-busy="true"`, and a failed load is described by its message (`aria-describedby`).'],[`Focus`,"Roving `tabindex`, so one row is in the Tab order. The focus ring appears only during keyboard use."]],de=[[`.mx-tree-view`,"The root. `data-size`, `data-lines`, `data-checkboxes`, `data-windowed`, `data-empty`, `data-disabled`."],[`.mx-tree-view__search, .mx-tree-view__body, .mx-tree-view__empty`,`The search box, the tree and the empty text.`],[`.mx-tree-view__item`,"A row and its children: `data-selected`, `data-expanded`, `data-branch`, `data-state`, `data-loading`, `data-error`, `data-disabled` and `--_level`."],[`.mx-tree-view__row`,`The visible row.`],[`.mx-tree-view__expander, __check, __icon, __text`,`The parts of a row.`],[`.mx-tree-view__group`,`The children of an expanded row.`],[`.mx-tree-view__error, .mx-tree-view__retry`,`A failed load and its retry button.`]],fe=[[`treeview.row, treeview.indicator, treeview.expander, treeview.expander-icon, treeview.spinner`,"Units: a row in each state (`hover`, `pressed`, `selected`, `selected-hover`, `focus`, `disabled`), the selection indicator, the expander and its plate, and the loading ring."],[`treeview.check, treeview.mark, treeview.icon, treeview.text, treeview.error, treeview.retry, treeview.empty, treeview.container, treeview.body`,"Units: the check box (`hover`, `checked`, `checked-hover`, `disabled`, `checked-disabled`) and the other parts."],[`treeview.row-height.*, treeview.padding.*, treeview.font-size.*, treeview.line-height.*, treeview.indent.*`,`Sizes per size class, and the indent of each level.`],[`treeview.row-spacing, treeview.expander-plate`,`The space between two rows, and the expander plate the connector lines are centered under.`],[`treeview.line-width, treeview.line-color, treeview.elbow-length, treeview.elbow-color`,"The connector lines (`showLines`)."]];function pe(){return c({initializeComponent:e=>{{let n=o(`p`,{initializeComponent:e=>{e.class.add(`lead`);let t=o(s,{text:`Displays items in a hierarchy. Rows can be expanded and collapsed, selected individually or in groups, and searched. Check boxes can roll up to parent rows, and children can load on demand when a row is first expanded. Large trees render only the visible rows.`,runover:{},childs:[]});e.controls.add(t)}},1);e.controls.add(n);let r=o(i,{anchor:`import`,title:`Import`,runover:{},childs:[o(t,{code:`
import { TreeView } from '@motifx-community/ui';
`,runover:{},childs:[]})]});e.controls.add(r);let c=o(i,{anchor:`ways`,title:`Declarative and programmatic`,runover:{},childs:[o(`p`,{initializeComponent:e=>{let t=o(s,{text:"Items are objects with a `children` array, or with a `parentId` as described below. `value` is the key of the selected row, and `x-model` provides two-way binding. When you create the tree with `new`, fill and control it programmatically. Plain or reactive items changed in place appear after `refresh()`, or `refreshItem(key)` for a single row.",runover:{},childs:[]});e.controls.add(t)}},1),o(a,{files:Q(`Programmatic.tsx`,`project.ts`,`entry.ts`),stack:!0,runover:{},childs:[o(V,{runover:{},childs:[]})]})]});e.controls.add(c);let u=o(i,{anchor:`lazy`,title:`File explorer with on-demand loading`,runover:{},childs:[o(`p`,{initializeComponent:e=>{let t=o(s,{text:"`loadChildren` loads the children of a row the first time it expands, and `hasChildren: false` marks a row with nothing to load. The row shows a busy state while loading. If loading fails, the row reports the error and offers a retry (“Shared” fails once in this example). `iconField` provides the icons, and here it is a function.",runover:{},childs:[]});e.controls.add(t)}},1),o(a,{files:Q(`FileExplorer.tsx`,`icon.ts`,`entry.ts`),stack:!0,runover:{},childs:[o(P,{runover:{},childs:[]})]})]});e.controls.add(u);let d=o(i,{anchor:`selection`,title:`Selection`,runover:{},childs:[o(`p`,{initializeComponent:e=>{let t=o(s,{text:"`selectionMode` is `single` (the default), `multiple` or `none`. With `multiple`, Ctrl (⌘) + click adds or removes a row, Shift + click selects a range, and the keyboard follows the APG multi-select tree pattern.",runover:{},childs:[]});e.controls.add(t)}},1),o(a,{files:Q(`Selection.tsx`,`world.ts`,`entry.ts`),stack:!0,runover:{},childs:[o(re,{runover:{},childs:[]})]})]});e.controls.add(d);let f=o(i,{anchor:`checks`,title:`Check boxes in a permissions tree`,runover:{},childs:[o(`p`,{initializeComponent:e=>{let t=o(s,{text:"`showCheckBoxes` adds a check box to every row. Checking a parent checks its children, and a parent shows an indeterminate state while only some are checked (`checkRecursive`, on by default). `checkedKeys` sets and reports the checked rows, and Space toggles the focused one.",runover:{},childs:[]});e.controls.add(t)}},1),o(a,{files:Q(`Permissions.tsx`,`entry.ts`),stack:!0,runover:{},childs:[o(q,{runover:{},childs:[]})]})]});e.controls.add(f);let p=o(i,{anchor:`search`,title:`Search and filtering`,runover:{},childs:[o(`p`,{initializeComponent:e=>{let t=o(s,{text:"`searchEnabled` adds a search box. Matches appear with their parents expanded, and clearing the search restores the previous state. `searchValue` or `filter(text)` filters programmatically, and `searchMode` is `contains` or `startswith`.",runover:{},childs:[]});e.controls.add(t)}},1),o(a,{files:Q(`Search.tsx`,`world.ts`,`entry.ts`),stack:!0,runover:{},childs:[o(X,{runover:{},childs:[]})]})]});e.controls.add(p);let m=o(i,{anchor:`data`,title:`Flat data, fields and templates`,runover:{},childs:[o(`p`,{initializeComponent:e=>{let t=o(s,{text:"Flat rows reference their parent through `parentField`, which defaults to `parentId`. Any field can be a property name or a function. `itemTemplate` customizes a row's content, and `enabledField` and `expandedField` apply per row.",runover:{},childs:[]});e.controls.add(t)}},1),o(a,{files:Q(`FlatData.tsx`,`entry.ts`),stack:!0,runover:{},childs:[o(R,{runover:{},childs:[]})]})]});e.controls.add(m);let h=o(i,{anchor:`large`,title:`Large trees`,runover:{},childs:[o(`p`,{initializeComponent:e=>{let t=o(s,{text:"Only expanded rows are rendered, and when more than `virtualFrom` (500) rows are on screen, only the visible ones are rendered. This example has 50 departments of 200 people, for 10,050 rows when fully expanded. Give the tree a height so that it scrolls internally.",runover:{},childs:[]});e.controls.add(t)}},1),o(a,{files:Q(`LargeTree.tsx`,`entry.ts`),stack:!0,runover:{},childs:[o(W,{runover:{},childs:[]})]})]});e.controls.add(h);let g=o(i,{anchor:`look`,title:`Sizes, connector lines and expand behavior`,runover:{},childs:[o(a,{files:Q(`SizesAndLines.tsx`,`project.ts`,`icon.ts`,`entry.ts`),stack:!0,runover:{},childs:[o(ae,{runover:{},childs:[]})]})]});e.controls.add(g);let _=o(i,{anchor:`keyboard`,title:`Keyboard`,runover:{},childs:[o(l,{head:[`Key`,`Description`],rows:le,runover:{},childs:[]})]});e.controls.add(_);let v=o(i,{anchor:`a11y`,title:`Accessibility`,runover:{},childs:[o(l,{head:[`Topic`,`Details`],rows:ue,runover:{},childs:[]})]});e.controls.add(v);let y=o(i,{anchor:`i18n`,title:`Localization`,runover:{},childs:[o(`p`,{initializeComponent:e=>{let t=o(s,{text:"The tree has four strings, all from `uiLocale.strings`: `noItems` (empty tree), `loadFailed` and `retry` (failed load), and `search` (the search box).",runover:{},childs:[]});e.controls.add(t)}},1),o(a,{files:Q(`Localization.tsx`),runover:{},childs:[o(G,{runover:{},childs:[]})]})]});e.controls.add(y);let b=o(i,{anchor:`styling`,title:`Styling`,runover:{},childs:[o(l,{head:[`Hook`,`Description`],rows:de,runover:{},childs:[]}),o(`h3`,{initializeComponent:e=>{let t=o(s,{text:`Component tokens`,runover:{},childs:[]});e.controls.add(t)}},1),o(l,{head:[`Token`,`Description`],rows:fe,runover:{},childs:[]})]});e.controls.add(b);let x=o(i,{anchor:`api`,title:`API reference`,runover:{},childs:[o(`h3`,{initializeComponent:e=>{let t=o(s,{text:`Props`,runover:{},childs:[]});e.controls.add(t)}},1),o(l,{head:[`Prop`,`Type`,`Default`,`Description`],rows:oe,runover:{},childs:[]}),o(`h3`,{initializeComponent:e=>{let t=o(s,{text:`Properties`,runover:{},childs:[]});e.controls.add(t)}},1),o(l,{head:[`Property`,`Access`,`Description`],rows:$,runover:{},childs:[]}),o(`h3`,{initializeComponent:e=>{let t=o(s,{text:`Methods`,runover:{},childs:[]});e.controls.add(t)}},1),o(l,{head:[`Method`,`Returns`,`Description`],rows:se,runover:{},childs:[]}),o(`h3`,{initializeComponent:e=>{let t=o(s,{text:`Events`,runover:{},childs:[]});e.controls.add(t)}},1),o(l,{head:[`Event`,`When`],rows:ce,runover:{},childs:[]})]});e.controls.add(x)}}})}export{pe as default};