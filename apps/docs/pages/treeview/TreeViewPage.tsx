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
  ['items', '`Bind<readonly T[]>`', '`[]`', 'Nested items with a `children` array, or flat items with a `parentId`. A function is tracked, and items changed in place appear after `refresh()`.'],
  ['textField, keyField, childrenField, parentField', '`Bind<ItemField<T>>`', "`'text'`, `'id'`, `'children'`, `'parentId'`", 'A property name or a function `(item) => …`. An item without a key serves as its own key. `parentField`, or items with a `parentId`, makes the list flat.'],
  ['iconField, enabledField, expandedField, hasChildrenField', '`Bind<ItemField<T>>`', "`'icon'`, `'enabled'`, `'expanded'`, `'hasChildren'`", 'Per item: an icon, whether the row can be selected or checked, whether it starts expanded (changing this expands or collapses it), and whether it has children to load.'],
  ['loadChildren', '`Bind<(item) => Promise<T[]>>`', '—', 'Loads the children of a row when it is first expanded. The row shows a busy state meanwhile, and offers a retry if loading fails.'],
  ['selectionMode', "`Bind<'none' | 'single' | 'multiple'>`", "`'single'`", 'How many rows can be selected.'],
  ['value', '`Bind<unknown>`', '`null`', 'The selected key (`single`) or keys (`multiple`). `x-model` provides two-way binding.'],
  ['expandedKeys', '`Bind<unknown[]>`', '`[]`', 'The expanded rows. `onExpanded` and `onCollapsed` report changes made by the user.'],
  ['showCheckBoxes', '`Bind<boolean>`', '`false`', 'Adds a check box to every row.'],
  ['checkRecursive', '`Bind<boolean>`', '`true`', 'Checking a parent checks its children, and a parent is indeterminate when only some are checked.'],
  ['checkedKeys', '`Bind<unknown[]>`', '`[]`', 'The checked rows. A parent is included when all its children are checked. `onCheckChanged` reports changes.'],
  ['searchEnabled', '`Bind<boolean>`', '`false`', 'Adds a search box at the top.'],
  ['searchMode', "`Bind<'contains' | 'startswith'>`", "`'contains'`", 'How the search matches row text.'],
  ['searchValue', '`Bind<string>`', "`''`", 'The text used to filter rows. Matches appear with their parents expanded.'],
  ['expandOn', "`Bind<'expander' | 'click' | 'dblclick'>`", "`'expander'`", 'What expands a branch, in addition to its expander and the keyboard.'],
  ['showLines', '`Bind<boolean>`', '`false`', 'Draws connector lines from each parent to its children.'],
  ['size', '`Bind<ControlSize>`', "`'md'`", '`sm`, `md`, `lg`, from the density tokens.'],
  ['label', '`Bind<string>`', "`''`", 'The accessible name of the tree. `aria-label` and `aria-labelledby` on the tag also work.'],
  ['virtualFrom', '`Bind<number>`', '`500`', 'When more rows than this are on screen, only the visible rows are rendered.'],
  ['itemTemplate', '`Bind<(item, host) => cleanup | void>`', '—', 'Customizes the content of a row.'],
  ['enabled / disabled, visible, tabStop, tabIndex', 'see Control', '', 'Properties shared by all controls.'],
];

const PROPERTIES = [
  ['every prop above', 'read/write, reactive', 'Accepts a value or a function, the same as the prop.'],
  ['selectedItems, checkedItems', 'read-only, reactive', 'The selected or checked items, in tree order.'],
  ['treeElement', 'read-only', 'The element with `role="tree"`.'],
];

const METHODS = [
  ['expand(key), collapse(key)', '`boolean`', 'Expands or collapses a row, loading its children first if needed. The cancelable events run.'],
  ['expandAll(), collapseAll()', '`void`', 'Applies to every row whose children are known, with no event per row.'],
  ['select(key), unselect(key), selectAll(), clearSelection()', '`void`', 'Programmatic control. `select` adds to the selection with `multiple`.'],
  ['check(key, checked?), uncheck(key), checkAll(), uncheckAll()', '`void`', 'Programmatic control.'],
  ['filter(text)', '`void`', 'Sets `searchValue`.'],
  ['scrollTo(key), focusNode(key)', '`boolean`', 'Expands the row\'s parents, scrolls it into view and sets focus on it.'],
  ['reload(key?)', '`void`', 'Reloads a row\'s children, or all loaded children when no key is given.'],
  ['refresh()', '`void`', 'Your items can be plain or reactive, and the tree reads them as they are. After changing them in place, call `refresh()`. The items, their children, text and states are read again, and loaded children are kept.'],
  ['refreshItem(key)', '`void`', 'Redraws one row after its item changes in place, including its text, icon and state. Use `refresh()` for its children.'],
  ['itemOf(key)', '`T | undefined`', 'The item with that key.'],
  ['focus()', '`boolean`', 'Sets focus on the row that Tab reaches.'],
];

