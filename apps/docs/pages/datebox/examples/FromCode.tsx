import { reactive } from '@motifx/core';
import { Button, DateBox, Stack } from '@motifx-community/ui';

const today = new Date();

/** A date box bound with x-model, and date boxes created with `new`, given a value and added from code. */
export default function FromCode() {
  const order = reactive({ delivery: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3) as Date | null, result: '' });
  let added = 0;
  let host: Stack | null = null;

  const addFromCode = () => {
    const due = new DateBox({ label: `Due ${++added}`, locale: 'tr-TR', clearButton: true });
    due.value = new Date(2026, 9, 25);
    due.onValueChanged((e) => (order.result = `${due.label}: ${e.value ? e.value.toDateString() : '—'}`));
    host?.controls.add(due);
    due.focus();
  };

  return (
    <>
      <DateBox label="&Delivery" x-model={() => order.delivery} clearButton />
      <output class="db-day">{() => (order.delivery ? order.delivery.toDateString() : '—')}</output>
      <Button text="Add a date box from code" variant="outline" onclick={addFromCode} />
      <output class="db-made">{() => order.result}</output>
      <Stack orientation="horizontal" wrap align="center" ref={(c: Stack) => (host = c)} />
    </>
  );
}
