import { Avatar, AvatarGroup, Stack } from '@motifx-community/ui';

const TEAM = ['Ada Lovelace', 'Alan Turing', 'Grace Hopper', 'Edsger Dijkstra', 'Barbara Liskov'];

/** Stacked with the rest counted, side by side, and a total larger than the avatars given. */
export default function Groups() {
  return (
    <Stack gap="lg">
      <AvatarGroup max={3} label="Team">
        {TEAM.map((name) => (
          <Avatar key={name} name={name} />
        ))}
      </AvatarGroup>
      <AvatarGroup layout="spread" size="sm" label="Team">
        {TEAM.map((name) => (
          <Avatar key={name} name={name} />
        ))}
      </AvatarGroup>
      <AvatarGroup size="lg" total={42} label="Followers">
        {TEAM.slice(0, 3).map((name) => (
          <Avatar key={name} name={name} />
        ))}
      </AvatarGroup>
    </Stack>
  );
}
