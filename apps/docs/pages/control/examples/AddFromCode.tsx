import { Button, Stack } from '@motifx-community/ui';

/** Buttons created with `new`, added to a container, and their text changed from code on a click. */
export default function AddFromCode() {
  let added = 0;
  let target: Stack | null = null;

  const addFromCode = () => {
    const b = new Button({ text: `Button ${++added}` });
    b.motif.on('click', () => (b.text = `${b.text} ✓`));
    target?.controls.add(b);
  };

  return (
    <>
      <Button text="Add a button from code" onclick={addFromCode} />
      <Stack orientation="horizontal" wrap align="center" ref={(c: Stack) => (target = c)} />
    </>
  );
}
