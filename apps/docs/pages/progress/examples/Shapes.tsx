import { reactive } from '@motifx/core';
import { Button, ProgressBar, Stack, type ControlSize } from '@motifx-community/ui';

const VALUES = [5, 30, 70, 100, null];

const SIZES: ControlSize[] = ['sm', 'md', 'lg'];

/** The same values as a line and as a circle, a circle in each size, and one of each that follows some work. */
export default function Shapes() {
  const s = reactive({ done: 0, running: false });

  const run = () => {
    if (s.running) return;
    s.running = true;
    s.done = 0;
    const timer = setInterval(() => {
      s.done = Math.min(100, s.done + 4);
      if (s.done < 100) return;
      clearInterval(timer);
      s.running = false;
    }, 160);
  };

  return (
    <>
      {VALUES.map((value) => (
        <ProgressBar key={String(value)} label={value === null ? 'Not known' : 'Line'} value={value} showValue stretch />
      ))}
      <Stack orientation="horizontal" wrap align="start">
        {VALUES.map((value) => (
          <ProgressBar key={String(value)} shape="circle" label={value === null ? 'Not known' : 'Circle'} value={value} showValue />
        ))}
      </Stack>
      <Stack orientation="horizontal" wrap align="center">
        {SIZES.map((size) => (
          <ProgressBar key={size} shape="circle" size={size} label={`Size ${size}`} labelPosition="side" value={60} />
        ))}
      </Stack>
      <ProgressBar label="Importing" value={() => s.done} showValue stretch />
      <Stack orientation="horizontal" wrap align="center">
        <ProgressBar shape="circle" label="Importing" labelPosition="side" value={() => s.done} showValue />
        <Button text="Import" variant="outline" enabled={() => !s.running} onclick={run} />
      </Stack>
    </>
  );
}
