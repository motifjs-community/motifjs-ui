import { Button, Stack } from '@motifx-community/ui';

/** Buttons created with `new`, added to a container, and their text changed programmatically on a click. */
export default function AddProgrammatically() {
  let added = 0;
  let target: Stack | null = null;

  const addProgrammatic = () => {
    const b = new Button({ text: `Button ${++added}` });
    b.motif.on('click', () => (b.text = `${b.text} ✓`));
    target?.controls.add(b);
  };

  return (
    <>
      <Button text="Add a button programmatically" onclick={addProgrammatic} />
      <Stack orientation="horizontal" wrap align="center" ref={(c: Stack) => (target = c)} />
    </>
  );
}
