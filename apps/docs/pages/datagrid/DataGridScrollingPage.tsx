import { ApiTable, Example, Rich, Section } from '../../shared/doc';
import { slowAdapterFile } from '../../shared/slow-adapter-file';
import { code, withOrders } from './code';
import InfiniteGroups from './examples/InfiniteGroups';
import InfiniteScroll from './examples/InfiniteScroll';
import VirtualColumns from './examples/VirtualColumns';

const MODES = [
  ["'virtual' (default)", 'A single long list. The scrollbar is as long as every row, blocks load at the visible position (with a source using `loadMode: \'blocks\'`), and rows in between are never requested.'],
  ["'paged'", 'Pages with a pager. A source that loads by page is always paged.'],
  ["'infinite'", 'Rows appear page by page, `pageSize` at a time. The next page loads as the view nears the end, and the scrollbar grows with the loaded rows. No total is required. In-memory rows, groups and summaries appear page by page the same way.'],
];

const INFINITE_OPTIONS = [
  ['mode', "`Bind<'virtual' | 'paged' | 'infinite'>`", "`'virtual'`", 'How rows are displayed. Changing the mode reloads the data.'],
  ['pageSize', '`Bind<number>`', '`100`', 'The rows per page for in-memory rows (0 shows every row at once). A source that loads by blocks uses its own block size.'],
  ['settings.loadMoreDistance', '`Bind<number>`', '`0`', 'The number of rows left below the view when the next page starts to load. 0 waits for the last row to come into view.'],
  ['settings.preloadEnabled', '`Bind<boolean>`', '`false`', 'Loads the next page one page earlier (in virtual mode, one page on each side of the view), so that scrolling rarely has to wait.'],
  ['settings.loadMoreIndicator', '`Bind<boolean>`', '`true`', 'The “Loading more rows…” indicator over the last rows while a page loads, with Retry if it fails.'],
  ['DataSource count', '`boolean`', '`true`', 'When disabled, no page asks the server for a total. A page shorter than the block size ends the rows, as does an empty page after a full one.'],
];

const INFINITE_API = [
  ['onMoreRowsLoading', '`{ skip, take, cancel }`', 'Occurs before the next page loads (the view is near the end, `loadMore()`, or Ctrl+End). Set `cancel` to keep the rows as they are.'],
  ['onMoreRowsLoaded', '`{ skip, count, ended }`', 'Occurs when a page arrives: `count` rows from `skip`, and `ended` once every row is displayed.'],
  ['loadMore()', '`boolean`', 'Loads the next page, after `onMoreRowsLoading`. Returns `false` while rows are loading, when a page is loading or has failed, or when every row is displayed.'],
  ['loadingMore, endReached', '`boolean`, reactive', 'Indicates whether a page is loading, and whether every row is displayed (always true outside infinite mode).'],
  ['retry()', '—', 'Reloads a page that failed, as the indicator\'s Retry does.'],
  ['pageIndex(), pageIndex(n), page', '`number`', 'The last displayed page. With a number, loads the pages up to that one and scrolls to its first row.'],
  ['pageCount', '`number`, reactive', 'The number of pages of all rows once the count is known, otherwise the displayed pages.'],
  ['total, totalCount()', '`number`', '`total` is the number of rows displayed so far. `totalCount()` is every matching row once known (counted, or when the last page arrived), and −1 until then.'],
  ['refresh()', '—', 'Reloads the displayed rows and keeps the position.'],
];

const INFINITE_RULES = [
  ['The end', 'With a count, the end is known from the first page. Without one (`count: false`), a page that comes back short is the last. Scrolling at the end requests nothing further.'],
  ['Failing parts', 'A page that fails shows Retry in the indicator (or in the bottom bar with `loadMoreIndicator` off), and scrolling does not request it again until Retry. The displayed rows stay, and a failure of the first page shows the grid\'s own error.'],
  ['Sort, filter, search', 'Starts again from the first page, at the top.'],
  ['Grouping', 'Group rows and data rows appear page by page together. Groups from a server load only the rows of the displayed page, and in memory, every row is already available.'],
  ['Selection, export', '“Select all” and Ctrl+A select every matching row, loaded or not, and export writes every row, including pages not yet loaded.'],
  ['Editing, details', 'The row being edited, the focused row, its details and the selection stay as pages arrive, and new rows open after the displayed rows.'],
  ['Pager', 'Hidden. Rows are reached by scrolling.'],
  ['Assistive technology', '`aria-rowcount` is −1 until the last page arrives, and each row keeps its `aria-rowindex`.'],
];

