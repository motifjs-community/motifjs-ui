import { ApiTable, Example, Rich, Section } from '../../shared/doc';
import { slowAdapterFile } from '../../shared/slow-adapter-file';
import { code, withOrders } from './code';
import FilterEditors from './examples/FilterEditors';
import FilterPanel from './examples/FilterPanel';
import Filters from './examples/Filters';
import HeaderFilterIntervals from './examples/HeaderFilterIntervals';
import Search from './examples/Search';
import ServerChoices from './examples/ServerChoices';

const PANEL = [
  ['settings.filterPanel', '`boolean`', '`false`', 'The panel below the rows: the check box, the filter as text (clicking it opens the builder), “Create Filter” when there is no filter, and “Clear”.'],
  ['settings.filterSyncEnabled', "`boolean | 'auto'`", "`'auto'`", 'Makes the filter row and header filters part of the filter value, in both directions. `\'auto\'` applies while the panel is visible.'],
  ['settings.filterBuilder, column `filterBuilder`', '`boolean`', '`true`', 'Whether the column is a field in the builder.'],
  ['filterValue', '`Bind<data.FilterExpression | null>`', '`null`', 'The filter value. A function is tracked, and user changes arrive in `onFilterChanged` (`e.filterValue`). Also available as a property.'],
  ['filterEnabled', '`Bind<boolean>`', '`true`', 'Whether the filter value applies, which is the panel\'s check box. Also available as a property.'],
  ['filterPanelText', '`({ text, filterValue }) => string`', '—', 'Customizes the panel\'s text, starting from the default text.'],
  ['filterBuilder', '`GridFilterBuilderOptions`', '`{}`', 'Any prop of `FilterBuilder` except `value` and `fields` (`customOperations`, `maxGroupLevel`, `groupOperations`, its events …), also live as `grid.filterBuilder`.'],
  ['filterBuilderPopup', '`GridFilterBuilderPopup`', '`{}`', 'The window: `title`, `showTitle`, `width` (`\'40rem\'`), `height`, `resizable`, `movable`, `showCloseButton`, `showMaximize`, `fullScreen`. Also live as `grid.filterBuilderPopup`.'],
  ['openFilterBuilder(), closeFilterBuilder(apply?), clearFilterValue()', 'methods', '', 'The panel\'s actions, available programmatically. `filterText` is the panel\'s text, and `filterBuilderInstance` is the open builder.'],
  ['onFilterBuilderOpening / Opened, onFilterBuilderClosing / Closed', 'events', '', '`e.cancel` keeps the builder closed or open, and `e.apply` and `e.applied` indicate whether OK was clicked. `onFilterChanging` (cancelable) and `onFilterChanged` also include `filterValue` and `filterEnabled`.'],
];

