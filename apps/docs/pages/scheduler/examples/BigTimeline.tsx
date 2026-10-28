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
