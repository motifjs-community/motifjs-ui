import { Avatar, Stack, type AvatarSize, type AvatarStatus } from '@motifx-community/ui';

const SIZES: AvatarSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];
const STATUSES: AvatarStatus[] = ['online', 'away', 'busy', 'offline'];

/** Each size, with each presence. */
export default function Sizes() {
  return (
    <Stack>
      {STATUSES.map((status) => (
        <Stack key={status} orientation="horizontal" wrap align="center">
          {SIZES.map((size) => (
            <Avatar key={size} name="Grace Hopper" size={size} status={status} />
          ))}
        </Stack>
      ))}
    </Stack>
  );
}
