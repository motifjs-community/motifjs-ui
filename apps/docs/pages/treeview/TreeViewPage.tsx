import { reactive, type Component } from '@motifx/core';
import { Button, TextBox, TreeView, enStrings, trStrings, uiLocale, type TreeViewSelectionMode } from '@motifx-community/ui';
import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';

interface Entry {
  id: string;
  text: string;
  folder?: boolean;
  hasChildren?: boolean;
  children?: Entry[];
  enabled?: boolean;
  expanded?: boolean;
  count?: number;
}

const SVG = 'http://www.w3.org/2000/svg';

/** A small outline icon, a new element for each row. */
function icon(path: string): SVGSVGElement {
  const svg = document.createElementNS(SVG, 'svg');
  svg.setAttribute('viewBox', '0 0 16 16');
  const line = svg.appendChild(document.createElementNS(SVG, 'path'));
  line.setAttribute('d', path);
  line.setAttribute('fill', 'none');
  line.setAttribute('stroke', 'currentColor');
  line.setAttribute('stroke-width', '1.2');
  line.setAttribute('stroke-linejoin', 'round');
  return svg;
}

const FOLDER = 'M1.5 3.5h5l1.5 1.5h6.5v8h-13z';
const FILE = 'M3.5 1.5h6l3 3v10h-9zM9.5 1.5v3h3';

const PROJECT = (): Entry[] => [
  {
    id: 'src',
    text: 'src',
    folder: true,
    children: [
      { id: 'main', text: 'main.ts' },
      {
        id: 'components',
        text: 'components',
        folder: true,
        children: [
          { id: 'button', text: 'Button.ts' },
          { id: 'tree', text: 'TreeView.ts' },
        ],
      },
    ],
  },
  { id: 'docs', text: 'docs', folder: true, children: [{ id: 'guide', text: 'guide.md' }] },
  { id: 'package', text: 'package.json' },
];

/** A made-up disk: each folder's entries, read with a delay. */
const DISK: Record<string, string[]> = {
  '/': ['Documents/', 'Pictures/', 'Shared/', 'notes.txt'],
  '/Documents/': ['Invoices/', 'Letters/', 'plan.docx'],
  '/Documents/Invoices/': ['2025/', '2026/'],
  '/Documents/Invoices/2025/': ['january.pdf', 'february.pdf'],
  '/Documents/Invoices/2026/': ['march.pdf'],
  '/Documents/Letters/': [],
  '/Pictures/': ['holiday.jpg', 'cat.png'],
  '/Shared/': ['team.xlsx'],
};

function entriesOf(path: string): Entry[] {
  return (DISK[path] ?? []).map((name) => {
    const folder = name.endsWith('/');
    return { id: path + name, text: folder ? name.slice(0, -1) : name, folder, hasChildren: folder };
  });
}

const PERMISSIONS = (): Entry[] => [
  {
    id: 'admin',
    text: 'Administration',
    expanded: true,
    children: [
      { id: 'users', text: 'Users', children: [{ id: 'users.view', text: 'View' }, { id: 'users.edit', text: 'Edit' }, { id: 'users.delete', text: 'Delete' }] },
      { id: 'roles', text: 'Roles', children: [{ id: 'roles.view', text: 'View' }, { id: 'roles.edit', text: 'Edit' }] },
    ],
  },
  {
    id: 'content',
    text: 'Content',
    expanded: true,
    children: [
      { id: 'articles', text: 'Articles', children: [{ id: 'articles.read', text: 'Read' }, { id: 'articles.write', text: 'Write' }, { id: 'articles.publish', text: 'Publish' }] },
      { id: 'media', text: 'Media', children: [{ id: 'media.upload', text: 'Upload' }, { id: 'media.delete', text: 'Delete' }] },
    ],
  },
  { id: 'billing', text: 'Billing', children: [{ id: 'invoices', text: 'Invoices' }, { id: 'cards', text: 'Payment methods', enabled: false }] },
];

