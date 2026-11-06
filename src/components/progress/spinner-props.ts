import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { ControlSize } from '../../core/control-size';
import type { ProgressTone } from './progress-tone';
import type { SpinnerLabelPosition } from './spinner-label-position';

/** Props of `Spinner`. Each prop is also a settable, reactive property. */
export interface SpinnerProps extends ControlProps {
  /** Text next to the ring. Screen readers get it, or `uiLocale.strings.loading` without one. The same as `text`. */
  label?: Bind<string>;
  /** Default `'side'`. */
  labelPosition?: Bind<SpinnerLabelPosition>;
  /** Default `'md'`. */
  size?: Bind<ControlSize>;
  /** Default `'accent'`. */
  tone?: Bind<ProgressTone>;
  /** Drawn inside a container of its own (a disc behind it), where the design language has one. Default `false`. */
  contained?: Bind<boolean>;
  /** Milliseconds before it shows, so quick work does not flash it. Default `0`. */
  delay?: Bind<number>;
}
