import { reactive } from '@motifx/core';
import { Button, Grid, Stack, TextBox } from '@motifx-community/ui';

/** A form on a Grid whose column count follows state; Street and the buttons span columns. */
export default function GridForm() {
  const s = reactive({ columns: 2 });
  return (
    <>
      <Stack orientation="horizontal" wrap align="center" role="group" aria-label="Columns">
        {[1, 2, 3].map((n) => (
          <Button key={n} text={`${n} column${n > 1 ? 's' : ''}`} size="sm" variant={() => (s.columns === n ? 'solid' : 'ghost')} aria-pressed={() => s.columns === n} onclick={() => (s.columns = n)} />
        ))}
      </Stack>
      <Grid class="layout-form" columns={() => s.columns} gap="sm" align="end" style="inline-size: 100%">
        <TextBox label="First name" stretch />
        <TextBox label="Last name" stretch />
        <TextBox label="Street" stretch column={1} columnSpan={() => Math.min(2, s.columns)} />
        <TextBox label="City" stretch />
        <TextBox label="Postal code" stretch />
        <Stack orientation="horizontal" justify="end" gap="xs" column="1" columnSpan={() => s.columns}>
          <Button text="Cancel" variant="ghost" />
          <Button text="Save" tone="accent" />
        </Stack>
      </Grid>
    </>
  );
}
