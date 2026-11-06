import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { LayoutAlign } from './layout-align';
import type { LayoutOrientation } from './layout-orientation';
import type { LayoutSpace } from './layout-space';
import type { StackJustify } from './stack-justify';

/** Props of `Stack`: the shared `ControlProps` plus its own. Each prop is also a settable, reactive property. */
export interface StackProps extends ControlProps {
  /** The direction of the children. The default is `'vertical'`. */
  orientation?: Bind<LayoutOrientation>;
  /** The space between the children. The default is the `layout.gap` token. */
  gap?: Bind<LayoutSpace>;
  /** The space inside the edges, one to four values as in CSS. There is none by default. */
  padding?: Bind<LayoutSpace>;
  /** The alignment across the direction. The default is `'stretch'`. */
  align?: Bind<LayoutAlign>;
  /** The alignment along the direction. The default is `'start'`. */
  justify?: Bind<StackJustify>;
  /** Moves children that do not fit to a new line. The default is `false`. */
  wrap?: Bind<boolean>;
  /** Lays out the children from the opposite end. The default is `false`. */
  reverse?: Bind<boolean>;
  /** Flows within a line of text, as wide as its children. The default is `false`. */
  inline?: Bind<boolean>;
}
