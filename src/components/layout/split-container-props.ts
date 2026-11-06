import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { LayoutOrientation } from './layout-orientation';
import type { SplitPanel } from './split-panel';
import type { SplitPosition } from './split-position';
import type { SplitterMovedEventArgs } from './splitter-moved-event-args';

/** Props of `SplitContainer`: the shared `ControlProps` plus its own. Each prop is also a settable, reactive property. */
export interface SplitContainerProps extends ControlProps {
  /** `'horizontal'`: the panes side by side (default); `'vertical'`: one over the other. */
  orientation?: Bind<LayoutOrientation>;
  /**
   * The size of the pane that keeps its size (`fixedPanel`; the first one with `'none'`): pixels,
   * a share (`'30%'`) or a CSS length. Default `'50%'`. `x-model` binds it two-way.
   */
  position?: Bind<SplitPosition>;
  /** The pane that keeps its size when the container is resized. `'none'` (default): both grow, the position is kept as a share. */
  fixedPanel?: Bind<SplitPanel>;
  /** The smallest size of the first pane, in pixels. Default 0. */
  firstMinSize?: Bind<number>;
  /** The smallest size of the second pane, in pixels. Default 0. */
  secondMinSize?: Bind<number>;
  /** A pane that is hidden, the other one taking all the room. Default `'none'`. */
  collapsed?: Bind<SplitPanel>;
  /** The splitter can be moved with the pointer and the keys. Default `true`. */
  resizable?: Bind<boolean>;
  /** Enter and a double click on the splitter hide and restore the first pane. Default `true`. */
  collapsible?: Bind<boolean>;
  /** How far an arrow key moves the splitter, in pixels. Default 10. */
  step?: Bind<number>;
  /** The splitter's accessible name. Default `uiLocale.strings.resize`. */
  splitterLabel?: Bind<string>;
  /** The splitter was moved, or a pane hidden or restored. */
  onSplitterMoved?: (e: SplitterMovedEventArgs) => void;
}
