import { reactive } from '@motifx/core';
import { ShortcutEditor, Stack, commands, type Keymap } from '@motifx-community/ui';

/**
 * The app's commands, limited to this example, and an editor for their keys. The keys the user gives arrive in
 * `onKeysChanged`, ready to save; giving them back to `shortcuts.keymap` restores them.
 */
export default function Basic() {
  const s = reactive({ told: 'Nothing yet.', keymap: {} as Keymap });
  const run = (what: string) => () => (s.told = what);

  return (
    <Stack
      gap="md"
      ref={(host: Stack) => {
        commands.add({ key: 'demo.save', text: '&Save', shortcut: 'Mod+S', category: 'File', scope: host, run: run('Save') });
        commands.add({ key: 'demo.print', text: '&Print', shortcut: 'Mod+P', category: 'File', scope: host, run: run('Print') });
        commands.add({ key: 'demo.find', text: '&Find', shortcut: 'Mod+F', category: 'Edit', scope: host, run: run('Find') });
        commands.add({ key: 'demo.replace', text: '&Replace', category: 'Edit', scope: host, run: run('Replace') });
      }}
    >
      <ShortcutEditor height="22rem" filter={(info) => info.customizable && !!info.name?.startsWith('demo.')} onKeysChanged={(e) => (s.keymap = e.keymap)} />
      <p tabIndex={0} class="se-page">Click here, then press the keys: they work while focus is in this example.</p>
      <output class="se-told">{() => s.told}</output>
      <pre class="se-keymap">{() => JSON.stringify(s.keymap)}</pre>
    </Stack>
  );
}
