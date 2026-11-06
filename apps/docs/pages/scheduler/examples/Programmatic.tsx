import { reactive } from '@motifx/core';
import { Button, Scheduler, Stack } from '@motifx-community/ui';
import { sampleAppointments, type Meeting } from './sample-appointments';

/** A scheduler created with `new`, added programmatically and controlled through its methods. */
export default function Programmatic() {
  const state = reactive({ said: '' });
  let host: Stack | null = null;
  let scheduler: Scheduler<Meeting> | null = null;

  const make = () => {
    if (scheduler) return;
    scheduler = new Scheduler<Meeting>({
      appointments: sampleAppointments(),
      currentView: 'workWeek',
      locale: 'tr-TR',
      firstDayOfWeek: 1,
    });
    scheduler.onDateChanged(
      (e) => (state.said = `Shows ${e.range.start.toLocaleDateString('tr-TR')} – ${new Date(e.range.end.getTime() - 1).toLocaleDateString('tr-TR')}`),
    );
    scheduler.onSelectionChanged(
      (e) =>
        (state.said = e.selection
          ? `Selected ${e.selection.start.toLocaleString('tr-TR')} – ${e.selection.end.toLocaleTimeString('tr-TR')}`
          : 'Nothing selected'),
    );
    host?.controls.add(scheduler);
  };
  // The work week shows Monday to Friday: the next of those days.
  const nextWorkday = () => {
    const t = new Date();
    let start = new Date(t.getFullYear(), t.getMonth(), t.getDate() + 1, 9);
    while (start.getDay() === 0 || start.getDay() === 6) start = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1, 9);
    scheduler?.showDate(start);
    scheduler?.selectCells({
      start,
      end: new Date(start.getTime() + 90 * 60_000),
      allDay: false,
    });
    scheduler?.scrollToTime(8);
  };
  return (
    <div class="sched-demo">
      <div class="docs-flow">
        <Button text="Create" variant="outline" onclick={make} />
        <Button text="Previous" variant="outline" onclick={() => scheduler?.previous()} />
        <Button text="Next" variant="outline" onclick={() => scheduler?.next()} />
        <Button text="Select the next workday 9:00–10:30" variant="outline" onclick={nextWorkday} />
        <Button text="Month" variant="outline" onclick={() => scheduler?.showView('month')} />
      </div>
      <p class="sched-log" role="status">
        {() => state.said}
      </p>
      <Stack ref={(c: Stack) => (host = c)} />
    </div>
  );
}
