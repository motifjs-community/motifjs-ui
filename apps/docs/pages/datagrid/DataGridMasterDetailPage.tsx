import { ApiTable, Example, Rich, Section } from '../../shared/doc';
import { code } from './code';
import DetailTabs from './examples/DetailTabs';
import MasterDetail from './examples/MasterDetail';

const OPTIONS = [
  ['masterDetail.enabled', '`Bind<boolean>`', '`false`', 'The expand column, after the status and check box columns and pinned like them: the user opens and closes the details. Off, they open from code only.'],
  ['masterDetail.template', '`(ctx: DetailContext<T>) => unknown`', '—', 'What a row’s details hold: a component (another `DataGrid`, a `FormLayout`, `Tabs` …), an element or a text. Made the first time the details show. `ctx`: `row` (the row itself) and `rowIndex`, both read again in getters when the row shows another one and on `grid.repaint()` or `grid.repaintRows(keys)`, `key`, `grid`, `collapse()`.'],
  ['masterDetail.autoExpandAll', '`Bind<boolean>`', '`false`', 'Every row starts open. Changing it, `enabled` or `template` opens or closes every row again.'],
  ['masterDetail.canExpand', '`Bind<boolean> | (row) => boolean`', '`true`', 'Whether a row has details; a row without has no arrow, and `expandRow` leaves it closed. New rows not saved yet have none.'],
  ['masterDetail.keepDetails', '`Bind<boolean>`', '`true`', 'A closed row keeps what its details hold and shows it as it was when it opens again; off, closing disposes it.'],
  ['masterDetail.keepAcrossPages', '`Bind<boolean>`', '`false`', 'Paged grid: the details of the page left keep what they hold while the user pages (up to `keepLimit`); off, another page or page size disposes them, and they are made again when their page shows. A row stays open either way.'],
  ['masterDetail.keepLimit', '`Bind<number>`', '`100`', 'Details out of view that keep their content (open ones, and closed ones with `keepDetails`); past it the ones seen longest ago are disposed, and made again when they show.'],
  ['masterDetail.height', '`Bind<number> | (row) => number`', 'the content’s', 'A height of their own in pixels, the content scrolling inside; a function gives each row its own.'],
  ['masterDetail.estimatedHeight', '`Bind<number>`', '`200`', 'What details count as before they are drawn and measured, while none is; then the average of those measured. Only the scroll bar uses it.'],
  ['masterDetail.columnWidth', '`Bind<number>`', '`36`', 'Width of the expand column, in pixels.'],
  ['masterDetail.toggleKeys', '`Bind<string[]>`', "`['Enter', ' ']`", 'Keys on the expand cell that open and close the details.'],
  ['masterDetail.arrowKeys', '`Bind<boolean>`', '`true`', 'Right on the expand cell of a closed row opens it, Left on an open one closes it; otherwise they move as on any cell.'],
];

const KEYS = [
  ['Enter, Space (`toggleKeys`)', 'On the expand cell: opens or closes the row’s details.'],
  ['Right / Left (`arrowKeys`)', 'On the expand cell: Right opens a closed row, Left closes an open one; then they move to the next cell. Mirrored right to left.'],
  ['Up / Down, Page Up / Page Down', 'Move from row to row; a row’s details are passed over.'],
  ['Tab', 'On a row whose details show: into the details, to their first stop. With details on the screen Tab otherwise leaves the grid, as Shift+Tab does from a row.'],
  ['Tab in the details', 'Moves through their content; from the last stop it leaves the grid.'],
  ['Escape, Shift+Tab on the first stop', 'Back to the row the details belong to (Escape the content does not use itself).'],
  ['Enter on the details’ own cell', 'Into the content, to its first stop.'],
];

