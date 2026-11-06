import { reactive } from '@motifx/core';
import { Button, Stack } from '@motifx-community/ui';

/** A button in JSX, and buttons created with `new`, added and bound programmatically. */
export default function Programmatic() {
  let added = 0;
  let toolbar: Stack | null = null;

  const addProgrammatic = () => {
    const n = ++added;
    const state = reactive({ marks: '' });
    const b = new Button({ variant: 'outline' });
    b.text = () => `Button ${n}${state.marks}`; // a function is tracked
    b.motif.on('click', () => (state.marks += ' ✓'));
    toolbar?.controls.add(b);
  };

  return (
    <>
      <Button text="Add a button programmatically" onclick={addProgrammatic} />
      <Stack orientation="horizontal" wrap align="center" ref={(c: Stack) => (toolbar = c)} />
    </>
  );
}
