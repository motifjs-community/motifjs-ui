import { reactive } from '@motifx/core';
import { Button, Card, Stack } from '@motifx-community/ui';

/** A card in JSX tracks its functions, and one created with `new` accepts the same properties programmatically. */
export default function Programmatic() {
  const s = reactive({ following: false });
  const coded = new Card({ title: 'Made in code', subtitle: 'new Card({ … })', variant: 'outline' });

  return (
    <Stack orientation="horizontal" wrap align="start" gap="lg">
      <Card
        title="Ada Lovelace"
        subtitle={() => (s.following ? 'Following' : 'Mathematician')}
        avatar={{ name: 'Ada Lovelace' }}
        footer={<Button text={() => (s.following ? 'Unfollow' : 'Follow')} onclick={() => (s.following = !s.following)} />}
        style="inline-size: 18rem"
      >
        First to publish an algorithm meant to be carried out by a machine.
      </Card>
      <span onConfig={(c) => c.controls.add(coded)} />
    </Stack>
  );
}
