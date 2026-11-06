import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { ControlSize } from '../../core/control-size';
import type { ProgressLabelPosition } from './progress-label-position';
import type { ProgressShape } from './progress-shape';
import type { ProgressTone } from './progress-tone';

/** Props of `ProgressBar`. Each prop is also a settable, reactive property. */
export interface ProgressBarProps extends ControlProps {
  /** The progress. Use `null` (the default) when it is unknown: the bar shows continuous motion and a circle rotates. */
  value?: Bind<number | null>;
  /** The default is `0`. */
  min?: Bind<number>;
  /** The default is `100`. */
  max?: Bind<number>;
  /** A label that names the bar. This is the same property as `text`. */
  label?: Bind<string>;
  /** `line` (the default) or `circle`. */
  shape?: Bind<ProgressShape>;
  /** The default is `'top'`, or `'bottom'` for a circle. */
  labelPosition?: Bind<ProgressLabelPosition>;
  /** Shows the percentage next to the label. */
  showValue?: Bind<boolean>;
  /** The default is the page's `lang`. */
  locale?: Bind<string>;
  /** The default is `'accent'`. */
  tone?: Bind<ProgressTone>;
  /** The thickness, and the size of a circle. The default is `'md'`. */
  size?: Bind<ControlSize>;
  /** Stretches to the full width of its container. */
  stretch?: Bind<boolean>;
  /**
   * The text shown and announced for a value, such as `(v) => v + ' of 12 files'`. Because it is a function, it is
   * stored as is and not bound.
   */
  valueText?: (value: number, fraction: number) => string;
}
