import type { ComponentBase } from '@motifx/core';
import { Button, confirm, DataGrid, FormLayout, type FormItem, type GridColumn } from '@motifx-community/ui';
import { makeOrders, type Order } from './orders';

const columns: GridColumn<Order>[] = [
  { field: 'id', title: 'No', type: 'number', width: 70 },
  { field: 'customer', title: 'Customer', width: 160 },
  { field: 'city', title: 'City', width: 110 },
  { field: 'amount', title: 'Amount', type: 'number', width: 100 },
];

/** A grid of orders that fills its tab. */
export function ordersGrid(count = 60): ComponentBase {
  return <DataGrid rows={makeOrders(count)} rowKey="id" columns={columns} label="Orders" style="block-size: 100%" />;
}

/** The fields a customer is edited with. */
export interface Customer {
  name: string;
  email: string;
  city: string;
}

/** The forms open over each customer: a copy of a document has a form of its own over the same object. */
const formsOf = new WeakMap<Customer, Set<FormLayout<Customer>>>();

/**
 * A form over a customer: what is typed goes straight into it. The form reads the object as it is, so the other forms
 * over the same customer are told to read the field again.
 */
export function customerForm(customer: Customer): ComponentBase {
  const items: FormItem[] = [
    { field: 'name', label: 'Name', required: true },
    { field: 'email', label: 'Email', editor: 'email' },
    { field: 'city', label: 'City' },
  ];
  const forms = formsOf.get(customer) ?? new Set<FormLayout<Customer>>();
  formsOf.set(customer, forms);
  return (
    <div style="padding: var(--mx-space-4); max-inline-size: 32rem">
      <FormLayout<Customer>
        data={customer}
        items={items}
        ref={(form: FormLayout<Customer>) => {
          forms.add(form);
          form.motif.setDisposable(() => forms.delete(form));
        }}
        onFieldChanged={(e) => {
          for (const other of forms) if (other.data === e.data && !other.isDisposed) other.refreshField(e.field);
        }}
      />
    </div>
  );
}

/** A few paragraphs of plain text. */
export function notes(title: string): ComponentBase {
  return (
    <div style="padding: var(--mx-space-4); max-inline-size: 40rem">
      <h3 style="margin-block-start: 0">{title}</h3>
      <p>Any component can be a document: a form, a grid, a chart or plain text like this.</p>
      <p>Drag the line between two groups, or focus it with Tab and use the arrow keys. A double click on it gives the groups the same size.</p>
    </div>
  );
}

const CITIES = ['İstanbul', 'Ankara', 'İzmir', 'London', 'New York'];

/** A customer card: text fields and a drop-down list of cities over a reactive customer, and a button that asks in a dialog. */
export function customerCard(customer: Customer): ComponentBase {
  const items: FormItem[] = [
    { field: 'name', label: 'Name', required: true },
    { field: 'email', label: 'Email', editor: 'email' },
    { field: 'city', label: 'City', editor: 'dropdown', editorProps: { items: CITIES } },
  ];
  let card: ComponentBase | null = null;
  // The dialog opens where the card is: in a new window, there.
  const clear = async () => {
    if (await confirm('Clear the customer card?', { title: 'Clear', host: card! })) Object.assign(customer, { name: '', email: '', city: '' });
  };
  return (
    <div ref={(c: ComponentBase) => (card = c)} style="padding: var(--mx-space-4); max-inline-size: 32rem">
      <FormLayout data={customer} items={items} />
      <Button text="Clear…" variant="outline" onclick={clear} />
    </div>
  );
}
