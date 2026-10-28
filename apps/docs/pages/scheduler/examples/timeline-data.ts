import { reactive } from '@motifx/core';

export interface Job {
  id: number;
  text: string;
  startDate: Date;
  endDate: Date;
  allDay?: boolean;
  teamId?: number;
  ownerId?: number;
  color?: string;
  recurrenceRule?: string;
}

export interface Team {
  id: number;
  text: string;
  color: string;
}

export interface Member {
  id: number;
  text: string;
  color: string;
  /** The team the person is in. */
  teamId: number;
  workStartHour?: number;
  workEndHour?: number;
}

export const teams: Team[] = [
  { id: 1, text: 'Field service', color: '#1565c0' },
  { id: 2, text: 'Workshop', color: '#2e7d32' },
  { id: 3, text: 'Support desk', color: '#6a1b9a' },
];

export const members: Member[] = [
  { id: 1, text: 'Ana Silva', color: '#ad1457', teamId: 1 },
  { id: 2, text: 'Ben Okafor', color: '#ef6c00', teamId: 1 },
  { id: 3, text: 'Cem Yılmaz', color: '#00838f', teamId: 1, workStartHour: 7, workEndHour: 15 },
  { id: 4, text: 'Dana Ivanova', color: '#455a64', teamId: 2 },
  { id: 5, text: 'Emil Novak', color: '#5d4037', teamId: 2 },
  { id: 6, text: 'Fatma Demir', color: '#c62828', teamId: 3, workStartHour: 12, workEndHour: 20 },
  { id: 7, text: 'Gus Moreau', color: '#283593', teamId: 3 },
];

const WORK = ['Install', 'Repair', 'Inspection', 'Calls', 'Delivery', 'Training', 'Planning', 'Visit'];

/** A fortnight of jobs around today: a few a day for each person, some over each other, some over days. */
export function jobs(): Job[] {
  const today = new Date();
  const day = (offset: number, hour: number, minute = 0) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset, hour, minute);
  const out: Job[] = [];
  let id = 1;
  for (const member of members) {
    for (let offset = -7; offset <= 7; offset++) {
      // A stable spread: each person's day has its own hours.
      const seed = (member.id * 31 + offset * 17 + 400) % 97;
      if (seed % 5 === 0) continue;
      const start = 8 + (seed % 6);
      const length = 1 + (seed % 3);
      out.push({ id: id++, text: WORK[seed % WORK.length], startDate: day(offset, start), endDate: day(offset, start + length, seed % 2 ? 30 : 0), teamId: member.teamId, ownerId: member.id });
      if (seed % 4 === 1) out.push({ id: id++, text: WORK[(seed + 3) % WORK.length], startDate: day(offset, start + 1), endDate: day(offset, start + 2, 30), teamId: member.teamId, ownerId: member.id });
    }
  }
  out.push({ id: id++, text: 'Trade fair', startDate: day(1, 0), endDate: day(3, 0), allDay: true, teamId: 1, ownerId: 1 });
  out.push({ id: id++, text: 'Night shift', startDate: day(0, 20), endDate: day(1, 6), teamId: 3, ownerId: 7 });
  out.push({ id: id++, text: 'Stand-up', startDate: day(-7, 9), endDate: day(-7, 9, 15), teamId: 2, ownerId: 4, recurrenceRule: 'FREQ=DAILY;BYDAY=MO,TU,WE,TH,FR' });
  return reactive(out) as Job[];
}
