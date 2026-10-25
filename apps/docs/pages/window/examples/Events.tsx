import { reactive } from '@motifx/core';
import { Button, MxForm, Stack } from '@motifx-community/ui';

/** The events of a form in order; onClosing keeps it open while it has changes. */
export default function Events() {
  const s = reactive({ open: false, dirty: false, log: [] as string[] });

  const log = (line: string) => {
    s.log.push(line);
    if (s.log.length > 6) s.log.shift();
  };

  return (
    <>
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Open" variant="outline" onclick={() => (s.open = true)} />
        <output class="win-log">{() => s.log.join(' · ')}</output>
      </Stack>
      <MxForm
        class="win-events"
        title="Events"
        x-model={() => s.open}
        onLoaded={() => log('loaded')}
        onShown={() => log('shown')}
        onActivate={() => log('activate')}
        onDeactivate={() => log('deactivate')}
        onClosing={(e) => {
          log(`closing (${e.reason})`);
          if (s.dirty && e.reason === 'user') e.cancel = true;
        }}
        onClosed={(e) => log(`closed: ${e.result}`)}
      >
        <Button text={() => (s.dirty ? 'Has changes: close is kept' : 'No changes')} toggle x-model={() => s.dirty} />
      </MxForm>
    </>
  );
}
