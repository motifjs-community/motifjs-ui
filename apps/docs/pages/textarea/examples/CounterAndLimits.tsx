import { reactive } from '@motifx/core';
import { TextArea } from '@motifx-community/ui';

/** A limit while typing, a minimum checked on leaving, a counter and a clear button. */
export default function CounterAndLimits() {
  const s = reactive({ bio: '' });
  return <TextArea label="Bio" maxLength={160} minLength={10} showCounter clearButton x-model={() => s.bio} stretch />;
}
