import { Breadcrumb, Stack, type ControlSize } from '@motifx-community/ui';

const SIZES: ControlSize[] = ['sm', 'md', 'lg'];

/** Each size, with a disabled step. */
export default function Sizes() {
  return (
    <Stack gap="lg">
      {SIZES.map((size) => (
        <Breadcrumb key={size} label={`Path ${size}`} size={size} items={['Home', { text: 'Archived', enabled: false }, 'Reports', `Size ${size}`]} />
      ))}
    </Stack>
  );
}
