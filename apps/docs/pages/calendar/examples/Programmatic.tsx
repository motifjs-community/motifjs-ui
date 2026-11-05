import { reactive } from '@motifx/core';
import { Button, Calendar, Stack } from '@motifx-community/ui';

/** A calendar bound with x-model, and calendars created with `new`, added programmatically and moved to a month. */
export default function Programmatic() {
  const form = reactive({ day: new Date() as Date | null, result: '' });
  let host: Stack | null = null;

  const addProgrammatic = () => {
    const calendar = new Calendar({ locale: 'tr-TR' });
    calendar.onValueChanged((e) => (form.result = e.value ? e.value.toDateString() : '—'));
    host?.controls.add(calendar);
    calendar.goTo(new Date(2027, 0, 1));
  };

  return (
    <>
      <Calendar x-model={() => form.day} showWeekNumbers showTodayButton />
      <output class="cal-day">{() => (form.day ? form.day.toDateString() : '—')}</output>
      <Button text="Add a calendar programmatically" variant="outline" onclick={addProgrammatic} />
      <output class="cal-made">{() => form.result}</output>
      <Stack orientation="horizontal" wrap align="center" ref={(c: Stack) => (host = c)} />
    </>
  );
}
