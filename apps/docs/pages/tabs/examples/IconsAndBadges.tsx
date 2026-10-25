import { reactive } from '@motifx/core';
import { Button, Tab, Tabs } from '@motifx-community/ui';

const MailIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M2.5 4h11v8h-11zM2.5 4.5L8 8.5l5.5-4" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" />
  </svg>
);

/** A tab with an icon, a count that follows state and a tooltip, and a disabled tab. */
export default function IconsAndBadges() {
  const s = reactive({ unread: 3 });
  return (
    <Tabs label="Mail">
      <Tab title="Inbox" icon={() => <MailIcon />} badge={() => (s.unread ? s.unread : null)} hint="Mail you have not read">
        <Button text="Read one" variant="outline" onclick={() => (s.unread = Math.max(0, s.unread - 1))} />
      </Tab>
      <Tab title="Sent">
        <p>Sent mail.</p>
      </Tab>
      <Tab title="Archive" enabled={false}>
        <p>Archive.</p>
      </Tab>
    </Tabs>
  );
}
