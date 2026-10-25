import { reactive } from '@motifx/core';
import { Button, Tab, Tabs } from '@motifx-community/ui';

const HomeIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M2.5 7.5L8 3l5.5 4.5M4 6.5v6.5h8V6.5" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" />
  </svg>
);

/** A close button on every tab but Home; onClose keeps the draft open while it is protected. */
export default function Closable() {
  const s = reactive({ keepDraft: true });
  return (
    <>
      <Button
        text={() => (s.keepDraft ? 'Draft is protected' : 'Draft can close')}
        variant="outline"
        size="sm"
        toggle
        x-model={() => s.keepDraft}
      />
      <Tabs
        label="Documents"
        closable
        onClose={(e) => {
          if (e.tab.key === 'draft' && s.keepDraft) e.cancel = true;
        }}
      >
        <Tab title="Home" icon={() => <HomeIcon />} closable={false}>
          <p>Home cannot be closed.</p>
        </Tab>
        <Tab key="draft" title="Draft">
          <p>Closing is cancelled while the draft is protected.</p>
        </Tab>
        <Tab title="Notes">
          <p>Notes.</p>
        </Tab>
        <Tab title="Ideas">
          <p>Ideas.</p>
        </Tab>
      </Tabs>
    </>
  );
}
