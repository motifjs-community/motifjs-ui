import { reactive } from '@motifx/core';
import { Button, DateBox, ValidationGroup } from '@motifx-community/ui';

const today = new Date();
const inDays = (n: number) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + n);

/** A required weekday in the next 60 days: `min`, `max` and `disabledDates` limit typing and picking, a group checks it. */
export default function Limits() {
  const s = reactive({ result: '' });
  const group = new ValidationGroup();

  const check = async () => {
    const result = await group.validate();
    s.result = result.valid ? 'Booked.' : 'Pick a weekday in the next 60 days.';
  };

  return (
    <>
      <DateBox
        label="Appointment"
        required
        min={today}
        max={inDays(60)}
        disabledDates={(d: Date) => d.getDay() === 0 || d.getDay() === 6}
        helpText="A weekday in the next 60 days."
        validationGroup={group}
        showTodayButton
      />
      <Button text="Check" variant="outline" onclick={check} />
      <output class="db-check">{() => s.result}</output>
    </>
  );
}
