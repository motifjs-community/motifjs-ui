import type { TabGroup } from './TabGroup';

/** Where and how `open` puts a document. */
export interface TabOpenOptions {
  /** Default: the active group (never a locked one). */
  group?: TabGroup;
  /** Default: as the manager's `openPosition` says. */
  index?: number;
  /** Make it the active tab. Default `true`. */
  active?: boolean;
  /** Move focus to it as well. Default `false`. */
  focus?: boolean;
  /** Open it as a preview tab, which the next preview replaces (when `previewTabs` is on). `false` keeps a preview tab open. */
  preview?: boolean;
  /** Open it pinned. */
  pinned?: boolean;
}
