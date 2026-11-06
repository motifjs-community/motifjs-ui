import { ApiTable, Example, Rich, Section } from '../../shared/doc';
import { slowAdapterFile } from '../../shared/slow-adapter-file';
import { code, withOrders } from './code';
import FilterPanel from './examples/FilterPanel';
import Filters from './examples/Filters';
import HeaderFilterIntervals from './examples/HeaderFilterIntervals';
import Search from './examples/Search';

const PANEL = [
  ['settings.filterPanel', '`boolean`', '`false`', 'The panel under the rows: the check box, the filter as text (pressing it opens the builder), “Create Filter” while there is none, and “Clear”.'],
  ['settings.filterSyncEnabled', "`boolean | 'auto'`", "`'auto'`", 'The filter row and the header filters are part of the filter value, both ways. `\'auto\'`: while the panel shows.'],
  ['settings.filterBuilder, column `filterBuilder`', '`boolean`', '`true`', 'The column is a field of the builder.'],
  ['filterValue', '`Bind<data.FilterExpression | null>`', '`null`', 'The filter value; a function is followed, the user\'s changes come in `onFilterChanged` (`e.filterValue`). Also a property.'],
  ['filterEnabled', '`Bind<boolean>`', '`true`', 'Whether the filter value applies: the panel\'s check box. Also a property.'],
  ['filterPanelText', '`({ text, filterValue }) => string`', '—', 'The panel\'s text, from the one it would show.'],
  ['filterBuilder', '`GridFilterBuilderOptions`', '`{}`', 'Any prop of `FilterBuilder` but `value` and `fields` (`customOperations`, `maxGroupLevel`, `groupOperations`, its events…); live as `grid.filterBuilder`.'],
  ['filterBuilderPopup', '`GridFilterBuilderPopup`', '`{}`', 'The window: `title`, `showTitle`, `width` (`\'40rem\'`), `height`, `resizable`, `movable`, `showCloseButton`, `showMaximize`, `fullScreen`; live as `grid.filterBuilderPopup`.'],
  ['openFilterBuilder(), closeFilterBuilder(apply?), clearFilterValue()', 'methods', '', 'What the panel does, programmatically. `filterText` is the panel\'s text, `filterBuilderInstance` the open builder.'],
  ['onFilterBuilderOpening / Opened, onFilterBuilderClosing / Closed', 'events', '', '`e.cancel` keeps the builder closed, or open; `e.apply` / `e.applied` say whether OK was pressed. `onFilterChanging` (cancelable) and `onFilterChanged` carry `filterValue` and `filterEnabled` too.'],
];

export default function DataGridFilteringPage() {
  return (
    <>
      <Section anchor="filters" title="Filters">
        <p>
          <Rich text="The filter row has a cell per column: a condition chosen in the cell, by the column type (contains, starts with, =, <, between, empty…), and the kit's field for the value; typing applies after a short pause. The header filter lists the column's values with their counts, honoring the other filters: rows in memory are counted by the grid, an adapter that groups is asked with `group`, any other server answers `loadValues`. Both feed the data source's filter (`data.where`, `data.and`, `data.or`), together with AND." />
        </p>
        <Example files={withOrders('Filters.tsx')} stack>
          <Filters />
        </Example>
      </Section>

      <Section anchor="filter-panel" title="Filter panel and builder">
        <p>
          <Rich text="`settings.filterPanel` puts a panel under the rows that reads the filter value as text — `[City] Equals 'Ankara' And [Amount] Is greater than '900.00'`, in the columns' titles, formats and lookup texts. Pressing it opens the kit's [FilterBuilder](/filterbuilder) in a modal window on every column (`filterBuilder` per column turns one off), with “is any of” and “is none of” for each; OK makes its value the filter value, Cancel and Escape leave it. The check box turns the filter value off and on, Clear takes it away." />
        </p>
        <p>
          <Rich text="With `filterSyncEnabled` (on while the panel shows) the filter row and the header filters are part of the filter value: a condition the builder sets shows in the column's cell or its value list when they can show it (one each), and what they set reads in the panel and opens in the builder. Conditions they cannot show — an OR group, a second condition on a column — stay in the filter value only. The filter goes to the data source as any other: here 100,000 orders on a server, or 200 in memory. The layout kept with `layoutKey`, and `state()`, keep the filter value and the check box." />
        </p>
        <Example files={[...withOrders('FilterPanel.tsx'), slowAdapterFile]} stack>
          <FilterPanel />
        </Example>
        <ApiTable head={['Option', 'Description']} rows={PANEL.map(([name, type, def, what]) => [name, `${what} ${type === 'methods' || type === 'events' ? '' : `${type}${def && def !== '—' ? `, default ${def}` : ''}.`}`.trim()])} />
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
          <Rich text="`searchPanel` puts a search box in the toolbar: its text is looked for in every searchable column at once, after a short typing pause. Each column reads it by its type — text columns contain it (without case, in the locale), number, date and yes/no columns match it when it reads as one of their values, list columns by their option texts — and the columns are joined with OR, then with the filter row and the header filter with AND. A text no column can read leaves no row. The filter goes to the data source like any other (`data.where`, `data.or`), so a server runs it; what was found is marked in the cells. `searchText` binds the text both ways with `onSearchTextChanged`; `searchByText()` searches programmatically." />
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
