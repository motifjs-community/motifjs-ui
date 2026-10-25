import { reactive } from '@motifx/core';
import { data } from '@motifx-community/data';
import { Lookup } from '@motifx-community/ui';
import { SlowAdapter } from '../../../shared/slow-adapter';

interface Customer {
  id: string;
  company: string;
  contact: string;
  city: string;
  phone: string;
}

const cities = ['Berlin', 'London', 'Madrid', 'México D.F.', 'Paris', 'São Paulo', 'İstanbul', 'Seattle'];
const people = ['Maria Anders', 'Ana Trujillo', 'Antonio Moreno', 'Thomas Hardy', 'Christina Berglund', 'Hanna Moos', 'Frédérique Citeaux', 'Martín Sommer'];
const rows: Customer[] = Array.from({ length: 2000 }, (_, i) => ({
  id: `C${String(i + 1).padStart(4, '0')}`,
  company: `${['Alfreds', 'Bon app', 'Ernst', 'Folk och fä', 'Hanari', 'Island', 'Lehmanns', 'Wartian'][i % 8]} ${['Futterkiste', 'Trading', 'Handel', 'HB', 'Carnes', 'Markt', 'Foods', 'Herkku'][(i >> 3) % 8]} ${i + 1}`,
  contact: people[i % 8],
  city: cities[(i * 3) % 8],
  phone: `0${(212 + (i % 9)).toString()} ${String(1000000 + i * 37).slice(0, 7)}`,
}));

/** 2,000 customers behind a server that answers after 250 ms, picked from columns and searched by company, contact and city. */
export default function Customers() {
  const order = reactive({ customer: 'C0042' as string | null });
  const customers = new data.DataSource<Customer, string>({
    adapter: new SlowAdapter<Customer, string>({ data: rows, key: 'id' }, 250),
    loadMode: 'blocks',
    pageSize: 50,
    searchFields: ['company', 'contact', 'city'],
  });

  return (
    <>
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
        x-model={() => order.customer}
        stretch
      />
      <output class="lk-customer">{() => `customer: ${order.customer ?? '—'}`}</output>
    </>
  );
}
