import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { SkeletonAnimation } from './skeleton-animation';
import type { SkeletonShape } from './skeleton-shape';

/** Props of `Skeleton`. Each one is also a settable property; a function is followed. */
export interface SkeletonProps extends ControlProps {
  /** Default `'text'`. */
  shape?: Bind<SkeletonShape>;
  /** How many lines of text; the last of several is shorter. Default `1`. */
  lines?: Bind<number>;
  /** A CSS length, or pixels as a number; a circle's size. Default: the room it is in (a circle: the language's size). */
  width?: Bind<string | number | null>;
  /** A CSS length, or pixels as a number. Default: a line of text, or the language's block height. */
  height?: Bind<string | number | null>;
  /** Default: the design language's (`wave`, or `pulse`). */
  animation?: Bind<SkeletonAnimation>;
  /** While `true` the skeleton shows; then its JSX children do. Default `true`. */
  loading?: Bind<boolean>;
  /** What screen readers say while it loads. Default: the kit's "Loading…". */
  label?: Bind<string>;
}
