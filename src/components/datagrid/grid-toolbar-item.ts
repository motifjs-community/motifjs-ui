import type { Bind } from '@motifx/core';
import type { IconSource } from '../../core/icon-source';
import type { GridToolbarItemClickEventArgs } from './grid-toolbar-item-click-event-args';

/**
 * An item of the grid's toolbar: a button of your own, your own component (`content`), or one of the
 * grid's items (`name`) with some of its fields changed. Every field but `name`, `content` and
 * `click` is a value or a tracked function.
 *
 * @example
 * { text: 'Refresh', icon: () => refreshIcon(), location: 'before', click: () => grid.refresh() }
 * { name: 'exportButton', showText: 'always' }
 */
export interface GridToolbarItem {
  /** One of the grid's items to change, or a name of your own for this item. */
  name?: string;
  /** Which end of the toolbar it sits at. Default `'after'`; the group panel `'before'`. */
  location?: Bind<'before' | 'after'>;
  text?: Bind<string>;
  icon?: Bind<IconSource | null | undefined>;
  /** A tooltip; the name of a button that shows only its icon. Default: `text`. */
  hint?: Bind<string>;
  /** Show the text in the toolbar, or only in its "more" menu (the icon alone in the bar). Default `'always'`; the grid's buttons `'inMenu'`. */
  showText?: Bind<'always' | 'inMenu'>;
  /** `false` leaves the item out. Default `true`. */
  visible?: Bind<boolean>;
  /** `false` dims the item; it cannot be pressed. Default `true`. */
  enabled?: Bind<boolean>;
  /** Whether it may move into the "more" menu: when it does not fit, always, or never. Default `'never'`; the grid's buttons `'auto'`. */
  overflow?: Bind<'auto' | 'always' | 'never'>;
  /** Your own component in place of a button: made once, when the item first shows. */
  content?: () => unknown;
  /** Runs when the button is pressed, in the bar or in the "more" menu. On one of the grid's items it replaces what the item does. */
  click?: (e: GridToolbarItemClickEventArgs) => void;
}
