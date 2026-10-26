import type { Bind } from '@motifx/core';

/** The modal window the filter builder opens in, the kit's `MxForm`. Read and change it later through `grid.filterBuilderPopup`. */
export interface GridFilterBuilderPopup {
  /** Default: the `gridFilterBuilderTitle` text of `uiLocale`. */
  title?: Bind<string>;
  /** The title shows in the title bar; off, it still names the window for screen readers. Default `true`. */
  showTitle?: Bind<boolean>;
  /** A CSS length; a number is pixels. Default `'40rem'`. */
  width?: Bind<number | string>;
  /** A CSS length; a number is pixels. Default: as tall as the builder needs. */
  height?: Bind<number | string>;
  /** Resized from its edges. Default `true`. */
  resizable?: Bind<boolean>;
  /** Moved by its title bar. Default `true`. */
  movable?: Bind<boolean>;
  /** The close button in the title bar (it cancels, like Cancel). Default `true`. */
  showCloseButton?: Bind<boolean>;
  /** The maximize button. Default `false`. */
  showMaximize?: Bind<boolean>;
  /** Opens maximized, filling the viewport. Default `false`. */
  fullScreen?: Bind<boolean>;
}