const WORLD = (): Entry[] => [
  {
    id: 'europe',
    text: 'Europe',
    children: [
      { id: 'tr', text: 'Türkiye', children: [{ id: 'ankara', text: 'Ankara' }, { id: 'istanbul', text: 'İstanbul' }, { id: 'izmir', text: 'İzmir' }] },
      { id: 'de', text: 'Germany', children: [{ id: 'berlin', text: 'Berlin' }, { id: 'hamburg', text: 'Hamburg' }] },
      { id: 'it', text: 'Italy', children: [{ id: 'rome', text: 'Rome' }, { id: 'milan', text: 'Milan' }] },
    ],
  },
  {
    id: 'asia',
    text: 'Asia',
    children: [
      { id: 'jp', text: 'Japan', children: [{ id: 'tokyo', text: 'Tokyo' }, { id: 'osaka', text: 'Osaka' }] },
      { id: 'kr', text: 'Korea', children: [{ id: 'seoul', text: 'Seoul' }, { id: 'busan', text: 'Busan' }] },
    ],
  },
  { id: 'americas', text: 'Americas', children: [{ id: 'ca', text: 'Canada', children: [{ id: 'toronto', text: 'Toronto' }, { id: 'montreal', text: 'Montreal' }] }] },
];

const FLAT = [
  { id: 1, name: 'Company', parent: null },
  { id: 2, name: 'Sales', parent: 1 },
  { id: 3, name: 'Engineering', parent: 1 },
  { id: 4, name: 'Web', parent: 3 },
  { id: 5, name: 'Mobile', parent: 3 },
];

const MANY: Entry[] = Array.from({ length: 50 }, (_, d) => ({
  id: `d${d}`,
  text: `Department ${d + 1}`,
  children: Array.from({ length: 200 }, (_, p) => ({ id: `d${d}p${p}`, text: `Person ${d + 1}.${p + 1}` })),
}));

const PANEL = 'inline-size: 100%; max-inline-size: 26rem; padding: var(--mx-space-1); border: var(--mx-border-width-1) solid var(--mx-color-stroke-card); border-radius: var(--mx-radius-lg); background: var(--mx-color-bg-card)';

const PROPS = [
  ['items', '`Bind<readonly T[]>`', '`[]`', 'Nested items (a `children` array) or flat ones (a `parentId`). A function is followed, and so are changes inside a reactive array.'],
  ['textField, keyField, childrenField, parentField', '`Bind<ItemField<T>>`', "`'text'`, `'id'`, `'children'`, `'parentId'`", 'A property name or a function `(item) => …`. An item without a key is its own key. `parentField` (or items with a `parentId`) makes the list flat.'],
  ['iconField, enabledField, expandedField, hasChildrenField', '`Bind<ItemField<T>>`', "`'icon'`, `'enabled'`, `'expanded'`, `'hasChildren'`", 'Per item: an icon, a row that cannot be selected or checked, a row open from the start (a change there opens or closes it), a row that has no children to load.'],
  ['loadChildren', '`Bind<(item) => Promise<T[]>>`', '—', 'Loads a row\'s children when it is first opened; the row is busy meanwhile and offers a retry when it fails.'],
  ['selectionMode', "`Bind<'none' | 'single' | 'multiple'>`", "`'single'`", 'How many rows can be selected.'],
  ['value', '`Bind<unknown>`', '`null`', 'The selected key (`single`) or keys (`multiple`). `x-model` binds it two-way.'],
  ['expandedKeys', '`Bind<unknown[]>`', '`[]`', 'The open rows. `onExpanded` / `onCollapsed` report the user\'s changes.'],
  ['showCheckBoxes', '`Bind<boolean>`', '`false`', 'A check box on every row.'],
  ['checkRecursive', '`Bind<boolean>`', '`true`', 'Checking a parent checks its children; a parent is mixed when some are checked.'],
  ['checkedKeys', '`Bind<unknown[]>`', '`[]`', 'The checked rows (a parent is in it when all its children are). `onCheckChanged` reports changes.'],
  ['searchEnabled', '`Bind<boolean>`', '`false`', 'A search box at the top.'],
  ['searchMode', "`Bind<'contains' | 'startswith'>`", "`'contains'`", 'How the search matches the row text.'],
  ['searchValue', '`Bind<string>`', "`''`", 'The text the rows are filtered by. Matches show with their parents, opened.'],
  ['expandOn', "`Bind<'expander' | 'click' | 'dblclick'>`", "`'expander'`", 'What opens a branch besides its arrow and the keys.'],
  ['showLines', '`Bind<boolean>`', '`false`', 'Lines under each parent, down to its children.'],
  ['size', '`Bind<ControlSize>`', "`'md'`", '`sm`, `md`, `lg`, from the density tokens.'],
  ['label', '`Bind<string>`', "`''`", 'The tree\'s accessible name. `aria-label` / `aria-labelledby` on the tag work too.'],
  ['virtualFrom', '`Bind<number>`', '`500`', 'With more rows on screen than this, only the rows in view are drawn.'],
  ['itemTemplate', '`Bind<(item, host) => cleanup | void>`', '—', 'Draws a row\'s content yourself.'],
  ['enabled / disabled, visible, tabStop, tabIndex', 'see Control', '', 'The shared properties of every control.'],
];

