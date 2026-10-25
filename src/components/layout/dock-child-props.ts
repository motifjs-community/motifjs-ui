import type { Bind } from '@motifx/core';
import type { Dock } from './dock';

/**
 * What a child of a `DockPanel` may say about its place, in its own props:
 * `<Panel dock="start" />`, `<Button dock="float" right={16} bottom={16} />`.
 * The edges given to a `float` child are its anchors (a number is pixels): `left` and `right`
 * together stretch it.
 */
export interface DockChildProps {
  /** Default `'fill'`. */
  dock?: Bind<Dock>;
  left?: Bind<number | string>;
  top?: Bind<number | string>;
  right?: Bind<number | string>;
  bottom?: Bind<number | string>;
}
