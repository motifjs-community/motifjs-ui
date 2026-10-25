import { ApiTable, Example, Rich, Section } from '../../shared/doc';
import { slowAdapterFile } from '../../shared/slow-adapter-file';
import { withOrders } from './code';
import Grouping from './examples/Grouping';
import GroupingServer from './examples/GroupingServer';
import Summaries from './examples/Summaries';
import SummariesServer from './examples/SummariesServer';

export default function DataGridGroupingPage() {
  return (
    <>
      <Section anchor="grouping" title="Grouping">
        <p>
          <Rich text="Rows are grouped by one column or several: a row per group shows “Column: value (count)” — a lookup column its text, rows in memory the column's format — with an arrow that opens and closes it, and the groups below it moved in. Grouped columns leave the columns unless `showWhenGrouped`. `groupIndex` on the columns groups at the start; `groupPanel` puts the panel at the start of the toolbar, where a header dropped groups by its column; a chip turns the order of its groups when clicked, moves along the panel and, dragged back onto the headers, ungroups the column where it lands. The column menu does the same from the keyboard. A sort sorts the rows inside the groups; the header of a grouped column, like its chip, sorts its groups; `calculateGroupValue` groups by a value of its own. Paged, the pages count group rows and data rows; a closed group is one row." />
        </p>
        <Example files={withOrders('Grouping.tsx')} stack>
          <Grouping />
        </Example>
        <p>
          <Rich text="On a server: a `DataSource` that loads by `blocks` over an adapter that groups is asked only for the groups with their counts (`loadGroups`, `group` with `groupsOnly`); the rows come in group order, in blocks, only for the open groups where the list looks — here the groups start closed (`autoExpandGroup: false`). An adapter that cannot group (OData, REST), a source that loads by page, or a `calculateGroupValue` function gets every matching row, grouped in the browser without remote grouping. Filters, the search and selection work over the groups; “select all” stays every row of the filter. The CSV export writes a “Column: value” line before each group; `group` is kept with the layout." />
        </p>
        <Example files={[...withOrders('GroupingServer.tsx'), slowAdapterFile]} stack>
          <GroupingServer />
        </Example>
      </Section>

      <Section anchor="summaries" title="Summaries">
        <p>
          <Rich text="`summary` gives values of the rows under the filter and the search: `totalItems` in a row of totals under the rows — it stays at the bottom while the rows scroll and moves sideways with the columns — and `groupItems` for each group: after the group row's count, under their column in the group row (`alignByColumn`), or in a footer row after the group's rows (`showInGroupFooter`). An item aggregates a `column` (its `value` reader too) with `summaryType` `sum`, `min`, `max`, `avg`, `count` or `custom`, shows under `showInColumn` (else its column), several in one column one under the other, and its text is `displayFormat` (`{0}` the value, `{1}` the column) or a text of `summary.texts` and `uiLocale`, formatted by `valueFormat` (`Intl` options or a function; else the column's format), or `customizeText`. A `custom` item goes through `calculateCustomSummary` in three steps: `start`, `calculate` per row, `finalize`. Empty values are left out (`skipEmptyValues`; `count` counts every row). Unsaved edits count once saved, or as they are made with `recalculateWhileEditing`. `getTotalSummaryValue(name)` and `getGroupSummaryValue(key, name)` read the values; `onSummaryChanged` tells when they are worked out again; the CSV and `exportRows()` write the footers and the totals." />
        </p>
        <Example files={withOrders('Summaries.tsx')} stack>
          <Summaries />
        </Example>
        <p>
          <Rich text="On a server: a source that loads pages or blocks asks its adapter for the totals of the query when the adapter has the `summary` capability (`remoteSummary`; `DataSource.loadSummary`), and asks for the group summaries with the groups when it groups (`loadGroups` with `groupSummary`). Here the made-up server does both: one request for the totals, one for the groups, whatever the list shows. An adapter without it, a `custom` item or a computed column get every matching row, loaded once per row set (`groupLoadPageSize` a request), and the values are worked out in the browser; group summaries only the browser can work out group the rows in the browser too." />
        </p>
        <Example files={[...withOrders('SummariesServer.tsx'), slowAdapterFile]} stack>
          <SummariesServer />
        </Example>
        <ApiTable
          head={['Field', 'What it does']}
          rows={[
            ['totalItems, groupItems', 'The items of the row of totals and of each group; a function is followed.'],
            ['calculateCustomSummary', '`(e) => void` with `{ name, summaryProcess, value, totalValue, groupIndex, component }`: one function for every `custom` item; set `e.totalValue` at `start`, fold `e.value` (the column’s value, or the row without a column) into it at each `calculate`, adjust it at `finalize`.'],
            ['recalculateWhileEditing', '`false`: the values follow unsaved edits, new rows and rows marked for deletion. Off, they change once the changes are saved.'],
            ['skipEmptyValues', '`true`: empty values (`null`, `undefined`, `\'\'`) are left out of what the browser works out; off, `sum` and `avg` count them as 0. An item can set its own.'],
            ['texts', 'The item texts by type: `sum`, `sumOtherColumn`, `min`, `minOtherColumn`, `max`, `maxOtherColumn`, `avg`, `avgOtherColumn`, `count`; over the `gridSummary…` texts of `uiLocale` and the grid’s `texts`.'],
          ]}
        />
        <ApiTable
          head={['Item field', 'What it does']}
          rows={[
            ['column', 'The column aggregated. Without one, `count` counts rows and `custom` gets the rows themselves.'],
            ['summaryType', "`'sum' | 'min' | 'max' | 'avg' | 'count' | 'custom'`, default `'count'`."],
            ['name', 'Names the item for `getTotalSummaryValue` and `calculateCustomSummary`.'],
            ['showInColumn', 'The column the item shows under (default: `column`); away from its column the text names the column (“Sum of Amount: …”).'],
            ['valueFormat', '`Intl.NumberFormatOptions`, `Intl.DateTimeFormatOptions` or `(value) => string`; default: the column’s format (`count`: a plain number).'],
            ['displayFormat, customizeText', 'The text, `{0}` the formatted value and `{1}` the column’s title; `({ value, valueText }) => string` wins over it.'],
            ['alignment, cssClass', "`'start' | 'center' | 'end'` (default: the column's); a class of your own on the item."],
            ['skipEmptyValues', 'Leave empty values out for this item; default `summary.skipEmptyValues`.'],
            ['visible', 'Show the item; default the `totalSummary` (`groupSummary`) setting.'],
            ['showInGroupFooter, alignByColumn', 'Group items: in the group footer; under their column in the group row, not under the first column, which holds the text.'],
          ]}
        />
      </Section>
    </>
  );
}
