import { Button, Panel, Stack } from '@motifx-community/ui';

/** A panel disabled and enabled from code: everything inside follows, and the inner button keeps its own `enabled`. */
export default function EnabledPanel() {
  let panel: Panel | null = null;
  let inner: Button | null = null;

  return (
    <>
      <Button text="Toggle panel enabled" onclick={() => (panel!.enabled = !panel!.enabled)} />
      <Panel variant="outline" padding="md" class="ctl-panel" ref={(p: Panel) => (panel = p)}>
        <Stack orientation="horizontal" wrap align="center">
          <label>
            Name <input name="panel-name" />
          </label>
          <Button text="Inner button" ref={(b: Button) => (inner = b)} />
          <a href="#enabled">A link</a>
        </Stack>
      </Panel>
      <output>{() => (inner ? `Inner button: enabled ${inner.enabled}, isEnabled ${inner.isEnabled}` : '')}</output>
    </>
  );
}