const PROPERTIES = [
  ['every prop above', 'read/write, reactive', 'A value or a function, like the prop.'],
  ['selectedItems, checkedItems', 'read-only, reactive', 'The selected / checked items, in tree order.'],
  ['treeElement', 'read-only', 'The element with `role="tree"`.'],
];

const METHODS = [
  ['expand(key), collapse(key)', '`boolean`', 'Opens / closes a row; children load first if they have to. The cancelable events run.'],
  ['expandAll(), collapseAll()', '`void`', 'Every row whose children are known. No event per row.'],
  ['select(key), unselect(key), selectAll(), clearSelection()', '`void`', 'From code; `select` adds to the selection with `multiple`.'],
  ['check(key, checked?), uncheck(key), checkAll(), uncheckAll()', '`void`', 'From code.'],
  ['filter(text)', '`void`', 'Sets `searchValue`.'],
  ['scrollTo(key), focusNode(key)', '`boolean`', 'Opens the row\'s parents and scrolls it into view (and focuses it).'],
  ['reload(key?)', '`void`', 'Loads a row\'s children again (all loaded children without a key).'],
  ['itemOf(key)', '`T | undefined`', 'The item with that key.'],
  ['focus()', '`boolean`', 'Focuses the row Tab reaches.'],
];

const EVENTS = [
  ['onExpanding(e), onCollapsing(e)', 'A row is about to open / close. `e`: `{ item, key, byUser, cancel, source, event? }`; `e.cancel = true` leaves it.'],
  ['onExpanded(e), onCollapsed(e)', 'A row opened / closed. `e`: `{ item, key, byUser, source }`.'],
  ['onSelectionChanged(e)', '`{ value, items, byUser, source, event? }`'],
  ['onCheckChanged(e)', '`{ item, key, state, keys, byUser, source }`; `item` is `null` when many changed at once.'],
  ['onItemClick(e)', 'A row was pressed, or Enter was pressed on it. `{ item, key, source, event }`'],
];

const KEYS = [
  ['Tab', 'Into the tree, to the focused (else the selected, else the first) row; out again. One Tab stop.'],
  ['Down / Up', 'The next / previous row on screen.'],
  ['Right', 'Opens a closed row; on an open one, goes to its first child. Left in right-to-left pages.'],
  ['Left', 'Closes an open row; on a closed one, goes to its parent. Right in right-to-left pages.'],
  ['Home / End, Page Up / Page Down', 'The first / last row; a page up or down.'],
  ['*', 'Opens every sibling of the row.'],
  ['A letter', 'The next row whose text starts with it (type several quickly for a longer start).'],
  ['Enter', 'Selects the row (only it, with `multiple`).'],
  ['Space', 'Toggles the check box when shown; otherwise selects (toggles, with `multiple`).'],
  ['Shift + Down / Up', 'With `multiple`: moves and toggles the next row.'],
  ['Shift + Space, Ctrl + Shift + Home / End, Ctrl + A', 'With `multiple`: selects from the last selected row, up to the first / last row, everything.'],
  ['Down in the search box', 'Into the tree.'],
];

