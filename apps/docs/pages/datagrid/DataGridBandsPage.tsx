import { ApiTable, Example, Rich, Section } from '../../shared/doc';
import { withOrders } from './code';
import AdaptiveColumns from './examples/AdaptiveColumns';
import BandHeaders from './examples/BandHeaders';

const BAND_FIELDS = [
  ['title, columns', '`Bind<string>`, `(GridColumn | GridBand)[]`', '—', 'The band’s caption and what sits under it: columns and bands, to any depth. A band holds no data.'],
  ['name', '`string`', '`band-` and its place', 'Its identity in the layout, `columnOption`, `columnSettings` and the events (`band-1`, `band-1-2` when it has none).'],
  ['isBand, ownerBand', '`boolean`, `string | number`', '—', 'Bands given flat’s `customizeColumns` does: a band with `isBand`, and columns (or bands) that name it in `ownerBand`, by `name` or by its place in `columns`.'],
  ['align', "`Bind<'start' | 'center' | 'end'>`", 'the `bandAlign` setting', 'Where the caption sits over its columns.'],
  ['sticky, hidden', "`'start' | 'end'`, `boolean`", '—', 'The band pinned, or hidden, with all its columns. A column inside a band takes its band’s side; pinning it pins the band.'],
  ['movable, hideable, pinnable, menu', '`Bind<boolean>`', 'the grid’s settings', 'What the user may do with the band: drag it among its neighbours, hide it, pin it, open its menu.'],
  ['headerCell', '`(ctx) => unknown`', '—', 'Content of your own in the band’s header, made once; `ctx.band`, `ctx.title`.'],
  ['settings.bandAlign', "`Bind<'start' | 'center' | 'end'>`", "`'center'`", 'Where the captions sit when a band does not say.'],
];

const BAND_RULES = [
  ['Moving', 'A column moves only among the columns and bands of its own band, a band among those beside it, both inside their pinned zone and not across one that cannot move (`movable: false`), by dragging the header, with “Move” in the menu and the arrow keys, or with `columnOption(name, \'visibleIndex\', n)`.'],
  ['Sizing', 'The columns are resized as always (the edge of a column’s header, a double-click fits it); a band follows its columns.'],
  ['Sorting and filters', 'A band’s header does not sort and has no filter: its columns do, as before.'],
  ['Hiding', 'Hiding every column of a band hides the band; hiding a band (its menu, `columnOption(name, \'visible\', false)`) hides its columns. The last shown column stays.'],
  ['Column chooser', 'With bands the list of columns is a tree with check boxes, the bands over their columns; a band’s check box shows or hides all of them.'],
  ['Layout', '`grid.layout` keeps the columns’ order, widths and hidden state, and `bands` with each band’s hidden state and side; a band’s place comes from its columns. A layout that tears a band apart puts it together where its first column is. `layoutKey` keeps it all.'],
  ['Export', 'CSV writes a line per level of bands above the titles, each band’s title over its first column; `exportSheet()` adds header rows, and `merges` names the cells a band (and a column down the band rows) spans for the writer to merge.'],
  ['Rows', 'Only the header changes: the rows, the virtual list and paging are as before.'],
];

const ADAPTIVE_OPTIONS = [
  ['settings.columnHidingEnabled', '`Bind<boolean>`', '`false`', 'Columns hide while the grid is narrower than they are, the last one first, and show in the rows’ adaptive detail.'],
  ['column.hidingPriority', '`Bind<number>`', '—', 'Given on any column, only columns with one hide (without `columnHidingEnabled` too), the lowest first. Pinned and grouped columns never hide.'],
  ['adaptiveDetail.colCount, minColWidth, labelMode', "`Bind<number>`, `Bind<string>`, `Bind<'top' | 'side' | 'floating' | 'hidden'>`", "`2`, —, `'side'`", 'How the detail lays out its form (the kit’s `FormLayout`).'],
  ['adaptiveDetail.editors', '`Bind<boolean>`', '`true`', 'Editors instead of texts for the cells the user can fill, in the `row`, `cell` and `batch` edit modes; they write into the row’s draft as its cells do.'],
  ['adaptiveDetail.expandOnEdit', '`Bind<boolean>`', '`true`', 'Editing a row whose hidden columns it can fill opens its detail, and leaving the row closes it again (the `row` edit mode).'],
  ['adaptiveDetail.columnWidth, toggleKeys', "`Bind<number>`, `Bind<string[]>`", "`36`, `['Enter', ' ']`", 'The “…” column’s width; the keys on its cell that open and close the detail.'],
];

