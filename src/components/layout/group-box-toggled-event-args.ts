import type { GroupBox } from './GroupBox';

export interface GroupBoxToggledEventArgs {
  collapsed: boolean;
  /** `true` when the user expanded or collapsed it, `false` when code did. */
  byUser: boolean;
  source: GroupBox;
}
