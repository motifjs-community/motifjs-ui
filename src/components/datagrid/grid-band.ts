import type { Bind } from '@motifx/core';
import type { BandCellContext } from './band-cell-context';
import type { GridColumn } from './grid-column';
import type { StickySide } from './sticky-side';

/**
 * A band: one header over several columns. It holds no data, and its `columns`, which are columns and
 * bands to any depth, appear below its caption. A band is pinned, moved and hidden as a whole, its
 * columns move only inside it, and hiding all of them hides it too. To define it in a flat list, use
 * `isBand`, with its columns naming it in their `ownerBand`. `movable`, `hideable`, `pinnable` and
 * `menu` override the grid's `settings` for the band.
 *
 * @example
 * { title: 'Contact', columns: [{ field: 'email', title: 'Email' }, { field: 'phone', title: 'Phone' }] }
 */
export interface GridBand<T = any> {
  /**
   * The band's identity in layouts, `columnOption`, `columnSettings` and the events. The default is
   * `band-` and its position among the columns (`band-2`, `band-2-0`).
   */
  name?: string;
  /** The header text. */
  title: Bind<string>;
  /** The columns and bands below it, in order. */
  columns?: readonly (GridColumn<T> | GridBand<T>)[];
  /** Marks a band in a flat list of columns. The columns that name it in `ownerBand` appear below it. */
  isBand?: boolean;
  /** The parent band: its `name`, or its position in the grid's `columns`. */
  ownerBand?: string | number;
  /**
   * Custom content in the band's header in place of its title text, created once. Read `ctx` in getters.
   * The title stays its accessible name.
   */
  headerCell?: (ctx: BandCellContext<T>) => unknown;
  /** Where the caption appears. The default is the grid's `bandAlign` setting (`'center'`). */
  align?: Bind<'start' | 'center' | 'end'>;
  /** Pins the band, with all its columns, to the start or end edge during horizontal scrolling. */
  sticky?: StickySide;
  /** Starts hidden, with all its columns. */
  hidden?: boolean;
  movable?: Bind<boolean>;
  hideable?: Bind<boolean>;
  pinnable?: Bind<boolean>;
  menu?: Bind<boolean>;
}
