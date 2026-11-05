# TreeView

> Data · @motifx-community/ui 0.1.0-beta.2

A tree view shows items in a hierarchy. Rows open and close, are selected one or many at a time, can carry check boxes that add up to their parents, can be searched, and can load their children when they are first opened. Long trees draw only the rows in view.

## Import

```tsx
import { TreeView } from '@motifx-community/ui';
```

## From JSX and from code

Items are objects with a `children` array (or a `parentId`, see below). `value` is the selected row's key and `x-model` binds it two-way. Created with `new`, the tree is filled and driven from code; items changed in place, plain or reactive, show after `refresh()` (`refreshItem(key)` for one row).

```tsx
/** A row of the trees on this page. */
export interface Entry {
  id: string;
  text: string;
  folder?: boolean;
  hasChildren?: boolean;
  children?: Entry[];
  enabled?: boolean;
  expanded?: boolean;
  count?: number;
}
```

## File explorer: children that load

`loadChildren` loads a row's children the first time it opens; `hasChildren: false` marks a row with nothing to load. While loading the row is busy; when the load fails it says so and offers a retry (here “Shared” fails once). Icons come from `iconField`, here a function.

```tsx
/** A row of the trees on this page. */
export interface Entry {
  id: string;
  text: string;
  folder?: boolean;
  hasChildren?: boolean;
  children?: Entry[];
  enabled?: boolean;
  expanded?: boolean;
  count?: number;
}
```

## Selection

`selectionMode` is `single` (default), `multiple` or `none`. With `multiple`, Ctrl (⌘) + press adds or removes a row, Shift + press selects a range, and the keys follow the APG multi-select tree.

```tsx
/** A row of the trees on this page. */
export interface Entry {
  id: string;
  text: string;
  folder?: boolean;
  hasChildren?: boolean;
  children?: Entry[];
  enabled?: boolean;
  expanded?: boolean;
  count?: number;
}
```

## Check boxes: a permissions tree

`showCheckBoxes` puts a check box on every row. Checking a parent checks its children and a parent shows mixed while only some are (`checkRecursive`, on by default). `checkedKeys` gives and reports the checked rows; Space toggles the focused one.

```tsx
/** A row of the trees on this page. */
export interface Entry {
  id: string;
  text: string;
  folder?: boolean;
  hasChildren?: boolean;
  children?: Entry[];
  enabled?: boolean;
  expanded?: boolean;
  count?: number;
}
```

## Search and filter

`searchEnabled` adds a search box; matches show with their parents, opened, and clearing the search brings the rows back as they were. `searchValue` (or `filter(text)`) filters from code; `searchMode` is `contains` or `startswith`.

```tsx
/** A row of the trees on this page. */
export interface Entry {
  id: string;
  text: string;
  folder?: boolean;
  hasChildren?: boolean;
  children?: Entry[];
  enabled?: boolean;
  expanded?: boolean;
  count?: number;
}
```

## Flat data, fields and templates

Flat rows name their parent (`parentField`, default `parentId`). Any field can be a property name or a function. `itemTemplate` draws a row's content; `enabledField` and `expandedField` act per row.

```tsx
/** A row of the trees on this page. */
export interface Entry {
  id: string;
  text: string;
  folder?: boolean;
  hasChildren?: boolean;
  children?: Entry[];
  enabled?: boolean;
  expanded?: boolean;
  count?: number;
}
```

## Large trees

Only open rows are drawn, and with more than `virtualFrom` (500) rows on screen only the rows in view are: here 50 departments of 200 people, 10,050 rows when all are open. Give the tree a height so it scrolls inside.

```tsx
/** A row of the trees on this page. */
export interface Entry {
  id: string;
  text: string;
  folder?: boolean;
  hasChildren?: boolean;
  children?: Entry[];
  enabled?: boolean;
  expanded?: boolean;
  count?: number;
}
```

## Sizes, lines and opening

```tsx
/** A row of the trees on this page. */
export interface Entry {
  id: string;
  text: string;
  folder?: boolean;
  hasChildren?: boolean;
  children?: Entry[];
  enabled?: boolean;
  expanded?: boolean;
  count?: number;
}
```

## Keyboard

