import { Chip, Stack, type ControlSize } from '@motifx-community/ui';

const SIZES: ControlSize[] = ['sm', 'md', 'lg'];

/** Each size, plain, with an avatar and removable. */
export default function Sizes() {
  return (
    <Stack>
      {SIZES.map((size) => (
        <Stack key={size} orientation="horizontal" wrap align="center">
          <Chip text={size} size={size} selectable />
          <Chip text="Grace Hopper" size={size} avatar={{ name: 'Grace Hopper' }} removable />
        </Stack>
      ))}
    </Stack>
  );
}
