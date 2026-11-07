# Scheduler: Big data

> Scheduler · @motifx-community/ui 0.1.0-beta.6

Handles thousands of resources and appointments. The scheduler renders only what is visible, and recalculates the layout only for what has changed.

## 1,000 resources, 10,000 appointments

A timeline week with one row for each of 1,000 lines and 10,000 generated tasks. Scroll down and sideways, and the visible rows, cells and tasks are rendered as they appear. The status line below shows the time taken by the first render and the number of elements the scheduler holds.

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

A week grouped by 200 lines, for 1,400 columns of 48 cells and 4,000 tasks. Only the visible columns, plus one screen on each side, are rendered.

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

| Part | Details |
| --- | --- |
| `Rows of a timeline` | Uses `Virtualization` to render only the visible rows, plus a few on each side. Each row is as tall as its lanes. The model calculates the height (lanes × lane height) and the list reads it. While an appointment is being dragged, its rows grow in place, and the list receives the new heights afterward. |
| `Cells along the time` | The model keeps a window (`setWindow`) of the cells and appointments in the visible area, plus one screen on each side. Scrolling moves the window by a few cells at a time, and the rows render it through a keyed `.map` over that part of the data. |
| `Columns of a day or a week` | The same window applies to columns, so with many groups only the visible columns are rendered, each in its own position. |
| `Layout` | Each timeline row has its own layout, so a drag recalculates only the rows it leaves and enters. Appointments are read once for all layouts until they change. |
| `Data source` | Only the displayed range is requested (`rangeFilter`), along with the displayed resources when grouping by a single-value field. |

```tsx
// A data source is asked for what is shown: the days, and the resources of the groups.
<Scheduler dataSource={source} remoteFiltering groups={['resourceId']} views={['timelineWeek']} />
```

## API reference

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `scrolling` | `Bind<'auto' \| 'standard' \| 'virtual'>` | `'auto'` | `'standard'` renders every row and cell, and `'virtual'` renders only the visible ones. `'auto'` switches to virtual above about 2,000 cells (rows × cells along the time, or columns × time rows). A view's own value takes precedence. |

## Feedback

Loading issues…

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
