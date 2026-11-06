import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { ControlSize } from '../../core/control-size';
import type { ProgressTone } from './progress-tone';
import type { SpinnerLabelPosition } from './spinner-label-position';

/** Props of `Spinner`. Each prop is also a settable, reactive property. */
export interface SpinnerProps extends ControlProps {
  /**
   * Text next to the ring. Screen readers announce it, or `uiLocale.strings.loading` without one. This is the same
   * property as `text`.
   */
  label?: Bind<string>;
  /** The default is `'side'`. */
  labelPosition?: Bind<SpinnerLabelPosition>;
  /** The default is `'md'`. */
  size?: Bind<ControlSize>;
  /** The default is `'accent'`. */
  tone?: Bind<ProgressTone>;
  /**
   * Places the spinner in its own container (a disc behind it), where the design language includes one. The default is
   * `false`.
   */
  contained?: Bind<boolean>;
  /** The delay in milliseconds before it appears, so quick operations show nothing. The default is `0`. */
  delay?: Bind<number>;
}
