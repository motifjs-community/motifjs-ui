import { Component, reactive } from '@motifx/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { dataKinds } from '../../../tests/data-kinds';
import { mountHost, tick } from '../../../tests/helpers';
import { CheckBox } from '../checkbox/CheckBox';
import { DateBox } from '../datebox/DateBox';
import { NumberBox } from '../numberbox/NumberBox';
import { TextBox } from '../textbox/TextBox';
import { FormLayout } from './FormLayout';
import type { FormTemplateContext } from './form-template-context';

let hosts: Component[] = [];

afterEach(async () => {
  for (const host of hosts.splice(0)) if (!host.isDisposed) await host.dispose();
  document.body.innerHTML = '';
});

function page(...children: Parameters<typeof mountHost>) {
  const host = mountHost(...children);
  hosts.push(host);
  return host;
}

async function settle(rounds = 8) {
  for (let i = 0; i < rounds; i++) await tick();
}

function type(input: HTMLInputElement, text: string) {
  input.value = text;
  input.dispatchEvent(new InputEvent('input', { bubbles: true }));
}

describe('FormLayout', () => {
  describe.each(dataKinds)('%s data', (_, make) => {
    it('picks an editor for each field by the type of its value and binds it both ways', async () => {
      const order = make({ customer: 'Ada', amount: 12, paid: false, due: new Date(2026, 9, 25) });
      let form!: FormLayout<typeof order>;
      page(
        <FormLayout
          ref={(f: FormLayout<typeof order>) => (form = f)}
          data={order}
          columns={2}
          items={[{ field: 'customer', label: '&Customer' }, { field: 'amount', label: 'Amount' }, { field: 'paid', label: 'Paid' }, { field: 'due', label: 'Due' }]}
        />,
      );
      await settle();
      expect(form.element.tagName).toBe('FORM');
      expect(form.editorOf('customer')).toBeInstanceOf(TextBox);
      expect(form.editorOf('amount')).toBeInstanceOf(NumberBox);
      expect(form.editorOf('paid')).toBeInstanceOf(CheckBox);
      expect(form.editorOf('due')).toBeInstanceOf(DateBox);
      const customer = form.editorOf('customer') as TextBox;
      expect(customer.value).toBe('Ada');
      type(customer.inputPart.element, 'Grace');
      expect(order.customer).toBe('Grace');
      // A change in place shows after the form reads it again, for one field or all of them.
      order.amount = 40;
      order.paid = true;
      await settle();
      expect((form.editorOf('amount') as NumberBox).value).toBe(12);
      form.refreshField('amount');
      await settle();
      expect((form.editorOf('amount') as NumberBox).value).toBe(40);
      expect((form.editorOf('paid') as CheckBox).value).toBe(false);
      form.refresh();
      await settle();
      expect((form.editorOf('paid') as CheckBox).value).toBe(true);
      expect(form.data).toBe(order);
      expect(form.element.querySelectorAll('.mx-form-layout__item').length).toBe(4);
    });

    it('checks every field when sent and reports the outcome', async () => {
      const user = make({ name: '', email: 'ada@' });
      const onSubmit = vi.fn();
      const onInvalid = vi.fn();
      let form!: FormLayout<typeof user>;
      page(
        <FormLayout
          ref={(f: FormLayout<typeof user>) => (form = f)}
          data={user}
          onValidSubmit={onSubmit}
          onInvalidSubmit={onInvalid}
          items={[
            { field: 'name', label: 'Name', required: true },
            { field: 'email', label: 'Email', editor: 'email' },
            { button: { text: 'Send', submit: true } },
          ]}
        />,
      );
      await settle();
      const send = form.element.querySelector<HTMLButtonElement>('button[type="submit"]')!;
      expect(send.textContent).toBe('Send');
      form.element.dispatchEvent(new Event('submit', { cancelable: true }));
      await new Promise((done) => setTimeout(done, 10));
      expect(onInvalid).toHaveBeenCalledTimes(1);
      expect(onInvalid.mock.calls[0][0].invalid.length).toBe(2);
      expect(document.activeElement).toBe((form.editorOf('name') as TextBox).inputPart.element);
      user.name = 'Ada';
      user.email = 'ada@motif.dev';
      form.refresh();
      await settle();
      expect(await form.submit()).toBe(true);
      expect(onSubmit.mock.calls[0][0].data).toBe(user);
    });

    it('reads the items again on refresh: their texts in place, new ones drawn', async () => {
      const data = make({ city: 'Ankara', zip: '06000' });
      const items = make([{ field: 'city', label: 'City' }] as { field: string; label: string; visible?: boolean }[]);
      let form!: FormLayout<typeof data>;
      page(<FormLayout ref={(f: FormLayout<typeof data>) => (form = f)} data={data} items={items} />);
      await settle();
      const city = form.editorOf('city') as TextBox;
      items[0].label = 'Town';
      items.push({ field: 'zip', label: 'Zip' });
      await settle();
      expect(city.label).toBe('City');
      expect(form.editorOf('zip')).toBeUndefined();
      form.refresh();
      await settle();
      expect((form.editorOf('city') as TextBox).label).toBe('Town');
      expect((form.editorOf('zip') as TextBox).value).toBe('06000');
      const zip = form.editorOf('zip');
      items[1].visible = false;
      form.refresh();
      await settle();
      expect(form.editorOf('zip')).toBe(zip);
      expect((form.editorOf('zip') as TextBox).element.closest<HTMLElement>('.mx-form-layout__item')!.isConnected).toBe(false);
    });
  });

  it('lays out groups, spans, hidden items and a read-only form, and follows new items', async () => {
    const s = reactive({ showNote: false, ro: false });
    const data = reactive({ city: 'Ankara', zip: '06000', note: '' });
    let form!: FormLayout<typeof data>;
    page(
      <FormLayout
        ref={(f: FormLayout<typeof data>) => (form = f)}
        data={data}
        readOnly={() => s.ro}
        items={() => [
          { group: 'Address', columns: 2, items: [{ field: 'city', label: 'City' }, { field: 'zip', label: 'Zip' }] },
          { field: 'note', label: 'Note', editor: 'textarea', colSpan: 'all', visible: () => s.showNote },
        ]}
      />,
    );
    await settle();
    const legend = form.element.querySelector('legend')!;
    expect(legend.textContent).toBe('Address');
    const noteCell = (form.editorOf('note')!.element as HTMLElement).closest<HTMLElement>('.mx-form-layout__item')!;
    expect(noteCell.dataset.span).toBe('all');
    expect(noteCell.isConnected).toBe(false);
    s.showNote = true;
    await settle();
    expect(noteCell.isConnected).toBe(true);
    expect(form.element.querySelector('[data-span="all"]:not(:has(fieldset))')).toBe(noteCell);
    s.ro = true;
    await settle();
    expect((form.editorOf('city') as TextBox).inputPart.element.readOnly).toBe(true);
    form.items = [{ field: 'zip', label: 'Zip code' }];
    await settle();
    expect(form.editorOf('city')).toBeUndefined();
    expect(form.element.querySelector('label')!.textContent).toBe('Zip code');
  });

  it('reads functions over plain data again on reState without making the form again', async () => {
    const plain = { showNote: false, caption: 'Address' };
    const data = { city: 'Ankara', note: '' };
    const items = [
      { group: () => plain.caption, items: [{ field: 'city', label: 'City' }] },
      { field: 'note', label: 'Note', visible: () => plain.showNote },
    ];
    let form!: FormLayout<typeof data>;
    const host = page(<FormLayout ref={(f: FormLayout<typeof data>) => (form = f)} data={() => data} items={() => items} />);
    await settle();
    const city = form.editorOf('city') as TextBox;
    city.inputPart.element.focus();
    Object.assign(plain, { showNote: true, caption: 'Where' });
    data.city = 'Bursa';
    await settle();
    expect(city.inputPart.element.value).toBe('Ankara');
    host.reState();
    await settle();
    expect(form.editorOf('city')).toBe(city);
    expect(document.activeElement).toBe(city.inputPart.element);
    expect(city.inputPart.element.value).toBe('Bursa');
    expect(form.element.querySelector('legend')!.textContent).toBe('Where');
    expect((form.editorOf('note')!.element as HTMLElement).closest<HTMLElement>('.mx-form-layout__item')!.isConnected).toBe(true);
    type(city.inputPart.element, 'İzmir');
    expect(data.city).toBe('İzmir');
  });

  it('takes editors of your own', async () => {
    FormLayout.editors.set('upper', (p) => new TextBox({ ...p, maskChars: { L: { test: /\p{L}/u, transform: 'upper' } }, mask: 'LLL' }));
    const data = reactive({ code: 'abc' });
    const form = new FormLayout<typeof data>({ data, items: [{ field: 'code', editor: 'upper' }] });
    page(form);
    await settle();
    expect((form.editorOf('code') as TextBox).value).toBe('ABC');
    FormLayout.editors.delete('upper');
  });

  it('makes an editor by a function, gives a template its place, and has a tag box by name', async () => {
    const data = reactive({ code: 'abc', tags: ['a'], note: 'Hi' });
    const form = new FormLayout<typeof data>({
      data,
      items: [
        { field: 'code', editor: (p) => new TextBox({ ...p, placeholder: 'Code' }) },
        { field: 'tags', editor: 'tagbox', editorProps: { items: ['a', 'b'] } },
        { field: 'note', template: (place) => <output class="own">{() => `${place.field}=${String((place.data as typeof data).note)}`}</output> },
      ],
    });
    page(form);
    await settle();
    expect((form.editorOf('code') as TextBox).inputPart.element.placeholder).toBe('Code');
    expect(form.editorOf('tags')!.element.classList.contains('mx-tag-box')).toBe(true);
    expect(form.element.querySelector('.own')!.textContent).toBe('note=Hi');
  });

  it('lays items out on tabs, checks the fields of every tab and shows the tab of the first that failed', async () => {
    const data = reactive({ name: 'Ada', city: '' });
    const form = new FormLayout<typeof data>({
      data,
      items: [
        {
          tabs: [
            { title: 'Person', items: [{ field: 'name', label: 'Name' }] },
            { title: 'Address', items: [{ field: 'city', label: 'City', required: true }] },
          ],
        },
      ],
    });
    page(form);
    await settle();
    const tabs = [...form.element.querySelectorAll<HTMLElement>('[role="tab"]')];
    expect(tabs.map((t) => t.textContent)).toEqual(['Person', 'Address']);
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
    const result = await form.validate();
    expect(result.valid).toBe(false);
    await settle();
    expect(tabs[1].getAttribute('aria-selected')).toBe('true');
  });
  it('does not check a field whose item is not shown: a required one hidden lets the form through, shown it stops it', async () => {
    const data = reactive({ name: 'Ada', catering: false, guests: null as number | null });
    let form!: FormLayout<typeof data>;
    page(
      <FormLayout
        ref={(f: FormLayout<typeof data>) => (form = f)}
        data={data}
        items={[
          { field: 'name', required: true },
          { field: 'catering', editor: 'checkbox' },
          { field: 'guests', editor: 'number', required: true, visible: () => data.catering },
        ]}
      />,
    );
    await settle();
    expect((await form.validate()).valid).toBe(true);
    data.catering = true;
    await settle();
    const shown = await form.validate();
    expect(shown.valid).toBe(false);
    expect(shown.invalid.length).toBe(1);
    expect(shown.invalid[0].part).toBe(form.editorOf('guests'));
    data.catering = false;
    await settle();
    expect((await form.validate()).valid).toBe(true);
    expect(form.isValid).toBe(true);
  });

  it('keeps its parts when the data or the items change: new data reaches editors and templates, new items make only their own', async () => {
    const s = reactive({ data: { name: 'Ada', city: 'Ankara' } as Record<string, unknown>, extra: false, cityLabel: 'City', tab2: 'Address' });
    const show = (place: FormTemplateContext) => <output class="own">{() => String(place.data?.name)}</output>;
    let form!: FormLayout;
    page(
      <FormLayout
        ref={(f: FormLayout) => (form = f)}
        data={() => s.data}
        items={() => [
          { field: 'name', label: 'Name' },
          { group: 'Where', items: [{ field: 'city', label: s.cityLabel }, ...(s.extra ? [{ field: 'zip', label: 'Zip' }] : [])] },
          { tabs: [{ title: 'One', items: [{ field: 'note', label: 'Note' }] }, { title: s.tab2, items: [] }] },
          { field: 'show', template: show },
          { button: { text: 'Send', submit: true } },
        ]}
      />,
    );
    await settle();
    const name = form.editorOf('name') as TextBox;
    const city = form.editorOf('city') as TextBox;
    const note = form.editorOf('note') as TextBox;
    const cityInput = city.inputPart.element;
    const own = form.element.querySelector('.own')!;
    const send = form.element.querySelector('button[type="submit"]')!;
    const legend = form.element.querySelector('legend')!;
    s.data = { name: 'Grace', city: 'Bursa', note: 'Hi' };
    await settle();
    expect(form.editorOf('name')).toBe(name);
    expect(name.value).toBe('Grace');
    expect(city.inputPart.element).toBe(cityInput);
    expect(cityInput.value).toBe('Bursa');
    expect(note.value).toBe('Hi');
    expect(form.element.querySelector('.own')).toBe(own);
    expect(own.textContent).toBe('Grace');
    type(name.inputPart.element, 'Lin');
    s.extra = true;
    s.cityLabel = 'Town';
    s.tab2 = 'More';
    await settle();
    expect(form.editorOf('name')).toBe(name);
    expect(name.inputPart.element.value).toBe('Lin');
    expect(form.editorOf('city')).toBe(city);
    expect(city.label).toBe('Town');
    expect(form.editorOf('note')).toBe(note);
    expect(form.editorOf('zip')).toBeInstanceOf(TextBox);
    expect(form.element.querySelector('.own')).toBe(own);
    expect(form.element.querySelector('button[type="submit"]')).toBe(send);
    expect(form.element.querySelector('legend')).toBe(legend);
    expect([...form.element.querySelectorAll('[role="tab"]')].map((t) => t.textContent)).toEqual(['One', 'More']);
    s.extra = false;
    await settle();
    expect(form.editorOf('zip')).toBeUndefined();
    expect(form.editorOf('city')).toBe(city);
  });
});
