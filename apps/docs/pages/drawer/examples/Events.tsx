import { reactive } from '@motifx/core';
import { Button, Drawer, Stack, Switch } from '@motifx-community/ui';

/** The events of a drawer in order; "Keep it open" refuses every closing but by code. */
export default function Events() {
  const s = reactive({ open: false, keep: false, log: [] as string[] });

  const log = (line: string) => {
    s.log.push(line);
    if (s.log.length > 6) s.log.shift();
  };

  return (
    <>
      <Stack orientation="horizontal" wrap align="center" gap="lg">
        <Button text="Open" variant="outline" onclick={() => (s.open = true)} />
        <Switch label="Keep it open" x-model={() => s.keep} />
      </Stack>
      <output>{() => s.log.join(' · ') || 'No events yet.'}</output>
      <Drawer
        side="end"
        title="Events"
        showClose
        x-model={() => s.open}
        onOpening={() => log('opening')}
        onOpened={() => log('opened')}
        onClosing={(e) => {
          log(`closing (${e.reason})`);
          if (s.keep && e.reason !== 'code') e.cancel = true;
        }}
        onClosed={(e) => log(`closed (${e.reason})`)}
      >
        <Button text="Close by code" variant="outline" onclick={() => (s.open = false)} />
      </Drawer>
    </>
  );
}
