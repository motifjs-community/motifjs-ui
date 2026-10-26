import type { TabRect } from './tab-rect';

/** What `openWindow` is asked to open: the arguments of `window.open`, and the place they say. */
export interface TabWindowRequest {
  url: string;
  /** The window's name: a new one each time. */
  name: string;
  /** `popup,width=…,height=…,left=…,top=…`. */
  features: string;
  /** The place and size on the screen `features` says. */
  rect: TabRect;
}
