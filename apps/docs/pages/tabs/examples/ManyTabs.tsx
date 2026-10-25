import { reactive } from '@motifx/core';
import { Button, Stack, Tab, Tabs } from '@motifx-community/ui';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** Twelve tabs in a narrow strip, with scroll buttons that can be turned off. */
export default function ManyTabs() {
  const s = reactive({ scrollButtons: true });

  const months = new Tabs({ label: 'Months', scrollButtons: () => s.scrollButtons });
  for (const month of MONTHS) months.add(new Tab({ title: month, content: () => <p>{month}: nothing planned yet.</p> }));

  return (
    <>
      <Button text="Scroll buttons" variant="outline" size="sm" toggle x-model={() => s.scrollButtons} />
      <Stack class="tabs-months" style="inline-size: 100%; max-inline-size: 28rem" onBuilt={(c) => c.controls.add(months)} />
    </>
  );
}
