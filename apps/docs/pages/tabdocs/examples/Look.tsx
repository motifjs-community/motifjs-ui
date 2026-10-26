import { reactive } from '@motifx/core';
import { Button, RadioGroup, Stack, TabDocument, TabDocumentManager, type TabShowDescription } from '@motifx-community/ui';
import { notes } from './contents';
import { fileDocument } from './files';

/** A count or a dot over the tab, a colour by what the document needs, and a description only where two titles are the same. */
export default function Look() {
  const s = reactive({ unread: 3, errors: 1, description: 'duplicates' as TabShowDescription });
  const docs = new TabDocumentManager({ label: 'Badges and tones', showDescription: () => s.description });
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';
  docs.open(new TabDocument({ id: 'inbox', title: 'Inbox', badge: () => s.unread || null, tone: () => (s.unread ? 'accent' : null), content: () => notes('Inbox') }));
  docs.open(new TabDocument({ id: 'build', title: 'Build', badge: () => s.errors || null, tone: () => (s.errors ? 'danger' : 'success'), content: () => notes('Build') }), { index: 99 });
  docs.open(new TabDocument({ id: 'quota', title: 'Quota', badge: true, tone: 'warning', content: () => notes('Quota') }), { index: 99 });
  docs.open(fileDocument('src/index.ts'), { index: 99 });
  docs.open(fileDocument('src/orders/index.ts'), { index: 99 });

  return (
    <>
      <Stack orientation="horizontal" wrap align="center" gap="lg">
        <Button text="New mail" variant="outline" onclick={() => s.unread++} />
        <Button text="Read all" variant="outline" onclick={() => (s.unread = 0)} />
        <Button text={() => (s.errors ? 'Fix the build' : 'Break the build')} variant="outline" onclick={() => (s.errors = s.errors ? 0 : 2)} />
        <RadioGroup
          label="Description"
          orientation="horizontal"
          items={[
            { value: 'duplicates', text: 'Same titles' },
            { value: 'always', text: 'Always' },
            { value: 'never', text: 'Never' },
          ]}
          itemText="text"
          itemValue="value"
          x-model={() => s.description}
        />
      </Stack>
      {docs}
    </>
  );
}
