# MenuBar: ContextMenu

> MenuBar · @motifx-community/ui 0.1.0-beta.10

The menu of an element: it opens on a right-click at the pointer, and with the Menu key or Shift+F10 at the focused element. Its items are the same as those of a menu bar.

## A menu for each row

A `ContextMenu` placed in an element belongs to it (`target` can name another). `onOpening` builds the items for the component under the pointer, in this case a row in a list: a locked file cannot be renamed. Setting `e.cancel = true` outside a row leaves the browser’s own menu.

```tsx
import { reactive, type Component, type ComponentBase } from '@motifx/core';
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

  const rowOf = (part: ComponentBase) => {
    let id: string | null = null;
    for (let at: ComponentBase | null = part; at && !id; at = at.parent) id = at.attr.get('data-id');
    return s.files.find((f) => f.id === Number(id));
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
          const row = rowOf(e.part);
          if (row) e.items = rowItems(row);
          else e.cancel = true;
        }}
      />
      <output class="cm-log">{() => s.log}</output>
    </>
  );
}
```

## attachContextMenu

`attachContextMenu(target, items)` attaches a menu to a component without placing another one. `items` can be a function of the opening event. It returns a function that removes the menu.

```tsx
import { reactive, type Component } from '@motifx/core';
import { attachContextMenu } from '@motifx-community/ui';

const START = 'Right-click here, or focus me and press the Menu key.';
const BOX = 'padding: var(--mx-space-4); background: var(--mx-color-bg-card); border: var(--mx-border-width-1) solid var(--mx-color-stroke-card); border-radius: var(--mx-radius-lg)';

/** A menu given to a component with `attachContextMenu`, its items built from the opening. */
export default function AttachedMenu() {
  const s = reactive({ zone: START });

  const attach = (c: Component<HTMLDivElement>) => {
    const remove = attachContextMenu(c, (e) => [
      { text: '&Say where', click: () => (s.zone = `Opened ${e.byKeyboard ? 'from the keyboard' : 'with the pointer'} on ${e.part === c ? 'the zone' : 'its content'}.`) },
      { text: '&Reset', click: () => (s.zone = START) },
    ]);
    c.motif.setDisposable(remove);
  };

  return (
    <div class="cm-zone" tabindex="0" style={BOX} onBuilt={attach}>
      {() => s.zone}
    </div>
  );
}
```

## Behavior

| Topic | Details |
| --- | --- |
| `Opening` | A right-click opens the menu at the pointer; the Menu key and Shift+F10 open it at the focused element, on its first item. |
| `Items per element` | `onOpening` receives the component under the pointer or the focus (`e.part`) and sets `e.items` for it, or `e.cancel = true` to leave the browser’s own menu. |
| `Closing` | Escape, a click outside or choosing an item closes the menu; focus returns to the element it opened on. |
| `Scrolling` | The menu follows the element it opened on while the page scrolls, and closes once the element is out of view (`closeOnScroll`). |
| `Room` | A menu taller than the window scrolls inside and keeps its scroll position. |

The props, properties and events of `ContextMenu` are in the [API reference](menus-api.md).

## Feedback

Loading issues…
