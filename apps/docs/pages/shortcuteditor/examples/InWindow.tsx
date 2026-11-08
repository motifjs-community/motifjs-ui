import { Button, MxForm, ShortcutEditor } from '@motifx-community/ui';

/** The editor in a window of its own, as a settings dialog opens it. It lists every shortcut of this site. */
export default function InWindow() {
  const open = (button: Button) => {
    const form = new MxForm({ title: 'Keyboard shortcuts', width: '40rem', height: '30rem', resizable: true, modal: true });
    form.content = new ShortcutEditor();
    form.footer = <Button text="Close" tone="accent" onclick={() => form.close('ok')} />;
    void form.showDialog(button);
  };
  let button!: Button;
  return <Button text="Keyboard shortcuts…" variant="outline" ref={(b: Button) => (button = b)} onclick={() => open(button)} />;
}
