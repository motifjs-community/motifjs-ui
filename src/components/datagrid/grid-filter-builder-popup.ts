import type { Bind } from '@motifx/core';

/** The modal window the filter builder opens in, the kit's `MxForm`. Read and change it later through `grid.filterBuilderPopup`. */
export interface GridFilterBuilderPopup {
  /** The title. The default is the `gridFilterBuilderTitle` text of `uiLocale`. */
  title?: Bind<string>;
  /** Shows the title in the title bar. Otherwise, it still names the window for screen readers. The default is `true`. */
  showTitle?: Bind<boolean>;
  /** The width, as a CSS length or a number of pixels. The default is `'40rem'`. */
  width?: Bind<number | string>;
  /** The height, as a CSS length or a number of pixels. By default, as tall as the builder needs. */
  height?: Bind<number | string>;
  /** Allows resizing from its edges. The default is `true`. */
  resizable?: Bind<boolean>;
  /** Allows moving by its title bar. The default is `true`. */
  movable?: Bind<boolean>;
  /** Shows a close button in the title bar, which acts as Cancel. The default is `true`. */
  showCloseButton?: Bind<boolean>;
  /** Shows a maximize button. The default is `false`. */
  showMaximize?: Bind<boolean>;
  /** Opens maximized, filling the viewport. The default is `false`. */
  fullScreen?: Bind<boolean>;
}
