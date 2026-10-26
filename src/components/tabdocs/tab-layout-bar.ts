import type { TabBarButton } from './tab-bar-button';
import type { TabSize } from './tab-size';

/** The bar settings of a dock area or a floating window that were set as plain values, as `saveLayout` writes them. */
export interface TabLayoutBar {
  scrollButtons?: boolean;
  tabSize?: TabSize;
  tabMinWidth?: number;
  singleTabTitle?: boolean;
  barButtons?: readonly TabBarButton[] | 'all';
}
