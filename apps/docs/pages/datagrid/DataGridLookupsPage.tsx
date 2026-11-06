import { ApiTable, Example, Rich, Section } from '../../shared/doc';
import { slowAdapterFile } from '../../shared/slow-adapter-file';
import { code } from './code';
import Cascade from './examples/Cascade';
import Lookups from './examples/Lookups';
import TextFrom from './examples/TextFrom';

const LOOKUP_FIELDS = [
  ['dataSource', '`Bind<DataSource | unknown[]>`: the items, searched and resolved on their own service, or an array in memory.'],
  ['valueField, textField', 'The field that matches the cell value (default: the source’s key; an array of plain values: the value); the text shown, a field or `(item) => text` (default: the value).'],
  ['searchFields', 'Fields the editor and the text searches look in. Default: `textField` when it is a field.'],
  ['filter', '`(row, context) => FilterExpression`: narrows the items for a row (cascading lists: `context.getValue(\'province\')`, the value entered, else the row’s); `null` row: the filter lists.'],
  ['allowClearing', '`Bind<boolean>`: a clear button in the editor. Default `false`.'],
  ['resolve, batchSize', '`\'batch\'` (default: keys in one request, `batchSize` 100 each) or `\'byKey\'` (one request per key).'],
  ['sortBy', '`Bind<\'key\' | \'text\'>`: rows in memory sorted by the key (default) or by the text shown.'],
  ['editor, editorOptions', '`\'dropdown\'` (default), `\'combobox\'` or `\'lookup\'`, and props for it (a `Lookup`’s `columns`). A column’s own `editor` still wins and gets the lookup in its context.'],
  ['searchLimit', 'How many items whose text holds the search panel’s text the search turns into keys, at most. Default 100.'],
  ['filterSearchLimit', 'The same for the header filter’s search box. Default 1000.'],
  ['pageSize', 'Items the editor’s list loads per request while it scrolls (a data source). Default 50.'],
  ['parallelRequests', '`\'byKey\'`: requests at the same time. Default 6.'],
  ['pasteSearchLimit', 'Items a pasted text is looked for in. Default 50.'],
];

export default function DataGridLookupsPage() {
  return (
    <>
      <Section anchor="lookups" title="Lookup columns">
        <p>
          <Rich text="A column with `lookup` keeps a key (a customer id) and shows the text of its item, from a `DataSource` of any adapter — another service, another protocol than the rows — or from an array. Only the keys on the screen are asked for: the unknown ones of a moment go out together (`id in [...]`, at most `batchSize` each), or one by one with `resolve: 'byKey'` for a service that gives one item by key. The texts are kept per source and shared by every column and grid using it. While a key loads its cell is empty and busy; a key the source does not have shows as it is, muted, and stops its row from being saved." />
        </p>
        <Example files={[...code('Lookups.tsx', 'customers.ts'), slowAdapterFile]} stack>
          <Lookups />
        </Example>
        <p>
          <Rich text="Editing opens a `DropDown` with search (or `editor: 'combobox'`, or the kit's `Lookup` with columns) over a data source of its own on the same adapter, so its search never moves a source the page shows. Typing on the cell opens the list and searches what was typed; the picked text shows at once. `filter(row, context)` narrows the list for the row (by `context.getValue`, so a province just picked counts), `setCellValue` writes other fields with the value — here a new province empties the district — and `onEditorPreparing` changes the editor's props: the district waits for a province (`e.getValue('province')`)." />
        </p>
        <Example files={code('Cascade.tsx', 'places.ts')} stack>
          <Cascade />
        </Example>
        <p>
          <Rich text="When the row already brings the text (OData `$expand`), `textFrom` reads it there and the lookup source is asked only to edit and to list; `sortField` sorts the server by it. Without them a lookup column sorts by its key; rows in memory can sort by the text with `sortBy: 'text'`. The filter row offers “(All)” and the texts (always `=`), the header filter the texts with “(empty)” first, both searched by text and, with `syncLookupFilterValues`, holding only the keys of the rows the other filters leave. Copy and export write the text (`raw`: the key); a pasted text becomes the key of the one item that has it." />
        </p>
        <Example files={[...code('TextFrom.tsx', 'customers.ts'), slowAdapterFile]} stack>
          <TextFrom />
        </Example>
        <ApiTable head={['Lookup field', 'Description']} rows={LOOKUP_FIELDS} />
      </Section>
    </>
  );
}
