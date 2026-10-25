import { Code, Example, Rich, Section } from '../../shared/doc';
import { slowAdapterFile } from '../../shared/slow-adapter-file';
import { withOrders } from './code';
import FromCode from './examples/FromCode';
import Pages from './examples/Pages';
import Virtual from './examples/Virtual';

export default function DataGridPage() {
  return (
    <>
      <p class="lead">
        A grid for data entry and large data: rows in memory or from any adapter of the data layer, a virtual list or
        pages, sorting, column layout, editing with the kit's editors, new rows with the Tab chain, three save modes,
        row actions, selection, filters, a search panel, grouping, summaries, a toolbar, lookup columns from other services, copy and paste,
        export and a layout that is kept — and every feature can be turned off, for the grid or for one column.
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { DataGrid, type GridColumn } from '@motifx-community/ui';
import { data } from '@motifx-community/data';
`}
        />
      </Section>

      <Section anchor="ways" title="From JSX and from code">
        <p>
          <Rich text="Give rows in memory with `rows` and their key with `rowKey`; the grid puts them in a `DataSource` over an `ArrayAdapter` itself. Every prop takes a value or a function. Created with `new`, the grid is an object like any other: add it, sort it, ask it." />
        </p>
        <Example files={withOrders('FromCode.tsx')} stack>
          <FromCode />
        </Example>
      </Section>

      <Section anchor="virtual" title="Server data, virtual">
        <p>
          <Rich text="With a `DataSource` that loads by `blocks`, the scroll bar is sized from the total and only the rows where the list looks are asked for. A jump (Ctrl+End, dragging the bar) asks only where it lands; a block left behind while loading is aborted. A row that has not come yet shows as a placeholder. Above 10 million pixels of rows the bar is scaled." />
        </p>
        <Example files={[...withOrders('Virtual.tsx'), slowAdapterFile]} stack>
          <Virtual />
        </Example>
      </Section>

      <Section anchor="paged" title="Pages">
        <p>
          <Rich text="A `DataSource` that loads by `page` makes a paged grid: one page is asked for at a time, and a sort goes back to the first page. Rows in memory page with `mode` set to `paged`." />
        </p>
        <Example files={[...withOrders('Pages.tsx', 'paged-orders.ts'), slowAdapterFile]} stack>
          <Pages />
        </Example>
      </Section>
    </>
  );
}
