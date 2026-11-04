import { Badge, Stack, type ControlSize } from '@motifx-community/ui';

const SIZES: ControlSize[] = ['sm', 'md', 'lg'];

/** A badge and a dot in each size. */
export default function Sizes() {
  return (
    <>
      {SIZES.map((size) => (
        <Stack key={size} orientation="horizontal" align="center">
          <Badge text={size} size={size} />
          <Badge count={42} size={size} variant="subtle" />
          <Badge dot size={size} />
        </Stack>
      ))}
    </>
  );
}
