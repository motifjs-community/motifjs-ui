import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { slowAdapterFile } from '../../shared/slow-adapter-file';
import { sources } from '../../shared/sources';
import ByKey from './examples/ByKey';
import Customers from './examples/Customers';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

export default function LookupPage() {
  return (
    <>
      <p class="lead">
        <Rich text="Selects one row from a table-style list, typically from a data source searched on the server, such as a customer by company, contact and city. The field shows the text of the selected row, and everything else works as in DropDown." />
      </p>

      <Section anchor="import" title="Import">
        <Code
          code={`
import { Lookup, type LookupColumn } from '@motifx-community/ui';
`}
        />
      </Section>

      <Section anchor="columns" title="Columns from a data source">
        <p>
          <Rich text="`columns` arranges every row on one grid under a header, and the search box searches the data source's `searchFields`. Rows load as the list scrolls." />
        </p>
        <Example files={[...code('Customers.tsx'), slowAdapterFile]}>
          <Customers />
        </Example>
      </Section>

      <Section anchor="by-key" title="Values on unloaded pages">
        <p>
          <Rich text="A value whose row is not loaded is requested by key, in one request together with the keys other fields and grids on the same source need at that moment. In the meantime, the field shows a spinner in place of the arrow, the list stays closed, and the key is never shown as text. A record that already has the name can provide it through `valueText`, and the field shows it immediately. A key the server does not have appears muted and underlined, with the reason in its title. If the request failed, opening the list tries again." />
        </p>
        <Example files={[...code('ByKey.tsx'), slowAdapterFile]}>
          <ByKey />
        </Example>
      </Section>

      <Section anchor="api" title="API reference">
        <ApiTable
          head={['Prop', 'Type', 'Default', 'Description']}
          rows={[
            ['columns', '`Bind<readonly LookupColumn[]>`', '`[]`', '`{ field, caption?, width?, align? }`: a field name or function, a header text, a CSS grid track and the alignment.'],
            ['showColumnHeaders', '`Bind<boolean>`', '`true`', 'Shows a header above the rows.'],
            ['popupWidth', '`Bind<string>`', '`lookup.popup-width`', 'The minimum width of the list.'],
            ['searchEnabled', '`Bind<boolean>`', '`true`', 'Adds a search box above the list. DropDown has this off by default.'],
            ['everything of DropDown', '', '', '`items`, `dataSource`, `valueText`, `textField`, `valueField`, `searchDelay`, `clearButton`, validation, keyboard support and more.'],
            ['refresh()', '', '', 'Your items and columns can be plain or reactive, and the lookup reads them as they are. After changing them in place, call `refresh()`.'],
          ]}
        />
      </Section>
    </>
  );
}
