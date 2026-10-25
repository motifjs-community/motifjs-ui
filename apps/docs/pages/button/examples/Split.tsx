import { reactive } from '@motifx/core';
import { Button } from '@motifx-community/ui';

/** A split button: its own action, and an arrow that opens the menu. `split` can be switched off. */
export default function Split() {
  const s = reactive({ last: '', split: true });
  return (
    <>
      <Button
        text="Sa&ve"
        tone="accent"
        split={() => s.split}
        onclick={() => (s.last = 'Save')}
        menu={[
          { text: 'Save &as…', click: () => (s.last = 'Save as…') },
          { text: 'Save a&ll', click: () => (s.last = 'Save all') },
        ]}
      />
      <Button text="split" size="sm" variant="ghost" toggle x-model={() => s.split} />
      <span>
        Last: <output class="split-log">{() => s.last || '—'}</output>
      </span>
    </>
  );
}
