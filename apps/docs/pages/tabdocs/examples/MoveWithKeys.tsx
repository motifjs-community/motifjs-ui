import { reactive } from '@motifx/core';
import { Button, Stack, TabDocumentManager } from '@motifx-community/ui';
import { FILES, fileDocument } from './files';

/**
 * "Move to…" (the tab's menu, Ctrl+K M, or these buttons): the arrow keys choose a side of a group,
 * an arrow towards it again goes on to the next group, Tab picks the next group, Enter moves,
 * Escape leaves it. The same areas as a drag show where it goes.
 */
export default function MoveWithKeys() {
  const s = reactive({ place: 'Press a button, or Ctrl+K M on a tab.' });
  const docs = new TabDocumentManager({ label: 'Files to move with keys' });
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';
  for (const file of FILES.slice(0, 4)) docs.open(fileDocument(file.path), { index: 99 });
  const right = docs.split(docs.activeGroup!, 'right')!;
  for (const file of FILES.slice(4)) right.open(fileDocument(file.path), { index: 99 });
  docs.onDragOver((e) => {
    if (e.byKeyboard) s.place = e.target === 'edge' ? `the ${e.side} edge of the layout` : `group ${(e.group?.index ?? 0) + 1}, ${e.side}`;
  });
  docs.onDragEnded((e) => (s.place = e.dropped ? 'Moved.' : 'Left where it was.'));

  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Move to…" variant="outline" enabled={() => !!docs.activeDocument} onclick={() => docs.showMoveTo(docs.activeDocument!)} />
        <Button text="Move group to…" variant="outline" enabled={() => docs.groups.length > 1} onclick={() => docs.showMoveTo(docs.activeGroup!)} />
        <output class="td-state">{() => s.place}</output>
      </Stack>
      {docs}
    </>
  );
}
