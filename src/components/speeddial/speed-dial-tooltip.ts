import type { TooltipProps } from '../tooltip/tooltip-props';

/** The options of an action's tooltip: the `Tooltip` options, except its target. */
export type SpeedDialTooltip = Omit<TooltipProps, 'target'>;
