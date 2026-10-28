import { reactive } from '@motifx/core';
import { NumberBox, Scheduler } from '@motifx-community/ui';
import { sampleAppointments, type Meeting } from './sample-appointments';

/**
 * The coming days as a list: each day with its appointments in time order, a day with none left
 * out. Up and Down move over the rows, Space shows the tooltip, Enter opens the form, Delete
 * deletes. Previous and next move by the days shown.
 */
export default function Agenda() {
  const s = reactive({ days: 7 });
  return (
    <div class="sched-demo">
      <NumberBox label="Days" labelMode="side" min={1} max={31} x-model={() => s.days} />
      <Scheduler<Meeting> appointments={sampleAppointments()} views={['agenda', 'week', 'month']} currentView="agenda" agendaDuration={() => s.days} />
    </div>
  );
}
