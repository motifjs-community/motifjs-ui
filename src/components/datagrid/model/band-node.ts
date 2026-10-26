import type { GridBand } from '../grid-band';

/** A band as the column model keeps it. */
export interface BandNode<T> {
  readonly id: string;
  readonly def: GridBand<T>;
  /** Its columns and bands, by field and id, in the order given. */
  readonly children: string[];
}
