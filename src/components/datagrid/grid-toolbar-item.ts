import type { Bind } from '@motifx/core';
import type { IconSource } from '../../core/icon-source';
import type { GridToolbarItemClickEventArgs } from './grid-toolbar-item-click-event-args';

/**
 * An item of the grid's toolbar: a custom button, a custom component (`content`), or one of the grid's
 * built-in items (`name`) with some of its fields changed. Every field except `name`, `content` and
 * `click` is a value or a tracked function.
 *
 * @example
 * { text: 'Refresh', icon: () => refreshIcon(), location: 'before', click: () => grid.refresh() }
 * { name: 'exportButton', showText: 'always' }
 */
export interface GridToolbarItem {
  /** The built-in item to change, or a custom name for this item. */
  name?: string;
  /** The end of the toolbar where it appears. The default is `'after'`, and `'before'` for the group panel. */
  location?: Bind<'before' | 'after'>;
  text?: Bind<string>;
  icon?: Bind<IconSource | null | undefined>;
  /** A tooltip, which also names a button that shows only its icon. The default is `text`. */
  hint?: Bind<string>;
  /**
   * Shows the text in the toolbar, or only in its "more" menu (the icon alone in the bar). The default
   * is `'always'`, and `'inMenu'` for built-in buttons.
   */
  showText?: Bind<'always' | 'inMenu'>;
  /** `false` omits the item. The default is `true`. */
  visible?: Bind<boolean>;
  /** `false` disables the item. The default is `true`. */
  enabled?: Bind<boolean>;
  /**
   * When it moves into the "more" menu: when it does not fit, always, or never. The default is
   * `'never'`, and `'auto'` for built-in buttons.
   */
  overflow?: Bind<'auto' | 'always' | 'never'>;
  /** A custom component in place of a button, created once, when the item first appears. */
  content?: () => unknown;
  /**
   * Runs when the button is clicked, in the bar or in the "more" menu. On a built-in item, it replaces
   * the item's behavior.
   */
  click?: (e: GridToolbarItemClickEventArgs) => void;
}
