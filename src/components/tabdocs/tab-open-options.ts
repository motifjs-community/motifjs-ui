import type { TabGroup } from './TabGroup';

/** Where and how `open` places a document. */
export interface TabOpenOptions {
  /** The group. The default is the active group, never a locked one. */
  group?: TabGroup;
  /** The position in the strip. By default, the manager's `openPosition` determines it. */
  index?: number;
  /** Makes it the active tab. The default is `true`. */
  active?: boolean;
  /** Moves focus to it as well. The default is `false`. */
  focus?: boolean;
  /**
   * Opens it as a preview tab, which the next preview replaces, when `previewTabs` is on. `false` keeps
   * a preview tab open.
   */
  preview?: boolean;
  /** Opens it pinned. */
  pinned?: boolean;
}
