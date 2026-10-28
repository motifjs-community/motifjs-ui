import { reactive } from '@motifx/core';
import { Scheduler, Switch } from '@motifx-community/ui';
import { sampleAppointments, type Meeting } from './sample-appointments';

/** Drag an appointment, pull its edges, Ctrl-drag a copy, double-click to edit, click for its tooltip. Every switch is live. */
export default function Editing() {
  const s = reactive({ drag: true, resize: true, copy: true, ask: true, quarter: false, log: [] as string[] });
  const say = (text: string) => {
    s.log.unshift(text);
    if (s.log.length > 6) s.log.pop();
  };
  const time = (d: Date) => d.toLocaleString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
  return (
    <div class="sched-demo">
      <div class="docs-flow">
        <Switch label="Drag" x-model={() => s.drag} />
        <Switch label="Resize" x-model={() => s.resize} />
        <Switch label="Ctrl copies" x-model={() => s.copy} />
        <Switch label="Ask before deleting" x-model={() => s.ask} />
        <Switch label="15-minute steps" x-model={() => s.quarter} />
      </div>
      <Scheduler<Meeting>
        appointments={sampleAppointments()}
        startDayHour={8}
        endDayHour={19}
        editing={() => ({ allowDragging: s.drag, allowResizing: s.resize, allowCopying: s.copy, confirmDelete: s.ask })}
        snapMinutes={() => (s.quarter ? 15 : 30)}
        onMoveEnd={(e) => say(`${e.copy ? 'Copied' : 'Moved'} ${e.appointment.text} to ${time(e.start)}${e.byKeys ? ' (keys)' : ''}`)}
        onResizeEnd={(e) => say(`${e.appointment.text} now ${time(e.start)} – ${time(e.end)}`)}
        onAppointmentAdded={(e) => say(`Added ${e.appointment.text}`)}
        onAppointmentUpdated={(e) => say(`Saved ${e.appointment.text}`)}
        onAppointmentDeleted={(e) => say(`Deleted ${e.appointment.text}`)}
      />
      <ol class="sched-events" aria-label="What happened">
        {s.log.map((line, i) => (
          <li key={`${i}-${line}`}>{line}</li>
        ))}
      </ol>
    </div>
  );
}
