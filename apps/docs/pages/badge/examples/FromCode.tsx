import { reactive } from '@motifx/core';
import { Badge, Button } from '@motifx-community/ui';

/** A badge from JSX follows its functions; one made with `new` takes the same properties from code. */
export default function FromCode() {
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
