import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { ControlSize } from '../../core/control-size';
import type { ProgressLabelPosition } from './progress-label-position';
import type { ProgressShape } from './progress-shape';
import type { ProgressTone } from './progress-tone';

/** Props of `ProgressBar`. Each one is also a settable, reactive property. */
export interface ProgressBarProps extends ControlProps {
  /** How far the work is; `null` (the default) when that is not known: the bar then runs to and fro, a circle turns. */
  value?: Bind<number | null>;
  /** Default `0`. */
  min?: Bind<number>;
  /** Default `100`. */
  max?: Bind<number>;
  /** A caption; it names the bar for screen readers. The same as `text`. */
  label?: Bind<string>;
  /** A line (the default) or a circle. */
  shape?: Bind<ProgressShape>;
  /** Default `'top'` (`'bottom'` for a circle). */
  labelPosition?: Bind<ProgressLabelPosition>;
  /** Writes the percent next to the label. */
  showValue?: Bind<boolean>;
  /** Default: the page's `lang`. */
  locale?: Bind<string>;
  /** Default `'accent'`. */
  tone?: Bind<ProgressTone>;
  /** The thickness, and a circle's size. Default `'md'`. */
  size?: Bind<ControlSize>;
  /** Fills the width of what it sits in. */
  stretch?: Bind<boolean>;
  /** The text for a value, shown and read out, e.g. `(v) => v + ' of 12 files'`. A function, so it is not bound like the other props. */
  valueText?: (value: number, fraction: number) => string;
}
