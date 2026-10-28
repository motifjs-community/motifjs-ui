import { reactive } from '@motifx/core';
import { Button, Scheduler, Stack, TextArea } from '@motifx-community/ui';
import { recurringAppointments, type Booking } from './recurring-appointments';

/**
 * The appointments as an iCalendar file (RFC 5545): the days shown or all of them. A series goes
 * whole with its rule, the times left out of it and the one moved apart (`RECURRENCE-ID`); every zone
 * used comes with its `VTIMEZONE`. Open the file in any calendar application.
 */
export default function ExportCalendar() {
  const s = reactive({ text: '', url: '' });
  const scheduler = (<Scheduler<Booking> appointments={recurringAppointments()} startDayHour={8} endDayHour={18} label="Team calendar" />) as Scheduler<Booking>;
  const write = (range: 'visible' | 'all') => {
    s.text = scheduler.exportICalendar({ range }) ?? '';
    if (s.url) URL.revokeObjectURL(s.url);
    s.url = URL.createObjectURL(new Blob([s.text], { type: 'text/calendar' }));
  };
  return (
    <div class="sched-demo">
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Export the days shown" variant="outline" onclick={() => write('visible')} />
        <Button text="Export all" variant="outline" onclick={() => write('all')} />
        <a href={() => s.url || null} download="team-calendar.ics" x-display={() => !!s.url}>
          Download team-calendar.ics
        </a>
      </Stack>
      {scheduler}
      <TextArea label="The file" rows={10} readOnly spellcheck={false} wrap="off" x-model={() => s.text} />
    </div>
  );
}
