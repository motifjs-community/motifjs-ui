import type { GridBand } from './grid-band';

/** The context a band's `headerCell` content receives. Read its fields inside getters. */
export interface BandCellContext<T> {
  readonly band: GridBand<T>;
  /** The current value of `title`. */
  readonly title: string;
}
