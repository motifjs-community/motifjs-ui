import { reactive } from '@motifx/core';
import { Scheduler, Switch } from '@motifx-community/ui';
import { recurringAppointments, type Booking } from './recurring-appointments';

/** Series with a rule each, one day excluded from the standup and one edited individually. Click one, and its tooltip describes how it repeats. */
export default function Recurring() {
  const s = reactive({ marks: true });
  return (
    <div class="sched-demo">
      <div class="docs-flow">
        <Switch label="Marks" x-model={() => s.marks} />
      </div>
      <Scheduler<Booking> appointments={recurringAppointments()} startDayHour={8} endDayHour={18} recurrenceMarks={() => s.marks} editing={false} />
    </div>
  );
}
