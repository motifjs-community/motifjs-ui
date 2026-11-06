import { reactive } from '@motifx/core';
import { Badge, Button } from '@motifx-community/ui';

/** A badge in JSX tracks its functions, and one created with `new` accepts the same properties programmatically. */
export default function Programmatic() {
  const s = reactive({ unread: 4 });
  const coded = new Badge({ text: 'Beta', tone: 'info', variant: 'subtle' });

  return (
    <>
      <span>
        Inbox <Badge count={() => s.unread} label={() => `${s.unread} unread`} />
      </span>
      <Button text="Add one" variant="outline" onclick={() => s.unread++} />
      <Button text="Read all" variant="outline" onclick={() => (s.unread = 0)} />
      <span onConfig={(c) => c.controls.add(coded)}>Search </span>
    </>
  );
}
