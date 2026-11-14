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

  it('sends 20 keys per request by default, so a request that carries them in its address stays short', async () => {
    const service = new Service();
    const items = KeyedItems.of<Customer>(source(service));
    expect(items.batchSize).toBe(20);
    await items.request(CUSTOMERS.slice(0, 45).map((c) => c.id));
    expect(service.loads.map((l) => ((l.filter as data.FilterCondition).value as number[]).length)).toEqual([20, 20, 5]);
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

  it('runs parallelRequests one-key requests at the same time (default 6)', async () => {
    const service = new Service();
    service.filters = false;
    let running = 0;
    let most = 0;
    const real = (service as any).findRow.bind(service);
    (service as any).findRow = async (key: number) => {
      running++;
      most = Math.max(most, running);
      await new Promise((r) => setTimeout(r, 1));
      running--;
      return real(key);
    };
    const items = KeyedItems.of<Customer>(source(service));
    await items.request([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(most).toBe(6);
    most = 0;
    items.parallelRequests = 2;
    await items.request([9, 10, 11, 12]);
    expect(most).toBe(2);
  });

  it('looks for a pasted text among pasteSearchLimit items (default 50)', async () => {
    const service = new Service();
    const items = KeyedItems.of<Customer>(source(service), 'id');
    await items.findByText('Customer 7', { textOf, searchFields: ['name'] });
    expect(service.loads.at(-1)?.take).toBe(50);
    items.pasteSearchLimit = 5;
    await items.findByText('Customer 8', { textOf, searchFields: ['name'] });
    expect(service.loads.at(-1)?.take).toBe(5);
  });

  it('sends batches side by side too, parallelRequests at a time, so many keys do not wait for each other', async () => {
    const service = new Service();
    let running = 0;
    let most = 0;
    const real = service.load.bind(service);
    service.load = async (options) => {
      running++;
      most = Math.max(most, running);
      await new Promise((r) => setTimeout(r, 1));
      running--;
      return real(options);
    };
    const items = KeyedItems.of<Customer>(source(service));
    items.batchSize = 10;
    await items.request(CUSTOMERS.slice(0, 100).map((c) => c.id));
    expect(most).toBe(6);
  });
});

type Code = { id: string; code: string; text: string };

/**
 * A pretend service that compares keys its own way, as a database does (`same`): in a batch filter, in a one-field
 * filter and by key. It records every load and every one-key request.
 */
class OwnWay extends data.ArrayAdapter<Code, string> {
  readonly loads: data.LoadOptions[] = [];
  readonly byKeys: string[] = [];

  constructor(
    rows: Code[],
    private readonly same: (a: unknown, b: unknown) => boolean,
  ) {
    super({ data: rows.map((r) => ({ ...r })), key: 'id' });
  }

  protected override async loadRows(options: data.LoadOptions): Promise<data.LoadResult<Code>> {
    this.loads.push(options);
    const f = options.filter as { field?: string; op?: string; value?: unknown } | null | undefined;
    if (f && f.field && (f.op === 'in' || f.op === '=')) {
      const wanted = f.op === 'in' ? (f.value as unknown[]) : [f.value];
      const { rows } = await super.loadRows({});
      const found = rows.filter((row) => wanted.some((w) => this.same((row as Record<string, unknown>)[f.field!], w)));
      return { rows: options.take ? found.slice(0, options.take) : found, total: found.length };
    }
    return super.loadRows(options);
  }

  protected override async findRow(key: string): Promise<Code | undefined> {
    this.byKeys.push(key);
    const { rows } = await super.loadRows({});
    return rows.find((row) => this.same(row.id, key));
  }
}

const trailingSpaces = (a: unknown, b: unknown) => String(a).trimEnd() === String(b).trimEnd();
const noCase = (a: unknown, b: unknown) => String(a).toLowerCase() === String(b).toLowerCase();
const CODES: Code[] = [
  { id: 'A', code: 'a1', text: 'Group A' },
  { id: 'B', code: 'b1', text: 'Group B' },
  { id: 'C', code: 'c1', text: 'Group C' },
];
const codes = (adapter: OwnWay) => new data.DataSource<Code, string>({ adapter, loadMode: 'page' });

describe('KeyedItems with a source that compares keys its own way', () => {
  it('asks for the keys a batch left over one by one, and takes what the source answers for each', async () => {
    const service = new OwnWay(CODES, trailingSpaces);
    const items = KeyedItems.of<Code>(codes(service));
    await items.request(['A  ', 'B']);
    expect(items.get('A  ')).toEqual({ state: 'found', item: CODES[0] });
    expect(items.get('B')).toEqual({ state: 'found', item: CODES[1] });
    // One batch, then the key that matched nothing here, alone.
    expect(service.loads.length).toBe(1);
    expect(service.byKeys).toEqual(['A  ']);
    // Keys the source matched to the same item stand for one item.
    expect(items.itemKeyOf('A  ')).toBe(items.itemKeyOf('A'));
    expect(items.itemKeyOf('A  ')).not.toBe(items.itemKeyOf('B'));
  });

  it('follows a source that disregards case, such as an id written in capitals', async () => {
    const service = new OwnWay([{ id: '3F2504E0-4F89', code: 'x', text: 'Item' }], noCase);
    const items = KeyedItems.of<Code>(codes(service));
    await items.request(['3f2504e0-4f89']);
    expect(items.get('3f2504e0-4f89')?.item?.text).toBe('Item');
  });

  it('finds nothing the source does not match: a source that keeps case has no item for another case', async () => {
    const service = new OwnWay(CODES, (a, b) => a === b);
    const items = KeyedItems.of<Code>(codes(service));
    await items.request(['A', 'a']);
    expect(items.get('A')?.state).toBe('found');
    // 'a' looks like 'A', so the source is asked for it alone, and it has none.
    expect(items.get('a')).toEqual({ state: 'missing' });
    expect(service.byKeys).toEqual(['a']);
  });

  it('asks for the keys left over parallelRequests at a time', async () => {
    const many: Code[] = Array.from({ length: 12 }, (_, i) => ({ id: `K${i}`, code: `k${i}`, text: `Item ${i}` }));
    const service = new OwnWay(many, trailingSpaces);
    let running = 0;
    let most = 0;
    const real = service.byKey.bind(service);
    service.byKey = async (key, options) => {
      running++;
      most = Math.max(most, running);
      await new Promise((r) => setTimeout(r, 1));
      running--;
      return real(key, options);
    };
    const items = KeyedItems.of<Code>(codes(service));
    items.parallelRequests = 3;
    await items.request(many.map((c) => `${c.id}  `));
    expect(items.get('K11  ')?.item?.text).toBe('Item 11');
    expect(most).toBe(3);
  });

  it('asks nothing more for a key that is simply not in the source', async () => {
    const service = new OwnWay(CODES, trailingSpaces);
    const items = KeyedItems.of<Code>(codes(service));
    await items.request(['B', 'Z']);
    expect(items.get('Z')).toEqual({ state: 'missing' });
    expect(service.loads.length).toBe(1);
    expect(service.byKeys).toEqual([]);
  });

  it('asks by the value field alone when the value is not the key', async () => {
    const service = new OwnWay(CODES, trailingSpaces);
    const items = KeyedItems.of<Code>(codes(service), 'code');
    await items.request(['a1   ', 'c1']);
    expect(items.get('a1   ')?.item?.text).toBe('Group A');
    expect(items.get('c1')?.item?.text).toBe('Group C');
    expect(service.byKeys).toEqual([]);
    const alone = service.loads.at(-1)!;
    expect(alone.filter).toEqual(data.where('code', '=', 'a1   '));
    expect(alone.take).toBe(1);
  });

  it('counts keys equal once normalized as one key with normalizeKey, with no request more, in a cache of its own', async () => {
    const trimEnd = (k: unknown) => (typeof k === 'string' ? k.trimEnd() : k);
    const service = new OwnWay(CODES, trailingSpaces);
    const items = KeyedItems.of<Code>(codes(service), undefined, trimEnd);
    expect(KeyedItems.of<Code>(codes(service), undefined, trimEnd)).toBe(items);
    expect(KeyedItems.of<Code>(codes(service))).not.toBe(items);
    await items.request(['A  ', 'A']);
    expect(items.get('A  ')?.item?.text).toBe('Group A');
    expect(items.sameKey('A  ', 'A')).toBe(true);
    expect(service.loads.length).toBe(1);
    expect(service.byKeys).toEqual([]);
    // An array has no source to decide: normalizeKey is the rule there.
    const array = KeyedItems.of<Code>(CODES, 'id', trimEnd);
    expect(array.get('B ')?.item?.text).toBe('Group B');
    expect(KeyedItems.of<Code>(CODES, 'id').get('B ')).toEqual({ state: 'missing' });
  });

  it('asks again for a key the source matched to an item that changed', async () => {
    const service = new OwnWay(CODES, trailingSpaces);
    const items = KeyedItems.of<Code>(codes(service));
    await items.request(['A  ']);
    const told: (readonly string[] | null)[] = [];
    items.onResolved((keys) => told.push(keys));
    await service.update('A', { text: 'Group A2' });
    expect(items.get('A  ')).toBeUndefined();
    expect(told).toEqual([[items.keyStringOf('A  ')]]);
  });
});
