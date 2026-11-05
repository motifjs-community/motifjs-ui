import { reactive } from '@motifx/core';
import { Button, DockPanel, Panel, Stack, TextBox, type Dock } from '@motifx-community/ui';

const FOLDERS = ['Inbox', 'Drafts', 'Sent', 'Archive', 'Spam', 'Trash'];
const FRAME = 'border: var(--mx-border-width-1) solid var(--mx-color-stroke-card); border-radius: var(--mx-radius-lg);';
const BAR = 'background: var(--mx-color-bg-bar);';
const LAYER = 'background: var(--mx-color-bg-layer);';

/** A mail app laid out with DockPanel: a header, a sidebar that changes sides, a status bar, a float button and a panel added programmatically. */
export default function AppShell() {
  const s = reactive({ side: 'start' as Dock, messages: 3 });
  let shell: DockPanel | null = null;
  let notes: Panel | null = null;

  const toggleNotes = () => {
    if (notes) {
      shell?.controls.remove(notes);
      notes = null;
      return;
    }
    notes = new Panel({ dock: 'end', padding: 'sm' });
    notes.element.setAttribute('style', `inline-size: 9rem; ${LAYER}`);
    notes.element.classList.add('layout-notes');
    notes.controls.add(<span>Notes, added programmatically.</span>);
    shell?.controls.add(notes);
  };

  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <Button text={() => `Sidebar: ${s.side}`} size="sm" variant="outline" onclick={() => (s.side = s.side === 'start' ? 'end' : 'start')} />
        <Button text="Notes panel programmatically" size="sm" variant="outline" onclick={toggleNotes} />
      </Stack>
      <DockPanel class="layout-shell" ref={(c: DockPanel) => (shell = c)} style={`block-size: 22rem; inline-size: 100%; overflow: hidden; ${FRAME}`}>
        <Stack dock="top" orientation="horizontal" align="center" gap="sm" padding="xs sm" style={BAR}>
          <strong>Mail</strong>
          <TextBox label="Search mail" labelMode="hidden" placeholder="Search" grow />
          <Button text="New" tone="accent" onclick={() => s.messages++} />
        </Stack>
        <Panel class="layout-side" dock={() => s.side} scrollable="vertical" padding="xs" text="Mailboxes" style={`inline-size: 11rem; ${LAYER}`}>
          <Stack gap="xxs">
            {FOLDERS.map((f) => (
              <Button key={f} text={f} variant="ghost" stretch />
            ))}
          </Stack>
        </Panel>
        <Stack class="layout-status" dock="bottom" orientation="horizontal" justify="space-between" padding="xxs sm" style={BAR}>
          <span>Ready</span>
          <span>{() => `${s.messages} messages`}</span>
        </Stack>
        <Panel class="layout-content" text="Message" scrollable padding="md">
          <h3 style="margin-block-start: 0">Welcome</h3>
          <p>The header, the folders and the status bar are docked; this panel fills the rest and scrolls on its own.</p>
          <p>Switch the sidebar to the other side, or add a panel programmatically: the layout follows at once.</p>
        </Panel>
        <Button class="layout-help" dock="float" right={16} bottom={48} text="Help" variant="outline" />
      </DockPanel>
    </>
  );
}
