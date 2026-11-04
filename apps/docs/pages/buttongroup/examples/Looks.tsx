import { ButtonGroup, Stack, type ButtonSize } from '@motifx-community/ui';

const SIZES: ButtonSize[] = ['sm', 'md', 'lg'];
const ITEMS = ['One', 'Two', { value: 'Three', enabled: false }, 'Four'];

/** Each size; apart instead of touching; filling the width; and one button disabled. */
export default function Looks() {
  return (
    <Stack gap="lg">
      {SIZES.map((size) => (
        <ButtonGroup key={size} label={`Size ${size}`} size={size} items={ITEMS} value="Two" />
      ))}
      <ButtonGroup label="Apart" attached={false} items={ITEMS} value="One" />
      <ButtonGroup label="Stretched" stretch items={['Left', 'Center', 'Right']} value="Center" />
    </Stack>
  );
}
