import { reactive } from '@motifx/core';
import { MenuBar, Stack, type MenuItem } from '@motifx-community/ui';

const MENUS: MenuItem[] = [
  { key: 'file', text: '&File', items: [{ key: 'new', text: '&New' }, { key: 'open', text: '&Open…' }] },
  { key: 'edit', text: '&Edit', items: [{ key: 'undo', text: '&Undo' }, { key: 'redo', text: '&Redo' }] },
  { key: 'help', text: '&Help', items: [{ key: 'about', text: '&About' }] },
];

/**
 * The menu a right-click opens on the bar, with commands of the app's own: the bar is not `customizable`, so they are
 * the only ones. Help opens no menu at all.
 */
export default function CustomMenuCommands() {
  const s = reactive({ told: 'Nothing yet.' });

  return (
    <Stack gap="md">
      <MenuBar
        label="Own commands"
        items={MENUS}
        onCustomMenuOpening={(e) => {
          if (e.path === 'help') {
            e.cancel = true;
            return;
          }
          const name = e.item ? String(e.item.text).replace('&', '') : 'the bar';
          e.items.push(
            { text: `Copy the path of ${name}`, click: () => (s.told = `Path: ${e.path ?? '(none)'}`) },
            { text: 'Show all menus', beginGroup: true, click: () => (s.told = 'Every menu is shown.') },
          );
        }}
      />
      <output class="mb-own-told">{() => s.told}</output>
    </Stack>
  );
}
