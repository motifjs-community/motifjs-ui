import { ApiTable, Example, Rich, Section } from '../../shared/doc';
import { slowAdapterFile } from '../../shared/slow-adapter-file';
import { code, withOrders } from './code';
import InfiniteGroups from './examples/InfiniteGroups';
import InfiniteScroll from './examples/InfiniteScroll';
import VirtualColumns from './examples/VirtualColumns';

const MODES = [
  ["'virtual' (default)", 'One long list: the scroll bar is as long as every row, blocks load where the view is (a source with `loadMode: \'blocks\'`), the rows between are never asked for.'],
  ["'paged'", 'Pages with a pager; a source that loads by page is always paged.'],
  ["'infinite'", 'The rows show part by part, `pageSize` each; the next part loads as the view nears the end and the scroll bar grows with the rows that came. No total is needed. Rows in memory, groups and summaries are shown part by part the same way.'],
];

const INFINITE_OPTIONS = [
  ['mode', "`Bind<'virtual' | 'paged' | 'infinite'>`", "`'virtual'`", 'How the rows are shown; another mode starts the data again.'],
  ['pageSize', '`Bind<number>`', '`100`', 'Rows of a part for rows in memory (0: every row at once). A source that loads by blocks uses its own block size.'],
  ['settings.loadMoreDistance', '`Bind<number>`', '`0`', 'Rows left below the view when the next part starts to load; 0 waits for the last row to come into view.'],
  ['settings.preloadEnabled', '`Bind<boolean>`', '`false`', 'The next part loads one part earlier (in virtual mode: a part on each side of the view), so scrolling seldom waits.'],
  ['settings.loadMoreIndicator', '`Bind<boolean>`', '`true`', 'The “Loading more rows…” mark over the last rows while a part loads, with Retry when it failed.'],
  ['DataSource count', '`boolean`', '`true`', 'Off, no part asks the server for a total: a part shorter than the block size ends the rows (an empty one after a full one too).'],
];

const INFINITE_API = [
  ['onMoreRowsLoading', '`{ skip, take, cancel }`', 'The next part is about to load (the view near the end, `loadMore()`, Ctrl+End); `cancel` keeps the rows as they are.'],
  ['onMoreRowsLoaded', '`{ skip, count, ended }`', 'A part came: `count` rows from `skip`; `ended` once every row shows.'],
  ['loadMore()', '`boolean`', 'Loads the next part, after `onMoreRowsLoading`; `false` while the rows load, a part is loading or failed, or every row shows.'],
  ['loadingMore, endReached', '`boolean`, reactive', 'A part is loading; every row shows (always outside infinite mode).'],
  ['retry()', '—', 'Loads a part that failed again (the mark’s Retry does the same).'],
  ['pageIndex(), pageIndex(n), page', '`number`', 'The last part shown; with a number, loads the parts up to that one and scrolls to its first row.'],
  ['pageCount', '`number`, reactive', 'The parts of every row once their count is known, else the parts shown.'],
  ['total, totalCount()', '`number`', '`total`: the rows shown so far. `totalCount()`: every matching row once known (counted, or the last part came), −1 until then.'],
  ['refresh()', '—', 'Loads the rows shown again, keeping the position.'],
];

const INFINITE_RULES = [
  ['The end', 'With a count the end is known from the first part; without one (`count: false`) a part that comes back short is the last one. Scrolling at the end asks for nothing more.'],
  ['Failing parts', 'A part that fails shows Retry in the mark (in the bottom bar with `loadMoreIndicator` off); scrolling does not ask for it again until Retry. The rows shown stay; the first part failing shows the grid’s own error.'],
  ['Sort, filter, search', 'Start again from the first part, at the top.'],
  ['Grouping', 'Group rows and rows show part by part together. Groups from a server load only the rows of the part shown; in memory every row is already there.'],
  ['Selection, export', '“Select all” and Ctrl+A select every matching row, loaded or not; the export writes every row, the parts not loaded too.'],
  ['Editing, details', 'The row in edit, the focused row, its details and the selection stay as parts come; new rows open after the rows shown.'],
  ['Pager', 'Hidden: the rows are reached by scrolling.'],
  ['Assistive technology', '`aria-rowcount` is −1 until the last part came; each row keeps its `aria-rowindex`.'],
];

