import { ApiTable, Example, Rich, Section } from '../../shared/doc';
import { slowAdapterFile } from '../../shared/slow-adapter-file';
import { code } from './code';
import Cascade from './examples/Cascade';
import Lookups from './examples/Lookups';
import TextFrom from './examples/TextFrom';

const LOOKUP_FIELDS = [
  ['dataSource', '`Bind<DataSource | unknown[]>`. The items, searched and resolved on their own service, or an in-memory array.'],
  ['valueField, textField', 'The field that matches the cell value (by default, the source\'s key, or the value itself in an array of plain values), and the displayed text as a field or `(item) => text` (by default, the value).'],
  ['searchFields', 'The fields searched by the editor and text searches. By default, `textField` when it is a field.'],
  ['filter', '`(row, context) => FilterExpression`. Narrows the items for a row (for cascading lists, `context.getValue(\'province\')` returns the entered value, otherwise the row\'s). `row` is `null` for filter lists.'],
  ['allowClearing', '`Bind<boolean>`. Adds a clear button to the editor. The default is `false`.'],
  ['resolve, batchSize', '`\'batch\'` (the default: keys in one request, `batchSize` 20 each) or `\'byKey\'` (one request per key).'],
  ['sortBy', '`Bind<\'key\' | \'text\'>`. Sorts in-memory rows by key (the default) or by displayed text.'],
  ['editor, editorOptions', '`\'dropdown\'` (the default), `\'combobox\'` or `\'lookup\'`, and props for it (such as a `Lookup`\'s `columns`). A column\'s own `editor` still takes precedence and receives the lookup in its context.'],
  ['searchLimit', 'The maximum number of items containing the search panel\'s text that the search converts to keys. The default is 100.'],
  ['filterSearchLimit', 'The same for the header filter\'s search box. The default is 1000.'],
  ['pageSize', 'The number of items the editor\'s list loads per request while scrolling (with a data source). The default is 50.'],
  ['parallelRequests', 'With `\'byKey\'`, the number of simultaneous requests. The default is 6.'],
  ['pasteSearchLimit', 'The number of items searched for pasted text. The default is 50.'],
];

export default function DataGridLookupsPage() {
  return (
    <>
      <Section anchor="lookups" title="Lookup columns">
        <p>
          <Rich text="A column with `lookup` holds a key, such as a customer ID, and displays the text of the matching item. Items can come from an array or from a `DataSource` of any adapter, including another service or a different protocol from the rows. Only the keys on screen are requested. Unknown keys at any given moment are sent together (`id in [...]`, up to `batchSize` each), or one at a time with `resolve: 'byKey'` for a service that returns one item by key. Texts are cached per source and shared by every column and grid that uses it. While a key loads, its cell is empty and busy. A key the source does not contain appears as it is, muted, and prevents its row from being saved." />
        </p>
        <Example files={[...code('Lookups.tsx', 'customers.ts'), slowAdapterFile]} stack>
          <Lookups />
        </Example>
        <p>
          <Rich text="Editing opens a `DropDown` with search (or `editor: 'combobox'`, or the kit's `Lookup` with columns) over its own data source on the same adapter, so its search never affects a source displayed on the page. Typing on the cell opens the list and searches the typed text, and the selected text appears immediately. `filter(row, context)` narrows the list for the row (through `context.getValue`, so a newly selected province is included), `setCellValue` writes other fields along with the value (in this example, a new province clears the district), and `onEditorPreparing` changes the editor's props, so the district waits for a province (`e.getValue('province')`)." />
        </p>
        <Example files={code('Cascade.tsx', 'places.ts')} stack>
          <Cascade />
        </Example>
        <p>
          <Rich text="When the row already includes the text (OData `$expand`), `textFrom` reads it from the row, and the lookup source is used only for editing and lists. `sortField` sorts on the server by that field. Without them, a lookup column sorts by its key, and in-memory rows can sort by text with `sortBy: 'text'`. The filter row offers “(All)” and the texts (always `=`), and the header filter lists the texts with “(empty)” first. Both are searched by text and, with `syncLookupFilterValues`, contain only the keys of rows that match the other filters. Copy and export write the text (`raw` writes the key), and pasted text becomes the key of the single item that has it." />
        </p>
        <Example files={[...code('TextFrom.tsx', 'customers.ts'), slowAdapterFile]} stack>
          <TextFrom />
        </Example>
        <ApiTable head={['Lookup field', 'Description']} rows={LOOKUP_FIELDS} />
      </Section>
    </>
  );
}
