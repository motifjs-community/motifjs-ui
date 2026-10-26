import { reactive } from '@motifx/core';
import { TabDocument, TabDocumentManager } from '@motifx-community/ui';
import { customerForm, notes, ordersGrid } from './contents';

/** Three kinds of content in two groups: a form, a grid and plain text. */
export default function Overview() {
  const docs = new TabDocumentManager({ label: 'Workspace' });
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';

  const ada = reactive({ name: 'Ada Lovelace', email: 'ada@example.com', city: 'London' });
  docs.open(new TabDocument({ id: 'ada', type: 'customer', title: () => ada.name || 'New customer', description: 'Customers', content: () => customerForm(ada) }));
  docs.open(new TabDocument({ id: 'orders', type: 'orders', title: 'Orders', badge: 60, content: () => ordersGrid() }));
  const readme = docs.open(new TabDocument({ id: 'readme', type: 'notes', title: 'Read me', content: () => notes('Read me') }))!;
  docs.split(docs.groups[0], 'right', readme);
  docs.activate(docs.findDocument('orders')!);

  return <>{docs}</>;
}
