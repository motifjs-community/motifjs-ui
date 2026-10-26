import type { ToolbarItem } from '../toolbar/toolbar-item';
import type { TabGroup } from './TabGroup';

/** The app's own buttons for a group's toolbar, made once for each group; their fields (`visible`, `enabled`…) follow the app. */
export type TabToolbarItems = (group: TabGroup) => readonly ToolbarItem[];
