import { Example, Rich, Section } from '../../shared/doc';
import { slowAdapterFile } from '../../shared/slow-adapter-file';
import { code, withOrders } from './code';
import Filters from './examples/Filters';
import Search from './examples/Search';

export default function DataGridFilteringPage() {
  return (
    <>
      <Section anchor="filters" title="Filters">
        <p>
          <Rich text="The filter row has a cell per column: a condition chosen in the cell, by the column type (contains, starts with, =, <, between, empty…), and the kit's field for the value; typing applies after a short pause. The header filter lists the column's values with their counts, honoring the other filters: rows in memory are counted by the grid, an adapter that groups is asked with `group`, any other server answers `loadValues`. Both feed the data source's filter (`data.where`, `data.and`, `data.or`), together with AND." />
        </p>
        <Example files={[...withOrders('Filters.tsx'), slowAdapterFile]} stack>
          <Filters />
        </Example>
      </Section>

      <Section anchor="search" title="Search panel">
        <p>
          <Rich text="`searchPanel` puts a search box in the toolbar: its text is looked for in every searchable column at once, after a short typing pause. Each column reads it by its type — text columns contain it (without case, in the locale), number, date and yes/no columns match it when it reads as one of their values, list columns by their option texts — and the columns are joined with OR, then with the filter row and the header filter with AND. A text no column can read leaves no row. The filter goes to the data source like any other (`data.where`, `data.or`), so a server runs it; what was found is marked in the cells. `searchText` binds the text both ways with `onSearchTextChanged`; `searchByText()` searches from code." />
        </p>
        <p>
          <Rich text="A lookup column is searched by its texts: the lookup source — here a customers service apart from the sales' server — is asked for the items whose text holds the search (at most `searchLimit`), and their keys go to the rows' server as `customerId in [...]`. A column with a `textFrom` field searches that field of the row instead." />
        </p>
        <Example files={[...code('Search.tsx', 'customers.ts', 'orders.ts', 'order.ts'), slowAdapterFile]} stack>
          <Search />
        </Example>
      </Section>
    </>
  );
}
