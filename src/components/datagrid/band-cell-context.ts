import type { GridBand } from './grid-band';

/** What a band's `headerCell` content gets: read its fields inside getters. */
export interface BandCellContext<T> {
  readonly band: GridBand<T>;
  /** The title, as `title` gives it now. */
  readonly title: string;
}
