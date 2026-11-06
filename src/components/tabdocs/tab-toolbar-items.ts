import type { ToolbarItem } from '../toolbar/toolbar-item';
import type { TabGroup } from './TabGroup';

/**
 * Application buttons for a group's toolbar, created once per group. Their fields (`visible`,
 * `enabled`…) are tracked.
 */
export type TabToolbarItems = (group: TabGroup) => readonly ToolbarItem[];
