import type { GridColumn } from '@motifx-community/ui';
import type { Customer } from './customers';
import type { CustomerOrder } from './customer-order';

const ITEMS = ['Notebook', 'Pencil set', 'Desk lamp', 'Chair', 'Monitor', 'Keyboard', 'Coffee beans', 'Tea', 'Backpack', 'Umbrella'];
const money = new Intl.NumberFormat('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** A few orders of every customer (none for every seventh), the same ones every time. */
export function makeCustomerOrders(customers: Customer[]): CustomerOrder[] {
  const day = Date.UTC(2026, 0, 1);
  const out: CustomerOrder[] = [];
  for (const c of customers) {
    const count = c.id % 7 === 0 ? 0 : 2 + (c.id % 5);
    for (let k = 0; k < count; k++) {
      const n = out.length + 1;
      out.push({
        id: n,
        customerId: c.id,
        date: new Date(day + ((n * 37) % 300) * 86_400_000).toISOString().slice(0, 10),
        item: ITEMS[(n * 3) % ITEMS.length],
        quantity: 1 + (n % 4),
        amount: ((n * 7919) % 50_000) / 100,
      });
    }
  }
  return out;
}

/** The columns of a customer's orders. */
export const orderColumns: GridColumn<CustomerOrder>[] = [
  { field: 'id', title: 'No', type: 'number', width: 80 },
  { field: 'date', title: 'Date', type: 'date', width: 130 },
  { field: 'item', title: 'Item', width: 180, flex: 1 },
  { field: 'quantity', title: 'Qty', type: 'number', width: 80 },
  { field: 'amount', title: 'Amount', type: 'number', width: 120, format: (v) => (typeof v === 'number' ? money.format(v) : '') },
];
