import { reactive } from '@motifx/core';

export interface Task {
  id: number;
  text: string;
  startDate: Date;
  endDate: Date;
  resourceId: number;
}

export interface Machine {
  id: number;
  text: string;
  color: string;
}

const COLORS = ['#1565c0', '#2e7d32', '#6a1b9a', '#ad1457', '#ef6c00', '#00838f', '#455a64', '#5d4037'];
const WORK = ['Cut', 'Weld', 'Paint', 'Check', 'Pack', 'Load', 'Clean', 'Test'];

/** `count` resources, named and coloured in turn. */
export function machines(count: number): Machine[] {
  return Array.from({ length: count }, (_, i) => ({ id: i + 1, text: `Line ${String(i + 1).padStart(4, '0')}`, color: COLORS[i % COLORS.length] }));
}

/**
 * `count` tasks over the week of `day`, spread over the resources: each one an hour or a few long,
 * in the working hours, some over each other (a pseudo-random spread, the same each time).
 */
export function tasks(count: number, resources: number, day = new Date()): Task[] {
  const monday = new Date(day.getFullYear(), day.getMonth(), day.getDate() - ((day.getDay() + 6) % 7));
  let seed = 7;
  const next = () => (seed = (seed * 48271) % 2147483647) / 2147483647;
  const out: Task[] = [];
  for (let i = 0; i < count; i++) {
    const start = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + Math.floor(next() * 7), 6 + Math.floor(next() * 12), next() < 0.5 ? 0 : 30);
    const end = new Date(start.getTime() + (1 + Math.floor(next() * 4)) * 3_600_000);
    out.push({ id: i + 1, text: `${WORK[i % WORK.length]} ${i + 1}`, startDate: start, endDate: end, resourceId: 1 + (i % resources) });
  }
  return reactive(out) as Task[];
}
