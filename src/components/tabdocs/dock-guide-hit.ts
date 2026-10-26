import type { TabDockSide } from './tab-dock-side';
import type { TabDropSide } from './tab-drop-side';
import type { TabGroup } from './TabGroup';

/** What a dock guide stands for: a side of a group (or its middle), or a dock area of the manager. */
export type DockGuideHit = { group: TabGroup; side: TabDropSide } | { dock: TabDockSide };
