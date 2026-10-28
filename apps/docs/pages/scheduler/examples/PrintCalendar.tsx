import { reactive } from '@motifx/core';
import { Button, Scheduler, Stack } from '@motifx-community/ui';
import { sampleAppointments, type Meeting } from './sample-appointments';

/**
 * `print()` prints the scheduler alone: the days shown, every hour and every row, nothing scrolled,
 * the colours kept and the bar left out. The browser's own print prints it the same way, with the
 * rest of the page.
 */
export default function PrintCalendar() {
  const s = reactive({ said: '' });
  const scheduler = (
    <Scheduler<Meeting>
      appointments={sampleAppointments()}
      views={['day', 'week', 'month', 'timelineWeek', 'agenda']}
      startDayHour={8}
      endDayHour={18}
      onPrinting={() => (s.said = 'Printing…')}
      onPrinted={() => (s.said = 'The print dialog closed.')}
    />
  ) as Scheduler<Meeting>;
  return (
    <div class="sched-demo">
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Print" tone="accent" onclick={() => void scheduler.print()} />
        <output class="sched-log">{() => s.said}</output>
      </Stack>
      {scheduler}
    </div>
  );
}
