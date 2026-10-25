import { Button, Tooltip } from '@motifx-community/ui';

/** A tooltip with markup after its text, given as JSX children. */
export default function RichContent() {
  let target: Button | null = null;
  return (
    <>
      <Button ref={(b: Button) => (target = b)} text="Rich tooltip" variant="outline" />
      <Tooltip target={() => target}>
        <strong>Bold</strong> makes the selection stand out. <kbd>Ctrl</kbd>+<kbd>B</kbd>
      </Tooltip>
    </>
  );
}
