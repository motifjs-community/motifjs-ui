import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { PageChangedEventArgs } from './page-changed-event-args';
import type { PaginationMode } from './pagination-mode';

/** Props of `Pagination`. Each prop is also a settable property, and a function is tracked. */
export interface PaginationProps extends ControlProps {
  /** The page number, starting from 1. The default is `1`. */
  page?: Bind<number>;
  /** The same as `page`. This is what `x-model` binds, with two-way binding. */
  value?: Bind<number>;
  /** The total number of items. The page count is calculated from this and `pageSize`. */
  total?: Bind<number>;
  /** The number of items per page. 0 shows all items on one page. The default is `10`. */
  pageSize?: Bind<number>;
  /** The number of pages, when there is no `total`. */
  pageCount?: Bind<number | null>;
  /** The available page sizes (0 means all). By default, there are none and no choice is shown. */
  pageSizes?: Bind<readonly number[]>;
  /** Shows "Page 3 of 12 (250 items)". The default is `true`. */
  showInfo?: Bind<boolean>;
  /** Shows the first, previous, next and last buttons. The default is `true`. */
  showNavigation?: Bind<boolean>;
  /** The number of page buttons on each side of the current page. The default is `1`. */
  neighbors?: Bind<number>;
  /** The default, `'adaptive'`, is compact when the full layout does not fit. */
  mode?: Bind<PaginationMode>;
  /** Custom information text. `{page}`, `{count}` (pages) and `{total}` are replaced with their values. */
  infoText?: Bind<string>;
  /** The accessible name. The default is the kit's "Pages" string. */
  label?: Bind<string>;
  onPageChanged?: (e: PageChangedEventArgs) => void;
}
