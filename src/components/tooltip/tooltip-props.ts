import type { Bind, ComponentBase } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { PopupPlacement } from '../../parts/popup/popup-placement';
import type { TooltipShowOn } from './tooltip-show-on';
import type { TooltipTarget } from './tooltip-target';

/**
 * Props of `Tooltip`: the shared `ControlProps` (`text` is what it says) plus its own. Each one is
 * also a settable, reactive property.
 */
export interface TooltipProps extends ControlProps {
  /** The element or component it describes. */
  target?: Bind<TooltipTarget | null | undefined>;
  /** Any content, after `text`. Nothing interactive: a tooltip never takes focus. */
  content?: Bind<ComponentBase | null | undefined>;
  /** Default `'top'`. It opens on the other side when there is no room. */
  placement?: Bind<PopupPlacement>;
  /** Milliseconds the pointer rests on the target before it shows. Default 500. */
  delay?: Bind<number>;
  /** Milliseconds it stays after the pointer leaves, so the pointer can move onto it. Default 150. */
  hideDelay?: Bind<number>;
  /** Default `'hover-focus'`. */
  showOn?: Bind<TooltipShowOn>;
  onOpened?: () => void;
  onClosed?: () => void;
}
