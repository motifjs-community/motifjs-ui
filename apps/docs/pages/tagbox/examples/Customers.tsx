import { reactive } from '@motifx/core';
import { data } from '@motifx-community/data';
import { TagBox } from '@motifx-community/ui';

interface Customer {
  id: number;
  name: string;
}

const rows: Customer[] = Array.from({ length: 5000 }, (_, i) => ({ id: i + 1, name: `Customer ${String(i + 1).padStart(4, '0')}` }));

/** 5,000 customers from a data source, loaded in blocks while the list scrolls; the tags of values not loaded yet are found by key. */
export default function Customers() {
  const mail = reactive({ to: [12, 4321] as number[] });
  const customers = new data.DataSource<Customer, number>({
    adapter: new data.ArrayAdapter({ data: rows, key: 'id' }),
    loadMode: 'blocks',
    pageSize: 50,
    searchFields: ['name'],
  });

  return (
    <>
      <TagBox label="Customers" dataSource={customers} textField="name" valueField="id" maxTags={3} selectAll clearButton stretch x-model={() => mail.to} />
      <output class="tg-customers">{() => `${mail.to.length} chosen${mail.to.length && mail.to.length < 6 ? `: ${mail.to.join(', ')}` : ''}`}</output>
    </>
  );
}
