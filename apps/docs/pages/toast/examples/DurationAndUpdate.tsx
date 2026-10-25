import { reactive } from '@motifx/core';
import { Button, toast } from '@motifx-community/ui';

/** A toast with a live text that stays until the upload ends, then turns into a success; one that stays. */
export default function DurationAndUpdate() {
  const s = reactive({ progress: 0, uploading: false });

  const upload = () => {
    if (s.uploading) return;
    s.uploading = true;
    s.progress = 0;
    const t = toast.show({ title: 'report.pdf', text: () => `Uploading… ${s.progress}%`, duration: 0, closeButton: false });
    const timer = setInterval(() => {
      s.progress = Math.min(100, s.progress + 10);
      if (s.progress < 100) return;
      clearInterval(timer);
      s.uploading = false;
      t.update({ text: 'Uploaded.', tone: 'success', duration: 4000, closeButton: true });
    }, 300);
    void t.closed.then(() => clearInterval(timer));
  };

  return (
    <>
      <Button text="Upload a file" variant="outline" enabled={() => !s.uploading} onclick={upload} />
      <Button text="A toast that stays" variant="outline" onclick={() => toast.caution('This one stays until you close it.', { duration: 0 })} />
      <Button text="Close all" variant="ghost" onclick={() => toast.closeAll()} />
    </>
  );
}
