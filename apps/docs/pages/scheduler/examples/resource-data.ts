import { reactive } from '@motifx/core';

export interface Booking {
  id: number;
  text: string;
  startDate: Date;
  endDate: Date;
  allDay?: boolean;
  roomId?: number;
  ownerIds?: number[];
  color?: string;
  description?: string;
}

export interface Room {
  id: number;
  text: string;
  color: string;
  workStartHour?: number;
  workEndHour?: number;
}

export interface Person {
  id: number;
  text: string;
  color: string;
  /** The room the person works in. */
  roomId: number;
  workDays?: number[];
}

export const rooms: Room[] = [
  { id: 1, text: 'Atlas', color: '#1565c0' },
  // Open from 10 to 18.
  { id: 2, text: 'Bosphorus', color: '#2e7d32', workStartHour: 10, workEndHour: 18 },
  { id: 3, text: 'Cappadocia', color: '#6a1b9a' },
];

export const people: Person[] = [
  { id: 1, text: 'Ana Silva', color: '#ad1457', roomId: 1 },
  { id: 2, text: 'Ben Okafor', color: '#ef6c00', roomId: 1 },
  // Works Monday to Thursday.
  { id: 3, text: 'Cem Yılmaz', color: '#00838f', roomId: 2, workDays: [1, 2, 3, 4] },
  { id: 4, text: 'Dana Ivanova', color: '#455a64', roomId: 3 },
];

/** A week of bookings around today: each in a room, with one or more people. */
export function bookings(): Booking[] {
  const today = new Date();
  const day = (offset: number, hour: number, minute = 0) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset, hour, minute);
  return reactive([
    { id: 1, text: 'Team standup', startDate: day(0, 9), endDate: day(0, 9, 30), roomId: 1, ownerIds: [1, 2] },
    { id: 2, text: 'Design review', startDate: day(0, 10), endDate: day(0, 11, 30), roomId: 1, ownerIds: [1] },
    { id: 3, text: 'Supplier call', startDate: day(0, 14), endDate: day(0, 15), roomId: 2, ownerIds: [3] },
    { id: 4, text: 'Hiring panel', startDate: day(1, 13), endDate: day(1, 15), roomId: 3, ownerIds: [4, 2] },
    { id: 5, text: 'Budget', startDate: day(1, 10), endDate: day(1, 11), roomId: 2, ownerIds: [3] },
    { id: 6, text: 'Workshop', startDate: day(2, 9), endDate: day(2, 12), roomId: 3, ownerIds: [4] },
    { id: 7, text: 'One-on-one', startDate: day(2, 15), endDate: day(2, 15, 30), roomId: 1, ownerIds: [2] },
    { id: 8, text: 'Offsite', startDate: day(3, 0), endDate: day(5, 0), allDay: true, roomId: 3, ownerIds: [1, 4] },
    { id: 9, text: 'Retro', startDate: day(-1, 16), endDate: day(-1, 17), roomId: 1, ownerIds: [1, 2] },
    { id: 10, text: 'Customer visit', startDate: day(-2, 11), endDate: day(-2, 12, 30), roomId: 2, ownerIds: [3, 1] },
  ]) as Booking[];
}
