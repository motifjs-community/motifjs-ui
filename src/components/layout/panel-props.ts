import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { LayoutSpace } from './layout-space';
import type { PanelScroll } from './panel-scroll';
import type { PanelVariant } from './panel-variant';

/**
 * Props of `Panel`: the shared `ControlProps` plus its own. Each one is also a settable,
 * reactive property. `text` names the panel: it becomes a region landmark with that name.
 */
export interface PanelProps extends ControlProps {
  /** Scrolls its content; a scrolling panel is a Tab stop, so the keys scroll it. Default `false`. */
  scrollable?: Bind<PanelScroll>;
  /** The space inside the edges, one to four values as in CSS. Default none. */
  padding?: Bind<LayoutSpace>;
  /** Default `'plain'`. */
  variant?: Bind<PanelVariant>;
}
