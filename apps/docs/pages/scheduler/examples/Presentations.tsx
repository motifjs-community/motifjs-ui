import { reactive } from '@motifx/core';
import { RadioGroup, Scheduler, Stack, type SchedulerPresentation } from '@motifx-community/ui';
import { sampleAppointments, type Meeting } from './sample-appointments';

/**
 * One scheduler shown three ways. As on a phone it shows the agenda (a day where it has none), the
 * bar holds the month, Today and a menu of the views, the tooltip and the form come up from the
 * bottom. Going back, it shows the view it had. The appointments and the date stay the same.
 */
export default function Presentations() {
  const s = reactive({ presentation: 'phone' as SchedulerPresentation, said: '' });
  const scheduler = (
    <Scheduler<Meeting>
      appointments={sampleAppointments()}
      views={['day', 'week', 'month', 'agenda']}
      presentation={() => s.presentation}
      startDayHour={7}
      onPresentationChanged={(e) => (s.said = `${e.from} → ${e.to}${e.width ? ` (${e.width} px wide)` : ''}`)}
    />
  ) as Scheduler<Meeting>;
  return (
    <div class="sched-demo">
      <Stack orientation="horizontal" wrap align="center" gap="lg">
        <RadioGroup
          label="Presentation"
          orientation="horizontal"
          items={[
            { value: 'auto', text: 'By its width' },
            { value: 'desktop', text: 'Desktop' },
            { value: 'tablet', text: 'Tablet' },
            { value: 'phone', text: 'Phone' },
          ]}
          itemText="text"
          itemValue="value"
          x-model={() => s.presentation}
        />
        <output class="sched-log">{() => (s.said ? `Shown: ${s.said}` : `Shown as: ${scheduler.currentPresentation}`)}</output>
      </Stack>
      {scheduler}
    </div>
  );
}
