import { reactive, type Component } from '@motifx/core';
import { Button, Scheduler, Stack } from '@motifx-community/ui';
import { sampleAppointments, type Meeting } from './sample-appointments';

/**
 * A scheduler that goes by its own width (`presentation: 'auto'`), in a frame the size of a phone:
 * under 560 pixels it shows as on a phone, under 1024 as on a tablet (here by the width alone,
 * `tabletWhen: 'width'`, so a mouse shows it too). Drag the frame's corner, or pick a width.
 */
export default function PhoneFrame() {
  const s = reactive({ shown: '' });
  let frame!: Component<HTMLDivElement>;
  const width = (px: string) => (frame.element.style.inlineSize = px);
  return (
    <div class="sched-demo">
      <Stack orientation="horizontal" wrap align="center">
        <Button text="390 px" variant="outline" onclick={() => width('390px')} />
        <Button text="820 px" variant="outline" onclick={() => width('820px')} />
        <Button text="Full width" variant="outline" onclick={() => width('100%')} />
        <output class="sched-log">{() => s.shown}</output>
      </Stack>
      <div ref={(c: Component<HTMLDivElement>) => (frame = c)} class="sched-phone-frame">
        <Scheduler<Meeting>
          appointments={sampleAppointments()}
          views={['day', 'week', 'month', 'agenda']}
          tabletWhen="width"
          startDayHour={7}
          onPresentationChanged={(e) => (s.shown = `${e.to} at ${e.width} px`)}
        />
      </div>
    </div>
  );
}
