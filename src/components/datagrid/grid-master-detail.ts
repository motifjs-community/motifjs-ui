import type { Bind } from '@motifx/core';
import type { DetailContext } from './detail-context';

/**
 * Details below the rows: a row opens to display what `template` creates for it (another grid, a form,
 * tabs), in a separate row across the grid. Every field except `template`, `canExpand` and `height` as
 * a function of the row is a value or a tracked function. Read and change it later through
 * `grid.masterDetail`.
 */
export interface GridMasterDetail<T> {
  /**
   * Shows the expand column, where the user opens and closes the details. Otherwise, they open only
   * programmatically (`expandRow`). The default is `false`.
   */
  enabled?: Bind<boolean>;
  /** Every row starts open. Changing it, `enabled` or `template` reopens or closes them all. The default is `false`. */
  autoExpandAll?: Bind<boolean>;
  /** The content of a row's details: a component or text, created the first time they appear. */
  template?: (ctx: DetailContext<T>) => unknown;
  /** Indicates whether a row has details: a value, or a function of the row. The default is `true`. */
  canExpand?: Bind<boolean> | ((row: T) => boolean);
  /**
   * A closed row keeps its details and displays them unchanged when it reopens. Otherwise, closing
   * disposes them. The default is `true`.
   */
  keepDetails?: Bind<boolean>;
  /**
   * In a paged grid, the details of the rows of the previous page are kept while the user pages, up to
   * `keepLimit`. Otherwise, another page or page size disposes them, and they are recreated when their
   * page appears (a row stays open). The default is `false`.
   */
  keepAcrossPages?: Bind<boolean>;
  /**
   * The height of the details in pixels, with the content scrolling inside. A function of the row sets
   * each row's height. By default, as tall as the content.
   */
  height?: Bind<number | undefined> | ((row: T) => number);
  /**
   * The assumed height of details before they are rendered and measured, while none has been. After
   * that, the average of those measured applies. The default is `200`.
   */
  estimatedHeight?: Bind<number>;
  /**
   * The open details out of view that keep their content. Past this limit, those seen longest ago are
   * disposed, and recreated when they appear. The default is `100`.
   */
  keepLimit?: Bind<number>;
  /** The width of the expand column, in pixels. The default is `36`. */
  columnWidth?: Bind<number>;
  /** Keys on the expand cell that open and close the details (`KeyboardEvent.key` values). The default is `['Enter', ' ']`. */
  toggleKeys?: Bind<readonly string[]>;
  /** Right on the expand cell of a closed row opens it, and Left on an open row closes it. The default is `true`. */
  arrowKeys?: Bind<boolean>;
}
