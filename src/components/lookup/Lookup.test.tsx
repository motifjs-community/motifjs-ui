import { Component, reactive } from '@motifx/core';
import { data } from '@motifx-community/data';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { enStrings, trStrings, uiLocale } from '../../core/ui-locale';
import { DropDown } from '../dropdown/DropDown';
import { Lookup } from './Lookup';
import { dataKinds } from '../../../tests/data-kinds';

let hosts: Component[] = [];

afterEach(async () => {
  for (const host of hosts.splice(0)) if (!host.isDisposed) await host.dispose();
  document.body.innerHTML = '';
  uiLocale.strings = enStrings;
});

function page(...children: Parameters<typeof mountHost>) {
  const host = mountHost(...children);
  hosts.push(host);
  return host;
}

async function settle(rounds = 20) {
  for (let i = 0; i < rounds; i++) await tick();
}

interface Customer {
  id: number;
  company: string;
  city: string;
}

const CUSTOMERS: Customer[] = Array.from({ length: 500 }, (_, i) => ({ id: i + 1, company: `Company ${i + 1}`, city: i % 2 ? 'Berlin' : 'Paris' }));

const source = () =>
  new data.DataSource<Customer, number>({ adapter: new data.ArrayAdapter({ data: CUSTOMERS, key: 'id' }), loadMode: 'blocks', pageSize: 50, searchFields: ['company'] });

const shownText = (d: { element: HTMLElement }) => d.element.querySelector('.mx-drop-down__text')!.textContent;
const options = (d: { element: HTMLElement }) => Array.from(d.element.querySelectorAll<HTMLElement>('[role="option"]'));

/** Answers a request by key (a filtered load) only when let go; `fail` makes the next one fail. */
class HeldAdapter extends data.ArrayAdapter<Customer, number> {
  fail = false;
  private held: (() => void)[] = [];

  constructor() {
    super({ data: CUSTOMERS, key: 'id' });
  }

  override async load(options: data.LoadOptions = {}): Promise<data.LoadResult<Customer>> {
    if (options.filter) {
      await new Promise<void>((go) => this.held.push(go));
      if (this.fail) {
        this.fail = false;
        throw new Error('offline');
      }
    }
    return super.load(options);
  }

  letGo() {
    for (const go of this.held.splice(0)) go();
  }
}

const heldSource = (adapter: HeldAdapter) => new data.DataSource<Customer, number>({ adapter, loadMode: 'blocks', pageSize: 50 });

