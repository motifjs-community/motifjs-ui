import { Grid, Panel } from '@motifx-community/ui';

/** A fixed column and two flexible ones, a fixed row, and a child placed by row and column. */
export default function GridTracks() {
  return (
    <Grid class="layout-tracks" columns="120 * 2*" rows="auto 4rem" gap="xs" style="inline-size: 100%">
      <Panel variant="card" padding="xs">120px</Panel>
      <Panel variant="card" padding="xs">1fr</Panel>
      <Panel variant="card" padding="xs">2fr</Panel>
      <Panel variant="card" padding="xs" column={2} columnSpan={2}>
        row 2, columns 2–3
      </Panel>
    </Grid>
  );
}