const ADAPTIVE_API = [
  ['onAdaptiveDetailRowPreparing', '`{ row, key, rowIndex, editors, formOptions }`', 'A row’s detail is about to lay out its form, when it opens and again when other columns hide or show: change `formOptions` (`items` — the hidden fields, or kit form items —, `colCount`, `minColWidth`, `labelMode`).'],
  ['onAdaptiveDetailRowExpanding / onAdaptiveDetailRowCollapsing', '`{ row, key, rowIndex, cancel }`', 'A row’s detail is about to open or close, from its “…”, its keys or code; `cancel` keeps it as it is.'],
  ['onAdaptiveDetailRowExpanded / onAdaptiveDetailRowCollapsed', '`{ row, key, rowIndex }`', 'It opened or closed.'],
  ['expandAdaptiveDetailRow(key) / collapseAdaptiveDetailRow()', '`boolean`', 'Opens a row’s detail by its key (the one open closes first), or closes the one open.'],
  ['isAdaptiveDetailRowExpanded(key)', '`boolean`', 'Whether that row’s detail is open. Reactive.'],
  ['adaptiveHiddenColumns', '`string[]`, reactive', 'The columns the width hides now, in display order.'],
  ['adaptiveDetail', 'read/write, live', "`grid.adaptiveDetail.colCount = 1`; `onOptionChanged` tells `adaptiveDetail.colCount`."],
  ['getVisibleRows()', '`GridVisibleRow[]`', "The open detail right after its row, `rowType: 'detailAdaptive'`, before the row's master-detail."],
];

const KEYS = [
  ['Up on a column’s header', 'To its band’s header; again to the band above.'],
  ['Down on a band’s header', 'To the first column or band under it.'],
  ['Left / Right, Home / End on a band’s header', 'Along the bands of its row.'],
  ['Alt+Down, the context menu key on a band’s header', 'Its menu: pin, move, hide the band, the column chooser, reset.'],
  ['Enter, Space on the “…” cell (`toggleKeys`)', 'Opens or closes the row’s adaptive detail.'],
  ['Tab on a row whose detail shows', 'Into the detail; from its last stop into the row’s master-detail, or, while the row is edited, on to the next row’s cells.'],
  ['Tab on the last cell editor of a row', 'Into the editors of its open adaptive detail.'],
  ['Escape, Shift+Tab on the detail’s first stop', 'Back to the row.'],
];

export default function DataGridBandsPage() {
  return (
    <>
      <Section anchor="bands" title="Band headers">
        <p>
          <Rich text="A band is a header over several columns (band column): give it a `title` and the `columns` under it — columns and other bands, to any depth. The header becomes a row per level of bands over the columns' own titles, each band spanning its columns. Drag a column: it moves only inside its band; drag a band: its columns go with it. A band is pinned, hidden and moved as a whole, from its own menu (its header's button, Alt+Down) or with `columnOption` by its `name`. Here “Payment” sits over three columns and “Order” over two columns and the “Delivery” band." />
        </p>
        <Example files={withOrders('BandHeaders.tsx')} stack>
          <BandHeaders />
        </Example>
        <ApiTable head={['Band field', 'Type', 'Default', 'Description']} rows={BAND_FIELDS} />
        <ApiTable head={['Topic', 'How bands do it']} rows={BAND_RULES} />
        <p>
          <Rich text="Band rows are `row`s of `columnheader`s in the head's row group: a band's header carries the `aria-colindex` of its first column and `aria-colspan` its columns, the columns keep their own index, and the band rows count in `aria-rowindex` and `aria-rowcount`. Over a pinned column no band covers an empty piece stays with the column, so the band rows scroll under it." />
        </p>
      </Section>

      <Section anchor="adaptive" title="Adaptive columns">
        <p>
          <Rich text="With `settings.columnHidingEnabled` the grid hides columns while it is narrower than they are, the last one first; with a `hidingPriority` on some columns only those hide, the lowest first. A “…” column then opens a row's adaptive detail under it: the hidden columns' titles and values (editors where the row can be edited), one row at a time. It is worked out from the column widths and the grid's width (a `ResizeObserver`), never from what it draws, and again whenever either changes: drag the splitter. The hidden columns still count as shown — the column chooser, `getVisibleColumns()`, the export and copying have them." />
        </p>
        <Example files={withOrders('AdaptiveColumns.tsx')} stack>
          <AdaptiveColumns />
        </Example>
        <ApiTable head={['Option', 'Type', 'Default', 'Description']} rows={ADAPTIVE_OPTIONS} />
        <p>
          <Rich text="The detail is a row of its own right after its row, before the row's master-detail when both are open (order): measured as it is drawn, in the reading order (`aria-owns`), counted in `aria-rowindex`, its one cell named “Hidden columns of row 3” (`gridAdaptiveOf`; `gridAdaptive` names the “…” and its column). Grouped rows, paging and the virtual list keep it under its row; a wider grid with nothing hidden closes it." />
        </p>
      </Section>

      <Section anchor="bands-keyboard" title="Keyboard">
        <ApiTable head={['Key', 'Description']} rows={KEYS} />
      </Section>

      <Section anchor="adaptive-api" title="Events and methods">
        <ApiTable head={['Member', 'Parameters or return value', 'Description']} rows={ADAPTIVE_API} />
      </Section>
    </>
  );
}
