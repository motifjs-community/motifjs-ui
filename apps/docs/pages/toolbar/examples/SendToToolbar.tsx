import { reactive } from '@motifx/core';
import { MenuBar, Stack, Toolbar, commands, type ToolbarCustomization } from '@motifx-community/ui';
import { RedoIcon, UndoIcon } from './icons';

/**
 * Right-click a command in a menu to add it to the “Quick access” toolbar, or to take it away again. The menu items and
 * the toolbar buttons name the same commands of the app; the toolbar keeps only their keys.
 */
export default function SendToToolbar() {
  const s = reactive({ told: 'Nothing yet.', saved: null as ToolbarCustomization | null });
  const run = (what: string) => () => (s.told = what);

  return (
    <Stack
      gap="md"
      ref={(host: Stack) => {
        // Limited to this example (`scope`), and taken away with it.
        commands.add({ key: 'doc.new', text: '&New', scope: host, run: run('New') });
        commands.add({ key: 'doc.open', text: '&Open…', scope: host, run: run('Open') });
        commands.add({ key: 'doc.save', text: '&Save', scope: host, run: run('Save') });
        commands.add({ key: 'doc.print', text: '&Print…', scope: host, run: run('Print') });
        commands.add({ key: 'doc.undo', text: '&Undo', icon: UndoIcon, scope: host, run: run('Undo') });
        commands.add({ key: 'doc.redo', text: '&Redo', icon: RedoIcon, scope: host, run: run('Redo') });
        commands.add({ key: 'doc.find', text: '&Find', scope: host, run: run('Find') });
      }}
    >
      <MenuBar
        label="Document"
        items={[
          { key: 'file', text: '&File', items: [{ command: 'doc.new' }, { command: 'doc.open' }, { command: 'doc.save' }, { command: 'doc.print', beginGroup: true }] },
          { key: 'edit', text: '&Edit', items: [{ command: 'doc.undo' }, { command: 'doc.redo' }, { command: 'doc.find', beginGroup: true }] },
        ]}
      />
      <Toolbar
        label="Quick access"
        items={[
          { key: 'save', command: 'doc.save' },
          { key: 'undo', command: 'doc.undo', display: 'icon' },
        ]}
        customizable
        onCustomized={(e) => (s.saved = e.customization)}
      />
      <output class="tb-send-told">{() => s.told}</output>
      <pre class="tb-send-saved">{() => JSON.stringify(s.saved ?? {}, null, 2)}</pre>
    </Stack>
  );
}
