import { reactive } from '@motifx/core';
import { data } from '@motifx-community/data';
import { SlowAdapter } from '../../shared/slow-adapter';
import type { Customer } from './customer';
import type { OrderLine } from './order-line';
import type { PastOrder } from './past-order';
import type { Product } from './product';

const CITIES = ['Ankara', 'Berlin', 'İstanbul', 'İzmir', 'London', 'Madrid', 'Paris', 'Rome'];

const CUSTOMERS: Customer[] = Array.from({ length: 5000 }, (_, i) => ({
  id: i + 1,
  company: `${['Anadolu', 'Bosphorus', 'Cappadocia', 'Delta', 'Ege', 'Fener', 'Galata', 'Hisar'][i % 8]} ${['Gıda', 'Tekstil', 'Lojistik', 'Yazılım', 'Enerji'][(i >> 3) % 5]} ${i + 1}`,
  city: CITIES[(i * 7) % 8],
  phone: `0${212 + (i % 9)} ${String(4000000 + i * 131).slice(0, 7)}`,
}));

const PRODUCTS: Product[] = ['Coffee beans 1 kg', 'Green tea', 'Olive oil 5 l', 'Hazelnuts', 'Dried figs', 'Honey', 'Saffron', 'Pistachios', 'Apricots', 'Lentils'].map((name, i) => ({
  id: i + 1,
  name,
  price: [24, 9.5, 61, 18, 12.4, 15, 89, 32, 11, 4.2][i],
}));

let nextLine = 1;

/** The order on screen and what can be done with it; the page only binds and calls. */
export class OrderModel {
  readonly customers = new data.DataSource<Customer, number>({
    adapter: new SlowAdapter<Customer, number>({ data: CUSTOMERS, key: 'id' }, 250),
    loadMode: 'blocks',
    pageSize: 50,
    searchFields: ['company', 'city'],
  });

  readonly products = PRODUCTS;

  /** The customer's earlier orders, newest first. */
  readonly history: PastOrder[] = Array.from({ length: 240 }, (_, i) => ({
    no: 10240 - i,
    date: new Date(2026, 9, 24 - i),
    lines: 1 + (i % 5),
    total: Math.round((40 + ((i * 37) % 400)) * 100) / 100,
    status: ['Shipped', 'Shipped', 'Confirmed', 'Shipped', 'Returned'][i % 5],
  }));

  readonly order = reactive({
    customer: 120 as number | null,
    date: new Date() as Date | null,
    delivery: null as Date | null,
    status: 'draft' as string | null,
    express: false,
    note: '',
    lines: [this.line(1, 2), this.line(3, 1)] as OrderLine[],
  });

  readonly state = reactive({ saving: false, saved: 0 });

  get total(): number {
    return this.order.lines.reduce((sum, line) => sum + (PRODUCTS.find((p) => p.id === line.product)?.price ?? 0) * (line.quantity ?? 0), 0);
  }

  /** How full the order is against the customer's credit limit. */
  get creditUsed(): number {
    return Math.min(100, (this.total / 500) * 100);
  }

  addLine(): void {
    this.order.lines.push(this.line(null, 1));
  }

  removeLine(line: OrderLine): void {
    const at = this.order.lines.indexOf(line);
    if (at >= 0) this.order.lines.splice(at, 1);
  }

  async save(): Promise<void> {
    this.state.saving = true;
    await new Promise((done) => setTimeout(done, 900));
    this.state.saving = false;
    this.state.saved++;
  }

  private line(product: number | null, quantity: number): OrderLine {
    return { id: nextLine++, product, quantity };
  }
}
