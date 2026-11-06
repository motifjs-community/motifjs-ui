import type { Bind } from '@motifx/core';
import type { Dock } from './dock';

/**
 * The props a child of a `DockPanel` sets for its position:
 * `<Panel dock="start" />`, `<Button dock="float" right={16} bottom={16} />`.
 * The edges set on a `float` child are its anchors (a number is in pixels), and `left` and `right`
 * together stretch it.
 */
export interface DockChildProps {
  /** The dock position. The default is `'fill'`. */
  dock?: Bind<Dock>;
  left?: Bind<number | string>;
  top?: Bind<number | string>;
  right?: Bind<number | string>;
  bottom?: Bind<number | string>;
}
