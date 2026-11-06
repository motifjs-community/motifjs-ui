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
  /** Scrolls its content. A scrolling panel is a Tab stop, so the keyboard can scroll it. The default is `false`. */
  scrollable?: Bind<PanelScroll>;
  /** The space inside the edges, one to four values as in CSS. There is none by default. */
  padding?: Bind<LayoutSpace>;
  /** The appearance of the panel. The default is `'plain'`. */
  variant?: Bind<PanelVariant>;
}
