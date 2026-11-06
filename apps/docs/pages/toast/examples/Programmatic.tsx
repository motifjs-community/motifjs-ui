import { reactive } from '@motifx/core';
import { Button, toast, type Toast } from '@motifx-community/ui';

/** Toasts shown programmatically. The returned Toast can be closed and awaited. */
export default function Programmatic() {
  const s = reactive({ reason: '' });

  const exportFile = () => {
    const t = toast.show({ title: 'Export', text: 'Preparing the file…', duration: 0 });
    setTimeout(() => t.close(), 2000);
  };

  const watch = async () => {
    s.reason = 'waiting…';
    const t: Toast = toast.show({ text: 'Close me any way you like.', duration: 3000, action: { text: 'Done' } });
    s.reason = `closed by: ${await t.closed}`;
  };

  return (
    <>
      <Button text="Show a toast" tone="accent" onclick={() => toast.success('Your changes are saved.', { title: 'Saved' })} />
      <Button text="Export" variant="outline" onclick={exportFile} />
      <Button text="Watch how it closes" variant="outline" onclick={watch} />
      <output class="toast-reason">{() => s.reason}</output>
    </>
  );
}
