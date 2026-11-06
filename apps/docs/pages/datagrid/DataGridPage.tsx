import { Code, Example, Rich, Section } from '../../shared/doc';
import { slowAdapterFile } from '../../shared/slow-adapter-file';
import { withOrders } from './code';
import Programmatic from './examples/Programmatic';
import Pager from './examples/Pager';
import Pages from './examples/Pages';
import Virtual from './examples/Virtual';

export default function DataGridPage() {
  return (
    <>
      <p class="lead">
        <Rich text="A grid for data entry and large data sets. Rows can be in memory or come from any data layer adapter, and can be displayed in a virtual list or in pages. It supports sorting, column layout, editing with kit editors, new rows with Tab navigation, three save modes, row actions, selection, filters, a search panel, grouping, summaries, a toolbar, lookup columns from other services, copy and paste, export, and a persistent layout. Every feature can be disabled for the grid or for a single column." />
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { DataGrid, type GridColumn } from '@motifx-community/ui';
import { data } from '@motifx-community/data';
`}
        />
      </Section>

      <Section anchor="ways" title="Declarative and programmatic">
        <p>
          <Rich text="Pass in-memory rows with `rows` and their key with `rowKey`, and the grid places them in a `DataSource` over an `ArrayAdapter`. Every prop accepts a value or a function. A grid created with `new` is a regular object that you can add to the page, sort and query." />
        </p>
        <Example files={withOrders('Programmatic.tsx')} stack>
          <Programmatic />
        </Example>
      </Section>

      <Section anchor="virtual" title="Virtual scrolling with server data">
        <p>
          <Rich text="With a `DataSource` that loads by `blocks`, the scrollbar is sized from the total, and only the rows in the visible area are requested. A jump (Ctrl+End, or dragging the scrollbar) requests only the destination, and a block that is no longer needed while loading is aborted. A row that has not arrived yet appears as a placeholder. Above 10 million pixels of rows, the scrollbar is scaled." />
        </p>
        <Example files={[...withOrders('Virtual.tsx'), slowAdapterFile]} stack>
          <Virtual />
        </Example>
      </Section>

      <Section anchor="paged" title="Paging">
        <p>
          <Rich text="A `DataSource` that loads by `page` creates a paged grid. One page is requested at a time, and sorting returns to the first page. For in-memory rows, set `mode` to `paged`." />
        </p>
        <Example files={[...withOrders('Pages.tsx', 'paged-orders.ts'), slowAdapterFile]} stack>
          <Pages />
        </Example>
      </Section>

      <Section anchor="pager" title="Pager">
        <p>
          <Rich text="The pager below the rows shows the page sizes (`pageSizeSelector`, with the sizes in `allowedPageSizes` and `all` for one page with every row), “Page 3 of 12 (250 items)” (`pagerInfo`, and `pagerInfoText` with `{0}`, `{1}`, `{2}`), the first, previous, next and last buttons (`pagerNavigation`), and the pages around the current one (`pagerNeighbors`). `pagerDisplayMode` sets its appearance: `full` shows page buttons and sizes as buttons, `compact` shows a page number box and a drop-down of sizes, and `adaptive` (the default) uses `full` while it fits within the grid's width. `pageSize(n)` also changes the rows per page programmatically. In either case, `onPageSizeChanging` can keep the old size, the grid returns to the first page, and with `layoutKey` the size is saved with the layout. PageUp and PageDown change the page (`pageKeys`)." />
        </p>
        <Example files={withOrders('Pager.tsx')} stack>
          <Pager />
        </Example>
      </Section>
    </>
  );
}
