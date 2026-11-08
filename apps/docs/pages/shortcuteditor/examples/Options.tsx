import { reactive } from '@motifx/core';
import { ShortcutEditor, Stack, Switch, addShortcut, type ShortcutInfo } from '@motifx-community/ui';

/**
 * Shortcuts of the app's own (`addShortcut` with a name), one the user cannot change, and the switches of the editor:
 * the categories, the search field, the reset button, and every shortcut or only the ones the user can change.
 */
export default function Options() {
  const s = reactive({ grouped: true, search: true, resetAll: true, all: false });
  const ours = (info: ShortcutInfo) => !!info.name?.startsWith('options.');
  const changeable = (info: ShortcutInfo) => info.customizable && ours(info);

  return (
    <Stack
      gap="md"
      ref={(host: Stack) => {
        const stops = [
          addShortcut(['F5', 'Mod+R'], () => {}, { scope: host, name: 'options.reload', text: 'Reload', category: 'View' }),
          addShortcut('Mod+=', () => {}, { scope: host, name: 'options.zoomIn', text: 'Zoom in', category: 'View' }),
          addShortcut('Mod+-', () => {}, { scope: host, name: 'options.zoomOut', text: 'Zoom out', category: 'View' }),
          addShortcut('F1', () => {}, { scope: host, name: 'options.help', text: 'Help', category: 'Help', customizable: false }),
        ];
        host.motif.setDisposable(() => stops.forEach((stop) => stop()));
      }}
    >
      <Stack orientation="horizontal" gap="lg" wrap>
        <Switch label="Categories" x-model={() => s.grouped} />
        <Switch label="Search" x-model={() => s.search} />
        <Switch label="Reset all keys" x-model={() => s.resetAll} />
        <Switch label="Fixed shortcuts too" x-model={() => s.all} />
      </Stack>
      <ShortcutEditor
        height="20rem"
        grouped={() => s.grouped}
        searchEnabled={() => s.search}
        resetAllEnabled={() => s.resetAll}
        filter={() => (s.all ? ours : changeable)}
      />
    </Stack>
  );
}
