import { reactive } from '@motifx/core';
import { Button, ProgressBar } from '@motifx-community/ui';

/** A bar without a value, and one that runs until the work knows how much there is to do. */
export default function NotKnown() {
  const copy = reactive({ done: 0, total: 12, running: false });

  const start = () => {
    copy.running = true;
    copy.done = 0;
    copy.total = 0;
    // The files are counted first; until then there is no total.
    setTimeout(() => {
      copy.total = 12;
      const timer = setInterval(() => {
        copy.done++;
        if (copy.done < copy.total) return;
        clearInterval(timer);
        copy.running = false;
      }, 150);
    }, 1000);
  };

  return (
    <>
      <ProgressBar label="Preparing" value={null} />
      <ProgressBar label="Copying" value={() => (copy.total ? copy.done : null)} max={() => copy.total} />
      <Button text="Copy" variant="outline" enabled={() => !copy.running} onclick={start} />
    </>
  );
}