const EVENTS = [
  ['onRowExpanding / onRowCollapsing', "`{ kind: 'detail', key, row, cancel }`", 'A row’s details are about to open or close, by the user or from code; `cancel` keeps them as they are. The same events as for groups (`kind: \'group\'`).'],
  ['onRowExpanded / onRowCollapsed', "`{ kind: 'detail', key, row }`", 'They opened or closed.'],
  ['onRowPrepared', "`{ rowType: 'detail', row, rowIndex, element }`", 'A row’s details were drawn for a row.'],
  ['onOptionChanged', '`{ name: \'masterDetail.enabled\', value, previous }`', 'A `masterDetail` option was assigned through `grid.masterDetail`.'],
];

const METHODS = [
  ['expandRow(key) / collapseRow(key)', '`boolean`', 'Opens or closes a row’s details by its key, as the arrow does (the events come, `cancel` holds); a row not loaded, or one without details, does not.'],
  ['isRowExpanded(key)', '`boolean`', 'Whether a row’s details are open. Reactive.'],
  ['expandAllRows() / collapseAllRows()', '`void`', 'Opens or closes every row’s details at once, without row events (as `expandAll()` does for groups).'],
  ['masterDetail', 'read/write, live', '`grid.masterDetail.enabled = true`; a function is followed.'],
  ['getVisibleRows()', '`GridVisibleRow[]`', "A row's details are listed right after it, `rowType: 'detail'`, with its index and key."],
];

export default function DataGridMasterDetailPage() {
  return (
    <>
      <Section anchor="master-detail" title="Master-detail">
        <p>
          <Rich text="`masterDetail` gives every row details of its own: the expand column opens a row to show what `template` makes for it — here another grid over a data source of its own, filtered by the customer's key — in a row across the grid that stays in place while the columns scroll sideways. The details are made the first time they show and kept while the row is open; they go when the row leaves the data, or with the grid. The list stays virtual: each detail is measured as it is drawn (and again when its content changes size), so the scroll bar, the rows after it and moving to a row stay right, and the rows themselves are still a small pool." />
        </p>
        <Example files={code('MasterDetail.tsx', 'customer-orders.ts', 'customer-order.ts', 'customers.ts')} stack>
          <MasterDetail />
        </Example>
        <ApiTable head={['Option', 'Type', 'Default', 'What it does']} rows={OPTIONS} />
        <p>
          <Rich text="Open rows are kept by key: sorting, the filters, the search, grouping and paging leave them open, and a row that comes back after a filter opens again. Selecting and editing the rows work as before; a row edited in the edit form keeps its details under the form. Copying and exporting leave the details out, and the saved layout does not keep which rows are open." />
        </p>
      </Section>

      <Section anchor="detail-content" title="Tabs and forms in the details">
        <p>
          <Rich text="The details can hold any component. Here they are tabs: a read-only `FormLayout` with the customer, and a list of its orders made when the tab is first shown — the row takes its height, the rows after it move. `canExpand` leaves the customers without orders without an arrow; `ctx.collapse()` closes a row from inside its details; the buttons call `expandAllRows()` and `collapseAllRows()`." />
        </p>
        <Example files={code('DetailTabs.tsx', 'customer-orders.ts', 'customers.ts')} stack>
          <DetailTabs />
        </Example>
      </Section>

      <Section anchor="detail-keyboard" title="Keyboard and accessibility">
        <p>
          <Rich text="The arrow is a button with `aria-expanded` and `aria-controls`; the row says `aria-expanded` too. A row's details are a row of their own in the grid's reading order (`aria-owns`), right after it and counted in `aria-rowindex` and `aria-rowcount`, with one cell across the columns named “Details of row 3” (`gridDetailsOf`, `gridDetails` for the arrow and its column; both in `uiLocale` and the grid's `texts`)." />
        </p>
        <ApiTable head={['Key', 'What it does']} rows={KEYS} />
      </Section>

      <Section anchor="detail-api" title="Events and methods">
        <ApiTable head={['Event', 'Gets', 'When']} rows={EVENTS} />
        <ApiTable head={['Member', 'Returns', 'What it does']} rows={METHODS} />
      </Section>
    </>
  );
}
