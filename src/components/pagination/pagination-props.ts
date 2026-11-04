import type { Bind } from '@motifx/core';
import type { ControlProps } from '../../core/control';
import type { PageChangedEventArgs } from './page-changed-event-args';
import type { PaginationMode } from './pagination-mode';

/** Props of `Pagination`. Each one is also a settable property; a function is followed. */
export interface PaginationProps extends ControlProps {
  /** The page, from 1. Default `1`. */
  page?: Bind<number>;
  /** The same as `page`: what `x-model` binds, two-way. */
  value?: Bind<number>;
  /** How many items there are in all; the pages are counted from it and `pageSize`. */
  total?: Bind<number>;
  /** Items per page; 0: all on one page. Default `10`. */
  pageSize?: Bind<number>;
  /** How many pages, when there is no `total` to count them from. */
  pageCount?: Bind<number | null>;
  /** The page sizes to choose from (0: all). Default: none, no choice shown. */
  pageSizes?: Bind<readonly number[]>;
  /** "Page 3 of 12 (250 items)". Default `true`. */
  showInfo?: Bind<boolean>;
  /** The first, previous, next and last steps. Default `true`. */
  showNavigation?: Bind<boolean>;
  /** Page buttons on each side of the current one. Default `1`. */
  neighbors?: Bind<number>;
  /** Default `'adaptive'`: compact while the full one does not fit. */
  mode?: Bind<PaginationMode>;
  /** The info of your own: `{page}`, `{count}` (pages) and `{total}` are filled in. */
  infoText?: Bind<string>;
  /** What screen readers call it. Default: the kit's "Pages". */
  label?: Bind<string>;
  onPageChanged?: (e: PageChangedEventArgs) => void;
}
