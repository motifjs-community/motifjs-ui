import { reactive } from '@motifx/core';
import { Panel, TreeView } from '@motifx-community/ui';
import type { Entry } from './entry';
import { FILE, FOLDER, icon } from './icon';

const BOX = 'inline-size: 100%; max-inline-size: 26rem; background: var(--mx-color-bg-card)';

/** A sample disk: the entries of each folder. */
const DISK: Record<string, string[]> = {
  '/': ['Documents/', 'Pictures/', 'Shared/', 'notes.txt'],
  '/Documents/': ['Invoices/', 'Letters/', 'plan.docx'],
  '/Documents/Invoices/': ['2025/', '2026/'],
  '/Documents/Invoices/2025/': ['january.pdf', 'february.pdf'],
  '/Documents/Invoices/2026/': ['march.pdf'],
  '/Documents/Letters/': [],
  '/Pictures/': ['holiday.jpg', 'cat.png'],
  '/Shared/': ['team.xlsx'],
};

function entriesOf(path: string): Entry[] {
  return (DISK[path] ?? []).map((name) => {
    const folder = name.endsWith('/');
    return { id: path + name, text: folder ? name.slice(0, -1) : name, folder, hasChildren: folder };
  });
}

/** Children loaded when a folder first opens, with a load that fails once (Shared) and a retry. */
export default function FileExplorer() {
  const s = reactive({ opened: '', loads: 0 });
  let failed = false;

  const loadChildren = (entry: Entry) =>
    new Promise<Entry[]>((resolve, reject) => {
      s.loads++;
      setTimeout(() => {
        if (entry.id === '/Shared/' && !failed) {
          failed = true;
          reject(new Error('The share is offline.'));
        } else {
          resolve(entriesOf(entry.id));
        }
      }, 500);
    });

  return (
    <>
      <Panel variant="outline" padding="xxs" style={BOX}>
        <TreeView
          class="tv-lazy"
          label="Disk"
          items={[{ id: '/', text: 'My disk', folder: true }]}
          loadChildren={loadChildren}
          iconField={(entry: Entry) => icon(entry.folder ? FOLDER : FILE)}
          expandOn="dblclick"
          onExpanded={(e) => (s.opened = `Opened ${e.item.text}.`)}
        />
      </Panel>
      <output class="tv-loads">{() => `Loads: ${s.loads}. ${s.opened}`}</output>
    </>
  );
}
