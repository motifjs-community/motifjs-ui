import { reactive } from '@motifx/core';
import { Button, Stack, TabDocumentManager } from '@motifx-community/ui';
import { notes } from './contents';

/** A locked group keeps what it has: documents opened without naming a group go elsewhere, into a new group when every one is locked. */
export default function Locked() {
  const s = reactive({ opened: 0, log: [] as { id: number; text: string }[] });
  const docs = new TabDocumentManager({ label: 'Notes and a terminal' });
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';
  const write = (text: string) => s.log.unshift({ id: s.log.length, text });
  docs.onLocked((e) => write(`group ${e.group.index + 1} locked`));
  docs.onUnlocked((e) => write(`group ${e.group.index + 1} unlocked`));
  docs.onOpened((e) => write(`${e.document.title} opened in group ${e.group.index + 1}`));
  docs.open({ id: 'terminal', title: 'Terminal', content: () => notes('Terminal') });
  docs.lock(docs.groups[0]);
  docs.split(docs.groups[0], 'right');

  const open = () => {
    const n = ++s.opened;
    docs.open({ id: `note-${n}`, title: `Note ${n}`, content: () => notes(`Note ${n}`) });
  };
  const toggle = (index: number) => {
    const group = docs.groups[index];
    if (group) (group.locked ? docs.unlock(group) : docs.lock(group));
  };

  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Open a note" variant="outline" onclick={open} />
        <Button text={() => (docs.groups[0]?.locked ? 'Unlock group 1' : 'Lock group 1')} variant="outline" onclick={() => toggle(0)} />
        <Button text={() => (docs.groups[1]?.locked ? 'Unlock group 2' : 'Lock group 2')} variant="outline" enabled={() => docs.groups.length > 1} onclick={() => toggle(1)} />
        <output class="td-state">{() => s.log.slice(0, 3).map((l) => l.text).join('; ')}</output>
      </Stack>
      {docs}
    </>
  );
}
