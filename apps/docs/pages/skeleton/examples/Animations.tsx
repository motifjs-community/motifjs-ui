import { Skeleton, Stack, type SkeletonAnimation } from '@motifx-community/ui';

const ANIMATIONS: SkeletonAnimation[] = ['wave', 'pulse', 'none'];

/** Each way it moves; reduced motion keeps them all still. */
export default function Animations() {
  return (
    <Stack gap="lg" style="inline-size: 24rem; max-inline-size: 100%">
      {ANIMATIONS.map((animation) => (
        <Stack key={animation} gap="sm">
          <span>{animation}</span>
          <Skeleton lines={2} animation={animation} />
        </Stack>
      ))}
    </Stack>
  );
}
