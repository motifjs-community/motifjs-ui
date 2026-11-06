import type { TooltipProps } from '../tooltip/tooltip-props';

/** Options of an action's tooltip: what a `Tooltip` takes, but its target. */
export type SpeedDialTooltip = Omit<TooltipProps, 'target'>;
