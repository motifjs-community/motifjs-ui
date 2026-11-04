import { Avatar, Stack, type AvatarShape, type AvatarTone } from '@motifx-community/ui';

const TONES: AvatarTone[] = ['standard', 'accent', 'info', 'success', 'caution', 'danger'];
const SHAPES: AvatarShape[] = ['circle', 'square'];
const PEOPLE = ['Ada Lovelace', 'Alan Turing', 'Grace Hopper', 'Edsger Dijkstra', 'Barbara Liskov', 'Linus Torvalds'];

/** Every tone in each shape; `auto` takes a tone from the name, the same for the same name. */
export default function Tones() {
  return (
    <Stack>
      {SHAPES.map((shape) => (
        <Stack key={shape} orientation="horizontal" wrap align="center">
          {TONES.map((tone) => (
            <Avatar key={tone} name={tone} tone={tone} shape={shape} label={`${tone}, ${shape}`} />
          ))}
        </Stack>
      ))}
      <Stack orientation="horizontal" wrap align="center">
        {PEOPLE.map((name) => (
          <Avatar key={name} name={name} tone="auto" />
        ))}
      </Stack>
    </Stack>
  );
}
