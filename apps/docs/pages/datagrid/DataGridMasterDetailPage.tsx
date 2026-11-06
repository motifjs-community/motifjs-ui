import { ApiTable, Example, Rich, Section } from '../../shared/doc';
import { code } from './code';
import DetailTabs from './examples/DetailTabs';
import MasterDetail from './examples/MasterDetail';

const OPTIONS = [
  ['masterDetail.enabled', '`Bind<boolean>`', '`false`', 'The expand column, after the status and check box columns and pinned with them, lets the user open and close details. When disabled, they can be opened only programmatically.'],
  ['masterDetail.template', '`(ctx: DetailContext<T>) => unknown`', '—', 'The content of a row\'s details: a component (another `DataGrid`, a `FormLayout`, `Tabs` …), an element or text. It is created the first time the details are shown. `ctx` provides `row` (the row itself) and `rowIndex`, both getters that are read again when the row shows another one and on `grid.repaint()` or `grid.repaintRows(keys)`, plus `key`, `grid` and `collapse()`.'],
  ['masterDetail.autoExpandAll', '`Bind<boolean>`', '`false`', 'Every row starts open. Changing this setting, `enabled` or `template` opens or closes every row again.'],
  ['masterDetail.canExpand', '`Bind<boolean> | (row) => boolean`', '`true`', 'Whether a row has details. A row without details has no arrow, and `expandRow` leaves it closed. Unsaved new rows have no details.'],
  ['masterDetail.keepDetails', '`Bind<boolean>`', '`true`', 'A closed row keeps the content of its details and shows it unchanged when it reopens. When disabled, closing disposes the content.'],
  ['masterDetail.keepAcrossPages', '`Bind<boolean>`', '`false`', 'In a paged grid, the details of the previous page keep their content while the user changes pages (up to `keepLimit`). When disabled, changing the page or page size disposes them, and they are recreated when their page appears. A row stays open in either case.'],
  ['masterDetail.keepLimit', '`Bind<number>`', '`100`', 'The number of details out of view that keep their content (open ones, and closed ones with `keepDetails`). Past this limit, the least recently seen are disposed and recreated when they appear.'],
  ['masterDetail.height', '`Bind<number> | (row) => number`', 'The content\'s height', 'A fixed height in pixels, with the content scrolling inside. A function sets a height per row.'],
  ['masterDetail.estimatedHeight', '`Bind<number>`', '`200`', 'The estimated height of details before they are rendered and measured, used until the first measurement, after which the measured average applies. Only the scrollbar uses it.'],
  ['masterDetail.columnWidth', '`Bind<number>`', '`36`', 'The width of the expand column, in pixels.'],
  ['masterDetail.toggleKeys', '`Bind<string[]>`', "`['Enter', ' ']`", 'The keys on the expand cell that open and close the details.'],
  ['masterDetail.arrowKeys', '`Bind<boolean>`', '`true`', 'Right on the expand cell of a closed row opens it, and Left on an open row closes it. Otherwise, they move as on any cell.'],
];

const KEYS = [
  ['Enter, Space (`toggleKeys`)', 'On the expand cell, opens or closes the row\'s details.'],
  ['Right / Left (`arrowKeys`)', 'On the expand cell, Right opens a closed row and Left closes an open one. Then they move to the next cell. Mirrored on right-to-left pages.'],
  ['Up / Down, Page Up / Page Down', 'Moves between rows, skipping a row\'s details.'],
  ['Tab', 'On a row whose details are visible, moves into the details, to their first stop. With details on screen, Tab otherwise leaves the grid, as Shift+Tab does from a row.'],
  ['Tab in the details', 'Moves through their content. From the last stop, it leaves the grid.'],
  ['Escape, Shift+Tab on the first stop', 'Returns to the row the details belong to, when the content does not use Escape itself.'],
  ['Enter on the details’ own cell', 'Moves into the content, to its first stop.'],
];

