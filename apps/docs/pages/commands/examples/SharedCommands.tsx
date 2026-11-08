import { reactive } from '@motifx/core';
import { MenuBar, Stack, Toolbar, commands, shortcuts, type Keymap } from '@motifx-community/ui';

/**
 * Commands defined once, limited to this example: the menu bar and the toolbar name them, their keys run them, and the
 * customizer's keyboard page gives them other keys.
 */
export default function SharedCommands() {
  const s = reactive({ told: 'Nothing yet.', bold: false, keymap: {} as Keymap });
  const run = (what: string) => () => (s.told = what);

  return (
    <Stack
      gap="md"
      ref={(host: Stack) => {
        // Limited to this example (`scope`), and taken away with it.
        commands.add({ key: 'new', text: '&New', shortcut: 'Alt+N', category: 'File', scope: host, run: run('New') });
        commands.add({ key: 'save', text: '&Save', shortcut: 'Mod+S', category: 'File', scope: host, run: run('Save') });
        commands.add({ key: 'print', text: '&Print', shortcut: 'Mod+P', category: 'File', scope: host, run: run('Print') });
        commands.add({ key: 'bold', text: '&Bold', shortcut: 'Mod+B', category: 'Format', scope: host, checked: () => s.bold, run: () => (s.bold = !s.bold) });
        const listening = shortcuts.onKeymapChanged((e) => (s.keymap = e.keymap));
        host.motif.setDisposable(() => listening.dispose());
      }}
    >
      <MenuBar
        label="Editor"
        customizable
        items={[
          { key: 'file', text: '&File', items: [{ command: 'new' }, { command: 'save' }, { command: 'print', beginGroup: true }] },
          { key: 'format', text: 'F&ormat', items: [{ command: 'bold' }] },
        ]}
      />
      <Toolbar label="Commands" items={[{ command: 'save' }, { command: 'print' }, { type: 'separator' }, { type: 'toggle', command: 'bold' }]} />
      <p tabIndex={0} class="cmd-page">Click here, then press the keys: they work while focus is in this example.</p>
      <output class="cmd-told">{() => `${s.told}${s.bold ? ' · bold' : ''}`}</output>
      <pre class="cmd-keymap">{() => JSON.stringify(s.keymap)}</pre>
    </Stack>
  );
}
