import { reactive } from '@motifx/core';
import { Button, Stack, Switch, TabDocument, TabDocumentManager } from '@motifx-community/ui';
import { customerForm } from './contents';

/**
 * One customer open in two groups: each copy has a form of its own over the same data, and both
 * tabs follow the title and the unsaved changes. Splitting copies the document; turned off, it moves.
 */
export default function Duplicates() {
  const s = reactive({ allow: true });
  const saved = reactive({ name: 'Ada Lovelace', email: 'ada@example.com', city: 'London' });
  const ada = reactive({ ...saved });
  const docs = new TabDocumentManager({ label: 'Two copies', allowDuplicate: () => s.allow });
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';
  const doc = docs.open(
    new TabDocument({
      id: 'ada',
      type: 'customer',
      title: () => ada.name || 'New customer',
      dirty: () => ada.name !== saved.name || ada.email !== saved.email || ada.city !== saved.city,
      content: () => customerForm(ada),
    }),
  )!;
  docs.split(docs.groups[0], 'right', doc);

  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <Switch label="Allow two copies" x-model={() => s.allow} />
        <Button text="Split the active group" variant="outline" onclick={() => docs.activeGroup && docs.split(docs.activeGroup, 'down', docs.activeDocument ?? undefined)} />
        <Button text="Save" variant="outline" enabled={() => doc.dirty} onclick={() => Object.assign(saved, { ...ada })} />
        <output class="td-state">{() => `${docs.documents.length} tab(s) for ${new Set(docs.documents.map((d) => d.id)).size} document(s)`}</output>
      </Stack>
      {docs}
    </>
  );
}
