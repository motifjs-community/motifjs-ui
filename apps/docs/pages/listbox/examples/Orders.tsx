import { reactive } from '@motifx/core';
import { data } from '@motifx-community/data';
import { ListBox } from '@motifx-community/ui';

interface Order {
  id: number;
  name: string;
}

const rows: Order[] = Array.from({ length: 5000 }, (_, i) => ({ id: i + 1, name: `Order #${String(i + 1).padStart(5, '0')}` }));

/** 5,000 orders from a data source, loaded in blocks while the list scrolls and searched where they live. */
export default function Orders() {
  const form = reactive({ orders: [42, 4321] as number[] });
  const orders = new data.DataSource<Order, number>({
    adapter: new data.ArrayAdapter({ data: rows, key: 'id' }),
    loadMode: 'blocks',
    pageSize: 50,
    searchFields: ['name'],
  });

  return (
    <>
      <ListBox
        label="Orders"
        dataSource={orders}
        textField="name"
        valueField="id"
        selectionMode="multiple"
        selectAll
        searchEnabled
        height={10}
        x-model={() => form.orders}
      />
      <output class="lb-orders">{() => `${form.orders.length} chosen${form.orders.length && form.orders.length < 6 ? `: ${form.orders.join(', ')}` : ''}`}</output>
    </>
  );
}
