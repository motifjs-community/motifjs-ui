import type { Component } from '@motifx/core';
import { reactive } from '@motifx/core';
import { Button, MenuBar, MxForm, Stack, TextBox, type MenuItem, type MenuItemClickEventArgs } from '@motifx-community/ui';

/** A window with its own bar that merges while focus is in the window (`mergeWhen: 'focus'`). */
export default function MergedWindow() {
  const s = reactive({ told: 'Nothing yet.' });
  const tell = (e: MenuItemClickEventArgs) => (s.told = `${String(e.item.text).replace('&', '')} in ${(e.source as MenuBar).label}`);
  let host: Component<HTMLDivElement> | null = null;
  let form: MxForm | null = null;

  const app: MenuItem[] = [
    { key: 'file', text: '&File', items: [{ key: 'new', text: '&New' }, { key: 'exit', text: 'E&xit', beginGroup: true }] },
    { key: 'help', text: '&Help', items: [{ key: 'about', text: '&About' }] },
  ];
  const notes: MenuItem[] = [
    { key: 'file', text: '&File', items: [{ key: 'save', text: '&Save note', mergeAt: { after: 'new' } }] },
    { key: 'insert', text: '&Insert', mergeAt: { before: 'help' }, items: [{ key: 'date', text: '&Date' }, { key: 'list', text: '&List' }] },
  ];

  const open = () => {
    if (form && !form.isDisposed) {
      form.focus();
      return;
    }
    form = new MxForm({
      title: 'Note',
      startPosition: 'manual',
      left: 120,
      top: 160,
      width: '22rem',
      content: (
        <div class="mb-window-note">
          <MenuBar label="Note" items={notes} mergeInto="docs-window" mergeWhen="focus" onItemClick={tell} />
          <TextBox label="Title" />
        </div>
      ),
    });
    form.show(host!);
  };

  return (
    <Stack gap="md" ref={(c: Stack) => (host = c)}>
      <MenuBar label="Desk" items={app} mergeHost mergeName="docs-window" onItemClick={tell} />
      <Button text="Open the note window" variant="outline" onclick={open} />
      <p tabIndex={0} class="mb-window-page">Focus in the window shows its menus in the bar above; click here and they go back.</p>
      <output class="mb-window-told">{() => s.told}</output>
    </Stack>
  );
}