const COLUMN_OPTIONS = [
  ['settings.columnRenderingMode', "`Bind<'standard' | 'virtual'>`", "`'standard'`", '`\'virtual\'`: only the scrolling columns in view and `extraColumns` on each side get cells; pinned columns always do.'],
  ['column.columnRenderingMode', "`Bind<'standard' | 'virtual'>`", 'the grid’s', 'One column’s own: `\'standard\'` keeps its cells while it is out of view (a cell content with a state of its own), `\'virtual\'` lets only it go.'],
  ['settings.extraColumns', '`Bind<number>`', '`2`', 'Columns drawn beyond the ones in view on each side, so a quick sideways scroll shows no gap.'],
  ['settings.renderAsync', "`Bind<boolean | 'auto'>`", "`'auto'`", 'The columns coming into view are drawn as the rows scroll (`false`), once the scrolling stops (`true`), or once it stops while drawing them takes longer than the threshold.'],
  ['settings.columnRenderingThreshold', '`Bind<number>`', '`300`', 'Milliseconds drawing the new columns may take before they wait for the scrolling to stop (`renderAsync: \'auto\'`).'],
  ['settings.columnRenderingDelay', '`Bind<number>`', '`300`', 'Milliseconds without sideways scrolling before the columns that waited are drawn.'],
];

const COLUMN_RULES = [
  ['Rows of every kind', 'The header, the filter row, the rows, the group rows’ items under their columns, the group footers and the totals all follow; the row in edit keeps its editor’s column.'],
  ['Pinned columns and bands', 'Pinned columns are always drawn. A band header spans only its columns drawn and goes with the last of them; its `aria-colindex` and `aria-colspan` stay those of all its columns.'],
  ['Keyboard', 'The active column is always drawn: Tab, the arrow keys, Home and End move into a column without cells, which gets them and scrolls into view.'],
  ['Layout', 'Resizing, moving (dragging a header past columns without cells too), pinning and hiding work as before; “Fit all columns” draws every column while it measures them.'],
  ['Assistive technology', 'Cells keep their `aria-colindex` and the grid its `aria-colcount`, so a screen reader still names column 120 of 202.'],
  ['Export, copy', 'CSV, Excel and PDF write every column, the ones without cells too; copying reads the values, not the cells.'],
  ['Events', '`onCellPrepared` and `onRowPrepared` run as cells are made, so again after a sideways scroll.'],
];

const KEYS = [
  ['Ctrl+End', 'Infinite: the last row shown, and the next part loads.'],
  ['Down, Page Down on the last rows', 'Infinite: the view nears the end and the next part loads.'],
  ['Home, End, Tab, Left / Right', 'Virtual columns: into a column without cells; it is drawn and scrolled into view.'],
];

export default function DataGridScrollingPage() {
  return (
    <>
      <Section anchor="modes" title="Scrolling modes">
        <p>
          <Rich text="The `mode` prop picks how the rows are reached. Every mode draws only the rows in view from a small pool of rows, so the page never holds one element per row." />
        </p>
        <ApiTable head={['Mode', 'Description']} rows={MODES} />
      </Section>

      <Section anchor="infinite" title="Infinite scrolling">
        <p>
          <Rich text="With `mode: 'infinite'` the grid shows 50 orders, and as the last of them comes into view it asks the server for the next 50, with “Loading more rows…” over the bottom while they come. This server cannot count (`count: false`): the grid finds the end when a part comes back short. Turn on “The next part fails” and scroll down: the mark offers Retry. Sort, filter or search: it starts again from the first part." />
        </p>
        <Example files={[...code('InfiniteScroll.tsx', 'orders.ts', 'order.ts'), slowAdapterFile]} stack>
          <InfiniteScroll />
        </Example>
        <ApiTable head={['Option', 'Type', 'Default', 'Description']} rows={INFINITE_OPTIONS} />
        <ApiTable head={['Member', 'Parameters or return value', 'Description']} rows={INFINITE_API} />
        <ApiTable head={['Topic', 'How infinite mode does it']} rows={INFINITE_RULES} />
      </Section>

      <Section anchor="infinite-memory" title="Rows in memory, grouped">
        <p>
          <Rich text="Rows in memory are shown part by part too, here 100 places at a time grouped by city: group rows and rows count alike, so the next city's group shows once its part does. Details, selection and the group summaries work as in the other modes." />
        </p>
        <Example files={withOrders('InfiniteGroups.tsx')} stack>
          <InfiniteGroups />
        </Example>
      </Section>

      <Section anchor="virtual-columns" title="Virtual columns">
        <p>
          <Rich text="With `settings.columnRenderingMode: 'virtual'` (`columnRenderingMode`) only the scrolling columns in view, and `extraColumns` on each side, get cells; the others keep their place in the layout and get cells as they come into view. Here 100,000 hours of 200 sensors, in bands of 20, with the hour and the sum pinned. Turn “Virtual columns” off to see the same grid with every column drawn." />
        </p>
        <Example files={code('VirtualColumns.tsx')} stack>
          <VirtualColumns />
        </Example>
        <ApiTable head={['Option', 'Type', 'Default', 'Description']} rows={COLUMN_OPTIONS} />
        <ApiTable head={['Topic', 'How virtual columns do it']} rows={COLUMN_RULES} />
      </Section>

      <Section anchor="scrolling-keyboard" title="Keyboard">
        <ApiTable head={['Key', 'Description']} rows={KEYS} />
      </Section>
    </>
  );
}
