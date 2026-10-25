import type { SplitContainer } from './SplitContainer';
import type { SplitPanel } from './split-panel';
import type { SplitPosition } from './split-position';

export interface SplitterMovedEventArgs {
  position: SplitPosition;
  collapsed: SplitPanel;
  /** `true` when the user moved it (pointer or keys), `false` when code did. */
  byUser: boolean;
  source: SplitContainer;
}
