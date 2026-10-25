import { reactive } from '@motifx/core';
import { Button, Spinner, Stack } from '@motifx-community/ui';

/** A spinner with a delay: quick work shows nothing, slow work shows it. */
export default function Delay() {
  const s = reactive({ busy: false, result: '' });

  const work = (ms: number) => {
    s.busy = true;
    s.result = '';
    setTimeout(() => {
      s.busy = false;
      s.result = `Done after ${ms} ms.`;
    }, ms);
  };

  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Quick work (200 ms)" variant="outline" onclick={() => work(200)} />
        <Button text="Slow work (2 s)" variant="outline" onclick={() => work(2000)} />
        <Spinner label="Working" delay={400} visible={() => s.busy} />
      </Stack>
      <output class="pr-result">{() => s.result}</output>
    </>
  );
}
