import { reactive } from '@motifx/core';
import { RadioGroup, Stack, Switch, TabDocument, TabDocumentManager, type ContentLifetime, type TabCloseButton } from '@motifx-community/ui';
import { notes } from './contents';

/** Every behaviour is a prop, followed live: here bound to the switches above the manager. */
export default function Options() {
  const s = reactive({
    closeButton: 'always' as TabCloseButton,
    lifetime: 'keep' as ContentLifetime,
    closeEmptyGroups: true,
    groupActions: true,
    manual: false,
    built: 0,
  });

  const docs = new TabDocumentManager({
    label: 'Live options',
    closeButton: () => s.closeButton,
    contentLifetime: () => s.lifetime,
    closeEmptyGroups: () => s.closeEmptyGroups,
    groupActions: () => s.groupActions,
    activation: () => (s.manual ? 'manual' : 'auto'),
  });
  docs.element.style.cssText = 'block-size: 28rem; inline-size: 100%';
  for (const name of ['Alpha', 'Beta', 'Gamma', 'Delta']) {
    docs.open(
      new TabDocument({
        id: name.toLowerCase(),
        title: name,
        dirty: name === 'Gamma',
        closable: name !== 'Alpha',
        content: () => {
          s.built++;
          return notes(name);
        },
      }),
    );
  }

  return (
    <>
      <Stack orientation="horizontal" wrap align="center" gap="lg">
        <RadioGroup
          label="Close button"
          orientation="horizontal"
          items={[
            { value: 'always', text: 'Always' },
            { value: 'active', text: 'Active and hover' },
            { value: 'never', text: 'Never' },
          ]}
          itemText="text"
          itemValue="value"
          x-model={() => s.closeButton}
        />
        <RadioGroup
          label="Content lifetime"
          orientation="horizontal"
          items={[
            { value: 'keep', text: 'Keep' },
            { value: 'lazy', text: 'Lazy' },
            { value: 'dispose', text: 'Dispose' },
          ]}
          itemText="text"
          itemValue="value"
          x-model={() => s.lifetime}
        />
      </Stack>
      <Stack orientation="horizontal" wrap align="center" gap="lg">
        <Switch label="Close empty groups" x-model={() => s.closeEmptyGroups} />
        <Switch label="Group buttons" x-model={() => s.groupActions} />
        <Switch label="Manual activation" x-model={() => s.manual} />
        <output class="td-built">{() => `contents built: ${s.built}`}</output>
      </Stack>
      {docs}
    </>
  );
}
