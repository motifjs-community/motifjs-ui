import { reactive } from '@motifx/core';
import { data } from '@motifx-community/data';
import { Button, Lookup } from '@motifx-community/ui';
import { SlowAdapter } from '../../../shared/slow-adapter';

interface Customer {
  id: number;
  company: string;
  city: string;
}

const companyOf = (id: number) => `${['Alfreds', 'Bon app', 'Ernst', 'Hanari', 'Island', 'Lehmanns'][id % 6]} ${['Trading', 'Handel', 'Markt', 'Foods'][id % 4]} ${id}`;
const rows: Customer[] = Array.from({ length: 2000 }, (_, i) => ({ id: i + 1, company: companyOf(i + 1), city: ['Berlin', 'Paris', 'İstanbul', 'Madrid'][i % 4] }));

/** Values on no loaded page of a server that answers after 1.2 s: one field waits for its row, one shows the name its record carries, one has a key the server does not have. */
export default function ByKey() {
  const customers = new data.DataSource<Customer, number>({
    adapter: new SlowAdapter<Customer, number>({ data: rows, key: 'id' }, 1200),
    loadMode: 'blocks',
    pageSize: 50,
    searchFields: ['company', 'city'],
  });
  const columns = [
    { field: 'company', caption: 'Company' },
    { field: 'city', caption: 'City', width: '7rem' },
  ];
  const waiting = reactive({ customer: 1500 as number | null });
  // A record as it came from the server: the customer's key and, beside it, the name.
  const order = reactive({ customer: 1500 as number | null, customerName: companyOf(1500) });

  const another = () => {
    const id = 100 + Math.floor(Math.random() * 1900);
    waiting.customer = id;
    order.customer = id;
    order.customerName = companyOf(id);
  };

  return (
    <>
      <Lookup class="lk-waits" label="Waits for its row" dataSource={customers} textField="company" valueField="id" columns={columns} x-model={() => waiting.customer} stretch />
      <Lookup
        class="lk-given"
        label="Shows the name it is given"
        dataSource={customers}
        textField="company"
        valueField="id"
        columns={columns}
        valueText={() => order.customerName}
        x-model={() => order.customer}
        stretch
      />
      <Lookup class="lk-missing" label="A key the server does not have" dataSource={customers} textField="company" valueField="id" columns={columns} value={9999} stretch />
      <Button class="lk-another" text="Another customer" variant="outline" onclick={another} />
    </>
  );
}