const EVENTS = [
  ['onExpanding(e), onCollapsing(e)', 'Occurs before a row expands or collapses. `e`: `{ item, key, byUser, cancel, source, event? }`. Set `e.cancel = true` to keep the current state.'],
  ['onExpanded(e), onCollapsed(e)', 'Occurs after a row expands or collapses. `e`: `{ item, key, byUser, source }`.'],
  ['onSelectionChanged(e)', '`{ value, items, byUser, source, event? }`'],
  ['onCheckChanged(e)', '`{ item, key, state, keys, byUser, source }`. `item` is `null` when several rows changed at once.'],
  ['onItemClick(e)', 'Occurs when a row is clicked, or when Enter is pressed on it. `{ item, key, source, event }`'],
];

const KEYS = [
  ['Tab', 'Moves focus into the tree, to the focused row, the selected row or the first row, and out again. The tree is one Tab stop.'],
  ['Down / Up', 'Moves to the next or previous visible row.'],
  ['Right', 'Expands a collapsed row, or moves to the first child of an expanded row. On right-to-left pages, use Left.'],
  ['Left', 'Collapses an expanded row, or moves to the parent of a collapsed row. On right-to-left pages, use Right.'],
  ['Home / End, Page Up / Page Down', 'Moves to the first or last row, or up or down by one page.'],
  ['*', 'Expands all siblings of the row.'],
  ['A letter', 'Moves to the next row whose text starts with that character. Type quickly to match a longer prefix.'],
  ['Enter', 'Selects the row, and with `multiple` selects only that row.'],
  ['Space', 'Toggles the check box if shown. Otherwise, it selects the row, or toggles it with `multiple`.'],
  ['Shift + Down / Up', 'With `multiple`, moves and toggles the next row.'],
  ['Shift + Space, Ctrl + Shift + Home / End, Ctrl + A', 'With `multiple`, selects from the last selected row to the current row, up to the first or last row, or everything.'],
  ['Down in the search box', 'Moves focus into the tree.'],
];

const A11Y = [
  ['Tree', '`role="tree"`, named by `label`, or by `aria-label` or `aria-labelledby` on the tag, with `aria-multiselectable` for `multiple`.'],
  ['Rows', '`role="treeitem"` with `aria-level`, `aria-setsize`, `aria-posinset`, `aria-expanded` on parents, `aria-selected` (unless `none`), `aria-checked` (`true`, `false`, `mixed`) with check boxes, and `aria-disabled`.'],
  ['Children', 'An expanded row contains a `role="group"` with its children. A large tree renders its rows flat, with the same levels and positions.'],
  ['Loading', 'A row loading its children has `aria-busy="true"`, and a failed load is described by its message (`aria-describedby`).'],
  ['Focus', 'Roving `tabindex`, so one row is in the Tab order. The focus ring appears only during keyboard use.'],
];

const HOOKS = [
  ['.mx-tree-view', 'The root. `data-size`, `data-lines`, `data-checkboxes`, `data-windowed`, `data-empty`, `data-disabled`.'],
  ['.mx-tree-view__search, .mx-tree-view__body, .mx-tree-view__empty', 'The search box, the tree and the empty text.'],
  ['.mx-tree-view__item', 'A row and its children: `data-selected`, `data-expanded`, `data-branch`, `data-state`, `data-loading`, `data-error`, `data-disabled` and `--_level`.'],
  ['.mx-tree-view__row', 'The visible row.'],
  ['.mx-tree-view__expander, __check, __icon, __text', 'The parts of a row.'],
  ['.mx-tree-view__group', 'The children of an expanded row.'],
  ['.mx-tree-view__error, .mx-tree-view__retry', 'A failed load and its retry button.'],
];

const TOKENS = [
  ['treeview.row, treeview.indicator, treeview.expander, treeview.expander-icon, treeview.spinner', 'Units: a row in each state (`hover`, `pressed`, `selected`, `selected-hover`, `focus`, `disabled`), the selection indicator, the expander and its plate, and the loading ring.'],
  ['treeview.check, treeview.mark, treeview.icon, treeview.text, treeview.error, treeview.retry, treeview.empty, treeview.container, treeview.body', 'Units: the check box (`hover`, `checked`, `checked-hover`, `disabled`, `checked-disabled`) and the other parts.'],
  ['treeview.row-height.*, treeview.padding.*, treeview.font-size.*, treeview.line-height.*, treeview.indent.*', 'Sizes per size class, and the indent of each level.'],
  ['treeview.row-spacing, treeview.expander-plate', 'The space between two rows, and the expander plate the connector lines are centered under.'],
  ['treeview.line-width, treeview.line-color, treeview.elbow-length, treeview.elbow-color', 'The connector lines (`showLines`).'],
];

