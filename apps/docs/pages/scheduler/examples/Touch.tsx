import { reactive } from '@motifx/core';
import { NumberBox, Scheduler, Stack, Switch } from '@motifx-community/ui';
import { sampleAppointments, type Meeting } from './sample-appointments';

/**
 * A finger: hold an appointment to lift it and drag it; let go and its handles stay, drag one to
 * resize. Swipe sideways for the next or the previous days; pinch to zoom the hours. Tap a free
 * cell, then tap it again for a new appointment.
 */
export default function Touch() {
  const s = reactive({ swipe: true, pinch: true, zoom: 1, said: '' });
  return (
    <div class="sched-demo">
      <Stack orientation="horizontal" wrap align="center" gap="lg">
        <Switch label="Swipe between days" x-model={() => s.swipe} />
        <Switch label="Pinch to zoom" x-model={() => s.pinch} />
        <NumberBox label="Zoom" labelMode="side" min={0.5} max={4} step={0.25} x-model={() => s.zoom} />
        <output class="sched-log">{() => s.said}</output>
      </Stack>
      <Scheduler<Meeting>
        appointments={sampleAppointments()}
        views={['day', 'week', 'timelineDay']}
        currentView="week"
        presentation="tablet"
        swipeNavigation={() => s.swipe}
        pinchZoom={() => s.pinch}
        timeZoom={() => s.zoom}
        onTimeZoomChanged={(e) => {
          s.zoom = e.to;
          s.said = `Zoomed from ${e.from.toFixed(2)} to ${e.to.toFixed(2)}`;
        }}
        onMoveEnd={(e) => (s.said = `${e.appointment.text} moved`)}
        onDateChanged={(e) => (s.said = e.byUser ? `Moved to ${e.to.toDateString()}` : s.said)}
      />
    </div>
  );
}
