import { DataGrid, type GridColumn } from '@motifx-community/ui';
import { makeCustomers } from './customers';

type Product = { id: number; name: string; colors: string[]; tags: string[]; sizes: number[]; buyers: number[] };

const COLORS: { value: string; label: string }[] = [
  { value: 'black', label: 'Black' },
  { value: 'white', label: 'White' },
  { value: 'red', label: 'Red' },
  { value: 'navy', label: 'Navy' },
  { value: 'olive', label: 'Olive' },
];
const TAGS = ['new', 'sale', 'organic', 'limited', 'bestseller'];
const NAMES = ['T-shirt', 'Hoodie', 'Jacket', 'Sneakers', 'Cap', 'Scarf', 'Jeans', 'Shirt', 'Socks', 'Coat'];

/** Products whose cells hold several values: colors from a list, free tags, sizes, and buyers from another source. */
export default function MultipleValues() {
  const buyers = makeCustomers(40);
  const products: Product[] = Array.from({ length: 60 }, (_, i) => ({
    id: i + 1,
    name: `${NAMES[i % NAMES.length]} ${Math.floor(i / NAMES.length) + 1}`,
    colors: COLORS.filter((_, c) => (i + c) % 3 === 0).map((o) => o.value),
    tags: TAGS.filter((_, t) => (i * 7 + t) % 4 === 0),
    sizes: i % 5 === 0 ? [] : [36 + (i % 3) * 2, 42 + (i % 4) * 2],
    // None, one or two buyers.
    buyers: [((i * 7) % 40) + 1, ((i * 13) % 40) + 1].slice(0, i % 3),
  }));
  const columns: GridColumn<Product>[] = [
    { field: 'id', title: 'No', type: 'number', width: 70, editable: false },
    { field: 'name', title: 'Product', width: 140 },
    { field: 'colors', title: 'Colors', type: 'list', options: COLORS, multiple: true, width: 180, required: true },
    { field: 'tags', title: 'Tags', multiple: true, width: 180 },
    { field: 'sizes', title: 'Sizes', type: 'number', multiple: true, width: 120 },
    { field: 'buyers', title: 'Buyers', multiple: true, flex: 1, width: 240, lookup: { dataSource: buyers, valueField: 'id', textField: 'name' } },
  ];

  return (
    <DataGrid
      style="block-size: 28rem"
      rows={products}
      rowKey="id"
      columns={columns}
      label="Products with several values in a cell"
      locale="en"
      saveMode="batch"
      settings={{ editable: true, filterRow: true, headerFilter: true, searchPanel: true, filterDelay: 200 }}
    />
  );
}
