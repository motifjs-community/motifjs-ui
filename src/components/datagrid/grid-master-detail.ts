import type { Bind } from '@motifx/core';
import type { DetailContext } from './detail-context';

/**
 * Details under the rows: a row opens to show what `template` makes for it (another grid, a form,
 * tabs), in a row of its own across the grid. Every field but `template`, `canExpand` and `height`
 * as a function of the row is a value or a tracked function. Read and change it later
 * through `grid.masterDetail`.
 */
export interface GridMasterDetail<T> {
  /** The expand column: the user opens and closes the details. Off, they open programmatically only (`expandRow`). Default `false`. */
  enabled?: Bind<boolean>;
  /** Every row starts open. Changing it, `enabled` or `template` opens or closes them all again. Default `false`. */
  autoExpandAll?: Bind<boolean>;
  /** What a row's details hold: a component, an element or a text. Made the first time the details show. */
  template?: (ctx: DetailContext<T>) => unknown;
  /** Whether a row has details: a value, or a function of the row. Default `true`. */
  canExpand?: Bind<boolean> | ((row: T) => boolean);
  /** A closed row keeps what its details hold, and shows it as it was when it opens again; off, closing disposes it. Default `true`. */
  keepDetails?: Bind<boolean>;
  /**
   * Paged grid: the details of the rows of the page left keep what they hold while the user pages, up to `keepLimit`;
   * off, another page or page size disposes them, and they are recreated when their page shows (a row stays open).
   * Default `false`.
   */
  keepAcrossPages?: Bind<boolean>;
  /** Height of the details in pixels, the content scrolling inside; a function of the row gives each row its own. Default: as tall as the content. */
  height?: Bind<number | undefined> | ((row: T) => number);
  /** Height details count at before they are drawn and measured, while none is; then the average of those measured. Default `200`. */
  estimatedHeight?: Bind<number>;
  /** Open details out of view that keep their content; past it, the ones seen longest ago are disposed and recreated when they show. Default `100`. */
  keepLimit?: Bind<number>;
  /** Width of the expand column, in pixels. Default `36`. */
  columnWidth?: Bind<number>;
  /** Keys on the expand cell that open and close the details (`KeyboardEvent.key` values). Default `['Enter', ' ']`. */
  toggleKeys?: Bind<readonly string[]>;
  /** Right on the expand cell of a closed row opens it, Left on an open one closes it; otherwise they move. Default `true`. */
  arrowKeys?: Bind<boolean>;
}
