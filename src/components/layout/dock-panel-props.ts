import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { LayoutSpace } from './layout-space';

/** Props of `DockPanel`: the shared `ControlProps` plus its own. Each prop is also a settable, reactive property. */
export interface DockPanelProps extends ControlProps {
  /** The space between docked children and what they dock against. There is none by default. */
  gap?: Bind<LayoutSpace>;
  /** The space inside the edges, one to four values as in CSS. There is none by default. */
  padding?: Bind<LayoutSpace>;
}
