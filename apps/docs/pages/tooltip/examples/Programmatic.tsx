import { Button, Tooltip } from '@motifx-community/ui';

/** A tooltip from JSX pointed at its target, and one created with `new` and opened programmatically. */
export default function Programmatic() {
  let save: Button | null = null;
  let target: Button | null = null;
  let tip: Tooltip | null = null;
  let opened = 0;

  const openProgrammatic = () => {
    if (!target) return;
    if (!tip) {
      tip = new Tooltip({ target });
      tip.placement = 'end';
    }
    tip.text = `Made programmatically, opened ${++opened} time(s)`;
    tip.open();
  };

  return (
    <>
      <Button ref={(b: Button) => (save = b)} text="Save" tone="accent" />
      <Tooltip target={() => save} text="Save the file (Ctrl+S)" />
      <Button ref={(b: Button) => (target = b)} text="Target" variant="outline" />
      <Button text="Open a tooltip programmatically" variant="outline" onclick={openProgrammatic} />
    </>
  );
}
