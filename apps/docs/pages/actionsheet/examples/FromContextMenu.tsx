import { reactive, type Component } from '@motifx/core';
import { ContextMenu, RadioGroup, Stack, type ContextMenuPresentation, type MenuItem } from '@motifx-community/ui';

const ROWS = ['Invoice 1042', 'Invoice 1043', 'Invoice 1044'];

/** One ContextMenu, shown as a menu, as an action sheet, or (auto) as a sheet when a finger opened it: long press a row on a phone. */
export default function FromContextMenu() {
  const s = reactive({ presentation: 'auto' as ContextMenuPresentation, said: '' });
  let list!: Component<HTMLUListElement>;

  const items = (row: string): MenuItem[] => [
    { text: `&Open ${row}`, click: () => (s.said = `Opened ${row}`) },
    { text: '&Copy number', click: () => (s.said = `Copied ${row}`) },
    { text: '&Delete', tone: 'danger', click: () => (s.said = `Deleted ${row}`) },
  ];

  return (
    <Stack gap="sm">
      <RadioGroup
        label="Presentation"
        orientation="horizontal"
        items={[
          { value: 'menu', text: 'Menu' },
          { value: 'sheet', text: 'Sheet' },
          { value: 'auto', text: 'Auto' },
        ]}
        itemText="text"
        itemValue="value"
        x-model={() => s.presentation}
      />
      <ul ref={(c: Component<HTMLUListElement>) => (list = c)} aria-label="Invoices" style="margin: 0; padding: 0; list-style: none">
        {ROWS.map((row) => (
          <li key={row} tabindex="0" data-row={row} style="padding: var(--mx-space-3); border-block-end: var(--mx-border-width-1) solid var(--mx-color-stroke-divider); user-select: none">
            {row}
          </li>
        ))}
      </ul>
      <output>{() => s.said || 'Right-click or long press a row; the Menu key on a focused row.'}</output>
      <ContextMenu
        label="Invoice"
        target={() => list}
        presentation={() => s.presentation}
        onOpening={(e) => {
          const row = (e.target as Element).closest('[data-row]')?.getAttribute('data-row');
          if (row) e.items = items(row);
          else e.cancel = true;
        }}
      />
    </Stack>
  );
}
