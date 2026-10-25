import { Button, FocusContainer, Panel, Stack } from '@motifx-community/ui';

/** A container of your own: it runs the Tab order of its controls and remembers the active one. */
class CustomerEditor extends FocusContainer<HTMLDivElement> {}

/** Tab visits the buttons by `tabIndex`; the container reports its `activeControl` and puts focus back with `restoreFocus()`. */
export default function TabOrder() {
  let editor: CustomerEditor | null = null;
  return (
    <>
      <CustomerEditor ref={(c: CustomerEditor) => (editor = c)}>
        <Panel variant="outline" padding="md">
          <Stack orientation="horizontal" wrap align="center">
            <Button text="Third" tabIndex={3} />
            <Button text="First" tabIndex={1} />
            <Button text="Second" tabIndex={2} />
          </Stack>
        </Panel>
      </CustomerEditor>
      <span>
        activeControl: <output class="active-name">{() => editor?.activeControl?.text ?? '—'}</output>
      </span>
      <Button text="restoreFocus()" onclick={() => editor?.restoreFocus()} />
    </>
  );
}
