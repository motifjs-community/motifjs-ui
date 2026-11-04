import { Skeleton, Stack } from '@motifx-community/ui';

/** Lines of text (the last of several is shorter), a block, and a circle. Lines and blocks take the width they are given. */
export default function Shapes() {
  return (
    <Stack gap="lg" style="inline-size: 24rem; max-inline-size: 100%">
      <Skeleton lines={3} />
      <Skeleton shape="rect" height={96} />
      <Stack orientation="horizontal" align="center">
        <Skeleton shape="circle" />
        <Skeleton shape="circle" width={24} />
      </Stack>
    </Stack>
  );
}
