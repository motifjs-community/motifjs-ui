import { reactive } from '@motifx/core';
import { Button, MenuBar, Stack, type MenuBarCustomization, type MenuItem } from '@motifx-community/ui';

const MENUS: MenuItem[] = [
  {
    key: 'file',
    text: '&File',
    items: [
      { key: 'new', text: '&New', shortcut: 'Ctrl+N' },
      { key: 'open', text: '&Open…', shortcut: 'Ctrl+O' },
      { key: 'save', text: '&Save', shortcut: 'Ctrl+S', beginGroup: true },
      { key: 'export', text: '&Export', items: [{ key: 'pdf', text: 'PDF' }, { key: 'html', text: 'HTML' }] },
      { key: 'exit', text: 'E&xit', beginGroup: true, customizable: false },
    ],
  },
  { key: 'edit', text: '&Edit', items: [{ key: 'undo', text: '&Undo' }, { key: 'redo', text: '&Redo' }, { key: 'find', text: '&Find' }] },
  { key: 'view', text: '&View', items: [{ key: 'zoom', text: '&Zoom' }, { key: 'full', text: '&Full screen' }] },
  { key: 'help', text: '&Help', customizable: false, items: [{ key: 'about', text: '&About' }] },
];

// Commands the user can add from the customizer.
const COMMANDS: MenuItem[] = [
  { key: 'print', text: '&Print', shortcut: 'Ctrl+P' },
  { key: 'share', text: 'S&hare' },
  { key: 'spelling', text: 'Check &spelling', shortcut: 'F7' },
];

/** Right-click an item, or press Shift+F10 on it, to hide or move it; what the user changed is one object to save. */
export default function CustomizableMenu() {
  const s = reactive({ saved: null as MenuBarCustomization | null, told: 'Nothing yet.' });
  let bar!: MenuBar;

  return (
    <Stack gap="md">
      <MenuBar
        ref={(b: MenuBar) => (bar = b)}
        label="Editor"
        items={MENUS}
        customizable
        commands={COMMANDS}
        onCustomized={(e) => (s.saved = e.customization)}
        onCustomMenuOpening={(e) => {
          if (e.path) e.items.push({ text: 'Show the path', beginGroup: true, click: () => (s.told = `Path: ${e.path}`) });
        }}
      />
      <output class="mb-custom-told">{() => s.told}</output>
      <pre class="mb-custom-saved">{() => JSON.stringify(s.saved ?? {}, null, 2)}</pre>
      <Stack orientation="horizontal" gap="sm" wrap>
        <Button text="Customize…" variant="outline" onclick={() => bar.openCustomizer()} />
        <Button text="Forget the changes" variant="outline" onclick={() => (bar.customization = null)} />
        <Button text="Restore the saved changes" variant="outline" onclick={() => (bar.customization = s.saved)} />
      </Stack>
    </Stack>
  );
}
