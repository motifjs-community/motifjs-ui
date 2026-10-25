import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { ControlSize } from '../../core/control-size';
import type { ProgressTone } from './progress-tone';
import type { SpinnerLabelPosition } from './spinner-label-position';

/** Props of `Spinner`. Each one is also a settable, reactive property. */
export interface SpinnerProps extends ControlProps {
  /** Text next to the ring. Screen readers get it, or `uiLocale.strings.loading` without one. The same as `text`. */
  label?: Bind<string>;
  /** Default `'side'`. */
  labelPosition?: Bind<SpinnerLabelPosition>;
  /** Default `'md'`. */
  size?: Bind<ControlSize>;
  /** Default `'accent'`. */
  tone?: Bind<ProgressTone>;
  /** Milliseconds before it shows, so quick work does not flash it. Default `0`. */
  delay?: Bind<number>;
}