const EVENTS = [
  ['onRowExpanding / onRowCollapsing', "`{ kind: 'detail', key, row, cancel }`", 'Occurs before a row\'s details open or close, from the user or programmatically. Set `cancel` to keep them as they are. These are the same events as for groups (`kind: \'group\'`).'],
  ['onRowExpanded / onRowCollapsed', "`{ kind: 'detail', key, row }`", 'Occurs after they open or close.'],
  ['onRowPrepared', "`{ rowType: 'detail', row, rowIndex, element }`", 'Occurs when a row\'s details have been rendered for a row.'],
  ['onOptionChanged', '`{ name: \'masterDetail.enabled\', value, previous }`', 'Occurs when a `masterDetail` option is assigned through `grid.masterDetail`.'],
];

const METHODS = [
  ['expandRow(key) / collapseRow(key)', '`boolean`', 'Opens or closes a row\'s details by key, as the arrow does (the events run, and `cancel` applies). It has no effect on a row that is not loaded or has no details.'],
  ['isRowExpanded(key)', '`boolean`', 'Indicates whether a row\'s details are open. Reactive.'],
  ['expandAllRows() / collapseAllRows()', '`void`', 'Opens or closes every row\'s details at once, without row events (as `expandAll()` does for groups).'],
  ['masterDetail', 'read/write, live', '`grid.masterDetail.enabled = true`. A function is tracked reactively.'],
  ['getVisibleRows()', '`GridVisibleRow[]`', "A row's details are listed directly after it, with `rowType: 'detail'` and with its index and key."],
];

export default function DataGridMasterDetailPage() {
  return (
    <>
      <Section anchor="master-detail" title="Master-detail">
        <p>
          <Rich text="`masterDetail` gives every row its own details. The expand column opens a row to display the output of `template` (in this example, another grid over its own data source, filtered by the customer's key) in a row spanning the grid, which stays in place while the columns scroll sideways. Details are created the first time they are shown and kept while the row is open, and they are removed when the row leaves the data or when the grid is disposed. The list stays virtual: each detail is measured as it renders (and again when its content changes size), so the scrollbar, the following rows and navigation to a row stay accurate, and the rows themselves remain a small pool." />
        </p>
        <Example files={code('MasterDetail.tsx', 'customer-orders.ts', 'customer-order.ts', 'customers.ts')} stack>
          <MasterDetail />
        </Example>
        <ApiTable head={['Option', 'Type', 'Default', 'Description']} rows={OPTIONS} />
        <p>
          <Rich text="Open rows are tracked by key, so sorting, filtering, searching, grouping and paging leave them open, and a row that returns after a filter opens again. Selection and editing work as usual, and a row edited in the edit form keeps its details below the form. Copy and export omit the details, and the saved layout does not include which rows are open." />
        </p>
      </Section>

      <Section anchor="detail-content" title="Tabs and forms in the details">
        <p>
          <Rich text="Details can contain any component. In this example, they are tabs with a read-only `FormLayout` for the customer and a list of its orders that is created when the tab is first shown. The row adjusts its height, and the following rows move. `canExpand` hides the arrow for customers without orders, `ctx.collapse()` closes a row from inside its details, and the buttons call `expandAllRows()` and `collapseAllRows()`." />
        </p>
        <Example files={code('DetailTabs.tsx', 'customer-orders.ts', 'customers.ts')} stack>
          <DetailTabs />
        </Example>
      </Section>

      <Section anchor="detail-keyboard" title="Keyboard and accessibility">
        <p>
          <Rich text="The arrow is a button with `aria-expanded` and `aria-controls`, and the row also has `aria-expanded`. A row's details are a separate row in the grid's reading order (`aria-owns`), directly after it and counted in `aria-rowindex` and `aria-rowcount`, with one cell across the columns named “Details of row 3” (`gridDetailsOf`, and `gridDetails` for the arrow and its column, both in `uiLocale` and the grid's `texts`)." />
        </p>
        <ApiTable head={['Key', 'Description']} rows={KEYS} />
      </Section>

      <Section anchor="detail-api" title="Events and methods">
        <ApiTable head={['Event', 'Parameters', 'When']} rows={EVENTS} />
        <ApiTable head={['Member', 'Returns', 'Description']} rows={METHODS} />
      </Section>
    </>
  );
}
