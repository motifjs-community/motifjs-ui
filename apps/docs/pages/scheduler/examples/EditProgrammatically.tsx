import { reactive } from '@motifx/core';
import { Button, Scheduler } from '@motifx-community/ui';
import { sampleAppointments, type Meeting } from './sample-appointments';

/** The same changes programmatically: add, move, delete, open the form for a new one. */
export default function EditProgrammatically() {
  const state = reactive({ appointments: sampleAppointments(), said: '' });
  let scheduler: Scheduler<Meeting> | null = null;
  const tomorrow = (hour: number) => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), t.getDate() + 1, hour);
  };
  const planning = () => state.appointments.find((m) => m.text === 'Planning');
  const add = async () => {
    const added = await scheduler?.addAppointment({ id: Date.now(), text: 'Planning', startDate: tomorrow(11), endDate: tomorrow(12), color: '#6a1b9a' });
    state.said = added ? `Added ${added.text}` : 'Not added';
  };
  const later = async () => {
    const item = planning();
    if (!item) {
      state.said = 'Add it first';
      return;
    }
    const hour = 3_600_000;
    const ok = await scheduler?.updateAppointment(item, {
      startDate: new Date(item.startDate.getTime() + hour),
      endDate: new Date(item.endDate.getTime() + hour),
    });
    state.said = ok ? 'Moved an hour later' : 'Not moved';
  };
  const remove = async () => {
    const item = planning();
    state.said = item && (await scheduler?.deleteAppointment(item)) ? 'Deleted' : 'Nothing to delete';
  };
  return (
    <div class="sched-demo">
      <div class="docs-flow">
        <Button text="Add tomorrow 11:00" variant="outline" onclick={add} />
        <Button text="An hour later" variant="outline" onclick={later} />
        <Button text="Delete it" variant="outline" onclick={remove} />
        <Button
          text="New in the form"
          variant="outline"
          onclick={() => void scheduler?.showAppointmentForm(null, { start: tomorrow(15), end: tomorrow(16), allDay: false })}
        />
      </div>
      <p class="sched-log" role="status">
        {() => state.said}
      </p>
      <Scheduler<Meeting> appointments={state.appointments} startDayHour={8} endDayHour={19} ref={(c: Scheduler<Meeting>) => (scheduler = c)} />
    </div>
  );
}