| Key | What it does |
| --- | --- |
| `Tab` | Into the tree, to the focused (else the selected, else the first) row; out again. One Tab stop. |
| `Down / Up` | The next / previous row on screen. |
| `Right` | Opens a closed row; on an open one, goes to its first child. Left in right-to-left pages. |
| `Left` | Closes an open row; on a closed one, goes to its parent. Right in right-to-left pages. |
| `Home / End, Page Up / Page Down` | The first / last row; a page up or down. |
| `*` | Opens every sibling of the row. |
| `A letter` | The next row whose text starts with it (type several quickly for a longer start). |
| `Enter` | Selects the row (only it, with `multiple`). |
| `Space` | Toggles the check box when shown; otherwise selects (toggles, with `multiple`). |
| `Shift + Down / Up` | With `multiple`: moves and toggles the next row. |
| `Shift + Space, Ctrl + Shift + Home / End, Ctrl + A` | With `multiple`: selects from the last selected row, up to the first / last row, everything. |
| `Down in the search box` | Into the tree. |

## Accessibility

| Topic | How |
| --- | --- |
| `Tree` | `role="tree"`, named by `label` (or `aria-label` / `aria-labelledby` on the tag); `aria-multiselectable` with `multiple`. |
| `Rows` | `role="treeitem"` with `aria-level`, `aria-setsize`, `aria-posinset`, `aria-expanded` on parents, `aria-selected` (unless `none`), `aria-checked` (`true`, `false`, `mixed`) with check boxes, `aria-disabled`. |
| `Children` | An open row holds a `role="group"` with its children. A long tree draws its rows flat, with the same levels and positions. |
| `Loading` | A row whose children load has `aria-busy="true"`; a failed load is described by its message (`aria-describedby`). |
| `Focus` | Roving `tabindex`: one row is in the Tab order. The focus ring shows for the keyboard only. |

## Localization

The tree writes four texts, all from `uiLocale.strings`: `noItems` (nothing to show), `loadFailed` and `retry` (a failed load) and `search` (the search box).

```tsx
import { reactive } from '@motifx/core';
import { Button, uiLocale } from '@motifx-community/ui';
import { kitTexts } from '../../../shared/kit-texts';

/** Switches the texts of the kit; the trees on the page follow at once. */
export default function Localization() {
  const s = reactive({ lang: 'en' });
  const toggle = () => {
    s.lang = s.lang === 'en' ? 'tr' : 'en';
    void uiLocale.use(s.lang);
  };
  return (
    <>
      <Button text={() => (s.lang === 'en' ? 'Language: English' : 'Dil: Türkçe')} variant="outline" onclick={toggle} />
      <span>
        A failed load reads <output class="tv-failed">{() => `${kitTexts.strings.loadFailed} ${kitTexts.strings.retry}`}</output>
      </span>
    </>
  );
}
```

## Styling

| Hook | What it is |
| --- | --- |
| `.mx-tree-view` | The root. `data-size`, `data-lines`, `data-checkboxes`, `data-windowed`, `data-empty`, `data-disabled`. |
| `.mx-tree-view__search, .mx-tree-view__body, .mx-tree-view__empty` | The search box, the tree, the empty text. |
| `.mx-tree-view__item` | A row and its children: `data-selected`, `data-expanded`, `data-branch`, `data-state`, `data-loading`, `data-error`, `data-disabled`; `--_level`. |
| `.mx-tree-view__row` | The painted row. |
| `.mx-tree-view__expander, __check, __icon, __text` | The parts of a row. |
| `.mx-tree-view__group` | The children of an open row. |
| `.mx-tree-view__error, .mx-tree-view__retry` | A failed load and its retry button. |

### Component tokens

