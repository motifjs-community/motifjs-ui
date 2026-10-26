import { reactive } from '@motifx/core';
import { Button, Stack, TabDocument, TabDocumentManager } from '@motifx-community/ui';
import { customerCard, notes, ordersGrid } from './contents';

/** A document moves into a browser window of its own and back; what was typed, chosen and scrolled stays as it was. */
export default function NewWindow() {
  const customer = reactive({ name: 'Ada Lovelace', email: 'ada@example.com', city: 'London' });
  const docs = new TabDocumentManager({ label: 'Documents in new windows' });
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';
  docs.open(new TabDocument({ id: 'customer', title: 'Customer', tooltip: () => `Customer: ${customer.name}`, content: () => customerCard(customer) }));
  docs.open(new TabDocument({ id: 'orders', title: 'Orders', content: () => ordersGrid(60) }));
  docs.open(new TabDocument({ id: 'notes', title: 'Notes', content: () => notes('Notes') }));

  const active = () => docs.activeDocument;
  const windows = () => {
    const list = docs.browserWindows;
    if (!list.length) return 'Every document is in this window.';
    return list.map((w, i) => `Window ${i + 1}: ${w.documents.map((d) => d.title).join(', ')}`).join('. ') + '.';
  };

  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Move the active document into a new window" variant="outline" enabled={() => !!active() && !active()!.browserWindow} onclick={() => docs.moveToNewWindow(active()!)} />
        <Button text="Move its group" variant="outline" enabled={() => !!docs.activeGroup && !docs.activeGroup.browserWindow} onclick={() => docs.moveToNewWindow(docs.activeGroup!)} />
        <Button text="Bring everything back" variant="outline" enabled={() => docs.browserWindows.length > 0} onclick={() => docs.browserWindows.forEach((w) => w.moveToMainWindow())} />
      </Stack>
      {docs}
      <output class="td-state">{() => `${windows()} Customer: ${customer.name}, ${customer.city}.`}</output>
    </>
  );
}
