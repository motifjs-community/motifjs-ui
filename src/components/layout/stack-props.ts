import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { LayoutAlign } from './layout-align';
import type { LayoutOrientation } from './layout-orientation';
import type { LayoutSpace } from './layout-space';
import type { StackJustify } from './stack-justify';

/** Props of `Stack`: the shared `ControlProps` plus its own. Each one is also a settable, reactive property. */
export interface StackProps extends ControlProps {
  /** Default `'vertical'`. */
  orientation?: Bind<LayoutOrientation>;
  /** The space between the children. Default the `layout.gap` token. */
  gap?: Bind<LayoutSpace>;
  /** The space inside the edges, one to four values as in CSS. Default none. */
  padding?: Bind<LayoutSpace>;
  /** Across the direction. Default `'stretch'`. */
  align?: Bind<LayoutAlign>;
  /** Along the direction. Default `'start'`. */
  justify?: Bind<StackJustify>;
  /** Children that do not fit go on to a new line. Default `false`. */
  wrap?: Bind<boolean>;
  /** The children are laid out from the other end. Default `false`. */
  reverse?: Bind<boolean>;
  /** Flows inside a line of text, as wide as its children. Default `false`. */
  inline?: Bind<boolean>;
}