| Token | What it sets |
| --- | --- |
| `treeview.row, treeview.indicator, treeview.expander, treeview.expander-icon, treeview.spinner` | Units: a row in each state (`hover`, `pressed`, `selected`, `selected-hover`, `focus`, `disabled`), the selection mark, the arrow and its plate, the loading ring. |
| `treeview.check, treeview.mark, treeview.icon, treeview.text, treeview.error, treeview.retry, treeview.empty, treeview.container, treeview.body` | Units: the check box (`hover`, `checked`, `checked-hover`, `disabled`, `checked-disabled`) and the other parts. |
| `treeview.row-height.*, treeview.padding.*, treeview.font-size.*, treeview.line-height.*, treeview.indent.*` | Sizes per size class, and how far each level moves in. |
| `treeview.row-spacing, treeview.expander-plate` | The space between two rows; the arrow's plate the lines are centred under. |
| `treeview.line-width, treeview.line-color, treeview.elbow-length, treeview.elbow-color` | The lines (`showLines`). |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` | `Bind<readonly T[]>` | `[]` | Nested items (a `children` array) or flat ones (a `parentId`). A function is followed; items changed in place show after `refresh()`. |
| `textField, keyField, childrenField, parentField` | `Bind<ItemField<T>>` | `'text'`, `'id'`, `'children'`, `'parentId'` | A property name or a function `(item) => …`. An item without a key is its own key. `parentField` (or items with a `parentId`) makes the list flat. |
| `iconField, enabledField, expandedField, hasChildrenField` | `Bind<ItemField<T>>` | `'icon'`, `'enabled'`, `'expanded'`, `'hasChildren'` | Per item: an icon, a row that cannot be selected or checked, a row open from the start (a change there opens or closes it), a row that has no children to load. |
| `loadChildren` | `Bind<(item) => Promise<T[]>>` | — | Loads a row's children when it is first opened; the row is busy meanwhile and offers a retry when it fails. |
| `selectionMode` | `Bind<'none' \| 'single' \| 'multiple'>` | `'single'` | How many rows can be selected. |
| `value` | `Bind<unknown>` | `null` | The selected key (`single`) or keys (`multiple`). `x-model` binds it two-way. |
| `expandedKeys` | `Bind<unknown[]>` | `[]` | The open rows. `onExpanded` / `onCollapsed` report the user's changes. |
| `showCheckBoxes` | `Bind<boolean>` | `false` | A check box on every row. |
| `checkRecursive` | `Bind<boolean>` | `true` | Checking a parent checks its children; a parent is mixed when some are checked. |
| `checkedKeys` | `Bind<unknown[]>` | `[]` | The checked rows (a parent is in it when all its children are). `onCheckChanged` reports changes. |
| `searchEnabled` | `Bind<boolean>` | `false` | A search box at the top. |
| `searchMode` | `Bind<'contains' \| 'startswith'>` | `'contains'` | How the search matches the row text. |
| `searchValue` | `Bind<string>` | `''` | The text the rows are filtered by. Matches show with their parents, opened. |
| `expandOn` | `Bind<'expander' \| 'click' \| 'dblclick'>` | `'expander'` | What opens a branch besides its arrow and the keys. |
| `showLines` | `Bind<boolean>` | `false` | Lines under each parent, down to its children. |
| `size` | `Bind<ControlSize>` | `'md'` | `sm`, `md`, `lg`, from the density tokens. |
| `label` | `Bind<string>` | `''` | The tree's accessible name. `aria-label` / `aria-labelledby` on the tag work too. |
| `virtualFrom` | `Bind<number>` | `500` | With more rows on screen than this, only the rows in view are drawn. |
| `itemTemplate` | `Bind<(item, host) => cleanup \| void>` | — | Draws a row's content yourself. |
| `enabled / disabled, visible, tabStop, tabIndex` | see Control |  | The shared properties of every control. |

### Properties

| Property | Access | Description |
| --- | --- | --- |
| `every prop above` | read/write, reactive | A value or a function, like the prop. |
| `selectedItems, checkedItems` | read-only, reactive | The selected / checked items, in tree order. |
| `treeElement` | read-only | The element with `role="tree"`. |

### Methods

| Method | Returns | Description |
| --- | --- | --- |
| `expand(key), collapse(key)` | `boolean` | Opens / closes a row; children load first if they have to. The cancelable events run. |
| `expandAll(), collapseAll()` | `void` | Every row whose children are known. No event per row. |
| `select(key), unselect(key), selectAll(), clearSelection()` | `void` | From code; `select` adds to the selection with `multiple`. |
| `check(key, checked?), uncheck(key), checkAll(), uncheckAll()` | `void` | From code. |
| `filter(text)` | `void` | Sets `searchValue`. |
| `scrollTo(key), focusNode(key)` | `boolean` | Opens the row's parents and scrolls it into view (and focuses it). |
| `reload(key?)` | `void` | Loads a row's children again (all loaded children without a key). |
| `refresh()` | `void` | Your items may be plain or reactive; the tree reads them as they are. After changing them in place, call `refresh()`. Which items there are, their children, texts and states are read again; children that loaded stay. |
| `refreshItem(key)` | `void` | Draws one row again after its item was changed in place: its text, icon and state. `refresh()` for its children. |
| `itemOf(key)` | `T \| undefined` | The item with that key. |
| `focus()` | `boolean` | Focuses the row Tab reaches. |

### Events

| Event | When |
| --- | --- |
| `onExpanding(e), onCollapsing(e)` | A row is about to open / close. `e`: `{ item, key, byUser, cancel, source, event? }`; `e.cancel = true` leaves it. |
| `onExpanded(e), onCollapsed(e)` | A row opened / closed. `e`: `{ item, key, byUser, source }`. |
| `onSelectionChanged(e)` | `{ value, items, byUser, source, event? }` |
| `onCheckChanged(e)` | `{ item, key, state, keys, byUser, source }`; `item` is `null` when many changed at once. |
| `onItemClick(e)` | A row was pressed, or Enter was pressed on it. `{ item, key, source, event }` |

## Example files

`FromCode.tsx`

```tsx
import { reactive } from '@motifx/core';
import { Button, Panel, Stack, TreeView } from '@motifx-community/ui';
import type { Entry } from './entry';
import { project } from './project';

