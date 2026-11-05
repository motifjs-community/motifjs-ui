import type { Component } from '@motifx/core';
import { Button, Grid, Stack, TextBox } from '@motifx-community/ui';

/** Buttons added to a Stack with `controls.add`, and a Grid built with `new`. */
export default function Programmatic() {
  let added = 0;
  let bar: Stack | null = null;

  const addButton = () => bar?.controls.add(new Button({ text: `Button ${++added}`, variant: 'outline', grow: added % 3 === 0 }));

  const buildProgrammatic = (host: Component<HTMLDivElement>) => {
    const grid = new Grid({ columns: '* *', gap: 'xs' });
    grid.element.classList.add('layout-coded');
    grid.controls.add(
      new TextBox({ label: 'From', stretch: true }),
      new TextBox({ label: 'To', stretch: true }),
      new TextBox({ label: 'Subject', stretch: true, columnSpan: 2 }),
    );
    host.controls.add(grid);
  };

  return (
    <>
      <Stack ref={(c: Stack) => (bar = c)} orientation="horizontal" gap="sm" wrap align="center" style="inline-size: 100%">
        <Button text="Add a button" tone="accent" onclick={addButton} />
      </Stack>
      <div style="inline-size: 100%" ref={(c: Component<HTMLDivElement>) => buildProgrammatic(c)} />
    </>
  );
}
