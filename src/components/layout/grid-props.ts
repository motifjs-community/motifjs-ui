import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { GridFlow } from './grid-flow';
import type { GridJustify } from './grid-justify';
import type { GridTracks } from './grid-tracks';
import type { LayoutAlign } from './layout-align';
import type { LayoutSpace } from './layout-space';

/** Props of `Grid`: the shared `ControlProps` plus its own. Each one is also a settable, reactive property. */
export interface GridProps extends ControlProps {
  /** The rows: `'auto 1fr 120'` (a bare number is pixels, `*` is `1fr`), a list, or a count. Default none: rows are made as needed. */
  rows?: Bind<GridTracks>;
  /** The columns, written like `rows`. Default one column. */
  columns?: Bind<GridTracks>;
  /** The space between rows and columns. Default the `layout.gap` token. */
  gap?: Bind<LayoutSpace>;
  /** The space between rows; wins over `gap`. */
  rowGap?: Bind<LayoutSpace>;
  /** The space between columns; wins over `gap`. */
  columnGap?: Bind<LayoutSpace>;
  /** The space inside the edges, one to four values as in CSS. Default none. */
  padding?: Bind<LayoutSpace>;
  /** The size of rows made as needed (a number is pixels). Default `'auto'`. */
  autoRows?: Bind<number | string>;
  /** The size of columns made as needed (a number is pixels). Default `'auto'`. */
  autoColumns?: Bind<number | string>;
  /** How children without a place fill the grid. Default `'row'`. */
  flow?: Bind<GridFlow>;
  /** Where children sit in their cells, up and down. Default `'stretch'`. */
  align?: Bind<LayoutAlign>;
  /** Where children sit in their cells, along the row. Default `'stretch'`. */
  justify?: Bind<GridJustify>;
  /** Flows inside a line of text, as wide as its content. Default `false`. */
  inline?: Bind<boolean>;
}