const BOX = 'inline-size: 100%; max-inline-size: 26rem; background: var(--mx-color-bg-card)';

/** A tree bound with x-model, and a tree made with `new` whose items change in place and are read again on `refresh()`. */
export default function FromCode() {
  const s = reactive({ file: 'tree' as unknown, clicked: '' });
  const menu = reactive<Entry[]>([
    { id: 'home', text: 'Home' },
    { id: 'products', text: 'Products', children: [{ id: 'new', text: 'New' }] },
  ]);
  let added = 0;

  const tree = new TreeView<Entry>({ items: menu, label: 'Menu', selectionMode: 'none' });
  tree.onItemClick((e) => (s.clicked = `Pressed “${e.item.text}”.`));

  const addProduct = () => {
    added++;
    menu[1].children!.push({ id: `p${added}`, text: `Product ${added}` });
    tree.refresh();
    tree.expand('products');
  };

  return (
    <>
      <Panel variant="outline" padding="xxs" style={BOX}>
        <TreeView class="tv-ways" label="Project files" items={project()} expandedKeys={['src', 'components']} x-model={() => s.file} />
      </Panel>
      <output class="tv-value">{() => `value: ${JSON.stringify(s.file)}`}</output>
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Add a product from code" variant="outline" onclick={addProduct} />
        <Button text="Expand all" variant="ghost" onclick={() => tree.expandAll()} />
        <Button text="Collapse all" variant="ghost" onclick={() => tree.collapseAll()} />
        <output class="tv-clicked">{() => s.clicked}</output>
      </Stack>
      <Panel variant="outline" padding="xxs" style={BOX} ref={(p: Panel) => p.controls.add(tree)} />
    </>
  );
}
```

`project.ts`

```tsx
import type { Entry } from './entry';

