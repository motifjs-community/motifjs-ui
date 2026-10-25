import { data } from '@motifx-community/data';
import { describe, expect, it } from 'vitest';
import { KeyedItems } from './KeyedItems';

type Customer = { id: number; name: string; city: string };

const CUSTOMERS: Customer[] = Array.from({ length: 250 }, (_, i) => ({ id: i + 1, name: `Customer ${i + 1}`, city: i % 2 ? 'Ankara' : 'İzmir' }));

/** A pretend service that records every load and every one-key request. */
class Service extends data.ArrayAdapter<Customer, number> {
  readonly loads: data.LoadOptions[] = [];
  readonly byKeys: number[] = [];
  filters = true;

  constructor() {
    super({ data: CUSTOMERS.map((c) => ({ ...c })), key: 'id' });
  }

  protected override backendCapabilities(): data.Capabilities {
    return { ...super.backendCapabilities(), filter: this.filters };
  }

  protected override loadRows(options: data.LoadOptions): Promise<data.LoadResult<Customer>> {
    this.loads.push(options);
    return super.loadRows(options);
  }

  protected override findRow(key: number): Promise<Customer | undefined> {
    this.byKeys.push(key);
    return super.findRow(key);
  }
}

const source = (adapter = new Service()) => new data.DataSource<Customer, number>({ adapter, loadMode: 'page' });
const textOf = (c: Customer) => c.name;

describe('KeyedItems', () => {
  it('asks for the keys of one moment in one request', async () => {
    const service = new Service();
    const items = KeyedItems.of<Customer>(source(service));
    const resolved: (readonly string[] | null)[] = [];
    items.onResolved((keys) => resolved.push(keys));
    void items.request([3, 5]);
    void items.request([5, 7]);
    expect(items.get(3)).toEqual({ state: 'loading' });
    await items.request([7]);
    expect(service.loads).toHaveLength(1);
    expect(service.loads[0].filter).toEqual({ field: 'id', op: 'in', value: [3, 5, 7] });
    expect(items.get(5)).toEqual({ state: 'found', item: CUSTOMERS[4] });
    expect(resolved).toEqual([['3', '5', '7']]);
  });

  it('splits a large moment into requests of batchSize keys', async () => {
    const service = new Service();
    const items = KeyedItems.of<Customer>(source(service));
    items.batchSize = 100;
    await items.request(CUSTOMERS.map((c) => c.id));
    expect(service.loads.map((l) => ((l.filter as data.FilterCondition).value as number[]).length)).toEqual([100, 100, 50]);
  });

  it('asks one key at a time with byKey, and by default for a service that cannot filter', async () => {
    const service = new Service();
    service.filters = false;
    const items = KeyedItems.of<Customer>(source(service));
    expect(items.resolve).toBe('byKey');
    await items.request([1, 2, 3]);
    expect(service.byKeys).toEqual([1, 2, 3]);
    expect(items.get(2)?.item?.name).toBe('Customer 2');
  });

  it('is shared by every source over the same adapter and value field', () => {
    const service = new Service();
    const a = KeyedItems.of(source(service));
    expect(KeyedItems.of(source(service))).toBe(a);
    expect(KeyedItems.of(source(service), 'name')).not.toBe(a);
    expect(KeyedItems.of(source())).not.toBe(a);
  });

  it('marks keys the source does not have as missing, never asked for again', async () => {
    const service = new Service();
    const items = KeyedItems.of<Customer>(source(service));
    await items.request([9999, 1]);
    expect(items.get(9999)).toEqual({ state: 'missing' });
    expect(items.get('1')?.state).toBe('found');
    await items.request([9999]);
    expect(service.loads).toHaveLength(1);
  });

  it('matches by a value field that is not the key', async () => {
    const service = new Service();
    const items = KeyedItems.of<Customer>(source(service), 'name');
    await items.request(['Customer 4']);
    expect(service.loads[0].filter).toEqual({ field: 'name', op: 'in', value: ['Customer 4'] });
    expect(items.get('Customer 4')?.item?.id).toBe(4);
  });

  it('remembers what an editor chose without a request', () => {
    const service = new Service();
    const items = KeyedItems.of<Customer>(source(service));
    items.remember(42, 'Chosen text');
    items.remember(43, CUSTOMERS[42]);
    expect(items.get(42)).toEqual({ state: 'found', text: 'Chosen text' });
    expect(items.get(43)?.item).toBe(CUSTOMERS[42]);
    expect(service.loads).toHaveLength(0);
  });

  it('searches by text on the service and keeps what it found', async () => {
    const service = new Service();
    const items = KeyedItems.of<Customer>(source(service));
    const { items: found, total } = await items.search('customer 12', { textOf, searchFields: ['name'] }, 0, 5);
    expect(total).toBe(11);
    expect(found.map((c) => c.id)).toEqual([12, 120, 121, 122, 123]);
    expect(items.get(120)?.state).toBe('found');
  });

  it('finds an exact text, case aside: among the known items, else on the service', async () => {
    const service = new Service();
    const items = KeyedItems.of<Customer>(source(service));
    const found = await items.findByText('CUSTOMER 7', { textOf, searchFields: ['name'] });
    expect(found.map((c) => c.id)).toEqual([7]);
    expect(items.findLoadedByText('customer 7', { textOf })).toEqual([CUSTOMERS[6]]);
    expect(await items.findByText('Nobody', { textOf, searchFields: ['name'] })).toEqual([]);
  });

  it('knows every key of an array at once', async () => {
    const states = [
      { code: 'AN', name: 'Ankara' },
      { code: 'IZ', name: 'İzmir' },
    ];
    const items = KeyedItems.of(states, 'code');
    expect(items.get('IZ')).toEqual({ state: 'found', item: states[1] });
    expect(items.get('XX')).toEqual({ state: 'missing' });
    states.push({ code: 'BU', name: 'Bursa' });
    expect(items.get('BU')?.state).toBe('found');
    const plain = KeyedItems.of(['red', 'green']);
    expect(plain.get('green')?.item).toBe('green');
    expect((await plain.search('RE', { textOf: String })).items).toEqual(['red', 'green']);
    expect((await items.search('', { textOf: (s) => s.name, filter: data.where('code', '<>', 'AN') })).items.map((s) => s.code)).toEqual(['IZ', 'BU']);
  });

  it('forgets on clear, on a reload of the source and when the adapter saves a row', async () => {
    const service = new Service();
    const customers = source(service);
    const items = KeyedItems.of<Customer>(customers);
    await items.request([1, 2]);
    await service.update(1, { name: 'Renamed' });
    expect(items.get(1)).toBeUndefined();
    expect(items.get(2)?.state).toBe('found');
    await customers.reload();
    expect(items.get(2)).toBeUndefined();
    await items.request([2]);
    items.clear();
    expect(items.get(2)).toBeUndefined();
  });
});
