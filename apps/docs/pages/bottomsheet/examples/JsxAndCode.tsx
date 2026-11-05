import { reactive } from '@motifx/core';
import { BottomSheet, Button, Stack, TextBox } from '@motifx-community/ui';

/** A sheet written in JSX and bound to state, and one made in code and shown, both over the whole page. */
export default function JsxAndCode() {
  const s = reactive({ open: false, name: 'Ada', said: '' });

  const share = () => {
    const sheet = new BottomSheet({
      title: 'Share',
      detent: 'fit',
      detents: ['fit', 'full'],
      content: (
        <Stack gap="sm">
          <p>Anyone with the link can see the report.</p>
          <Button text="Copy the link" variant="outline" onclick={() => sheet.close()} />
        </Stack>
      ),
      onClosed: (e) => (s.said = `The code sheet closed (${e.reason}).`),
    });
    // show() puts it in the page and disposes it when it closes.
    sheet.show(host);
  };
  let host!: Stack;

  return (
    <Stack ref={(c: Stack) => (host = c)} gap="sm">
      <Stack orientation="horizontal" wrap align="center">
        <Button text="Edit the name" variant="outline" onclick={() => (s.open = true)} />
        <Button text="Share (programmatically)" variant="outline" onclick={share} />
        <output>{() => s.said || `Name: ${s.name}`}</output>
      </Stack>
      <BottomSheet title="Your name" showClose detents={['half', 'full']} x-model={() => s.open}>
        <TextBox label="Name" x-model={() => s.name} />
      </BottomSheet>
    </Stack>
  );
}
