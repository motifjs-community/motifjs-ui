import { reactive } from '@motifx/core';
import { Button, Tooltip } from '@motifx-community/ui';

/** A tooltip opened only from code, and one shown on keyboard focus while a toggle allows it. */
export default function ShowOn() {
  const s = reactive({ on: true });
  let help: Button | null = null;
  let tip: Tooltip | null = null;
  let keyboardOnly: Button | null = null;
  return (
    <>
      <Button ref={(b: Button) => (help = b)} text="Help" variant="outline" />
      <Tooltip ref={(t: Tooltip) => (tip = t)} target={() => help} text="Shown from code" showOn="manual" placement="bottom" />
      <Button text={() => (tip?.opened ? 'Hide it' : 'Show it')} onclick={() => tip && (tip.opened = !tip.opened)} />
      <Button text={() => (s.on ? 'Tooltips on' : 'Tooltips off')} toggle x-model={() => s.on} variant="ghost" />
      <Button ref={(b: Button) => (keyboardOnly = b)} text="Keyboard only" variant="outline" />
      <Tooltip target={() => keyboardOnly} text="Shown on keyboard focus, while the toggle is on" enabled={() => s.on} showOn="focus" />
    </>
  );
}
