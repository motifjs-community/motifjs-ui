import { reactive } from '@motifx/core';
import { FormLayout, type FormItem } from '@motifx-community/ui';

const countries = [
  { value: 'TR', text: 'Türkiye' },
  { value: 'DE', text: 'Germany' },
  { value: 'FR', text: 'France' },
];

/** The fields of a customer on two columns: editors by name or by value, a group, a field shown on a condition, a Save button that checks first. */
export default function CustomerForm() {
  const customer = reactive({
    name: 'Ada Lovelace',
    email: '',
    phone: '',
    birthday: null as Date | null,
    country: 'TR' as string | null,
    city: 'İstanbul',
    vip: false,
    credit: 1000,
    note: '',
  });
  const s = reactive({ result: '' });

  const items: FormItem[] = [
    { field: 'name', label: '&Name', required: true },
    { field: 'email', label: 'Email', editor: 'email', required: true },
    { field: 'phone', label: 'Phone', editorProps: { mask: '(000) 000 00 00', type: 'tel' } },
    { field: 'birthday', label: 'Birthday', editor: 'date', editorProps: { max: new Date() } },
    {
      group: 'Address',
      columns: 2,
      items: [
        { field: 'country', label: 'Country', editor: 'dropdown', editorProps: { items: countries } },
        { field: 'city', label: 'City' },
      ],
    },
    { field: 'vip', label: 'VIP customer', editor: 'switch' },
    { field: 'credit', label: 'Credit limit', editorProps: { format: { style: 'currency', currency: 'TRY' }, min: 0 }, visible: () => customer.vip },
    { field: 'note', label: 'Note', editor: 'textarea', colSpan: 'all' },
    { button: { text: 'Save', tone: 'accent', submit: true } },
  ];

  return (
    <>
      <FormLayout
        data={customer}
        columns={2}
        items={items}
        onValidSubmit={() => (s.result = `Saved ${customer.name}.`)}
        onInvalidSubmit={(e) => (s.result = `${e.invalid.length} field(s) to fix.`)}
      />
      <output class="fl-result">{() => s.result}</output>
      <output class="fl-data">{() => `${customer.name} · ${customer.email || '—'} · ${customer.city} · vip: ${customer.vip}`}</output>
    </>
  );
}
