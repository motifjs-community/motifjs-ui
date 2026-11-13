import type { ComponentBase } from '@motifx/core';
import { Panel, TreeView } from '@motifx-community/ui';
import type { Entry } from './entry';

const BOX = 'inline-size: 100%; max-inline-size: 26rem; background: var(--mx-color-bg-card)';

const FLAT = [
  { id: 1, name: 'Company', parent: null },
  { id: 2, name: 'Sales', parent: 1 },
  { id: 3, name: 'Engineering', parent: 1 },
  { id: 4, name: 'Web', parent: 3 },
  { id: 5, name: 'Mobile', parent: 3 },
];

const MAIL: Entry[] = [
  { id: 'inbox', text: 'Inbox', count: 12, expanded: true, children: [{ id: 'work', text: 'Work', count: 3 }, { id: 'family', text: 'Family' }] },
  { id: 'sent', text: 'Sent' },
  { id: 'spam', text: 'Spam', count: 99, enabled: false },
];

/** Flat rows that name their parent, a text field given as a function, and rows drawn by a template. */
export default function FlatData() {
  const withCount = (item: Entry, host: ComponentBase) => {
    host.controls.add(<span>{item.text}</span>);
    if (item.count) host.controls.add(<strong>{` · ${item.count}`}</strong>);
  };
  return (
    <>
      <Panel variant="outline" padding="xxs" style={BOX}>
        <TreeView class="tv-flat" label="Company" items={FLAT} parentField="parent" textField={(row: (typeof FLAT)[number]) => row.name} expandedKeys={[1, 3]} />
      </Panel>
      <Panel variant="outline" padding="xxs" style={BOX}>
        <TreeView class="tv-template" label="Mail" items={MAIL} itemTemplate={withCount} />
      </Panel>
    </>
  );
}
