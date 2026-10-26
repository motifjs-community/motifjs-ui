import { reactive } from '@motifx/core';
import { TabDocumentManager } from '@motifx-community/ui';
import { FILES, fileDocument } from './files';

/**
 * Two managers with the same `dragGroup` take each other's tabs and groups. The content moves with
 * its tab, it is not made again: an edit in a moved tab is still there.
 */
export default function BetweenManagers() {
  const s = reactive({ last: 'Drag a tab from one manager to the other.' });
  const style = 'block-size: 28rem; flex: 1 1 0px; min-inline-size: 0';
  const left = new TabDocumentManager({ label: 'Project files', dragGroup: 'files' });
  const right = new TabDocumentManager({ label: 'Pinned files', dragGroup: 'files' });
  left.element.style.cssText = style;
  right.element.style.cssText = style;
  for (const file of FILES.slice(0, 5)) left.open(fileDocument(file.path), { index: 99 });
  for (const file of FILES.slice(5)) right.open(fileDocument(file.path), { index: 99 });
  for (const docs of [left, right]) {
    docs.onOpened((e) => {
      if (e.byUser) s.last = `${e.document.title} came into ${docs.label}`;
    });
  }

  return (
    <>
      <div style="display: flex; gap: var(--mx-space-3); inline-size: 100%">
        {left}
        {right}
      </div>
      <output class="td-state">{() => s.last}</output>
    </>
  );
}
