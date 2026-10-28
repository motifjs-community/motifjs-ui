import { reactive } from '@motifx/core';
import { Scheduler, type DragEventArgs } from '@motifx-community/ui';
import { sampleAppointments, type Meeting } from './sample-appointments';

type Locked = Meeting & { allowDrag?: boolean; allowResize?: boolean };

/** Nothing may go over lunch (12:00–13:00) or onto a weekend: the drag shows it cannot drop there. "Lunch with Ana" is locked in place. */
export default function Rules() {
  const list = sampleAppointments() as Locked[];
  const lunch = list.find((m) => m.text === 'Lunch with Ana');
  if (lunch) {
    lunch.allowDrag = false;
    lunch.allowResize = false;
  }
  const s = reactive({ said: '' });
  const allowed = (e: DragEventArgs<Locked>) => {
    const weekend = [0, 6].includes(e.start.getDay());
    const noon = new Date(e.start.getFullYear(), e.start.getMonth(), e.start.getDate(), 12);
    const overLunch = !e.allDay && e.start < new Date(noon.getTime() + 3_600_000) && e.end > noon;
    e.cancel = weekend || overLunch;
    s.said = weekend ? 'Not on a weekend.' : overLunch ? 'Not over lunch.' : '';
  };
  return (
    <div class="sched-demo">
      <Scheduler<Locked> appointments={list} startDayHour={8} endDayHour={19} onMoving={allowed} onResizing={allowed} />
      <p class="sched-log" role="status">
        {() => s.said}
      </p>
    </div>
  );
}
