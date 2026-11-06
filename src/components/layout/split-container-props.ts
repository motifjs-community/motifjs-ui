import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { LayoutOrientation } from './layout-orientation';
import type { SplitPanel } from './split-panel';
import type { SplitPosition } from './split-position';
import type { SplitterMovedEventArgs } from './splitter-moved-event-args';

/** Props of `SplitContainer`: the shared `ControlProps` plus its own. Each prop is also a settable, reactive property. */
export interface SplitContainerProps extends ControlProps {
  /** `'horizontal'` places the panes side by side (the default), and `'vertical'` stacks them. */
  orientation?: Bind<LayoutOrientation>;
  /**
   * The size of the pane that keeps its size (`fixedPanel`, or the first pane with `'none'`), in pixels,
   * as a share (`'30%'`) or as a CSS length. The default is `'50%'`. `x-model` provides two-way binding.
   */
  position?: Bind<SplitPosition>;
  /**
   * The pane that keeps its size when the container is resized. With `'none'`, the default, both panes grow
   * and the position is kept as a share.
   */
  fixedPanel?: Bind<SplitPanel>;
  /** The minimum size of the first pane, in pixels. The default is 0. */
  firstMinSize?: Bind<number>;
  /** The minimum size of the second pane, in pixels. The default is 0. */
  secondMinSize?: Bind<number>;
  /** The hidden pane. The other pane takes all the space. The default is `'none'`. */
  collapsed?: Bind<SplitPanel>;
  /** Lets the pointer and keyboard move the splitter. The default is `true`. */
  resizable?: Bind<boolean>;
  /** Lets Enter and a double-click on the splitter hide and restore the first pane. The default is `true`. */
  collapsible?: Bind<boolean>;
  /** The distance an arrow key moves the splitter, in pixels. The default is 10. */
  step?: Bind<number>;
  /** The accessible name of the splitter. The default is `uiLocale.strings.resize`. */
  splitterLabel?: Bind<string>;
  /** Occurs when the splitter moves, or when a pane is hidden or restored. */
  onSplitterMoved?: (e: SplitterMovedEventArgs) => void;
}
