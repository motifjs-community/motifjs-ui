import { reactive } from '@motifx/core';
import { Button, Stack, Toaster } from '@motifx-community/ui';

/** A toaster placed in the page, showing at most `max` toasts at once. */
export default function OwnToaster() {
  const s = reactive({ max: 2, count: 0 });
  let uploads: Toaster | null = null;

  const addFive = () => {
    for (let i = 0; i < 5; i++) uploads?.success(`photo-${++s.count}.jpg is uploaded.`, { duration: 3000 });
  };

  return (
    <>
      <Toaster ref={(t: Toaster) => (uploads = t)} position="top-start" max={() => s.max} text="Demo notifications" />
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Max">
        {[1, 2, 3].map((max) => (
          <Button
            key={max}
            text={`max ${max}`}
            size="sm"
            variant={() => (s.max === max ? 'solid' : 'ghost')}
            aria-pressed={() => s.max === max}
            onclick={() => (s.max = max)}
          />
        ))}
      </Stack>
      <Button text="Add five" variant="outline" onclick={addFive} />
    </>
  );
}
