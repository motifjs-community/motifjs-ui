import { reactive } from '@motifx/core';
import { Button, Stack, Tab, Tabs, type TabsPlacement } from '@motifx-community/ui';

const PLACEMENTS: TabsPlacement[] = ['top', 'bottom', 'start', 'end'];

/** The strip above, below, or beside the panel. */
export default function Placement() {
  const s = reactive({ placement: 'top' as TabsPlacement });
  return (
    <>
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Placement">
        {PLACEMENTS.map((placement) => (
          <Button
            key={placement}
            text={placement}
            size="sm"
            variant={() => (s.placement === placement ? 'solid' : 'ghost')}
            aria-pressed={() => s.placement === placement}
            onclick={() => (s.placement = placement)}
          />
        ))}
      </Stack>
      <Tabs label="Placement" class="tabs-placement" placement={() => s.placement}>
        <Tab title="Profile">
          <p>Profile.</p>
        </Tab>
        <Tab title="Security">
          <p>Security.</p>
        </Tab>
        <Tab title="Billing">
          <p>Billing.</p>
        </Tab>
      </Tabs>
    </>
  );
}
