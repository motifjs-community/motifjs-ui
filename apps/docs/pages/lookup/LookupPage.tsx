import { reactive } from '@motifx/core';
import { data } from '@motifx-community/data';
import { Lookup } from '@motifx-community/ui';
import { ApiTable, Code, Example, Rich, Section } from '../../shared/doc';
import { SlowAdapter } from '../../shared/slow-adapter';

interface Customer {
  id: string;
  company: string;
  contact: string;
  city: string;
  phone: string;
}

const CITIES = ['Berlin', 'London', 'Madrid', 'México D.F.', 'Paris', 'São Paulo', 'İstanbul', 'Seattle'];
const PEOPLE = ['Maria Anders', 'Ana Trujillo', 'Antonio Moreno', 'Thomas Hardy', 'Christina Berglund', 'Hanna Moos', 'Frédérique Citeaux', 'Martín Sommer'];
const CUSTOMERS: Customer[] = Array.from({ length: 2000 }, (_, i) => ({
  id: `C${String(i + 1).padStart(4, '0')}`,
  company: `${['Alfreds', 'Bon app', 'Ernst', 'Folk och fä', 'Hanari', 'Island', 'Lehmanns', 'Wartian'][i % 8]} ${['Futterkiste', 'Trading', 'Handel', 'HB', 'Carnes', 'Markt', 'Foods', 'Herkku'][(i >> 3) % 8]} ${i + 1}`,
  contact: PEOPLE[i % 8],
  city: CITIES[(i * 3) % 8],
  phone: `0${(212 + (i % 9)).toString()} ${String(1000000 + i * 37).slice(0, 7)}`,
}));

function customerSource() {
  const adapter = new SlowAdapter<Customer, string>({ data: CUSTOMERS, key: 'id' }, 250);
  return new data.DataSource<Customer, string>({ adapter, loadMode: 'blocks', pageSize: 50, searchFields: ['company', 'contact', 'city'] });
}

export default function LookupPage() {
  const s = reactive({ customer: 'C0042' as string | null });
  const customers = customerSource();

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
        <Example
          code={`
<Lookup
  label="&Customer"
  dataSource={this.customers}
  textField="company"
  valueField="id"
  columns={[
    { field: 'company', caption: 'Company', width: '2fr' },
    { field: 'contact', caption: 'Contact' },
    { field: 'city', caption: 'City', width: '7rem' },
    { field: 'phone', caption: 'Phone', width: '8rem', align: 'end' },
  ]}
  x-model={() => this.order.customer}
/>
`}
        >
          <Lookup
            label="&Customer"
            dataSource={customers}
            textField="company"
            valueField="id"
            popupWidth="40rem"
            columns={[
              { field: 'company', caption: 'Company', width: '2fr' },
              { field: 'contact', caption: 'Contact' },
              { field: 'city', caption: 'City', width: '7rem' },
              { field: 'phone', caption: 'Phone', width: '8rem', align: 'end' },
            ]}
            clearButton
            x-model={() => s.customer}
            stretch
          />
          <output class="lk-customer">{() => `customer: ${s.customer ?? '—'}`}</output>
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
          ]}
        />
      </Section>
    </>
  );
}
