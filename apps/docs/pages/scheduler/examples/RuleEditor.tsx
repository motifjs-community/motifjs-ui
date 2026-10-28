import { reactive } from '@motifx/core';
import { RecurrenceEditor } from '@motifx-community/ui';

/** The editor on its own: it reads and writes the rule text, and says it in words under it. */
export default function RuleEditor() {
  const s = reactive({ rule: 'FREQ=MONTHLY;BYDAY=2TU;COUNT=6' });
  return (
    <div class="sched-demo sched-rule">
      <RecurrenceEditor x-model={() => s.rule} start={new Date()} />
      <p class="sched-log">
        <code>{() => s.rule || '(none)'}</code>
      </p>
    </div>
  );
}
