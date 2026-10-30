import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { slowAdapterFile } from '../../shared/slow-adapter-file';
import { sources } from '../../shared/sources';
import Customers from './examples/Customers';

const code = sources(import.meta.glob('./examples/*', { query: '?raw', import: 'default', eager: true }));

export default function LookupPage() {
  return (
    <>
      <p class="lead">
        Picks one row of a table-like list, typically from a data source searched on the server: a customer by its
        company, contact and city. The field shows the chosen row's text; everything else works as in DropDown.
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
          <Rich text="`columns` lay every row out on one grid under a header; the search box searches the data source's `searchFields`. Rows load where the list is scrolled to." />
        </p>
        <Example files={[...code('Customers.tsx'), slowAdapterFile]}>
          <Customers />
        </Example>
      </Section>

      <Section anchor="api" title="API reference">
        <ApiTable
          head={['Prop', 'Type', 'Default', 'Description']}
          rows={[
            ['columns', '`Bind<readonly LookupColumn[]>`', '`[]`', '`{ field, caption?, width?, align? }`: a field name or function, a header text, a CSS grid track, the alignment.'],
            ['showColumnHeaders', '`Bind<boolean>`', '`true`', 'The header above the rows.'],
            ['popupWidth', '`Bind<string>`', '`lookup.popup-width`', 'The least width of the list.'],
            ['searchEnabled', '`Bind<boolean>`', '`true`', 'A search box above the list (DropDown has it off by default).'],
            ['everything of DropDown', '', '', '`items`, `dataSource`, `textField`, `valueField`, `searchDelay`, `clearButton`, validation, keyboard…'],
            ['refresh()', '', '', 'Your items and columns may be plain or reactive; the lookup reads them as they are. After changing them in place, call `refresh()`.'],
          ]}
        />
      </Section>
    </>
  );
}
