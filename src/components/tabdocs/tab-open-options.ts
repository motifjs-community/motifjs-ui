import type { TabGroup } from './TabGroup';

/** Where and how `open` puts a document. */
export interface TabOpenOptions {
  /** Default: the active group. */
  group?: TabGroup;
  /** Default: as the manager's `openPosition` says. */
  index?: number;
  /** Make it the active tab. Default `true`. */
  active?: boolean;
  /** Move focus to it as well. Default `false`. */
  focus?: boolean;
}
