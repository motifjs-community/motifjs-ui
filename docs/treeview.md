# TreeView

> Data · @motifx-community/ui 0.1.0-beta.4

Displays items in a hierarchy. Rows can be expanded and collapsed, selected individually or in groups, and searched. Check boxes can roll up to parent rows, and children can load on demand when a row is first expanded. Large trees render only the visible rows.

## Import

```tsx
import { TreeView } from '@motifx-community/ui';
```

## Declarative and programmatic

Items are objects with a `children` array, or with a `parentId` as described below. `value` is the key of the selected row, and `x-model` provides two-way binding. When you create the tree with `new`, fill and control it programmatically. Plain or reactive items changed in place appear after `refresh()`, or `refreshItem(key)` for a single row.

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

## File explorer with on-demand loading

`loadChildren` loads the children of a row the first time it expands, and `hasChildren: false` marks a row with nothing to load. The row shows a busy state while loading. If loading fails, the row reports the error and offers a retry (“Shared” fails once in this example). `iconField` provides the icons, and here it is a function.

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

`selectionMode` is `single` (the default), `multiple` or `none`. With `multiple`, Ctrl (⌘) + click adds or removes a row, Shift + click selects a range, and the keyboard follows the APG multi-select tree pattern.

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

## Check boxes in a permissions tree

`showCheckBoxes` adds a check box to every row. Checking a parent checks its children, and a parent shows an indeterminate state while only some are checked (`checkRecursive`, on by default). `checkedKeys` sets and reports the checked rows, and Space toggles the focused one.

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

## Search and filtering

`searchEnabled` adds a search box. Matches appear with their parents expanded, and clearing the search restores the previous state. `searchValue` or `filter(text)` filters programmatically, and `searchMode` is `contains` or `startswith`.

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

Flat rows reference their parent through `parentField`, which defaults to `parentId`. Any field can be a property name or a function. `itemTemplate` customizes a row's content, and `enabledField` and `expandedField` apply per row.

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

Only expanded rows are rendered, and when more than `virtualFrom` (500) rows are on screen, only the visible ones are rendered. This example has 50 departments of 200 people, for 10,050 rows when fully expanded. Give the tree a height so that it scrolls internally.

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

## Sizes, connector lines and expand behavior

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

| Key | Description |
| --- | --- |
| `Tab` | Moves focus into the tree, to the focused row, the selected row or the first row, and out again. The tree is one Tab stop. |
| `Down / Up` | Moves to the next or previous visible row. |
| `Right` | Expands a collapsed row, or moves to the first child of an expanded row. On right-to-left pages, use Left. |
| `Left` | Collapses an expanded row, or moves to the parent of a collapsed row. On right-to-left pages, use Right. |
| `Home / End, Page Up / Page Down` | Moves to the first or last row, or up or down by one page. |
| `*` | Expands all siblings of the row. |
| `A letter` | Moves to the next row whose text starts with that character. Type quickly to match a longer prefix. |
| `Enter` | Selects the row, and with `multiple` selects only that row. |
| `Space` | Toggles the check box if shown. Otherwise, it selects the row, or toggles it with `multiple`. |
| `Shift + Down / Up` | With `multiple`, moves and toggles the next row. |
| `Shift + Space, Ctrl + Shift + Home / End, Ctrl + A` | With `multiple`, selects from the last selected row to the current row, up to the first or last row, or everything. |
| `Down in the search box` | Moves focus into the tree. |

## Accessibility

| Topic | Details |
| --- | --- |
| `Tree` | `role="tree"`, named by `label`, or by `aria-label` or `aria-labelledby` on the tag, with `aria-multiselectable` for `multiple`. |
| `Rows` | `role="treeitem"` with `aria-level`, `aria-setsize`, `aria-posinset`, `aria-expanded` on parents, `aria-selected` (unless `none`), `aria-checked` (`true`, `false`, `mixed`) with check boxes, and `aria-disabled`. |
| `Children` | An expanded row contains a `role="group"` with its children. A large tree renders its rows flat, with the same levels and positions. |
| `Loading` | A row loading its children has `aria-busy="true"`, and a failed load is described by its message (`aria-describedby`). |
| `Focus` | Roving `tabindex`, so one row is in the Tab order. The focus ring appears only during keyboard use. |