export default function DataGridFilteringPage() {
  return (
    <>
      <Section anchor="filters" title="Filters">
        <p>
          <Rich text="The filter row has one cell per column, with a condition chosen in the cell according to the column type (contains, starts with, =, <, between, empty …) and the kit field for the value. Typing applies the filter after a short pause. The header filter lists the column's values with their counts, taking the other filters into account. For in-memory rows, the grid does the counting. An adapter that supports grouping is queried with `group`, and any other server answers through `loadValues`. Both feed the data source's filter (`data.where`, `data.and`, `data.or`), combined with AND." />
        </p>
        <Example files={withOrders('Filters.tsx')} stack>
          <Filters />
        </Example>
      </Section>

      <Section anchor="filter-editors" title="Custom filter editors">
        <p>
          <Rich text="A column's `filterEditor` replaces the filter row's editor of its type. A `Field` it returns, such as a `NumberBox` with a minimum, is bound to the column's filter both ways. Any other component receives a `FilterEditorContext`: it writes the value with `ctx.setValue` (`ctx.clear()` removes it) and hears the filter change elsewhere, such as the filters being cleared, through `ctx.onChanged`. `ctx.operator` is the condition chosen in the cell. The editor for a cell, the column's `editor`, is separate: see [Editing](/datagrid/editing)." />
        </p>
        <Example files={withOrders('FilterEditors.tsx')} stack>
          <FilterEditors />
        </Example>
      </Section>

      <Section anchor="server-choices" title="List choices from a server">
        <p>
          <Rich text="A list column's `options` can be a function, which can return a promise. In a cell's editor it is called with the row, so the choices can depend on it. Everywhere else (the cell text, the filter row, the search panel, the filter builder and pasted text) it is called once with `row` `null`, returns every choice, and its answer is kept until `refresh()`. Until it arrives, the cells show the values and the filter row's list says it is loading. Here the server is asked once, however many places use the choices." />
        </p>
        <Example files={withOrders('ServerChoices.tsx')} stack>
          <ServerChoices />
        </Example>
      </Section>

      <Section anchor="filter-panel" title="Filter panel and builder">
        <p>
          <Rich text="`settings.filterPanel` adds a panel below the rows that shows the filter value as text, such as `[City] Equals 'Ankara' And [Amount] Is greater than '900.00'`, using column titles, formats and lookup text. Clicking it opens the kit's [FilterBuilder](/filterbuilder) in a modal window with every column (`filterBuilder` disables it for a column), and with “is any of” and “is none of” for each one. OK applies the value as the filter value, and Cancel and Escape discard it. The check box turns the filter value off and on, and Clear removes it." />
        </p>
        <p>
          <Rich text="With `filterSyncEnabled` (on while the panel is visible), the filter row and header filters are part of the filter value. A condition set in the builder appears in the column's cell or value list if they can display it (one each), and what they set appears in the panel and opens in the builder. Conditions they cannot display, such as an OR group or a second condition on a column, stay only in the filter value. The filter goes to the data source like any other. This example uses 100,000 orders on a server, or 200 in memory. A layout saved with `layoutKey`, and `state()`, keep the filter value and the check box." />
        </p>
        <Example files={[...withOrders('FilterPanel.tsx'), slowAdapterFile]} stack>
          <FilterPanel />
        </Example>
        <ApiTable head={['Option', 'Description']} rows={PANEL.map(([name, type, def, what]) => [name, `${what} ${type === 'methods' || type === 'events' ? '' : `${type}${def && def !== '—' ? `, default ${def}` : ''}.`}`.trim()])} />
      </Section>

      <Section anchor="intervals" title="Ranges, dates and custom entries">
        <p>
          <Rich text="A column's `headerFilterInterval` groups its header filter. A number column uses ranges of that size (“0 – 250”, “250 – 500”), and several sizes such as `[1000, 100]` create a tree. A date column uses a tree of years, months and days, down to the part it names (`'year'`, `'quarter'`, `'month'`, `'day'`, `'hour'`, `'minute'`, `'second'`), and `null` lists individual dates. Dates are a tree by default, down to the day (`headerFilterDateInterval`). The tree is the kit's `TreeView` with check boxes and “Select all”. A checked month is stored as `'2026/3'` and a year as `2026`, and each filters with `>=` its first moment and `<` the next one's, so a server can run it too. Counts are calculated in the browser from the column's distinct values, whether counted in memory, grouped by an adapter that supports grouping, or from `loadValues`." />
        </p>
        <p>
          <Rich text="`headerFilterItems` provides custom header filter entries, as `{ text, value }`, where a value is a value or a filter expression (`data.where('city', 'in', […])`). A function receives the other filters and `values()`, the entries it would list, so that you can add to them. `filterValues` and `filterType` (both can be tracked functions) set the contents of the header filter. `'exclude'` leaves those values out, so values added later appear. In the list, selecting every value and then deselecting some leaves those out in the same way." />
        </p>
        <Example files={withOrders('HeaderFilterIntervals.tsx')} stack>
          <HeaderFilterIntervals />
        </Example>
      </Section>

      <Section anchor="search" title="Search panel">
        <p>
          <Rich text="`searchPanel` adds a search box to the toolbar. Its text is searched in every searchable column at once, after a short typing pause. Each column interprets it according to its type: text columns contain it (case-insensitive and locale-aware), number, date and yes/no columns match when it can be read as one of their values, and list columns match their option text. The columns are joined with OR, and then with the filter row and header filter with AND. Text that no column can interpret returns no rows. The filter goes to the data source like any other (`data.where`, `data.or`), so a server can run it, and matches are highlighted in the cells. `searchText` binds the text in both directions with `onSearchTextChanged`, and `searchByText()` searches programmatically." />
        </p>
        <p>
          <Rich text="A lookup column is searched through its text. The lookup source (here, a customer service separate from the sales server) is queried for items whose text contains the search, up to `searchLimit`, and their keys go to the row server as `customerId in [...]`. A column with a `textFrom` field searches that field of the row instead." />
        </p>
        <Example files={[...code('Search.tsx', 'customers.ts', 'orders.ts', 'order.ts'), slowAdapterFile]} stack>
          <Search />
        </Example>
      </Section>
    </>
  );
}
