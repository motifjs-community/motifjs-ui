import { reactive } from '@motifx/core';
import { Button, Chip, ChipGroup, Stack } from '@motifx-community/ui';

const PEOPLE = ['Ada Lovelace', 'Alan Turing', 'Grace Hopper', 'Edsger Dijkstra'];

/** Removing is yours to do: `onRemove` takes the person out of the list, and the group follows the list. */
export default function Removing() {
  const s = reactive({ people: PEOPLE.map((name) => ({ name })) });

  return (
    <Stack>
      <ChipGroup label="Invited">
        {s.people.map((person) => (
          <Chip
            key={person.name}
            text={person.name}
            avatar={{ name: person.name }}
            removable
            onRemove={() => s.people.splice(s.people.indexOf(person), 1)}
          />
        ))}
      </ChipGroup>
      <Button text="Invite everyone again" variant="outline" onclick={() => s.people.splice(0, s.people.length, ...PEOPLE.map((name) => ({ name })))} />
    </Stack>
  );
}
