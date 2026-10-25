import { reactive } from '@motifx/core';
import { Button, Grid, GroupBox, TextBox } from '@motifx-community/ui';

/** A group with an access key that is enabled from state, and one that opens and closes. */
export default function GroupBoxes() {
  const s = reactive({ editing: true });
  return (
    <>
      <Button text="Enabled" size="sm" variant="outline" toggle x-model={() => s.editing} />
      <Grid columns="* *" gap="md" style="inline-size: 100%" align="start">
        <GroupBox title="&Address" enabled={() => s.editing}>
          <TextBox label="Street" stretch />
          <TextBox label="City" stretch />
        </GroupBox>
        <GroupBox title="More &options" collapsible collapsed>
          <TextBox label="Coupon" stretch />
          <TextBox label="Gift note" stretch />
        </GroupBox>
      </Grid>
    </>
  );
}
