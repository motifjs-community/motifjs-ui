import { Chip, Stack, type ChipVariant } from '@motifx-community/ui';

const VARIANTS: ChipVariant[] = ['filled', 'outline'];

// An inline star, so that the example needs no icon set.
const star = () => (
  <svg viewBox="0 0 16 16">
    <path d="M8 1.5l1.9 4.1 4.4.5-3.3 3 .9 4.4L8 11.3l-3.9 2.2.9-4.4-3.3-3 4.4-.5z" fill="currentColor" />
  </svg>
);

/** Each appearance: at rest, selected, with an icon, with an avatar, removable and disabled. */
export default function Looks() {
  return (
    <Stack>
      {VARIANTS.map((variant) => (
        <Stack key={variant} orientation="horizontal" wrap align="center">
          <Chip text="Rest" variant={variant} clickable />
          <Chip text="Selected" variant={variant} selectable selected />
          <Chip text="Icon" variant={variant} icon={star()} clickable />
          <Chip text="Ada Lovelace" variant={variant} avatar={{ name: 'Ada Lovelace' }} removable />
          <Chip text="Removable" variant={variant} removable />
          <Chip text="Disabled" variant={variant} selectable disabled />
        </Stack>
      ))}
    </Stack>
  );
}
