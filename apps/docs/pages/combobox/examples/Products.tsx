import { reactive } from '@motifx/core';
import { data } from '@motifx-community/data';
import { ComboBox } from '@motifx-community/ui';
import { SlowAdapter } from '../../../shared/slow-adapter';

interface Product {
  id: number;
  name: string;
  category: string;
}

const categories = ['Beverages', 'Condiments', 'Dairy', 'Grains', 'Produce', 'Seafood'];
const rows: Product[] = Array.from({ length: 10000 }, (_, i) => ({ id: i + 1, name: `${categories[i % 6]} item ${i + 1}`, category: categories[i % 6] }));

/** 10,000 products on a server that responds after 300 ms. The search goes to the data source, and the value's text is looked up by key. */
export default function Products() {
  const line = reactive({ product: 2500 as number | null });
  const products = new data.DataSource<Product, number>({
    adapter: new SlowAdapter<Product, number>({ data: rows, key: 'id' }, 300),
    loadMode: 'blocks',
    pageSize: 50,
    searchFields: ['name'],
  });

  return (
    <>
      <ComboBox label="Product" dataSource={products} textField="name" valueField="id" x-model={() => line.product} stretch />
      <output class="cb-product">{() => `product: ${line.product ?? '—'}`}</output>
    </>
  );
}