describe('DropDown and Lookup over a data source', () => {
  it('shows a value on no loaded page, found by key', async () => {
    let d!: DropDown<Customer, number>;
    page(<DropDown ref={(x: DropDown<Customer, number>) => (d = x)} dataSource={source()} textField="company" valueField="id" value={420} />);
    await settle();
    expect(shownText(d)).toBe('Company 420');
    d.open();
    await settle();
    expect(options(d).length).toBeLessThan(100);
    // Its place is not known before it loads: the list opens at the top.
    expect(d.element.querySelector('[role="option"][data-active]')!.textContent).toBe('Company 1');
    d.close();
    d.value = 7;
    await settle();
    d.open();
    expect(d.element.querySelector('[role="option"][data-active]')!.textContent).toBe('Company 7');
  });

  it('waits while the value is asked for by key: busy, closed, a spinner, never the key as its text', async () => {
    const adapter = new HeldAdapter();
    let d!: DropDown<Customer, number>;
    page(<DropDown ref={(x: DropDown<Customer, number>) => (d = x)} label="Customer" dataSource={heldSource(adapter)} textField="company" valueField="id" value={420} clearButton />);
    await settle();
    const display = d.element.querySelector<HTMLElement>('[role="combobox"]')!;
    const text = d.element.querySelector<HTMLElement>('.mx-drop-down__text')!;
    expect(d.element.hasAttribute('data-loading')).toBe(true);
    expect(display.getAttribute('aria-busy')).toBe('true');
    expect(text.querySelector('.mx-sr-only')!.textContent).toBe('Loading…');
    expect(text.textContent).not.toContain('420');
    expect(text.hasAttribute('data-placeholder')).toBe(false);
    expect(d.element.querySelector('.mx-drop-down__spinner')).not.toBeNull();
    expect(d.open()).toBe(false);
    display.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    expect(d.value).toBe(420);
    // The wait's text is the kit's, in its language.
    uiLocale.strings = trStrings;
    await settle();
    expect(text.querySelector('.mx-sr-only')!.textContent).toBe('Yükleniyor…');

    adapter.letGo();
    await settle();
    expect(shownText(d)).toBe('Company 420');
    expect(d.element.hasAttribute('data-loading')).toBe(false);
    expect(display.hasAttribute('aria-busy')).toBe(false);
    expect(d.open()).toBe(true);
  });

  it('shows valueText at once while the item is asked for, then the item', async () => {
    const adapter = new HeldAdapter();
    const order = reactive({ customer: 420 as number | null, customerName: 'Company 420 (saved)' });
    let d!: DropDown<Customer, number>;
    page(
      <DropDown
        ref={(x: DropDown<Customer, number>) => (d = x)}
        dataSource={heldSource(adapter)}
        textField="company"
        valueField="id"
        x-model={() => order.customer}
        valueText={() => order.customerName}
      />,
    );
    await settle();
    expect(shownText(d)).toBe('Company 420 (saved)');
    expect(d.element.hasAttribute('data-loading')).toBe(false);
    expect(d.open()).toBe(true);
    d.close();
    adapter.letGo();
    await settle();
    expect(shownText(d)).toBe('Company 420');
    expect(d.selectedItem?.id).toBe(420);
  });

  it('marks a key the data source does not have, with the reason as its title', async () => {
    let d!: DropDown<Customer, number>;
    page(<DropDown ref={(x: DropDown<Customer, number>) => (d = x)} dataSource={source()} textField="company" valueField="id" value={9999} />);
    await settle();
    const text = d.element.querySelector<HTMLElement>('.mx-drop-down__text')!;
    expect(text.textContent).toBe('9999');
    expect(text.hasAttribute('data-missing')).toBe(true);
    expect(text.title).toBe('Not found in the list');
    expect(d.element.hasAttribute('data-loading')).toBe(false);
    d.value = 12;
    await settle();
    expect(text.textContent).toBe('Company 12');
    expect(text.hasAttribute('data-missing')).toBe(false);
    expect(text.hasAttribute('title')).toBe(false);
  });

  it('shows the key of a request that failed, and asks again when the list opens', async () => {
    const adapter = new HeldAdapter();
    adapter.fail = true;
    let d!: DropDown<Customer, number>;
    page(<DropDown ref={(x: DropDown<Customer, number>) => (d = x)} dataSource={heldSource(adapter)} textField="company" valueField="id" value={420} />);
    await settle();
    adapter.letGo();
    await settle();
    const text = d.element.querySelector<HTMLElement>('.mx-drop-down__text')!;
    expect(text.textContent).toBe('420');
    expect(text.hasAttribute('data-missing')).toBe(true);
    expect(text.title).toBe('Could not load.');
    expect(d.open()).toBe(true);
    await settle();
    adapter.letGo();
    await settle();
    expect(shownText(d)).toBe('Company 420');
    expect(text.hasAttribute('data-missing')).toBe(false);
  });

  it('searches the data source from its search box and lists the rows in columns', async () => {
    const s = reactive({ id: null as number | null });
    let l!: Lookup<Customer, number>;
    page(
      <Lookup
        ref={(x: Lookup<Customer, number>) => (l = x)}
        dataSource={source()}
        textField="company"
        valueField="id"
        searchDelay={0}
        columns={[
          { field: 'company', caption: 'Company' },
          { field: 'city', caption: 'City', width: '6rem' },
        ]}
        x-model={() => s.id}
      />,
    );
    await settle();
    l.open();
    await settle();
    const header = l.element.querySelector('.mx-lookup__header')!;
    expect(Array.from(header.children).map((c) => c.textContent)).toEqual(['Company', 'City']);
    expect(options(l)[0].querySelectorAll('.mx-lookup__cell').length).toBe(2);
    const search = l.element.querySelector<HTMLInputElement>('.mx-drop-down__search input')!;
    expect(document.activeElement).toBe(search);
    search.value = 'Company 49';
    search.dispatchEvent(new InputEvent('input', { bubbles: true }));
    await new Promise((done) => setTimeout(done, 5));
    await settle();
    expect(options(l).map((o) => o.querySelector('.mx-lookup__cell')!.textContent)).toEqual(['Company 49', 'Company 490', 'Company 491', 'Company 492', 'Company 493', 'Company 494', 'Company 495', 'Company 496', 'Company 497', 'Company 498', 'Company 499']);
    search.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    expect(s.id).toBe(49);
    await settle();
    expect(shownText(l)).toBe('Company 49');
  });

  it('reads columns given as a function over plain data again on reState', async () => {
    const city = { field: 'city', caption: 'City' };
    const plain = { columns: [{ field: 'company', caption: 'Company' }] as { field: string; caption: string }[], headers: true };
    let d!: Lookup<{ id: number; company: string; city: string }, number>;
    const host = page(
      <Lookup
        ref={(x: Lookup<{ id: number; company: string; city: string }, number>) => (d = x)}
        items={[{ id: 1, company: 'Acme', city: 'Paris' }]}
        textField="company"
        valueField="id"
        columns={() => plain.columns}
        showColumnHeaders={() => plain.headers}
      />,
    );
    await settle();
    d.open();
    await settle();
    const header = () => Array.from(d.element.querySelectorAll('.mx-lookup__header .mx-lookup__cell')).map((c) => c.textContent);
    expect(header()).toEqual(['Company']);
    plain.columns = [...plain.columns, city];
    await settle();
    expect(header()).toEqual(['Company']);
    host.reState();
    await settle();
    expect(header()).toEqual(['Company', 'City']);
    plain.headers = false;
    host.reState();
    expect(d.element.querySelector<HTMLElement>('.mx-lookup__header')!.hidden).toBe(true);
    expect(city).toEqual({ field: 'city', caption: 'City' });
  });

  describe.each(dataKinds)('%s data', (_, make) => {
    it('reads its columns and items again on refresh()', async () => {
      const columns = make([{ field: 'company', caption: 'Company' }, { field: 'city', caption: 'City' }]);
      const items = make([{ id: 1, company: 'Acme', city: 'Paris' }]);
      let d!: Lookup<{ id: number; company: string; city: string }, number>;
      page(<Lookup ref={(x: Lookup<{ id: number; company: string; city: string }, number>) => (d = x)} items={items} textField="company" valueField="id" columns={columns} value={1} />);
      await settle();
      d.open();
      await settle();
      const header = () => Array.from(d.element.querySelectorAll('.mx-lookup__header .mx-lookup__cell')).map((c) => c.textContent);
      expect(header()).toEqual(['Company', 'City']);
      expect(d.selectedItem).toBe(items[0]);
      columns[1].caption = 'Town';
      items[0].company = 'Acme Inc.';
      await settle();
      expect(header()).toEqual(['Company', 'City']);
      d.refresh();
      await settle();
      expect(header()).toEqual(['Company', 'Town']);
      expect(shownText(d)).toBe('Acme Inc.');
      expect(options(d)[0].textContent).toBe('Acme Inc.Paris');
    });
  });
});
