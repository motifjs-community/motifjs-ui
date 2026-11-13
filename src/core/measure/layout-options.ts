import type { ComponentBase } from '@motifx/core';
import type { SizeBox } from './size-box';

/** How `onLayout` watches. */
export interface LayoutOptions {
  /** The component the watch belongs to when it is not the one watched (a parent's size): it ends with either. */
  owner?: ComponentBase;
  /** For `size`: the box reported; the border box by default. */
  box?: SizeBox;
  /** For `scroll`: scrolls that start inside this component are not told (a popup's own list). */
  except?: ComponentBase;
}
