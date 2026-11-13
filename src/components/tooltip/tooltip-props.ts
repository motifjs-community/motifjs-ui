import type { Bind, ComponentBase } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { PopupPlacement } from '../../parts/popup/popup-placement';
import type { TooltipShowOn } from './tooltip-show-on';
import type { TooltipTarget } from './tooltip-target';

/**
 * Props of `Tooltip`: the shared `ControlProps` (`text` is the tooltip text) in addition to its own. Each prop
 * is also a settable, reactive property.
 */
export interface TooltipProps extends ControlProps {
  /** The component it describes. */
  target?: Bind<TooltipTarget | null | undefined>;
  /** Any content after `text`. Do not include interactive content, because a tooltip never takes focus. */
  content?: Bind<ComponentBase | null | undefined>;
  /** The default is `'top'`. It opens on the opposite side if there is no room. */
  placement?: Bind<PopupPlacement>;
  /** The time in milliseconds the pointer must rest on the target before the tooltip appears. The default is 500. */
  delay?: Bind<number>;
  /** The time in milliseconds it stays after the pointer leaves, so the pointer can move onto it. The default is 150. */
  hideDelay?: Bind<number>;
  /** The default is `'hover-focus'`. */
  showOn?: Bind<TooltipShowOn>;
  onOpened?: () => void;
  onClosed?: () => void;
}
