import type { Bind, ComponentBase } from '@motifx/core';
import type { OverlayPanelProps } from '../../parts/overlay/overlay-panel-props';
import type { DrawerMode } from './drawer-mode';
import type { DrawerSide } from './drawer-side';

/** Props of `Drawer`: the shared `OverlayPanelProps` plus its own. Each one is also a settable, reactive property. */
export interface DrawerProps extends OverlayPanelProps {
  /** The edge it slides in from. Default `'start'`. */
  side?: Bind<DrawerSide>;
  /** Over the content, or pushing it aside. Default `'over'`. */
  mode?: Bind<DrawerMode>;
  /** In `push` mode, what moves aside: an element or a component. Without it, `push` works as `over`. */
  pushTarget?: Bind<HTMLElement | ComponentBase | null>;
  /** Its width (its height from the top or the bottom): pixels or a CSS length; `null` for `drawer.size`. It never takes more than 85% of the room. Default `null`. */
  size?: Bind<number | string | null>;
  /** A finger swiping in from the edge opens it. Default `false`. */
  edgeSwipe?: Bind<boolean>;
  /** How far from the edge, in pixels, that swipe may start. Default `24`. */
  edgeSize?: Bind<number>;
  /** A finger swiping it back towards its edge closes it. Default `true`. */
  swipeToClose?: Bind<boolean>;
  /** How fast a flick opens or closes it however far it went, in pixels per millisecond. Default `0.4`. */
  flickSpeed?: Bind<number>;
}
