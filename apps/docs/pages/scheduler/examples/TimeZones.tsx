import { reactive } from '@motifx/core';
import { Scheduler } from '@motifx-community/ui';
import type { Booking } from './recurring-appointments';

/**
 * The same appointments on two clocks. The call repeats at 09:00 in New York, so in Istanbul it moves an hour when America
 * changes its clocks. The flight leaves on Istanbul's clock and lands on New York's: open it, its form has a separate end time zone.
 */
export default function TimeZones() {
  const today = new Date();
  const at = (hour: number) => new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), hour));
  const appointments = reactive([
    // 09:00 in New York, every weekday, in New York's time zone.
    { id: 1, text: 'Call with New York', startDate: at(13), endDate: at(14), startDateTimeZone: 'America/New_York', recurrenceRule: 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR' },
    { id: 2, text: 'Istanbul lunch', startDate: at(9), endDate: at(10), startDateTimeZone: 'Europe/Istanbul' },
    // 08:00 in Istanbul to 16:00 in New York.
    { id: 3, text: 'Flight to New York', startDate: at(5), endDate: at(20), startDateTimeZone: 'Europe/Istanbul', endDateTimeZone: 'America/New_York' },
  ]) as Booking[];
  const views = [{ type: 'day' as const, intervalCount: 3 }];
  return (
    <div class="sched-zones">
      <div class="sched-card">
        <span class="sched-tag">Europe/Istanbul</span>
        <Scheduler<Booking> appointments={appointments} views={views} timeZone="Europe/Istanbul" startDayHour={6} endDayHour={22} editing={{ allowTimeZones: true }} />
      </div>
      <div class="sched-card">
        <span class="sched-tag">America/New_York</span>
        <Scheduler<Booking> appointments={appointments} views={views} timeZone="America/New_York" startDayHour={0} endDayHour={16} editing={{ allowTimeZones: true }} />
      </div>
    </div>
  );
}
