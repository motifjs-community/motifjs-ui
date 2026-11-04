import { reactive } from '@motifx/core';
import { Avatar, Button, Card, Skeleton, Stack } from '@motifx-community/ui';

/** While `loading`, the shape of the card shows; then the card itself, in the same place. */
export default function Loading() {
  const s = reactive({ loading: true });

  return (
    <Stack gap="lg" style="inline-size: 22rem; max-inline-size: 100%">
      <Button text={() => (s.loading ? 'Finish loading' : 'Load again')} variant="outline" onclick={() => (s.loading = !s.loading)} />
      <Card>
        <Stack orientation="horizontal" align="center">
          <Skeleton shape="circle" loading={() => s.loading}>
            <Avatar name="Grace Hopper" />
          </Skeleton>
          <Skeleton lines={2} loading={() => s.loading} grow>
            <strong>Grace Hopper</strong>
            <div>Wrote the first compiler.</div>
          </Skeleton>
        </Stack>
      </Card>
    </Stack>
  );
}