const A11Y = [
  ['Tree', '`role="tree"`, named by `label` (or `aria-label` / `aria-labelledby` on the tag); `aria-multiselectable` with `multiple`.'],
  ['Rows', '`role="treeitem"` with `aria-level`, `aria-setsize`, `aria-posinset`, `aria-expanded` on parents, `aria-selected` (unless `none`), `aria-checked` (`true`, `false`, `mixed`) with check boxes, `aria-disabled`.'],
  ['Children', 'An open row holds a `role="group"` with its children. A long tree draws its rows flat, with the same levels and positions.'],
  ['Loading', 'A row whose children load has `aria-busy="true"`; a failed load is described by its message (`aria-describedby`).'],
  ['Focus', 'Roving `tabindex`: one row is in the Tab order. The focus ring shows for the keyboard only.'],
];

const HOOKS = [
  ['.mx-tree-view', 'The root. `data-size`, `data-lines`, `data-checkboxes`, `data-windowed`, `data-empty`, `data-disabled`.'],
  ['.mx-tree-view__search, .mx-tree-view__body, .mx-tree-view__empty', 'The search box, the tree, the empty text.'],
  ['.mx-tree-view__item', 'A row and its children: `data-selected`, `data-expanded`, `data-branch`, `data-state`, `data-loading`, `data-error`, `data-disabled`; `--_level`.'],
  ['.mx-tree-view__row', 'The painted row.'],
  ['.mx-tree-view__expander, __check, __icon, __text', 'The parts of a row.'],
  ['.mx-tree-view__group', 'The children of an open row.'],
  ['.mx-tree-view__error, .mx-tree-view__retry', 'A failed load and its retry button.'],
];

const TOKENS = [
  ['treeview.row-height.*, treeview.padding.*, treeview.font-size.*', 'Row sizes, from the density tokens.'],
  ['treeview.indent.*', 'How far each level moves in.'],
  ['treeview.gap, treeview.radius', 'Inside a row; its corners.'],
  ['treeview.hover, treeview.selected, treeview.indicator-width, treeview.indicator-color', 'Hover and selection (the bar at the start).'],
  ['treeview.expander-size, treeview.icon-size', 'The arrow and the icon.'],
  ['treeview.check-size, treeview.check-mark-size, treeview.check-radius', 'The check box.'],
  ['treeview.line-width, treeview.line-color', 'The lines (`showLines`).'],
  ['treeview.search-gap', 'Between the search box and the rows.'],
];

