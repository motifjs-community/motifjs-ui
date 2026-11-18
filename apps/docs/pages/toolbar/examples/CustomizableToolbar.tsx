import { reactive } from '@motifx/core';
import { Button, Stack, Toolbar, type ToolbarCustomization, type ToolbarItem } from '@motifx-community/ui';
import { BoldIcon, ImageIcon, ItalicIcon, LinkIcon, RedoIcon, UnderlineIcon, UndoIcon } from './icons';

/** Right-click an item, or press Shift+F10 on it, to hide, move or rename it; what the user changed is one object to save. */
export default function CustomizableToolbar() {
  const s = reactive({ saved: null as ToolbarCustomization | null, told: 'Nothing yet.' });
  const run = (what: string) => () => (s.told = what);
  let bar!: Toolbar;

  const items: ToolbarItem[] = [
    { key: 'undo', text: '&Undo', icon: UndoIcon, display: 'icon', click: run('Undo') },
    { key: 'redo', text: '&Redo', icon: RedoIcon, display: 'icon', click: run('Redo') },
    { key: 'edit-line', type: 'separator' },
    { key: 'bold', type: 'toggle', text: '&Bold', icon: BoldIcon, display: 'icon' },
    { key: 'italic', type: 'toggle', text: '&Italic', icon: ItalicIcon, display: 'icon' },
    { key: 'underline', type: 'toggle', text: 'U&nderline', icon: UnderlineIcon, display: 'icon' },
    { key: 'insert-line', type: 'separator' },
    { key: 'link', text: 'Insert &link', icon: LinkIcon, click: run('Insert link') },
    { key: 'image', text: 'Insert i&mage', icon: ImageIcon, click: run('Insert image') },
    { key: 'publish', text: '&Publish', tone: 'accent', customizable: false, click: run('Publish') },
  ];
  // Commands the user can add from the customizer.
  const offered: ToolbarItem[] = [
    { key: 'print', text: '&Print', click: run('Print') },
    { key: 'share', text: 'S&hare', click: run('Share') },
    { key: 'spelling', text: 'Check &spelling', click: run('Check spelling') },
  ];

  return (
    <Stack gap="md">
      <Toolbar
        ref={(b: Toolbar) => (bar = b)}
        label="Format"
        items={items}
        commands={offered}
        customizable
        onCustomized={(e) => (s.saved = e.customization)}
        style="inline-size: 100%"
      />
      <output class="tb-custom-told">{() => s.told}</output>
      <pre class="tb-custom-saved">{() => JSON.stringify(s.saved ?? {}, null, 2)}</pre>
      <Stack orientation="horizontal" gap="sm" wrap>
        <Button text="Customize…" variant="outline" onclick={() => bar.openCustomizer()} />
        <Button text="Forget the changes" variant="outline" onclick={() => (bar.customization = null)} />
        <Button text="Restore the saved changes" variant="outline" onclick={() => (bar.customization = s.saved)} />
      </Stack>
    </Stack>
  );
}