export default function TreeViewPage() {
  return (
    <>
      <p class="lead">
        <Rich text="Displays items in a hierarchy. Rows can be expanded and collapsed, selected individually or in groups, and searched. Check boxes can roll up to parent rows, and children can load on demand when a row is first expanded. Large trees render only the visible rows." />
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
          <Rich text="Items are objects with a `children` array, or with a `parentId` as described below. `value` is the key of the selected row, and `x-model` provides two-way binding. When you create the tree with `new`, fill and control it programmatically. Plain or reactive items changed in place appear after `refresh()`, or `refreshItem(key)` for a single row." />
        </p>
        <Example files={code('Programmatic.tsx', 'project.ts', 'entry.ts')} stack>
          <Programmatic />
        </Example>
      </Section>

      <Section anchor="lazy" title="File explorer with on-demand loading">
        <p>
          <Rich text="`loadChildren` loads the children of a row the first time it expands, and `hasChildren: false` marks a row with nothing to load. The row shows a busy state while loading. If loading fails, the row reports the error and offers a retry (“Shared” fails once in this example). `iconField` provides the icons, and here it is a function." />
        </p>
        <Example files={code('FileExplorer.tsx', 'icon.ts', 'entry.ts')} stack>
          <FileExplorer />
        </Example>
      </Section>

      <Section anchor="selection" title="Selection">
        <p>
          <Rich text="`selectionMode` is `single` (the default), `multiple` or `none`. With `multiple`, Ctrl (⌘) + click adds or removes a row, Shift + click selects a range, and the keyboard follows the APG multi-select tree pattern." />
        </p>
        <Example files={code('Selection.tsx', 'world.ts', 'entry.ts')} stack>
          <Selection />
        </Example>
      </Section>

      <Section anchor="checks" title="Check boxes in a permissions tree">
        <p>
          <Rich text="`showCheckBoxes` adds a check box to every row. Checking a parent checks its children, and a parent shows an indeterminate state while only some are checked (`checkRecursive`, on by default). `checkedKeys` sets and reports the checked rows, and Space toggles the focused one." />
        </p>
        <Example files={code('Permissions.tsx', 'entry.ts')} stack>
          <Permissions />
        </Example>
      </Section>

      <Section anchor="search" title="Search and filtering">
        <p>
          <Rich text="`searchEnabled` adds a search box. Matches appear with their parents expanded, and clearing the search restores the previous state. `searchValue` or `filter(text)` filters programmatically, and `searchMode` is `contains` or `startswith`." />
        </p>
        <Example files={code('Search.tsx', 'world.ts', 'entry.ts')} stack>
          <Search />
        </Example>
      </Section>

      <Section anchor="data" title="Flat data, fields and templates">
        <p>
          <Rich text="Flat rows reference their parent through `parentField`, which defaults to `parentId`. Any field can be a property name or a function. `itemTemplate` customizes a row's content, and `enabledField` and `expandedField` apply per row." />
        </p>
        <Example files={code('FlatData.tsx', 'entry.ts')} stack>
          <FlatData />
        </Example>
      </Section>

      <Section anchor="large" title="Large trees">
        <p>
          <Rich text="Only expanded rows are rendered, and when more than `virtualFrom` (500) rows are on screen, only the visible ones are rendered. This example has 50 departments of 200 people, for 10,050 rows when fully expanded. Give the tree a height so that it scrolls internally." />
        </p>
        <Example files={code('LargeTree.tsx', 'entry.ts')} stack>
          <LargeTree />
        </Example>
      </Section>

      <Section anchor="look" title="Sizes, connector lines and expand behavior">
        <Example files={code('SizesAndLines.tsx', 'project.ts', 'icon.ts', 'entry.ts')} stack>
          <SizesAndLines />
        </Example>
      </Section>

      <Section anchor="keyboard" title="Keyboard">
        <ApiTable head={['Key', 'Description']} rows={KEYS} />
      </Section>

      <Section anchor="a11y" title="Accessibility">
        <ApiTable head={['Topic', 'Details']} rows={A11Y} />
      </Section>

      <Section anchor="i18n" title="Localization">
        <p>
          <Rich text="The tree has four strings, all from `uiLocale.strings`: `noItems` (empty tree), `loadFailed` and `retry` (failed load), and `search` (the search box)." />
        </p>
        <Example files={code('Localization.tsx')}>
          <Localization />
        </Example>
      </Section>

      <Section anchor="styling" title="Styling">
        <ApiTable head={['Hook', 'Description']} rows={HOOKS} />
        <h3>
          <Rich text="Component tokens" />
        </h3>
        <ApiTable head={['Token', 'Description']} rows={TOKENS} />
      </Section>

      <Section anchor="api" title="API reference">
        <h3>
          <Rich text="Props" />
        </h3>
        <ApiTable head={['Prop', 'Type', 'Default', 'Description']} rows={PROPS} />
        <h3>
          <Rich text="Properties" />
        </h3>
        <ApiTable head={['Property', 'Access', 'Description']} rows={PROPERTIES} />
        <h3>
          <Rich text="Methods" />
        </h3>
        <ApiTable head={['Method', 'Returns', 'Description']} rows={METHODS} />
        <h3>
          <Rich text="Events" />
        </h3>
        <ApiTable head={['Event', 'When']} rows={EVENTS} />
      </Section>
    </>
  );
}
