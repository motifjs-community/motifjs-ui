import type { Bind } from '@motifx/core';

/** The modal window of `editMode: 'popup'`, the kit's `MxForm`. Read and change it later through `grid.popup`. */
export interface GridEditPopup {
  /** The title. The default is the `gridEditRowTitle` text of `uiLocale` (`gridNewRowTitle` for a new row). */
  title?: Bind<string>;
  /** Shows the title in the title bar. Otherwise, it still names the window for screen readers. The default is `true`. */
  showTitle?: Bind<boolean>;
  /** The width, as a CSS length or a number of pixels. By default, as wide as the form needs. */
  width?: Bind<number | string>;
  /** The height, as a CSS length or a number of pixels. By default, as tall as the form needs. */
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
