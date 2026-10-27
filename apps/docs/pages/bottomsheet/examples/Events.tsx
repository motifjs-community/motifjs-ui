import { reactive, type Component } from '@motifx/core';
import { BottomSheet, Button, Stack, Switch } from '@motifx-community/ui';

/** The events in order. While "Keep it open" is on, onClosing refuses every closing but by code; "Not full" refuses the tallest height. */
export default function Events() {
  const s = reactive({ open: false, keep: false, notFull: false, log: [] as string[] });
  let frame!: Component<HTMLDivElement>;

  const log = (line: string) => {
    s.log.push(line);
    if (s.log.length > 6) s.log.shift();
  };

  return (
    <>
      <Stack orientation="horizontal" wrap align="center" gap="lg">
        <Button text="Open" variant="outline" enabled={() => !s.open} onclick={() => (s.open = true)} />
        <Switch label="Keep it open" x-model={() => s.keep} />
        <Switch label="Not full" x-model={() => s.notFull} />
      </Stack>
      <output>{() => s.log.join(' · ') || 'No events yet.'}</output>
      <div ref={(c: Component<HTMLDivElement>) => (frame = c)} style="position: relative; block-size: 28rem; overflow: hidden; border: var(--mx-border-width-1) solid var(--mx-color-stroke-card); border-radius: var(--mx-radius-lg); background: var(--mx-color-bg-layer)" />
      <BottomSheet
        title="Events"
        showClose
        container={() => frame}
        detents={['half', 'full']}
        x-model={() => s.open}
        onOpening={() => log('opening')}
        onOpened={() => log('opened')}
        onDetentChanging={(e) => {
          log(`detentChanging ${e.from} → ${e.to}`);
          if (s.notFull && e.to === 'full') e.cancel = true;
        }}
        onDetentChanged={(e) => log(`detentChanged ${e.to}`)}
        onClosing={(e) => {
          log(`closing (${e.reason})`);
          if (s.keep && e.reason !== 'code') e.cancel = true;
        }}
        onClosed={(e) => log(`closed (${e.reason})`)}
      >
        <p>Drag it, press Escape, the scrim, its close button or the browser's back.</p>
        <Button text="Close by code" variant="outline" onclick={() => (s.open = false)} />
      </BottomSheet>
    </>
  );
}
