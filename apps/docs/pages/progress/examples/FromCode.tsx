import { reactive } from '@motifx/core';
import { Button, ProgressBar, Stack } from '@motifx-community/ui';

/** A bar that follows an upload, and bars created with `new` and added from code. */
export default function FromCode() {
  const s = reactive({ upload: 0, uploading: false });
  let added = 0;
  let host: Stack | null = null;

  const upload = () => {
    if (s.uploading) return;
    s.uploading = true;
    s.upload = 0;
    const timer = setInterval(() => {
      s.upload = Math.min(100, s.upload + 7);
      if (s.upload < 100) return;
      clearInterval(timer);
      s.uploading = false;
    }, 120);
  };

  const addFromCode = () => {
    const bar = new ProgressBar({ label: `Task ${++added}`, showValue: true, tone: 'success' });
    bar.value = 25 * added;
    host?.controls.add(bar);
  };

  return (
    <>
      <ProgressBar label="Uploading" value={() => s.upload} showValue stretch />
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Upload" tone="accent" enabled={() => !s.uploading} onclick={upload} />
        <Button text="Add a bar from code" variant="outline" onclick={addFromCode} />
      </Stack>
      <Stack orientation="horizontal" wrap align="center" ref={(c: Stack) => (host = c)} />
    </>
  );
}
