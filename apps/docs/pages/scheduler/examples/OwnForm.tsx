import { reactive } from '@motifx/core';
import { Button, FormLayout, MxForm, Scheduler, Stack, type FormOpeningEventArgs } from '@motifx-community/ui';
import { bookings, rooms, type Booking } from './resource-data';

/**
 * A form of your own: `onFormOpening` cancels the scheduler's and opens a short one (a title and a
 * room), then saves through the scheduler, so its events and its checks still run.
 */
export default function OwnForm() {
  const opening = async (e: FormOpeningEventArgs<Booking>) => {
    e.cancel = true;
    const data = reactive({ text: String(e.data.text), roomId: (e.data.roomId as number | null) ?? 1 });
    const form = new MxForm({ title: e.appointment ? 'Quick edit' : 'Quick booking', modal: true });
    let layout: FormLayout<typeof data> | null = null;
    form.content = (
      <FormLayout<typeof data>
        data={data}
        ref={(c: FormLayout<typeof data>) => (layout = c)}
        items={[
          { field: 'text', label: 'Title', required: true },
          { field: 'roomId', label: 'Room', editor: 'radio', editorProps: { items: rooms, itemText: 'text', itemValue: 'id', orientation: 'horizontal' } },
        ]}
      />
    );
    form.footer = (
      <Stack orientation="horizontal" justify="end">
        <Button text="Save" tone="accent" onclick={async () => layout && (await layout.validate()).valid && form.close('ok')} />
        <Button text="Cancel" onclick={() => form.close('cancel')} />
      </Stack>
    );
    if ((await form.showDialog(e.source)) !== 'ok') return;
    if (e.appointment) await e.source.updateAppointment(e.appointment, { text: data.text, roomId: data.roomId });
    else await e.source.addAppointment({ text: data.text, roomId: data.roomId, startDate: e.data.start ?? new Date(), endDate: e.data.end ?? new Date() });
  };
  return (
    <div class="sched-demo">
      <Scheduler<Booking>
        appointments={bookings()}
        resources={[{ field: 'roomId', label: 'Room', items: rooms, useColorAsDefault: true }]}
        currentView="workWeek"
        startDayHour={8}
        endDayHour={18}
        onFormOpening={(e) => void opening(e)}
      />
    </div>
  );
}