export default function TreeViewPage() {
  const s = reactive({
    file: 'tree' as unknown,
    opened: '',
    clicked: '',
    picked: [] as unknown[],
    mode: 'multiple' as TreeViewSelectionMode,
    checked: ['users.view', 'articles.read'] as unknown[],
    recursive: true,
    search: '',
    startsWith: false,
    lines: true,
    size: 'md' as 'sm' | 'md' | 'lg',
    expandOn: 'expander' as 'expander' | 'click' | 'dblclick',
    lang: 'en',
    loads: 0,
  });
  const menu = reactive<Entry[]>([
    { id: 'home', text: 'Home' },
    { id: 'products', text: 'Products', children: [{ id: 'new', text: 'New' }] },
  ]);
  let added = 0;
  let failed = false;
  let permissions!: TreeView<Entry>;

  const coded = new TreeView<Entry>({ items: menu, label: 'Menu', selectionMode: 'none' });
  coded.onItemClick((e) => (s.clicked = `Pressed “${e.item.text}”.`));
  const addPage = () => {
    added++;
    menu[1].children!.push({ id: `p${added}`, text: `Product ${added}` });
    coded.expand('products');
  };

  const big = new TreeView<Entry>({ items: MANY, label: 'People', showLines: true });
  big.element.style.blockSize = '20rem';

  const loadChildren = (entry: Entry) =>
    new Promise<Entry[]>((resolve, reject) => {
      s.loads++;
      setTimeout(() => {
        if (entry.id === '/Shared/' && !failed) {
          failed = true;
          reject(new Error('The share is offline.'));
        } else {
          resolve(entriesOf(entry.id));
        }
      }, 500);
    });

  const place = (target: TreeView<Entry>) => (c: Component<HTMLDivElement>) => c.controls.add(target);

  return (
    <>
      <p class="lead">
        A tree view shows items in a hierarchy. Rows open and close, are selected one or many at a time, can carry check boxes that add up
        to their parents, can be searched, and can load their children when they are first opened. Long trees draw only the rows in view.
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { TreeView } from '@motifx-community/ui';
`}
        />
      </Section>

      <Section anchor="ways" title="From JSX and from code">
        <p>
          <Rich text="Items are objects with a `children` array (or a `parentId`, see below). `value` is the selected row's key and `x-model` binds it two-way. Created with `new`, the tree is filled and driven from code; a reactive array given as `items` is followed when it changes in place." />
        </p>
        <Example
          code={`
<TreeView label="Project files" items={PROJECT} expandedKeys={['src', 'components']} x-model={() => this.state.file} />

const menu = reactive([{ id: 'home', text: 'Home' }, { id: 'products', text: 'Products', children: [] }]);
const tree = new TreeView({ items: menu, label: 'Menu', selectionMode: 'none' });
tree.onItemClick((e) => console.log(e.item.text));
menu[1].children.push({ id: 'p1', text: 'Product 1' });
tree.expand('products');
this.panel.controls.add(tree);
`}
          stack
        >
          <div style={PANEL}>
            <TreeView class="tv-ways" label="Project files" items={PROJECT()} expandedKeys={['src', 'components']} x-model={() => s.file} />
          </div>
          <output class="tv-value">{() => `value: ${JSON.stringify(s.file)}`}</output>
          <div class="docs-flow">
            <Button text="Add a product from code" variant="outline" onclick={addPage} />
            <Button text="Expand all" variant="ghost" onclick={() => coded.expandAll()} />
            <Button text="Collapse all" variant="ghost" onclick={() => coded.collapseAll()} />
            <output class="tv-clicked">{() => s.clicked}</output>
          </div>
          <div style={PANEL} onBuilt={place(coded)} />
        </Example>
      </Section>

      <Section anchor="lazy" title="File explorer: children that load">
        <p>
          <Rich text="`loadChildren` loads a row's children the first time it opens; `hasChildren: false` marks a row with nothing to load. While loading the row is busy; when the load fails it says so and offers a retry (here “Shared” fails once). Icons come from `iconField`, here a function." />
        </p>
        <Example
          code={`
<TreeView
  label="Disk"
  items={[{ id: '/', text: 'My disk', folder: true }]}
  loadChildren={(entry) => api.list(entry.id)}
  iconField={(entry) => icon(entry.folder ? FOLDER : FILE)}
  expandOn="dblclick"
/>
`}
          stack
        >
          <div style={PANEL}>
            <TreeView
              class="tv-lazy"
              label="Disk"
              items={[{ id: '/', text: 'My disk', folder: true }]}
              loadChildren={loadChildren}
              iconField={(entry: Entry) => icon(entry.folder ? FOLDER : FILE)}
              expandOn="dblclick"
              onExpanded={(e) => (s.opened = `Opened ${e.item.text}.`)}
            />
          </div>
          <output class="tv-loads">{() => `Loads: ${s.loads}. ${s.opened}`}</output>
        </Example>
      </Section>

      <Section anchor="selection" title="Selection">
        <p>
          <Rich text="`selectionMode` is `single` (default), `multiple` or `none`. With `multiple`, Ctrl (⌘) + press adds or removes a row, Shift + press selects a range, and the keys follow the APG multi-select tree." />
        </p>
        <Example
          code={`
<TreeView items={WORLD} selectionMode="multiple" x-model={() => this.state.picked} />
`}
          stack
        >
          <div class="docs-flow" role="group" aria-label="Selection mode">
            {(['single', 'multiple', 'none'] as const).map((mode) => (
              <Button
                key={mode}
                text={mode}
                size="sm"
                variant={() => (s.mode === mode ? 'solid' : 'ghost')}
                aria-pressed={() => s.mode === mode}
                onclick={() => (s.mode = mode)}
              />
            ))}
          </div>
          <div style={PANEL}>
            <TreeView class="tv-select" label="Places" items={WORLD()} expandedKeys={['europe', 'tr']} selectionMode={() => s.mode} x-model={() => s.picked} />
          </div>
          <output class="tv-picked">{() => `value: ${JSON.stringify(s.picked)}`}</output>
        </Example>
      </Section>

      <Section anchor="checks" title="Check boxes: a permissions tree">
        <p>
          <Rich text="`showCheckBoxes` puts a check box on every row. Checking a parent checks its children and a parent shows mixed while only some are (`checkRecursive`, on by default). `checkedKeys` gives and reports the checked rows; Space toggles the focused one." />
        </p>
        <Example
          code={`
<TreeView
  items={PERMISSIONS}
  showCheckBoxes
  selectionMode="none"
  checkedKeys={() => this.role.rights}
  onCheckChanged={(e) => (this.role.rights = e.keys)}
/>
`}
          stack
        >
          <div class="docs-flow">
            <Button text="Recursive" size="sm" variant="outline" toggle x-model={() => s.recursive} />
            <Button text="Check all" size="sm" variant="ghost" onclick={() => permissions.checkAll()} />
            <Button text="Uncheck all" size="sm" variant="ghost" onclick={() => permissions.uncheckAll()} />
          </div>
          <div style={PANEL}>
            <TreeView
              ref={(t: TreeView<Entry>) => (permissions = t)}
              class="tv-checks"
              label="Permissions"
              items={PERMISSIONS()}
              showCheckBoxes
              selectionMode="none"
              checkRecursive={() => s.recursive}
              checkedKeys={() => s.checked}
              onCheckChanged={(e) => (s.checked = e.keys)}
            />
          </div>
          <output class="tv-checked">{() => `checkedKeys: ${JSON.stringify(s.checked)}`}</output>
        </Example>
      </Section>

      <Section anchor="search" title="Search and filter">
        <p>
          <Rich text="`searchEnabled` adds a search box; matches show with their parents, opened, and clearing the search brings the rows back as they were. `searchValue` (or `filter(text)`) filters from code; `searchMode` is `contains` or `startswith`." />
        </p>
        <Example
          code={`
<TreeView items={WORLD} searchEnabled searchMode="startswith" />
<TreeView items={WORLD} searchValue={() => this.state.search} />
`}
          stack
        >
          <div class="docs-flow">
            <Button text="Starts with" size="sm" variant="outline" toggle x-model={() => s.startsWith} />
          </div>
          <div style={PANEL}>
            <TreeView class="tv-search" label="Cities" items={WORLD()} searchEnabled searchMode={() => (s.startsWith ? 'startswith' : 'contains')} />
          </div>
          <TextBox label="Filter from outside" x-model={() => s.search} clearButton />
          <div style={PANEL}>
            <TreeView class="tv-filter" label="Filtered cities" items={WORLD()} searchValue={() => s.search} />
          </div>
        </Example>
      </Section>

      <Section anchor="data" title="Flat data, fields and templates">
        <p>
          <Rich text="Flat rows name their parent (`parentField`, default `parentId`). Any field can be a property name or a function. `itemTemplate` draws a row's content; `enabledField` and `expandedField` act per row." />
        </p>
        <Example
          code={`
<TreeView items={FLAT} parentField="parent" textField={(row) => row.name} expandedKeys={[1, 3]} />
<TreeView items={MAIL} itemTemplate={(item, host) => { host.append(item.text, badge(item.count)); }} />
`}
          stack
        >
          <div style={PANEL}>
            <TreeView class="tv-flat" label="Company" items={FLAT} parentField="parent" textField={(row: (typeof FLAT)[number]) => row.name} expandedKeys={[1, 3]} />
          </div>
          <div style={PANEL}>
            <TreeView
              class="tv-template"
              label="Mail"
              items={[
                { id: 'inbox', text: 'Inbox', count: 12, expanded: true, children: [{ id: 'work', text: 'Work', count: 3 }, { id: 'family', text: 'Family' }] },
                { id: 'sent', text: 'Sent' },
                { id: 'spam', text: 'Spam', count: 99, enabled: false },
              ]}
              itemTemplate={(item: Entry, host: HTMLElement) => {
                host.append(item.text);
                if (item.count) {
                  const badge = document.createElement('strong');
                  badge.textContent = ` · ${item.count}`;
                  host.append(badge);
                }
              }}
            />
          </div>
        </Example>
      </Section>

      <Section anchor="large" title="Large trees">
        <p>
          <Rich text="Only open rows are drawn, and with more than `virtualFrom` (500) rows on screen only the rows in view are: here 50 departments of 200 people, 10,050 rows when all are open. Give the tree a height so it scrolls inside." />
        </p>
        <Example
          code={`
const people = new TreeView({ items: departments, label: 'People', showLines: true });
people.element.style.blockSize = '20rem';
people.expandAll();
`}
          stack
        >
          <div class="docs-flow">
            <Button text="Expand all" variant="outline" onclick={() => big.expandAll()} />
            <Button text="Collapse all" variant="ghost" onclick={() => big.collapseAll()} />
            <Button text="Go to Person 37.150" variant="ghost" onclick={() => big.focusNode('d36p149')} />
          </div>
          <div class="tv-large" style={PANEL} onBuilt={place(big)} />
        </Example>
      </Section>

      <Section anchor="look" title="Sizes, lines and opening">
        <Example
          code={`
<TreeView size="sm" showLines expandOn="click" />
`}
          stack
        >
          <div class="docs-flow" role="group" aria-label="Size">
            {(['sm', 'md', 'lg'] as const).map((size) => (
              <Button
                key={size}
                text={size}
                size="sm"
                variant={() => (s.size === size ? 'solid' : 'ghost')}
                aria-pressed={() => s.size === size}
                onclick={() => (s.size = size)}
              />
            ))}
            <Button text="Lines" size="sm" variant="outline" toggle x-model={() => s.lines} />
          </div>
          <div class="docs-flow" role="group" aria-label="Opens on">
            {(['expander', 'click', 'dblclick'] as const).map((how) => (
              <Button
                key={how}
                text={`expandOn ${how}`}
                size="sm"
                variant={() => (s.expandOn === how ? 'solid' : 'ghost')}
                aria-pressed={() => s.expandOn === how}
                onclick={() => (s.expandOn = how)}
              />
            ))}
          </div>
          <div style={PANEL}>
            <TreeView
              class="tv-look"
              label="Look"
              items={PROJECT()}
              expandedKeys={['src', 'components', 'docs']}
              size={() => s.size}
              showLines={() => s.lines}
              expandOn={() => s.expandOn}
              iconField={(entry: Entry) => icon(entry.folder ? FOLDER : FILE)}
            />
          </div>
        </Example>
      </Section>

      <Section anchor="keyboard" title="Keyboard">
        <ApiTable head={['Key', 'What it does']} rows={KEYS} />
      </Section>

      <Section anchor="a11y" title="Accessibility">
        <ApiTable head={['Topic', 'How']} rows={A11Y} />
      </Section>

      <Section anchor="i18n" title="Localization">
        <p>
          <Rich text="The tree writes four texts, all from `uiLocale.strings`: `noItems` (nothing to show), `loadFailed` and `retry` (a failed load) and `search` (the search box)." />
        </p>
        <Example
          code={`
uiLocale.strings = trStrings;
`}
        >
          <Button
            text={() => (s.lang === 'en' ? 'Language: English' : 'Dil: Türkçe')}
            variant="outline"
            onclick={() => {
              s.lang = s.lang === 'en' ? 'tr' : 'en';
              uiLocale.strings = s.lang === 'en' ? enStrings : trStrings;
            }}
          />
          <span>
            A failed load reads <output class="tv-failed">{() => `${uiLocale.strings.loadFailed} ${uiLocale.strings.retry}`}</output>
          </span>
        </Example>
      </Section>

      <Section anchor="styling" title="Styling">
        <ApiTable head={['Hook', 'What it is']} rows={HOOKS} />
        <h3>Component tokens</h3>
        <ApiTable head={['Token', 'What it sets']} rows={TOKENS} />
      </Section>

      <Section anchor="api" title="API reference">
        <h3>Props</h3>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
        <h3>Properties</h3>
        <ApiTable head={['Property', 'Access', 'Description']} rows={PROPERTIES} />
        <h3>Methods</h3>
        <ApiTable head={['Method', 'Returns', 'Description']} rows={METHODS} />
        <h3>Events</h3>
        <ApiTable head={['Event', 'When']} rows={EVENTS} />
      </Section>
    </>
  );
}
