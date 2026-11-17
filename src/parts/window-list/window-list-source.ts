import type { ComponentBase } from '@motifx/core';

/** What a `WindowList` asks of the component that lists its items. */
export interface WindowListSource<T> {
  /** Makes the part of `item` from it, each time the item comes near the view; the list disposes it when it goes far. */
  make(item: T): ComponentBase;
  /** The height, in pixels, of an item whose part was never measured. */
  estimate(item: T): number;
  /** The parts in and near the view are placed and measured, and the view stands where it goes. */
  settled?(): void;
}
