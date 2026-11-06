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
          <Rich text="Rows can be grouped by one or more columns. Each group has a row showing “Column: value (count)”, using the text of a lookup column or the column's format for in-memory rows, with an arrow that expands and collapses it and with lower-level groups indented. Grouped columns are removed from the columns area unless `showWhenGrouped` is set. `groupIndex` on columns sets the initial grouping, and `groupPanel` adds a panel at the start of the toolbar where dropping a header groups by its column. Clicking a chip reverses the order of its groups, and a chip can move along the panel or be dragged back onto the headers to ungroup the column at that position. The column menu provides the same actions from the keyboard. Sorting applies to the rows inside the groups, and the header of a grouped column, like its chip, sorts its groups. `calculateGroupValue` groups by a computed value. In paged mode, pages count both group rows and data rows, and a collapsed group counts as one row." />
        </p>
        <Example files={withOrders('Grouping.tsx')} stack>
          <Grouping />
        </Example>
        <p>
          <Rich text="On a server, a `DataSource` that loads by `blocks` over an adapter that supports grouping is asked only for the groups and their counts (`loadGroups`, `group` with `groupsOnly`). Rows arrive in group order, in blocks, only for expanded groups in the visible area. In this example, the groups start collapsed (`autoExpandGroup: false`). An adapter that cannot group (OData, REST), a source that loads by page, or a `calculateGroupValue` function loads every matching row and groups them in the browser. Filters, search and selection work with groups, and “select all” still means every row of the filter. CSV export writes a “Column: value” line before each group, and `group` is saved with the layout." />
        </p>
        <Example files={[...withOrders('GroupingServer.tsx'), slowAdapterFile]} stack>
          <GroupingServer />
        </Example>
      </Section>

      <Section anchor="summaries" title="Summaries">
        <p>
          <Rich text="`summary` calculates values for the rows that match the filter and search. `totalItems` appear in a totals row below the rows, which stays at the bottom while the rows scroll and moves sideways with the columns. `groupItems` appear for each group: after the group row's count, under their column in the group row (`alignByColumn`), or in a footer row after the group's rows (`showInGroupFooter`). An item aggregates a `column` (and its `value` reader) with a `summaryType` of `sum`, `min`, `max`, `avg`, `count` or `custom`, and appears under `showInColumn` (otherwise its own column), with several items in one column stacked. Its text is `displayFormat` (`{0}` for the value and `{1}` for the column), or a string from `summary.texts` and `uiLocale`, formatted by `valueFormat` (`Intl` options or a function, otherwise the column's format), or `customizeText`. A `custom` item uses `calculateCustomSummary` in three stages: `start`, `calculate` per row, and `finalize`. Empty values are excluded (`skipEmptyValues`, and `count` counts every row). Unsaved edits count once saved, or as they are made with `recalculateWhileEditing`. `getTotalSummaryValue(name)` and `getGroupSummaryValue(key, name)` read the values, `onSummaryChanged` reports recalculation, and CSV and `exportRows()` write the footers and totals." />
        </p>
        <Example files={withOrders('Summaries.tsx')} stack>
          <Summaries />
        </Example>
        <p>
          <Rich text="On a server, a source that loads pages or blocks requests the totals of the query from its adapter when the adapter has the `summary` capability (`remoteSummary`, `DataSource.loadSummary`), and requests group summaries with the groups when it groups (`loadGroups` with `groupSummary`). The sample server in this example does both, using one request for totals and one for groups, regardless of what the list shows. An adapter without this capability, a `custom` item or a computed column loads every matching row once per row set (`groupLoadPageSize` per request), and the values are calculated in the browser. If only the browser can calculate the group summaries, the rows are grouped in the browser as well." />
        </p>
        <Example files={[...withOrders('SummariesServer.tsx'), slowAdapterFile]} stack>
          <SummariesServer />
        </Example>
        <ApiTable
          head={['Field', 'Description']}
          rows={[
            ['totalItems, groupItems', 'The items of the totals row and of each group. A function is tracked. Items are read as provided, so after changing them in place, call `grid.refreshSummary()`.'],
            ['calculateCustomSummary', '`(e) => void` with `{ name, summaryProcess, value, totalValue, groupIndex, component }`. One function for every `custom` item. Set `e.totalValue` at `start`, combine `e.value` (the column\'s value, or the row when there is no column) into it at each `calculate`, and adjust it at `finalize`.'],
            ['recalculateWhileEditing', 'With `false`, the values reflect unsaved edits, new rows and rows marked for deletion. When enabled, they change once the changes are saved.'],
            ['skipEmptyValues', 'With `true`, empty values (`null`, `undefined`, `\'\'`) are excluded from browser calculations. When disabled, `sum` and `avg` count them as 0. An item can set its own value.'],
            ['texts', 'The item strings by type: `sum`, `sumOtherColumn`, `min`, `minOtherColumn`, `max`, `maxOtherColumn`, `avg`, `avgOtherColumn` and `count`. They override the `gridSummary…` strings of `uiLocale` and the grid\'s `texts`.'],
          ]}
        />
        <ApiTable
          head={['Item field', 'Description']}
          rows={[
            ['column', 'The column to aggregate. Without one, `count` counts rows and `custom` receives the rows themselves.'],
            ['summaryType', "`'sum' | 'min' | 'max' | 'avg' | 'count' | 'custom'`, default `'count'`."],
            ['name', 'Names the item for `getTotalSummaryValue` and `calculateCustomSummary`.'],
            ['showInColumn', 'The column the item appears under (by default, `column`). When it appears under a different column, the text names its column (“Sum of Amount: …”).'],
            ['valueFormat', '`Intl.NumberFormatOptions`, `Intl.DateTimeFormatOptions` or `(value) => string`. By default, the column\'s format (or a plain number for `count`).'],
            ['displayFormat, customizeText', 'The text, where `{0}` is the formatted value and `{1}` is the column\'s title. `({ value, valueText }) => string` takes precedence.'],
            ['alignment, cssClass', "`'start' | 'center' | 'end'` (by default, the column's), and a custom class on the item."],
            ['skipEmptyValues', 'Excludes empty values for this item. The default is `summary.skipEmptyValues`.'],
            ['visible', 'Whether the item appears. The default is the `totalSummary` (`groupSummary`) setting.'],
            ['showInGroupFooter, alignByColumn', 'For group items: places them in the group footer, or under their column in the group row, except under the first column, which holds the text.'],
          ]}
        />
      </Section>
    </>
  );
}
