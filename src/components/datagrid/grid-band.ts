import type { Bind } from '@motifx/core';
import type { BandCellContext } from './band-cell-context';
import type { GridColumn } from './grid-column';
import type { StickySide } from './sticky-side';

/**
 * A band: one header over several columns (band column). It holds no data; its
 * `columns`, columns and bands to any depth, show under its caption. A band is pinned, moved and
 * hidden as a whole, and its columns move only inside it; hiding all of them hides it too. Give it
 * flat instead with `isBand`, its columns naming it in their `ownerBand`. `movable`, `hideable`,
 * `pinnable` and `menu` override the grid's `settings` for the band.
 *
 * @example
 * { title: 'Contact', columns: [{ field: 'email', title: 'Email' }, { field: 'phone', title: 'Phone' }] }
 */
export interface GridBand<T = any> {
  /** The band's identity in layouts, `columnOption`, `columnSettings` and the events. Default: `band-` and its place among the columns (`band-2`, `band-2-0`). */
  name?: string;
  /** Header text. */
  title: Bind<string>;
  /** The columns and bands under it, in order. */
  columns?: readonly (GridColumn<T> | GridBand<T>)[];
  /** A band given flat in the grid's columns (`isBand`): the columns that name it in `ownerBand` go under it. */
  isBand?: boolean;
  /** The band this one sits in: its `name`, or its place in the grid's `columns`. */
  ownerBand?: string | number;
  /** Content of your own in the band's header instead of its title text, made once; read `ctx` in getters. The title stays its accessible name. */
  headerCell?: (ctx: BandCellContext<T>) => unknown;
  /** Where the caption sits. Default: the grid's `bandAlign` setting (`'center'`). */
  align?: Bind<'start' | 'center' | 'end'>;
  /** Keep the band, all its columns, at the start or end edge while scrolling sideways. */
  sticky?: StickySide;
  /** Start hidden, with all its columns. */
  hidden?: boolean;
  movable?: Bind<boolean>;
  hideable?: Bind<boolean>;
  pinnable?: Bind<boolean>;
  menu?: Bind<boolean>;
}
