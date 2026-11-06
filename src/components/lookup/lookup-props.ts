import type { Bind } from '@motifx/core';
import type { DropDownProps } from '../dropdown/drop-down-props';
import type { LookupColumn } from './lookup-column';

/** Props of `Lookup`, in addition to the drop-down props. */
export interface LookupProps<T, V> extends DropDownProps<T, V> {
  /** The columns of the list, below a header. Without them, the list shows the text. */
  columns?: Bind<readonly LookupColumn<T>[]>;
  /** The default is `true`. */
  showColumnHeaders?: Bind<boolean>;
  /** The minimum width of the list, a CSS length. The default comes from the `lookup.popup-width` token. */
  popupWidth?: Bind<string>;
}
