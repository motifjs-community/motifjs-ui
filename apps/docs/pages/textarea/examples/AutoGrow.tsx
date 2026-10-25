import { reactive } from '@motifx/core';
import { TextArea } from '@motifx-community/ui';

/** A box that grows with the text from two lines to six, then scrolls. */
export default function AutoGrow() {
  const s = reactive({ story: '' });
  return <TextArea label="Story" autoGrow minRows={2} maxRows={6} placeholder="Type a few lines…" x-model={() => s.story} stretch />;
}
