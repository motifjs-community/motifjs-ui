import type { GroupBox } from './GroupBox';

export interface GroupBoxToggledEventArgs {
  collapsed: boolean;
  /** `true` when the user opened or closed it, `false` when code did. */
  byUser: boolean;
  source: GroupBox;
}
