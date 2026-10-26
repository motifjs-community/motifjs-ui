import { Example, Rich, Section } from '../../shared/doc';
import { slowAdapterFile } from '../../shared/slow-adapter-file';
import { code, withOrders } from './code';
import Filters from './examples/Filters';
import HeaderFilterIntervals from './examples/HeaderFilterIntervals';
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

      <Section anchor="intervals" title="Ranges, dates and entries">
        <p>
          <Rich text="A column's `headerFilterInterval` groups its header filter: a number column in ranges of that size (“0 – 250”, “250 – 500”; several sizes, `[1000, 100]`, make a tree), a date column in a tree of years, months and days — down to the part it names (`'year'`, `'quarter'`, `'month'`, `'day'`, `'hour'`, `'minute'`, `'second'`; `null` lists the dates one by one). Dates are a tree by default, down to the day (`headerFilterDateInterval`). The tree is the kit's `TreeView` with check boxes and “Select all”; a month checked keeps the month (`'2026/3'`), a year `2026`, and filters with `>=` its first moment and `<` the next one's, so a server runs it too. The counts are worked out in the browser from the column's distinct values: counted in memory, grouped by an adapter that groups, or from `loadValues`." />
        </p>
        <p>
          <Rich text="`headerFilterItems` gives the header filter entries of its own, `{ text, value }`, where a value is a value or a filter expression (`data.where('city', 'in', […])`); a function gets the other filters and `values()`, the entries it would list, to add to. `filterValues` and `filterType` (both may be functions that are followed) set what the header filter holds: `'exclude'` leaves those values out, so values that come later show. In the list, choosing every value and then taking some away leaves those out the same way." />
        </p>
        <Example files={withOrders('HeaderFilterIntervals.tsx')} stack>
          <HeaderFilterIntervals />
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
