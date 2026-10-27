import { reactive } from '@motifx/core';
import { Button, Drawer, ListBox } from '@motifx-community/ui';

const PLACES = [
  { id: 'inbox', text: 'Inbox' },
  { id: 'starred', text: 'Starred' },
  { id: 'sent', text: 'Sent' },
  { id: 'drafts', text: 'Drafts' },
];

/** A drawer over the whole page from the start edge, bound with x-model; a finger can swipe it back to close it. */
export default function Navigation() {
  const s = reactive({ open: false, place: 'inbox' });

  return (
    <>
      <Button text="Menu" variant="outline" onclick={() => (s.open = true)} />
      <output>{() => `Showing: ${PLACES.find((p) => p.id === s.place)?.text}`}</output>
      <Drawer title="Mail" showClose x-model={() => s.open}>
        <ListBox label="Folders" items={PLACES} itemText="text" itemValue="id" x-model={() => s.place} onclick={() => (s.open = false)} />
      </Drawer>
    </>
  );
}
