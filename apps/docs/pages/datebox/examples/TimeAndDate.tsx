import { reactive } from '@motifx/core';
import { DateBox } from '@motifx-community/ui';

/** A date with a time in steps of 15 minutes, and a time alone. */
export default function TimeAndDate() {
  const s = reactive({ meeting: null as Date | null, alarm: null as Date | null });
  return (
    <>
      <DateBox label="Meeting" type="datetime" timeStep={15} displayFormat={{ dateStyle: 'medium', timeStyle: 'short' }} x-model={() => s.meeting} stretch />
      <DateBox label="Alarm" type="time" x-model={() => s.alarm} />
    </>
  );
}
