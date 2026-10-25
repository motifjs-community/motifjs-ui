import type { Bind } from '@motifx/core';

/** The modal window of `editMode: 'popup'`, the kit's `MxForm`. Read and change it later through `grid.popup`. */
export interface GridEditPopup {
  /** Default: the `gridEditRowTitle` text of `uiLocale` (`gridNewRowTitle` for a new row). */
  title?: Bind<string>;
  /** The title shows in the title bar; off, it still names the window for screen readers. Default `true`. */
  showTitle?: Bind<boolean>;
  /** A CSS length; a number is pixels. Default: as wide as the form needs. */
  width?: Bind<number | string>;
  /** A CSS length; a number is pixels. Default: as tall as the form needs. */
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
