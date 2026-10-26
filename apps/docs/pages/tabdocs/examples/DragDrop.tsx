import { reactive } from '@motifx/core';
import { TabDocumentManager, type TabDroppedEventArgs } from '@motifx-community/ui';
import { FILES, fileDocument } from './files';

/** What a drop did, in a few words. */
function describe(e: TabDroppedEventArgs): string {
  const what = e.document?.title ?? 'a group';
  const where = e.target === 'strip' ? `place ${e.index + 1} of a strip` : e.target === 'edge' ? `the ${e.side} edge` : e.side === 'center' ? 'a group' : `the ${e.side} of a group`;
  return `${what} ${e.copy ? 'copied' : 'moved'} to ${where}`;
}

/**
 * Drag a tab along its strip, onto another strip, into a group (the middle of its content) or
 * beside it (an edge), or along an edge of the whole layout. Drag a group by the empty part of its
 * bar or by its handle. Hold Ctrl (Option on a Mac) while dropping for a copy; Escape puts everything back.
 */
export default function DragDrop() {
  const s = reactive({ last: 'Drag a tab, or a group by its handle.' });
  // Narrow groups, for the narrow column of this page; a handle drags a group whose tabs fill its bar.
  const docs = new TabDocumentManager({ label: 'Files to drag', allowDuplicate: true, minGroupWidth: 100, groupDragHandle: true });
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';
  for (const file of FILES.slice(0, 4)) docs.open(fileDocument(file.path), { index: 99 });
  const right = docs.split(docs.activeGroup!, 'right')!;
  for (const file of FILES.slice(4, 6)) right.open(fileDocument(file.path), { index: 99 });
  const below = docs.split(right, 'down')!;
  for (const file of FILES.slice(6)) below.open(fileDocument(file.path), { index: 99 });
  docs.onDropped((e) => (s.last = describe(e)));
  docs.onDragEnded((e) => {
    if (!e.dropped) s.last = 'Nothing moved.';
  });

  return (
    <>
      {docs}
      <output class="td-state">{() => s.last}</output>
    </>
  );
}