## Localization

The tree has four strings, all from `uiLocale.strings`: `noItems` (empty tree), `loadFailed` and `retry` (failed load), and `search` (the search box).

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

| Hook | Description |
| --- | --- |
| `.mx-tree-view` | The root. `data-size`, `data-lines`, `data-checkboxes`, `data-windowed`, `data-empty`, `data-disabled`. |
| `.mx-tree-view__search, .mx-tree-view__body, .mx-tree-view__empty` | The search box, the tree and the empty text. |
| `.mx-tree-view__item` | A row and its children: `data-selected`, `data-expanded`, `data-branch`, `data-state`, `data-loading`, `data-error`, `data-disabled` and `--_level`. |
| `.mx-tree-view__row` | The visible row. |
| `.mx-tree-view__expander, __check, __icon, __text` | The parts of a row. |
| `.mx-tree-view__group` | The children of an expanded row. |
| `.mx-tree-view__error, .mx-tree-view__retry` | A failed load and its retry button. |

### Component tokens

| Token | Description |
| --- | --- |
| `treeview.row, treeview.indicator, treeview.expander, treeview.expander-icon, treeview.spinner` | Units: a row in each state (`hover`, `pressed`, `selected`, `selected-hover`, `focus`, `disabled`), the selection indicator, the expander and its plate, and the loading ring. |
| `treeview.check, treeview.mark, treeview.icon, treeview.text, treeview.error, treeview.retry, treeview.empty, treeview.container, treeview.body` | Units: the check box (`hover`, `checked`, `checked-hover`, `disabled`, `checked-disabled`) and the other parts. |
| `treeview.row-height.*, treeview.padding.*, treeview.font-size.*, treeview.line-height.*, treeview.indent.*` | Sizes per size class, and the indent of each level. |
| `treeview.row-spacing, treeview.expander-plate` | The space between two rows, and the expander plate the connector lines are centered under. |
| `treeview.line-width, treeview.line-color, treeview.elbow-length, treeview.elbow-color` | The connector lines (`showLines`). |

## API reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` | `Bind<readonly T[]>` | `[]` | Nested items with a `children` array, or flat items with a `parentId`. A function is tracked, and items changed in place appear after `refresh()`. |
| `textField, keyField, childrenField, parentField` | `Bind<ItemField<T>>` | `'text'`, `'id'`, `'children'`, `'parentId'` | A property name or a function `(item) => …`. An item without a key serves as its own key. `parentField`, or items with a `parentId`, makes the list flat. |
| `iconField, enabledField, expandedField, hasChildrenField` | `Bind<ItemField<T>>` | `'icon'`, `'enabled'`, `'expanded'`, `'hasChildren'` | Per item: an icon, whether the row can be selected or checked, whether it starts expanded (changing this expands or collapses it), and whether it has children to load. |
| `loadChildren` | `Bind<(item) => Promise<T[]>>` | — | Loads the children of a row when it is first expanded. The row shows a busy state meanwhile, and offers a retry if loading fails. |
| `selectionMode` | `Bind<'none' \| 'single' \| 'multiple'>` | `'single'` | How many rows can be selected. |
| `value` | `Bind<unknown>` | `null` | The selected key (`single`) or keys (`multiple`). `x-model` provides two-way binding. |
| `expandedKeys` | `Bind<unknown[]>` | `[]` | The expanded rows. `onExpanded` and `onCollapsed` report changes made by the user. |
| `showCheckBoxes` | `Bind<boolean>` | `false` | Adds a check box to every row. |
| `checkRecursive` | `Bind<boolean>` | `true` | Checking a parent checks its children, and a parent is indeterminate when only some are checked. |
| `checkedKeys` | `Bind<unknown[]>` | `[]` | The checked rows. A parent is included when all its children are checked. `onCheckChanged` reports changes. |
| `searchEnabled` | `Bind<boolean>` | `false` | Adds a search box at the top. |
| `searchMode` | `Bind<'contains' \| 'startswith'>` | `'contains'` | How the search matches row text. |
| `searchValue` | `Bind<string>` | `''` | The text used to filter rows. Matches appear with their parents expanded. |
| `expandOn` | `Bind<'expander' \| 'click' \| 'dblclick'>` | `'expander'` | What expands a branch, in addition to its expander and the keyboard. |
| `showLines` | `Bind<boolean>` | `false` | Draws connector lines from each parent to its children. |
| `size` | `Bind<ControlSize>` | `'md'` | `sm`, `md`, `lg`, from the density tokens. |
| `label` | `Bind<string>` | `''` | The accessible name of the tree. `aria-label` and `aria-labelledby` on the tag also work. |
| `virtualFrom` | `Bind<number>` | `500` | When more rows than this are on screen, only the visible rows are rendered. |
| `itemTemplate` | `Bind<(item, host) => cleanup \| void>` | — | Customizes the content of a row. |
| `enabled / disabled, visible, tabStop, tabIndex` | see Control |  | Properties shared by all controls. |

