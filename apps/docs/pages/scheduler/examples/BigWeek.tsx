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
