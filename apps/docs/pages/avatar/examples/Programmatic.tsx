import { reactive } from '@motifx/core';
import { Avatar, Button, Stack, type AvatarStatus } from '@motifx-community/ui';

const PEOPLE = ['Ada Lovelace', 'Alan Turing', 'Grace Hopper'];
const STATUSES: AvatarStatus[] = ['online', 'away', 'busy', 'offline'];

/** An avatar from JSX follows its functions; one made with `new` takes the same properties programmatically. */
export default function Programmatic() {
  const s = reactive({ person: 0, status: 0 });
  const coded = new Avatar({ name: 'Edsger Dijkstra', tone: 'success', shape: 'square' });

  return (
    <Stack orientation="horizontal" wrap align="center">
      <Avatar name={() => PEOPLE[s.person]} status={() => STATUSES[s.status]} />
      <Button text="Next person" variant="outline" onclick={() => (s.person = (s.person + 1) % PEOPLE.length)} />
      <Button text="Next presence" variant="outline" onclick={() => (s.status = (s.status + 1) % STATUSES.length)} />
      <span onConfig={(c) => c.controls.add(coded)} />
    </Stack>
  );
}
