import { reactive } from '@motifx/core';
import { TabDocumentManager } from '@motifx-community/ui';
import { FILES, fileDocument } from './files';
import { explorer, outline, output, problems, toolDocument } from './tools';

/**
 * A code editor's layout: the files in the middle, the explorer and the outline folded at the left
 * edge (point at a title, or click it), problems and output docked at the bottom. Drag a tab or a
 * group: guides show over the group under the pointer and at the edges; let go away from them to
 * float it in a window of its own.
 */
export default function DockIde() {
  const s = reactive({ last: 'Drag a tab: the guides show where it can go.' });
  const docs = new TabDocumentManager({ label: 'Editor with tool areas', dockGuides: true, minGroupWidth: 120, dockAreaSize: { left: 220, bottom: 150 } });
  docs.element.style.cssText = 'block-size: 30rem; inline-size: 100%';
  const open = (path: string) => docs.open(docs.findDocument(path) ?? fileDocument(path), { focus: true });
  for (const file of FILES.slice(0, 3)) docs.open(fileDocument(file.path), { index: 99 });
  docs.dock(
    toolDocument('explorer', 'Explorer', () => explorer(open)),
    'left',
  );
  docs.dock(toolDocument('outline', 'Outline', outline), 'left');
  docs.dock(toolDocument('problems', 'Problems', problems), 'bottom');
  docs.dock(toolDocument('output', 'Output', output), 'bottom');
  docs.autoHide(docs.dockArea('left')!);
  docs.onFloated((e) => (s.last = `${e.document?.title ?? 'A group'} floats in a window.`));
  docs.onDocked((e) => (s.last = `${e.document?.title ?? 'A group'} docked ${e.side ? `on the ${e.side}` : 'among the documents'}.`));
  docs.onAutoHidden((e) => (s.last = `The ${e.area.side} area ${e.on ? 'is folded to its edge' : 'is shown'}.`));

  return (
    <>
      {docs}
      <output class="td-state">{() => s.last}</output>
    </>
  );
}
