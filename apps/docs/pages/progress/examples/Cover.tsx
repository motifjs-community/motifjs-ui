import { reactive } from '@motifx/core';
import { Button, Panel, Spinner, Stack, TextBox } from '@motifx-community/ui';

/** A spinner over a panel while its orders load. Focus waits on it and then returns. */
export default function Cover() {
  const s = reactive({ result: '' });
  let panel: Panel | null = null;

  // Simulates a server call.
  const loadOrders = () => new Promise((resolve) => setTimeout(resolve, 1500));

  const load = async () => {
    if (!panel) return;
    const done = Spinner.cover(panel, { label: 'Loading orders' });
    try {
      await loadOrders();
    } finally {
      done();
    }
    s.result = 'Orders loaded.';
  };

  return (
    <>
      <Panel class="pr-panel" variant="outline" padding="md" ref={(c: Panel) => (panel = c)}>
        <Stack orientation="horizontal" wrap align="center">
          <TextBox label="Customer" value="Ada" />
          <Button text="Load orders" tone="accent" onclick={load} />
        </Stack>
      </Panel>
      <output>{() => s.result}</output>
    </>
  );
}