const COLUMN_OPTIONS = [
  ['settings.columnRenderingMode', "`Bind<'standard' | 'virtual'>`", "`'standard'`", 'With `\'virtual\'`, only the visible scrolling columns and `extraColumns` on each side have cells. Pinned columns always have them.'],
  ['column.columnRenderingMode', "`Bind<'standard' | 'virtual'>`", 'The grid\'s value', 'A column\'s own setting. `\'standard\'` keeps its cells while it is out of view (for cell content with its own state), and `\'virtual\'` releases only that column.'],
  ['settings.extraColumns', '`Bind<number>`', '`2`', 'The columns rendered beyond the visible ones on each side, so that a quick sideways scroll shows no gap.'],
  ['settings.renderAsync', "`Bind<boolean | 'auto'>`", "`'auto'`", 'Whether columns coming into view are rendered during scrolling (`false`), once scrolling stops (`true`), or once it stops when rendering takes longer than the threshold.'],
  ['settings.columnRenderingThreshold', '`Bind<number>`', '`300`', 'How long rendering new columns can take, in milliseconds, before they wait for scrolling to stop (`renderAsync: \'auto\'`).'],
  ['settings.columnRenderingDelay', '`Bind<number>`', '`300`', 'How long, in milliseconds, there must be no sideways scrolling before waiting columns are rendered.'],
];

const COLUMN_RULES = [
  ['Rows of every kind', 'The header, the filter row, the rows, group row items under their columns, the group footers and the totals all follow, and the row being edited keeps its editor\'s column.'],
  ['Pinned columns and bands', 'Pinned columns are always rendered. A band header spans only its rendered columns and goes with the last of them, and its `aria-colindex` and `aria-colspan` stay those of all its columns.'],
  ['Keyboard', 'The active column is always rendered. Tab, the arrow keys, Home and End can move into a column without cells, which receives them and scrolls into view.'],
  ['Layout', 'Resizing, moving (including dragging a header past columns without cells), pinning and hiding work as usual, and “Fit all columns” renders every column while measuring them.'],
  ['Assistive technology', 'Cells keep their `aria-colindex` and the grid its `aria-colcount`, so a screen reader still announces column 120 of 202.'],
  ['Export, copy', 'CSV, Excel and PDF write every column, including those without cells, and copying reads the values rather than the cells.'],
  ['Events', '`onCellPrepared` and `onRowPrepared` run as cells are created, so they run again after a sideways scroll.'],
];

const KEYS = [
  ['Ctrl+End', 'In infinite mode, moves to the last displayed row, and the next page loads.'],
  ['Down, Page Down on the last rows', 'In infinite mode, the view nears the end and the next page loads.'],
  ['Home, End, Tab, Left / Right', 'With virtual columns, moves into a column without cells, which is rendered and scrolled into view.'],
];

export default function DataGridScrollingPage() {
  return (
    <>
      <Section anchor="modes" title="Scrolling modes">
        <p>
          <Rich text="The `mode` prop determines how rows are reached. Every mode renders only the visible rows from a small pool, so the page never holds one element per row." />
        </p>
        <ApiTable head={['Mode', 'Description']} rows={MODES} />
      </Section>

      <Section anchor="infinite" title="Infinite scrolling">
        <p>
          <Rich text="With `mode: 'infinite'`, the grid shows 50 orders, and when the last of them comes into view, it requests the next 50 from the server, with “Loading more rows…” at the bottom while they arrive. This server cannot provide a count (`count: false`), so the grid finds the end when a page comes back short. Turn on “The next page fails” and scroll down, and the indicator offers Retry. Sorting, filtering or searching starts again from the first page." />
        </p>
        <Example files={[...code('InfiniteScroll.tsx', 'orders.ts', 'order.ts'), slowAdapterFile]} stack>
          <InfiniteScroll />
        </Example>
        <ApiTable head={['Option', 'Type', 'Default', 'Description']} rows={INFINITE_OPTIONS} />
        <ApiTable head={['Member', 'Parameters or return value', 'Description']} rows={INFINITE_API} />
        <ApiTable head={['Topic', 'Infinite mode behavior']} rows={INFINITE_RULES} />
      </Section>

      <Section anchor="infinite-memory" title="In-memory rows, grouped">
        <p>
          <Rich text="In-memory rows also appear page by page, here 100 places at a time, grouped by city. Group rows and data rows both count, so the next city's group appears with its page. Details, selection and group summaries work as in the other modes." />
        </p>
        <Example files={withOrders('InfiniteGroups.tsx')} stack>
          <InfiniteGroups />
        </Example>
      </Section>

      <Section anchor="virtual-columns" title="Virtual columns">
        <p>
          <Rich text="With `settings.columnRenderingMode: 'virtual'`, only the visible scrolling columns and `extraColumns` on each side have cells. The other columns keep their position in the layout and receive cells as they come into view. This example shows 100,000 hours of 200 sensors, in bands of 20, with the hour and the sum pinned. Turn off “Virtual columns” to see the same grid with every column rendered." />
        </p>
        <Example files={code('VirtualColumns.tsx')} stack>
          <VirtualColumns />
        </Example>
        <ApiTable head={['Option', 'Type', 'Default', 'Description']} rows={COLUMN_OPTIONS} />
        <ApiTable head={['Topic', 'Virtual column behavior']} rows={COLUMN_RULES} />
      </Section>

      <Section anchor="scrolling-keyboard" title="Keyboard">
        <ApiTable head={['Key', 'Description']} rows={KEYS} />
      </Section>
    </>
  );
}
