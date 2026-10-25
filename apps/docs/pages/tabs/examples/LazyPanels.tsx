import { reactive } from '@motifx/core';
import { Stack, Tab, Tabs, TextBox } from '@motifx-community/ui';

/** Panels built when first shown: one kept, one made again each time it shows. */
export default function LazyPanels() {
  const s = reactive({ builds: 0 });

  const tabs = new Tabs({ label: 'Lazy panels' });
  tabs.add(new Tab({ title: 'First', content: () => <p>Always here.</p> }));
  tabs.add(
    new Tab({
      title: 'Kept',
      content: () => {
        s.builds++;
        return <TextBox label="Type, switch tabs, come back" />;
      },
    }),
  );
  tabs.add(
    new Tab({
      title: 'Made each time',
      keepAlive: false,
      content: () => {
        s.builds++;
        return <TextBox label="This one starts empty each time" />;
      },
    }),
  );

  return (
    <>
      <Stack style="inline-size: 100%" onBuilt={(c) => c.controls.add(tabs)} />
      <output class="tabs-builds">{() => `Panels built: ${s.builds}`}</output>
    </>
  );
}
