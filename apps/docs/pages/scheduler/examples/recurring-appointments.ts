import { reactive } from '@motifx/core';
import { formatRuleDate } from '@motifx-community/ui';

export interface Booking {
  id: number;
  text: string;
  startDate: Date;
  endDate: Date;
  allDay?: boolean;
  color?: string;
  recurrenceRule?: string;
  recurrenceException?: string;
  recurrenceId?: number;
  startDateTimeZone?: string;
  endDateTimeZone?: string;
}

/** Series around this week: a daily standup with one day left out and one moved, a review every other week, a report on the last Friday, an all-day Friday. */
export function recurringAppointments(): Booking[] {
  const today = new Date();
  const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - ((today.getDay() + 6) % 7));
  const day = (offset: number, hour = 0, minute = 0) => new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + offset, hour, minute);
  return reactive([
    {
      id: 1,
      text: 'Team standup',
      startDate: day(-21, 9),
      endDate: day(-21, 9, 30),
      recurrenceRule: 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR',
      // This Tuesday is left out; this Wednesday's is moved (appointment 2).
      recurrenceException: [day(1, 9), day(2, 9)].map((d) => formatRuleDate({ time: d.getTime(), utc: true, dateOnly: false })).join(','),
    },
    { id: 2, text: 'Team standup', startDate: day(2, 11), endDate: day(2, 11, 30), recurrenceId: 1 },
    {
      id: 3,
      text: 'Design review',
      startDate: day(-11, 14),
      endDate: day(-11, 15, 30),
      color: '#7c4dff',
      recurrenceRule: 'FREQ=WEEKLY;INTERVAL=2;BYDAY=TH',
    },
    {
      id: 4,
      text: 'Monthly report',
      startDate: day(-60, 16),
      endDate: day(-60, 17),
      color: '#c62828',
      recurrenceRule: 'FREQ=MONTHLY;BYDAY=-1FR',
    },
    {
      id: 5,
      text: 'Remote day',
      startDate: day(-3),
      endDate: day(-2),
      allDay: true,
      color: '#00838f',
      recurrenceRule: 'FREQ=WEEKLY;BYDAY=FR;COUNT=12',
    },
    { id: 6, text: 'Lunch with Ana', startDate: day(3, 12, 30), endDate: day(3, 13, 30), color: '#2e7d32' },
  ]) as Booking[];
}
