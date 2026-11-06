import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { SkeletonAnimation } from './skeleton-animation';
import type { SkeletonShape } from './skeleton-shape';

/** Props of `Skeleton`. Each prop is also a settable property, and a function is tracked. */
export interface SkeletonProps extends ControlProps {
  /** The default is `'text'`. */
  shape?: Bind<SkeletonShape>;
  /** The number of text lines. The last of several lines is shorter. The default is `1`. */
  lines?: Bind<number>;
  /**
   * A CSS length, or a number in pixels. Also sets the size of a circle. By default, it fills the available
   * width, and a circle uses the size from the design language.
   */
  width?: Bind<string | number | null>;
  /** A CSS length, or a number in pixels. The default is a line of text, or the block height of the design language. */
  height?: Bind<string | number | null>;
  /** The default comes from the design language (`wave` or `pulse`). */
  animation?: Bind<SkeletonAnimation>;
  /** Shows the skeleton while `true`, and then the JSX children. The default is `true`. */
  loading?: Bind<boolean>;
  /** The text announced by screen readers while loading. The default is the kit's "Loading…" string. */
  label?: Bind<string>;
}
