import type { LayoutOrientation } from '../layout/layout-orientation';
import type { SplitSash } from './SplitSash';

/** What a splitter resizes: a split's neighbours, or a dock area against the documents. */
export interface SashOwner {
  /** `horizontal`: side by side, the splitter moves along the line. */
  readonly orientation: LayoutOrientation;
  readonly rtl: boolean;
  /** The shares (a split) or the pixels (a dock area) a drag starts from. */
  sizes: number[];
  sashIndex(sash: SplitSash): number;
  /** Moves the splitter after child `index` by `delta` pixels, in the reading direction. */
  resizeBy(index: number, delta: number): boolean;
  /** A double click on the splitter. */
  resetSizes(): void;
}
