import { Component, reactive } from '@motifx/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mountHost, tick } from '../../../tests/helpers';
import { CheckBox } from '../checkbox/CheckBox';
import { DateBox } from '../datebox/DateBox';
import { NumberBox } from '../numberbox/NumberBox';
import { TextBox } from '../textbox/TextBox';
import { FormLayout } from './FormLayout';

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
  it('picks an editor for each field by the type of its value and binds it both ways', async () => {
    const order = reactive({ customer: 'Ada', amount: 12, paid: false, due: new Date(2026, 9, 25) });
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
    type(customer.inputElement, 'Grace');
    expect(order.customer).toBe('Grace');
    order.amount = 40;
    await settle();
    expect((form.editorOf('amount') as NumberBox).value).toBe(40);
    expect(form.element.querySelectorAll('.mx-form-layout__item').length).toBe(4);
  });

  it('checks every field when sent and reports the outcome', async () => {
    const user = reactive({ name: '', email: 'ada@' });
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
    expect(document.activeElement).toBe((form.editorOf('name') as TextBox).inputElement);
    user.name = 'Ada';
    user.email = 'ada@motif.dev';
    await settle();
    expect(await form.submit()).toBe(true);
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ data: user }));
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
    const noteCell = form.element.querySelector<HTMLElement>('[data-span="all"]:not(:has(fieldset))')!;
    expect(noteCell.hidden).toBe(true);
    s.showNote = true;
    await settle();
    expect(noteCell.hidden).toBe(false);
    s.ro = true;
    await settle();
    expect((form.editorOf('city') as TextBox).inputElement.readOnly).toBe(true);
    form.items = [{ field: 'zip', label: 'Zip code' }];
    await settle();
    expect(form.editorOf('city')).toBeUndefined();
    expect(form.element.querySelector('label')!.textContent).toBe('Zip code');
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
    expect((form.editorOf('code') as TextBox).inputElement.placeholder).toBe('Code');
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
});
