import { Tab, Tabs } from '@motifx-community/ui';

/** Arrow keys move focus only; Enter or Space selects. */
export default function ManualActivation() {
  return (
    <Tabs label="Manual" class="tabs-manual" activation="manual">
      <Tab title="One">
        <p>One.</p>
      </Tab>
      <Tab title="Two">
        <p>Two.</p>
      </Tab>
      <Tab title="Three">
        <p>Three.</p>
      </Tab>
    </Tabs>
  );
}
