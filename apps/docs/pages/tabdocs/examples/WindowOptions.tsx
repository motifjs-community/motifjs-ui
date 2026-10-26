import { reactive } from '@motifx/core';
import { confirm, Stack, Switch, TabDocument, TabDocumentManager } from '@motifx-community/ui';
import { customerForm, notes } from './contents';

/** Closing a new window brings its documents back or closes them; a browser that blocks the window gets a floating one. Every event is logged. */
export default function WindowOptions() {
  const s = reactive({ back: true, blocked: false, fallback: true, log: [] as { id: number; text: string }[] });
  let next = 0;
  const note = (text: string) => {
    s.log.unshift({ id: ++next, text });
    if (s.log.length > 6) s.log.pop();
  };
  const draft = reactive({ name: 'Draft customer', email: '', city: '' });
  const docs = new TabDocumentManager({
    label: 'New window settings',
    newWindowCloseAction: () => (s.back ? 'back' : 'close'),
    newWindowFallback: () => (s.fallback ? 'float' : 'none'),
    // A browser that blocks windows hands back none: here a switch plays that browser.
    openWindow: (r) => (s.blocked ? null : window.open(r.url, r.name, r.features)),
    onWindowOpening: (e) => note(`windowOpening: ${e.document?.title ?? 'a group'}`),
    onWindowOpened: (e) => note(`windowOpened: window ${e.window.index + 1}`),
    onWindowClosing: (e) => note(`windowClosing (${e.kind}): then ${e.then}`),
    onWindowClosed: (e) => note(`windowClosed (${e.kind}): ${e.reason}`),
    onError: (e) => note(`error: ${e.error}, fallback ${e.fallback}`),
  });
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';
  docs.open(new TabDocument({ id: 'draft', title: 'Draft', dirty: () => draft.email === '', content: () => customerForm(draft) }));
  docs.open(new TabDocument({ id: 'notes', title: 'Notes', content: () => notes('Notes') }));
  // A document with unsaved changes asks before it closes, in the main window.
  docs.onClosing((e) => {
    if (e.document.dirty) e.promise = confirm(`${e.document.title} has unsaved changes. Close it anyway?`, { title: 'Close', tone: 'caution' });
  });

  return (
    <>
      <Stack orientation="horizontal" wrap align="center" gap="lg">
        <Switch label="Documents come back when the window closes" x-model={() => s.back} />
        <Switch label="The browser blocks new windows" x-model={() => s.blocked} />
        <Switch label="Float when blocked" x-model={() => s.fallback} />
      </Stack>
      {docs}
      <ol class="td-log" aria-label="Events">
        {s.log.map((entry) => (
          <li key={entry.id}>{entry.text}</li>
        ))}
      </ol>
    </>
  );
}
