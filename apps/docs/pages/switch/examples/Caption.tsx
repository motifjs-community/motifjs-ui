import { reactive } from '@motifx/core';
import { Switch } from '@motifx-community/ui';

/** Captions before the track, stretched so the tracks line up at the far end, as in a settings list. */
export default function Caption() {
  const s = reactive({ updates: true });
  return (
    <div style="inline-size: 22rem">
      <Switch label="Automatic updates" labelPosition="start" stretch x-model={() => s.updates} />
      <Switch label="Send usage data" labelPosition="start" stretch helpText="Anonymous, once a week." />
    </div>
  );
}
