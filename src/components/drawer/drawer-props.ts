import type { Bind, ComponentBase } from '@motifx/core';
import type { OverlayPanelProps } from '../../parts/overlay/overlay-panel-props';
import type { DrawerMode } from './drawer-mode';
import type { DrawerSide } from './drawer-side';

/** Props of `Drawer`: the shared `OverlayPanelProps` plus its own. Each prop is also a settable, reactive property. */
export interface DrawerProps extends OverlayPanelProps {
  /** The edge it slides in from. The default is `'start'`. */
  side?: Bind<DrawerSide>;
  /** Whether it covers the content or pushes it aside. The default is `'over'`. */
  mode?: Bind<DrawerMode>;
  /** In `push` mode, the component that moves aside. Without it, `push` behaves like `over`. */
  pushTarget?: Bind<ComponentBase | null>;
  /**
   * Its width, or its height from the top or bottom, in pixels or as a CSS length. `null` uses `drawer.size`.
   * It never exceeds 85% of the available space. The default is `null`.
   */
  size?: Bind<number | string | null>;
  /** A finger swiping in from the edge opens it. The default is `false`. */
  edgeSwipe?: Bind<boolean>;
  /** The distance from the edge, in pixels, where that swipe can start. The default is `24`. */
  edgeSize?: Bind<number>;
  /** A finger swiping it back toward its edge closes it. The default is `true`. */
  swipeToClose?: Bind<boolean>;
  /** A flick faster than this, in pixels per millisecond, opens or closes it. The default is `0.4`. */
  flickSpeed?: Bind<number>;
}
