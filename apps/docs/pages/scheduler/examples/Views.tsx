import { reactive } from '@motifx/core';
import { Scheduler, Switch } from '@motifx-community/ui';
import { sampleAppointments, type Meeting } from './sample-appointments';

/** Views of its own (three days, two weeks) next to the built-in ones, and settings bound to switches. */
export default function Views() {
  const s = reactive({
    allDay: true,
    dim: true,
    cascade: false,
    quarter: false,
    holidays: true,
  });
  // Every Friday is a holiday here, to show the appearance.
  const friday = (date: Date) => date.getDay() === 5;
  return (
    <div class="sched-demo">
      <div class="docs-flow">
        <Switch label="All-day panel" x-model={() => s.allDay} />
        <Switch label="Ended ones quieter" x-model={() => s.dim} />
        <Switch label="Cascade" x-model={() => s.cascade} />
        <Switch label="15-minute cells" x-model={() => s.quarter} />
        <Switch label="Fridays off" x-model={() => s.holidays} />
      </div>
      <Scheduler<Meeting>
        appointments={sampleAppointments()}
        views={[
          'day',
          { type: 'day', name: 'threeDays', text: '3 days', intervalCount: 3 },
          'workWeek',
          { type: 'week', name: 'twoWeeks', text: '2 weeks', intervalCount: 2 },
          'month',
        ]}
        currentView="threeDays"
        startDayHour={8}
        endDayHour={20}
        allDayPanel={() => s.allDay}
        dimPast={() => s.dim}
        overlapMode={() => (s.cascade ? 'cascade' : 'columns')}
        cellDuration={() => (s.quarter ? 15 : 30)}
        isHoliday={() => (s.holidays ? friday : null)}
      />
    </div>
  );
}
