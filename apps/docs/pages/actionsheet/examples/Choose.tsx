import { reactive, type Component } from '@motifx/core';
import { ActionSheet, Button, type MenuItem } from '@motifx-community/ui';

const ITEMS: MenuItem[] = [
  { text: '&Share…' },
  { text: '&Rename…' },
  {
    text: '&Move to',
    items: [{ text: 'Reports' }, { text: 'Archive' }, { text: 'Shared with me' }],
  },
  { text: '&Delete', tone: 'danger', beginGroup: true },
];

/** choose() opens the sheet and resolves with the item chosen, or null; a submenu opens in place, with a way back. */
export default function Choose() {
  const s = reactive({ said: 'Nothing chosen yet.' });
  let host!: Component<HTMLDivElement>;

  const ask = async () => {
    const sheet = new ActionSheet({ title: 'report.pdf', message: 'Changed today at 09:41' });
    const item = await sheet.choose(ITEMS, host);
    s.said = item ? `Chosen: ${String(item.text).replace('&', '')}` : 'Closed without a choice.';
  };

  return (
    <div ref={(c: Component<HTMLDivElement>) => (host = c)} style="display: contents">
      <Button text="Actions…" variant="outline" onclick={ask} />
      <output>{() => s.said}</output>
    </div>
  );
}
