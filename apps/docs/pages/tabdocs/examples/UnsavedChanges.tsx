import { reactive } from '@motifx/core';
import { confirm, TabDocument, TabDocumentManager } from '@motifx-community/ui';
import { customerForm, type Customer } from './contents';

const people: Customer[] = [
  { name: 'Grace Hopper', email: 'grace@example.com', city: 'New York' },
  { name: 'Alan Turing', email: 'alan@example.com', city: 'London' },
];

/** Edit a field: the tab shows a dot in place of its close button, and closing it asks first (`e.promise`). */
export default function UnsavedChanges() {
  const docs = new TabDocumentManager({ label: 'Customers' });
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';

  for (const person of people) {
    const saved = { ...person };
    const customer = reactive({ ...person });
    docs.open(
      new TabDocument({
        id: person.email,
        type: 'customer',
        title: () => customer.name || 'New customer',
        dirty: () => customer.name !== saved.name || customer.email !== saved.email || customer.city !== saved.city,
        content: () => customerForm(customer),
      }),
    );
  }

  docs.onClosing((e) => {
    if (e.document.dirty) e.promise = confirm(`${e.document.title} has unsaved changes. Close it anyway?`, { title: 'Close', tone: 'caution' });
  });

  return <>{docs}</>;
}
