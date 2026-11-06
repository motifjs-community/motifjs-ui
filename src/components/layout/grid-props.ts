import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { GridFlow } from './grid-flow';
import type { GridJustify } from './grid-justify';
import type { GridTracks } from './grid-tracks';
import type { LayoutAlign } from './layout-align';
import type { LayoutSpace } from './layout-space';

/** Props of `Grid`: the shared `ControlProps` plus its own. Each prop is also a settable, reactive property. */
export interface GridProps extends ControlProps {
  /**
   * The rows: `'auto 1fr 120'` (a bare number is in pixels, and `*` is `1fr`), a list, or a count. By default,
   * rows are created as needed.
   */
  rows?: Bind<GridTracks>;
  /** The columns, in the same form as `rows`. The default is one column. */
  columns?: Bind<GridTracks>;
  /** The space between rows and columns. The default is the `layout.gap` token. */
  gap?: Bind<LayoutSpace>;
  /** The space between rows. It takes precedence over `gap`. */
  rowGap?: Bind<LayoutSpace>;
  /** The space between columns. It takes precedence over `gap`. */
  columnGap?: Bind<LayoutSpace>;
  /** The space inside the edges, one to four values as in CSS. There is none by default. */
  padding?: Bind<LayoutSpace>;
  /** The size of rows created as needed. A number is in pixels. The default is `'auto'`. */
  autoRows?: Bind<number | string>;
  /** The size of columns created as needed. A number is in pixels. The default is `'auto'`. */
  autoColumns?: Bind<number | string>;
  /** How children without a position fill the grid. The default is `'row'`. */
  flow?: Bind<GridFlow>;
  /** The vertical alignment of children in their cells. The default is `'stretch'`. */
  align?: Bind<LayoutAlign>;
  /** The horizontal alignment of children in their cells. The default is `'stretch'`. */
  justify?: Bind<GridJustify>;
  /** Flows within a line of text, as wide as its content. The default is `false`. */
  inline?: Bind<boolean>;
}
