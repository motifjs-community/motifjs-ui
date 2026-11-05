import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { sources } from '../../shared/sources';
import FileExplorer from './examples/FileExplorer';
import FlatData from './examples/FlatData';
import Programmatic from './examples/Programmatic';
import LargeTree from './examples/LargeTree';
import Localization from './examples/Localization';
import Permissions from './examples/Permissions';
import Search from './examples/Search';
import Selection from './examples/Selection';
import SizesAndLines from './examples/SizesAndLines';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

const PROPS = [
  ['items', '`Bind<readonly T[]>`', '`[]`', 'Nested items (a `children` array) or flat ones (a `parentId`). A function is followed; items changed in place show after `refresh()`.'],
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
  ['select(key), unselect(key), selectAll(), clearSelection()', '`void`', 'Programmatically; `select` adds to the selection with `multiple`.'],
  ['check(key, checked?), uncheck(key), checkAll(), uncheckAll()', '`void`', 'Programmatically.'],
  ['filter(text)', '`void`', 'Sets `searchValue`.'],
  ['scrollTo(key), focusNode(key)', '`boolean`', 'Opens the row\'s parents and scrolls it into view (and focuses it).'],
  ['reload(key?)', '`void`', 'Loads a row\'s children again (all loaded children without a key).'],
  ['refresh()', '`void`', 'Your items may be plain or reactive; the tree reads them as they are. After changing them in place, call `refresh()`. Which items there are, their children, texts and states are read again; children that loaded stay.'],
  ['refreshItem(key)', '`void`', 'Draws one row again after its item was changed in place: its text, icon and state. `refresh()` for its children.'],
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
  ['treeview.row, treeview.indicator, treeview.expander, treeview.expander-icon, treeview.spinner', 'Units: a row in each state (`hover`, `pressed`, `selected`, `selected-hover`, `focus`, `disabled`), the selection mark, the arrow and its plate, the loading ring.'],
  ['treeview.check, treeview.mark, treeview.icon, treeview.text, treeview.error, treeview.retry, treeview.empty, treeview.container, treeview.body', 'Units: the check box (`hover`, `checked`, `checked-hover`, `disabled`, `checked-disabled`) and the other parts.'],
  ['treeview.row-height.*, treeview.padding.*, treeview.font-size.*, treeview.line-height.*, treeview.indent.*', 'Sizes per size class, and how far each level moves in.'],
  ['treeview.row-spacing, treeview.expander-plate', 'The space between two rows; the arrow\'s plate the lines are centred under.'],
  ['treeview.line-width, treeview.line-color, treeview.elbow-length, treeview.elbow-color', 'The lines (`showLines`).'],
];

export default function TreeViewPage() {
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

      <Section anchor="ways" title="Declarative and programmatic">
        <p>
          <Rich text="Items are objects with a `children` array (or a `parentId`, see below). `value` is the selected row's key and `x-model` binds it two-way. Created with `new`, the tree is filled and driven programmatically; items changed in place, plain or reactive, show after `refresh()` (`refreshItem(key)` for one row)." />
        </p>
        <Example files={code('Programmatic.tsx', 'project.ts', 'entry.ts')} stack>
          <Programmatic />
        </Example>
      </Section>

      <Section anchor="lazy" title="File explorer: children that load">
        <p>
          <Rich text="`loadChildren` loads a row's children the first time it opens; `hasChildren: false` marks a row with nothing to load. While loading the row is busy; when the load fails it says so and offers a retry (here “Shared” fails once). Icons come from `iconField`, here a function." />
        </p>
        <Example files={code('FileExplorer.tsx', 'icon.ts', 'entry.ts')} stack>
          <FileExplorer />
        </Example>
      </Section>

      <Section anchor="selection" title="Selection">
        <p>
          <Rich text="`selectionMode` is `single` (default), `multiple` or `none`. With `multiple`, Ctrl (⌘) + press adds or removes a row, Shift + press selects a range, and the keys follow the APG multi-select tree." />
        </p>
        <Example files={code('Selection.tsx', 'world.ts', 'entry.ts')} stack>
          <Selection />
        </Example>
      </Section>

      <Section anchor="checks" title="Check boxes: a permissions tree">
        <p>
          <Rich text="`showCheckBoxes` puts a check box on every row. Checking a parent checks its children and a parent shows mixed while only some are (`checkRecursive`, on by default). `checkedKeys` gives and reports the checked rows; Space toggles the focused one." />
        </p>
        <Example files={code('Permissions.tsx', 'entry.ts')} stack>
          <Permissions />
        </Example>
      </Section>

      <Section anchor="search" title="Search and filter">
        <p>
          <Rich text="`searchEnabled` adds a search box; matches show with their parents, opened, and clearing the search brings the rows back as they were. `searchValue` (or `filter(text)`) filters programmatically; `searchMode` is `contains` or `startswith`." />
        </p>
        <Example files={code('Search.tsx', 'world.ts', 'entry.ts')} stack>
          <Search />
        </Example>
      </Section>

      <Section anchor="data" title="Flat data, fields and templates">
        <p>
          <Rich text="Flat rows name their parent (`parentField`, default `parentId`). Any field can be a property name or a function. `itemTemplate` draws a row's content; `enabledField` and `expandedField` act per row." />
        </p>
        <Example files={code('FlatData.tsx', 'entry.ts')} stack>
          <FlatData />
        </Example>
      </Section>

      <Section anchor="large" title="Large trees">
        <p>
          <Rich text="Only open rows are drawn, and with more than `virtualFrom` (500) rows on screen only the rows in view are: here 50 departments of 200 people, 10,050 rows when all are open. Give the tree a height so it scrolls inside." />
        </p>
        <Example files={code('LargeTree.tsx', 'entry.ts')} stack>
          <LargeTree />
        </Example>
      </Section>

      <Section anchor="look" title="Sizes, lines and opening">
        <Example files={code('SizesAndLines.tsx', 'project.ts', 'icon.ts', 'entry.ts')} stack>
          <SizesAndLines />
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
        <Example files={code('Localization.tsx')}>
          <Localization />
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
