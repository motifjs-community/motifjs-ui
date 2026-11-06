import type { TabRect } from './tab-rect';

/** What `openWindow` is requested to open: the arguments of `window.open`, and the position they describe. */
export interface TabWindowRequest {
  url: string;
  /** The window's name, which is new each time. */
  name: string;
  /** `popup,width=…,height=…,left=…,top=…`. */
  features: string;
  /** The position and size on the screen that `features` describes. */
  rect: TabRect;
}
