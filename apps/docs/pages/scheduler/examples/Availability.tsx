import { reactive } from '@motifx/core';
import { RadioGroup, Scheduler, type SchedulerBlockedTime, type SchedulerTimeCheck } from '@motifx-community/ui';
import { bookings, rooms, type Booking } from './resource-data';

/**
 * When a booking may go: Bosphorus is open 10 to 18 (its own work hours), lunch is blocked every
 * weekday, Cappadocia is closed tomorrow. Outside the hours nothing goes (`allowOffHours`); the
 * choice says whether bookings in a room may overlap, or a rule of its own lets two at once.
 */
export default function Availability() {
  const s = reactive({ overlap: 'no', said: '' });
  const today = new Date();
  const day = (offset: number, hour = 0) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset, hour);
  const blocked: SchedulerBlockedTime[] = [
    { start: day(0, 12), end: day(0, 13), text: 'Lunch', recurrenceRule: 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR' },
    { start: day(1), end: day(1), allDay: true, text: 'Closed for cleaning', resources: { roomId: 3 } },
  ];
  /** Two at once fit in a room, but never over a blocked time or out of its hours. */
  const twoAtOnce = (check: SchedulerTimeCheck<Booking>) => !check.blocked.length && !check.offHours && check.overlapping.length < 2;
  return (
    <div class="sched-demo">
      <RadioGroup
        label="Bookings in a room"
        orientation="horizontal"
        items={[
          { value: 'no', text: 'May not overlap' },
          { value: 'two', text: 'Two at once (a rule)' },
          { value: 'yes', text: 'May overlap' },
        ]}
        itemText="text"
        itemValue="value"
        x-model={() => s.overlap}
      />
      <Scheduler<Booking>
        appointments={bookings()}
        resources={[{ field: 'roomId', label: 'Room', items: rooms }]}
        groups={['roomId']}
        currentView="day"
        views={[{ type: 'day', intervalCount: 2 }]}
        startDayHour={8}
        endDayHour={19}
        blockedTimes={blocked}
        allowOffHours={false}
        allowOverlap={() => (s.overlap === 'two' ? twoAtOnce : s.overlap === 'yes')}
        onMoving={(e) => (s.said = e.cancel ? 'Not free there.' : '')}
        onMoveEnd={() => (s.said = '')}
      />
      <p class="sched-log">{() => s.said}</p>
    </div>
  );
}