/** The files of a small project, nested. */
export function project(): Entry[] {
  return [
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
}
```

`entry.ts`

```tsx
/** A row of the trees on this page. */
export interface Entry {
  id: string;
  text: string;
  folder?: boolean;
  hasChildren?: boolean;
  children?: Entry[];
  enabled?: boolean;
  expanded?: boolean;
  count?: number;
}
```

`FileExplorer.tsx`

```tsx
import { reactive } from '@motifx/core';
import { Panel, TreeView } from '@motifx-community/ui';
import type { Entry } from './entry';
import { FILE, FOLDER, icon } from './icon';

const BOX = 'inline-size: 100%; max-inline-size: 26rem; background: var(--mx-color-bg-card)';

/** A made-up disk: each folder's entries. */
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

/** Children loaded when a folder first opens, with a load that fails once (Shared) and a retry. */
export default function FileExplorer() {
  const s = reactive({ opened: '', loads: 0 });
  let failed = false;

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

  return (
    <>
      <Panel variant="outline" padding="xxs" style={BOX}>
        <TreeView
          class="tv-lazy"
          label="Disk"
          items={[{ id: '/', text: 'My disk', folder: true }]}
          loadChildren={loadChildren}
          iconField={(entry: Entry) => icon(entry.folder ? FOLDER : FILE)}
          expandOn="dblclick"
          onExpanded={(e) => (s.opened = `Opened ${e.item.text}.`)}
        />
      </Panel>
      <output class="tv-loads">{() => `Loads: ${s.loads}. ${s.opened}`}</output>
    </>
  );
}
```

`icon.ts`

```tsx
const SVG = 'http://www.w3.org/2000/svg';

export const FOLDER = 'M1.5 3.5h5l1.5 1.5h6.5v8h-13z';
export const FILE = 'M3.5 1.5h6l3 3v10h-9zM9.5 1.5v3h3';

/** A small outline icon, a new element for each row. */
export function icon(path: string): SVGSVGElement {
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
```

`Selection.tsx`

```tsx
import { reactive } from '@motifx/core';
import { Button, Panel, Stack, TreeView, type TreeViewSelectionMode } from '@motifx-community/ui';
import { world } from './world';

const BOX = 'inline-size: 100%; max-inline-size: 26rem; background: var(--mx-color-bg-card)';

/** Single, multiple or no selection, the selected keys bound with x-model. */
export default function Selection() {
  const s = reactive({ mode: 'multiple' as TreeViewSelectionMode, picked: [] as unknown[] });
  return (
    <>
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Selection mode">
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
      </Stack>
      <Panel variant="outline" padding="xxs" style={BOX}>
        <TreeView class="tv-select" label="Places" items={world()} expandedKeys={['europe', 'tr']} selectionMode={() => s.mode} x-model={() => s.picked} />
      </Panel>
      <output class="tv-picked">{() => `value: ${JSON.stringify(s.picked)}`}</output>
    </>
  );
}
```

`world.ts`

```tsx
import type { Entry } from './entry';

/** Continents, countries and cities. */
export function world(): Entry[] {
  return [
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
}
```

`Permissions.tsx`

```tsx
import { reactive } from '@motifx/core';
import { Button, Panel, Stack, TreeView } from '@motifx-community/ui';
import type { Entry } from './entry';

const BOX = 'inline-size: 100%; max-inline-size: 26rem; background: var(--mx-color-bg-card)';

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

/** A permissions tree with check boxes that add up to their parents, the checked keys bound both ways. */
export default function Permissions() {
  const s = reactive({ checked: ['users.view', 'articles.read'] as unknown[], recursive: true });
  let tree!: TreeView<Entry>;
  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Recursive" size="sm" variant="outline" toggle x-model={() => s.recursive} />
        <Button text="Check all" size="sm" variant="ghost" onclick={() => tree.checkAll()} />
        <Button text="Uncheck all" size="sm" variant="ghost" onclick={() => tree.uncheckAll()} />
      </Stack>
      <Panel variant="outline" padding="xxs" style={BOX}>
        <TreeView
          ref={(t: TreeView<Entry>) => (tree = t)}
          class="tv-checks"
          label="Permissions"
          items={PERMISSIONS()}
          showCheckBoxes
          selectionMode="none"
          checkRecursive={() => s.recursive}
          checkedKeys={() => s.checked}
          onCheckChanged={(e) => (s.checked = e.keys)}
        />
      </Panel>
      <output class="tv-checked">{() => `checkedKeys: ${JSON.stringify(s.checked)}`}</output>
    </>
  );
}
```

`Search.tsx`

```tsx
import { reactive } from '@motifx/core';
import { Button, Panel, Stack, TextBox, TreeView } from '@motifx-community/ui';
import { world } from './world';

const BOX = 'inline-size: 100%; max-inline-size: 26rem; background: var(--mx-color-bg-card)';

/** A tree with its own search box, and a tree filtered from a field outside it. */
export default function Search() {
  const s = reactive({ search: '', startsWith: false });
  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Starts with" size="sm" variant="outline" toggle x-model={() => s.startsWith} />
      </Stack>
      <Panel variant="outline" padding="xxs" style={BOX}>
        <TreeView class="tv-search" label="Cities" items={world()} searchEnabled searchMode={() => (s.startsWith ? 'startswith' : 'contains')} />
      </Panel>
      <TextBox label="Filter from outside" x-model={() => s.search} clearButton />
      <Panel variant="outline" padding="xxs" style={BOX}>
        <TreeView class="tv-filter" label="Filtered cities" items={world()} searchValue={() => s.search} />
      </Panel>
    </>
  );
}
```

`FlatData.tsx`

```tsx
import { Panel, TreeView } from '@motifx-community/ui';
import type { Entry } from './entry';

const BOX = 'inline-size: 100%; max-inline-size: 26rem; background: var(--mx-color-bg-card)';

const FLAT = [
  { id: 1, name: 'Company', parent: null },
  { id: 2, name: 'Sales', parent: 1 },
  { id: 3, name: 'Engineering', parent: 1 },
  { id: 4, name: 'Web', parent: 3 },
  { id: 5, name: 'Mobile', parent: 3 },
];

const MAIL: Entry[] = [
  { id: 'inbox', text: 'Inbox', count: 12, expanded: true, children: [{ id: 'work', text: 'Work', count: 3 }, { id: 'family', text: 'Family' }] },
  { id: 'sent', text: 'Sent' },
  { id: 'spam', text: 'Spam', count: 99, enabled: false },
];

/** Flat rows that name their parent, a text field given as a function, and rows drawn by a template. */
export default function FlatData() {
  const withCount = (item: Entry, host: HTMLElement) => {
    host.append(item.text);
    if (item.count) {
      const badge = document.createElement('strong');
      badge.textContent = ` · ${item.count}`;
      host.append(badge);
    }
  };
  return (
    <>
      <Panel variant="outline" padding="xxs" style={BOX}>
        <TreeView class="tv-flat" label="Company" items={FLAT} parentField="parent" textField={(row: (typeof FLAT)[number]) => row.name} expandedKeys={[1, 3]} />
      </Panel>
      <Panel variant="outline" padding="xxs" style={BOX}>
        <TreeView class="tv-template" label="Mail" items={MAIL} itemTemplate={withCount} />
      </Panel>
    </>
  );
}
```

`LargeTree.tsx`

```tsx
import { Button, Panel, Stack, TreeView } from '@motifx-community/ui';
import type { Entry } from './entry';

const BOX = 'inline-size: 100%; max-inline-size: 26rem; background: var(--mx-color-bg-card)';

const DEPARTMENTS: Entry[] = Array.from({ length: 50 }, (_, d) => ({
  id: `d${d}`,
  text: `Department ${d + 1}`,
  children: Array.from({ length: 200 }, (_, p) => ({ id: `d${d}p${p}`, text: `Person ${d + 1}.${p + 1}` })),
}));

/** 50 departments of 200 people, made with `new`: only the rows in view are drawn. */
export default function LargeTree() {
  const people = new TreeView<Entry>({ items: DEPARTMENTS, label: 'People', showLines: true });
  people.element.style.blockSize = '20rem';
  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Expand all" variant="outline" onclick={() => people.expandAll()} />
        <Button text="Collapse all" variant="ghost" onclick={() => people.collapseAll()} />
        <Button text="Go to Person 37.150" variant="ghost" onclick={() => people.focusNode('d36p149')} />
      </Stack>
      <Panel class="tv-large" variant="outline" padding="xxs" style={BOX} ref={(p: Panel) => p.controls.add(people)} />
    </>
  );
}
```

`SizesAndLines.tsx`

```tsx
import { reactive } from '@motifx/core';
import { Button, Panel, Stack, TreeView } from '@motifx-community/ui';
import type { Entry } from './entry';
import { FILE, FOLDER, icon } from './icon';
import { project } from './project';

const BOX = 'inline-size: 100%; max-inline-size: 26rem; background: var(--mx-color-bg-card)';

/** Row sizes, lines under the parents, and what opens a row. */
export default function SizesAndLines() {
  const s = reactive({ size: 'md' as 'sm' | 'md' | 'lg', lines: true, expandOn: 'expander' as 'expander' | 'click' | 'dblclick' });
  return (
    <>
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Size">
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
      </Stack>
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Opens on">
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
      </Stack>
      <Panel variant="outline" padding="xxs" style={BOX}>
        <TreeView
          class="tv-look"
          label="Look"
          items={project()}
          expandedKeys={['src', 'components', 'docs']}
          size={() => s.size}
          showLines={() => s.lines}
          expandOn={() => s.expandOn}
          iconField={(entry: Entry) => icon(entry.folder ? FOLDER : FILE)}
        />
      </Panel>
    </>
  );
}
```
