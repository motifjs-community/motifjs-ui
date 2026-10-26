import type { FilterBuilderField } from '@motifx-community/ui';

export interface Sale {
  id: number;
  product: string;
  city: string;
  amount: number;
  date: Date;
  paid: boolean;
  stateId: number;
}

export const states = [
  { id: 1, name: 'Ordered' },
  { id: 2, name: 'Shipped' },
  { id: 3, name: 'Delivered' },
  { id: 4, name: 'Returned' },
];

const products = ['Desk', 'Chair', 'Lamp', 'Shelf', 'Monitor', 'Keyboard'];
const cities = ['Ankara', 'İstanbul', 'İzmir', 'Bursa', 'Antalya'];

export const sales: Sale[] = Array.from({ length: 60 }, (_, i) => ({
  id: i + 1,
  product: products[i % products.length],
  city: cities[(i * 7) % cities.length],
  amount: 40 + ((i * 37) % 900),
  date: new Date(2026, i % 6, 1 + ((i * 5) % 27)),
  paid: i % 3 !== 0,
  stateId: 1 + (i % states.length),
}));

export const saleFields: FilterBuilderField[] = [
  { dataField: 'product', caption: 'Product' },
  { dataField: 'city', caption: 'City', filterOperations: ['contains', 'startswith', '=', '<>', 'anyof', 'noneof', 'isblank', 'isnotblank'] },
  { dataField: 'amount', caption: 'Amount', dataType: 'number', format: { style: 'currency', currency: 'EUR' } },
  { dataField: 'date', caption: 'Date', dataType: 'date', format: { dateStyle: 'medium' } },
  { dataField: 'paid', caption: 'Paid', dataType: 'boolean', trueText: 'Paid', falseText: 'Not paid' },
  { dataField: 'stateId', caption: 'State', lookup: { dataSource: states, valueField: 'id', textField: 'name' } },
];
