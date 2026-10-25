import { reactive, type Component } from '@motifx/core';
import { ContextMenu, type MenuItem } from '@motifx-community/ui';

interface FileRow {
  id: number;
  name: string;
  locked: boolean;
  starred: boolean;
}

const BOX = 'inline-size: 100%; margin: 0; list-style: none; padding: var(--mx-space-4); background: var(--mx-color-bg-card); border: var(--mx-border-width-1) solid var(--mx-color-stroke-card); border-radius: var(--mx-radius-lg)';

/** A context menu whose items `onOpening` builds for the row of a list it opens on. */
export default function FileList() {
  const s = reactive({
    log: 'Nothing chosen yet.',
    files: [
      { id: 1, name: 'report.docx', locked: false, starred: true },
      { id: 2, name: 'budget.xlsx', locked: true, starred: false },
      { id: 3, name: 'photo.png', locked: false, starred: false },
    ] as FileRow[],
  });
  let renamed = 0;
  let list: Component<HTMLUListElement> | null = null;

  const did = (what: string) => (s.log = what);
  const rename = (row: FileRow) => {
    row.name = `copy-${++renamed}-${row.name}`;
    did(`Renamed to ${row.name}`);
  };

  const rowItems = (row: FileRow): MenuItem[] => [
    { text: '&Open', click: () => did(`Open ${row.name}`) },
    { text: '&Rename', enabled: !row.locked, click: () => rename(row) },
    { text: '&Star', checked: row.starred, click: () => (row.starred = !row.starred) },
    { text: '&Move to', items: ['Documents', 'Pictures', 'Archive'].map((folder) => ({ text: folder, click: () => did(`Move ${row.name} to ${folder}`) })) },
    { text: '&Delete', shortcut: 'Del', beginGroup: true, enabled: !row.locked, click: () => (s.files = s.files.filter((f) => f !== row)) },
  ];

  const rowOf = (el: Element) => {
    const id = Number(el.closest('[data-id]')?.getAttribute('data-id'));
    return s.files.find((f) => f.id === id);
  };

  return (
    <>
      <ul class="cm-list" aria-label="Files" ref={(c: Component<HTMLUListElement>) => (list = c)} style={BOX}>
        {s.files.map((file) => (
          <li key={file.id} data-id={String(file.id)} tabindex="0" style="padding-block: var(--mx-space-2)">
            {() => `${file.starred ? '★ ' : ''}${file.name}${file.locked ? ' (locked)' : ''}`}
          </li>
        ))}
      </ul>
      <ContextMenu
        target={() => list}
        label="File"
        onOpening={(e) => {
          const row = rowOf(e.target);
          if (row) e.items = rowItems(row);
          else e.cancel = true;
        }}
      />
      <output class="cm-log">{() => s.log}</output>
    </>
  );
}
