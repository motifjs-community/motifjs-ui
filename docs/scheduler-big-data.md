# Scheduler: Big data

> Scheduler · @motifx-community/ui 0.1.0-beta.2

Thousands of resources and appointments: the scheduler builds only what is in view, and lays out only what changed.

## 1,000 resources, 10,000 appointments

A timeline week with a row for each of 1,000 lines and 10,000 tasks over them (generated). Scroll down and sideways: the rows, cells and tasks in view are built as they come. The line under it says how long the first show took and how many elements the scheduler holds.

```tsx
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
```

## 200 groups in a week

A week grouped by 200 lines: 1,400 columns of 48 cells and 4,000 tasks. Only the columns in view (and a screen on each side) are built.

```tsx
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
```

## How it stays fast

| Part | How |
| --- | --- |
| `Rows of a timeline` | Through `Virtualization`: only the rows in view (and a few on each side) are built. Each row is as tall as its lanes; the model works the height out (lanes × lane height), the list reads it. While an appointment is dragged its rows grow in place and the list is given the heights after. |
| `Cells along the time` | A window kept by the model (`setWindow`): the cells and appointments of the part in view and a screen on each side. Scrolling moves the window on by a few cells at a time; the rows show it through a keyed `.map` over the window’s slice. |
| `Columns of a day or a week` | The same window over the columns: with many groups only the columns in view are built, each at its own place. |
| `Layout` | Each row of a timeline is laid out on its own; a drag lays out only the rows it was and is in. The appointments are read once for every layout until they change. |
| `Data source` | The range shown is what is asked for (`rangeFilter`), with the resources shown when grouped by a field of one value. |

```tsx
// A data source is asked for what is shown: the days, and the resources of the groups.
<Scheduler dataSource={source} remoteFiltering groups={['resourceId']} views={['timelineWeek']} />
```

## API reference

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `scrolling` | `Bind<'auto' \| 'standard' \| 'virtual'>` | `'auto'` | Every row and cell built (`'standard'`), or only what is in view (`'virtual'`); `'auto'`: virtual past about 2,000 cells (rows × cells along the time, columns × time rows). A view’s own wins. |

## Example files

`BigTimeline.tsx`

```tsx
import { reactive } from '@motifx/core';
import { Scheduler } from '@motifx-community/ui';
import { machines, tasks, type Task } from './big-data';

/**
 * 1,000 resources and 10,000 tasks in a timeline week. Only the rows in view are built (through
 * `Virtualization`, each as tall as its lanes), and in each row only the cells and tasks of the part
 * of the week in view. The numbers under it are measured as it shows and as you scroll.
 */
export default function BigTimeline() {
  const resources = [{ field: 'resourceId', label: 'Line', items: machines(1000), useColorAsDefault: true }];
  const s = reactive({ shown: '', nodes: 0 });
  const started = performance.now();
  return (
    <div class="sched-demo">
      <Scheduler<Task>
        appointments={tasks(10_000, 1000)}
        resources={resources}
        groups={['resourceId']}
        views={['timelineWeek', 'timelineDay']}
        currentView="timelineWeek"
        cellDuration={60}
        onContentReady={(e) => {
          // Shown: the frame after its first appointments are on the page.
          const look = () => {
            const el = e.source.element;
            if (!el.querySelector('.mx-scheduler__scroll .mx-scheduler__appointment')) return void requestAnimationFrame(look);
            requestAnimationFrame(() => {
              if (!s.shown) s.shown = `${Math.round(performance.now() - started)} ms`;
              s.nodes = el.querySelectorAll('*').length;
            });
          };
          look();
        }}
      />
      <p class="sched-log">{() => (s.shown ? `Shown in ${s.shown}; ${s.nodes.toLocaleString()} elements on the page.` : 'Building…')}</p>
    </div>
  );
}
```

`big-data.ts`

```tsx
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
```

`BigWeek.tsx`

```tsx
import { reactive } from '@motifx/core';
import { Scheduler } from '@motifx-community/ui';
import { machines, tasks, type Task } from './big-data';

/**
 * 200 groups in a week: 1,400 columns of 48 cells. Only the columns in view (and a screen on each
 * side) are built; scroll sideways and they follow.
 */
export default function BigWeek() {
  const resources = [{ field: 'resourceId', label: 'Line', items: machines(200), useColorAsDefault: true }];
  const s = reactive({ shown: '', nodes: 0 });
  const started = performance.now();
  return (
    <div class="sched-demo">
      <Scheduler<Task>
        appointments={tasks(4000, 200)}
        resources={resources}
        groups={['resourceId']}
        views={['week', 'day']}
        currentView="week"
        onContentReady={(e) => {
          // Shown: the frame after its first appointments are on the page.
          const look = () => {
            const el = e.source.element;
            if (!el.querySelector('.mx-scheduler__scroll .mx-scheduler__appointment')) return void requestAnimationFrame(look);
            requestAnimationFrame(() => {
              if (!s.shown) s.shown = `${Math.round(performance.now() - started)} ms`;
              s.nodes = el.querySelectorAll('*').length;
            });
          };
          look();
        }}
      />
      <p class="sched-log">{() => (s.shown ? `Shown in ${s.shown}; ${s.nodes.toLocaleString()} elements on the page.` : 'Building…')}</p>
    </div>
  );
}
```