### Properties

| Property | Access | Description |
| --- | --- | --- |
| `every prop above` | read/write, reactive | Accepts a value or a function, the same as the prop. |
| `selectedItems, checkedItems` | read-only, reactive | The selected or checked items, in tree order. |
| `treeElement` | read-only | The element with `role="tree"`. |

### Methods

| Method | Returns | Description |
| --- | --- | --- |
| `expand(key), collapse(key)` | `boolean` | Expands or collapses a row, loading its children first if needed. The cancelable events run. |
| `expandAll(), collapseAll()` | `void` | Applies to every row whose children are known, with no event per row. |
| `select(key), unselect(key), selectAll(), clearSelection()` | `void` | Programmatic control. `select` adds to the selection with `multiple`. |
| `check(key, checked?), uncheck(key), checkAll(), uncheckAll()` | `void` | Programmatic control. |
| `filter(text)` | `void` | Sets `searchValue`. |
| `scrollTo(key), focusNode(key)` | `boolean` | Expands the row's parents, scrolls it into view and sets focus on it. |
| `reload(key?)` | `void` | Reloads a row's children, or all loaded children when no key is given. |
| `refresh()` | `void` | Your items can be plain or reactive, and the tree reads them as they are. After changing them in place, call `refresh()`. The items, their children, text and states are read again, and loaded children are kept. |
| `refreshItem(key)` | `void` | Redraws one row after its item changes in place, including its text, icon and state. Use `refresh()` for its children. |
| `itemOf(key)` | `T \| undefined` | The item with that key. |
| `focus()` | `boolean` | Sets focus on the row that Tab reaches. |

### Events

| Event | When |
| --- | --- |
| `onExpanding(e), onCollapsing(e)` | Occurs before a row expands or collapses. `e`: `{ item, key, byUser, cancel, source, event? }`. Set `e.cancel = true` to keep the current state. |
| `onExpanded(e), onCollapsed(e)` | Occurs after a row expands or collapses. `e`: `{ item, key, byUser, source }`. |
| `onSelectionChanged(e)` | `{ value, items, byUser, source, event? }` |
| `onCheckChanged(e)` | `{ item, key, state, keys, byUser, source }`. `item` is `null` when several rows changed at once. |
| `onItemClick(e)` | Occurs when a row is clicked, or when Enter is pressed on it. `{ item, key, source, event }` |

## Feedback

Loading issues…

## Example files

`Programmatic.tsx`

```tsx
import { reactive } from '@motifx/core';
import { Button, Panel, Stack, TreeView } from '@motifx-community/ui';
import type { Entry } from './entry';
import { project } from './project';

const BOX = 'inline-size: 100%; max-inline-size: 26rem; background: var(--mx-color-bg-card)';

/** A tree bound with x-model, and a tree created with `new` whose items change in place and are re-read on `refresh()`. */
export default function Programmatic() {
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
        <Button text="Add a product programmatically" variant="outline" onclick={addProduct} />
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

/** A sample disk: the entries of each folder. */
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

/** 50 departments of 200 people, created with `new`. Only the visible rows are rendered. */
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
