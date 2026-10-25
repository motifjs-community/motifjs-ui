import { reactive } from '@motifx/core';
import { TagBox } from '@motifx-community/ui';

/** Typed text that matches no item becomes a tag; `customValue` shapes it or turns it down. */
export default function CustomTags() {
  const issue = reactive({ labels: ['bug'] as string[] });
  return (
    <>
      <TagBox
        label="Labels"
        items={['bug', 'docs', 'feature', 'question']}
        acceptCustomValue
        customValue={(text: string) => (text.length > 1 ? text.toLowerCase() : null)}
        helpText="Type a new label and press Enter."
        x-model={() => issue.labels}
      />
      <output class="tg-labels">{() => `labels: ${JSON.stringify(issue.labels)}`}</output>
    </>
  );
}
